import {
  buildAdmissionList,
  validateTieResolution,
} from "../../domain/ranking.js";
import {
  assertTransition,
  assertApprovalStage,
} from "../../domain/round-machine.js";
import {
  latestList,
  roundView,
  conflictsForRound,
} from "../../domain/selectors.js";
import { computePublishOutcome } from "../../domain/publish.js";
import { roleRecipients } from "../../domain/scheduler.js";
import { resolveScopeChain } from "../../domain/scope.js";
import {
  defineService,
  find,
  requireValue,
  nextId,
  audit,
  notify,
  queueEmail,
} from "./_kernel.js";
const listResource = (db, p) => ({
  type: "round",
  id: find(db, "admissionLists", p.listId).roundId,
});
function current(db, listId) {
  const list = find(db, "admissionLists", listId),
    round = find(db, "rounds", list.roundId);
  requireValue(
    latestList(db, round.id)?.id === listId && list.status === "PENDING",
    "INVALID_STATE",
    "Danh sách đã được xử lý. Vui lòng mở phiên bản mới nhất.",
  );
  return { list, round };
}
function waiting(
  db,
  ctx,
  round,
  level,
  list,
  type = "LIST_WAITING",
  reason = "",
) {
  const users = roleRecipients(
    db,
    [level],
    resolveScopeChain(db, "round", round),
    ctx.now,
  );
  notify(db, ctx, users, {
    type,
    title:
      type === "LIST_WAITING"
        ? "Danh sách chờ phê duyệt"
        : "Danh sách bị trả về",
    body: reason || round.name,
    link: `/app/approvals/${round.id}`,
  });
  for (const id of users)
    queueEmail(db, ctx, {
      to: find(db, "users", id).email,
      template: type,
      relatedEntity: round.id,
      vars: {
        roundCode: round.code,
        version: list.version,
        levelLabel: level,
        reason,
      },
    });
}
export const closeReview = defineService("lists.closeReview", {
  permission: "list.close",
  resolve: (db, p) => ({ type: "round", id: p.roundId }),
  handler(db, ctx, { roundId }) {
    const round = find(db, "rounds", roundId);
    assertTransition(round.status, "approving");
    const apps = db.applications.filter((a) => a.roundId === roundId);
    requireValue(
      !apps.some((a) => ["pending", "needs_update"].includes(a.status)),
      "INVALID_STATE",
      "Cần xử lý hết hồ sơ chờ duyệt và chờ bổ sung trước khi chốt.",
    );
    const view = roundView(db, round),
      before = structuredClone(round);
    const list = {
      id: nextId(db, "list"),
      roundId,
      version: (latestList(db, roundId)?.version ?? 0) + 1,
      createdBy: ctx.actor.user.id,
      createdAt: ctx.now,
      status: "PENDING",
      tieResolution: null,
      payload: buildAdmissionList({
        round,
        snapshot: round.criteriaSnapshot,
        applications: apps,
        isFirstRound: view.isFirstRound,
        conflicts: conflictsForRound(db, round),
      }),
    };
    db.admissionLists.push(list);
    Object.assign(round, {
      status: "approving",
      approvalSubstatus: "waiting_head",
    });
    audit(db, ctx, {
      action: "LIST_CREATED",
      entity: "round",
      entityId: roundId,
      before,
      after: { round, list },
    });
    waiting(db, ctx, round, "HEAD", list);
    return { result: list };
  },
});
export const approve = defineService("lists.approve", {
  permission: (db, p) => `list.approve.${p.level}`,
  resolve: listResource,
  handler(db, ctx, p) {
    requireValue(
      ["HEAD", "DEAN"].includes(p.level),
      "VALIDATION",
      "PĐT phải dùng thao tác Phê duyệt & Công bố.",
    );
    const { list, round } = current(db, p.listId);
    assertApprovalStage(round, p.level);
    const before = structuredClone(round);
    if (p.level === "HEAD" && list.payload.rows.some((r) => r.tieGroup)) {
      validateTieResolution(
        list.payload,
        p.tieResolution?.selectedApplicationIds ?? [],
      );
      list.tieResolution = {
        selectedApplicationIds: [...p.tieResolution.selectedApplicationIds],
        decidedBy: ctx.actor.user.id,
        decidedAt: ctx.now,
      };
      audit(db, ctx, {
        action: "TIE_RESOLVED",
        entity: "admissionList",
        entityId: list.id,
        before: null,
        after: list.tieResolution,
      });
    }
    db.approvalSteps.push({
      id: nextId(db, "step"),
      listId: list.id,
      level: p.level,
      decision: "APPROVED",
      comment: p.comment ?? "",
      attachment: p.attachment ?? null,
      decidedBy: ctx.actor.user.id,
      decidedAt: ctx.now,
    });
    round.approvalSubstatus =
      p.level === "HEAD" ? "waiting_dean" : "waiting_training";
    audit(db, ctx, {
      action: "LIST_APPROVED",
      entity: "round",
      entityId: round.id,
      before,
      after: round,
      reason: p.comment,
    });
    waiting(db, ctx, round, p.level === "HEAD" ? "DEAN" : "TRAINING", list);
    return { result: list };
  },
});
export const returnList = defineService("lists.return", {
  permission: (db, p) =>
    p.level === "TRAINING" ? "list.publish" : `list.approve.${p.level}`,
  resolve: listResource,
  handler(db, ctx, p) {
    const { list, round } = current(db, p.listId);
    assertApprovalStage(round, p.level);
    requireValue(
      p.reason?.trim(),
      "VALIDATION",
      "Vui lòng ghi rõ lý do trả về danh sách.",
    );
    const before = structuredClone(round);
    list.status = "RETURNED";
    list.tieResolution = null;
    db.approvalSteps.push({
      id: nextId(db, "step"),
      listId: list.id,
      level: p.level,
      decision: "RETURNED",
      comment: p.reason,
      attachment: p.attachment ?? null,
      decidedBy: ctx.actor.user.id,
      decidedAt: ctx.now,
    });
    Object.assign(round, { status: "review", approvalSubstatus: null });
    audit(db, ctx, {
      action: "LIST_RETURNED",
      entity: "round",
      entityId: round.id,
      before,
      after: round,
      reason: p.reason,
    });
    for (const level of [
      "LECTURER",
      "HEAD",
      ...db.approvalSteps
        .filter((s) => s.listId === list.id && s.decision === "APPROVED")
        .map((s) => s.level),
    ])
      waiting(db, ctx, round, level, list, "LIST_RETURNED", p.reason);
    return { result: list };
  },
});
export { returnList as return };
export const publish = defineService("lists.publish", {
  permission: "list.publish",
  resolve: listResource,
  handler(db, ctx, p) {
    const { list, round } = current(db, p.listId);
    const outcome = computePublishOutcome(db, round, list, ctx.now);
    Object.assign(db, outcome.db);
    db.approvalSteps.push({
      id: nextId(db, "step"),
      listId: list.id,
      level: "TRAINING",
      decision: "APPROVED",
      comment: p.comment ?? "",
      attachment: p.attachment ?? null,
      decidedBy: ctx.actor.user.id,
      decidedAt: ctx.now,
    });
    audit(db, ctx, {
      action: "LIST_APPROVED",
      entity: "round",
      entityId: round.id,
      before: { status: "approving" },
      after: outcome.summary,
      reason: p.comment,
    });
    return { result: outcome.summary };
  },
});

export const previewPublish = defineService("lists.previewPublish", {
  permission: "list.publish",
  resolve: listResource,
  readOnly: true,
  handler(db, ctx, p) {
    const { list, round } = current(db, p.listId);
    const outcome = computePublishOutcome(db, round, list, ctx.now);
    return {
      result: {
        ...outcome.summary,
        emails: outcome.db.emailOutbox.length - db.emailOutbox.length,
      },
    };
  },
});

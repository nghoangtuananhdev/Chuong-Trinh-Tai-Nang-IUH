import { assertTransition } from "../../domain/application-machine.js";
import { canReviewApplications } from "../../domain/round-machine.js";
import { scoreApplication } from "../../domain/scoring.js";
import {
  defineService,
  find,
  requireValue,
  audit,
  nextId,
  notify,
  queueEmail,
  applicationHistory,
} from "./_kernel.js";
const resolve = (db, p) => ({ type: "application", id: p.applicationId });
function reviewing(db, p) {
  const application = find(db, "applications", p.applicationId),
    round = find(db, "rounds", application.roundId);
  requireValue(
    canReviewApplications(round) && application.status === "pending",
    "INVALID_STATE",
    "Chỉ xét duyệt hồ sơ chờ duyệt khi ĐXT đang tiếp nhận hoặc đang xét duyệt.",
  );
  return { application, round };
}
export const verifyItem = defineService("reviews.verifyItem", {
  permission: "application.review",
  resolve,
  handler(db, ctx, p) {
    const { application: app, round } = reviewing(db, p);
    const item = app.items.find((i) => i.criterionId === p.criterionId);
    requireValue(
      item && ["VALID", "INVALID"].includes(p.verifyStatus),
      "VALIDATION",
      "Tiêu chí hoặc trạng thái xác minh không hợp lệ.",
    );
    const criterion = round.criteriaSnapshot.criteria.find(
      (c) => c.id === p.criterionId,
    );
    const target = p.entryId
      ? item.declaredEntries?.find((e) => e.id === p.entryId)
      : item;
    requireValue(
      target,
      "NOT_FOUND",
      "Không tìm thấy thành tích cần xác minh.",
    );
    const original =
      criterion.valueType === "COUNT" ? item.declaredCount : item.declaredValue;
    const changesValue =
      !p.entryId &&
      p.verifiedValue != null &&
      String(p.verifiedValue) !== String(original);
    requireValue(
      !changesValue || p.note?.trim(),
      "VALIDATION",
      "Vui lòng ghi lý do điều chỉnh giá trị của sinh viên.",
    );
    if (p.verifiedValue != null)
      requireValue(
        !p.entryId &&
          criterion.valueType !== "ACCUMULATIVE_ENUM" &&
          !criterion.refCriterionId &&
          String(p.verifiedValue).trim() !== "" &&
          Number.isFinite(Number(p.verifiedValue)),
        "VALIDATION",
        "Giá trị xác minh phải là một số hợp lệ cho tiêu chí nhập số.",
      );
    const before = structuredClone(app);
    Object.assign(target, {
      verifyStatus: p.verifyStatus,
      verifyNote: p.note ?? "",
      verifiedBy: ctx.actor.user.id,
      verifiedAt: ctx.now,
    });
    if (!p.entryId && p.verifiedValue !== undefined)
      item.verifiedValue = p.verifiedValue ?? null;
    const result = scoreApplication(
      round.criteriaSnapshot,
      app.items,
      "official",
    );
    app.officialScore = result.total;
    app.officialEligible = result.eligible;
    audit(db, ctx, {
      action: changesValue ? "SCORE_CHANGED" : "ITEM_VERIFIED",
      entity: "application",
      entityId: app.id,
      before,
      after: app,
      reason: p.note,
    });
    applicationHistory(
      db,
      ctx,
      app,
      changesValue ? "Điều chỉnh điểm" : "Xác minh tiêu chí",
      p.note?.trim() ||
        `${criterion.name} — ${p.verifyStatus === "VALID" ? "Hợp lệ" : "Không hợp lệ"}`,
    );
    return { result: app };
  },
});
export const decide = defineService("reviews.decide", {
  permission: "application.review",
  resolve,
  handler(db, ctx, p) {
    const { application: app, round } = reviewing(db, p);
    const to = {
      APPROVED: "approved",
      REJECTED: "rejected",
      NEEDS_UPDATE: "needs_update",
    }[p.decision];
    requireValue(to, "VALIDATION", "Quyết định xét duyệt không hợp lệ.");
    assertTransition(app.status, to, {
      round,
      now: ctx.now,
      actor: ctx.actor.roleAssignment.role,
      note: p.note,
      dueAt: p.dueAt,
    });
    const score = scoreApplication(
      round.criteriaSnapshot,
      app.items,
      "official",
    );
    if (to === "approved") {
      requireValue(
        round.criteriaSnapshot.criteria.every((c) => {
          const item = app.items.find((i) => i.criterionId === c.id);
          return (
            item &&
            ["VALID", "INVALID"].includes(item.verifyStatus) &&
            (c.valueType !== "ACCUMULATIVE_ENUM" ||
              (item.declaredEntries ?? []).every((e) =>
                ["VALID", "INVALID"].includes(e.verifyStatus),
              ))
          );
        }) && score.eligible,
        "VALIDATION",
        "Cần xác minh đủ mọi tiêu chí và đạt toàn bộ tiêu chí bắt buộc trước khi chọn Đạt.",
      );
    }
    const before = structuredClone(app);
    Object.assign(app, {
      status: to,
      officialScore: score.total,
      officialEligible: score.eligible,
      decisionNote: p.note ?? "",
      decidedBy: ctx.actor.user.id,
      decidedAt: ctx.now,
    });
    if (to === "needs_update") {
      db.reviewRequests.push({
        id: nextId(db, "request"),
        applicationId: app.id,
        message: p.note,
        dueAt: p.dueAt,
        createdBy: ctx.actor.user.id,
        createdAt: ctx.now,
        resolvedAt: null,
      });
      queueEmail(db, ctx, {
        to: app.email,
        template: "NEEDS_UPDATE",
        vars: { applicationCode: app.code, message: p.note, dueAt: p.dueAt },
        relatedEntity: app.id,
      });
    }
    notify(db, ctx, [app.studentUserId], {
      type: p.decision,
      title:
        to === "needs_update"
          ? "Hồ sơ cần bổ sung"
          : "Hồ sơ đã có kết quả xét duyệt",
      body: p.note ?? "",
      link: `/app/my-applications/${app.id}`,
    });
    applicationHistory(
      db,
      ctx,
      app,
      {
        APPROVED: "Đạt điều kiện",
        REJECTED: "Không đạt",
        NEEDS_UPDATE: "Yêu cầu bổ sung",
      }[p.decision],
      p.note,
    );
    audit(db, ctx, {
      action: `APPLICATION_${p.decision}`,
      entity: "application",
      entityId: app.id,
      before,
      after: app,
      reason: p.note,
    });
    return { result: app };
  },
});
export const cancelRequest = defineService("reviews.cancelRequest", {
  permission: "application.review",
  resolve,
  handler(db, ctx, p) {
    const app = find(db, "applications", p.applicationId),
      round = find(db, "rounds", app.roundId);
    assertTransition(app.status, "pending", {
      round,
      now: ctx.now,
      actor: ctx.actor.roleAssignment.role,
      note: p.reason,
    });
    const before = structuredClone(app);
    app.status = "pending";
    for (const r of db.reviewRequests.filter(
      (r) => r.applicationId === app.id && !r.resolvedAt,
    ))
      Object.assign(r, {
        resolvedAt: ctx.now,
        cancelledBy: ctx.actor.user.id,
      });
    applicationHistory(db, ctx, app, "Hủy yêu cầu bổ sung", p.reason);
    notify(db, ctx, [app.studentUserId], {
      type: "REQUEST_CANCELLED",
      title: "Yêu cầu bổ sung đã được hủy",
      body: p.reason ?? "",
      link: `/app/my-applications/${app.id}`,
    });
    audit(db, ctx, {
      action: "APPLICATION_REQUEST_CANCELLED",
      entity: "application",
      entityId: app.id,
      before,
      after: app,
      reason: p.reason,
    });
    return { result: app };
  },
});
export const reopen = defineService("reviews.reopen", {
  permission: "application.review",
  resolve,
  handler(db, ctx, p) {
    const app = find(db, "applications", p.applicationId),
      round = find(db, "rounds", app.roundId);
    assertTransition(app.status, "pending", {
      round,
      now: ctx.now,
      actor: ctx.actor.roleAssignment.role,
      note: p.reason,
    });
    const before = structuredClone(app);
    app.status = "pending";
    applicationHistory(db, ctx, app, "Mở lại để xét duyệt", p.reason);
    audit(db, ctx, {
      action: "APPLICATION_REOPENED",
      entity: "application",
      entityId: app.id,
      before,
      after: app,
      reason: p.reason,
    });
    return { result: app };
  },
});

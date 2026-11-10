import { requireValue } from "./errors.js";
import { assertApprovalStage } from "./round-machine.js";
import { validateTieResolution } from "./ranking.js";
import {
  studyYear,
  latestMemberships,
  conflictsForRound,
  latestList,
} from "./selectors.js";
import { roleRecipients } from "./scheduler.js";
import { assignmentChain } from "./scope.js";
import {
  audit,
  notify,
  queueEmail,
  nextId,
  applicationHistory,
} from "./events.js";

// Return a new db; callers can apply the whole outcome atomically or discard it on error.
export function computePublishOutcome(source, round, list, now) {
  assertApprovalStage(round, "TRAINING");
  requireValue(
    list &&
      list.roundId === round.id &&
      list.status === "PENDING" &&
      latestList(source, round.id)?.id === list.id,
    "INVALID_STATE",
    "Chỉ được công bố phiên bản danh sách mới nhất đang chờ phê duyệt.",
  );
  requireValue(
    ["HEAD", "DEAN"].every((level) =>
      source.approvalSteps.some(
        (s) =>
          s.listId === list.id &&
          s.level === level &&
          s.decision === "APPROVED",
      ),
    ),
    "INVALID_STATE",
    "Danh sách phải được CNN và BLĐ khoa duyệt đúng phiên bản trước khi công bố.",
  );
  if (list.payload.rows.some((r) => r.tieGroup))
    validateTieResolution(
      list.payload,
      list.tieResolution?.selectedApplicationIds ?? [],
    );
  const db = structuredClone(source),
    ctx = { now, actor: null },
    events = [];
  const targetRound = db.rounds.find((r) => r.id === round.id),
    targetList = db.admissionLists.find((l) => l.id === list.id);
  const year = studyYear(db, round),
    conflicts = conflictsForRound(db, round);
  const selectedIds = new Set(list.tieResolution?.selectedApplicationIds ?? []);
  const rows = [...list.payload.rows].sort((a, b) => a.rank - b.rank);
  requireValue(
    Number.isInteger(list.payload.quota) && list.payload.quota === round.quota,
    "CONFLICT",
    "Chỉ tiêu không khớp phiên bản danh sách đã duyệt.",
  );
  requireValue(
    new Set(rows.map((r) => r.applicationId)).size === rows.length &&
      new Set(rows.map((r) => r.studentUserId)).size === rows.length,
    "CONFLICT",
    "Danh sách có hồ sơ hoặc sinh viên bị trùng.",
  );
  for (const row of rows) {
    const application = db.applications.find((a) => a.id === row.applicationId);
    requireValue(
      application?.status === "approved" &&
        application.roundId === round.id &&
        application.studentUserId === row.studentUserId,
      "CONFLICT",
      "Hồ sơ không còn khớp phiên bản danh sách đã phê duyệt.",
    );
    requireValue(
      db.studentProfiles.some((p) => p.userId === row.studentUserId),
      "NOT_FOUND",
      "Không tìm thấy hồ sơ tài khoản sinh viên.",
    );
    if (row.proposed === true) selectedIds.add(row.applicationId);
  }
  requireValue(
    selectedIds.size <= round.quota,
    "CONFLICT",
    "Danh sách vượt chỉ tiêu ĐXT.",
  );
  const originalSelection = new Set(selectedIds),
    notes = new Map();
  for (const row of rows.filter((r) =>
    originalSelection.has(r.applicationId),
  )) {
    if (!conflicts.has(row.studentUserId)) continue;
    selectedIds.delete(row.applicationId);
    notes.set(row.applicationId, "Đã trúng tuyển lớp khác – BR-08");
    const maintain =
      !list.payload.isFirstRound && round.rankingMode === "MAINTAIN_THEN_FILL";
    const replacement = rows.find(
      (r) =>
        !originalSelection.has(r.applicationId) &&
        !selectedIds.has(r.applicationId) &&
        !conflicts.has(r.studentUserId) &&
        (!maintain || r.group === row.group),
    );
    if (replacement) {
      selectedIds.add(replacement.applicationId);
      notes.set(
        replacement.applicationId,
        "Lấp suất theo danh sách chờ – BR-08",
      );
    }
  }
  const upsertMembership = (userId, status, applicationId, note) => {
    let membership = db.memberships.find(
      (m) =>
        m.classId === round.classId &&
        m.studentUserId === userId &&
        m.studyYear === year,
    );
    const before = membership ? structuredClone(membership) : null;
    if (!membership) {
      membership = {
        id: nextId(db, "membership"),
        classId: round.classId,
        studentUserId: userId,
        studyYear: year,
      };
      db.memberships.push(membership);
    }
    Object.assign(membership, {
      status,
      sourceApplicationId: applicationId ?? null,
      note,
      updatedAt: now,
    });
    audit(db, ctx, {
      action: "MEMBERSHIP_CHANGED",
      entity: "membership",
      entityId: membership.id,
      before,
      after: membership,
    });
  };
  const apps = db.applications.filter((a) => a.roundId === round.id);
  for (const app of apps.filter((a) => a.status === "approved")) {
    const before = structuredClone(app);
    app.status = selectedIds.has(app.id) ? "confirmed" : "not_admitted";
    if (notes.has(app.id)) app.decisionNote = notes.get(app.id);
    app.rank = rows.find((r) => r.applicationId === app.id)?.rank ?? null;
    applicationHistory(db, ctx, app, "Công bố kết quả", app.decisionNote);
    audit(db, ctx, {
      action: "APPLICATION_PUBLISHED",
      entity: "application",
      entityId: app.id,
      before,
      after: app,
    });
    if (app.status === "confirmed")
      upsertMembership(app.studentUserId, "ACTIVE", app.id, "Trúng tuyển");
  }
  const dropped = [];
  for (const member of source.memberships.filter(
    (m) =>
      m.classId === round.classId &&
      m.studyYear === year - 1 &&
      m.status === "ACTIVE",
  )) {
    if (
      apps.some(
        (a) =>
          a.studentUserId === member.studentUserId && a.status === "confirmed",
      )
    )
      continue;
    const app = apps.find(
      (a) =>
        a.studentUserId === member.studentUserId &&
        !["draft", "cancelled", "withdrawn"].includes(a.status),
    );
    const reason =
      app?.decisionNote ||
      (app ? "Không đạt duy trì" : "Không nộp hồ sơ tích lũy");
    upsertMembership(member.studentUserId, "DROPPED", app?.id, reason);
    dropped.push({ userId: member.studentUserId, reason });
  }
  const affected = new Set([
    ...apps.filter((a) => a.status === "confirmed").map((a) => a.studentUserId),
    ...dropped.map((d) => d.userId),
  ]);
  for (const userId of affected) {
    const profile = db.studentProfiles.find((p) => p.userId === userId);
    requireValue(
      profile,
      "NOT_FOUND",
      "Không tìm thấy hồ sơ tài khoản sinh viên.",
    );
    const before = profile.isKSTN;
    profile.isKSTN = latestMemberships(db, userId).some(
      (m) => m.status === "ACTIVE",
    );
    if (before !== profile.isKSTN)
      audit(db, ctx, {
        action: "IS_KSTN_CHANGED",
        entity: "user",
        entityId: userId,
        before,
        after: profile.isKSTN,
      });
  }
  const cls = db.classes.find((c) => c.id === round.classId);
  for (const userId of new Set([
    ...apps
      .filter((a) => !["draft", "cancelled"].includes(a.status))
      .map((a) => a.studentUserId),
    ...dropped.map((d) => d.userId),
  ])) {
    const user = db.users.find((u) => u.id === userId);
    requireValue(user, "NOT_FOUND", "Không tìm thấy tài khoản nhận kết quả.");
    const app = apps.find(
      (a) =>
        a.studentUserId === userId &&
        !["draft", "cancelled", "withdrawn"].includes(a.status),
    );
    const drop = dropped.find((d) => d.userId === userId);
    const template = drop
      ? "RESULT_DROPPED"
      : app?.status === "confirmed"
        ? "RESULT_CONFIRMED"
        : app?.status === "not_admitted"
          ? "RESULT_NOT_ADMITTED"
          : "RESULT_REJECTED";
    queueEmail(db, ctx, {
      to: user.email,
      template,
      relatedEntity: round.id,
      vars: {
        name: user.fullName,
        roundName: round.name,
        classCode: cls?.code,
        studyYear: year,
        reason: drop?.reason ?? app?.decisionNote,
      },
    });
    notify(db, ctx, [userId], {
      type: template,
      title: "ĐXT đã công bố kết quả",
      body: round.name,
      link: "/app/my-applications",
    });
  }
  notify(
    db,
    ctx,
    roleRecipients(
      db,
      ["LECTURER", "HEAD", "DEAN"],
      assignmentChain(db, { scopeType: "CLASS", scopeId: round.classId }),
      now,
    ),
    {
      type: "ROUND_PUBLISHED",
      title: "ĐXT đã công bố",
      body: round.name,
      link: `/app/rounds/${round.id}`,
    },
  );
  const beforeRound = structuredClone(targetRound);
  Object.assign(targetRound, {
    status: "published",
    approvalSubstatus: null,
    publishedAt: now,
  });
  targetList.status = "PUBLISHED";
  const summary = {
    confirmed: selectedIds.size,
    notAdmitted: apps.filter((a) => a.status === "not_admitted").length,
    dropped: dropped.length,
  };
  audit(db, ctx, {
    action: "ROUND_PUBLISHED",
    entity: "round",
    entityId: round.id,
    before: beforeRound,
    after: { ...targetRound, summary },
  });
  events.push({ type: "ROUND_PUBLISHED", roundId: round.id, ...summary });
  return { db, events, summary };
}

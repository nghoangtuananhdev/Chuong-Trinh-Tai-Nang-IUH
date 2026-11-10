import {
  editableFields,
  validateTimeline,
  assertTransition,
} from "../../domain/round-machine.js";
import { timestamp } from "../../domain/time.js";
import { resolveScopeChain } from "../../domain/scope.js";
import { roleRecipients } from "../../domain/scheduler.js";
import { studyYear, isFirstRound } from "../../domain/selectors.js";
import {
  defineService,
  find,
  requireValue,
  nextId,
  audit,
  notify,
  queueEmail,
  applicationHistory,
} from "./_kernel.js";
const resolve = (db, p) => ({ type: "round", id: p.id });
function validate(db, round, now, release = false) {
  const cls = find(db, "classes", round.classId),
    set = find(db, "criteriaSets", round.criteriaSetId);
  requireValue(!cls.endedAt, "INVALID_STATE", "Lớp đã kết thúc.");
  requireValue(
    round.name?.trim() &&
      round.semester &&
      /^\d{4}[–-]\d{4}$/.test(round.academicYear) &&
      Number(round.academicYear.slice(-4)) ===
        Number(round.academicYear.slice(0, 4)) + 1,
    "VALIDATION",
    "Cần tên đợt, học kỳ và năm học liên tiếp hợp lệ.",
  );
  requireValue(
    Number.isInteger(Number(round.quota)) && Number(round.quota) > 0,
    "VALIDATION",
    "Sĩ số tối đa phải là số nguyên dương.",
    { field: "quota" },
  );
  requireValue(
    set.facultyId === resolveScopeChain(db, "class", cls).facultyId &&
      (set.status === "PUBLISHED" || Boolean(round.criteriaSnapshot)),
    "VALIDATION",
    "Chọn bộ tiêu chí đã ban hành trong cùng khoa.",
    { field: "criteriaSetId" },
  );
  requireValue(
    db.lecturerProfiles.some(
      (p) => p.userId === round.lecturerId && p.facultyId === set.facultyId,
    ),
    "VALIDATION",
    "GVPT phải thuộc cùng khoa.",
  );
  requireValue(
    ["MAINTAIN_THEN_FILL", "OPEN_COMPETITION"].includes(round.rankingMode),
    "VALIDATION",
    "Chế độ xếp hạng không hợp lệ.",
  );
  validateTimeline(round);
  if (release) {
    requireValue(
      timestamp(round.intakeStart) > timestamp(now),
      "VALIDATION",
      "Ngày bắt đầu tiếp nhận phải sau hiện tại.",
      { field: "intakeStart" },
    );
    requireValue(
      !db.rounds.some(
        (r) =>
          r.id !== round.id &&
          r.classId === round.classId &&
          r.semester === round.semester &&
          r.academicYear === round.academicYear &&
          r.status !== "draft",
      ),
      "CONFLICT",
      "Mỗi lớp, học kỳ và năm học chỉ có một ĐXT không ở nháp.",
    );
  }
}
export const create = defineService("rounds.create", {
  permission: "round.manage",
  resolve: (db, p) => ({ type: "class", id: p.classId }),
  handler(db, ctx, p) {
    const cls = find(db, "classes", p.classId);
    requireValue(!cls.endedAt, "INVALID_STATE", "Lớp đã kết thúc.");
    const id = nextId(db, "round");
    const round = {
      id,
      code: `DXT-${ctx.now.slice(0, 4)}-${String(db.counters.round).padStart(4, "0")}`,
      ...Object.fromEntries(
        editableFields("draft")
          .filter((k) => p[k] !== undefined)
          .map((k) => [k, p[k]]),
      ),
      classId: cls.id,
      status: "draft",
      criteriaSnapshot: null,
      approvalSubstatus: null,
      rankingMode: p.rankingMode || "MAINTAIN_THEN_FILL",
      quota: Number(p.quota) || 1,
      lecturerId: p.lecturerId || cls.lecturerId,
      attachments: p.attachments ?? [],
      createdBy: ctx.actor.user.id,
      createdAt: ctx.now,
      releasedAt: null,
      openedAt: null,
      reviewStartedAt: null,
      publishedAt: null,
    };
    db.rounds.push(round);
    audit(db, ctx, {
      action: "ROUND_CREATED",
      entity: "round",
      entityId: id,
      before: null,
      after: round,
    });
    return { result: round };
  },
});
export const update = defineService("rounds.update", {
  permission: "round.editTimeline",
  resolve,
  handler(db, ctx, p) {
    const round = find(db, "rounds", p.id),
      allowed = editableFields(round.status, ctx.actor.roleAssignment.role),
      changes = p.changes ?? {};
    requireValue(
      allowed.length,
      "INVALID_STATE",
      "Không thể sửa ĐXT ở giai đoạn này. ĐXT đã công bố là bất biến.",
    );
    requireValue(
      Object.keys(changes).every((k) => allowed.includes(k)),
      "FORBIDDEN",
      "Bạn chỉ được sửa các trường cho phép trong giai đoạn hiện tại.",
    );
    const before = structuredClone(round);
    Object.assign(round, structuredClone(changes));
    if (changes.quota !== undefined) round.quota = Number(changes.quota);
    if (round.status !== "draft") validate(db, round, ctx.now);
    if (before.status === "open" && changes.intakeEnd)
      requireValue(
        timestamp(round.intakeEnd) > timestamp(ctx.now) &&
          timestamp(round.intakeEnd) >= timestamp(before.intakeEnd),
        "VALIDATION",
        "Gia hạn tiếp nhận phải sau hiện tại và không được rút ngắn.",
        { field: "intakeEnd" },
      );
    audit(db, ctx, {
      action: "ROUND_UPDATED",
      entity: "round",
      entityId: round.id,
      before,
      after: round,
    });
    return { result: round };
  },
});
export const release = defineService("rounds.release", {
  permission: "round.manage",
  resolve,
  handler(db, ctx, p) {
    const round = find(db, "rounds", p.id);
    assertTransition(round.status, "upcoming");
    validate(db, round, ctx.now, true);
    const before = structuredClone(round);
    Object.assign(round, {
      status: "upcoming",
      releasedAt: ctx.now,
      quota: Number(round.quota),
    });
    audit(db, ctx, {
      action: "ROUND_RELEASED",
      entity: "round",
      entityId: round.id,
      before,
      after: round,
    });
    return { result: round };
  },
});
export const deleteRound = defineService("rounds.delete", {
  permission: "round.manage",
  resolve,
  handler(db, ctx, p) {
    const round = find(db, "rounds", p.id);
    requireValue(
      ["draft", "upcoming"].includes(round.status) &&
        !db.applications.some((a) => a.roundId === p.id),
      "INVALID_STATE",
      "Chỉ xóa ĐXT nháp hoặc chưa mở và chưa có hồ sơ.",
    );
    db.rounds = db.rounds.filter((r) => r.id !== p.id);
    audit(db, ctx, {
      action: "ROUND_DELETED",
      entity: "round",
      entityId: p.id,
      before: round,
      after: null,
    });
    return { result: true };
  },
});
export const transition = defineService("rounds.transition", {
  permission: "round.transitionManual",
  resolve,
  handler(db, ctx, p) {
    const round = find(db, "rounds", p.id);
    requireValue(
      p.reason?.trim(),
      "VALIDATION",
      "Vui lòng ghi lý do chuyển giai đoạn thủ công.",
    );
    requireValue(
      (round.status === "upcoming" && p.to === "open") ||
        (round.status === "open" && p.to === "review"),
      "INVALID_STATE",
      "Chỉ mở tiếp nhận sớm hoặc đóng tiếp nhận sớm.",
    );
    const before = structuredClone(round);
    if (p.to === "open") {
      round.criteriaSnapshot = structuredClone(
        find(db, "criteriaSets", round.criteriaSetId),
      );
      round.openedAt = ctx.now;
      if (!isFirstRound(db, round)) {
        const members = db.memberships.filter(
          (m) =>
            m.classId === round.classId &&
            m.studyYear === studyYear(db, round) - 1 &&
            m.status === "ACTIVE",
        );
        notify(
          db,
          ctx,
          members.map((m) => m.studentUserId),
          {
            type: "ROUND_OPENED",
            title: "ĐXT lớp đã mở tiếp nhận",
            body: round.name,
            link: "/app/maintenance",
          },
        );
        for (const member of members) {
          const user = find(db, "users", member.studentUserId);
          queueEmail(db, ctx, {
            to: user.email,
            template: "ROUND_OPENED",
            vars: {
              roundName: round.name,
              classCode: find(db, "classes", round.classId).code,
              studyYear: studyYear(db, round),
              deadline: round.intakeEnd,
            },
            relatedEntity: round.id,
          });
        }
      }
      audit(db, ctx, {
        action: "CRITERIA_SNAPSHOT_TAKEN",
        entity: "round",
        entityId: round.id,
        before: null,
        after: round.criteriaSnapshot,
      });
    } else {
      round.reviewStartedAt = ctx.now;
      for (const app of db.applications.filter(
        (a) => a.roundId === round.id && a.status === "draft",
      )) {
        app.status = "cancelled";
        applicationHistory(db, ctx, app, "Hủy nháp", "Đóng tiếp nhận sớm");
        audit(db, ctx, {
          action: "APPLICATION_CANCELLED",
          entity: "application",
          entityId: app.id,
          before: { status: "draft" },
          after: { status: "cancelled" },
        });
      }
    }
    round.status = p.to;
    audit(db, ctx, {
      action: "ROUND_TRANSITION_MANUAL",
      entity: "round",
      entityId: round.id,
      before,
      after: round,
      reason: p.reason,
    });
    notify(
      db,
      ctx,
      roleRecipients(
        db,
        ["LECTURER", "HEAD"],
        resolveScopeChain(db, "round", round),
        ctx.now,
      ),
      {
        type: "ROUND_CHANGED",
        title: "ĐXT đã chuyển giai đoạn",
        body: p.reason,
        link: `/app/rounds/${round.id}`,
      },
    );
    return { result: round };
  },
});

import { scoreApplication, numericValue } from "../../domain/scoring.js";
import { classifyFlow, inheritApplication } from "../../domain/flows.js";
import { assertTransition } from "../../domain/application-machine.js";
import { timestamp } from "../../domain/time.js";
import { studentProfile } from "../../domain/selectors.js";
import {
  defineService,
  find,
  authenticated,
  requireValue,
  nextId,
  audit,
  notify,
  queueEmail,
  applicationHistory,
} from "./_kernel.js";
const own = (db, p, ctx) => ({ studentUserId: ctx.actor?.user.id });
function load(db, ctx, p) {
  const app = find(db, "applications", p.id);
  requireValue(
    app.studentUserId === ctx.actor.user.id,
    "FORBIDDEN",
    "Bạn chỉ được thao tác hồ sơ của chính mình.",
  );
  return { app, round: find(db, "rounds", app.roundId) };
}
function assertOpen(round, now) {
  requireValue(
    round.status === "open" && timestamp(now) < timestamp(round.intakeEnd),
    "INVALID_STATE",
    "ĐXT không còn tiếp nhận hồ sơ.",
  );
}
function declarative(i) {
  return {
    criterionId: i.criterionId,
    declaredValue: i.declaredValue ?? null,
    declaredCount: i.declaredCount ?? null,
    evidence: structuredClone(i.evidence ?? []),
    declaredEntries: (i.declaredEntries ?? []).map((e) => ({
      id: e.id,
      title: e.title,
      levelId: e.levelId,
      evidence: structuredClone(e.evidence ?? []),
    })),
  };
}
function applyValues(app, round, p) {
  let changed = false;
  const incoming = new Map(
    (p.items ?? app.items).map((i) => [i.criterionId, i]),
  );
  const changedIds = new Set();
  const items = round.criteriaSnapshot.criteria.map((c) => {
    const old = app.items.find((i) => i.criterionId === c.id),
      raw = incoming.get(c.id) ?? old ?? { criterionId: c.id };
    const values = declarative(raw);
    const different =
      JSON.stringify(values) !==
      JSON.stringify(declarative(old ?? { criterionId: c.id }));
    if (different) {
      changed = true;
      changedIds.add(c.id);
    }
    return different || !old
      ? {
          ...values,
          verifyStatus: "UNVERIFIED",
          verifiedValue: null,
          verifyNote: "",
          verifiedBy: null,
          verifiedAt: null,
          declaredEntries: values.declaredEntries.map((e) => ({
            ...e,
            verifyStatus: "UNVERIFIED",
            verifyNote: "",
          })),
        }
      : old;
  });
  for (const c of round.criteriaSnapshot.criteria.filter((c) =>
    changedIds.has(c.refCriterionId),
  )) {
    const i = items.find((i) => i.criterionId === c.id);
    i.verifyStatus = "UNVERIFIED";
    i.verifiedValue = null;
    i.verifyNote = "";
  }
  app.items = items;
  for (const key of ["phone", "homeClass", "committed"])
    if (p[key] !== undefined) {
      if (app[key] !== p[key]) changed = true;
      app[key] = p[key];
    }
  const score = scoreApplication(round.criteriaSnapshot, items);
  app.selfScore = score.total;
  app.selfEligible = score.eligible;
  return changed;
}
function complete(db, app, round) {
  requireValue(
    app.committed,
    "VALIDATION",
    "Cần cam kết thông tin trung thực trước khi nộp.",
  );
  const missing = [];
  const evidenceOk = (refs) =>
    refs.length > 0 &&
    refs.every(
      (f) =>
        f.name &&
        db.config.files.allowedMime.includes(f.mime) &&
        f.size > 0 &&
        f.size <= db.config.files.maxMb * 1024 * 1024 &&
        (f.fileKey || f.sample),
    );
  for (const c of round.criteriaSnapshot.criteria) {
    const i = app.items.find((i) => i.criterionId === c.id);
    if (!i) {
      missing.push(c.name);
      continue;
    }
    if (c.refCriterionId) continue;
    if (
      c.valueType === "NUMBER_THRESHOLD" &&
      numericValue(i.declaredValue) === null
    )
      missing.push(`${c.name}: thiếu giá trị số`);
    if (
      c.valueType === "COUNT" &&
      (numericValue(i.declaredCount) === null ||
        !Number.isInteger(Number(i.declaredCount)) ||
        Number(i.declaredCount) < 0)
    )
      missing.push(`${c.name}: số lượng phải là số nguyên không âm`);
    if (c.valueType === "ACCUMULATIVE_ENUM") {
      for (const e of i.declaredEntries ?? []) {
        if (
          !e.title?.trim() ||
          !c.levels.some((l) => l.id === e.levelId) ||
          (c.evidenceRequired && !evidenceOk(e.evidence ?? []))
        )
          missing.push(
            `${c.name}: thành tích cần tên, mức và minh chứng hợp lệ`,
          );
      }
    } else if (c.evidenceRequired && !evidenceOk(i.evidence ?? []))
      missing.push(`${c.name}: thiếu minh chứng hợp lệ`);
  }
  requireValue(!missing.length, "VALIDATION", missing.join("; "), { missing });
}
export const createDraft = defineService("applications.createDraft", {
  permission: "application.submit",
  resolve: own,
  handler(db, ctx, p) {
    const user = authenticated(ctx),
      round = find(db, "rounds", p.roundId);
    assertOpen(round, ctx.now);
    const flow = classifyFlow(db, user.id, round);
    requireValue(flow.allowed, "FORBIDDEN", flow.reason);
    requireValue(
      !db.applications.some(
        (a) =>
          a.roundId === round.id &&
          a.studentUserId === user.id &&
          ["draft", "pending", "needs_update", "approved"].includes(a.status),
      ),
      "CONFLICT",
      "Bạn đã có một hồ sơ hiệu lực trong ĐXT này.",
    );
    const profile = studentProfile(db, user.id),
      prior = inheritApplication(db, user.id, round, round.criteriaSnapshot),
      id = nextId(db, "app");
    // Mã hồ sơ phải duy nhất kể cả với dữ liệu mẫu (đánh số theo dãy riêng của seed).
    const sequence =
      Math.max(
        0,
        ...db.applications.map((a) => Number(a.code?.split("-")[2]) || 0),
      ) + 1;
    const app = {
      id,
      code: `HS-${ctx.now.slice(0, 4)}-${String(sequence).padStart(6, "0")}`,
      roundId: round.id,
      studentUserId: user.id,
      studentCode: profile.studentCode,
      applicantName: user.fullName,
      dob: profile.dob,
      email: user.email,
      phone: user.phone,
      homeClass: profile.homeClass,
      majorName: find(db, "majors", profile.majorId).name,
      flow: flow.flow,
      status: "draft",
      committed: false,
      items: prior.items,
      previousApplicationId: prior.previousApplicationId,
      selfScore: 0,
      selfEligible: false,
      officialScore: null,
      officialEligible: null,
      rank: null,
      submittedAt: null,
      lastEditedAt: ctx.now,
      decisionNote: "",
      decidedBy: null,
      decidedAt: null,
      remindersSent: [],
      history: [],
    };
    applyValues(app, round, p);
    db.applications.push(app);
    applicationHistory(db, ctx, app, "Lưu nháp");
    audit(db, ctx, {
      action: "APPLICATION_DRAFT_SAVED",
      entity: "application",
      entityId: id,
      before: null,
      after: app,
    });
    return { result: app };
  },
});
function mutate(name, to) {
  return defineService(`applications.${name}`, {
    permission: "application.submit",
    resolve: own,
    handler(db, ctx, p) {
      const { app, round } = load(db, ctx, p),
        before = structuredClone(app);
      const request = db.reviewRequests
        .filter((r) => r.applicationId === app.id && !r.resolvedAt)
        .at(-1);
      const target = to ?? app.status;
      if (name === "saveDraft")
        requireValue(
          app.status === "draft",
          "INVALID_STATE",
          "Chỉ lưu nháp khi hồ sơ ở bản nháp.",
        );
      if (name === "update")
        requireValue(
          app.status === "pending",
          "INVALID_STATE",
          "Chỉ sửa hồ sơ đang chờ duyệt.",
        );
      if (name === "resubmit")
        requireValue(
          app.status === "needs_update",
          "INVALID_STATE",
          "Hồ sơ chưa có yêu cầu bổ sung.",
        );
      if (name === "submit")
        requireValue(
          app.status === "draft",
          "INVALID_STATE",
          "Chỉ nộp chính thức từ bản nháp.",
        );
      if (name === "deleteDraft")
        requireValue(
          app.status === "draft",
          "INVALID_STATE",
          "Chỉ hủy hồ sơ nháp.",
        );
      if (name !== "resubmit") assertOpen(round, ctx.now);
      assertTransition(app.status, target, {
        round,
        now: ctx.now,
        actor: "STUDENT",
        dueAt: request?.dueAt,
      });
      let changed = false;
      if (["saveDraft", "submit", "update", "resubmit"].includes(name))
        changed = applyValues(app, round, p);
      if (["submit", "update", "resubmit"].includes(name))
        complete(db, app, round);
      if (name === "resubmit") {
        requireValue(
          request && changed,
          "VALIDATION",
          "Cần sửa giá trị hoặc minh chứng theo yêu cầu trước khi gửi bổ sung.",
        );
        request.resolvedAt = ctx.now;
        notify(db, ctx, [request.createdBy], {
          type: "APPLICATION_RESUBMITTED",
          title: "Sinh viên đã gửi bổ sung hồ sơ",
          body: app.code,
          link: `/app/reviews/${app.id}`,
        });
      }
      app.status = target;
      app.lastEditedAt = ctx.now;
      if (name === "submit") {
        app.submittedAt = ctx.now;
        queueEmail(db, ctx, {
          to: app.email,
          template: "APPLICATION_SUBMITTED",
          vars: {
            applicationCode: app.code,
            name: app.applicantName,
            roundName: round.name,
            time: ctx.now,
          },
          relatedEntity: round.id,
        });
        notify(db, ctx, [app.studentUserId], {
          type: "APPLICATION_SUBMITTED",
          title: "Đã tiếp nhận hồ sơ",
          body: app.code,
          link: `/app/my-applications/${app.id}`,
        });
      }
      applicationHistory(
        db,
        ctx,
        app,
        {
          saveDraft: "Lưu nháp",
          submit: "Nộp hồ sơ",
          update: "Chỉnh sửa hồ sơ",
          resubmit: "Gửi bổ sung",
          withdraw: "Rút hồ sơ",
          deleteDraft: "Hủy nháp",
        }[name],
      );
      audit(db, ctx, {
        action: `APPLICATION_${name.toUpperCase()}`,
        entity: "application",
        entityId: app.id,
        before,
        after: app,
      });
      return { result: app };
    },
  });
}
export const saveDraft = mutate("saveDraft", "draft"),
  submit = mutate("submit", "pending"),
  update = mutate("update", "pending"),
  resubmit = mutate("resubmit", "pending"),
  withdraw = mutate("withdraw", "withdrawn"),
  deleteDraft = mutate("deleteDraft", "cancelled");

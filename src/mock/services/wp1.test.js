import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSeedDb } from "../seed/index.js";
import { buildCtx } from "./_kernel.js";
import * as reviews from "./reviews.js";
import * as rounds from "./rounds.js";
import * as lists from "./lists.js";
import * as applications from "./applications.js";
const ctx = (db, username, role) => {
  const user = db.users.find((u) => u.username === username),
    assignment = db.userRoles.find(
      (r) => r.userId === user?.id && (!role || r.role === role),
    );
  return buildCtx(
    db,
    user ? { userId: user.id, activeRoleId: assignment?.id } : null,
    "test-entropy-987654321",
  );
};
const openApp = (db) =>
  db.applications.find(
    (a) => a.roundId === "DXT-2026-01" && a.status === "pending",
  );

test("WP1: GVPT xác minh và quyết định khi ĐXT đang open", () => {
  let db = buildSeedDb();
  assert.equal(db.rounds.find((r) => r.id === "DXT-2026-01").status, "open");
  const app = openApp(db);
  const item = app.items[0];
  db = reviews.verifyItem(db, ctx(db, "GV005", "LECTURER"), {
    applicationId: app.id,
    criterionId: item.criterionId,
    verifyStatus: "INVALID",
  }).db;
  const r = reviews.decide(db, ctx(db, "GV005", "LECTURER"), {
    applicationId: app.id,
    decision: "REJECTED",
    note: "Không đạt",
  });
  assert.equal(r.result.status, "rejected");
});

test("verifyItem: INVALID không cần note; điều chỉnh giá trị cần note; không gửi verifiedValue thì giữ nguyên", () => {
  let db = buildSeedDb();
  const app = db.applications.find(
    (a) => a.roundId === "DXT-2026-02" && a.studentCode === "21094518",
  );
  const crit = app.items.find((i) => i.declaredValue != null);
  const c = ctx(db, "GV001");
  assert.throws(
    () =>
      reviews.verifyItem(db, c, {
        applicationId: app.id,
        criterionId: crit.criterionId,
        verifyStatus: "VALID",
        verifiedValue: Number(crit.declaredValue) + 1,
      }),
    { code: "VALIDATION" },
  );
  db = reviews.verifyItem(db, ctx(db, "GV001"), {
    applicationId: app.id,
    criterionId: crit.criterionId,
    verifyStatus: "VALID",
    verifiedValue: Number(crit.declaredValue) + 1,
    note: "Theo bảng điểm",
  }).db;
  db = reviews.verifyItem(db, ctx(db, "GV001"), {
    applicationId: app.id,
    criterionId: crit.criterionId,
    verifyStatus: "INVALID",
  }).db;
  const kept = db.applications
    .find((a) => a.id === app.id)
    .items.find((i) => i.criterionId === crit.criterionId);
  assert.equal(kept.verifiedValue, Number(crit.declaredValue) + 1);
  assert.equal(kept.verifyStatus, "INVALID");
  db = reviews.verifyItem(db, ctx(db, "GV001"), {
    applicationId: app.id,
    criterionId: crit.criterionId,
    verifyStatus: "VALID",
    verifiedValue: null,
  }).db;
  assert.equal(
    db.applications
      .find((a) => a.id === app.id)
      .items.find((i) => i.criterionId === crit.criterionId).verifiedValue,
    null,
  );
});

test("Hạn bổ sung sau reviewEnd được chấp nhận, hủy yêu cầu đưa về pending", () => {
  let db = buildSeedDb();
  const app = db.applications.find(
    (a) => a.roundId === "DXT-2026-02" && a.studentCode === "21094518",
  );
  db = reviews.decide(db, ctx(db, "GV001"), {
    applicationId: app.id,
    decision: "NEEDS_UPDATE",
    note: "Bổ sung",
    dueAt: "2026-12-30T00:00:00+07:00",
  }).db;
  assert.equal(db.applications.find((a) => a.id === app.id).status, "needs_update");
  db = reviews.cancelRequest(db, ctx(db, "GV001"), {
    applicationId: app.id,
    reason: "Không cần nữa",
  }).db;
  assert.equal(db.applications.find((a) => a.id === app.id).status, "pending");
  assert.ok(
    db.reviewRequests
      .filter((r) => r.applicationId === app.id)
      .every((r) => r.resolvedAt),
  );
});

test("GVPT rút ngắn intakeEnd khi open; quá khứ bị từ chối", () => {
  const db = buildSeedDb();
  const c = () => ctx(db, "GV005", "LECTURER");
  const out = rounds.update(db, c(), {
    id: "DXT-2026-01",
    changes: { intakeEnd: "2026-11-20T00:00:00+07:00" },
  });
  assert.equal(out.result.intakeEnd, "2026-11-20T00:00:00+07:00");
  assert.throws(
    () =>
      rounds.update(db, c(), {
        id: "DXT-2026-01",
        changes: { intakeEnd: "2026-11-08T00:00:00+07:00" },
      }),
    { code: "VALIDATION" },
  );
});

test("ĐXT review + intakeEnd tương lai ⇒ mở lại tiếp nhận", () => {
  const db = buildSeedDb();
  const out = rounds.update(db, ctx(db, "GV001", "LECTURER"), {
    id: "DXT-2026-02",
    changes: { intakeEnd: "2026-11-15T00:00:00+07:00" },
  });
  assert.equal(out.result.status, "open");
  assert.ok(out.db.auditLogs.some((a) => a.action === "ROUND_INTAKE_REOPENED"));
});

test("closeReview bị từ chối khi ĐXT còn open", () => {
  const db = buildSeedDb();
  assert.throws(
    () => lists.closeReview(db, ctx(db, "GV005", "LECTURER"), { roundId: "DXT-2026-01" }),
    { code: "INVALID_STATE" },
  );
});

test("A-20: hồ sơ rejected chặn tạo hồ sơ mới cùng ĐXT, withdrawn thì không", () => {
  let db = buildSeedDb();
  const app = openApp(db);
  db = reviews.decide(db, ctx(db, "GV005", "LECTURER"), {
    applicationId: app.id,
    decision: "REJECTED",
    note: "Không đạt",
  }).db;
  const student = db.users.find((u) => u.id === app.studentUserId);
  const c = ctx(db, student.username);
  assert.throws(
    () => applications.createDraft(db, c, { roundId: "DXT-2026-01" }),
    { code: "CONFLICT" },
  );
});

test("WP3: applyValues gắn updatedAt đúng tiêu chí bị sửa; resubmit thành công khi ĐXT open", () => {
  let db = buildSeedDb();
  const app = openApp(db);
  const student = db.users.find((u) => u.id === app.studentUserId);
  const target = app.items.find((i) => i.declaredValue != null);
  const items = app.items.map((i) =>
    i.criterionId === target.criterionId
      ? { ...i, declaredValue: String(Number(i.declaredValue) + 0.1) }
      : i,
  );
  const out = applications.update(db, ctx(db, student.username), {
    id: app.id,
    items,
    committed: true,
  });
  const after = out.result.items;
  assert.ok(after.find((i) => i.criterionId === target.criterionId).updatedAt);
  assert.ok(
    after
      .filter((i) => i.criterionId !== target.criterionId)
      .every((i) => !i.updatedAt || i.updatedAt !== out.result.lastEditedAt),
  );
});

test("Vòng bổ sung trọn vẹn: yêu cầu → SV sửa và gửi lại → GV xác minh lại → Đạt", () => {
  let db = buildSeedDb();
  const app = db.applications.find(
    (a) => a.roundId === "DXT-2026-02" && a.studentCode === "21094518",
  );
  const round = db.rounds.find((r) => r.id === app.roundId);
  const gv = () => ctx(db, "GV001");
  const target = app.items.find((i) => i.declaredValue != null);
  db = reviews.verifyItem(db, gv(), {
    applicationId: app.id,
    criterionId: target.criterionId,
    verifyStatus: "INVALID",
  }).db;
  db = reviews.decide(db, gv(), {
    applicationId: app.id,
    decision: "NEEDS_UPDATE",
    note: "Cập nhật minh chứng và giá trị",
    dueAt: "2026-12-30T00:00:00+07:00",
  }).db;
  const student = db.users.find((u) => u.id === app.studentUserId).username;
  const before = db.applications.find((a) => a.id === app.id);
  const untouched = before.items.filter((i) => i.criterionId !== target.criterionId);
  db = applications.resubmit(db, ctx(db, student), {
    id: app.id,
    committed: true,
    items: before.items.map((i) =>
      i.criterionId === target.criterionId
        ? { ...i, declaredValue: String(Number(i.declaredValue) + 0.1) }
        : i,
    ),
  }).db;
  const after = db.applications.find((a) => a.id === app.id);
  assert.equal(after.status, "pending");
  assert.equal(
    after.items.find((i) => i.criterionId === target.criterionId).verifyStatus,
    "UNVERIFIED",
  );
  // Tiêu chí không sửa giữ nguyên kết quả xác minh cũ.
  for (const old of untouched)
    assert.equal(
      after.items.find((i) => i.criterionId === old.criterionId).verifyStatus,
      old.verifyStatus,
    );
  assert.ok(
    db.reviewRequests
      .filter((r) => r.applicationId === app.id)
      .every((r) => r.resolvedAt),
  );
  for (const c of round.criteriaSnapshot.criteria) {
    const item = after.items.find((i) => i.criterionId === c.id);
    db = reviews.verifyItem(db, gv(), {
      applicationId: app.id,
      criterionId: c.id,
      verifyStatus: "VALID",
    }).db;
    for (const e of item.declaredEntries ?? [])
      db = reviews.verifyItem(db, gv(), {
        applicationId: app.id,
        criterionId: c.id,
        entryId: e.id,
        verifyStatus: "VALID",
      }).db;
  }
  const approved = reviews.decide(db, gv(), {
    applicationId: app.id,
    decision: "APPROVED",
  });
  assert.equal(approved.result.status, "approved");
});

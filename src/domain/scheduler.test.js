import { test } from "node:test";
import assert from "node:assert/strict";
import { tick } from "./scheduler.js";
import { addMinutes, addHours } from "./time.js";
import {
  emptyDb,
  assessment,
  testRound,
  testApplication,
  now,
} from "./test-fixtures.js";
function setup() {
  const db = emptyDb();
  db.criteriaSets.push(structuredClone(assessment));
  db.rounds.push(
    testRound({
      status: "upcoming",
      criteriaSnapshot: null,
      intakeStart: now,
      intakeEnd: "2026-11-12T09:00:00+07:00",
      reviewStart: "2026-11-12T09:00:00+07:00",
    }),
  );
  db.users.push({
    id: "u_a1",
    email: "sample@student.iuh.edu.vn",
    status: "ACTIVE",
  });
  return db;
}
test("Tự upcoming→open + deep snapshot, tick không mutate input", () => {
  const db = setup(),
    before = structuredClone(db);
  const result = tick(db, now);
  assert.equal(result.db.rounds[0].status, "open");
  assert.deepEqual(result.db.rounds[0].criteriaSnapshot, assessment);
  assert.deepEqual(db, before);
  result.db.criteriaSets[0].criteria[0].levels[0].points = 999;
  assert.equal(
    result.db.rounds[0].criteriaSnapshot.criteria[0].levels[0].points,
    5,
  );
  assert.ok(
    result.db.auditLogs.every(
      (l) => l.actorId === null && l.actorName === "Hệ thống",
    ),
  );
});
test("Nhảy qua nhiều mốc: open→review và hủy draft cùng tick", () => {
  const db = setup();
  db.applications.push(testApplication("a1", {}, { status: "draft" }));
  const r = tick(db, "2026-11-13T09:00:00+07:00");
  assert.equal(r.db.rounds[0].status, "review");
  assert.equal(r.db.applications[0].status, "cancelled");
  assert.equal(
    r.db.emailOutbox.filter((e) => e.template === "DRAFT_REMINDER").length,
    0,
  );
});
test("Nhắc nháp 48h/24h mỗi mốc chỉ một lần", () => {
  const db = setup();
  db.applications.push(
    testApplication("a1", {}, { status: "draft", remindersSent: [] }),
  );
  const r1 = tick(db, "2026-11-10T09:00:00+07:00");
  assert.deepEqual(r1.db.applications[0].remindersSent, [48]);
  const r2 = tick(r1.db, "2026-11-11T09:00:00+07:00");
  assert.deepEqual(r2.db.applications[0].remindersSent, [48, 24]);
  assert.equal(
    r2.db.emailOutbox.filter((e) => e.template === "DRAFT_REMINDER").length,
    2,
  );
  assert.deepEqual(tick(r2.db, "2026-11-11T09:00:00+07:00").db, r2.db);
});
test("needs_update đúng hạn chưa hết, quá hạn 1 giây rejected + email/thông báo/history", () => {
  const db = setup();
  db.rounds[0].status = "review";
  db.applications.push(testApplication("a1", {}, { status: "needs_update" }));
  db.reviewRequests.push({
    id: "request1",
    applicationId: "a1",
    dueAt: now,
    resolvedAt: null,
  });
  assert.equal(tick(db, now).db.applications[0].status, "needs_update");
  const r = tick(db, "2026-11-09T09:00:01+07:00");
  assert.equal(r.db.applications[0].status, "rejected");
  assert.equal(r.db.applications[0].decisionNote, "Quá hạn bổ sung hồ sơ");
  assert.ok(r.db.notifications.some((n) => n.type === "NEEDS_UPDATE_EXPIRED"));
  assert.ok(
    r.db.emailOutbox.some((n) => n.template === "NEEDS_UPDATE_EXPIRED"),
  );
  assert.ok(r.db.applications[0].history.length);
  assert.deepEqual(tick(r.db, r.db.clock.now).db, r.db);
});
test("Mở đợt tiếp theo: chỉ SV ACTIVE năm trước được nhắc", () => {
  const db = setup();
  db.rounds.push(
    testRound({ id: "r0", academicYear: "2025–2026", status: "published" }),
  );
  db.memberships.push(
    { studentUserId: "u_a1", classId: "c1", studyYear: 2, status: "ACTIVE" },
    { studentUserId: "other", classId: "c2", studyYear: 2, status: "ACTIVE" },
  );
  const r = tick(db, now);
  assert.equal(
    r.db.notifications.filter((n) => n.type === "ROUND_OPENED").length,
    1,
  );
  assert.equal(r.db.notifications[0].userId, "u_a1");
  const closing = tick(r.db, "2026-11-10T09:00:00+07:00");
  assert.equal(
    closing.db.notifications.filter((n) => n.type === "ROUND_CLOSING").length,
    1,
  );
});
test("Nhắc cấp đang giữ tối đa một lần/ngày, đo từ bước duyệt mới nhất", () => {
  const db = setup();
  db.rounds[0].status = "approving";
  db.rounds[0].approvalSubstatus = "waiting_dean";
  db.users.push({ id: "dean", status: "ACTIVE", email: "dean@iuh.edu.vn" });
  db.userRoles.push({
    userId: "dean",
    role: "DEAN",
    scopeType: "FACULTY",
    scopeId: "f1",
  });
  db.admissionLists.push({
    id: "l1",
    roundId: "r1",
    status: "PENDING",
    version: 1,
    createdAt: "2026-11-01T09:00:00+07:00",
  });
  db.approvalSteps.push({
    listId: "l1",
    level: "HEAD",
    decidedAt: "2026-11-08T09:00:00+07:00",
  });
  assert.equal(tick(db, now).db.notifications.length, 0);
  const r = tick(db, "2026-11-11T09:00:00+07:00");
  assert.equal(r.db.notifications.length, 1);
  assert.equal(
    tick(r.db, "2026-11-11T10:00:00+07:00").db.notifications.length,
    1,
  );
  assert.equal(
    tick(r.db, "2026-11-12T09:00:00+07:00").db.notifications.length,
    2,
  );
});
test("Outbox giao email; FAILED tối đa 3 lần, cùng now idempotent", () => {
  const db = emptyDb();
  db.emailOutbox.push(
    { id: "e1", to: "fail@example.com", status: "QUEUED", attempts: 0 },
    { id: "e2", to: "ok@example.com", status: "QUEUED", attempts: 0 },
  );
  const r1 = tick(db, now);
  assert.equal(r1.db.emailOutbox[0].status, "FAILED");
  assert.equal(r1.db.emailOutbox[1].status, "SENT");
  assert.deepEqual(tick(r1.db, now).db, r1.db);
  const r2 = tick(r1.db, addMinutes(now, 1)),
    r3 = tick(r2.db, addMinutes(now, 2)),
    r4 = tick(r3.db, addHours(now, 1));
  assert.equal(r4.db.emailOutbox[0].attempts, 3);
  assert.equal(r4.db.emailOutbox[1].attempts, 1);
  assert.match(r4.db.emailOutbox[0].lastError, /SMTP 550/);
});

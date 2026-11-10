import { test } from "node:test";
import assert from "node:assert/strict";
import { computePublishOutcome } from "./publish.js";
import { buildAdmissionList } from "./ranking.js";
import {
  emptyDb,
  assessment,
  testRound,
  testApplication,
  now,
} from "./test-fixtures.js";
function setup({ quota = 2, mode = "OPEN_COMPETITION", tie = false } = {}) {
  const db = emptyDb();
  db.rounds.push(
    testRound({
      status: "approving",
      approvalSubstatus: "waiting_training",
      quota,
      rankingMode: mode,
    }),
  );
  db.applications.push(
    testApplication("a1", { c_gpa: 3.6 }),
    testApplication("a2", { c_gpa: tie ? 3.6 : 3.5 }),
    testApplication("a3", { c_gpa: 3.2 }),
  );
  for (const a of db.applications) {
    db.users.push({
      id: a.studentUserId,
      email: `${a.id}@student.iuh.edu.vn`,
      fullName: a.applicantName,
    });
    db.studentProfiles.push({ userId: a.studentUserId, isKSTN: false });
  }
  const payload = buildAdmissionList({
    round: db.rounds[0],
    snapshot: assessment,
    applications: db.applications,
    isFirstRound: true,
  });
  db.admissionLists.push({
    id: "l1",
    roundId: "r1",
    version: 1,
    status: "PENDING",
    payload,
    tieResolution: null,
  });
  for (const level of ["HEAD", "DEAN"])
    db.approvalSteps.push({
      id: level,
      listId: "l1",
      level,
      decision: "APPROVED",
      decidedAt: now,
    });
  return db;
}
const publish = (db) =>
  computePublishOutcome(db, db.rounds[0], db.admissionLists.at(-1), now);
test("Công bố đồng thời confirmed/not_admitted + isKSTN + membership + email + audit", () => {
  const db = setup(),
    before = structuredClone(db),
    r = publish(db);
  assert.deepEqual(db, before);
  assert.equal(r.db.rounds[0].status, "published");
  assert.equal(r.db.admissionLists[0].status, "PUBLISHED");
  assert.deepEqual(
    r.db.applications.map((a) => a.status),
    ["confirmed", "confirmed", "not_admitted"],
  );
  assert.deepEqual(
    r.db.studentProfiles.map((p) => p.isKSTN),
    [true, true, false],
  );
  assert.equal(
    r.db.memberships.filter((m) => m.status === "ACTIVE" && m.studyYear === 3)
      .length,
    2,
  );
  assert.equal(r.db.emailOutbox.length, 3);
  assert.ok(r.db.auditLogs.some((l) => l.action === "ROUND_PUBLISHED"));
});
test("DROPPED SV cũ không nộp, không đạt, rút; bỏ qua ACTIVE lịch sử sau trạng thái mới", () => {
  const db = setup();
  for (const id of ["absent", "reject", "withdraw"]) {
    db.users.push({ id, email: `${id}@student.iuh.edu.vn` });
    db.studentProfiles.push({ userId: id, isKSTN: true });
    for (const studyYear of [1, 2])
      db.memberships.push({
        id: `${id}_${studyYear}`,
        classId: "c1",
        studentUserId: id,
        studyYear,
        status: "ACTIVE",
      });
  }
  db.applications.push(
    testApplication(
      "reject",
      {},
      { studentUserId: "reject", status: "rejected", flow: "C" },
    ),
    testApplication(
      "withdraw",
      {},
      { studentUserId: "withdraw", status: "withdrawn", flow: "C" },
    ),
  );
  const r = publish(db);
  for (const id of ["absent", "reject", "withdraw"]) {
    assert.equal(
      r.db.memberships.find((m) => m.studentUserId === id && m.studyYear === 3)
        .status,
      "DROPPED",
    );
    assert.equal(
      r.db.studentProfiles.find((p) => p.userId === id).isKSTN,
      false,
    );
    assert.ok(
      r.db.emailOutbox.some(
        (e) =>
          e.to === `${id}@student.iuh.edu.vn` &&
          e.template === "RESULT_DROPPED",
      ),
    );
  }
});
test("D-08: SV đã trúng lớp khác cùng năm → nhường suất cho kế tiếp", () => {
  const db = setup();
  db.memberships.push({
    id: "other",
    studentUserId: "u_a1",
    classId: "c2",
    studyYear: 3,
    status: "ACTIVE",
  });
  db.studentProfiles[0].isKSTN = true;
  const r = publish(db);
  assert.equal(r.db.applications[0].status, "not_admitted");
  assert.match(r.db.applications[0].decisionNote, /BR-08/);
  assert.equal(r.db.applications[2].status, "confirmed");
  assert.equal(r.summary.confirmed, 2);
  assert.equal(r.db.studentProfiles[0].isKSTN, true);
});
test("D-08: không dùng membership của năm cũ để loại ứng viên hiện tại", () => {
  const db = setup();
  db.memberships.push({
    id: "other",
    studentUserId: "u_a1",
    classId: "c2",
    studyYear: 2,
    status: "ACTIVE",
  });
  assert.equal(publish(db).db.applications[0].status, "confirmed");
});
test("D-08: thay thế đúng nhóm cạnh tranh", () => {
  const db = setup({ mode: "MAINTAIN_THEN_FILL" });
  db.admissionLists[0].payload.isFirstRound = false;
  db.admissionLists[0].payload.rows[0].group = "RETAINED";
  db.memberships.push({
    id: "other",
    studentUserId: "u_a1",
    classId: "c2",
    studyYear: 3,
    status: "ACTIVE",
  });
  assert.equal(publish(db).db.applications[2].status, "not_admitted");
});
test("Áp tieResolution CNN khi công bố, không vượt quota", () => {
  const db = setup({ quota: 1, tie: true });
  assert.throws(() => publish(db), { code: "VALIDATION" });
  db.admissionLists[0].tieResolution = { selectedApplicationIds: ["a2"] };
  const r = publish(db);
  assert.equal(r.db.applications[1].status, "confirmed");
  assert.equal(r.summary.confirmed, 1);
});
test("Sai phiên bản, thiếu cấp duyệt, sai bước giữ hoặc quota không khớp bị chặn", () => {
  for (const mutate of [
    (db) => {
      db.admissionLists.push({
        ...structuredClone(db.admissionLists[0]),
        id: "l2",
        version: 2,
        status: "RETURNED",
      });
    },
    (db) => {
      db.approvalSteps.pop();
    },
    (db) => {
      db.rounds[0].approvalSubstatus = "waiting_dean";
    },
    (db) => {
      db.admissionLists[0].payload.quota = 999;
    },
  ]) {
    const db = setup();
    mutate(db);
    assert.throws(() => publish(db));
  }
});
test("Lỗi giữa công bố không sửa input, không có trạng thái nửa chừng", () => {
  const db = setup();
  db.users = db.users.filter((u) => u.id !== "u_a2");
  const before = structuredClone(db);
  assert.throws(() => publish(db), { code: "NOT_FOUND" });
  assert.deepEqual(db, before);
});
for (const quota of [1, 2, 3, 10])
  test(`BR-10: confirmed ≤ quota ${quota}`, () => {
    const r = publish(setup({ quota }));
    assert.ok(
      r.db.applications.filter((a) => a.status === "confirmed").length <= quota,
    );
  });

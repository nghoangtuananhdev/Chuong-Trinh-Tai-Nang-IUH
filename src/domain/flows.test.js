import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyFlow, inheritApplication } from "./flows.js";
import { isFirstRound, studyYear, classView } from "./selectors.js";
import {
  emptyDb,
  testRound,
  testApplication,
  assessment,
} from "./test-fixtures.js";
const setup = () => {
  const db = emptyDb();
  db.studentProfiles.push({ userId: "s1", isKSTN: false });
  db.rounds.push(testRound());
  return db;
};
test("A mới đăng ký/chưa từng nộp theo quyết định §6.6; nháp không tạo lịch sử B", () => {
  const db = setup();
  db.applications.push(
    testApplication("a", {}, { studentUserId: "s1", status: "draft" }),
  );
  assert.deepEqual(classifyFlow(db, "s1", db.rounds[0]), {
    flow: "A",
    allowed: true,
  });
});
for (const status of ["not_admitted", "rejected", "withdrawn"])
  test(`B có hồ sơ ${status}`, () => {
    const db = setup();
    db.applications.push(
      testApplication("a", {}, { studentUserId: "s1", status }),
    );
    assert.equal(classifyFlow(db, "s1", db.rounds[0]).flow, "B");
  });
test("B từng bị DROPPED không hạn chế nộp lại", () => {
  const db = setup();
  db.memberships.push({
    studentUserId: "s1",
    classId: "c1",
    studyYear: 2,
    status: "DROPPED",
  });
  assert.equal(classifyFlow(db, "s1", db.rounds[0]).flow, "B");
});
test("C chỉ lớp mình năm trước; chặn KSTN nộp lớp khác", () => {
  const db = setup();
  db.studentProfiles[0].isKSTN = true;
  db.memberships.push({
    studentUserId: "s1",
    classId: "c1",
    studyYear: 2,
    status: "ACTIVE",
  });
  db.rounds.push(
    testRound({ id: "r0", status: "published", academicYear: "2025–2026" }),
  );
  assert.equal(classifyFlow(db, "s1", db.rounds[0]).flow, "C");
  assert.equal(
    classifyFlow(db, "s1", testRound({ classId: "c2" })).allowed,
    false,
  );
});
test("Không có profile không được nộp", () =>
  assert.equal(classifyFlow(setup(), "missing", testRound()).allowed, false));
test("B/C kế thừa giá trị trùng tên, minh chứng và xác minh phải làm mới", () => {
  const db = setup();
  const previous = testApplication(
    "old",
    {},
    {
      studentUserId: "s1",
      roundId: "r0",
      submittedAt: "2025-10-01T00:00:00+07:00",
    },
  );
  db.applications.push(previous);
  db.rounds.push(
    testRound({ id: "r0", status: "published", academicYear: "2025–2026" }),
  );
  const result = inheritApplication(db, "s1", db.rounds[0], assessment);
  assert.equal(result.previousApplicationId, "old");
  assert.equal(
    result.items.find((i) => i.criterionId === "c_gpa").declaredValue,
    3.5,
  );
  assert.ok(
    result.items.every(
      (i) => i.verifyStatus === "UNVERIFIED" && i.evidence.length === 0,
    ),
  );
  assert.ok(
    result.items
      .at(-1)
      .declaredEntries.every(
        (e) => e.evidence.length === 0 && e.verifyStatus === "UNVERIFIED",
      ),
  );
});
test("Năm đào tạo, đợt đầu, trạng thái lớp và sĩ số suy ra", () => {
  const db = setup();
  assert.equal(studyYear(db, db.rounds[0]), 3);
  assert.equal(isFirstRound(db, db.rounds[0]), true);
  assert.equal(classView(db, db.classes[0]).status, "RECRUITING");
  db.rounds.push(
    testRound({ id: "r0", academicYear: "2025–2026", status: "published" }),
  );
  assert.equal(isFirstRound(db, db.rounds[0]), false);
  assert.equal(classView(db, db.classes[0]).status, "ACTIVE");
  db.memberships.push(
    { studentUserId: "s1", classId: "c1", studyYear: 1, status: "ACTIVE" },
    { studentUserId: "s1", classId: "c1", studyYear: 2, status: "DROPPED" },
  );
  assert.equal(classView(db, db.classes[0]).size, 0);
});

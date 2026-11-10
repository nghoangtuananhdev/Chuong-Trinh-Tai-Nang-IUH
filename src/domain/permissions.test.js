import { test } from "node:test";
import assert from "node:assert/strict";
import { can, canAssignRole, assertCan } from "./permissions.js";
import { resolveScopeChain } from "./scope.js";
import { emptyDb, testCtx, now } from "./test-fixtures.js";
const db = emptyDb();
for (const [role, scope, own, other] of [
  ["ADMIN", null, "c1", "c3"],
  ["TRAINING", null, "c1", "c3"],
  ["DEAN", "f1", "c1", "c3"],
  ["HEAD", "m1", "c1", "c2"],
  ["LECTURER", "c1", "c1", "c2"],
]) {
  test(`${role} xem lớp trong/ngoài phạm vi`, () => {
    const ctx = testCtx(db, role, scope);
    assert.equal(can(ctx, "class.view", { type: "class", id: own }), true);
    assert.equal(
      can(ctx, "class.view", { type: "class", id: other }),
      ["ADMIN", "TRAINING"].includes(role),
    );
  });
}
test("Admin không được duyệt hồ sơ, phê duyệt hoặc công bố", () => {
  const ctx = testCtx(db, "ADMIN");
  for (const permission of [
    "application.review",
    "list.close",
    "list.approve.HEAD",
    "list.approve.DEAN",
    "list.publish",
  ])
    assert.equal(can(ctx, permission), false);
});
test("C11: GVPT chỉ reset SV có membership lớp mình", () => {
  const data = emptyDb();
  data.users.push({ id: "s1" }, { id: "s2" });
  data.studentProfiles.push(
    { userId: "s1", majorId: "m1" },
    { userId: "s2", majorId: "m1" },
  );
  data.memberships.push(
    { studentUserId: "s1", classId: "c1" },
    { studentUserId: "s2", classId: "c2" },
  );
  const ctx = testCtx(data, "LECTURER", "c1");
  assert.equal(
    can(ctx, "student.resetPassword", { type: "user", id: "s1" }),
    true,
  );
  assert.equal(
    can(ctx, "student.resetPassword", { type: "user", id: "s2" }),
    false,
  );
});
test("C12: dùng chung khoa, GV chỉ CRUD owner, CNN không sửa bộ cấp khoa", () => {
  const data = emptyDb();
  const own = { facultyId: "f1", majorId: "m1", createdBy: "actor" },
    other = { ...own, createdBy: "someone" };
  const lecturer = testCtx(data, "LECTURER", "c1"),
    head = testCtx(data, "HEAD", "m1"),
    dean = testCtx(data, "DEAN", "f1");
  assert.equal(can(lecturer, "criteria.update", own), true);
  assert.equal(can(lecturer, "criteria.update", other), false);
  assert.equal(can(head, "criteria.update", other), true);
  assert.equal(can(head, "criteria.update", { ...own, majorId: null }), false);
  assert.equal(can(dean, "criteria.update", { ...own, majorId: null }), true);
  for (const ctx of [lecturer, head, dean]) {
    assert.equal(
      can(ctx, "criteria.view", { facultyId: "f1", majorId: "m2" }),
      true,
    );
    assert.equal(
      can(ctx, "criteria.view", { facultyId: "f2", majorId: "m3" }),
      false,
    );
  }
});
for (const [role, scope, target, type, targetId, allowed] of [
  ["ADMIN", null, "ADMIN", "SCHOOL", null, true],
  ["TRAINING", null, "ADMIN", "SCHOOL", null, false],
  ["TRAINING", null, "DEAN", "FACULTY", "f2", true],
  ["DEAN", "f1", "HEAD", "MAJOR", "m1", true],
  ["DEAN", "f1", "DEAN", "FACULTY", "f2", false],
  ["DEAN", "f1", "LECTURER", "CLASS", "c3", false],
  ["HEAD", "m1", "HEAD", "MAJOR", "m1", true],
  ["HEAD", "m1", "HEAD", "MAJOR", "m2", false],
  ["HEAD", "m1", "DEAN", "FACULTY", "f1", false],
  ["HEAD", "m1", "LECTURER", "CLASS", "c1", true],
  ["HEAD", "m1", "LECTURER", "CLASS", "c2", false],
  ["LECTURER", "c1", "LECTURER", "CLASS", "c1", false],
  ["ADMIN", null, "LECTURER", "SCHOOL", null, false],
  ["ADMIN", null, "LECTURER", "CLASS", "missing", false],
])
  test(`BR-14 ${role} gán ${target} ${targetId} => ${allowed}`, () =>
    assert.equal(
      canAssignRole(testCtx(db, role, scope), target, {
        scopeType: type,
        scopeId: targetId,
      }),
      allowed,
    ));
test("Vai trò hết hạn/chưa hiệu lực/thu hồi không có quyền; biên validTo có hiệu lực", () => {
  for (const fields of [
    { validTo: "2026-11-09T08:59:59+07:00" },
    { validFrom: "2026-11-10T00:00:00+07:00" },
    { revokedAt: now },
    { userId: "someone" },
  ]) {
    assert.equal(can(testCtx(db, "ADMIN", null, fields), "class.view"), false);
  }
  assert.equal(
    can(testCtx(db, "ADMIN", null, { validTo: now }), "class.view"),
    true,
  );
});
test("SV chỉ xem chính mình; khóa TK và buộc đổi MK chặn quyền", () => {
  const ctx = testCtx(db, "STUDENT");
  assert.equal(can(ctx, "application.view", { studentUserId: "actor" }), true);
  assert.equal(can(ctx, "application.view", { studentUserId: "other" }), false);
  ctx.actor.user.status = "LOCKED";
  assert.equal(can(ctx, "application.submit"), false);
  const admin = testCtx(db, "ADMIN");
  admin.actor.user.mustChangePassword = true;
  assert.equal(can(admin, "class.manage"), false);
});
test("Tài nguyên không tồn tại không được bỏ qua scope; assertCan trả FORBIDDEN", () => {
  assert.equal(
    can(testCtx(db, "ADMIN"), "class.manage", { type: "class", id: "missing" }),
    false,
  );
  assert.throws(
    () =>
      assertCan(testCtx(db, "HEAD", "m1"), "class.manage", {
        type: "class",
        id: "c3",
      }),
    { code: "FORBIDDEN" },
  );
});
test("Resolve application → round → class → program → major → faculty", () => {
  const data = emptyDb();
  data.rounds.push({ id: "r1", classId: "c1" });
  data.applications.push({ id: "a1", roundId: "r1", studentUserId: "s1" });
  assert.deepEqual(resolveScopeChain(data, "application", "a1"), {
    facultyId: "f1",
    majorId: "m1",
    classId: "c1",
    studentUserId: "s1",
  });
});

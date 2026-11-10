import { test } from "node:test";
import assert from "node:assert/strict";
import { ROUND_STATUS } from "./constants.js";
import {
  ROUND_TRANSITIONS,
  assertTransition,
  assertApprovalStage,
  editableFields,
  validateTimeline,
} from "./round-machine.js";
import { testRound } from "./test-fixtures.js";
for (const from of ROUND_STATUS)
  for (const to of ROUND_STATUS) {
    test(`ĐXT ${from} → ${to}`, () => {
      if (ROUND_TRANSITIONS[from].includes(to))
        assert.doesNotThrow(() => assertTransition(from, to));
      else
        assert.throws(() => assertTransition(from, to), {
          code: "INVALID_STATE",
        });
    });
  }
for (const level of ["HEAD", "DEAN", "TRAINING"])
  for (const sub of ["waiting_head", "waiting_dean", "waiting_training"]) {
    test(`Cấp ${level} ở ${sub}`, () => {
      const action = () =>
        assertApprovalStage(
          { status: "approving", approvalSubstatus: sub },
          level,
        );
      if (sub === `waiting_${level.toLowerCase()}`) action();
      else assert.throws(action, { code: "INVALID_STATE" });
    });
  }
test("Trường sửa theo vai trò/giai đoạn", () => {
  assert.ok(editableFields("draft", "ADMIN").includes("classId"));
  assert.deepEqual(editableFields("draft", "LECTURER"), []);
  assert.ok(!editableFields("open", "LECTURER").includes("quota"));
  assert.ok(editableFields("review", "HEAD").includes("quota"));
  for (const role of [
    "ADMIN",
    "HEAD",
    "DEAN",
    "LECTURER",
    "TRAINING",
    "STUDENT",
  ]) {
    assert.deepEqual(editableFields("published", role), []);
    assert.deepEqual(editableFields("approving", role), []);
  }
  assert.deepEqual(editableFields("upcoming", "LECTURER"), [
    "intakeStart",
    "intakeEnd",
    "reviewStart",
    "reviewEnd",
    "approvalDue",
  ]);
});
test("Ngày tiếp nhận/xét duyệt theo thứ tự, xét duyệt bắt đầu có thể bằng intakeEnd", () => {
  validateTimeline(testRound());
  validateTimeline(testRound({ reviewStart: "2026-10-31T00:00:00+07:00" }));
  for (const fields of [
    { intakeEnd: "2026-09-01T00:00:00+07:00" },
    { reviewStart: "2026-10-20T00:00:00+07:00" },
    { reviewEnd: "2026-11-01T00:00:00+07:00" },
    { approvalDue: "2026-11-01T00:00:00+07:00" },
  ]) {
    assert.throws(() => validateTimeline(testRound(fields)), {
      code: "VALIDATION",
    });
  }
});

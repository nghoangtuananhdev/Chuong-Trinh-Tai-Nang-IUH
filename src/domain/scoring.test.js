import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreApplication, matchesLevel } from "./scoring.js";
import { assessment, assessmentItems } from "./test-fixtures.js";
const score = (overrides, mode) =>
  scoreApplication(assessment, assessmentItems(overrides), mode);
test("Assessment Sample: 190 = 110 BB + 80 UT, đạt toàn bộ BB", () => {
  const result = score();
  assert.equal(result.total, 190);
  assert.equal(result.requiredTotal, 110);
  assert.equal(result.priorityTotal, 80);
  assert.equal(result.eligible, true);
});
test("MP 5.3.4: Nhất + Ba + Ba + KK = 90, không áp trần", () => {
  const criterion = structuredClone(assessment.criteria.at(-1));
  criterion.maxPoints = 1;
  const result = scoreApplication({ criteria: [criterion] }, [
    {
      criterionId: criterion.id,
      declaredEntries: ["g1", "g3", "g3", "g4"].map((levelId) => ({ levelId })),
    },
  ]);
  assert.equal(result.total, 90);
});
test("GPA đúng ngưỡng 3.4 nhận 40", () =>
  assert.equal(
    score({ c_gpa: 3.4 }).rows.find((r) => r.criterionId === "c_gpa").points,
    40,
  ));
test("RL 80 không thỏa >80, BB không đạt", () => {
  const s = score({ c_rl: 80 });
  assert.equal(s.eligible, false);
  assert.ok(s.failedRequired.includes("c_rl"));
});
test("TC nợ = 1 không thỏa EQ 0 dù tổng cao", () =>
  assert.equal(score({ c_tc_rot: 1 }).eligible, false));
for (const [operator, value, expected] of [
  ["GTE", 2, true],
  ["GT", 2, false],
  ["EQ", 2, true],
  ["LTE", 2, true],
  ["LT", 2, false],
  ["BETWEEN", 2, true],
  ["BETWEEN", 4, true],
  ["BETWEEN", 4.1, false],
  ["UNKNOWN", 2, false],
]) {
  test(`${operator} ở giá trị ${value} => ${expected}`, () =>
    assert.equal(
      matchesLevel(value, { operator, valueFrom: 2, valueTo: 4 }),
      expected,
    ));
}
for (const raw of [
  "",
  " ",
  null,
  undefined,
  NaN,
  Infinity,
  "sai",
  false,
  [],
  {},
]) {
  test(`Giá trị rỗng/sai kiểu ${String(raw)} không thỏa ngưỡng`, () =>
    assert.equal(score({ c_tc_rot: raw }).eligible, false));
}
test("COUNT PER_ITEM và maxPoints", () => {
  const c = {
    ...assessment.criteria.find((c) => c.id === "c_nckh"),
    countMode: "PER_ITEM",
    maxPoints: 50,
  };
  assert.equal(
    scoreApplication({ criteria: [c] }, [
      { criterionId: c.id, declaredCount: 3 },
    ]).total,
    50,
  );
});
test("UT lấy giá trị BB, bỏ qua khai riêng", () => {
  const items = assessmentItems({ c_ta: 500 });
  items.find((i) => i.criterionId === "c_ta_ut").declaredValue = 999;
  assert.equal(
    scoreApplication(assessment, items).rows.find(
      (r) => r.criterionId === "c_ta_ut",
    ).points,
    0,
  );
});
test("Official ghi đè verifiedValue, self giữ tự khai", () => {
  const items = assessmentItems();
  items.find((i) => i.criterionId === "c_gpa").verifiedValue = 3.2;
  assert.equal(scoreApplication(assessment, items, "official").total, 180);
  assert.equal(
    scoreApplication(assessment, items, { mode: "self" }).total,
    190,
  );
});
test("Official INVALID cho 0, ref không được dùng nguồn INVALID", () => {
  const items = assessmentItems();
  items.find((i) => i.criterionId === "c_ta").verifyStatus = "INVALID";
  const result = scoreApplication(assessment, items, "official");
  assert.equal(result.total, 150);
  assert.equal(result.eligible, false);
});
test("Official ACCUMULATIVE chỉ đếm entry VALID", () => {
  const items = assessmentItems();
  items.at(-1).declaredEntries[0].verifyStatus = "INVALID";
  items
    .at(-1)
    .declaredEntries.push({ levelId: "g1", verifyStatus: "UNVERIFIED" });
  assert.equal(scoreApplication(assessment, items, "official").total, 150);
});
test("UNVERIFIED tính declared và giữ cờ để chặn quyết định ở service", () => {
  const items = assessmentItems();
  items[0].verifyStatus = "UNVERIFIED";
  const result = scoreApplication(assessment, items, "official");
  assert.equal(result.total, 190);
  assert.equal(result.rows[0].verifyStatus, "UNVERIFIED");
});
test("Chấm điểm không sửa snapshot hoặc item", () => {
  const items = assessmentItems(),
    before = structuredClone(items),
    snapshot = structuredClone(assessment);
  scoreApplication(snapshot, items, "official");
  assert.deepEqual(items, before);
  assert.deepEqual(snapshot, assessment);
});

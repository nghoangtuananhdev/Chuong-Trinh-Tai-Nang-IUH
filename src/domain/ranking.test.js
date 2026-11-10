import { test } from "node:test";
import assert from "node:assert/strict";
import { buildAdmissionList, validateTieResolution } from "./ranking.js";
import { assessment, testApplication, testRound } from "./test-fixtures.js";
const rank = (
  apps,
  { quota = 2, mode = "MAINTAIN_THEN_FILL", first = false } = {},
) =>
  buildAdmissionList({
    round: testRound({ quota, rankingMode: mode }),
    snapshot: assessment,
    applications: apps,
    isFirstRound: first,
  });
const app = (id, gpa = 3.5, flow = "A", toeic = 600) =>
  testApplication(id, { c_gpa: gpa, c_ta: toeic }, { flow });
test("Đợt đầu tiên xếp chung dù lưu mode duy trì", () => {
  const r = rank([app("old", 3.2, "C"), app("new", 3.6)], {
    quota: 1,
    first: true,
  });
  assert.equal(r.rows[0].applicationId, "new");
  assert.equal(r.rows[0].proposed, true);
  assert.equal(r.rows[1].proposed, false);
});
for (const mode of ["MAINTAIN_THEN_FILL", "OPEN_COMPETITION"])
  for (const count of [1, 2, 3]) {
    test(`${mode}: ${count} hồ sơ so với quota 2`, () => {
      const result = rank(
        Array.from({ length: count }, (_, i) => app(`a${i}`, 3.6 - i * 0.1)),
        { mode },
      );
      assert.equal(
        result.rows.filter((r) => r.proposed).length,
        Math.min(2, count),
      );
    });
  }
test("Duy trì giữ SV cũ rồi lấp chỗ trống", () => {
  const r = rank([app("old", 3.2, "C"), app("new1", 3.6), app("new2", 3.5)]);
  assert.deepEqual(
    r.rows.filter((r) => r.proposed).map((r) => r.applicationId),
    ["old", "new1"],
  );
  assert.equal(r.slotsForNew, 1);
});
test("SV cũ vượt quota: cắt top quota và cảnh báo", () => {
  const r = rank(
    [app("a", 3.6, "C"), app("b", 3.5, "C"), app("c", 3.4, "C"), app("new", 4)],
    { quota: 2 },
  );
  assert.equal(r.rows.filter((r) => r.proposed).length, 2);
  assert.ok(r.warnings.includes("SV cũ vượt chỉ tiêu"));
  assert.equal(r.slotsForNew, 0);
});
test("Cạnh tranh sòng phẳng có thể loại SV cũ", () => {
  const r = rank([app("old", 3.2, "C"), app("new", 3.6)], {
    mode: "OPEN_COMPETITION",
    quota: 1,
  });
  assert.equal(r.rows.find((r) => r.applicationId === "old").proposed, false);
});
test("Bằng tổng phân định theo GPA rồi TOEIC", () => {
  assert.equal(
    rank([app("a", 3.5), app("b", 3.55)], { quota: 1 }).rows[0].applicationId,
    "b",
  );
  assert.equal(
    rank([app("a", 3.5, "A", 600), app("b", 3.5, "A", 650)], { quota: 1 })
      .rows[0].applicationId,
    "b",
  );
});
test("Đồng hạng ranh giới: tất cả proposed null; CNN phải chọn đúng suất", () => {
  const r = rank([app("a"), app("b")], { quota: 1 });
  assert.ok(r.rows.every((r) => r.proposed === null && r.tieGroup === "T1"));
  assert.throws(() => validateTieResolution(r, []), { code: "VALIDATION" });
  assert.throws(() => validateTieResolution(r, ["a", "b"]), {
    code: "VALIDATION",
  });
  assert.throws(() => validateTieResolution(r, ["a", "a"]), {
    code: "VALIDATION",
  });
  assert.throws(() => validateTieResolution(r, ["khong-ton-tai"]), {
    code: "VALIDATION",
  });
  assert.equal(validateTieResolution(r, ["a"]), true);
});
test("Đồng hạng trong quota không cần CNN chọn", () =>
  assert.ok(
    rank([app("a"), app("b")]).rows.every(
      (r) => r.proposed === true && r.tieGroup === null,
    ),
  ));
test("approved nhưng BB không đạt không vào danh sách; loại hồ sơ khác ĐXT", () => {
  const r = rank([
    testApplication("a", { c_rl: 80 }),
    testApplication("b", {}, { roundId: "other" }),
    testApplication("c", {}, { status: "pending" }),
  ]);
  assert.equal(r.rows.length, 0);
});

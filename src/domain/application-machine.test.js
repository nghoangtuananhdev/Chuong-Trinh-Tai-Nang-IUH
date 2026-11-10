import { test } from "node:test";
import assert from "node:assert/strict";
import { assertTransition, canTransition } from "./application-machine.js";
import { testRound, now } from "./test-fixtures.js";
const transition = (from, to, overrides = {}) =>
  assertTransition(from, to, {
    round: testRound({ status: "open" }),
    now,
    ...overrides,
  });
for (const [from, to] of [
  ["draft", "draft"],
  ["draft", "pending"],
  ["draft", "cancelled"],
  ["pending", "pending"],
  ["pending", "withdrawn"],
]) {
  test(`SV ${from} → ${to} khi open`, () => {
    transition(from, to);
    assert.throws(() => transition(from, to, { round: testRound() }), {
      code: "INVALID_STATE",
    });
  });
}
for (const actor of ["HEAD", "LECTURER"])
  for (const to of ["approved", "rejected", "needs_update"]) {
    test(`${actor} quyết định pending → ${to}`, () =>
      transition("pending", to, {
        actor,
        round: testRound(),
        note: "Lý do",
        dueAt: "2026-11-12T09:00:00+07:00",
      }));
  }
test("Hạn bổ sung > reviewEnd hoặc <=now bị chặn", () => {
  for (const dueAt of [now, "2026-11-21T00:00:00+07:00"])
    assert.throws(
      () =>
        transition("pending", "needs_update", {
          actor: "LECTURER",
          round: testRound(),
          note: "Yêu cầu",
          dueAt,
        }),
      { code: "VALIDATION" },
    );
});
test("NEEDS_UPDATE bổ sung trong hạn; đúng hạn còn cho nộp; quá hạn chặn", () => {
  transition("needs_update", "pending", { round: testRound(), dueAt: now });
  assert.throws(
    () =>
      transition("needs_update", "pending", {
        round: testRound(),
        dueAt: "2026-11-09T08:59:59+07:00",
      }),
    { code: "INVALID_STATE" },
  );
});
for (const from of ["approved", "rejected"])
  test(`Mở lại ${from} cần lý do và review`, () => {
    transition(from, "pending", {
      actor: "HEAD",
      round: testRound(),
      note: "Rà soát lại",
    });
    assert.throws(
      () => transition(from, "pending", { actor: "HEAD", round: testRound() }),
      { code: "VALIDATION" },
    );
  });
test("Hệ thống chỉ hủy nháp, hết hạn bổ sung, và công bố đúng giai đoạn", () => {
  transition("draft", "cancelled", { system: true, round: testRound() });
  transition("needs_update", "rejected", {
    system: true,
    round: testRound(),
    dueAt: "2026-11-08T00:00:00+07:00",
  });
  for (const to of ["confirmed", "not_admitted"])
    transition("approved", to, {
      system: true,
      round: testRound({ status: "approving" }),
    });
  assert.throws(() => transition("pending", "approved", { system: true }), {
    code: "INVALID_STATE",
  });
});
test("Mọi hồ sơ trong ĐXT đã published bất biến", () => {
  for (const from of [
    "draft",
    "pending",
    "approved",
    "rejected",
    "needs_update",
  ])
    for (const to of [
      "pending",
      "approved",
      "rejected",
      "withdrawn",
      "confirmed",
    ]) {
      assert.throws(
        () =>
          transition(from, to, {
            actor: "HEAD",
            round: testRound({ status: "published" }),
          }),
        { code: "INVALID_STATE" },
      );
    }
  assert.equal(canTransition("confirmed", "pending"), false);
});

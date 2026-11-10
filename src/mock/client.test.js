import { test } from "node:test";
import assert from "node:assert/strict";
import { createMockClient } from "./client.js";
import { buildSeedDb } from "./seed/index.js";
function make(options = {}) {
  let saved = 0,
    cleared = 0;
  const client = createMockClient({
    initialState: { db: buildSeedDb(), session: null },
    persist: async () => {
      saved++;
    },
    entropy: () => "test-entropy",
    seedFactory: buildSeedDb,
    onState: () => {},
    clearFiles: async () => {
      cleared++;
    },
    ...options,
  });
  return {
    client,
    get saved() {
      return saved;
    },
    get cleared() {
      return cleared;
    },
  };
}
test("Call queue: hai request đồng thời đều được lưu, không lost update", async () => {
  const m = make(),
    payload = {
      studentCode: "26019999",
      email: "khang.26019999@student.iuh.edu.vn",
      purpose: "REGISTER",
    };
  const result = await Promise.all([
    m.client.call("otp.request", payload),
    m.client.call("otp.request", payload),
  ]);
  assert.notEqual(result[0].challengeId, result[1].challengeId);
  assert.equal(m.client.getState().db.otpChallenges.length, 2);
  assert.equal(m.saved, 2);
});
test("Lỗi đăng nhập reject promise nhưng commit đếm sai; call tiếp theo vẫn chạy", async () => {
  const m = make();
  await assert.rejects(
    m.client.call("auth.login", { username: "GV001", password: "sai" }),
    { code: "AUTH_INVALID" },
  );
  assert.equal(
    m.client.getState().db.users.find((u) => u.username === "GV001")
      .failedLoginCount,
    1,
  );
  await m.client.call("auth.login", {
    username: "GV001",
    password: "demo1234",
  });
  assert.equal(m.client.getState().session.userId, "usr_gv001");
});
test("Quyền FORBIDDEN không persist hoặc thay state", async () => {
  const m = make(),
    before = structuredClone(m.client.getState());
  await assert.rejects(
    m.client.call("lists.publish", { listId: "seed_list_3" }),
    { code: "FORBIDDEN" },
  );
  assert.deepEqual(m.client.getState(), before);
  assert.equal(m.saved, 0);
});
test("Lỗi persistence không thông báo thành công, không đổi state memory", async () => {
  const m = make({
      persist: async () => {
        throw new Error("Hết dung lượng");
      },
    }),
    before = structuredClone(m.client.getState());
  await assert.rejects(
    m.client.call("auth.login", { username: "GV001", password: "demo1234" }),
    /Hết dung lượng/,
  );
  assert.deepEqual(m.client.getState(), before);
});
test("Reset thay db, hủy session và xóa file; tick clock thực sự mở R6", async () => {
  const m = make();
  await m.client.call("system.demoLogin", { userId: "usr_gv001" });
  await m.client.call("system.setClock", { now: "2026-11-15T00:00:00+07:00" });
  assert.equal(
    m.client.getState().db.rounds.find((r) => r.id === "DXT-2026-06").status,
    "open",
  );
  await m.client.call("system.resetDemo");
  assert.equal(m.cleared, 1);
  assert.equal(m.client.getState().session, null);
  assert.equal(
    m.client.getState().db.rounds.find((r) => r.id === "DXT-2026-06").status,
    "upcoming",
  );
});
test("Service chỉ đọc không ghi storage, trạng thái ngoài tab được dùng ở call sau", async () => {
  const m = make();
  const result = await m.client.call("public.listRounds");
  assert.ok(result.length);
  assert.equal(m.saved, 0);
  const next = structuredClone(m.client.getState());
  next.db.clock.now = "2026-11-15T00:00:00+07:00";
  m.client.replaceState(next);
  await m.client.call("system.tick");
  assert.equal(
    m.client.getState().db.rounds.find((r) => r.id === "DXT-2026-06").status,
    "open",
  );
});

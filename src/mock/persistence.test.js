import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DB_KEY,
  SESSION_KEY,
  loadDb,
  saveDb,
  loadSession,
  saveSession,
  resetDb,
} from "./persistence.js";
import { buildSeedDb } from "./seed/index.js";
const storage = () => {
  const data = new Map();
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => data.set(k, v),
    removeItem: (k) => data.delete(k),
  };
};
test("v3 key riêng biệt, không đọc/xóa dữ liệu v2; roundtrip db và session", () => {
  const s = storage();
  s.setItem("iuh_talent_v2_admissions", "giữ nguyên");
  const db = buildSeedDb();
  saveDb(db, s);
  assert.deepEqual(loadDb(buildSeedDb, s), db);
  const session = { userId: "usr_gv001", activeRoleId: "seed_role_6" };
  saveSession(session, s);
  assert.deepEqual(loadSession(s), session);
  saveSession(null, s);
  assert.equal(loadSession(s), null);
  assert.equal(s.getItem("iuh_talent_v2_admissions"), "giữ nguyên");
});
test("JSON hỏng/sai version/thiếu collection/giờ sai fallback seed không crash", () => {
  const s = storage();
  for (const raw of [
    "{",
    "null",
    '{"schemaVersion":2}',
    JSON.stringify({ ...buildSeedDb(), applications: null }),
    JSON.stringify({ ...buildSeedDb(), clock: { now: "sai" } }),
  ]) {
    s.setItem(DB_KEY, raw);
    assert.deepEqual(loadDb(buildSeedDb, s), buildSeedDb());
  }
  s.setItem(SESSION_KEY, "{");
  assert.equal(loadSession(s), null);
});
test("Storage không dùng được: đọc fallback, ghi báo lỗi rõ ràng", () => {
  const s = {
    getItem() {
      throw new Error("unavailable");
    },
    setItem() {
      throw new Error("quota");
    },
    removeItem() {
      throw new Error("quota");
    },
  };
  assert.deepEqual(loadDb(buildSeedDb, s), buildSeedDb());
  assert.equal(loadSession(s), null);
  assert.throws(() => saveDb(buildSeedDb(), s), /Không thể lưu dữ liệu/);
  assert.throws(() => saveSession(null, s), /Không thể lưu phiên/);
});
test("Reset db hủy session và giữ key v2", () => {
  const s = storage();
  s.setItem("iuh_talent_v2_admissions", "cũ");
  saveSession({ userId: "a", activeRoleId: "b" }, s);
  assert.deepEqual(resetDb(buildSeedDb, s), buildSeedDb());
  assert.equal(loadSession(s), null);
  assert.equal(s.getItem("iuh_talent_v2_admissions"), "cũ");
});

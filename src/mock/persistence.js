import { createEmptyDb, SCHEMA_VERSION } from "./schema.js";
export const DB_KEY = "iuh_talent_v3_db";
export const SESSION_KEY = "iuh_talent_v3_session";
function storageOrDefault(storage) {
  return storage ?? globalThis.localStorage;
}
export function loadDb(seedFactory, storage) {
  try {
    const db = JSON.parse(storageOrDefault(storage).getItem(DB_KEY));
    const collections = Object.entries(createEmptyDb())
      .filter(([, value]) => Array.isArray(value))
      .map(([key]) => key);
    if (
      db?.schemaVersion === SCHEMA_VERSION &&
      collections.every((key) => Array.isArray(db[key])) &&
      Number.isFinite(Date.parse(db.clock?.now)) &&
      db.config?.files?.allowedMime &&
      db.config?.otp &&
      db.config?.login &&
      db.config?.password &&
      db.config?.reminders?.draftHoursBefore &&
      db.config?.email &&
      db.counters
    )
      return db;
  } catch {
    /* Corrupt/unavailable storage falls back to isolated v3 seed. */
  }
  return seedFactory();
}
export function saveDb(db, storage) {
  try {
    storageOrDefault(storage).setItem(DB_KEY, JSON.stringify(db));
  } catch {
    throw new Error(
      "Không thể lưu dữ liệu. Vui lòng kiểm tra dung lượng lưu trữ của trình duyệt.",
    );
  }
}
export function loadSession(storage) {
  try {
    const s = JSON.parse(storageOrDefault(storage).getItem(SESSION_KEY));
    return s?.userId && s?.activeRoleId ? s : null;
  } catch {
    return null;
  }
}
export function saveSession(session, storage) {
  try {
    const target = storageOrDefault(storage);
    if (session) target.setItem(SESSION_KEY, JSON.stringify(session));
    else target.removeItem(SESSION_KEY);
  } catch {
    throw new Error("Không thể lưu phiên đăng nhập trên trình duyệt này.");
  }
}
export function resetDb(seedFactory, storage) {
  const db = seedFactory();
  saveDb(db, storage);
  saveSession(null, storage);
  return db;
}

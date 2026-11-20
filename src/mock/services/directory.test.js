import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSeedDb } from "../seed/index.js";
import { buildCtx } from "./_kernel.js";
import * as directory from "./directory.js";
import * as otp from "./otp.js";
import * as account from "./account.js";
import { classifyFlow } from "../../domain/flows.js";
import { eligibleClasses } from "../../domain/selectors.js";
const ctx = (db, username, role) => {
  const user = db.users.find((u) => u.username === username),
    assignment = db.userRoles.find(
      (r) => r.userId === user?.id && (!role || r.role === role),
    );
  return buildCtx(
    db,
    user ? { userId: user.id, activeRoleId: assignment?.id } : null,
    "test-entropy-987654321",
  );
};
const rows = [
  { studentCode: "26010101", fullName: "Nguyễn Văn An", dob: "15/01/2006" },
  { studentCode: "26010102", fullName: "Lê Thị Bình" },
  { studentCode: "123", fullName: "Sai MSSV" },
];
const payload = { majorId: "maj_ktpm", cohort: "K22", rows };
const head = (db) => ctx(db, "GV005", "HEAD");

test("CNN ngành KTPM nhập được; dòng lỗi không chặn dòng hợp lệ", () => {
  const db = buildSeedDb();
  const out = directory.importList(db, head(db), payload);
  assert.equal(out.result.created, 2);
  assert.equal(out.result.skipped, 1);
  assert.equal(out.result.errors[0].line, 4);
  assert.ok(out.db.auditLogs.some((a) => a.action === "STUDENT_LIST_IMPORTED"));
  const again = directory.importList(out.db, head(out.db), payload);
  assert.equal(again.result.created, 0);
  assert.equal(again.result.updated, 2);
  assert.equal(
    again.db.schoolDirectory.filter((s) => s.studentCode === "26010101").length,
    1,
  );
});
test("Vai trò khác hoặc CNN ngành khác bị FORBIDDEN", () => {
  const db = buildSeedDb();
  for (const c of [
    ctx(db, "GV005", "LECTURER"),
    ctx(db, "GV002", "HEAD"),
    ctx(db, "admin"),
  ])
    assert.throws(() => directory.importList(db, c, payload), {
      code: "FORBIDDEN",
    });
});
test("MSSV thuộc ngành khác bị báo lỗi và không bị ghi đè", () => {
  const db = buildSeedDb();
  const out = directory.importList(db, head(db), {
    ...payload,
    rows: [{ studentCode: "26900004", fullName: "Đổi tên" }],
  });
  assert.equal(out.result.skipped, 1);
  assert.notEqual(
    out.db.schoolDirectory.find((s) => s.studentCode === "26900004").fullName,
    "Đổi tên",
  );
});
test("Nhập → OTP → đăng ký → lớp phù hợp theo ngành + khóa", () => {
  let db = buildSeedDb();
  db = directory.importList(db, head(db), payload).db;
  const email = "26010101@student.iuh.edu.vn";
  const r = otp.request(db, ctx(db), {
    studentCode: "26010101",
    email,
    purpose: "REGISTER",
  });
  const code = r.db.otpChallenges.at(-1).codeHash.slice(6);
  const verified = otp.verify(r.db, ctx(r.db), {
    challengeId: r.result.challengeId,
    code,
  });
  const reg = account.registerStudent(verified.db, ctx(verified.db), {
    otpToken: verified.result.otpToken,
    password: "demo5678",
  });
  const profile = reg.db.studentProfiles.find((p) => p.studentCode === "26010101");
  assert.equal(profile.cohort, "K22");
  assert.deepEqual(
    eligibleClasses(reg.db, profile.userId).map((c) => c.id),
    ["cls_ktpm_22"],
  );
  const round = (id) => reg.db.rounds.find((x) => x.id === id);
  assert.equal(classifyFlow(reg.db, profile.userId, round("DXT-2026-01")).allowed, true);
  for (const x of reg.db.rounds.filter((x) => x.classId !== "cls_ktpm_22"))
    assert.equal(classifyFlow(reg.db, profile.userId, x).allowed, false, x.id);
});
test("MSSV không có trong danh sách ⇒ không có email OTP", () => {
  const db = buildSeedDb();
  const r = otp.request(db, ctx(db), {
    studentCode: "26011111",
    email: "26011111@student.iuh.edu.vn",
    purpose: "REGISTER",
  });
  assert.equal(r.db.emailOutbox.length, db.emailOutbox.length);
});
test("directory.remove chỉ xóa dòng chưa có tài khoản", () => {
  let db = buildSeedDb();
  assert.throws(
    () => directory.remove(db, head(db), { majorId: "maj_ktpm", studentCode: "26010011" }),
    { code: "INVALID_STATE" },
  );
  db = directory.remove(db, head(db), {
    majorId: "maj_ktpm",
    studentCode: "26018888",
  }).db;
  assert.ok(!db.schoolDirectory.some((s) => s.studentCode === "26018888"));
});
test("Seed: hồ sơ luồng A/B ở ĐXT open/upcoming đều của sinh viên phù hợp lớp", () => {
  const db = buildSeedDb();
  for (const app of db.applications) {
    const round = db.rounds.find((r) => r.id === app.roundId);
    if (!["open", "upcoming"].includes(round.status) || app.flow === "C")
      continue;
    assert.ok(
      eligibleClasses(db, app.studentUserId).some((c) => c.id === round.classId),
      `${app.studentCode} ${round.id}`,
    );
  }
});

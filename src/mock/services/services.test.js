import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSeedDb } from "../seed/index.js";
import { buildCtx } from "./_kernel.js";
import * as auth from "./auth.js";
import * as otp from "./otp.js";
import * as account from "./account.js";
import * as lists from "./lists.js";
import * as reviews from "./reviews.js";
import * as system from "./system.js";
import * as portal from "./publicPortal.js";
import { latestList } from "../../domain/selectors.js";
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
function getToken(
  source,
  studentCode = "26019999",
  email = "khang.26019999@student.iuh.edu.vn",
  purpose = "REGISTER",
) {
  const r = otp.request(source, ctx(source), { studentCode, email, purpose });
  const code = r.db.otpChallenges.at(-1).codeHash.slice(6);
  return otp.verify(r.db, ctx(r.db), {
    challengeId: r.result.challengeId,
    code,
  });
}
test("U2: email mạo danh trả cùng thông điệp và không giao OTP, không lộ TK", () => {
  const db = buildSeedDb();
  const fake = otp.request(db, ctx(db), {
    studentCode: "21094501",
    email: "hacker.21094501@student.iuh.edu.vn",
    purpose: "REGISTER",
  });
  const real = otp.request(db, ctx(db), {
    studentCode: "21094501",
    email: "21094501@student.iuh.edu.vn",
    purpose: "REGISTER",
  });
  assert.equal(fake.result.message, real.result.message);
  assert.equal(fake.db.emailOutbox.length, db.emailOutbox.length);
  assert.equal(real.db.emailOutbox.length, db.emailOutbox.length + 1);
  assert.ok(fake.result.challengeId);
});
test("OTP 3/15 phút/MSSV, kể cả yêu cầu giả; 10/giờ/IP", () => {
  let db = buildSeedDb();
  const payload = {
    studentCode: "26019999",
    email: "khang.26019999@student.iuh.edu.vn",
    purpose: "REGISTER",
  };
  for (let i = 0; i < 3; i++) db = otp.request(db, ctx(db), payload).db;
  assert.throws(() => otp.request(db, ctx(db), payload), {
    code: "RATE_LIMITED",
  });
  db.clock.now = "2026-11-09T09:15:00+07:00";
  assert.doesNotThrow(() => otp.request(db, ctx(db), payload));
  db = buildSeedDb();
  for (let i = 0; i < 10; i++)
    db = otp.request(db, ctx(db), {
      ...payload,
      studentCode: String(27000000 + i),
      email: `${27000000 + i}@student.iuh.edu.vn`,
    }).db;
  assert.throws(() => otp.request(db, ctx(db), payload), {
    code: "RATE_LIMITED",
  });
});
test("OTP sai ghi nhận số lần thử, hết hạn và không tái sử dụng được", () => {
  let db = buildSeedDb(),
    r = otp.request(db, ctx(db), {
      studentCode: "26019999",
      email: "khang.26019999@student.iuh.edu.vn",
      purpose: "REGISTER",
    });
  db = r.db;
  const challengeId = r.result.challengeId;
  for (let i = 1; i <= 5; i++) {
    r = otp.verify(db, ctx(db), { challengeId, code: "sai" });
    db = r.db;
    assert.equal(db.otpChallenges.at(-1).attempts, i);
    assert.equal(r.error.code, i === 5 ? "OTP_EXPIRED" : "OTP_INVALID");
  }
  assert.throws(() => otp.verify(db, ctx(db), { challengeId, code: "sai" }), {
    code: "OTP_EXPIRED",
  });
  const verified = getToken(buildSeedDb());
  assert.throws(
    () =>
      otp.verify(verified.db, ctx(verified.db), {
        challengeId: verified.db.otpChallenges.at(-1).id,
        code: verified.db.otpChallenges.at(-1).codeHash.slice(6),
      }),
    { code: "OTP_EXPIRED" },
  );
});
test("U1: đăng ký OTP tạo isKSTN=false, lấy dữ liệu danh bạ, tự đăng nhập", () => {
  const verified = getToken(buildSeedDb()),
    r = account.registerStudent(verified.db, ctx(verified.db), {
      otpToken: verified.result.otpToken,
      password: "demo5678",
      phone: "0900000000",
    });
  const user = r.db.users.find((u) => u.id === r.result.userId),
    profile = r.db.studentProfiles.find((p) => p.userId === user.id);
  assert.equal(user.fullName, "Phan Minh Khang");
  assert.equal(profile.isKSTN, false);
  assert.equal(r.effects.session.userId, user.id);
  assert.ok(r.db.auditLogs.some((a) => a.action === "STUDENT_REGISTERED"));
  assert.throws(
    () =>
      account.registerStudent(r.db, ctx(r.db), {
        otpToken: verified.result.otpToken,
        password: "demo5678",
      }),
    { code: "OTP_EXPIRED" },
  );
});
test("U3: chỉ sau OTP đúng mới báo MSSV đã có TK", () => {
  const verified = getToken(
    buildSeedDb(),
    "21094501",
    "21094501@student.iuh.edu.vn",
  );
  assert.throws(
    () =>
      account.registerStudent(verified.db, ctx(verified.db), {
        otpToken: verified.result.otpToken,
        password: "demo5678",
      }),
    { code: "CONFLICT" },
  );
});
test("Đăng nhập sai 5 lần khóa 15 phút theo clock, lỗi vẫn persist và audit", () => {
  let db = buildSeedDb(),
    r;
  for (let i = 1; i <= 5; i++) {
    r = auth.login(db, ctx(db), { username: "GV001", password: "sai" });
    db = r.db;
    assert.equal(r.error.code, i === 5 ? "ACCOUNT_LOCKED" : "AUTH_INVALID");
  }
  assert.throws(
    () => auth.login(db, ctx(db), { username: "GV001", password: "demo1234" }),
    { code: "ACCOUNT_LOCKED" },
  );
  db.clock.now = "2026-11-09T09:15:00+07:00";
  const ok = auth.login(db, ctx(db), {
    username: "ptdung@iuh.edu.vn",
    password: "demo1234",
  });
  assert.equal(
    ok.db.users.find((u) => u.username === "GV001").failedLoginCount,
    0,
  );
  assert.ok(ok.effects.session);
});
test("U7: được đăng nhập nhưng mustChangePassword chặn quyền cho tới đổi MK", () => {
  const db = buildSeedDb(),
    login = auth.login(db, ctx(db), {
      username: "GV009",
      password: "demo1234",
    });
  const current = buildCtx(login.db, login.effects.session, "test");
  assert.throws(
    () =>
      auth.switchRole(login.db, current, {
        roleId: current.actor.roleAssignment.id,
      }),
    { code: "FORBIDDEN" },
  );
  const changed = auth.changePassword(login.db, current, {
    oldPassword: "demo1234",
    newPassword: "changed123",
  });
  assert.equal(
    changed.db.users.find((u) => u.username === "GV009").mustChangePassword,
    false,
  );
});
test("Đổi vai trò chỉ role của chính user còn hiệu lực", () => {
  const db = buildSeedDb();
  const lecturer = db.userRoles.find(
    (r) => r.userId === "usr_gv005" && r.role === "LECTURER",
  );
  assert.equal(
    auth.switchRole(db, ctx(db, "GV005"), { roleId: lecturer.id }).effects
      .session.activeRoleId,
    lecturer.id,
  );
  assert.throws(
    () => auth.switchRole(db, ctx(db, "GV001"), { roleId: lecturer.id }),
    { code: "FORBIDDEN" },
  );
});
test("U10: CNN ngành HTTT quyết định hồ sơ KTPM → FORBIDDEN, db bất biến", () => {
  const db = buildSeedDb(),
    before = structuredClone(db),
    applicationId = db.applications.find((a) => a.roundId === "DXT-2026-02").id;
  assert.throws(
    () =>
      reviews.decide(db, ctx(db, "GV002"), {
        applicationId,
        decision: "REJECTED",
        note: "Thử ngoài phạm vi",
      }),
    { code: "FORBIDDEN" },
  );
  assert.deepEqual(db, before);
});
test("Xác minh đủ mới được Đạt, sửa giá trị bắt buộc lý do, hạn bổ sung ≤ reviewEnd", () => {
  let db = buildSeedDb();
  const app = db.applications.find(
    (a) => a.roundId === "DXT-2026-02" && a.studentCode === "21094518",
  );
  assert.throws(
    () =>
      reviews.decide(db, ctx(db, "GV001"), {
        applicationId: app.id,
        decision: "APPROVED",
      }),
    { code: "VALIDATION" },
  );
  assert.throws(
    () =>
      reviews.verifyItem(db, ctx(db, "GV001"), {
        applicationId: app.id,
        criterionId: "c_gpa",
        verifyStatus: "VALID",
        verifiedValue: 3.3,
      }),
    { code: "VALIDATION" },
  );
  assert.throws(
    () =>
      reviews.decide(db, ctx(db, "GV001"), {
        applicationId: app.id,
        decision: "NEEDS_UPDATE",
        note: "Bổ sung",
        dueAt: "2026-11-21T00:00:00+07:00",
      }),
    { code: "VALIDATION" },
  );
  for (const item of app.items) {
    for (const entry of item.declaredEntries)
      db = reviews.verifyItem(db, ctx(db, "GV001"), {
        applicationId: app.id,
        criterionId: item.criterionId,
        entryId: entry.id,
        verifyStatus: "VALID",
      }).db;
    db = reviews.verifyItem(db, ctx(db, "GV001"), {
      applicationId: app.id,
      criterionId: item.criterionId,
      verifyStatus: "VALID",
    }).db;
  }
  const result = reviews.decide(db, ctx(db, "GV001"), {
    applicationId: app.id,
    decision: "APPROVED",
  });
  assert.equal(result.result.status, "approved");
});
test("U5: trả về R4, chốt v3, chuỗi bắt đầu lại CNN, bản v2 không còn được duyệt", () => {
  let db = buildSeedDb();
  const oldList = latestList(db, "DXT-2026-04");
  db = lists.returnList(db, ctx(db, "GV004"), {
    listId: oldList.id,
    level: "DEAN",
    reason: "Rà soát lại",
  }).db;
  assert.equal(db.rounds.find((r) => r.id === "DXT-2026-04").status, "review");
  const close = lists.closeReview(db, ctx(db, "GV002"), {
    roundId: "DXT-2026-04",
  });
  db = close.db;
  assert.equal(close.result.version, 3);
  assert.equal(
    db.rounds.find((r) => r.id === "DXT-2026-04").approvalSubstatus,
    "waiting_head",
  );
  assert.throws(
    () =>
      lists.approve(db, ctx(db, "GV004"), {
        listId: close.result.id,
        level: "DEAN",
      }),
    { code: "INVALID_STATE" },
  );
  assert.throws(
    () =>
      lists.approve(db, ctx(db, "GV002"), {
        listId: oldList.id,
        level: "HEAD",
      }),
    { code: "INVALID_STATE" },
  );
});
test("U14: R3 CNN chọn đúng 1 hồ sơ đồng hạng mới xác nhận được", () => {
  const db = buildSeedDb(),
    list = latestList(db, "DXT-2026-03");
  assert.throws(
    () =>
      lists.approve(db, ctx(db, "GV005"), { listId: list.id, level: "HEAD" }),
    { code: "VALIDATION" },
  );
  const id = list.payload.rows.find((r) => r.tieGroup).applicationId;
  const result = lists.approve(db, ctx(db, "GV005"), {
    listId: list.id,
    level: "HEAD",
    tieResolution: { selectedApplicationIds: [id] },
  });
  assert.equal(
    result.db.rounds.find((r) => r.id === list.roundId).approvalSubstatus,
    "waiting_dean",
  );
  assert.deepEqual(result.result.tieResolution.selectedApplicationIds, [id]);
});
test("U6/U9: R5 publish atomic, ACTIVE/DROPPED và kết quả công khai che dữ liệu", () => {
  const db = buildSeedDb(),
    list = latestList(db, "DXT-2026-05"),
    r = lists.publish(db, ctx(db, "GV900"), { listId: list.id });
  assert.equal(r.result.confirmed, 3);
  assert.equal(r.result.dropped, 1);
  assert.equal(
    r.db.studentProfiles.find((p) => p.studentCode === "26900010").isKSTN,
    false,
  );
  const masked = portal.results(r.db, ctx(r.db), {
    roundId: list.roundId,
  }).result;
  assert.equal(masked.length, 3);
  assert.ok(
    masked.every(
      (row) => row.studentCode.includes("****") && row.name.includes("."),
    ),
  );
  assert.throws(
    () => lists.publish(r.db, ctx(r.db, "GV900"), { listId: list.id }),
    { code: "INVALID_STATE" },
  );
  const broken = structuredClone(db);
  broken.users = broken.users.filter((u) => u.username !== "26900008");
  const before = structuredClone(broken);
  assert.throws(
    () => lists.publish(broken, ctx(broken, "GV900"), { listId: list.id }),
    { code: "NOT_FOUND" },
  );
  assert.deepEqual(broken, before);
});
test("P2: tua giờ mở R6/snapshot, quá hạn Bảo, reset + demoLogin có audit Demo", () => {
  const db = buildSeedDb();
  const opened = system.setClock(db, ctx(db), {
    now: "2026-11-15T00:00:00+07:00",
  });
  assert.equal(
    opened.db.rounds.find((r) => r.id === "DXT-2026-06").status,
    "open",
  );
  assert.ok(
    opened.db.rounds.find((r) => r.id === "DXT-2026-06").criteriaSnapshot,
  );
  const expired = system.setClock(db, ctx(db), {
    now: "2026-11-12T09:01:00+07:00",
  });
  assert.equal(
    expired.db.applications.find(
      (a) => a.studentCode === "21094602" && a.roundId === "DXT-2026-02",
    ).status,
    "rejected",
  );
  const reset = system.resetDemo(expired.db, {
    ...ctx(expired.db),
    seedDb: buildSeedDb(),
  });
  assert.equal(reset.db.clock.now, db.clock.now);
  assert.equal(reset.effects.clearEvidence, true);
  assert.equal(reset.db.auditLogs.at(-1).actorName, "Demo");
});
test("Khôi phục MK: phản hồi chung, token một lần, hết hạn, không ghi password vào audit", () => {
  const db = buildSeedDb(),
    requested = auth.forgotPassword(db, ctx(db), { username: "GV001" });
  assert.equal(
    requested.result.message,
    auth.forgotPassword(db, ctx(db), { username: "missing" }).result.message,
  );
  const token = requested.db.resetTokens.at(-1).token,
    changed = auth.resetPassword(requested.db, ctx(requested.db), {
      token,
      newPassword: "newpass5678",
    });
  assert.throws(
    () =>
      auth.resetPassword(changed.db, ctx(changed.db), {
        token,
        newPassword: "again5678",
      }),
    { code: "AUTH_INVALID" },
  );
  assert.ok(!JSON.stringify(changed.db.auditLogs).includes("newpass5678"));
});

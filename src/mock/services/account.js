import { timestamp } from "../../domain/time.js";
import {
  defineService,
  requireValue,
  nextId,
  audit,
  assertPassword,
} from "./_kernel.js";
export const registerStudent = defineService("account.registerStudent", {
  handler(db, ctx, { otpToken, password, phone = "" }) {
    const token = db.otpTokens.find(
      (t) =>
        t.token === otpToken &&
        t.purpose === "REGISTER" &&
        !t.usedAt &&
        timestamp(t.expiresAt) > timestamp(ctx.now),
    );
    requireValue(
      token,
      "OTP_EXPIRED",
      "Phiên xác thực đã hết hạn. Vui lòng xác thực lại email.",
    );
    requireValue(
      !db.studentProfiles.some((p) => p.studentCode === token.studentCode),
      "CONFLICT",
      "MSSV đã có tài khoản – vui lòng đăng nhập hoặc khôi phục mật khẩu.",
    );
    const entry = db.schoolDirectory.find(
      (d) =>
        d.studentCode === token.studentCode &&
        d.email.toLowerCase() === token.email,
    );
    requireValue(
      entry,
      "OTP_INVALID",
      "Thông tin xác thực không khớp danh bạ IUH.",
    );
    assertPassword(db, password);
    const id = nextId(db, "usr");
    const user = {
      id,
      kind: "STUDENT",
      username: entry.studentCode,
      fullName: entry.fullName,
      email: entry.email,
      phone,
      passwordHash: `plain:${password}`,
      status: "ACTIVE",
      mustChangePassword: false,
      failedLoginCount: 0,
      lockedUntil: null,
      createdAt: ctx.now,
    };
    db.users.push(user);
    db.studentProfiles.push({
      userId: id,
      studentCode: entry.studentCode,
      dob: entry.dob,
      homeClass: entry.homeClass,
      majorId: entry.majorId,
      isKSTN: false,
    });
    const role = {
      id: nextId(db, "role"),
      userId: id,
      role: "STUDENT",
      scopeType: "SELF",
      scopeId: null,
      validFrom: ctx.now,
      validTo: null,
      grantedBy: null,
      revokedAt: null,
    };
    db.userRoles.push(role);
    token.usedAt = ctx.now;
    audit(
      db,
      { ...ctx, actor: { user, roleAssignment: role } },
      {
        action: "STUDENT_REGISTERED",
        entity: "user",
        entityId: id,
        after: { username: user.username, isKSTN: false },
      },
    );
    return {
      result: { userId: id },
      effects: { session: { userId: id, activeRoleId: role.id } },
    };
  },
});

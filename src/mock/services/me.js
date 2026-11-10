import { timestamp } from "../../domain/time.js";
import { isIuhStudentEmail } from "../../domain/identity.js";
import {
  defineService,
  authenticated,
  requireValue,
  audit,
} from "./_kernel.js";
export const update = defineService("me.update", {
  handler(db, ctx, p) {
    const actor = authenticated(ctx),
      user = db.users.find((u) => u.id === actor.id),
      before = { phone: user.phone, email: user.email };
    if (p.newEmail && p.newEmail !== user.email) {
      const profile = db.studentProfiles.find((s) => s.userId === user.id);
      const token = db.otpTokens.find(
        (t) =>
          t.token === p.otpToken &&
          t.purpose === "CHANGE_EMAIL" &&
          !t.usedAt &&
          timestamp(t.expiresAt) > timestamp(ctx.now) &&
          t.email === p.newEmail.toLowerCase() &&
          t.studentCode === profile?.studentCode,
      );
      requireValue(
        token && isIuhStudentEmail(profile?.studentCode, p.newEmail),
        "OTP_INVALID",
        "Vui lòng xác thực email IUH mới bằng OTP.",
      );
      requireValue(
        !db.users.some(
          (u) =>
            u.id !== user.id &&
            u.email.toLowerCase() === token.email.toLowerCase(),
        ),
        "CONFLICT",
        "Email đã được tài khoản khác sử dụng.",
      );
      token.usedAt = ctx.now;
      user.email = token.email;
    }
    if (p.phone !== undefined) user.phone = String(p.phone);
    audit(db, ctx, {
      action: "PROFILE_UPDATED",
      entity: "user",
      entityId: user.id,
      before,
      after: { phone: user.phone, email: user.email },
    });
    return { result: { phone: user.phone, email: user.email } };
  },
});
export const markRead = defineService("me.markRead", {
  handler(db, ctx, p) {
    const user = authenticated(ctx);
    const entries = db.notifications.filter(
      (n) => n.userId === user.id && (!p.id || n.id === p.id),
    );
    entries.forEach((n) => {
      n.readAt = ctx.now;
    });
    audit(db, ctx, {
      action: "NOTIFICATION_READ",
      entity: "notification",
      entityId: p.id ?? user.id,
      after: { count: entries.length },
    });
    return { result: entries.length };
  },
});

export const get = defineService("me.get", {
  readOnly: true,
  handler(db, ctx) {
    const user = authenticated(ctx, { allowPasswordChange: true });
    return {
      result: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      },
    };
  },
});

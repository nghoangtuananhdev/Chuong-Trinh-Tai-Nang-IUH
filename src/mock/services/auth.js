import { isRoleEffective } from "../../domain/permissions.js";
import { timestamp, addMinutes, formatIct } from "../../domain/time.js";
import {
  defineService,
  requireValue,
  audit,
  queueEmail,
  committedFailure,
  authenticated,
  secret,
  assertPassword,
} from "./_kernel.js";
const findUser = (db, username) =>
  db.users.find((u) =>
    [u.username.toLowerCase(), u.email.toLowerCase()].includes(
      String(username).trim().toLowerCase(),
    ),
  );
export const login = defineService("auth.login", {
  handler(db, ctx, { username, password }) {
    const user = findUser(db, username);
    requireValue(
      user,
      "AUTH_INVALID",
      "Tên đăng nhập hoặc mật khẩu chưa đúng.",
    );
    requireValue(
      user.status === "ACTIVE" &&
        (!user.lockedUntil ||
          timestamp(ctx.now) >= timestamp(user.lockedUntil)),
      "ACCOUNT_LOCKED",
      user.lockedUntil
        ? `Tài khoản tạm khóa đến ${formatIct(user.lockedUntil)}.`
        : "Tài khoản đã bị khóa.",
    );
    if (user.lockedUntil) {
      user.failedLoginCount = 0;
      user.lockedUntil = null;
    }
    if (user.passwordHash !== `plain:${password}`) {
      const before = {
        failedLoginCount: user.failedLoginCount,
        lockedUntil: user.lockedUntil,
      };
      user.failedLoginCount++;
      const locked = user.failedLoginCount >= ctx.config.login.maxFailures;
      if (locked)
        user.lockedUntil = addMinutes(ctx.now, ctx.config.login.lockMinutes);
      audit(db, ctx, {
        action: locked ? "ACCOUNT_LOCKED" : "LOGIN_FAILED",
        entity: "user",
        entityId: user.id,
        before,
        after: {
          failedLoginCount: user.failedLoginCount,
          lockedUntil: user.lockedUntil,
        },
      });
      committedFailure(
        locked ? "ACCOUNT_LOCKED" : "AUTH_INVALID",
        locked
          ? `Tài khoản tạm khóa đến ${formatIct(user.lockedUntil)}.`
          : `Tên đăng nhập hoặc mật khẩu chưa đúng. Còn ${ctx.config.login.maxFailures - user.failedLoginCount} lần thử trước khi tài khoản bị tạm khóa 15 phút.`,
      );
    }
    const role = db.userRoles.find(
      (r) => r.userId === user.id && isRoleEffective(r, ctx.now),
    );
    requireValue(role, "FORBIDDEN", "Tài khoản chưa có vai trò đang hiệu lực.");
    user.failedLoginCount = 0;
    user.lockedUntil = null;
    audit(
      db,
      { ...ctx, actor: { user, roleAssignment: role } },
      {
        action: "LOGIN",
        entity: "user",
        entityId: user.id,
        after: { activeRoleId: role.id },
      },
    );
    return {
      result: { userId: user.id },
      effects: { session: { userId: user.id, activeRoleId: role.id } },
    };
  },
});
export const logout = defineService("auth.logout", {
  handler(db, ctx) {
    audit(db, ctx, {
      action: "LOGOUT",
      entity: "session",
      entityId: ctx.actor?.user.id,
    });
    return { effects: { session: null } };
  },
});
export const switchRole = defineService("auth.switchRole", {
  handler(db, ctx, { roleId }) {
    const user = authenticated(ctx);
    const role = db.userRoles.find(
      (r) =>
        r.id === roleId && r.userId === user.id && isRoleEffective(r, ctx.now),
    );
    requireValue(
      role,
      "FORBIDDEN",
      "Vai trò không thuộc tài khoản hoặc đã hết hiệu lực.",
    );
    audit(db, ctx, {
      action: "ROLE_SWITCHED",
      entity: "session",
      entityId: user.id,
      before: ctx.session,
      after: { activeRoleId: roleId },
    });
    return { effects: { session: { userId: user.id, activeRoleId: roleId } } };
  },
});
export const forgotPassword = defineService("auth.forgotPassword", {
  handler(db, ctx, { username }) {
    const user = findUser(db, username);
    if (user) {
      const token = secret(db, ctx, "reset");
      db.resetTokens.push({
        token,
        userId: user.id,
        expiresAt: addMinutes(ctx.now, ctx.config.resetLinkMinutes),
        usedAt: null,
      });
      queueEmail(db, ctx, {
        to: user.email,
        template: "PASSWORD_RESET_LINK",
        vars: {
          link: `#/dat-lai-mat-khau?token=${encodeURIComponent(token)}`,
          ttl: ctx.config.resetLinkMinutes,
        },
        relatedEntity: user.id,
      });
      audit(db, ctx, {
        action: "PASSWORD_RESET_REQUESTED",
        entity: "user",
        entityId: user.id,
      });
    }
    return {
      result: {
        message:
          "Nếu thông tin hợp lệ, hướng dẫn đặt lại mật khẩu đã được gửi tới email của bạn.",
      },
    };
  },
});
export const resetPassword = defineService("auth.resetPassword", {
  handler(db, ctx, { token, newPassword }) {
    const row = db.resetTokens.find(
      (t) =>
        t.token === token &&
        !t.usedAt &&
        timestamp(t.expiresAt) > timestamp(ctx.now),
    );
    requireValue(
      row,
      "AUTH_INVALID",
      "Liên kết đã hết hạn hoặc đã được sử dụng.",
    );
    assertPassword(db, newPassword);
    const user = db.users.find((u) => u.id === row.userId);
    user.passwordHash = `plain:${newPassword}`;
    user.mustChangePassword = false;
    user.failedLoginCount = 0;
    user.lockedUntil = null;
    row.usedAt = ctx.now;
    audit(db, ctx, {
      action: "PASSWORD_RESET",
      entity: "user",
      entityId: user.id,
      after: { mustChangePassword: false },
    });
    return {
      result: { message: "Đã đặt lại mật khẩu." },
      effects: { session: null },
    };
  },
});
export const changePassword = defineService("auth.changePassword", {
  handler(db, ctx, { oldPassword, newPassword }) {
    const actor = authenticated(ctx, { allowPasswordChange: true });
    const user = db.users.find((u) => u.id === actor.id);
    requireValue(
      user.passwordHash === `plain:${oldPassword}`,
      "AUTH_INVALID",
      "Mật khẩu hiện tại chưa đúng.",
    );
    assertPassword(db, newPassword);
    const before = { mustChangePassword: user.mustChangePassword };
    user.passwordHash = `plain:${newPassword}`;
    user.mustChangePassword = false;
    audit(db, ctx, {
      action: "PASSWORD_CHANGED",
      entity: "user",
      entityId: user.id,
      before,
      after: { mustChangePassword: false },
    });
    return { result: { message: "Đã đổi mật khẩu." } };
  },
});

import { checkPasswordPolicy } from "../../domain/identity.js";
import { DomainError, fail, requireValue } from "../../domain/errors.js";
import { assertCan, isRoleEffective } from "../../domain/permissions.js";
import {
  audit,
  notify,
  queueEmail,
  nextId,
  applicationHistory,
} from "../../domain/events.js";
export {
  fail,
  requireValue,
  audit,
  notify,
  queueEmail,
  nextId,
  applicationHistory,
};
export function buildCtx(db, session, entropy = "") {
  const user = db.users.find((u) => u.id === session?.userId);
  const assignment = db.userRoles.find(
    (r) => r.id === session?.activeRoleId && r.userId === user?.id,
  );
  return {
    db,
    session,
    now: db.clock.now,
    config: db.config,
    entropy,
    actor:
      user &&
      assignment &&
      user.status === "ACTIVE" &&
      isRoleEffective(assignment, db.clock.now)
        ? { user, roleAssignment: assignment }
        : null,
  };
}
export function authenticated(ctx, { allowPasswordChange = false } = {}) {
  requireValue(ctx.actor, "AUTH_INVALID", "Vui lòng đăng nhập để tiếp tục.");
  requireValue(
    allowPasswordChange || !ctx.actor.user.mustChangePassword,
    "FORBIDDEN",
    "Vui lòng đổi mật khẩu để tiếp tục.",
  );
  return ctx.actor.user;
}
export function defineService(
  name,
  { permission, resolve, handler, readOnly = false },
) {
  const service = (db, ctx, payload = {}) => {
    const scope = resolve?.(db, payload, ctx);
    if (permission)
      assertCan(
        { ...ctx, db },
        typeof permission === "function" ? permission(db, payload) : permission,
        scope,
      );
    const draft = structuredClone(db);
    try {
      const output =
        handler(draft, { ...ctx, db: draft, config: draft.config }, payload) ??
        {};
      return { db: draft, ...output };
    } catch (error) {
      // Login/OTP failed attempts must persist even though the UI receives an error.
      if (error instanceof DomainError && error.commitFailure)
        return { db: draft, error };
      throw error;
    }
  };
  service.serviceName = name;
  service.readOnly = readOnly;
  return service;
}
export function committedFailure(code, message, details) {
  const error = new DomainError(code, message, details);
  error.commitFailure = true;
  throw error;
}
export function find(db, collection, id) {
  const row = db[collection].find((item) => item.id === id);
  requireValue(row, "NOT_FOUND", "Không tìm thấy dữ liệu được yêu cầu.");
  return row;
}
export function secret(db, ctx, prefix = "token") {
  requireValue(
    ctx.entropy,
    "VALIDATION",
    "Không tạo được mã ngẫu nhiên cho phiên mô phỏng. Vui lòng thử lại.",
  );
  return `${nextId(db, prefix)}_${ctx.entropy}`;
}
export function assertPassword(db, password) {
  const errors = checkPasswordPolicy(password, db.config.password.minLength);
  requireValue(!errors.length, "PASSWORD_POLICY", errors.join(" "), {
    field: "newPassword",
  });
}

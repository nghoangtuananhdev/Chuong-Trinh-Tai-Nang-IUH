import { tick as schedulerTick } from "../../domain/scheduler.js";
import { toIct } from "../../domain/time.js";
import { isRoleEffective } from "../../domain/permissions.js";
import { defineService, audit, requireValue, find } from "./_kernel.js";
export const tick = defineService("system.tick", {
  handler(db, ctx) {
    const outcome = schedulerTick(db, ctx.now);
    Object.assign(db, outcome.db);
    return { result: { changes: outcome.events.length } };
  },
});
export const setClock = defineService("system.setClock", {
  handler(db, ctx, { now }) {
    const value = toIct(now),
      before = db.clock.now;
    db.clock.now = value;
    audit(
      db,
      { ...ctx, now: value, actor: { user: { id: null, fullName: "Demo" } } },
      {
        action: "DEMO_CLOCK_SET",
        entity: "clock",
        entityId: "clock",
        before,
        after: value,
      },
    );
    const outcome = schedulerTick(db, value);
    Object.assign(db, outcome.db);
    return { result: { changes: outcome.events.length } };
  },
});
export const demoLogin = defineService("system.demoLogin", {
  handler(db, ctx, { userId }) {
    const user = find(db, "users", userId),
      role = db.userRoles.find(
        (r) => r.userId === userId && isRoleEffective(r, ctx.now),
      );
    requireValue(
      user.status === "ACTIVE" && role,
      "ACCOUNT_LOCKED",
      "Không thể đăng nhập tài khoản bị khóa hoặc hết vai trò.",
    );
    audit(
      db,
      { ...ctx, actor: { user: { id: null, fullName: "Demo" } } },
      {
        action: "DEMO_LOGIN",
        entity: "user",
        entityId: userId,
        after: { activeRoleId: role.id },
      },
    );
    return {
      result: { userId },
      effects: { session: { userId, activeRoleId: role.id } },
    };
  },
});
export const resetDemo = defineService("system.resetDemo", {
  handler(db, ctx) {
    requireValue(
      ctx.seedDb?.schemaVersion === 3,
      "VALIDATION",
      "Không có dữ liệu mẫu hợp lệ.",
    );
    Object.assign(db, structuredClone(ctx.seedDb));
    audit(
      db,
      {
        ...ctx,
        now: db.clock.now,
        actor: { user: { id: null, fullName: "Demo" } },
      },
      {
        action: "DEMO_RESET",
        entity: "system",
        entityId: "db",
        after: { schemaVersion: db.schemaVersion },
      },
    );
    return {
      effects: { session: null, clearEvidence: true },
      result: { message: "Đã khôi phục dữ liệu mẫu." },
    };
  },
});

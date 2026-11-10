import { ROLE_LABEL } from "./constants.js";
import { formatIct } from "./time.js";
// Pure event writers shared by scheduled tasks and the mock-service kernel.
export function nextId(db, prefix) {
  db.counters ??= {};
  let counter = Number.isInteger(db.counters[prefix]) ? db.counters[prefix] : 0;
  let id;
  do {
    id = `${prefix}_${++counter}`;
  } while (
    Object.values(db).some(
      (rows) => Array.isArray(rows) && rows.some((row) => row?.id === id),
    )
  );
  db.counters[prefix] = counter;
  return id;
}
export function audit(db, ctx, event) {
  const entry = {
    id: nextId(db, "audit"),
    actorId: ctx.actor?.user?.id ?? null,
    actorName: ctx.actor?.user?.fullName ?? "Hệ thống",
    actorRole: ctx.actor?.roleAssignment?.role ?? null,
    before: null,
    after: null,
    reason: "",
    ...structuredClone(event),
    ip: "127.0.0.1",
    at: ctx.now,
  };
  db.auditLogs.push(entry);
  return entry;
}
export function notify(db, ctx, userIds, event) {
  for (const userId of new Set(userIds.filter(Boolean))) {
    db.notifications.push({
      id: nextId(db, "notification"),
      userId,
      ...event,
      createdAt: ctx.now,
      readAt: null,
    });
  }
}
export function queueEmail(
  db,
  ctx,
  { to, template, vars = {}, relatedEntity = null },
) {
  const definition = db.config.templates?.[template] ?? {
    subject: template,
    body: "{{message}}",
  };
  const render = (text) =>
    String(text).replace(/{{(\w+)}}/g, (_, key) => {
      const value = String(vars[key] ?? "");
      // Mốc thời gian ISO được đổi sang dạng dễ đọc theo giờ Việt Nam.
      return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)
        ? formatIct(value)
        : value;
    });
  db.emailOutbox.push({
    id: nextId(db, "email"),
    to,
    template,
    subject: render(definition.subject),
    body: render(definition.body),
    status: "QUEUED",
    attempts: 0,
    lastError: null,
    createdAt: ctx.now,
    sentAt: null,
    relatedEntity,
  });
}
export function applicationHistory(db, ctx, application, action, note = "") {
  application.history ??= [];
  application.history.push({
    at: ctx.now,
    actorId: ctx.actor?.user?.id ?? null,
    actorName: ctx.actor?.user?.fullName ?? "Hệ thống",
    actorRoleLabel:
      ROLE_LABEL[ctx.actor?.roleAssignment?.role] ??
      ctx.actor?.roleAssignment?.role ??
      "Hệ thống",
    action,
    note,
  });
}

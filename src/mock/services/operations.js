import { can, assertCan } from "../../domain/permissions.js";
import {
  defineService,
  authenticated,
  find,
  requireValue,
  audit,
  queueEmail,
} from "./_kernel.js";
const roundResource = (db, p) => ({ type: "round", id: p.roundId });
function summary(db, id) {
  const applications = db.applications.filter((a) => a.roundId === id);
  const histogram = {};
  applications
    .filter((a) => a.officialScore != null)
    .forEach((a) => {
      const bin = Math.floor(a.officialScore / 20) * 20;
      histogram[bin] = (histogram[bin] ?? 0) + 1;
    });
  return {
    total: applications.length,
    statusCounts: Object.fromEntries(
      [...new Set(applications.map((a) => a.status))].map((s) => [
        s,
        applications.filter((a) => a.status === s).length,
      ]),
    ),
    flowCounts: Object.fromEntries(
      ["A", "B", "C"].map((f) => [
        f,
        applications.filter((a) => a.flow === f).length,
      ]),
    ),
    histogram,
    confirmed: applications
      .filter((a) => a.status === "confirmed")
      .map((a) => ({
        id: a.id,
        studentCode: a.studentCode,
        name: a.applicantName,
        score: a.officialScore,
      })),
    quota: find(db, "rounds", id).quota,
  };
}
export const roundSummary = defineService("reports.roundSummary", {
  permission: "report.view",
  resolve: roundResource,
  readOnly: true,
  handler(db, ctx, p) {
    return { result: summary(db, p.roundId) };
  },
});
const csvCell = (value) => {
  let text = String(value ?? "");
  if (/^[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
};
export const exportRoundCsv = defineService("reports.exportRoundCsv", {
  permission: "report.view",
  resolve: roundResource,
  readOnly: true,
  handler(db, ctx, p) {
    const data = summary(db, p.roundId);
    return {
      result:
        "\uFEFF" +
        [
          ["MSSV", "Họ tên", "Điểm chính thức"],
          ...data.confirmed.map((r) => [r.studentCode, r.name, r.score]),
        ]
          .map((row) => row.map(csvCell).join(","))
          .join("\r\n"),
    };
  },
});
export const auditList = defineService("audit.list", {
  permission: "audit.view",
  readOnly: true,
  handler(db, ctx, p) {
    return {
      result: db.auditLogs
        .filter(
          (l) =>
            (!p.entity || l.entity === p.entity) &&
            (!p.entityId || l.entityId === p.entityId) &&
            (!p.actorId || l.actorId === p.actorId) &&
            (!p.action || l.action.includes(p.action)) &&
            (!p.from || l.at >= p.from) &&
            (!p.to || l.at <= p.to),
        )
        .slice()
        .reverse(),
    };
  },
});
export const emailList = defineService("email.list", {
  readOnly: true,
  handler(db, ctx, p) {
    authenticated(ctx);
    assertCan(ctx, "email.resend");
    return {
      result: db.emailOutbox
        .filter(
          (e) =>
            (ctx.actor.roleAssignment.role === "ADMIN" ||
              e.status === "FAILED") &&
            (!p.roundId || e.relatedEntity === p.roundId),
        )
        .slice()
        .reverse(),
    };
  },
});
export const emailResend = defineService("email.resend", {
  permission: "email.resend",
  handler(db, ctx, p) {
    const email = find(db, "emailOutbox", p.id);
    requireValue(
      email.status === "FAILED",
      "INVALID_STATE",
      "Chỉ gửi lại email ở trạng thái gửi lỗi.",
    );
    const before = structuredClone(email);
    Object.assign(email, {
      status: "QUEUED",
      attempts: 0,
      lastAttemptAt: null,
      lastError: null,
    });
    audit(db, ctx, {
      action: "EMAIL_RESENT",
      entity: "email",
      entityId: email.id,
      before,
      after: email,
    });
    return { result: email };
  },
});
export const getConfig = defineService("system.getConfig", {
  permission: "config.manage",
  readOnly: true,
  handler(db) {
    return { result: db.config };
  },
});
export const updateConfig = defineService("system.updateConfig", {
  permission: "config.manage",
  handler(db, ctx, p) {
    const before = structuredClone(db.config),
      changes = p.config ?? {};
    for (const key of [
      "files",
      "otp",
      "login",
      "password",
      "reminders",
      "email",
      "smtp",
      "templates",
    ])
      if (changes[key])
        db.config[key] = {
          ...db.config[key],
          ...structuredClone(changes[key]),
        };
    const c = db.config;
    requireValue(
      Number(c.files.maxMb) > 0 &&
        Number(c.files.maxMb) <= 10 &&
        Array.isArray(c.files.allowedMime) &&
        c.files.allowedMime.length > 0 &&
        c.files.allowedMime.every((m) =>
          ["application/pdf", "image/jpeg", "image/png"].includes(m),
        ),
      "VALIDATION",
      "Giới hạn tệp phải từ trên 0 đến 10 MB, chỉ PDF/JPG/PNG.",
    );
    for (const value of [
      c.otp.ttlMinutes,
      c.otp.maxAttempts,
      c.otp.maxPerStudent15m,
      c.otp.maxPerIpHour,
      c.login.maxFailures,
      c.login.lockMinutes,
      c.password.minLength,
      c.email.maxAttempts,
      c.reminders.approvalHoldDays,
    ])
      requireValue(
        Number.isInteger(Number(value)) && Number(value) > 0,
        "VALIDATION",
        "Các giới hạn xác thực, đăng nhập, email và nhắc việc phải là số nguyên dương.",
      );
    requireValue(
      Number(c.password.minLength) >= 8 && Number(c.otp.codeLength) === 6,
      "VALIDATION",
      "Mật khẩu tối thiểu 8 ký tự; OTP gồm đúng 6 chữ số.",
    );
    requireValue(
      Array.isArray(c.reminders.draftHoursBefore) &&
        c.reminders.draftHoursBefore.every(
          (v) => Number.isFinite(Number(v)) && Number(v) > 0,
        ),
      "VALIDATION",
      "Mốc nhắc nháp phải là số giờ dương.",
    );
    audit(db, ctx, {
      action: "CONFIG_CHANGED",
      entity: "config",
      entityId: "system",
      before,
      after: db.config,
    });
    return { result: db.config };
  },
});
export const testEmail = defineService("system.testEmail", {
  permission: "config.manage",
  handler(db, ctx, p) {
    requireValue(
      p.to?.includes("@"),
      "VALIDATION",
      "Vui lòng nhập email nhận thử.",
    );
    queueEmail(db, ctx, {
      to: p.to,
      template: "OTP_LOOKUP",
      vars: { code: "000000", ttl: db.config.otp.ttlMinutes },
      relatedEntity: "test",
    });
    audit(db, ctx, {
      action: "EMAIL_TEST_QUEUED",
      entity: "email",
      entityId: "test",
      after: { to: p.to },
    });
    return { result: true };
  },
});

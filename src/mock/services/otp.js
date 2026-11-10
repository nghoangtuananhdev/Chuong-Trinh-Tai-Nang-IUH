import { isIuhStudentEmail } from "../../domain/identity.js";
import { timestamp, addMinutes } from "../../domain/time.js";
import {
  defineService,
  requireValue,
  nextId,
  queueEmail,
  audit,
  secret,
  committedFailure,
  find,
} from "./_kernel.js";
export const GENERIC_OTP_MESSAGE =
  "Nếu thông tin hợp lệ, mã OTP đã được gửi tới email IUH của bạn.";
export const request = defineService("otp.request", {
  handler(db, ctx, { studentCode, email = "", purpose }) {
    requireValue(
      ["REGISTER", "LOOKUP", "CHANGE_EMAIL"].includes(purpose),
      "VALIDATION",
      "Mục đích xác thực không hợp lệ.",
    );
    email = email.trim().toLowerCase();
    requireValue(
      isIuhStudentEmail(studentCode, email),
      "VALIDATION",
      "Chỉ chấp nhận email sinh viên @student.iuh.edu.vn chứa đúng MSSV của bạn.",
      { field: "email" },
    );
    const recent = db.otpChallenges.filter(
      (c) =>
        timestamp(ctx.now) - timestamp(c.createdAt) < 3600000 &&
        timestamp(ctx.now) >= timestamp(c.createdAt),
    );
    requireValue(
      recent.filter(
        (c) =>
          c.studentCode === studentCode &&
          timestamp(ctx.now) - timestamp(c.createdAt) < 900000,
      ).length < ctx.config.otp.maxPerStudent15m &&
        recent.length < ctx.config.otp.maxPerIpHour,
      "RATE_LIMITED",
      "Bạn đã yêu cầu quá số mã cho phép. Vui lòng thử lại sau 15 phút.",
    );
    const entry = db.schoolDirectory.find(
      (s) => s.studentCode === studentCode && s.email.toLowerCase() === email,
    );
    const id = nextId(db, "otp");
    const raw = secret(db, ctx, "code");
    // Mock-only: codes are inspectable in the Demo inbox. Entropy supplied by provider.
    let number = 0;
    for (const c of raw) number = (number * 31 + c.charCodeAt(0)) % 1000000;
    const code = String(number).padStart(ctx.config.otp.codeLength, "0");
    db.otpChallenges.push({
      id,
      target: email,
      studentCode,
      purpose,
      codeHash: entry ? `plain:${code}` : null,
      expiresAt: addMinutes(ctx.now, ctx.config.otp.ttlMinutes),
      attempts: 0,
      consumedAt: null,
      createdAt: ctx.now,
      ip: "127.0.0.1",
    });
    if (entry)
      queueEmail(db, ctx, {
        to: email,
        template: {
          REGISTER: "OTP_REGISTER",
          LOOKUP: "OTP_LOOKUP",
          CHANGE_EMAIL: "OTP_CHANGE_EMAIL",
        }[purpose],
        vars: { code, ttl: ctx.config.otp.ttlMinutes },
        relatedEntity: id,
      });
    audit(db, ctx, {
      action: "OTP_REQUESTED",
      entity: "otp",
      entityId: id,
      after: { purpose },
    });
    return { result: { message: GENERIC_OTP_MESSAGE, challengeId: id } };
  },
});
export const verify = defineService("otp.verify", {
  handler(db, ctx, { challengeId, code }) {
    const challenge = find(db, "otpChallenges", challengeId);
    requireValue(
      !challenge.consumedAt &&
        timestamp(ctx.now) < timestamp(challenge.expiresAt) &&
        challenge.attempts < ctx.config.otp.maxAttempts,
      "OTP_EXPIRED",
      "Mã OTP đã hết hạn hoặc vượt số lần thử. Vui lòng yêu cầu mã mới.",
    );
    if (challenge.codeHash !== `plain:${code}`) {
      challenge.attempts++;
      audit(db, ctx, {
        action: "OTP_FAILED",
        entity: "otp",
        entityId: challengeId,
        after: { attempts: challenge.attempts },
      });
      committedFailure(
        challenge.attempts >= ctx.config.otp.maxAttempts
          ? "OTP_EXPIRED"
          : "OTP_INVALID",
        `Mã OTP không đúng (còn ${Math.max(0, ctx.config.otp.maxAttempts - challenge.attempts)} lần).`,
      );
    }
    challenge.consumedAt = ctx.now;
    const token = secret(db, ctx);
    const row = {
      token,
      studentCode: challenge.studentCode,
      email: challenge.target,
      purpose: challenge.purpose,
      expiresAt: addMinutes(ctx.now, 15),
      usedAt: null,
    };
    db.otpTokens.push(row);
    audit(db, ctx, {
      action: "OTP_VERIFIED",
      entity: "otp",
      entityId: challengeId,
      after: { consumedAt: ctx.now },
    });
    return {
      result: {
        otpToken: token,
        accountExists: db.studentProfiles.some(
          (p) => p.studentCode === row.studentCode,
        ),
        profile: db.schoolDirectory.find(
          (d) =>
            d.studentCode === row.studentCode &&
            d.email.toLowerCase() === row.email,
        ),
      },
    };
  },
});

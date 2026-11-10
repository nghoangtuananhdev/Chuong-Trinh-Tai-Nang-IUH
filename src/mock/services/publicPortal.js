import { maskStudentCode, maskName } from "../../domain/identity.js";
import { timestamp } from "../../domain/time.js";
import { roundView } from "../../domain/selectors.js";
import { defineService, find, requireValue, audit } from "./_kernel.js";
export const listRounds = defineService("public.listRounds", {
  readOnly: true,
  handler(db) {
    return {
      result: db.rounds
        .filter((r) => r.status !== "draft")
        .map((r) => roundView(db, r)),
    };
  },
});
export const getRound = defineService("public.getRound", {
  readOnly: true,
  handler(db, ctx, { roundId }) {
    const round = find(db, "rounds", roundId);
    requireValue(
      round.status !== "draft",
      "NOT_FOUND",
      "Không tìm thấy ĐXT công khai.",
    );
    return { result: roundView(db, round) };
  },
});
export const results = defineService("public.results", {
  readOnly: true,
  handler(db, ctx, { roundId }) {
    requireValue(
      find(db, "rounds", roundId).status === "published",
      "INVALID_STATE",
      "ĐXT chưa công bố kết quả.",
    );
    return {
      result: db.applications
        .filter((a) => a.roundId === roundId && a.status === "confirmed")
        .map((a) => ({
          studentCode: maskStudentCode(a.studentCode),
          name: maskName(a.applicantName),
        })),
    };
  },
});
export const lookup = defineService("public.lookup", {
  handler(db, ctx, { otpToken }) {
    const token = db.otpTokens.find(
      (t) =>
        t.token === otpToken &&
        t.purpose === "LOOKUP" &&
        !t.usedAt &&
        timestamp(t.expiresAt) > timestamp(ctx.now),
    );
    requireValue(
      token,
      "OTP_EXPIRED",
      "Phiên tra cứu đã hết hạn. Vui lòng xác thực lại OTP.",
    );
    token.usedAt = ctx.now;
    audit(db, ctx, {
      action: "RESULT_LOOKUP",
      entity: "otp",
      entityId: token.studentCode,
    });
    return {
      result: db.applications
        .filter(
          (a) => a.studentCode === token.studentCode && a.status !== "draft",
        )
        .map((a) => ({
          roundId: a.roundId,
          roundName: find(db, "rounds", a.roundId).name,
          status: a.status,
          officialScore:
            find(db, "rounds", a.roundId).status === "published"
              ? a.officialScore
              : null,
          message:
            a.status === "needs_update"
              ? db.reviewRequests.find(
                  (r) => r.applicationId === a.id && !r.resolvedAt,
                )?.message
              : null,
        })),
    };
  },
});

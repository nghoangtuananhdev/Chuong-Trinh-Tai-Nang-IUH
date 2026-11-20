import { requireValue, IMMUTABLE_MESSAGE } from "./errors.js";
import { timestamp } from "./time.js";
import { canReviewApplications } from "./round-machine.js";
export const APP_TRANSITIONS = Object.freeze({
  draft: ["draft", "pending", "cancelled"],
  pending: ["pending", "withdrawn", "needs_update", "approved", "rejected"],
  needs_update: ["pending", "rejected"],
  approved: ["pending", "confirmed", "not_admitted"],
  rejected: ["pending"],
  confirmed: [],
  not_admitted: [],
  withdrawn: [],
  cancelled: [],
});
export const canTransition = (from, to) =>
  Boolean(APP_TRANSITIONS[from]?.includes(to));
export function assertTransition(
  from,
  to,
  { round, now, actor = "STUDENT", note, dueAt, system = false } = {},
) {
  requireValue(
    round?.status !== "published",
    "INVALID_STATE",
    IMMUTABLE_MESSAGE,
  );
  requireValue(
    canTransition(from, to),
    "INVALID_STATE",
    "Không thể thay đổi trạng thái hồ sơ theo thao tác này.",
  );
  if (system) {
    requireValue(
      (from === "draft" && to === "cancelled" && round.status === "review") ||
        (from === "needs_update" &&
          to === "rejected" &&
          canReviewApplications(round) &&
          timestamp(now) > timestamp(dueAt)) ||
        (from === "approved" &&
          ["confirmed", "not_admitted"].includes(to) &&
          round.status === "approving"),
      "INVALID_STATE",
      "Tác vụ hệ thống không phù hợp giai đoạn hồ sơ.",
    );
    return;
  }
  if (actor === "STUDENT") {
    if (from === "needs_update" && to === "pending") {
      requireValue(
        canReviewApplications(round) && timestamp(now) <= timestamp(dueAt),
        "INVALID_STATE",
        "Hồ sơ đã quá hạn bổ sung hoặc không trong giai đoạn xét duyệt.",
      );
    } else {
      requireValue(
        round.status === "open" &&
          ((from === "draft" &&
            ["draft", "pending", "cancelled"].includes(to)) ||
            (from === "pending" && ["pending", "withdrawn"].includes(to))),
        "INVALID_STATE",
        "Chỉ nộp, sửa hoặc rút hồ sơ khi ĐXT đang tiếp nhận.",
      );
    }
    return;
  }
  requireValue(
    ["LECTURER", "HEAD"].includes(actor) &&
      canReviewApplications(round) &&
      ((from === "pending" &&
        ["approved", "rejected", "needs_update"].includes(to)) ||
        (from === "needs_update" && to === "pending") ||
        (["approved", "rejected"].includes(from) && to === "pending")),
    "INVALID_STATE",
    "Chỉ GVPT hoặc CNN được xét duyệt hồ sơ khi ĐXT đang tiếp nhận hoặc đang xét duyệt.",
  );
  if (to !== "approved")
    requireValue(
      note?.trim(),
      "VALIDATION",
      "Vui lòng ghi rõ lý do hoặc nội dung yêu cầu.",
    );
  if (to === "needs_update") {
    requireValue(dueAt, "VALIDATION", "Vui lòng chọn hạn bổ sung.", {
      field: "dueAt",
    });
    requireValue(
      timestamp(now) < timestamp(dueAt),
      "VALIDATION",
      "Hạn bổ sung phải sau thời điểm hiện tại.",
      { field: "dueAt" },
    );
  }
}

import { requireValue, IMMUTABLE_MESSAGE } from "./errors.js";
import { timestamp } from "./time.js";

export const ROUND_TRANSITIONS = Object.freeze({
  draft: ["upcoming"],
  upcoming: ["open"],
  open: ["review"],
  review: ["approving"],
  approving: ["review", "published"],
  published: [],
});
export const canTransition = (from, to) =>
  Boolean(ROUND_TRANSITIONS[from]?.includes(to));
export function assertTransition(from, to) {
  requireValue(
    canTransition(from, to),
    "INVALID_STATE",
    from === "published"
      ? IMMUTABLE_MESSAGE
      : "Không thể chuyển giai đoạn ĐXT theo thứ tự này.",
  );
}
export function assertApprovalStage(round, level) {
  requireValue(
    round.status === "approving" &&
      round.approvalSubstatus === `waiting_${level.toLowerCase()}`,
    "INVALID_STATE",
    "Danh sách chưa đến cấp phê duyệt này hoặc đã được xử lý.",
  );
}
const timeline = [
  "intakeStart",
  "intakeEnd",
  "reviewStart",
  "reviewEnd",
  "approvalDue",
];
const draftFields = [
  "name",
  "classId",
  "semester",
  "academicYear",
  "quota",
  "criteriaSetId",
  "rankingMode",
  "lecturerId",
  ...timeline,
  "description",
  "attachments",
];
export function editableFields(status, role = "ADMIN") {
  if (!["ADMIN", "DEAN", "HEAD", "LECTURER"].includes(role)) return [];
  const lecturer = role === "LECTURER";
  switch (status) {
    case "draft":
      return lecturer ? [] : [...draftFields];
    case "upcoming":
      return lecturer
        ? [...timeline]
        : draftFields.filter(
            (f) => !["classId", "semester", "academicYear"].includes(f),
          );
    case "open":
      return [
        "intakeEnd",
        "reviewStart",
        "reviewEnd",
        "approvalDue",
        ...(!lecturer ? ["description", "quota"] : []),
      ];
    case "review":
      return ["reviewEnd", "approvalDue", ...(!lecturer ? ["quota"] : [])];
    default:
      return [];
  }
}
export function validateTimeline(round) {
  const start = timestamp(round.intakeStart),
    end = timestamp(round.intakeEnd);
  const reviewStart = timestamp(round.reviewStart),
    reviewEnd = timestamp(round.reviewEnd);
  requireValue(
    start < end,
    "VALIDATION",
    "Ngày kết thúc tiếp nhận phải sau ngày bắt đầu tiếp nhận.",
    { field: "intakeEnd" },
  );
  requireValue(
    end <= reviewStart,
    "VALIDATION",
    "Ngày kết thúc tiếp nhận phải trước hoặc bằng ngày bắt đầu xét duyệt.",
    { field: "reviewStart" },
  );
  requireValue(
    reviewStart < reviewEnd,
    "VALIDATION",
    "Ngày kết thúc xét duyệt phải sau ngày bắt đầu xét duyệt.",
    { field: "reviewEnd" },
  );
  if (round.approvalDue)
    requireValue(
      timestamp(round.approvalDue) >= reviewEnd,
      "VALIDATION",
      "Hạn phê duyệt phải sau ngày kết thúc xét duyệt.",
      { field: "approvalDue" },
    );
}

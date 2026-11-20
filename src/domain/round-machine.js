import { requireValue, IMMUTABLE_MESSAGE } from "./errors.js";
import { timestamp } from "./time.js";

export const ROUND_TRANSITIONS = Object.freeze({
  draft: ["upcoming"],
  upcoming: ["open"],
  open: ["review"],
  review: ["approving", "open"],
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
export const canReviewApplications = (round) =>
  ["open", "review"].includes(round?.status);
export function phaseState(start, end, now) {
  const t = timestamp(now);
  if (t < timestamp(start)) return "upcoming";
  if (t > timestamp(end)) return "ended";
  return "active";
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
      return [
        "intakeEnd",
        "reviewStart",
        "reviewEnd",
        "approvalDue",
        ...(!lecturer ? ["quota"] : []),
      ];
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
    start <= reviewStart,
    "VALIDATION",
    "Ngày bắt đầu xét duyệt không được trước ngày bắt đầu tiếp nhận.",
    { field: "reviewStart" },
  );
  requireValue(
    reviewStart < reviewEnd,
    "VALIDATION",
    "Ngày kết thúc xét duyệt phải sau ngày bắt đầu xét duyệt.",
    { field: "reviewEnd" },
  );
  requireValue(
    end <= reviewEnd,
    "VALIDATION",
    "Ngày kết thúc xét duyệt không được trước ngày kết thúc tiếp nhận.",
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

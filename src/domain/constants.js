export const ROLE = {
  ADMIN: "ADMIN",
  TRAINING: "TRAINING",
  DEAN: "DEAN",
  HEAD: "HEAD",
  LECTURER: "LECTURER",
  STUDENT: "STUDENT",
};
export const ROLE_LABEL = {
  ADMIN: "Quản trị viên",
  TRAINING: "Đại diện phòng đào tạo",
  DEAN: "Ban lãnh đạo khoa",
  HEAD: "Chủ nhiệm ngành",
  LECTURER: "Giảng viên phụ trách",
  STUDENT: "Sinh viên",
};
export const SCOPE = {
  SCHOOL: "SCHOOL",
  FACULTY: "FACULTY",
  MAJOR: "MAJOR",
  CLASS: "CLASS",
  SELF: "SELF",
};
export const ROLE_SCOPE = {
  ADMIN: "SCHOOL",
  TRAINING: "SCHOOL",
  DEAN: "FACULTY",
  HEAD: "MAJOR",
  LECTURER: "CLASS",
  STUDENT: "SELF",
};

export const ROUND_STATUS = [
  "draft",
  "upcoming",
  "open",
  "review",
  "approving",
  "published",
]; // đúng 6 (C17)
export const ROUND_STATUSES = {
  draft: { label: "Nháp", tone: "neutral" },
  upcoming: { label: "Chưa mở", tone: "info" },
  open: { label: "Đang tiếp nhận hồ sơ", tone: "success" },
  review: { label: "Đang xét duyệt hồ sơ", tone: "warning" },
  approving: { label: "Chờ phê duyệt", tone: "info" },
  published: { label: "Đã công bố", tone: "success" },
};
export const APPROVAL_SUBSTATUS = {
  waiting_head: { label: "Chờ Chủ nhiệm ngành xác nhận", level: "HEAD" },
  waiting_dean: { label: "Chờ Ban lãnh đạo khoa phê duyệt", level: "DEAN" },
  waiting_training: {
    label: "Chờ Phòng Đào tạo phê duyệt & công bố",
    level: "TRAINING",
  },
};
export const APPLICATION_STATUSES = {
  // MP 5.5
  draft: { label: "Bản nháp", tone: "neutral" },
  pending: { label: "Chờ duyệt", tone: "warning" },
  needs_update: { label: "Cần bổ sung", tone: "warning" },
  approved: { label: "Đạt điều kiện", tone: "success" },
  rejected: { label: "Không đạt", tone: "danger" },
  confirmed: { label: "Trúng tuyển", tone: "success" },
  not_admitted: { label: "Không trúng tuyển", tone: "neutral" },
  withdrawn: { label: "Đã rút", tone: "neutral" },
  cancelled: { label: "Đã hủy", tone: "neutral" },
};
export const FLOW = { A: "A", B: "B", C: "C" };
export const FLOW_LABEL = {
  A: "Luồng A – Đăng ký mới",
  B: "Luồng B – Nộp bổ sung",
  C: "Luồng C – Duy trì",
};
export const MEMBERSHIP_STATUS = {
  ACTIVE: "Đang học",
  DROPPED: "Không đạt duy trì",
  WITHDRAWN: "Tự rút",
  GRADUATED: "Tốt nghiệp",
};
export const CLASS_STATUS = {
  NOT_OPEN: "Chưa mở",
  RECRUITING: "Đang tuyển sinh",
  ACTIVE: "Đang hoạt động",
  ENDED: "Đã kết thúc",
};
export const CRITERIA_SET_STATUS = {
  DRAFT: "Nháp",
  PUBLISHED: "Đã ban hành",
  ARCHIVED: "Lưu trữ",
};
export const CRITERION_KIND = { REQUIRED: "Bắt buộc", PRIORITY: "Ưu tiên" };
export const VALUE_TYPE = {
  NUMBER_THRESHOLD: "Ngưỡng số",
  COUNT: "Đếm minh chứng",
  ACCUMULATIVE_ENUM: "Tích lũy có quy đổi",
};
export const OPERATOR = {
  GTE: "≥",
  GT: ">",
  EQ: "=",
  LTE: "≤",
  LT: "<",
  BETWEEN: "Trong khoảng",
};
export const RANKING_MODE = {
  MAINTAIN_THEN_FILL: "Duy trì trước, bổ sung sau",
  OPEN_COMPETITION: "Cạnh tranh sòng phẳng" /* PROTECTED_RATIO: chưa làm */,
};
export const VERIFY_STATUS = {
  UNVERIFIED: "Chưa xác minh",
  VALID: "Hợp lệ",
  INVALID: "Không hợp lệ",
};
export const SEMESTERS = ["Học kỳ 1", "Học kỳ 2", "Học kỳ hè"];

export const CRITERIA_PUBLISH_RULE = "criteria.update";

export const EMAIL_STATUS = {
  QUEUED: "Đang chờ gửi",
  SENT: "Đã gửi",
  FAILED: "Gửi lỗi",
};
export function getStatusMeta(value, domain = "general") {
  const labels = {
    membership: MEMBERSHIP_STATUS,
    criteriaSet: CRITERIA_SET_STATUS,
    email: EMAIL_STATUS,
    class: CLASS_STATUS,
    account: { ACTIVE: "Hoạt động", LOCKED: "Đã khóa" },
    roleAssignment: {
      ACTIVE: "Đang hiệu lực",
      EXPIRED: "Hết hạn",
      REVOKED: "Đã thu hồi",
    },
  };
  const map =
    domain === "round"
      ? ROUND_STATUSES
      : domain === "application"
        ? APPLICATION_STATUSES
        : null;
  if (map?.[value]) return map[value];
  if (labels[domain]?.[value])
    return {
      label: labels[domain][value],
      tone: ["FAILED", "LOCKED", "DROPPED"].includes(value)
        ? "danger"
        : ["ACTIVE", "PUBLISHED", "SENT"].includes(value)
          ? "success"
          : "neutral",
    };
  return (
    ROUND_STATUSES[value] ??
    APPLICATION_STATUSES[value] ?? {
      label: value || "Không xác định",
      tone: "neutral",
    }
  );
}

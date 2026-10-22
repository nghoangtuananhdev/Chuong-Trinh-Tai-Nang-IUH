/**
 * Status definitions and semantic color mappings
 * Avoids fragile string regex matching.
 */

export const ROUND_STATUSES = {
  open: { label: "Đang tiếp nhận", tone: "success" },
  review: { label: "Đang xét duyệt", tone: "warning" },
  closed: { label: "Đã kết thúc", tone: "neutral" },
  upcoming: { label: "Chưa mở", tone: "info" }
};

export const APPLICATION_STATUSES = {
  draft: { label: "Bản nháp", tone: "neutral" },
  pending: { label: "Chờ duyệt", tone: "warning" },
  needs_update: { label: "Cần bổ sung", tone: "warning" },
  approved: { label: "Đã duyệt", tone: "success" },
  confirmed: { label: "Trúng tuyển", tone: "success" },
  rejected: { label: "Từ chối", tone: "danger" }
};

export const CLASS_STATUSES = {
  "Đang hoạt động": { label: "Đang hoạt động", tone: "success" },
  "Đang tuyển sinh": { label: "Đang tuyển sinh", tone: "warning" },
  "Chưa mở": { label: "Chưa mở", tone: "info" },
  "Đã kết thúc": { label: "Đã kết thúc", tone: "neutral" }
};

export const ACCOUNT_STATUSES = {
  "Hoạt động": { label: "Hoạt động", tone: "success" },
  "Chờ duyệt": { label: "Chờ duyệt", tone: "warning" },
  "Khóa": { label: "Khóa", tone: "danger" }
};

export const CRITERIA_TYPES = {
  "Bắt buộc": { label: "Bắt buộc", tone: "success" },
  "Ưu tiên": { label: "Ưu tiên", tone: "warning" }
};

export function getStatusMeta(value, domain = "general") {
  if (!value) return { label: "Không xác định", tone: "neutral" };

  // Explicit match in domain maps
  if (domain === "round" && ROUND_STATUSES[value]) return ROUND_STATUSES[value];
  if (domain === "application" && APPLICATION_STATUSES[value]) return APPLICATION_STATUSES[value];
  if (domain === "class" && CLASS_STATUSES[value]) return CLASS_STATUSES[value];
  if (domain === "account" && ACCOUNT_STATUSES[value]) return ACCOUNT_STATUSES[value];
  if (domain === "criteria" && CRITERIA_TYPES[value]) return CRITERIA_TYPES[value];

  // Lookup across labels
  const str = String(value).trim();
  for (const group of [ROUND_STATUSES, APPLICATION_STATUSES, CLASS_STATUSES, ACCOUNT_STATUSES, CRITERIA_TYPES]) {
    for (const [key, item] of Object.entries(group)) {
      if (item.label.toLowerCase() === str.toLowerCase() || key.toLowerCase() === str.toLowerCase()) {
        return item;
      }
    }
  }

  // Exact fallback mappings without accidental partial matching
  const lower = str.toLowerCase();
  if (lower === "đã kết thúc" || lower === "kết thúc") return { label: str, tone: "neutral" };
  if (lower === "từ chối" || lower === "không đạt" || lower === "khóa") return { label: str, tone: "danger" };
  if (lower === "hoạt động" || lower === "đã duyệt" || lower === "đạt" || lower === "trúng tuyển" || lower === "đang tiếp nhận" || lower === "đang mở") return { label: str, tone: "success" };
  if (lower === "chờ duyệt" || lower === "chờ" || lower === "đang xét duyệt" || lower === "cần bổ sung" || lower === "đang tuyển sinh") return { label: str, tone: "warning" };
  if (lower === "chưa mở" || lower === "xét tuyển mới" || lower === "duy trì năm 3") return { label: str, tone: "info" };

  return { label: str, tone: "neutral" };
}

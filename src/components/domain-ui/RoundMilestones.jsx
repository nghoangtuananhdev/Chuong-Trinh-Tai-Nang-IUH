import { formatIct, timestamp } from "../../domain/time.js";
export function RoundMilestones({ round, now }) {
  const fields = {
    intakeStart: "Mở tiếp nhận",
    intakeEnd: "Đóng tiếp nhận",
    reviewStart: "Bắt đầu xét duyệt",
    reviewEnd: "Kết thúc xét duyệt",
    approvalDue: "Hạn phê duyệt dự kiến",
    publishedAt: "Công bố",
  };
  return (
    <ol className="space-y-2" aria-label="Mốc thời gian ĐXT">
      {Object.entries(fields)
        .filter(([key]) => round[key])
        .map(([key, label]) => (
          <li
            key={key}
            className="border-l-2 border-brand-300 pl-4 text-body-sm"
          >
            {label}: {formatIct(round[key])} ·{" "}
            {timestamp(now) >= timestamp(round[key]) ? "Đã đến mốc" : "Sắp tới"}
          </li>
        ))}
    </ol>
  );
}

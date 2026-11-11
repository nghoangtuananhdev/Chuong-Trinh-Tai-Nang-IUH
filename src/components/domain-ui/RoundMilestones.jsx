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
    <ol className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Mốc thời gian ĐXT">
      {Object.entries(fields)
        .filter(([key]) => round[key])
        .map(([key, label]) => (
          <li key={key} className="flex items-start gap-2.5 text-body-sm tabular-nums">
            <span
              aria-hidden="true"
              className={`mt-1.5 size-2 shrink-0 rounded-full ${timestamp(now) >= timestamp(round[key]) ? "bg-brand-600" : "bg-ink-300"}`}
            />
            <span>
              {label}: {formatIct(round[key])} ·{" "}
              {timestamp(now) >= timestamp(round[key]) ? "Đã đến mốc" : "Sắp tới"}
            </span>
          </li>
        ))}
    </ol>
  );
}

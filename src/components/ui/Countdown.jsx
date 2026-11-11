import { Clock } from "lucide-react";
import { timestamp } from "../../domain/time.js";
export function Countdown({ now, until }) {
  const minutes = Math.max(
    0,
    Math.ceil((timestamp(until) - timestamp(now)) / 60000),
  );
  return (
    <span
      className="inline-flex items-center gap-1.5 text-body-sm tabular-nums text-ink-700"
      aria-live="polite"
    >
      <Clock size={14} aria-hidden="true" className="shrink-0" />
      {minutes === 0
        ? "Đã hết hạn"
        : `Còn ${Math.floor(minutes / 60)} giờ ${minutes % 60} phút (theo đồng hồ mô phỏng)`}
    </span>
  );
}

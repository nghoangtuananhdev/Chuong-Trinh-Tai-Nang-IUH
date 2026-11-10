import { timestamp } from "../../domain/time.js";
export function Countdown({ now, until }) {
  const minutes = Math.max(
    0,
    Math.ceil((timestamp(until) - timestamp(now)) / 60000),
  );
  return (
    <span className="font-mono text-body-sm" aria-live="polite">
      {minutes === 0
        ? "Đã hết hạn"
        : `Còn ${Math.floor(minutes / 60)} giờ ${minutes % 60} phút (theo đồng hồ mô phỏng)`}
    </span>
  );
}

import { ROUND_STATUSES } from "../../domain/constants.js";
import { ProcessTrack } from "../ui/ProcessTrack.jsx";

const ORDER = ["upcoming", "open", "review", "approving", "published"];

/** Năm giai đoạn công khai của một đợt xét tuyển; chỉ dùng `round.status`. */
export function RoundTrack({ status, size = "md", showLabels = true, decorative = false, className = "" }) {
  const idx = ORDER.indexOf(status);
  const steps = ORDER.map((key, i) => ({
    key,
    label: ROUND_STATUSES[key].label,
    state: i < idx ? "done" : i === idx ? "current" : "todo"
  }));
  return <ProcessTrack steps={steps} size={size} showLabels={showLabels} decorative={decorative} label="Trạng thái ĐXT" className={className} />;
}

import { formatIct, timestamp } from "../../domain/time.js";
import { phaseState } from "../../domain/round-machine.js";

const PHASE = {
  upcoming: { label: "Chưa bắt đầu", cls: "bg-neutral-bg text-neutral-fg" },
  active: { label: "Đang diễn ra", cls: "bg-info-bg text-info-fg" },
  ended: { label: "Đã kết thúc", cls: "bg-success-bg text-success-fg" },
};
function Phase({ title, start, end, now }) {
  const state = PHASE[phaseState(start, end, now)];
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 text-body-sm tabular-nums">
      <span className="min-w-36 font-medium text-ink-900">{title}</span>
      <span className="text-ink-700">
        {formatIct(start)} – {formatIct(end)}
      </span>
      <span
        className={`rounded-full px-2 text-caption font-medium ${state.cls}`}
      >
        {state.label}
      </span>
    </li>
  );
}
/** Hai giai đoạn song song: tiếp nhận và xét duyệt (có thể chồng nhau). */
export function RoundMilestones({ round, now }) {
  const overlap =
    round.reviewStart &&
    round.intakeEnd &&
    timestamp(round.reviewStart) < timestamp(round.intakeEnd);
  const extras = [
    ["approvalDue", "Hạn phê duyệt dự kiến"],
    ["publishedAt", "Công bố"],
  ].filter(([key]) => round[key]);
  return (
    <div className="space-y-3" aria-label="Mốc thời gian ĐXT">
      <ul className="space-y-2">
        {round.intakeStart && round.intakeEnd && (
          <Phase
            title="Tiếp nhận hồ sơ"
            start={round.intakeStart}
            end={round.intakeEnd}
            now={now}
          />
        )}
        {round.reviewStart && round.reviewEnd && (
          <Phase
            title="Xét duyệt hồ sơ"
            start={round.reviewStart}
            end={round.reviewEnd}
            now={now}
          />
        )}
      </ul>
      {overlap && (
        <p className="text-body-sm text-ink-600">
          Hai giai đoạn diễn ra đồng thời từ {formatIct(round.reviewStart)} đến{" "}
          {formatIct(round.intakeEnd)}.
        </p>
      )}
      {extras.length > 0 && (
        <ul className="space-y-1 text-body-sm tabular-nums text-ink-700">
          {extras.map(([key, label]) => (
            <li key={key}>
              {label}: {formatIct(round[key])}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

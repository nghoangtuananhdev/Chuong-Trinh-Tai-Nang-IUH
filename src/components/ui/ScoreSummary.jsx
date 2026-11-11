import { Check, Minus } from "lucide-react";
import { Panel } from "./Panel.jsx";

export function ScoreSummary({ score }) {
  return (
    <Panel title="Điểm dự kiến" titleAs="h3" aria-live="polite">
      <p className="text-metric tabular-nums text-ink-900">{score.total}</p>
      <p className="text-body-sm text-ink-600">
        BB đạt {score.rows.filter((r) => r.kind === "REQUIRED" && r.met).length}
        /{score.rows.filter((r) => r.kind === "REQUIRED").length}
      </p>
      <ul className="mt-3 divide-y divide-ink-200">
        {score.rows.map((r) => (
          <li
            key={r.criterionId}
            className="flex items-start gap-2 py-2 text-body-sm"
          >
            {r.met ? (
              <Check size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-success-solid" />
            ) : (
              <Minus size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-ink-400" />
            )}
            <span>
              {r.name}: {r.points} điểm · {r.met ? "Đạt" : "Chưa đạt"}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-caption text-ink-600">
        Điểm chính thức do giảng viên xác minh có thể khác.
      </p>
    </Panel>
  );
}

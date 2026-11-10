import { ROLE_LABEL } from "../../domain/constants.js";
export function ApprovalStepper({ round, list, steps }) {
  return (
    <ol className="flex flex-wrap gap-3" aria-label="Ba cấp phê duyệt">
      {["HEAD", "DEAN", "TRAINING"].map((level) => {
        const done = steps.find(
          (s) =>
            s.listId === list.id &&
            s.level === level &&
            s.decision === "APPROVED",
        );
        return (
          <li
            key={level}
            aria-current={
              round.approvalSubstatus === `waiting_${level.toLowerCase()}`
                ? "step"
                : undefined
            }
            className="rounded-control border border-ink-200 bg-white p-3 text-body-sm"
          >
            {ROLE_LABEL[level]} ·{" "}
            {done
              ? "Đã duyệt"
              : round.approvalSubstatus === `waiting_${level.toLowerCase()}`
                ? "Đang chờ"
                : "Chưa tới"}
          </li>
        );
      })}
    </ol>
  );
}

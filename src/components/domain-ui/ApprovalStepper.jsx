import { ROLE_LABEL } from "../../domain/constants.js";
import { ProcessTrack } from "../ui/ProcessTrack.jsx";
export function ApprovalStepper({ round, list, steps }) {
  return (
    <ProcessTrack
      label="Ba cấp phê duyệt"
      steps={["HEAD", "DEAN", "TRAINING"].map((level) => {
        const done = steps.find(
          (s) =>
            s.listId === list.id &&
            s.level === level &&
            s.decision === "APPROVED",
        );
        const waiting =
          round.approvalSubstatus === `waiting_${level.toLowerCase()}`;
        return {
          key: level,
          label: ROLE_LABEL[level],
          meta: done ? "Đã duyệt" : waiting ? "Đang chờ" : "Chưa tới",
          state: done ? "done" : waiting ? "current" : "todo",
        };
      })}
    />
  );
}

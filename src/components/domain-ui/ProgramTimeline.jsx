import { Timeline } from "../ui/Display.jsx";
import {
  APPLICATION_STATUSES,
  MEMBERSHIP_STATUS,
} from "../../domain/constants.js";
export function ProgramTimeline({ db, userId }) {
  const rows = db.applications
    .filter((a) => a.studentUserId === userId && a.submittedAt)
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  return (
    <Timeline
      items={rows.map((a) => {
        const round = db.rounds.find((r) => r.id === a.roundId),
          membership = db.memberships.find(
            (m) => m.sourceApplicationId === a.id,
          );
        return {
          date: round?.academicYear,
          action: round?.name,
          actor: APPLICATION_STATUSES[a.status]?.label,
          note: `${a.officialScore ?? "Chưa có"} điểm chính thức${membership ? ` · Năm ${membership.studyYear}: ${MEMBERSHIP_STATUS[membership.status]}` : ""}${a.decisionNote ? ` · ${a.decisionNote}` : ""}`,
        };
      })}
    />
  );
}

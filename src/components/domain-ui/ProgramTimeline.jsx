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
          quote: false,
          // Dòng thời gian của sinh viên: điểm chính thức chỉ hiện khi ĐXT đã công bố (A-25).
          note: `${round?.status === "published" ? `${a.officialScore ?? "Chưa có"} điểm chính thức` : "Chưa công bố điểm"}${membership ? ` · Năm ${membership.studyYear}: ${MEMBERSHIP_STATUS[membership.status]}` : ""}${a.decisionNote ? ` · ${a.decisionNote}` : ""}`,
        };
      })}
    />
  );
}

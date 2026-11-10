import { useBackend } from "../../mock/backend.jsx";
import { DataList } from "../shared/FeatureKit.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Callout, CodeTag, Timeline } from "../../components/ui/Display.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { formatIct } from "../../domain/time.js";
import { navigate } from "../../app/router.js";
export function RecordsPage({ id }) {
  const { db, can } = useBackend();
  const students = db.users.filter(
    (u) =>
      u.kind === "STUDENT" &&
      (can("student.view", { type: "user", entity: u }) ||
        db.applications.some(
          (a) =>
            a.studentUserId === u.id &&
            can("application.view", { type: "application", entity: a }),
        )),
  );
  if (id) {
    const user = students.find((u) => u.id === id);
    if (!user)
      return (
        <Callout tone="danger">Không có quyền xem hồ sơ sinh viên.</Callout>
      );
    const apps = db.applications.filter(
      (a) =>
        a.studentUserId === id &&
        can("application.view", { type: "application", entity: a }),
    );
    return (
      <div className="space-y-5">
        <Callout title={user.fullName}>
          {user.username} · {user.email}
        </Callout>
        <Timeline
          items={apps
            .filter((a) => a.submittedAt)
            .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))
            .map((a) => ({
              date: db.rounds.find((r) => r.id === a.roundId)?.academicYear,
              action: db.rounds.find((r) => r.id === a.roundId)?.name,
              actor: `${a.officialScore ?? "Chưa có"} điểm`,
              note: a.decisionNote,
            }))}
        />
        <DataList
          rows={apps}
          columns={[
            {
              key: "code",
              header: "Mã hồ sơ",
              cell: (a) => <CodeTag>{a.code}</CodeTag>,
            },
            {
              key: "status",
              header: "Trạng thái",
              cell: (a) => (
                <StatusBadge domain="application">{a.status}</StatusBadge>
              ),
            },
            {
              key: "score",
              header: "Điểm chính thức",
              cell: (a) => a.officialScore ?? "Chưa có",
            },
          ]}
          actions={(a) => (
            <Button
              variant="link"
              onClick={() => navigate(`/app/records/application/${a.id}`)}
            >
              Xem chỉ đọc
            </Button>
          )}
        />
      </div>
    );
  }
  return (
    <DataList
      rows={students}
      columns={[
        {
          key: "code",
          header: "MSSV",
          cell: (u) => <CodeTag>{u.username}</CodeTag>,
        },
        { key: "name", header: "Họ tên", cell: (u) => u.fullName },
        {
          key: "program",
          header: "Chương trình",
          cell: (u) =>
            db.studentProfiles.find((p) => p.userId === u.id)?.isKSTN
              ? "SV CN/KSTN"
              : "Ứng viên",
        },
      ]}
      actions={(u) => (
        <Button variant="link" onClick={() => navigate(`/app/records/${u.id}`)}>
          Xem lịch sử
        </Button>
      )}
    />
  );
}

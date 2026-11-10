import { useBackend } from "../../mock/backend.jsx";
import { Callout } from "../../components/ui/Display.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { DataList } from "../shared/FeatureKit.jsx";
import { ROUND_STATUSES } from "../../domain/constants.js";
import { timestamp, addDays, formatIct } from "../../domain/time.js";
import { navigate } from "../../app/router.js";
export function Dashboard() {
  const { db, can, activeRole, now } = useBackend();
  const rounds = db.rounds.filter((r) =>
    can("round.view", { type: "round", entity: r }),
  );
  const pending = db.applications.filter(
    (a) =>
      a.status === "pending" &&
      can("application.review", { type: "application", entity: a }),
  );
  const lists = rounds.filter(
    (r) => r.approvalSubstatus === `waiting_${activeRole.role.toLowerCase()}`,
  );
  const upcoming = rounds.flatMap((r) =>
    ["intakeStart", "intakeEnd", "reviewEnd", "approvalDue"]
      .filter(
        (k) =>
          r[k] &&
          timestamp(r[k]) >= timestamp(now) &&
          timestamp(r[k]) <= timestamp(addDays(now, 7)),
      )
      .map((k) => ({
        id: `${r.id}-${k}`,
        roundId: r.id,
        name: r.name,
        label: {
          intakeStart: "Mở tiếp nhận",
          intakeEnd: "Đóng tiếp nhận",
          reviewEnd: "Hết hạn xét duyệt",
          approvalDue: "Hạn phê duyệt",
        }[k],
        at: r[k],
      })),
  );
  return (
    <div className="space-y-5">
      <h2 className="text-title-3">Việc cần làm</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Callout title={`${pending.length} hồ sơ chờ duyệt`}>
          {can("application.review") && (
            <Button variant="link" onClick={() => navigate("/app/reviews")}>
              Đi tới duyệt hồ sơ
            </Button>
          )}
        </Callout>
        <Callout title={`${lists.length} danh sách chờ bạn`}>
          {["HEAD", "DEAN", "TRAINING"].includes(activeRole.role) && (
            <Button variant="link" onClick={() => navigate("/app/approvals")}>
              Xử lý danh sách
            </Button>
          )}
        </Callout>
        {activeRole.role === "ADMIN" && (
          <Callout
            title={`${db.emailOutbox.filter((e) => e.status === "FAILED").length} email lỗi`}
          >
            <Button
              variant="link"
              onClick={() => navigate("/app/email-outbox")}
            >
              Xem hàng đợi
            </Button>
          </Callout>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {Object.entries(ROUND_STATUSES).map(([status, m]) => (
          <Callout key={status} title={m.label}>
            {rounds.filter((r) => r.status === status).length} ĐXT
          </Callout>
        ))}
      </div>
      <h2 className="text-title-3">Mốc sắp tới trong 7 ngày</h2>
      <DataList
        rows={upcoming}
        columns={[
          { key: "name", header: "ĐXT", cell: (r) => r.name },
          { key: "label", header: "Mốc", cell: (r) => r.label },
          { key: "at", header: "Thời gian", cell: (r) => formatIct(r.at) },
        ]}
        actions={(r) => (
          <Button
            variant="link"
            onClick={() => navigate(`/app/rounds/${r.roundId}`)}
          >
            Xem
          </Button>
        )}
      />
    </div>
  );
}

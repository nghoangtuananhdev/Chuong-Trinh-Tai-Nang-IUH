import { useBackend } from "../../mock/backend.jsx";
import { MetricTile } from "../../components/ui/MetricTile.jsx";
import { Panel } from "../../components/ui/Panel.jsx";
import { ArrowRight } from "lucide-react";
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
          reviewEnd: "Kết thúc xét duyệt dự kiến",
          approvalDue: "Hạn phê duyệt",
        }[k],
        at: r[k],
      })),
  );
  return (
    <div className="space-y-6">
      <h2 className="text-title-3">Việc cần làm</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricTile
          value={pending.length}
          label="hồ sơ chờ duyệt"
          action={
            can("application.review") && (
              <Button
                variant="link"
                iconRight={ArrowRight}
                onClick={() => navigate("/app/reviews")}
              >
                Đi tới duyệt hồ sơ
              </Button>
            )
          }
        />
        <MetricTile
          value={lists.length}
          label="danh sách chờ bạn"
          action={
            ["HEAD", "DEAN", "TRAINING"].includes(activeRole.role) && (
              <Button
                variant="link"
                iconRight={ArrowRight}
                onClick={() => navigate("/app/approvals")}
              >
                Xử lý danh sách
              </Button>
            )
          }
        />
        {activeRole.role === "ADMIN" && (
          <MetricTile
            value={db.emailOutbox.filter((e) => e.status === "FAILED").length}
            label="email lỗi"
            action={
              <Button
                variant="link"
                iconRight={ArrowRight}
                onClick={() => navigate("/app/email-outbox")}
              >
                Xem hàng đợi
              </Button>
            }
          />
        )}
      </div>
      <h2 className="pt-2 text-title-3">Đợt xét tuyển theo giai đoạn</h2>
      <Panel padded={false}>
        <div className="mask-x scrollbar-thin overflow-x-auto p-5">
          <ol
            className="chev-track grid min-w-[54rem]"
            style={{ gridTemplateColumns: `repeat(${Object.keys(ROUND_STATUSES).length}, minmax(0, 1fr))`, "--k": "16px" }}
          >
            {Object.entries(ROUND_STATUSES).map(([status, m], i) => {
              const n = rounds.filter((r) => r.status === status).length;
              return (
                <li key={status} className="min-w-0">
                  <span
                    className={`chev-seg page-in h-24 ${n > 0 ? "bg-brand-600" : "bg-ink-100"}`}
                    style={{ animationDelay: `${i * 70}ms` }}
                  >
                    <span className="flex h-full flex-col justify-center pl-8 pr-6">
                      <span className={`text-title-1 tabular-nums ${n > 0 ? "text-white" : "text-ink-500"}`}>{n}</span>
                      <span className={`line-clamp-2 text-body-sm leading-tight ${n > 0 ? "text-brand-100" : "text-ink-600"}`}>{m.label}</span>
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </Panel>
      <h2 className="pt-2 text-title-3">Mốc sắp tới trong 7 ngày</h2>
      <DataList
        rows={upcoming}
        columns={[
          { key: "name", header: "ĐXT", cell: (r) => r.name },
          { key: "label", header: "Mốc", cell: (r) => r.label },
          {
            key: "at",
            header: "Thời gian",
            className: "tabular-nums whitespace-nowrap",
            cell: (r) => formatIct(r.at),
          },
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

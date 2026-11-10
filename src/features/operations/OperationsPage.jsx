import { useState, useEffect } from "react";
import { useBackend } from "../../mock/backend.jsx";
import { DataList, FormDialog, useAction } from "../shared/FeatureKit.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Field, Input, Select, Textarea } from "../../components/ui/Form.jsx";
import { Callout, CodeTag } from "../../components/ui/Display.jsx";
import { Drawer } from "../../components/ui/Drawer.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { APPLICATION_STATUSES } from "../../domain/constants.js";
import { formatIct } from "../../domain/time.js";
import { navigate } from "../../app/router.js";
export function OperationsPage({ page, roundId }) {
  const { db, can, activeRole } = useBackend(),
    action = useAction();
  const rounds = db.rounds.filter((r) =>
    can("report.view", { type: "round", entity: r }),
  );
  const [selected, setSelected] = useState(roundId ?? rounds[0]?.id ?? ""),
    [summary, setSummary] = useState(null),
    [detail, setDetail] = useState(null),
    [filter, setFilter] = useState(""),
    [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [config, setConfig] = useState(() => structuredClone(db.config)),
    [template, setTemplate] = useState("OTP_REGISTER"),
    [target, setTarget] = useState("");
  useEffect(() => {
    if (page === "reports" && selected)
      action
        .run("reports.roundSummary", { roundId: selected }, "")
        .then((r) => {
          if (r.ok) setSummary(r.result);
        });
  }, [page, selected, db.applications]);
  if (page === "reports")
    return (
      <div className="space-y-5 print-report">
        <h2 className="text-title-3">
          {db.rounds.find((r) => r.id === selected)?.name}
        </h2>
        <Field label="Đợt xét tuyển">
          <Select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {rounds.map((r) => (
              <option key={r.id} value={r.id}>
                {r.code} · {r.name}
              </option>
            ))}
          </Select>
        </Field>
        {summary && (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <Callout title={`Tổng hồ sơ: ${summary.total}`}>
                Trúng tuyển: {summary.confirmed.length}/{summary.quota}
              </Callout>
              <Callout title="Theo luồng">
                {Object.entries(summary.flowCounts).map(([key, n]) => (
                  <p key={key}>
                    Luồng {key}: {n}
                  </p>
                ))}
              </Callout>
              <Callout title="Theo trạng thái">
                {Object.entries(summary.statusCounts).map(([key, n]) => (
                  <p key={key}>
                    {APPLICATION_STATUSES[key]?.label}: {n}
                  </p>
                ))}
              </Callout>
            </div>
            <h2 className="text-title-3">Phổ điểm (khoảng 20 điểm)</h2>
            <svg
              viewBox="0 0 640 240"
              role="img"
              aria-label="Phổ điểm chính thức"
              className="max-h-72 w-full rounded-card bg-white"
            >
              <title>Phổ điểm chính thức theo khoảng 20 điểm</title>
              {Object.entries(summary.histogram).map(([bin, n], i, all) => {
                const height =
                  (n / Math.max(1, ...Object.values(summary.histogram))) * 170;
                return (
                  <g key={bin}>
                    <rect
                      x={30 + (i * 580) / all.length}
                      y={200 - height}
                      width={Math.max(5, 500 / all.length)}
                      height={height}
                      className="fill-brand-600"
                    />
                    <text
                      x={30 + (i * 580) / all.length}
                      y={225}
                      className="fill-ink-700 text-caption"
                    >
                      {bin}–{Number(bin) + 19}
                    </text>
                    <text
                      x={30 + (i * 580) / all.length}
                      y={190 - height}
                      className="fill-ink-900 text-caption"
                    >
                      {n}
                    </text>
                  </g>
                );
              })}
            </svg>
            <DataList
              rows={summary.confirmed}
              columns={[
                {
                  key: "code",
                  header: "MSSV",
                  cell: (r) => <CodeTag>{r.studentCode}</CodeTag>,
                },
                { key: "name", header: "Họ tên", cell: (r) => r.name },
                { key: "score", header: "Điểm", cell: (r) => r.score },
              ]}
            />
            <div className="flex gap-3">
              <Button
                onClick={async () => {
                  const r = await action.run(
                    "reports.exportRoundCsv",
                    { roundId: selected },
                    "",
                  );
                  if (r.ok) {
                    const url = URL.createObjectURL(
                      new Blob([r.result], { type: "text/csv;charset=utf-8;" }),
                    );
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `ket-qua-${selected}.csv`;
                    a.click();
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                  }
                }}
              >
                Xuất CSV (Excel)
              </Button>
              <Button variant="secondary" onClick={() => window.print()}>
                In / Lưu PDF
              </Button>
            </div>
          </>
        )}
      </div>
    );
  if (page === "audit")
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Hành động / đối tượng / người thực hiện">
            <Input value={filter} onChange={(e) => setFilter(e.target.value)} />
          </Field>
          <Field label="Từ ngày">
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </Field>
          <Field label="Đến ngày">
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </Field>
        </div>
        <DataList
          rows={db.auditLogs
            .filter(
              (l) =>
                (!filter ||
                  `${l.action} ${l.entity} ${l.entityId} ${l.actorName}`
                    .toLowerCase()
                    .includes(filter.toLowerCase())) &&
                (!from || l.at.slice(0, 10) >= from) &&
                (!to || l.at.slice(0, 10) <= to),
            )
            .slice()
            .reverse()}
          columns={[
            { key: "time", header: "Thời gian", cell: (l) => formatIct(l.at) },
            {
              key: "actor",
              header: "Người thực hiện / Vai trò",
              cell: (l) => `${l.actorName} · ${l.actorRole ?? "Hệ thống"}`,
            },
            { key: "action", header: "Hành động", cell: (l) => l.action },
            {
              key: "entity",
              header: "Đối tượng",
              cell: (l) => `${l.entity} · ${l.entityId ?? ""}`,
            },
            { key: "reason", header: "Lý do", cell: (l) => l.reason },
          ]}
          actions={(l) => (
            <Button size="sm" variant="link" onClick={() => setDetail(l)}>
              Xem trước / sau
            </Button>
          )}
        />
        <Drawer
          open={Boolean(detail)}
          onClose={() => setDetail(null)}
          title="Chi tiết nhật ký"
        >
          <pre className="whitespace-pre-wrap break-words text-caption">
            {JSON.stringify(detail, null, 2)}
          </pre>
        </Drawer>
      </div>
    );
  if (page === "email-outbox")
    return (
      <div className="space-y-4">
        <Field label="Trạng thái email">
          <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="SENT">Đã gửi</option>
            <option value="FAILED">Gửi lỗi</option>
            <option value="QUEUED">Đang chờ</option>
          </Select>
        </Field>
        <DataList
          rows={db.emailOutbox
            .filter(
              (e) =>
                (activeRole.role === "ADMIN" || e.status === "FAILED") &&
                (!filter || e.status === filter) &&
                (!roundId || e.relatedEntity === roundId),
            )
            .slice()
            .reverse()}
          columns={[
            {
              key: "time",
              header: "Thời gian",
              cell: (e) => formatIct(e.createdAt),
            },
            {
              key: "to",
              header: "Người nhận",
              cell: (e) => <span className="break-all">{e.to}</span>,
            },
            {
              key: "subject",
              header: "Mẫu / Tiêu đề",
              cell: (e) => `${e.template} · ${e.subject}`,
            },
            {
              key: "status",
              header: "Trạng thái",
              cell: (e) => <StatusBadge domain="email">{e.status}</StatusBadge>,
            },
            {
              key: "attempts",
              header: "Số lần thử / Lỗi",
              cell: (e) => `${e.attempts} · ${e.lastError ?? ""}`,
            },
          ]}
          actions={(e) => (
            <>
              <Button size="sm" variant="link" onClick={() => setDetail(e)}>
                Xem
              </Button>
              {e.status === "FAILED" && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => action.run("email.resend", { id: e.id })}
                >
                  Gửi lại
                </Button>
              )}
            </>
          )}
        />
        <Drawer
          open={Boolean(detail)}
          onClose={() => setDetail(null)}
          title={detail?.subject}
        >
          <p className="whitespace-pre-wrap break-words">{detail?.body}</p>
        </Drawer>
      </div>
    );
  if (page === "settings") {
    const patch = (section, key, value) =>
      setConfig((c) => ({ ...c, [section]: { ...c[section], [key]: value } }));
    return (
      <div className="max-w-3xl space-y-6">
        <Callout>
          SMTP và email là mô phỏng; dữ liệu chỉ lưu trong trình duyệt.
        </Callout>
        {[
          ["files", "maxMb", "Dung lượng tối đa mỗi tệp (MB)"],
          ["otp", "ttlMinutes", "Hiệu lực OTP (phút)"],
          ["otp", "maxAttempts", "Số lần thử OTP"],
          ["otp", "maxPerStudent15m", "Số OTP/MSSV/15 phút"],
          ["otp", "maxPerIpHour", "Số OTP/IP/giờ"],
          ["login", "maxFailures", "Số lần đăng nhập sai trước khi khóa"],
          ["login", "lockMinutes", "Thời gian khóa (phút)"],
          ["reminders", "approvalHoldDays", "Nhắc phê duyệt sau số ngày"],
          ["email", "maxAttempts", "Số lần thử gửi email"],
        ].map(([section, key, label]) => (
          <Field key={`${section}.${key}`} label={label}>
            <Input
              type="number"
              min="1"
              value={config[section][key]}
              onChange={(e) => patch(section, key, Number(e.target.value))}
            />
          </Field>
        ))}
        <Field label="Định dạng tệp được phép (MIME, ngăn cách dấu phẩy)">
          <Input
            value={config.files.allowedMime.join(",")}
            onChange={(e) =>
              patch(
                "files",
                "allowedMime",
                e.target.value.split(",").map((v) => v.trim()),
              )
            }
          />
        </Field>
        <Field label="Nhắc nháp trước hạn (giờ, ngăn cách dấu phẩy)">
          <Input
            value={config.reminders.draftHoursBefore.join(",")}
            onChange={(e) =>
              patch(
                "reminders",
                "draftHoursBefore",
                e.target.value.split(",").map(Number),
              )
            }
          />
        </Field>
        {["host", "port", "username", "fromName"].map((key) => (
          <Field key={key} label={`SMTP ${key}`}>
            <Input
              value={config.smtp[key]}
              onChange={(e) =>
                patch(
                  "smtp",
                  key,
                  key === "port" ? Number(e.target.value) : e.target.value,
                )
              }
            />
          </Field>
        ))}
        <Field label="Chuỗi mô phỏng email lỗi">
          <Input
            value={config.email.failPattern}
            onChange={(e) => patch("email", "failPattern", e.target.value)}
          />
        </Field>
        <Field label="Mẫu email">
          <Select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          >
            {Object.keys(config.templates).map((k) => (
              <option key={k}>{k}</option>
            ))}
          </Select>
        </Field>
        {["subject", "body"].map((key) => (
          <Field
            key={key}
            label={
              key === "subject"
                ? "Tiêu đề mẫu"
                : "Nội dung mẫu (giữ các biến {{...}})"
            }
          >
            <Textarea
              value={config.templates[template][key]}
              onChange={(e) =>
                patch("templates", template, {
                  ...config.templates[template],
                  [key]: e.target.value,
                })
              }
            />
          </Field>
        ))}
        <Button
          loading={action.busy}
          onClick={() => action.run("system.updateConfig", { config })}
        >
          Lưu cấu hình
        </Button>
        <Field label="Email nhận thử">
          <Input
            type="email"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </Field>
        <Button
          variant="secondary"
          onClick={() => action.run("system.testEmail", { to: target })}
        >
          Gửi email thử
        </Button>
      </div>
    );
  }
  return null;
}

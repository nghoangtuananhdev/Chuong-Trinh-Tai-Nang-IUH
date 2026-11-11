import { useState } from "react";
import { FlaskConical, Clock, Mail, Users, Database } from "lucide-react";
import { useBackend } from "../../mock/backend.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";
import { Drawer } from "../../components/ui/Drawer.jsx";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Field, Input, Select } from "../../components/ui/Form.jsx";
import { FilterTabs } from "../../components/ui/FilterTabs.jsx";
import { CodeTag, Callout } from "../../components/ui/Display.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Pagination } from "../../components/ui/Pagination.jsx";
import { usePagedFilter } from "../../hooks/usePagedFilter.js";
import { addHours, addDays, formatIct, toIct } from "../../domain/time.js";
import { nextRoundMilestone } from "../../domain/selectors.js";
import { ROLE_LABEL } from "../../domain/constants.js";
const tabs = [
  { value: "clock", label: "Đồng hồ", icon: Clock },
  { value: "mail", label: "Hộp thư mô phỏng", icon: Mail },
  { value: "users", label: "Đăng nhập nhanh", icon: Users },
  { value: "data", label: "Dữ liệu", icon: Database },
];
export function DemoPanel({ open, onOpenChange, onLogin }) {
  const { db, now, call, me } = useBackend(),
    { showToast } = useToast();
  const [tab, setTab] = useState("clock"),
    [date, setDate] = useState(""),
    [roundId, setRoundId] = useState("DXT-2026-06");
  const [busy, setBusy] = useState(false),
    [reset, setReset] = useState(false),
    [selectedEmail, setSelectedEmail] = useState(null);
  const inbox = usePagedFilter([...db.emailOutbox].reverse(), {
    match: (e, q) => `${e.to} ${e.subject}`.toLowerCase().includes(q),
  });
  const accounts = usePagedFilter(db.users, {
    match: (u, q) =>
      `${u.fullName} ${u.username} ${u.email}`.toLowerCase().includes(q),
  });
  const run = async (name, payload, message) => {
    setBusy(true);
    try {
      const result = await call(name, payload);
      if (message)
        showToast(typeof message === "function" ? message(result) : message);
      return result;
    } catch (error) {
      showToast(error.message, "error");
      return null;
    } finally {
      setBusy(false);
    }
  };
  const clock = (value) =>
    run(
      "system.setClock",
      { now: value },
      (r) => `Đã chạy tác vụ định kỳ: ${r.changes} thay đổi.`,
    );
  const exportDb = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(db, null, 2)], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "kstn-prototype-v3.json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <>
      <Button
        icon={FlaskConical}
        variant="secondary"
        onClick={() => onOpenChange(true)}
        className="fixed bottom-4 right-4 z-40 shadow-overlay"
      >
        Bảng điều khiển demo
      </Button>
      <Drawer
        open={open}
        onClose={() => onOpenChange(false)}
        title="Bảng điều khiển demo"
        description="Chỉ dùng cho bản prototype"
        side="left"
        size="lg"
      >
        <FilterTabs
          options={tabs}
          value={tab}
          onChange={setTab}
          label="Chức năng demo"
        />
        <div className="mt-5 space-y-4">
          {tab === "clock" && (
            <>
              <Callout title="Giờ mô phỏng (GMT+7)">
                <p className="mt-1 font-mono" aria-live="polite">
                  {formatIct(now)}
                </p>
              </Callout>
              <Field label="Đặt ngày giờ mô phỏng">
                <Input
                  type="datetime-local"
                  value={date || toIct(now).slice(0, 16)}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button
                  loading={busy}
                  onClick={() =>
                    clock(`${date || toIct(now).slice(0, 16)}:00+07:00`)
                  }
                >
                  Đặt giờ
                </Button>
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={() => clock(addHours(now, 1))}
                >
                  +1 giờ
                </Button>
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={() => clock(addDays(now, 1))}
                >
                  +1 ngày
                </Button>
              </div>
              <Field label="ĐXT để đến mốc tiếp theo">
                <Select
                  value={roundId}
                  onChange={(e) => setRoundId(e.target.value)}
                >
                  {db.rounds
                    .filter((r) => r.status !== "draft")
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.code}
                      </option>
                    ))}
                </Select>
              </Field>
              <Button
                variant="secondary"
                disabled={busy || !nextRoundMilestone(db, roundId)}
                onClick={() => clock(nextRoundMilestone(db, roundId))}
              >
                Đến mốc kế tiếp của ĐXT
              </Button>
              <p className="text-body-sm text-ink-600">
                Mở R6: 15/11/2026 00:00. Quá hạn bổ sung hồ sơ Bảo: 12/11/2026
                09:01.
              </p>
            </>
          )}
          {tab === "mail" && (
            <>
              <Field label="Lọc theo người nhận hoặc tiêu đề">
                <Input
                  type="search"
                  value={inbox.query}
                  onChange={(e) => inbox.setQuery(e.target.value)}
                />
              </Field>
              {!inbox.total && (
                <p className="text-body text-ink-600">
                  Hộp thư chưa có email phù hợp.
                </p>
              )}
              <ul className="divide-y divide-ink-200">
                {inbox.rows.map((e) => (
                  <li key={e.id} className="py-3">
                    <button
                      type="button"
                      className="w-full rounded-control text-left hover:bg-ink-25"
                      onClick={() => setSelectedEmail(e.id)}
                    >
                      <p className="break-all text-body-sm text-ink-600">
                        {e.to}
                      </p>
                      <p className="my-1 text-body font-semibold">
                        {e.subject}
                      </p>
                      <StatusBadge domain="email">{e.status}</StatusBadge>
                    </button>
                  </li>
                ))}
              </ul>
              <Pagination {...inbox} onChange={inbox.setPage} />
              {selectedEmail &&
                db.emailOutbox.find((e) => e.id === selectedEmail) &&
                (() => {
                  const e = db.emailOutbox.find((e) => e.id === selectedEmail);
                  const link = e.body.match(
                    /#\/dat-lai-mat-khau\?token=[^\s]+/,
                  )?.[0];
                  return (
                    <section className="rounded-card border border-ink-200 bg-ink-25 p-4">
                      <h3 className="text-title-3">{e.subject}</h3>
                      <p className="mt-3 whitespace-pre-wrap break-words text-body">
                        {e.body.split(/(\d{6})/g).map((part, i) =>
                          /^\d{6}$/.test(part) ? (
                            <strong key={i} className="font-mono text-title-2">
                              {part}
                            </strong>
                          ) : (
                            part
                          ),
                        )}
                      </p>
                      {link && (
                        <a
                          href={link}
                          onClick={() => onOpenChange(false)}
                          className="mt-3 block break-all text-brand-600 underline"
                        >
                          Mở liên kết đặt lại mật khẩu
                        </a>
                      )}
                    </section>
                  );
                })()}
            </>
          )}
          {tab === "users" && (
            <>
              <p className="text-body-sm text-ink-600">
                Mật khẩu các tài khoản mẫu: <CodeTag>demo1234</CodeTag>
              </p>
              <Field label="Tìm tài khoản demo">
                <Input
                  type="search"
                  value={accounts.query}
                  onChange={(e) => accounts.setQuery(e.target.value)}
                />
              </Field>
              <ul className="divide-y divide-ink-200">
                {accounts.rows.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-start justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-body font-semibold">{u.fullName}</p>
                      <CodeTag>{u.username}</CodeTag>
                      <p className="mt-1 text-body-sm text-ink-600">
                        {db.userRoles
                          .filter((r) => r.userId === u.id)
                          .map((r) => ROLE_LABEL[r.role])
                          .join(" · ")}
                      </p>
                      {u.mustChangePassword && (
                        <p className="text-body-sm text-warning-fg">
                          Buộc đổi mật khẩu khi đăng nhập
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy}
                      onClick={async () => {
                        const r = await run(
                          "system.demoLogin",
                          { userId: u.id },
                          "Đã đăng nhập tài khoản demo.",
                        );
                        if (r) {
                          onOpenChange(false);
                          onLogin?.();
                        }
                      }}
                    >
                      {me?.id === u.id ? "Vào tài khoản" : "Đăng nhập"}
                    </Button>
                  </li>
                ))}
              </ul>
              <Pagination {...accounts} onChange={accounts.setPage} />
              <Callout title="Dùng để đăng ký mới">
                26019999 · khang.26019999@student.iuh.edu.vn
                <br />
                26018888 · 26018888@student.iuh.edu.vn
              </Callout>
            </>
          )}
          {tab === "data" && (
            <>
              <Callout title={`Phiên bản dữ liệu: ${db.schemaVersion}`}>
                Dữ liệu được lưu trên trình duyệt. Khôi phục sẽ xóa cả minh
                chứng bạn đã tải.
              </Callout>
              <Button variant="secondary" onClick={exportDb}>
                Xuất JSON db
              </Button>
              <Button
                variant="dangerOutline"
                disabled={busy}
                onClick={() => setReset(true)}
              >
                Khôi phục dữ liệu mẫu
              </Button>
            </>
          )}
        </div>
      </Drawer>
      <ConfirmDialog
        open={reset}
        title="Khôi phục dữ liệu mẫu?"
        description="Toàn bộ thay đổi và tệp minh chứng trên trình duyệt sẽ bị xóa. Phiên đăng nhập hiện tại cũng kết thúc."
        confirmLabel="Khôi phục dữ liệu mẫu"
        loading={busy}
        onCancel={() => setReset(false)}
        onConfirm={async () => {
          const r = await run(
            "system.resetDemo",
            {},
            "Đã khôi phục dữ liệu mẫu.",
          );
          if (r) {
            setDate("");
            setSelectedEmail(null);
            setReset(false);
          }
        }}
      />
    </>
  );
}

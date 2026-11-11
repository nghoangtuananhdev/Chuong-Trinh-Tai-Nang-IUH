import { Info, ShieldAlert } from "lucide-react";

/** Trạng thái toàn trang: không quyền, không tìm thấy, đang tải. */
export function StatePage({ tone = "neutral", icon, title, children, action }) {
  const danger = tone === "danger";
  const Icon = icon || (danger ? ShieldAlert : Info);
  return (
    <div role={danger ? "alert" : "status"} className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
      <span className={`mb-4 flex size-12 items-center justify-center rounded-full ${danger ? "bg-danger-bg text-danger-fg" : "bg-ink-100 text-ink-600"}`}>
        <Icon size={22} aria-hidden="true" />
      </span>
      {title && <h2 className="text-title-2 text-ink-900">{title}</h2>}
      {children && <div className={`${title ? "mt-1" : ""} text-body text-ink-600`}>{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

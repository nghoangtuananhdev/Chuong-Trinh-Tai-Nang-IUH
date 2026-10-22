import { useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

const config = {
  success: { icon: CheckCircle2, bar: "bg-success-solid", ic: "text-success-solid", ttl: 4000 },
  info: { icon: Info, bar: "bg-info-solid", ic: "text-info-solid", ttl: 4000 },
  warning: { icon: AlertTriangle, bar: "bg-warning-solid", ic: "text-warning-solid", ttl: 6000 },
  error: { icon: AlertCircle, bar: "bg-danger-solid", ic: "text-danger-solid", ttl: 0 }
};

function ToastItem({ toast, onClose }) {
  const current = config[toast.type] || config.success;
  const Icon = current.icon;
  const [paused, setPaused] = useState(false);
  const remaining = useRef(current.ttl);
  const startedAt = useRef(0);

  useEffect(() => {
    if (!current.ttl || paused) return undefined;
    startedAt.current = Date.now();
    const timer = setTimeout(() => onClose(toast.id), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current = Math.max(800, remaining.current - (Date.now() - startedAt.current));
    };
  }, [paused, current.ttl, onClose, toast.id]);

  const isError = toast.type === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="toast-in pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-control border border-ink-200 bg-white py-3 pl-5 pr-3 text-ink-900 shadow-overlay"
    >
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-[3px] ${current.bar}`} />
      <Icon size={18} className={`mt-0.5 shrink-0 ${current.ic}`} aria-hidden="true" />
      <span className="flex-1 text-body font-medium text-ink-900">{toast.message}</span>
      <button
        type="button"
        onClick={() => onClose(toast.id)}
        aria-label="Đóng thông báo"
        className="shrink-0 rounded-xs p-1 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

export function ToastStack({ toasts, onClose }) {
  if (!toasts || toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-4 top-4 z-60 flex flex-col gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:top-auto sm:w-[400px] sm:flex-col-reverse">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={onClose} />
      ))}
    </div>
  );
}

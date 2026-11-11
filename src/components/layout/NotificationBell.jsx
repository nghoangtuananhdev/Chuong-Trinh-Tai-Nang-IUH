import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useBackend } from "../../mock/backend.jsx";
import { useToast } from "../ui/ToastProvider.jsx";
import { navigate } from "../../app/router.js";
export function NotificationBell() {
  const { db, me, call } = useBackend();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const container = useRef(null),
    trigger = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (
        e.type === "hashchange" ||
        (e.type === "keydown" && e.key === "Escape") ||
        (e.type === "pointerdown" && !container.current?.contains(e.target))
      ) {
        setOpen(false);
        if (e.type === "keydown") trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    window.addEventListener("hashchange", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
      window.removeEventListener("hashchange", close);
    };
  }, [open]);
  const all = db.notifications
    .filter((n) => n.userId === me.id)
    .slice()
    .reverse();
  const unread = all.filter((n) => !n.readAt).length;
  return (
    <div ref={container} className="relative">
      <button
        ref={trigger}
        type="button"
        aria-label={`Thông báo (${unread})`}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="relative inline-flex size-9 shrink-0 items-center justify-center rounded-control border border-ink-200 bg-white text-ink-600 shadow-raised transition-colors hover:border-ink-400 hover:bg-ink-25 hover:text-ink-900 max-sm:size-10"
      >
        <Bell size={16} aria-hidden="true" />
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-solid px-1 text-caption font-semibold tabular-nums text-white"
          >
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="popover-in absolute right-0 z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-card border border-ink-200 bg-white p-1.5 shadow-overlay">
          {all.slice(0, 5).map((n) => (
            <button
              key={n.id}
              className={`flex w-full items-start gap-2.5 rounded-control px-3 py-2.5 text-left text-body-sm text-ink-900 transition-colors hover:bg-ink-50 ${n.readAt ? "" : "font-semibold"}`}
              onClick={async () => {
                try {
                  await call("me.markRead", { id: n.id });
                  setOpen(false);
                  navigate(n.link);
                } catch (error) {
                  showToast(error.message, "error");
                }
              }}
            >
              <span
                aria-hidden="true"
                className={`mt-1.5 size-2 shrink-0 rounded-full ${n.readAt ? "bg-transparent" : "bg-brand-600"}`}
              />
              <span className="min-w-0 flex-1">{n.title}</span>
            </button>
          ))}
          <div className="mt-1.5 border-t border-ink-200 pt-1.5">
            <button
              type="button"
              className="flex min-h-10 w-full items-center rounded-control px-3 text-left text-body-sm font-medium text-brand-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
              onClick={() => {
                setOpen(false);
                navigate("/app/notifications");
              }}
            >
              Xem tất cả
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

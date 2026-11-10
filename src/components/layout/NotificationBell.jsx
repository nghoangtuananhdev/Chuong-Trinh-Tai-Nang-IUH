import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useBackend } from "../../mock/backend.jsx";
import { Button } from "../ui/Button.jsx";
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
  return (
    <div ref={container} className="relative">
      <Button
        ref={trigger}
        icon={Bell}
        variant="secondary"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        Thông báo ({all.filter((n) => !n.readAt).length})
      </Button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-card border border-ink-200 bg-white p-3 shadow-overlay">
          {all.slice(0, 5).map((n) => (
            <button
              key={n.id}
              className="block w-full border-b border-ink-200 py-3 text-left text-body-sm"
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
              {n.title}
            </button>
          ))}
          <Button
            variant="link"
            onClick={() => {
              setOpen(false);
              navigate("/app/notifications");
            }}
          >
            Xem tất cả
          </Button>
        </div>
      )}
    </div>
  );
}

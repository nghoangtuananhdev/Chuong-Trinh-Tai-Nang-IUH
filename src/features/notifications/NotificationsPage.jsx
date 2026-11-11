import { useState } from "react";
import { Bell } from "lucide-react";
import { useBackend } from "../../mock/backend.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { ActionBar } from "../../components/layout/ActionBar.jsx";
import { useAction } from "../shared/FeatureKit.jsx";
import { navigate } from "../../app/router.js";
import { formatIct } from "../../domain/time.js";
export function NotificationsPage() {
  const { db, me } = useBackend();
  const { run } = useAction();
  const [unread, setUnread] = useState(false);
  const rows = db.notifications
    .filter((n) => n.userId === me.id && (!unread || !n.readAt))
    .slice()
    .reverse();
  return (
    <div className="space-y-4">
      <ActionBar
        start={
          <Button
            variant="secondary"
            aria-pressed={unread}
            onClick={() => setUnread(!unread)}
          >
            {unread ? "Xem tất cả" : "Chỉ xem chưa đọc"}
          </Button>
        }
      >
        <Button variant="secondary" onClick={() => run("me.markRead", {})}>
          Đánh dấu tất cả đã đọc
        </Button>
      </ActionBar>
      <div className="surface overflow-hidden">
        {rows.length === 0 && (
          <EmptyState
            icon={Bell}
            title="Chưa có thông báo phù hợp."
            description={null}
          />
        )}
        {rows.length > 0 && (
          <ul className="divide-y divide-ink-200">
            {rows.map((n) => (
              <li key={n.id}>
                <button
                  className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-ink-25"
                  onClick={async () => {
                    const r = await run("me.markRead", { id: n.id }, "");
                    if (r.ok) navigate(n.link);
                  }}
                >
                  <span
                    aria-hidden="true"
                    className={`mt-2 size-2 shrink-0 rounded-full ${n.readAt ? "bg-transparent" : "bg-brand-600"}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-body ${n.readAt ? "" : "font-semibold"}`}
                    >
                      {n.title}
                    </span>
                    <span className="block text-body-sm text-ink-600">
                      {n.body}
                    </span>
                  </span>
                  <span className="whitespace-nowrap text-caption tabular-nums text-ink-600">
                    {formatIct(n.createdAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

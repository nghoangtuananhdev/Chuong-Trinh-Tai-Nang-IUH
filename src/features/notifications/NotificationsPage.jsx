import { useState } from "react";
import { useBackend } from "../../mock/backend.jsx";
import { Button } from "../../components/ui/Button.jsx";
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
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setUnread(!unread)}>
          {unread ? "Xem tất cả" : "Chỉ xem chưa đọc"}
        </Button>
        <Button onClick={() => run("me.markRead", {})}>
          Đánh dấu tất cả đã đọc
        </Button>
      </div>
      {rows.length === 0 && <p>Chưa có thông báo phù hợp.</p>}
      {rows.map((n) => (
        <button
          key={n.id}
          className="block w-full rounded-card border border-ink-200 bg-white p-4 text-left"
          onClick={async () => {
            const r = await run("me.markRead", { id: n.id }, "");
            if (r.ok) navigate(n.link);
          }}
        >
          <p className={`text-body ${n.readAt ? "" : "font-bold"}`}>
            {n.title}
          </p>
          <p className="text-body-sm text-ink-600">{n.body}</p>
          <p className="text-caption text-ink-500">{formatIct(n.createdAt)}</p>
        </button>
      ))}
    </div>
  );
}

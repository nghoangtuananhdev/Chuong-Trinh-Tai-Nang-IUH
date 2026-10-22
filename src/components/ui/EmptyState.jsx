import { Search } from "lucide-react";
import { Button } from "./Button.jsx";

export function EmptyState({
  icon: Icon = Search,
  title = "Không tìm thấy dữ liệu",
  description = "Hãy thử thay đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc.",
  actionLabel,
  onAction,
  compact = false
}) {
  return (
    <div className={`flex flex-col items-center justify-center px-4 text-center ${compact ? "py-8" : "py-14"}`}>
      <div className="academic-grid on-light relative mb-4 flex size-24 items-center justify-center">
        <div className="relative flex size-12 items-center justify-center rounded-card border border-ink-200 bg-ink-50 text-ink-400 shadow-raised">
          <Icon size={22} aria-hidden="true" />
        </div>
      </div>
      <h3 className="text-title-3 text-ink-900">{title}</h3>
      <p className="mt-1 max-w-[40ch] text-body-sm text-ink-600">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

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
    <div className={`flex flex-col items-center justify-center px-4 text-center ${compact ? "py-6" : "py-10"}`}>
      <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-ink-100 text-ink-500">
        <Icon size={20} aria-hidden="true" />
      </span>
      <h3 className="text-title-3 text-ink-900">{title}</h3>
      {description != null && description !== false && <p className="mt-1 max-w-[44ch] text-body-sm text-ink-600">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

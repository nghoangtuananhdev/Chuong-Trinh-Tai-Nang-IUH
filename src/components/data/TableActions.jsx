import { Eye, Pencil, Trash2 } from "lucide-react";
import { IconButton } from "../ui/IconButton.jsx";

export function TableActions({
  onView,
  onEdit,
  onDelete,
  readonly = false,
  viewLabel = "Xem chi tiết",
  editLabel = "Chỉnh sửa",
  deleteLabel = "Xóa bản ghi",
  extra = null,
  className = "justify-end"
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {extra}
      {onView && <IconButton icon={Eye} label={viewLabel} size="sm" variant="tertiary" onClick={onView} />}
      {!readonly && onEdit && <IconButton icon={Pencil} label={editLabel} size="sm" variant="tertiary" onClick={onEdit} />}
      {!readonly && onDelete && <IconButton icon={Trash2} label={deleteLabel} size="sm" variant="danger" onClick={onDelete} />}
    </div>
  );
}

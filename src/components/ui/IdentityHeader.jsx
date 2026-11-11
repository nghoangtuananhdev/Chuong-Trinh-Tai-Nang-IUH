import { Avatar } from "./Display.jsx";

/** Thẻ danh tính: avatar + tên + dòng phụ. `as` cho phép tên là h2/h3. */
export function IdentityHeader({ name, meta, aside, size = 40, as: Tag = "p", className = "" }) {
  const initialsName = typeof name === "string" ? name : undefined;
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Avatar name={initialsName} size={size} round />
      <div className="min-w-0 flex-1">
        <Tag className="truncate text-title-3 text-ink-900">{name}</Tag>
        {meta && <p className="text-body-sm text-ink-600 break-words">{meta}</p>}
      </div>
      {aside}
    </div>
  );
}

import { useId, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Eye, FileText, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { Button } from "./Button.jsx";
import { IconButton } from "./IconButton.jsx";

/**
 * Vùng chọn / kéo-thả tệp. Input thật là sr-only nên bàn phím dùng nút bên trong (gọi input.click()).
 */
export function FileDropzone({
  onFiles,
  accept = "application/pdf,.pdf",
  multiple = false,
  compact = false,
  disabled = false,
  children,
  buttonLabel = "Chọn tệp PDF",
  className = ""
}) {
  const inputRef = useRef(null);
  const id = useId();
  const [dragging, setDragging] = useState(false);

  const handleFiles = (list) => {
    const files = Array.from(list || []);
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  };

  return (
    <div
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      className={`flex ${compact ? "flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center" : "flex-col items-center gap-2 px-4 py-6 text-center"} rounded-card border-[1.5px] border-dashed transition-colors duration-120 ${
        dragging ? "border-brand-600 bg-brand-25" : "border-ink-300 bg-ink-25"
      } ${className}`}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <UploadCloud size={compact ? 20 : 24} aria-hidden="true" className="shrink-0 text-brand-600" />
        <p className="min-w-0 text-body-sm text-ink-600">
          <span className="block">Kéo thả tệp vào đây hoặc</span>
          {children}
        </p>
      </div>
      <Button variant="secondary" size="sm" disabled={disabled} onClick={() => inputRef.current?.click()} className="shrink-0">
        {buttonLabel}
      </Button>
    </div>
  );
}

function middleEllipsis(name, max = 34) {
  if (!name || name.length <= max) return name;
  const keep = max - 1;
  const tail = Math.ceil(keep * 0.4);
  return `${name.slice(0, keep - tail)}…${name.slice(-tail)}`;
}

/** Một tệp đã đính kèm. */
export function FileItem({
  name,
  size,
  status = "ok",
  label,
  viewLabel = "Xem tệp",
  replaceLabel = "Thay thế tệp",
  removeLabel = "Xóa tệp",
  onView,
  onReplace,
  onRemove,
  className = ""
}) {
  return (
    <div className={`flex items-center gap-3 rounded-control border border-ink-200 bg-white p-3 shadow-raised ${className}`}>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-danger-bg text-danger-fg">
        <FileText size={18} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        {label && <p className="truncate text-body-sm text-ink-600">{label}</p>}
        <p className="truncate text-body font-semibold text-ink-900" title={name}>
          {middleEllipsis(name)}
        </p>
        <p className="flex items-center gap-1.5 text-body-sm text-ink-500">
          {size && <span className="tabular-nums">{size}</span>}
          {status === "ok" ? (
            <CheckCircle2 size={14} aria-hidden="true" className="text-success-solid" />
          ) : (
            <AlertTriangle size={14} aria-hidden="true" className="text-danger-solid" />
          )}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        {onView && <IconButton icon={Eye} label={viewLabel} variant="tertiary" size="sm" onClick={onView} />}
        {onReplace && <IconButton icon={RefreshCw} label={replaceLabel} variant="tertiary" size="sm" onClick={onReplace} />}
        {onRemove && <IconButton icon={Trash2} label={removeLabel} variant="danger" size="sm" onClick={onRemove} />}
      </div>
    </div>
  );
}

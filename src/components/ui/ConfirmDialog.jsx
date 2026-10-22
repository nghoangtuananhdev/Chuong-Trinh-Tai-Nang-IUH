import { useId, useRef } from "react";
import { AlertTriangle, CheckCircle2, Info, Trash2 } from "lucide-react";
import { Button } from "./Button.jsx";
import { useDialogA11y } from "./useDialogA11y.js";

const tones = {
  danger: { icon: Trash2, box: "bg-danger-bg text-danger-fg", note: "bg-danger-bg text-danger-fg", confirm: "danger" },
  warning: { icon: AlertTriangle, box: "bg-warning-bg text-warning-solid", note: "bg-warning-bg text-warning-fg", confirm: "primary" },
  info: { icon: Info, box: "bg-info-bg text-info-solid", note: "bg-info-bg text-info-fg", confirm: "primary" },
  success: { icon: CheckCircle2, box: "bg-success-bg text-success-solid", note: "bg-success-bg text-success-fg", confirm: "primary" }
};

/**
 * Hộp xác nhận / thông báo chặn. Bố cục căn trái.
 * Chỉ truyền `confirmLabel` + `onConfirm` khi có hành động xác nhận; chỉ có `cancelLabel` cho thông báo chặn.
 * Với hành động nguy hiểm, focus mặc định ở nút hủy.
 */
export function ConfirmDialog({
  open,
  tone = "danger",
  icon,
  title,
  description,
  note,
  children,
  confirmLabel,
  cancelLabel = "Hủy",
  confirmVariant,
  onConfirm,
  onCancel,
  loading = false
}) {
  const panelRef = useRef(null);
  const titleId = useId();
  const descId = useId();
  useDialogA11y({ open, onClose: onCancel, panelRef });

  if (!open) return null;

  const t = tones[tone] || tones.danger;
  const Icon = icon || t.icon;
  const focusConfirm = tone !== "danger" && Boolean(confirmLabel);

  return (
    <div className="overlay-backdrop fixed inset-0 z-[55] flex items-end justify-center sm:items-center sm:p-6">
      <section
        ref={panelRef}
        tabIndex={-1}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="overlay-panel w-full rounded-t-modal bg-white shadow-modal outline-none sm:max-w-[480px] sm:rounded-modal"
      >
        <div className="flex gap-4 px-5 pb-5 pt-6 sm:px-6">
          <span className={`flex size-10 shrink-0 items-center justify-center rounded-card ${t.box}`}>
            <Icon size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-title-3 text-ink-900">
              {title}
            </h2>
            <div id={descId} className="mt-1.5 text-body text-ink-600">
              {description}
            </div>
            {children}
          </div>
        </div>
        {note && <div className={`mx-5 mb-5 rounded-control px-3 py-2 text-body-sm font-medium sm:mx-6 ${t.note}`}>{note}</div>}
        <footer className="flex flex-wrap items-center justify-end gap-2.5 rounded-b-modal border-t border-ink-200 bg-ink-25 px-5 py-3.5 sm:px-6">
          <Button variant="secondary" onClick={onCancel} data-autofocus={focusConfirm ? undefined : ""}>
            {cancelLabel}
          </Button>
          {confirmLabel && (
            <Button
              variant={confirmVariant || t.confirm}
              onClick={onConfirm}
              loading={loading}
              data-autofocus={focusConfirm ? "" : undefined}
            >
              {confirmLabel}
            </Button>
          )}
        </footer>
      </section>
    </div>
  );
}

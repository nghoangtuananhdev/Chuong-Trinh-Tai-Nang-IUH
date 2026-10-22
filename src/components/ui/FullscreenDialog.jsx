import { useId, useRef } from "react";
import { X } from "lucide-react";
import { IconButton } from "./IconButton.jsx";
import { useDialogA11y } from "./useDialogA11y.js";

/** Overlay toàn màn hình (vẫn là role="dialog", dùng chung focus trap). */
export function FullscreenDialog({ open, onClose, title, subtitle, eyebrow, headerActions, children }) {
  const panelRef = useRef(null);
  const titleId = useId();
  useDialogA11y({ open, onClose, panelRef });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-ink-50 page-in">
      <section
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex h-full flex-col outline-none"
      >
        <header className="z-20 flex shrink-0 items-center gap-3 border-b border-ink-200 bg-white px-4 py-3 shadow-raised sm:px-6">
          <IconButton icon={X} label="Đóng" variant="secondary" onClick={onClose} />
          <div className="min-w-0 flex-1">
            {eyebrow && <div className="mb-0.5 flex flex-wrap items-center gap-2">{eyebrow}</div>}
            <h2 id={titleId} className="truncate text-title-3 text-ink-900">
              {title}
            </h2>
            {subtitle && <p className="truncate text-body-sm text-ink-600">{subtitle}</p>}
          </div>
          {headerActions && <div className="flex shrink-0 items-center gap-1">{headerActions}</div>}
        </header>
        <div className="relative min-h-0 flex-1">{children}</div>
      </section>
    </div>
  );
}

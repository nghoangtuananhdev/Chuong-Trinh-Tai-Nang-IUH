import { useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { IconButton } from "./IconButton.jsx";
import { useDialogA11y } from "./useDialogA11y.js";

const sizeClasses = {
  sm: "sm:max-w-[440px]",
  md: "sm:max-w-[620px]",
  lg: "sm:max-w-[840px]",
  xl: "sm:max-w-[1040px]"
};

/**
 * Hộp thoại giữa màn hình; dưới 640px tự thành bottom sheet.
 * `closeOnBackdrop={false}` cho modal chứa form để tránh mất dữ liệu khi bấm nhầm ra ngoài.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  eyebrow,
  children,
  size = "md",
  footer = null,
  closeOnBackdrop = true
}) {
  const panelRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();
  const [scrolled, setScrolled] = useState(false);

  useDialogA11y({ open, onClose, panelRef });

  if (!open) return null;

  const large = size === "lg" || size === "xl";

  return (
    <div
      className="overlay-backdrop fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose?.();
      }}
    >
      <section
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={`overlay-panel flex max-h-[92vh] w-full flex-col rounded-t-modal bg-white text-ink-900 shadow-modal outline-none sm:max-h-[90vh] sm:rounded-modal ${sizeClasses[size] || sizeClasses.md}`}
      >
        <span aria-hidden="true" className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-ink-200 sm:hidden" />

        <header
          className={`flex shrink-0 items-start justify-between gap-4 px-5 pb-4 pt-4 transition-shadow sm:px-6 sm:pt-6 ${scrolled ? "border-b border-ink-200" : "border-b border-transparent"}`}
        >
          <div className="min-w-0">
            {eyebrow && <div className="mb-2 flex flex-wrap items-center gap-2">{eyebrow}</div>}
            <h2 id={titleId} className={large ? "text-title-2 text-ink-900" : "text-title-3 text-ink-900"}>
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-body-sm text-ink-600">
                {description}
              </p>
            )}
          </div>
          <IconButton icon={X} label="Đóng" size="md" variant="tertiary" onClick={onClose} className="-mr-2 -mt-1" />
        </header>

        <div
          className="scrollbar-thin flex-1 overflow-y-auto px-5 pb-5 pt-1 sm:px-6"
          onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}
        >
          {children}
        </div>

        {footer && (
          <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2.5 rounded-b-modal border-t border-ink-200 bg-ink-25 px-5 py-3.5 sm:px-6">
            {footer}
          </footer>
        )}
      </section>
    </div>
  );
}

import { useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { IconButton } from "./IconButton.jsx";
import { useDialogA11y } from "./useDialogA11y.js";

const sizeClasses = {
  nav: "sm:w-[300px] w-[300px]",
  md: "sm:w-[480px]",
  lg: "sm:w-[640px]",
  xl: "sm:w-[880px]"
};

/**
 * Panel trượt từ phải (hoặc trái). Dưới 640px thành bottom sheet toàn màn hình
 * (trừ `sheetOnMobile={false}`, dùng cho menu điều hướng).
 */
export function Drawer({
  open,
  onClose,
  title,
  description,
  eyebrow,
  children,
  size = "md",
  footer = null,
  side = "right",
  sheetOnMobile = true,
  hideHeader = false,
  panelClassName = ""
}) {
  const panelRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();
  const [scrolled, setScrolled] = useState(false);

  useDialogA11y({ open, onClose, panelRef });

  if (!open) return null;

  const left = side === "left";

  return (
    <div
      className={`overlay-backdrop fixed inset-0 z-50 flex ${left ? "justify-start" : "justify-end"} ${sheetOnMobile ? "items-end sm:items-stretch" : "items-stretch"}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <section
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={hideHeader ? undefined : titleId}
        aria-label={hideHeader ? title : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={`${left ? "drawer-panel-left" : "drawer-panel"} flex w-full flex-col bg-white text-ink-900 shadow-modal outline-none ${
          sheetOnMobile ? "h-[92vh] rounded-t-modal sm:h-full sm:rounded-none" : "h-full"
        } ${left ? "sm:rounded-r-modal" : "sm:rounded-l-modal"} ${sizeClasses[size] || sizeClasses.md} ${panelClassName}`}
      >
        {!hideHeader && (
          <>
            {sheetOnMobile && <span aria-hidden="true" className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-ink-200 sm:hidden" />}
            <header
              className={`flex shrink-0 items-start justify-between gap-4 px-5 pb-4 pt-4 sm:px-6 sm:pt-6 ${scrolled ? "border-b border-ink-200" : "border-b border-transparent"}`}
            >
              <div className="min-w-0">
                {eyebrow && <div className="mb-2 flex flex-wrap items-center gap-2">{eyebrow}</div>}
                <h2 id={titleId} className="text-title-2 text-ink-900">
                  {title}
                </h2>
                {description && (
                  <p id={descriptionId} className="mt-1 text-body-sm text-ink-600">
                    {description}
                  </p>
                )}
              </div>
              <IconButton icon={X} label="Đóng" variant="tertiary" onClick={onClose} className="-mr-2 -mt-1" />
            </header>
          </>
        )}

        {hideHeader ? (
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        ) : (
          <div
            className="scrollbar-thin flex-1 overflow-y-auto"
            onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}
          >
            <div className="px-5 pb-6 pt-1 sm:px-6">{children}</div>
          </div>
        )}

        {footer && (
          <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2.5 border-t border-ink-200 bg-ink-25 px-5 py-3.5 sm:px-6">
            {footer}
          </footer>
        )}
      </section>
    </div>
  );
}

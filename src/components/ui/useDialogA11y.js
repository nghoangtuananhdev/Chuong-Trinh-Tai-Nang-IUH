import { useEffect, useRef } from "react";

// Ngăn xếp overlay: chỉ overlay trên cùng xử lý Esc / Tab, tránh đóng nhầm nhiều lớp cùng lúc.
const dialogStack = [];
let scrollLocks = 0;
let savedOverflow = "";

const FOCUSABLE =
  'button:not(:disabled), a[href], input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

/**
 * Focus trap, Esc, khôi phục focus, khóa cuộn body cho mọi overlay.
 * Phần tử có `data-autofocus` trong panel sẽ được focus đầu tiên; nếu không, ô nhập đầu tiên, rồi nút đầu tiên.
 */
export function useDialogA11y({ open, onClose, panelRef, closeOnEscape = true }) {
  const closeRef = useRef(onClose);
  const escRef = useRef(closeOnEscape);

  useEffect(() => {
    closeRef.current = onClose;
    escRef.current = closeOnEscape;
  }, [onClose, closeOnEscape]);

  useEffect(() => {
    if (!open) return undefined;
    const panel = panelRef.current;
    if (!panel) return undefined;

    const token = Symbol("dialog");
    dialogStack.push(token);
    const previousFocus = document.activeElement;

    const getFocusables = () =>
      Array.from(panel.querySelectorAll(FOCUSABLE)).filter((el) => el.getClientRects().length > 0);

    const isTop = () => dialogStack[dialogStack.length - 1] === token;

    const handleKeyDown = (event) => {
      if (!isTop()) return;
      if (event.key === "Escape" && escRef.current) {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current?.();
        return;
      }
      if (event.key === "Tab") {
        const focusables = getFocusables();
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!first) {
          event.preventDefault();
          panel.focus();
          return;
        }
        const active = document.activeElement;
        if (event.shiftKey && (active === first || active === panel)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    const handleFocusIn = (event) => {
      if (!isTop()) return;
      if (!panel.contains(event.target)) {
        const focusables = getFocusables();
        (focusables[0] || panel).focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("focusin", handleFocusIn);

    if (scrollLocks === 0) {
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    scrollLocks += 1;

    const initial =
      panel.querySelector("[data-autofocus]") ||
      panel.querySelector("input:not(:disabled):not([type='hidden']):not([type='file']), select:not(:disabled), textarea:not(:disabled)") ||
      getFocusables()[0] ||
      panel;
    initial.focus({ preventScroll: true });

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("focusin", handleFocusIn);
      const idx = dialogStack.indexOf(token);
      if (idx >= 0) dialogStack.splice(idx, 1);
      scrollLocks = Math.max(0, scrollLocks - 1);
      if (scrollLocks === 0) document.body.style.overflow = savedOverflow;
      if (previousFocus && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open, panelRef]);
}

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function Tooltip({ label, children, side = "top", delay = 400, disabled = false, className = "inline-flex" }) {
  const wrapRef = useRef(null);
  const timerRef = useRef(null);
  const [pos, setPos] = useState(null);
  const id = useId();

  const show = (immediate) => {
    if (disabled || !label) return;
    clearTimeout(timerRef.current);
    const run = () => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const flip = side === "top" ? rect.top < 48 : false;
      if (side === "right") {
        setPos({ left: rect.right + 8, top: rect.top + rect.height / 2, placement: "right" });
      } else {
        setPos({
          left: rect.left + rect.width / 2,
          top: flip || side === "bottom" ? rect.bottom + 8 : rect.top - 8,
          placement: flip || side === "bottom" ? "bottom" : "top"
        });
      }
    };
    if (immediate) run();
    else timerRef.current = setTimeout(run, delay);
  };

  const hide = () => {
    clearTimeout(timerRef.current);
    setPos(null);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (!pos) return undefined;
    const onKey = (e) => e.key === "Escape" && hide();
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", hide, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", hide, true);
    };
  }, [pos]);

  const transform =
    pos?.placement === "right" ? "translateY(-50%)" : pos?.placement === "bottom" ? "translateX(-50%)" : "translate(-50%, -100%)";

  return (
    <span
      ref={wrapRef}
      className={className}
      onMouseEnter={() => show(false)}
      onMouseLeave={hide}
      onFocus={(e) => e.target.matches?.(":focus-visible") && show(false)}
      onBlur={hide}
      onMouseDown={hide}
      aria-describedby={pos ? id : undefined}
    >
      {children}
      {pos &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            style={{ position: "fixed", left: pos.left, top: pos.top, transform }}
            className="popover-in pointer-events-none z-70 max-w-[240px] rounded-xs bg-ink-900 px-2 py-1 text-caption font-medium text-white shadow-overlay"
          >
            {label}
          </span>,
          document.body
        )}
    </span>
  );
}

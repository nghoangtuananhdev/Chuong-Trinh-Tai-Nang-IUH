import { useRef } from "react";

/**
 * Bộ lọc dạng radio group có đếm số.
 * options: [{ value, label, count }]; value "" = tất cả.
 * appearance: "segmented" (rãnh, dùng trong toolbar) | "underline" (trang công khai).
 */
export function FilterTabs({ options, value, onChange, label, appearance = "segmented", className = "" }) {
  const groupRef = useRef(null);

  const onKeyDown = (e) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const idx = options.findIndex((o) => o.value === value);
    let next = idx;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (idx - 1 + options.length) % options.length;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (idx + 1) % options.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = options.length - 1;
    onChange(options[next].value);
    requestAnimationFrame(() => groupRef.current?.querySelectorAll('[role="radio"]')[next]?.focus());
  };

  const underline = appearance === "underline";

  return (
    <div className={`mask-x -mx-1 overflow-x-auto px-1 scrollbar-thin ${className}`}>
      <div
        ref={groupRef}
        role="radiogroup"
        aria-label={label}
        onKeyDown={onKeyDown}
        className={
          underline
            ? "flex min-w-max items-center gap-1"
            : "inline-flex min-w-max items-center gap-0.5 rounded-control bg-ink-100 p-0.5"
        }
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value || "all"}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(opt.value)}
              className={
                underline
                  ? `relative inline-flex h-11 items-center gap-2 px-3 text-body font-medium transition-colors duration-120 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors ${
                      active ? "text-brand-700 after:bg-brand-600" : "text-ink-600 after:bg-transparent hover:text-ink-900"
                    }`
                  : `inline-flex h-8 items-center gap-2 rounded-[8px] px-3 text-body-sm font-medium transition-[background-color,box-shadow,color] duration-180 ${
                      active ? "bg-white text-ink-900 shadow-raised" : "text-ink-600 hover:text-ink-900"
                    }`
              }
            >
              <span>{opt.label}</span>
              {opt.count != null && (
                <span
                  className={`min-w-5 rounded-full px-1.5 text-center text-caption font-semibold tabular-nums ${
                    active ? "bg-brand-50 text-brand-700" : "bg-white/70 text-ink-500"
                  }`}
                >
                  {opt.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

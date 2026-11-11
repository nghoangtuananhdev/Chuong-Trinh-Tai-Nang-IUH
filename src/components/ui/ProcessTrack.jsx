/**
 * Chuỗi bước tuần tự dạng đoạn thanh nối liền — ngữ pháp thị giác chung của sản phẩm.
 * steps: [{ key, label, meta?, state: "done" | "current" | "todo" }]
 */
export function ProcessTrack({ steps, size = "md", showLabels = true, label, decorative = false, className = "" }) {
  const small = size === "sm";
  return (
    <ol
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      className={`grid ${small ? "gap-1" : "gap-1.5"} ${className}`}
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
    >
      {steps.map((step) => {
        const { state } = step;
        const labelTone = state === "current" ? "font-semibold text-ink-900" : state === "done" ? "text-ink-700" : "text-ink-600";
        const hideOnMobile = state === "current" ? "" : "max-sm:sr-only";
        return (
          <li key={step.key ?? step.label} aria-current={state === "current" ? "step" : undefined} className="min-w-0">
            <span aria-hidden="true" className={`relative block rounded-full ${small ? "h-1" : "h-1.5"} ${state === "todo" ? "bg-ink-200" : "bg-brand-600"}`}>
              {state === "current" && (
                <span className="absolute right-0 top-1/2 size-2 -translate-y-1/2 rounded-full bg-brand-600 ring-2 ring-white" />
              )}
            </span>
            {showLabels && <span className={`mt-2 block text-body-sm ${labelTone} ${hideOnMobile}`}>{step.label}</span>}
            {showLabels && step.meta && <span className={`block text-caption text-ink-600 tabular-nums ${hideOnMobile}`}>{step.meta}</span>}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Chuỗi bước tuần tự dạng chevron nối nhau (module chevron của logo IUH 2025)
 * — ngữ pháp thị giác chung của sản phẩm.
 * steps: [{ key, label, meta?, state: "done" | "current" | "todo" }]
 * tone="onDark" khi đặt trên nền xanh IUH.
 */
const fills = {
  light: { done: "bg-brand-600", current: "bg-accent-500", todo: "bg-ink-200" },
  onDark: { done: "bg-white", current: "bg-accent-500", todo: "bg-white/20" }
};

export function ProcessTrack({ steps, size = "md", showLabels = true, label, decorative = false, tone = "light", className = "" }) {
  const small = size === "sm";
  const palette = fills[tone] || fills.light;
  const dark = tone === "onDark";
  return (
    <ol
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      className={`chev-track grid ${className}`}
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`, "--k": small ? "5px" : "9px" }}
    >
      {steps.map((step, i) => {
        const { state } = step;
        const labelTone = dark
          ? state === "current" ? "font-semibold text-white" : "text-brand-100"
          : state === "current" ? "font-semibold text-ink-900" : state === "done" ? "text-ink-700" : "text-ink-600";
        const hideOnMobile = state === "current" ? "" : "max-sm:sr-only";
        return (
          <li key={step.key ?? step.label} aria-current={state === "current" ? "step" : undefined} className="min-w-0">
            <span aria-hidden="true" className={`chev-seg ${small ? "h-2" : "h-3.5"} ${palette.todo}`}>
              {state !== "todo" && <span className={`chev-fill ${palette[state]}`} style={{ "--i": i }} />}
            </span>
            {showLabels && <span className={`mt-2 block pr-2 text-body-sm ${labelTone} ${hideOnMobile}`}>{step.label}</span>}
            {showLabels && step.meta && <span className={`block pr-2 text-caption tabular-nums ${dark ? "text-brand-200" : "text-ink-600"} ${hideOnMobile}`}>{step.meta}</span>}
          </li>
        );
      })}
    </ol>
  );
}

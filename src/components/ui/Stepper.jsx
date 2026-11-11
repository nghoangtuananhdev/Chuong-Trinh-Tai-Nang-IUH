/**
 * Stepper ngang theo ngữ pháp ProcessTrack. steps: [{ title, description }].
 * canGoTo(index) quyết định bước nào bấm được.
 */
export function Stepper({ steps, current, onStep, canGoTo = () => true }) {
  const total = steps.length;

  return (
    <nav aria-label="Các bước nộp hồ sơ">
      {/* Mobile: thanh tiến độ mảnh */}
      <div className="md:hidden">
        <p className="text-caption font-semibold text-ink-600">
          Bước {current + 1}/{total}
        </p>
        <p className="mt-0.5 text-title-3 text-ink-900">{steps[current].title}</p>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-ink-200" aria-hidden="true">
          <div
            className="h-full rounded-full bg-brand-600 transition-[width] duration-slow"
            style={{ width: `${((current + 1) / total) * 100}%`, transitionDuration: "260ms" }}
          />
        </div>
      </div>

      {/* Desktop */}
      <ol className="hidden gap-1.5 md:grid" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
        {steps.map((step, idx) => {
          const done = idx < current;
          const active = idx === current;
          const allowed = canGoTo(idx);
          return (
            <li key={step.title} className="min-w-0">
              <button
                type="button"
                onClick={() => allowed && onStep(idx)}
                aria-disabled={!allowed}
                aria-current={active ? "step" : undefined}
                className={`group block w-full rounded-xs text-left ${allowed ? "cursor-pointer" : "cursor-not-allowed"}`}
              >
                <span aria-hidden="true" className={`relative block h-1.5 rounded-full transition-colors duration-180 ${done || active ? "bg-brand-600" : "bg-ink-200"}`}>
                  {active && <span className="absolute right-0 top-1/2 size-2 -translate-y-1/2 rounded-full bg-brand-600 ring-2 ring-white" />}
                </span>
                <span className="mt-2 flex items-baseline gap-2">
                  <span className={`text-caption tabular-nums ${active ? "font-semibold text-brand-700" : "text-ink-600"}`}>{idx + 1}</span>
                  <span className={`text-body-sm ${active ? "font-semibold text-ink-900" : done ? "text-ink-700" : "text-ink-600"}`}>{step.title}</span>
                </span>
                {step.description && <span className="mt-0.5 block max-w-[34ch] text-body-sm text-ink-600">{step.description}</span>}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

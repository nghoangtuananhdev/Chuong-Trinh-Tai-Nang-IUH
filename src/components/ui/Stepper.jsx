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
        <ol className="chev-track mt-3 grid gap-0" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))`, "--k": "6px" }} aria-hidden="true">
          {steps.map((step, idx) => (
            <li key={step.title}>
              <span className={`chev-seg h-2 transition-colors duration-180 ${idx < current ? "bg-brand-600" : idx === current ? "bg-accent-500" : "bg-ink-200"}`} />
            </li>
          ))}
        </ol>
      </div>

      {/* Desktop */}
      <ol className="chev-track hidden md:grid" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))`, "--k": "9px" }}>
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
                <span aria-hidden="true" className={`chev-seg h-3 transition-colors duration-180 ${done ? "bg-brand-600" : active ? "bg-accent-500" : "bg-ink-200 group-hover:bg-ink-300"}`} />
                <span className="mt-2.5 flex items-baseline gap-2 pr-3">
                  <span className={`text-caption font-semibold tabular-nums ${active ? "text-brand-700" : "text-ink-600"}`}>{String(idx + 1).padStart(2, "0")}</span>
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

import { Check } from "lucide-react";

/**
 * Stepper ngang. steps: [{ title, description }].
 * canGoTo(index) quyết định bước nào bấm được.
 */
export function Stepper({ steps, current, onStep, canGoTo = () => true }) {
  const total = steps.length;
  const progress = total > 1 ? (current / (total - 1)) * 100 : 0;

  return (
    <nav aria-label="Các bước nộp hồ sơ">
      {/* Mobile: thanh tiến độ mảnh */}
      <div className="md:hidden">
        <p className="text-caption font-semibold uppercase tracking-wider text-ink-500">
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
      <ol className="relative hidden md:flex">
        <span aria-hidden="true" className="absolute left-0 right-0 top-[19px] mx-[calc(100%/6)] h-0.5 bg-ink-200">
          <span
            className="block h-full bg-brand-600 transition-[width] ease-out"
            style={{ width: `${progress}%`, transitionDuration: "260ms" }}
          />
        </span>
        {steps.map((step, idx) => {
          const done = idx < current;
          const active = idx === current;
          const allowed = canGoTo(idx);
          return (
            <li key={step.title} className="relative flex-1">
              <button
                type="button"
                onClick={() => allowed && onStep(idx)}
                aria-disabled={!allowed}
                aria-current={active ? "step" : undefined}
                className={`group flex w-full flex-col items-center px-3 text-center ${allowed ? "cursor-pointer" : "cursor-not-allowed"}`}
              >
                <span
                  className={`relative z-10 flex size-10 items-center justify-center rounded-full border-2 text-body font-bold tabular-nums transition-colors duration-180 ${
                    done
                      ? "border-success-solid bg-success-solid text-white"
                      : active
                      ? "border-brand-600 bg-brand-600 text-white ring-4 ring-brand-100"
                      : "border-ink-300 bg-white text-ink-500"
                  }`}
                >
                  {done ? <Check size={18} strokeWidth={3} aria-hidden="true" /> : idx + 1}
                </span>
                <span className={`mt-2 text-body font-semibold ${active ? "text-ink-900" : done ? "text-ink-800" : "text-ink-500"}`}>
                  {step.title}
                </span>
                {step.description && <span className="mt-0.5 max-w-[26ch] text-body-sm text-ink-500">{step.description}</span>}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

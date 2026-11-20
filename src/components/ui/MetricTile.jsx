import { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "motion/react";

/** Số đếm lên khi xuất hiện; trình đọc màn hình luôn nhận giá trị cuối. */
export function CountUp({ value, className = "" }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const numeric = typeof value === "number" && Number.isFinite(value);
  useEffect(() => {
    if (!numeric || reduce || !ref.current) return undefined;
    const node = ref.current;
    const controls = animate(0, value, {
      duration: Math.min(1.4, 0.5 + value * 0.04),
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = Math.round(v).toLocaleString("vi-VN");
      },
    });
    return () => controls.stop();
  }, [value, numeric, reduce]);
  if (!numeric) return <span className={className}>{value}</span>;
  return (
    <span className={className}>
      <span ref={ref} aria-hidden="true">
        {value.toLocaleString("vi-VN")}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  );
}

/** Con số tổng hợp + nhãn trên cùng một dòng đọc. Bằng 0 thì lùi xuống, để việc thật nổi lên. */
export function MetricTile({ value, label, action, children, className = "" }) {
  const idle = value === 0;
  return (
    <div
      className={`flex flex-col gap-1 rounded-card border p-5 ${
        idle ? "border-ink-200 bg-ink-25" : "border-ink-200 bg-white shadow-card"
      } ${className}`}
    >
      <p className="flex items-baseline gap-2.5">
        <CountUp value={value} className={`text-metric tabular-nums ${idle ? "text-ink-500" : "text-brand-950"}`} />
        <span className={`text-body ${idle ? "text-ink-600" : "font-medium text-ink-800"}`}>{label}</span>
      </p>
      {children && <div className="text-body-sm text-ink-600">{children}</div>}
      {action && <div className="mt-auto pt-3">{action}</div>}
    </div>
  );
}

/** Con số tổng hợp + nhãn trên cùng một dòng đọc. */
export function MetricTile({ value, label, action, children, className = "" }) {
  return (
    <div className={`surface flex flex-col gap-1 p-4 ${className}`}>
      <p className="flex items-baseline gap-2">
        <span className="text-metric tabular-nums text-ink-900">{value}</span>
        <span className="text-body text-ink-700">{label}</span>
      </p>
      {children && <div className="text-body-sm text-ink-600">{children}</div>}
      {action && <div className="mt-auto pt-2">{action}</div>}
    </div>
  );
}

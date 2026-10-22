import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

/** Mã định danh dạng “tem” — chữ ký thị giác #2. */
export function CodeTag({ children, tone = "stamp", className = "" }) {
  const tones = {
    stamp: "rounded-xs border border-brand-100 bg-brand-50 px-2 py-0.5 text-brand-700",
    plain: "text-brand-700",
    neutral: "rounded-xs border border-ink-200 bg-ink-100 px-2 py-0.5 text-ink-700"
  };
  return (
    <span className={`inline-block whitespace-nowrap font-mono text-[0.78rem] font-semibold tabular-nums ${tones[tone] || tones.stamp} ${className}`}>
      {children}
    </span>
  );
}

export function getInitials(name = "") {
  const parts = String(name)
    .replace(/\b(ThS|TS|PGS|GS)\b\.?/gi, "")
    .replace(/[^\p{L}\s]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
}

const avatarSizes = {
  24: "size-6 text-[0.65rem]",
  28: "size-7 text-caption",
  32: "size-8 text-caption",
  40: "size-10 text-body font-semibold",
  80: "size-20 text-title-1"
};

export function Avatar({ initials, name, size = 32, round = false, className = "" }) {
  const text = initials || getInitials(name);
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center bg-brand-900 font-bold uppercase tracking-wide text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)] ${round || size === 80 ? "rounded-full" : "rounded-control"} ${avatarSizes[size] || avatarSizes[32]} ${className}`}
    >
      {text}
    </span>
  );
}

const calloutTones = {
  info: { icon: Info, box: "border-info-border bg-info-bg", bar: "border-l-info-solid", ic: "text-info-solid", text: "text-info-fg" },
  success: { icon: CheckCircle2, box: "border-success-border bg-success-bg", bar: "border-l-success-solid", ic: "text-success-solid", text: "text-success-fg" },
  warning: { icon: AlertTriangle, box: "border-warning-border bg-warning-bg", bar: "border-l-warning-solid", ic: "text-warning-solid", text: "text-warning-fg" },
  danger: { icon: XCircle, box: "border-danger-border bg-danger-bg", bar: "border-l-danger-solid", ic: "text-danger-solid", text: "text-danger-fg" },
  neutral: { icon: Info, box: "border-ink-200 bg-ink-25", bar: "border-l-ink-400", ic: "text-ink-500", text: "text-ink-700" },
  brand: { icon: Info, box: "border-brand-100 bg-brand-25", bar: "border-l-brand-600", ic: "text-brand-600", text: "text-brand-900" }
};

export function Callout({ tone = "info", icon, title, children, action, className = "", role }) {
  const t = calloutTones[tone] || calloutTones.info;
  const Icon = icon || t.icon;
  return (
    <div role={role} className={`flex items-start gap-3 rounded-control border border-l-[3px] px-4 py-3 ${t.box} ${t.bar} ${className}`}>
      <Icon size={18} aria-hidden="true" className={`mt-0.5 shrink-0 ${t.ic}`} />
      <div className={`min-w-0 flex-1 text-body ${t.text}`}>
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? "mt-0.5" : ""}>{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Sĩ số: số + thanh mảnh. */
export function Capacity({ current, max, className = "" }) {
  const ratio = max > 0 ? Math.min(1, current / max) : 0;
  const color = ratio >= 1 ? "bg-success-solid" : ratio >= 0.9 ? "bg-warning-solid" : "bg-brand-600";
  return (
    <span className={`inline-flex flex-col gap-1 ${className}`} title="Sĩ số">
      <span className="font-semibold tabular-nums text-ink-900">
        {current}/{max}
      </span>
      <span className="block h-1 w-12 overflow-hidden rounded-full bg-ink-100" aria-hidden="true">
        <span className={`block h-full rounded-full ${color}`} style={{ width: `${ratio * 100}%` }} />
      </span>
    </span>
  );
}

const gridCols = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4"
};

/** Nhãn UPPERCASE nhỏ + giá trị. layout: grid | inline | plain */
export function DescriptionList({ items, columns = 2, layout = "grid", className = "" }) {
  const visible = items.filter(Boolean);

  if (layout === "inline") {
    return (
      <dl className={`divide-y divide-ink-200 ${className}`}>
        {visible.map((item) => (
          <div key={item.label} className="flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
            <dt className="shrink-0 text-body-sm text-ink-500">{item.label}</dt>
            <dd className="min-w-0 text-right text-body font-medium text-ink-900 break-words">{item.value}</dd>
          </div>
        ))}
      </dl>
    );
  }

  if (layout === "plain") {
    return (
      <dl className={`grid gap-x-6 gap-y-4 ${gridCols[columns] || gridCols[2]} ${className}`}>
        {visible.map((item) => (
          <div key={item.label} className="min-w-0">
            <dt className="text-overline uppercase text-ink-500">{item.label}</dt>
            <dd className="mt-1 text-body font-medium text-ink-900 break-words">{item.value}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <div className={`overflow-hidden rounded-card border border-ink-200 bg-ink-25 ${className}`}>
      <dl className={`-ml-px -mt-px grid ${gridCols[columns] || gridCols[2]}`}>
        {visible.map((item) => (
          <div key={item.label} className="min-w-0 border-l border-t border-ink-200 px-4 py-3">
            <dt className="text-overline uppercase text-ink-500">{item.label}</dt>
            <dd className="mt-1 text-body font-medium text-ink-900 break-words">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const timelineDot = {
  brand: "bg-brand-600",
  success: "bg-success-solid",
  warning: "bg-warning-solid",
  danger: "bg-danger-solid",
  neutral: "bg-ink-400"
};

export function getTimelineTone(action = "") {
  const a = action.toLowerCase();
  if (a.includes("từ chối")) return "danger";
  if (a.includes("bổ sung")) return "warning";
  if (a.includes("duyệt") || a.includes("xác nhận")) return "success";
  if (a.includes("nộp")) return "brand";
  return "neutral";
}

export function Timeline({ items, className = "" }) {
  return (
    <ol className={`relative ${className}`}>
      {items.map((item, idx) => {
        const tone = item.tone || getTimelineTone(item.action);
        const last = idx === items.length - 1;
        return (
          <li key={`${item.date}-${idx}`} className="relative flex gap-4 pb-6 last:pb-0">
            {!last && <span aria-hidden="true" className="absolute bottom-0 left-[4px] top-4 w-0.5 bg-ink-200" />}
            <span aria-hidden="true" className={`relative mt-1.5 size-2.5 shrink-0 rounded-full ring-4 ring-white ${timelineDot[tone]}`} />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-body">
                <span className="font-semibold text-ink-900">{item.action}</span>
                <span className="text-ink-600">{item.actor}</span>
                {item.role && (
                  <span className="rounded-full bg-ink-100 px-2 py-0.5 text-caption font-medium text-ink-600">{item.role}</span>
                )}
              </p>
              <p className="mt-0.5 text-body-sm tabular-nums text-ink-500">{item.date}</p>
              {item.note && (
                <blockquote className="mt-2 border-l-2 border-ink-300 bg-ink-25 px-3 py-2 text-body text-ink-700">
                  “{item.note}”
                </blockquote>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

import { getStatusMeta } from "../../data/status-definitions.js";

const soft = {
  success: "text-success-fg bg-success-bg border-success-border",
  warning: "text-warning-fg bg-warning-bg border-warning-border",
  danger: "text-danger-fg bg-danger-bg border-danger-border",
  info: "text-info-fg bg-info-bg border-info-border",
  neutral: "text-neutral-fg bg-neutral-bg border-neutral-border"
};

const outline = {
  success: "text-success-fg bg-white border-success-border",
  warning: "text-warning-fg bg-white border-warning-border",
  danger: "text-danger-fg bg-white border-danger-border",
  info: "text-info-fg bg-white border-info-border",
  neutral: "text-neutral-fg bg-white border-neutral-border"
};

const dot = {
  success: "bg-success-solid",
  warning: "bg-warning-solid",
  danger: "bg-danger-solid",
  info: "bg-info-solid",
  neutral: "bg-neutral-solid"
};

export function StatusBadge({ children, domain = "general", size = "md", appearance = "soft", className = "" }) {
  const meta = getStatusMeta(children, domain);
  const palette = appearance === "outline" ? outline : soft;
  const tone = palette[meta.tone] ? meta.tone : "neutral";

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-semibold text-caption ${size === "sm" ? "h-5 px-2" : "h-6 px-2.5"} ${palette[tone]} ${className}`}
    >
      <span className={`size-1.5 shrink-0 rounded-full ${dot[tone]}`} aria-hidden="true" />
      <span>{meta.label || children}</span>
    </span>
  );
}

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

const sizeClasses = {
  sm: "h-8 px-3 text-body-sm font-medium gap-2 rounded-control",
  md: "h-10 px-4 text-body font-semibold gap-2 rounded-control",
  lg: "h-12 px-6 text-title-3 font-semibold gap-2 rounded-control"
};

const variantClasses = {
  primary:
    "bg-brand-600 text-white border border-brand-600 shadow-[inset_0_1px_0_rgb(255_255_255/0.12),var(--shadow-raised)] hover:bg-brand-700 hover:border-brand-700 active:bg-brand-800 active:border-brand-800 active:translate-y-px disabled:bg-ink-100 disabled:border-ink-200 disabled:text-ink-400 disabled:shadow-none disabled:translate-y-0",
  secondary:
    "bg-white text-ink-900 border border-ink-300 shadow-raised hover:bg-ink-25 hover:border-ink-400 active:bg-ink-100 active:translate-y-px disabled:bg-ink-100 disabled:border-ink-200 disabled:text-ink-400 disabled:shadow-none disabled:translate-y-0",
  tertiary:
    "bg-transparent text-ink-600 border border-transparent hover:bg-ink-100 hover:text-ink-900 active:bg-ink-200 disabled:text-ink-400 disabled:hover:bg-transparent",
  danger:
    "bg-danger-fg text-white border border-danger-fg shadow-[inset_0_1px_0_rgb(255_255_255/0.1),var(--shadow-raised)] hover:bg-danger-hover hover:border-danger-hover active:translate-y-px disabled:bg-ink-100 disabled:border-ink-200 disabled:text-ink-400 disabled:shadow-none",
  dangerOutline:
    "bg-white text-danger-fg border border-danger-border shadow-raised hover:bg-danger-bg hover:border-danger-fg active:translate-y-px disabled:bg-ink-100 disabled:border-ink-200 disabled:text-ink-400 disabled:shadow-none",
  warningOutline:
    "bg-white text-warning-fg border border-warning-border shadow-raised hover:bg-warning-bg hover:border-warning-solid active:translate-y-px disabled:bg-ink-100 disabled:border-ink-200 disabled:text-ink-400 disabled:shadow-none",
  link:
    "bg-transparent text-brand-600 border border-transparent px-1 hover:text-brand-700 hover:underline underline-offset-4 disabled:text-ink-400"
};

variantClasses.ghost = variantClasses.tertiary;

export const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    type = "button",
    className = "",
    disabled = false,
    loading = false,
    fullWidth = false,
    icon: Icon,
    iconRight: IconRight,
    ...props
  },
  ref
) {
  const iconSize = size === "sm" ? 14 : 16;
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center whitespace-nowrap select-none transition-[background-color,border-color,color,transform] duration-120 ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={iconSize} aria-hidden="true" className="shrink-0 animate-spin" />
      ) : (
        Icon && <Icon size={iconSize} aria-hidden="true" className="shrink-0" />
      )}
      {children != null && <span>{children}</span>}
      {IconRight && !loading && <IconRight size={iconSize} aria-hidden="true" className="shrink-0" />}
    </button>
  );
});

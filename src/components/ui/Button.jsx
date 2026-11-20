import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

const sizeClasses = {
  sm: "h-8 max-sm:min-h-10 px-3.5 text-body-sm font-medium gap-1.5 rounded-full",
  md: "h-10 px-5 text-body font-semibold gap-2 rounded-full",
  lg: "h-12 px-7 text-title-3 font-semibold gap-2.5 rounded-full"
};

const lift = "hover:-translate-y-px active:translate-y-0 disabled:translate-y-0";

const variantClasses = {
  primary:
    `bg-brand-600 text-white border border-brand-600 shadow-raised hover:bg-brand-700 hover:border-brand-700 hover:shadow-card active:bg-brand-800 active:border-brand-800 disabled:bg-ink-100 disabled:border-ink-200 disabled:text-ink-400 disabled:shadow-none ${lift}`,
  secondary:
    "bg-white text-ink-900 border border-ink-300 shadow-raised hover:border-brand-300 hover:text-brand-700 hover:bg-brand-25 active:bg-brand-50 disabled:bg-ink-100 disabled:border-ink-200 disabled:text-ink-400 disabled:shadow-none",
  tertiary:
    "bg-transparent text-ink-600 border border-transparent hover:bg-ink-100 hover:text-ink-900 active:bg-ink-200 disabled:text-ink-400 disabled:hover:bg-transparent",
  danger:
    "bg-danger-fg text-white border border-danger-fg shadow-raised hover:bg-danger-hover hover:border-danger-hover active:translate-y-px disabled:bg-ink-100 disabled:border-ink-200 disabled:text-ink-400 disabled:shadow-none",
  dangerOutline:
    "bg-white text-danger-fg border border-danger-border shadow-raised hover:bg-danger-bg hover:border-danger-fg active:translate-y-px disabled:bg-ink-100 disabled:border-ink-200 disabled:text-ink-400 disabled:shadow-none",
  warningOutline:
    "bg-white text-warning-fg border border-warning-border shadow-raised hover:bg-warning-bg hover:border-warning-solid active:translate-y-px disabled:bg-ink-100 disabled:border-ink-200 disabled:text-ink-400 disabled:shadow-none",
  link:
    "bg-transparent text-brand-600 border border-transparent !px-2 -mx-2 font-semibold hover:bg-brand-50 hover:text-brand-700 active:bg-brand-100 disabled:text-ink-400 disabled:hover:bg-transparent",
  accent:
    `bg-accent-500 text-brand-950 border border-accent-500 shadow-raised hover:bg-accent-400 hover:border-accent-400 hover:shadow-overlay active:bg-accent-600 disabled:bg-ink-100 disabled:border-ink-200 disabled:text-ink-400 ${lift}`,
  /* Nút phụ đặt trên nền xanh IUH */
  onDark:
    "on-dark bg-white/10 text-white border border-white/30 hover:bg-white/18 hover:border-white/60 active:bg-white/25 disabled:text-white/50"
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
      className={`inline-flex items-center justify-center whitespace-nowrap select-none transition-[background-color,border-color,color,transform,box-shadow] duration-180 ease-out ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${fullWidth ? "w-full" : ""} ${className}`}
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

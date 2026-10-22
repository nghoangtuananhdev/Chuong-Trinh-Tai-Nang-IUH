import { forwardRef } from "react";
import { Tooltip } from "./Tooltip.jsx";

const sizeClasses = {
  sm: "size-7 rounded-xs",
  md: "size-[34px] rounded-control",
  lg: "size-10 rounded-control"
};

const iconSizes = { sm: 14, md: 16, lg: 18 };

const variantClasses = {
  secondary:
    "bg-white text-ink-600 border border-ink-200 shadow-raised hover:border-ink-400 hover:text-ink-900 hover:bg-ink-25",
  tertiary:
    "bg-transparent text-ink-500 border border-transparent hover:bg-ink-100 hover:text-ink-900",
  danger:
    "bg-transparent text-ink-500 border border-transparent hover:bg-danger-bg hover:text-danger-fg hover:border-danger-border",
  primary:
    "bg-brand-600 text-white border border-brand-600 hover:bg-brand-700"
};

variantClasses.ghost = variantClasses.tertiary;

export const IconButton = forwardRef(function IconButton(
  {
    icon: Icon,
    label,
    variant = "secondary",
    size = "md",
    type = "button",
    className = "",
    disabled = false,
    tooltip = true,
    ...props
  },
  ref
) {
  const button = (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      disabled={disabled}
      className={`inline-flex shrink-0 items-center justify-center transition-colors duration-120 disabled:cursor-not-allowed disabled:text-ink-400 disabled:hover:bg-transparent ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.secondary} ${className}`}
      {...props}
    >
      <Icon size={iconSizes[size] || 16} aria-hidden="true" />
    </button>
  );

  return tooltip ? <Tooltip label={label} disabled={disabled}>{button}</Tooltip> : button;
});

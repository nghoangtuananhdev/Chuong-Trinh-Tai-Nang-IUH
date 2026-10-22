import { cloneElement, forwardRef, isValidElement, useId } from "react";
import { AlertCircle, Check, Lock } from "lucide-react";

/** Bao nhãn + control + gợi ý + lỗi; tự sinh id và nối aria. */
export function Field({ label, required = false, hint, error, children, className = "", labelClassName = "", id: idProp }) {
  const autoId = useId();
  const id = idProp || autoId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const controlProps = {
    id,
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : undefined,
    required: required || undefined
  };

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className={`ui-label ${labelClassName}`}>
          {label}
          {required && (
            <>
              <span aria-hidden="true" className="ml-0.5 text-danger-fg">*</span>
              <span className="sr-only">Bắt buộc</span>
            </>
          )}
        </label>
      )}
      {typeof children === "function"
        ? children(controlProps)
        : isValidElement(children)
        ? cloneElement(children, controlProps)
        : children}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-body-sm text-ink-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 flex items-start gap-1.5 text-body-sm font-medium text-danger-fg">
          <AlertCircle size={14} aria-hidden="true" className="mt-[3px] shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef(function Input(
  { className = "", leadingIcon: LeadingIcon, trailing, locked = false, invalid = false, readOnly, ...props },
  ref
) {
  const isLocked = locked || readOnly;
  if (!LeadingIcon && !trailing && !isLocked) {
    return <input ref={ref} className={`ui-input ${className}`} aria-invalid={invalid || props["aria-invalid"] || undefined} {...props} />;
  }
  return (
    <div className="relative">
      {LeadingIcon && (
        <LeadingIcon size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
      )}
      <input
        ref={ref}
        readOnly={readOnly}
        className={`ui-input ${LeadingIcon ? "pl-9" : ""} ${trailing || isLocked ? "pr-12" : ""} ${className}`}
        aria-invalid={invalid || props["aria-invalid"] || undefined}
        {...props}
      />
      {(trailing || isLocked) && (
        <span className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-body-sm text-ink-500">
          {trailing}
          {isLocked && <Lock size={14} aria-hidden="true" className="text-ink-400" />}
        </span>
      )}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea({ className = "", rows = 4, ...props }, ref) {
  return <textarea ref={ref} rows={rows} className={`ui-input ${className}`} {...props} />;
});

export const Select = forwardRef(function Select({ className = "", children, ...props }, ref) {
  return (
    <select ref={ref} className={`ui-input ${className}`} {...props}>
      {children}
    </select>
  );
});

export function Checkbox({ checked, onChange, children, className = "", id: idProp, ...props }) {
  const autoId = useId();
  const id = idProp || autoId;
  return (
    <label htmlFor={id} className={`flex min-h-10 cursor-pointer items-start gap-3 ${className}`}>
      <input id={id} type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" {...props} />
      <span
        aria-hidden="true"
        className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border border-ink-300 bg-white text-transparent shadow-raised transition-colors duration-120 peer-checked:border-brand-600 peer-checked:bg-brand-600 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus"
      >
        <Check size={13} strokeWidth={3} />
      </span>
      <span className="text-body text-ink-800">{children}</span>
    </label>
  );
}

/** Thẻ chọn một trong nhiều (radio). */
export function RadioCard({ children, description, leading, className = "", ...inputProps }) {
  return (
    <label
      className={`relative flex cursor-pointer items-center gap-3 rounded-control border border-ink-300 bg-white p-3 shadow-raised transition-colors duration-120 hover:border-ink-400 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-25 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus ${className}`}
    >
      <input type="radio" className="peer sr-only" {...inputProps} />
      {leading}
      <span className="min-w-0 flex-1">
        <span className="block text-body font-semibold text-ink-900">{children}</span>
        {description && <span className="block text-body-sm text-ink-600">{description}</span>}
      </span>
      <span
        aria-hidden="true"
        className="flex size-5 shrink-0 items-center justify-center rounded-full border border-ink-300 bg-white text-transparent peer-checked:border-brand-600 peer-checked:bg-brand-600 peer-checked:text-white"
      >
        <Check size={12} strokeWidth={3} />
      </span>
    </label>
  );
}

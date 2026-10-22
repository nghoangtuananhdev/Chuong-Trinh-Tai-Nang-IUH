import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/** Ô mật khẩu có nút hiện/ẩn. */
export const PasswordInput = forwardRef(function PasswordInput({ className = "", ...props }, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input ref={ref} type={visible ? "text" : "password"} className={`ui-input pr-11 ${className}`} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        aria-pressed={visible}
        className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-xs text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
      >
        {visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
      </button>
    </div>
  );
});

/** Thanh độ mạnh 4 vạch — chỉ dùng màu, không thêm chữ. */
export function PasswordStrength({ value }) {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Za-z]/.test(value) && /\d/.test(value)) score += 1;
  if (value.length >= 12) score += 1;
  if (/[A-Z]/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1;
  if (!value) score = 0;
  const color = score <= 1 ? "bg-danger-solid" : score === 2 ? "bg-warning-solid" : "bg-success-solid";

  return (
    <div className="mt-2 flex gap-1" aria-hidden="true">
      {[1, 2, 3, 4].map((n) => (
        <span key={n} className={`h-1 flex-1 rounded-full transition-colors duration-180 ${n <= score ? color : "bg-ink-200"}`} />
      ))}
    </div>
  );
}

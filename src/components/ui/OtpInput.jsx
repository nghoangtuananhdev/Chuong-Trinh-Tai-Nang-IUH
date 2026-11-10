import { useRef } from "react";
export function OtpInput({ value = "", onChange, id }) {
  const refs = useRef([]);
  // Ô trống ở giữa được lưu bằng dấu cách; không hiển thị dấu cách trong ô nhập.
  const digits = Array.from({ length: 6 }, (_, i) =>
    /\d/.test(value[i] ?? "") ? value[i] : "",
  );
  return (
    <div
      id={id}
      role="group"
      aria-label="Mã OTP gồm 6 chữ số"
      className="flex gap-2"
      onPaste={(e) => {
        const code = e.clipboardData
          .getData("text")
          .replace(/\D/g, "")
          .slice(0, 6);
        if (code) {
          e.preventDefault();
          onChange(code);
          refs.current[Math.min(code.length, 5)]?.focus();
        }
      }}
    >
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          aria-label={`Chữ số OTP ${i + 1}`}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={2}
          value={digits[i]}
          onFocus={(e) => e.target.select()}
          className="ui-input min-w-0 max-w-12 text-center font-mono"
          onChange={(e) => {
            // Ô đang có số: lấy chữ số vừa gõ, bất kể con trỏ đứng trước hay sau số cũ.
            const typed = e.target.value.replace(/\D/g, "");
            const digit =
              typed.length > 1
                ? typed.replace(digits[i], "").slice(-1) || digits[i]
                : typed;
            onChange(
              digits
                .map((d, j) => (j === i ? digit : d) || " ")
                .join("")
                .trimEnd(),
            );
            if (digit) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            // Gõ lại đúng chữ số đang có không phát sinh onChange, nên xử lý phím số tại đây.
            if (/^\d$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
              e.preventDefault();
              onChange(
                digits
                  .map((d, j) => (j === i ? e.key : d) || " ")
                  .join("")
                  .trimEnd(),
              );
              refs.current[i + 1]?.focus();
              return;
            }
            if (e.key === "Backspace" && !digits[i])
              refs.current[i - 1]?.focus();
          }}
        />
      ))}
    </div>
  );
}

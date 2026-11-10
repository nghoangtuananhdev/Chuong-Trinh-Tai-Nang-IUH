import { useRef } from "react";
export function OtpInput({ value = "", onChange, id }) {
  const refs = useRef([]);
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
          maxLength={1}
          value={value[i] ?? ""}
          className="ui-input min-w-0 max-w-12 text-center font-mono"
          onChange={(e) => {
            const digit = e.target.value.replace(/\D/g, "").slice(-1);
            onChange(
              (
                value.padEnd(6, " ").slice(0, i) +
                digit +
                value.padEnd(6, " ").slice(i + 1)
              ).trimEnd(),
            );
            if (digit) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !value[i])
              refs.current[i - 1]?.focus();
          }}
        />
      ))}
    </div>
  );
}

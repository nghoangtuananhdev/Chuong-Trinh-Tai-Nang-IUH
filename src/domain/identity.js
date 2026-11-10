export function isIuhStudentEmail(studentCode, email) {
  if (!/^\d{8}$/.test(studentCode)) return false;
  const match = String(email ?? "")
    .trim()
    .toLowerCase()
    .match(/^([a-z0-9._+-]+)@student\.iuh\.edu\.vn$/);
  return Boolean(match && match[1].includes(studentCode));
}
export const maskStudentCode = (code) =>
  String(code).length >= 4
    ? `${String(code).slice(0, 2)}${"*".repeat(String(code).length - 4)}${String(code).slice(-2)}`
    : "****";
export const maskName = (full) => {
  const parts = String(full).trim().split(/\s+/);
  return parts.length < 2
    ? parts[0]
    : `${parts
        .slice(0, -1)
        .map((w) => `${w[0].toUpperCase()}.`)
        .join(" ")} ${parts.at(-1)}`;
};
export function checkPasswordPolicy(password, minLength = 8) {
  const pw = typeof password === "string" ? password : "";
  return [
    pw.length < minLength && `Mật khẩu phải có ít nhất ${minLength} ký tự.`,
    !/\p{L}/u.test(pw) && "Mật khẩu phải có ít nhất một chữ cái.",
    !/\d/.test(pw) && "Mật khẩu phải có ít nhất một chữ số.",
  ].filter(Boolean);
}

export const ERROR_CODES = Object.freeze(
  Object.fromEntries(
    [
      "FORBIDDEN",
      "NOT_FOUND",
      "VALIDATION",
      "CONFLICT",
      "INVALID_STATE",
      "RATE_LIMITED",
      "OTP_INVALID",
      "OTP_EXPIRED",
      "AUTH_INVALID",
      "ACCOUNT_LOCKED",
      "PASSWORD_POLICY",
    ].map((code) => [code, code]),
  ),
);

export class DomainError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.details = details;
  }
}
export const fail = (code, message, details) => {
  throw new DomainError(code, message, details);
};
export const requireValue = (condition, code, message, details) => {
  if (!condition) fail(code, message, details);
};
export const IMMUTABLE_MESSAGE =
  "ĐXT đã công bố là bất biến. Sai sót cần xử lý bằng quyết định điều chỉnh (chưa hỗ trợ trong bản prototype).";

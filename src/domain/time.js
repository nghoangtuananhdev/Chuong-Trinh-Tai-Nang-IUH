import { requireValue } from "./errors.js";

export const timestamp = (value) => {
  const ms =
    typeof value === "string" && value.trim() ? Date.parse(value) : NaN;
  requireValue(
    Number.isFinite(ms),
    "VALIDATION",
    "Thời gian không hợp lệ. Vui lòng nhập đủ ngày, giờ và múi giờ.",
  );
  return ms;
};
export const toIct = (value) =>
  new Date(timestamp(value) + 7 * 3600000).toISOString().replace("Z", "+07:00");
export const addMinutes = (value, minutes) =>
  toIct(new Date(timestamp(value) + minutes * 60000).toISOString());
export const addHours = (value, hours) => addMinutes(value, hours * 60);
export const addDays = (value, days) => addHours(value, days * 24);
export const isBefore = (a, b) => timestamp(a) < timestamp(b);
export const isAtOrBefore = (a, b) => timestamp(a) <= timestamp(b);
export const formatIct = (value) =>
  new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(timestamp(value)));
export const ictDate = (value) => toIct(value).slice(0, 10);

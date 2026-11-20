import { isIuhStudentEmail } from "./identity.js";

const fold = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
const HEADER_KEYS = {
  mssv: "studentCode",
  "ma sinh vien": "studentCode",
  "ma so sinh vien": "studentCode",
  "ho ten": "fullName",
  "ho va ten": "fullName",
  "ngay sinh": "dob",
  email: "email",
  lop: "homeClass",
  "lop sinh hoat": "homeClass",
  khoa: "cohort",
};
export const REQUIRED_HEADERS = ["studentCode", "fullName"];

function detectDelimiter(line) {
  let quoted = false;
  const count = { "\t": 0, ";": 0, ",": 0 };
  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    else if (!quoted && ch in count) count[ch]++;
  }
  return ["\t", ";", ","].sort((a, b) => count[b] - count[a])[0];
}
function splitRecords(text, delimiter) {
  const records = [];
  let row = [],
    cell = "",
    quoted = false;
  const endCell = () => {
    row.push(cell);
    cell = "";
  };
  const endRow = () => {
    endCell();
    if (row.some((c) => c.trim() !== "")) records.push(row);
    row = [];
  };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delimiter) endCell();
    else if (ch === "\n") endRow();
    else if (ch !== "\r") cell += ch;
  }
  endRow();
  return records;
}
/** Tách bảng CSV/TSV (dán từ Excel). Dòng đầu là tiêu đề. */
export function parseStudentTable(text) {
  const clean = String(text ?? "").replace(/^﻿/, "");
  const firstLine = clean.split(/\r?\n/).find((l) => l.trim()) ?? "";
  const records = splitRecords(clean, detectDelimiter(firstLine));
  if (!records.length) return { headers: [], rows: [], missing: REQUIRED_HEADERS };
  const keys = records[0].map((h) => HEADER_KEYS[fold(h)] ?? null);
  const missing = REQUIRED_HEADERS.filter((k) => !keys.includes(k));
  const rows = records.slice(1).map((record, i) => {
    const row = { line: i + 2 };
    keys.forEach((key, col) => {
      if (key) row[key] = (record[col] ?? "").trim();
    });
    return row;
  });
  return {
    headers: records[0].map((h) => h.trim()),
    rows: missing.length ? [] : rows,
    missing,
  };
}
export function normalizeCohort(value) {
  const match = String(value ?? "")
    .trim()
    .match(/^k?\s*(\d{1,3})$/i);
  return match ? `K${Number(match[1])}` : "";
}
function normalizeDob(value) {
  const text = String(value ?? "").trim();
  if (!text) return { dob: "" };
  let y, m, d;
  let match = text.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (match) [, d, m, y] = match;
  else if ((match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)))
    [, y, m, d] = match;
  else return { error: "Ngày sinh phải theo dạng dd/mm/yyyy hoặc yyyy-mm-dd." };
  const probe = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  if (
    probe.getUTCFullYear() !== Number(y) ||
    probe.getUTCMonth() !== Number(m) - 1 ||
    probe.getUTCDate() !== Number(d)
  )
    return { error: "Ngày sinh không tồn tại." };
  return {
    dob: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
  };
}
export function normalizeStudentRow(raw, { defaultCohort = "" } = {}) {
  const errors = [];
  const studentCode = String(raw.studentCode ?? "").trim();
  if (!/^\d{8}$/.test(studentCode)) errors.push("MSSV phải gồm đúng 8 chữ số.");
  const fullName = String(raw.fullName ?? "")
    .trim()
    .replace(/\s+/g, " ");
  if (!fullName) errors.push("Họ tên không được để trống.");
  const dobResult = normalizeDob(raw.dob);
  if (dobResult.error) errors.push(dobResult.error);
  let email = String(raw.email ?? "")
    .trim()
    .toLowerCase();
  if (!email && /^\d{8}$/.test(studentCode))
    email = `${studentCode}@student.iuh.edu.vn`;
  else if (/^\d{8}$/.test(studentCode) && !isIuhStudentEmail(studentCode, email))
    errors.push(
      "Email phải là địa chỉ @student.iuh.edu.vn chứa đúng MSSV của sinh viên.",
    );
  const cohort = normalizeCohort(raw.cohort) || normalizeCohort(defaultCohort);
  if (!cohort) errors.push("Thiếu khóa hợp lệ (ví dụ K22).");
  return {
    line: raw.line,
    studentCode,
    fullName,
    dob: dobResult.dob ?? "",
    email,
    homeClass: String(raw.homeClass ?? "").trim(),
    cohort,
    errors,
  };
}
/** Lập kế hoạch nhập: mỗi dòng đã chuẩn hóa nhận CREATE, UPDATE hoặc ERROR. */
export function planStudentImport(db, majorId, rows) {
  const seen = new Set();
  return rows.map((row) => {
    const base = {
      line: row.line,
      row,
      registered: db.studentProfiles.some(
        (p) => p.studentCode === row.studentCode,
      ),
    };
    if (row.errors?.length)
      return { ...base, action: "ERROR", reason: row.errors.join(" ") };
    if (seen.has(row.studentCode))
      return { ...base, action: "ERROR", reason: "Trùng MSSV trong tệp." };
    seen.add(row.studentCode);
    const existing = db.schoolDirectory.filter(
      (s) => s.studentCode === row.studentCode,
    );
    const profile = db.studentProfiles.find(
      (p) => p.studentCode === row.studentCode,
    );
    if (
      existing.some((s) => s.majorId !== majorId) ||
      (profile && profile.majorId !== majorId)
    )
      return {
        ...base,
        action: "ERROR",
        reason: "MSSV đã thuộc danh sách của ngành khác.",
      };
    return { ...base, action: existing.length ? "UPDATE" : "CREATE" };
  });
}
export const IMPORT_TEMPLATE_CSV =
  "MSSV,Họ tên,Ngày sinh,Email,Lớp sinh hoạt,Khóa\n" +
  "26010101,Nguyễn Văn An,15/01/2006,26010101@student.iuh.edu.vn,DHKTPM18A,K22\n";

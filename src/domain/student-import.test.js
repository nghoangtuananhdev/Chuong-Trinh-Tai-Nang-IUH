import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseStudentTable,
  normalizeStudentRow,
  planStudentImport,
} from "./student-import.js";

test("parseStudentTable: dấu phẩy, chấm phẩy, TSV, BOM, nháy kép, tiêu đề có dấu", () => {
  const csv =
    "﻿MSSV,Họ tên,Ngày sinh\r\n26010101,\"Nguyễn, Văn An\",15/01/2006\r\n\r\n26010102,Lê Bình,2006-02-03\r\n";
  const a = parseStudentTable(csv);
  assert.equal(a.rows.length, 2);
  assert.equal(a.rows[0].fullName, "Nguyễn, Văn An");
  assert.equal(a.rows[0].line, 2);
  assert.equal(a.rows[1].studentCode, "26010102");
  const b = parseStudentTable("Mã sinh viên;Họ và tên\n26010101;An\n");
  assert.equal(b.rows[0].fullName, "An");
  const c = parseStudentTable("MSSV\tHọ tên\tKhóa\n26010101\tAn\t22\n");
  assert.equal(c.rows[0].cohort, "22");
  const d = parseStudentTable("Họ tên\nAn\n");
  assert.deepEqual(d.missing, ["studentCode"]);
  assert.equal(d.rows.length, 0);
});
test("normalizeStudentRow: MSSV, ngày sinh, email, khóa", () => {
  const ok = normalizeStudentRow(
    { studentCode: "26010101", fullName: " An  Nguyễn ", dob: "15/01/2006", cohort: "22" },
    {},
  );
  assert.deepEqual(ok.errors, []);
  assert.equal(ok.dob, "2006-01-15");
  assert.equal(ok.cohort, "K22");
  assert.equal(ok.email, "26010101@student.iuh.edu.vn");
  assert.match(
    normalizeStudentRow({ studentCode: "123", fullName: "A" }, { defaultCohort: "k22" })
      .errors[0],
    /MSSV/,
  );
  assert.ok(
    normalizeStudentRow(
      { studentCode: "26010101", fullName: "A", email: "a@gmail.com" },
      { defaultCohort: "K22" },
    ).errors.length,
  );
  assert.ok(
    normalizeStudentRow(
      { studentCode: "26010101", fullName: "A", dob: "31/02/2006" },
      { defaultCohort: "K22" },
    ).errors.length,
  );
  assert.equal(
    normalizeStudentRow({ studentCode: "26010101", fullName: "A", cohort: "k5" }, {})
      .cohort,
    "K5",
  );
});
test("planStudentImport: CREATE, UPDATE, ERROR (trùng tệp, ngành khác)", () => {
  const db = {
    schoolDirectory: [
      { studentCode: "26010102", majorId: "m1" },
      { studentCode: "26010103", majorId: "m2" },
    ],
    studentProfiles: [{ studentCode: "26010102", majorId: "m1" }],
  };
  const row = (code) =>
    normalizeStudentRow({ studentCode: code, fullName: "A" }, { defaultCohort: "K22" });
  const plan = planStudentImport(db, "m1", [
    row("26010101"),
    row("26010102"),
    row("26010103"),
    row("26010101"),
    row("1"),
  ]);
  assert.deepEqual(
    plan.map((p) => p.action),
    ["CREATE", "UPDATE", "ERROR", "ERROR", "ERROR"],
  );
  assert.equal(plan[1].registered, true);
});

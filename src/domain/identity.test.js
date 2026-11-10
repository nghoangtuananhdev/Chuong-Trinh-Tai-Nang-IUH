import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isIuhStudentEmail,
  maskName,
  maskStudentCode,
  checkPasswordPolicy,
} from "./identity.js";
for (const [code, email, expected] of [
  ["87654321", " A.87654321@STUDENT.IUH.EDU.VN ", true],
  ["87654321", "a.87654321@iuh.edu.vn", false],
  ["87654321", "87654321@gmail.com", false],
  ["87654321", "12345679@student.iuh.edu.vn", false],
  ["1234567", "1234567@student.iuh.edu.vn", false],
  ["87654321", "a@87654321@student.iuh.edu.vn", false],
  ["87654321", null, false],
]) {
  test(`Đối chiếu email ${email}`, () =>
    assert.equal(isIuhStudentEmail(code, email), expected));
}
test("Che tên và MSSV theo D-23", () => {
  assert.equal(maskStudentCode("21094501"), "21****01");
  assert.equal(maskStudentCode("12"), "****");
  assert.equal(maskName("Nguyễn Hoàng Nam"), "N. H. Nam");
  assert.equal(maskName("Nam"), "Nam");
});
test("Mật khẩu tối thiểu 8 ký tự, chữ và số", () => {
  assert.deepEqual(checkPasswordPolicy("demo1234"), []);
  for (const p of ["demo", "abcdefgh", "00000000", "", null])
    assert.ok(checkPasswordPolicy(p).length);
});

// Hồi quy cho các lỗi phát hiện khi nghiệm thu giao diện trên trình duyệt (10/11/2026).
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSeedDb } from "../seed/index.js";
import { buildCtx } from "./_kernel.js";
import * as applications from "./applications.js";
import * as rounds from "./rounds.js";
import * as reviews from "./reviews.js";
import * as auth from "./auth.js";
import { ASSIGNABLE_ROLES, canAssignRole } from "../../domain/permissions.js";

const context = (db, username, role) => {
  const user = db.users.find((u) => u.username === username),
    assignment = db.userRoles.find(
      (r) => r.userId === user.id && (!role || r.role === role),
    );
  return buildCtx(
    db,
    { userId: user.id, activeRoleId: assignment.id },
    "entropy87654321",
  );
};

test("mã hồ sơ mới không trùng mã hồ sơ của dữ liệu mẫu", () => {
  let db = buildSeedDb();
  const seedCodes = new Set(db.applications.map((a) => a.code));
  // Tú (SV KSTN) không nộp được R1; dùng ứng viên đã rút hồ sơ ở R1.
  const student = db.users.find((u) => u.id === "usr_26900011") ??
    db.users.find(
      (u) =>
        db.applications.some(
          (a) =>
            a.studentUserId === u.id &&
            a.roundId === "DXT-2026-01" &&
            a.status === "withdrawn",
        ),
    );
  const out = applications.createDraft(db, context(db, student.username), {
    roundId: "DXT-2026-01",
  });
  assert.equal(seedCodes.has(out.result.code), false);
  assert.equal(
    out.db.applications.filter((a) => a.code === out.result.code).length,
    1,
  );
});

test("mã ĐXT mới nối tiếp dãy mã của năm, không trùng mã có sẵn", () => {
  const db = buildSeedDb();
  const out = rounds.create(db, context(db, "GV004"), {
    classId: "cls_ktpm_20",
    name: "ĐXT hồi quy",
    semester: "Học kỳ 2",
    academicYear: "2026–2027",
    quota: 4,
    criteriaSetId: "cs_2",
    lecturerId: "usr_gv001",
    rankingMode: "MAINTAIN_THEN_FILL",
  });
  assert.equal(out.result.code, "DXT-2026-08");
  assert.equal(
    out.db.rounds.filter((r) => r.code === out.result.code).length,
    1,
  );
});

test("lịch sử xét duyệt ghi nhãn tiếng Việt cho quyết định và vai trò", () => {
  const db = buildSeedDb();
  const app = db.applications.find(
    (a) => a.roundId === "DXT-2026-02" && a.status === "pending",
  );
  const out = reviews.decide(db, context(db, "GV001"), {
    applicationId: app.id,
    decision: "REJECTED",
    note: "Thiếu minh chứng",
  });
  const last = out.db.applications.find((a) => a.id === app.id).history.at(-1);
  assert.equal(last.action, "Không đạt");
  assert.equal(last.actorRoleLabel, "Giảng viên phụ trách");
});

test("thông báo khóa tài khoản hiển thị giờ dễ đọc, không phải chuỗi ISO", () => {
  let db = buildSeedDb(),
    last;
  for (let i = 0; i < 5; i++) {
    last = auth.login(db, context(db, "quantri"), {
      username: "GV003",
      password: "sai-mat-khau",
    });
    db = last.db;
  }
  assert.equal(last.error.code, "ACCOUNT_LOCKED");
  assert.doesNotMatch(last.error.message, /\d{4}-\d{2}-\d{2}T/);
  assert.match(last.error.message, /09:15/);
});

test("BR-14: danh sách vai trò được gán khớp kiểm tra canAssignRole", () => {
  const db = buildSeedDb(),
    head = context(db, "GV005", "HEAD");
  assert.deepEqual(ASSIGNABLE_ROLES.HEAD, ["HEAD", "LECTURER"]);
  assert.equal(
    canAssignRole(head, "LECTURER", {
      scopeType: "CLASS",
      scopeId: "cls_ktpm_22",
    }),
    true,
  );
  assert.equal(
    canAssignRole(head, "DEAN", { scopeType: "FACULTY", scopeId: "fac_cntt" }),
    false,
  );
});

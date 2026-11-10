import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSeedDb } from "../seed/index.js";
import { buildCtx } from "./_kernel.js";
import * as criteria from "./criteria.js";
import * as rounds from "./rounds.js";
import * as catalog from "./catalog.js";
import * as roles from "./roles.js";
import * as users from "./users.js";
import { can } from "../../domain/permissions.js";
export const context = (db, username, role) => {
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
test("P4: GV chỉ reset SV lớp K20, CNN không gán lớp ngoài ngành; chặn xóa cha và trùng chuyên ngành", () => {
  const db = buildSeedDb(),
    gv = context(db, "GV001");
  assert.equal(
    can(gv, "student.resetPassword", { type: "user", id: "usr_21094501" }),
    true,
  );
  assert.equal(
    can(gv, "student.resetPassword", { type: "user", id: "usr_26900007" }),
    false,
  );
  assert.throws(() => users.resetPassword(db, gv, { userId: "usr_26900007" }), {
    code: "FORBIDDEN",
  });
  assert.throws(
    () =>
      roles.assign(db, context(db, "GV005"), {
        userId: "usr_gv001",
        role: "LECTURER",
        scopeType: "CLASS",
        scopeId: "cls_httt_21",
      }),
    { code: "FORBIDDEN" },
  );
  assert.throws(
    () => catalog.programDelete(db, context(db, "quantri"), { id: "prg_ktpm" }),
    { code: "CONFLICT" },
  );
  assert.throws(
    () =>
      catalog.programCreate(db, context(db, "quantri"), {
        majorId: "maj_ktpm",
        type: "KSTN",
        name: "KSTN-KTPM",
      }),
    { code: "CONFLICT" },
  );
});
test("P5: GV owner CS4, CNN sửa CS4; tạo v2 không đổi snapshot R2; Assessment preview 190", () => {
  let db = buildSeedDb();
  assert.throws(
    () =>
      criteria.update(db, context(db, "GV001"), { id: "cs_2", name: "Sai" }),
    { code: "FORBIDDEN" },
  );
  db = criteria.update(db, context(db, "GV001"), {
    id: "cs_4",
    name: "Bộ của tôi",
  }).db;
  db = criteria.update(db, context(db, "GV005"), {
    id: "cs_4",
    description: "CNN cập nhật",
  }).db;
  const before = structuredClone(
    db.rounds.find((r) => r.id === "DXT-2026-02").criteriaSnapshot,
  );
  const v = criteria.newVersion(db, context(db, "GV005"), { id: "cs_2" });
  assert.equal(v.result.version, 2);
  assert.equal(v.result.status, "DRAFT");
  assert.notEqual(v.result.id, "cs_1");
  assert.deepEqual(
    v.db.rounds.find((r) => r.id === "DXT-2026-02").criteriaSnapshot,
    before,
  );
  const source = db.applications.find(
    (a) => a.studentCode === "21094501" && a.roundId === "DXT-2026-02",
  );
  assert.equal(
    criteria.previewScore(db, context(db, "GV005"), {
      setId: "cs_2",
      items: source.items,
    }).result.total,
    190,
  );
});
test("P5: ban hành chặn ref chuỗi, xét hòa trùng, thiếu mức; bộ published không sửa trực tiếp", () => {
  const db = buildSeedDb();
  assert.throws(
    () =>
      criteria.update(db, context(db, "GV005"), {
        id: "cs_2",
        name: "Sửa trực tiếp",
      }),
    { code: "INVALID_STATE" },
  );
  for (const change of [
    (s) => {
      s.criteria[0].levels = [];
    },
    (s) => {
      s.criteria[0].tieBreakOrder = 1;
      s.criteria[1].tieBreakOrder = 1;
    },
    (s) => {
      s.criteria[0].refCriterionId = s.criteria[0].id;
    },
  ]) {
    const copy = structuredClone(db),
      set = copy.criteriaSets.find((s) => s.id === "cs_4");
    change(set);
    assert.throws(
      () => criteria.publish(copy, context(copy, "GV001"), { id: "cs_4" }),
      { code: "VALIDATION" },
    );
  }
});
test("P6: phát hành R7 hợp lệ, trùng lớp/HK/năm bị chặn; GV chỉ sửa timeline", () => {
  let db = buildSeedDb();
  const r = rounds.release(db, context(db, "quantri"), { id: "DXT-2026-07" });
  assert.equal(r.result.status, "upcoming");
  db = r.db;
  const duplicate = rounds.create(db, context(db, "quantri"), {
    ...db.rounds.find((r) => r.id === "DXT-2026-07"),
    name: "Đợt trùng",
  });
  assert.throws(
    () =>
      rounds.release(duplicate.db, context(duplicate.db, "quantri"), {
        id: duplicate.result.id,
      }),
    { code: "CONFLICT" },
  );
  assert.throws(
    () =>
      rounds.update(db, context(db, "GV001"), {
        id: "DXT-2026-02",
        changes: { quota: 99 },
      }),
    { code: "FORBIDDEN" },
  );
  assert.throws(
    () =>
      rounds.release(buildSeedDb(), context(buildSeedDb(), "GV001"), {
        id: "DXT-2026-07",
      }),
    { code: "FORBIDDEN" },
  );
});
test("P6: mốc sai trả lỗi tại Field, published bất biến và không cho draft→open", () => {
  const db = buildSeedDb();
  db.rounds.find((r) => r.id === "DXT-2026-07").intakeEnd =
    "2026-01-01T00:00:00+07:00";
  assert.throws(
    () => rounds.release(db, context(db, "quantri"), { id: "DXT-2026-07" }),
    (e) => e.code === "VALIDATION" && e.details.field === "intakeEnd",
  );
  assert.throws(
    () =>
      rounds.update(db, context(db, "quantri"), {
        id: "DXT-2025-01",
        changes: { name: "Sửa" },
      }),
    { code: "INVALID_STATE" },
  );
  assert.throws(
    () =>
      rounds.transition(db, context(db, "quantri"), {
        id: "DXT-2026-07",
        to: "open",
        reason: "Không hợp lệ",
      }),
    { code: "INVALID_STATE" },
  );
});

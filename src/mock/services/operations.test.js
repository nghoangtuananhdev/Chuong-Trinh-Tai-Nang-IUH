import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSeedDb } from "../seed/index.js";
import { buildCtx } from "./_kernel.js";
import * as operations from "./operations.js";
import * as catalog from "./catalog.js";
import * as criteria from "./criteria.js";
import * as applications from "./applications.js";
import { validateEvidence } from "../evidence-store.js";
const ctx = (db, username) => {
  const user = db.users.find((u) => u.username === username),
    role = db.userRoles.find((r) => r.userId === user.id);
  return buildCtx(
    db,
    { userId: user.id, activeRoleId: role.id },
    "random56789012",
  );
};
test("P10: báo cáo theo phạm vi, số liệu thật, CSV có BOM và tiếng Việt", () => {
  const db = buildSeedDb(),
    data = operations.roundSummary(db, ctx(db, "GV001"), {
      roundId: "DXT-2026-02",
    }).result;
  assert.equal(
    data.total,
    db.applications.filter((a) => a.roundId === "DXT-2026-02").length,
  );
  assert.equal(data.flowCounts.C, 3);
  assert.throws(
    () =>
      operations.roundSummary(db, ctx(db, "GV002"), { roundId: "DXT-2026-02" }),
    { code: "FORBIDDEN" },
  );
  const csv = operations.exportRoundCsv(db, ctx(db, "GV900"), {
    roundId: "DXT-2025-01",
  }).result;
  assert.equal(csv.charCodeAt(0), 0xfeff);
  assert.ok(csv.includes("Họ tên"));
  assert.ok(csv.includes("Nguyễn Minh An"));
});
test("P10: cấu hình chỉ ADMIN; hạ file maxMb=2 chặn 3MB, audit before/after", async () => {
  let db = buildSeedDb();
  assert.throws(
    () =>
      operations.updateConfig(db, ctx(db, "GV900"), {
        config: { files: { maxMb: 2 } },
      }),
    { code: "FORBIDDEN" },
  );
  const r = operations.updateConfig(db, ctx(db, "quantri"), {
    config: { files: { maxMb: 2 } },
  });
  db = r.db;
  await assert.rejects(
    validateEvidence(
      { type: "application/pdf", size: 3 * 1048576 },
      db.config.files,
    ),
    { code: "VALIDATION" },
  );
  const log = db.auditLogs.at(-1);
  assert.equal(log.action, "CONFIG_CHANGED");
  assert.equal(log.before.files.maxMb, 10);
  assert.equal(log.after.files.maxMb, 2);
  assert.throws(
    () =>
      operations.updateConfig(db, ctx(db, "quantri"), {
        config: { files: { maxMb: 11 } },
      }),
    { code: "VALIDATION" },
  );
});
test("P10: email lỗi gửi lại, PĐT chỉ đọc lỗi, GV không được đọc/resend", () => {
  const db = buildSeedDb();
  db.emailOutbox.push({
    id: "failed",
    to: "fail@example.com",
    status: "FAILED",
    attempts: 3,
    lastError: "SMTP",
    createdAt: db.clock.now,
  });
  assert.throws(() => operations.emailList(db, ctx(db, "GV001"), {}), {
    code: "FORBIDDEN",
  });
  const rows = operations.emailList(db, ctx(db, "GV900"), {}).result;
  assert.ok(rows.every((e) => e.status === "FAILED"));
  const r = operations.emailResend(db, ctx(db, "GV900"), { id: "failed" });
  assert.equal(r.result.status, "QUEUED");
  assert.equal(r.result.attempts, 0);
  assert.equal(r.db.auditLogs.at(-1).action, "EMAIL_RESENT");
});
test("Chặn chuyển chuyên ngành sang khoa ngoài phạm vi và tạo bộ sai khoa/ngành", () => {
  const db = buildSeedDb();
  assert.throws(
    () =>
      catalog.programUpdate(db, ctx(db, "GV004"), {
        id: "prg_ktpm",
        majorId: "maj_mkt",
      }),
    { code: "FORBIDDEN" },
  );
  assert.throws(
    () =>
      criteria.create(db, ctx(db, "GV001"), {
        name: "Ngoài khoa",
        facultyId: "fac_qtkd",
        majorId: "maj_mkt",
      }),
    { code: "FORBIDDEN" },
  );
  assert.throws(() =>
    criteria.create(db, ctx(db, "GV005"), {
      name: "Khoa sai",
      facultyId: "fac_qtkd",
      majorId: "maj_ktpm",
    }),
  );
});
test("Không thao tác hồ sơ người khác; nộp thiếu minh chứng không commit", () => {
  const db = buildSeedDb(),
    mai = ctx(db, "26010011"),
    draft = db.applications.find(
      (a) => a.studentCode === "26010011" && a.status === "draft",
    );
  assert.throws(
    () => applications.saveDraft(db, ctx(db, "26010022"), { id: draft.id }),
    { code: "FORBIDDEN" },
  );
  const before = structuredClone(db);
  assert.throws(
    () =>
      applications.submit(db, mai, {
        id: draft.id,
        committed: true,
        items: draft.items.map((i) => ({
          ...i,
          evidence: [],
          declaredEntries: [],
        })),
      }),
    { code: "VALIDATION" },
  );
  assert.deepEqual(db, before);
});
test("Không rút hồ sơ thành viên năm lịch sử; chỉ năm hiện tại", () => {
  const db = buildSeedDb(),
    past = db.memberships.find(
      (m) => m.studentUserId === "usr_21094501" && m.studyYear === 1,
    );
  assert.throws(
    () =>
      catalog.withdrawMember(db, ctx(db, "GV001"), {
        membershipId: past.id,
        own: true,
        reason: "Kiểm thử",
      }),
    { code: "INVALID_STATE" },
  );
});

test("Counter phục hồi từ storage không gây trùng ID tiêu chí seed", () => {
  const db = buildSeedDb();
  db.counters.cs = 0;
  const r = criteria.newVersion(db, ctx(db, "GV005"), { id: "cs_2" });
  assert.equal(
    new Set(r.db.criteriaSets.map((s) => s.id)).size,
    r.db.criteriaSets.length,
  );
});

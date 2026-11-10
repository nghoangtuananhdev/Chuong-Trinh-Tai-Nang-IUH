import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSeedDb } from "./seed/index.js";
import { ROUND_STATUS, APPLICATION_STATUSES } from "../domain/constants.js";
import { scoreApplication } from "../domain/scoring.js";
import {
  latestMemberships,
  latestList,
  isFirstRound,
} from "../domain/selectors.js";
const db = buildSeedDb();
test("Seed deterministic, tách biệt mỗi lần khởi tạo", () => {
  assert.deepEqual(db, buildSeedDb());
  const other = buildSeedDb();
  other.users[0].fullName = "Khác";
  assert.notEqual(db.users[0].fullName, other.users[0].fullName);
});
test("Mọi FK cơ bản trong seed tồn tại và ID từng bảng duy nhất", () => {
  const exists = (table, key) =>
    assert.ok(
      db[table].some((row) => row.id === key),
      `${table}: ${key}`,
    );
  for (const [table, rows] of Object.entries(db))
    if (Array.isArray(rows) && rows.some((r) => r.id))
      assert.equal(new Set(rows.map((r) => r.id)).size, rows.length, table);
  for (const m of db.majors) exists("faculties", m.facultyId);
  for (const p of db.programs) exists("majors", p.majorId);
  for (const c of db.classes) {
    exists("programs", c.programId);
    exists("users", c.lecturerId);
  }
  for (const p of db.studentProfiles) {
    exists("users", p.userId);
    exists("majors", p.majorId);
  }
  for (const p of db.lecturerProfiles) {
    exists("users", p.userId);
    exists("faculties", p.facultyId);
  }
  for (const r of db.rounds) {
    exists("classes", r.classId);
    exists("criteriaSets", r.criteriaSetId);
    exists("users", r.lecturerId);
    exists("users", r.createdBy);
  }
  for (const a of db.applications) {
    exists("users", a.studentUserId);
    exists("rounds", a.roundId);
    if (a.previousApplicationId)
      exists("applications", a.previousApplicationId);
    const snapshot = db.rounds.find((r) => r.id === a.roundId).criteriaSnapshot;
    if (snapshot)
      for (const item of a.items)
        assert.ok(snapshot.criteria.some((c) => c.id === item.criterionId));
  }
  for (const m of db.memberships) {
    exists("classes", m.classId);
    exists("users", m.studentUserId);
    exists("applications", m.sourceApplicationId);
  }
  for (const l of db.admissionLists) {
    exists("rounds", l.roundId);
    exists("users", l.createdBy);
    for (const r of l.payload.rows) {
      exists("applications", r.applicationId);
      exists("users", r.studentUserId);
    }
  }
  for (const step of db.approvalSteps) {
    exists("admissionLists", step.listId);
    exists("users", step.decidedBy);
  }
  for (const r of db.userRoles) {
    exists("users", r.userId);
    const table = { CLASS: "classes", MAJOR: "majors", FACULTY: "faculties" }[
      r.scopeType
    ];
    if (table) exists(table, r.scopeId);
  }
  for (const r of db.reviewRequests) {
    exists("applications", r.applicationId);
    exists("users", r.createdBy);
  }
});
test("Seed đủ 6 trạng thái ĐXT và mọi trạng thái hồ sơ trừ cancelled", () => {
  assert.deepEqual(
    [...new Set(db.rounds.map((r) => r.status))].sort(),
    [...ROUND_STATUS].sort(),
  );
  for (const status of Object.keys(APPLICATION_STATUSES).filter(
    (s) => s !== "cancelled",
  ))
    assert.ok(
      db.applications.some((a) => a.status === status),
      status,
    );
});
test("Nam R2: official/self = 190; mọi approved đã xác minh và đạt BB", () => {
  const nam = db.applications.find(
    (a) => a.studentCode === "21094501" && a.roundId === "DXT-2026-02",
  );
  assert.equal(nam.officialScore, 190);
  assert.equal(nam.selfScore, 190);
  for (const a of db.applications.filter((a) =>
    ["approved", "confirmed"].includes(a.status),
  )) {
    const round = db.rounds.find((r) => r.id === a.roundId),
      s = scoreApplication(round.criteriaSnapshot, a.items, "official");
    assert.equal(s.eligible, true, a.code);
    assert.equal(s.total, a.officialScore, a.code);
    assert.ok(a.items.every((i) => i.verifyStatus !== "UNVERIFIED"));
  }
});
test("isKSTN khớp membership hiện tại, hồ sơ hiệu lực không trùng trên ĐXT", () => {
  for (const p of db.studentProfiles)
    assert.equal(
      p.isKSTN,
      latestMemberships(db, p.userId).some((m) => m.status === "ACTIVE"),
      p.studentCode,
    );
  const effective = db.applications.filter((a) =>
    ["draft", "pending", "needs_update", "approved"].includes(a.status),
  );
  assert.equal(
    new Set(effective.map((a) => `${a.roundId}:${a.studentUserId}`)).size,
    effective.length,
  );
});
test("ĐXT đã mở có snapshot PUBLISHED; CS-3 v1 lịch sử được phép ARCHIVED", () => {
  for (const r of db.rounds) {
    if (!["draft", "upcoming"].includes(r.status))
      assert.equal(r.criteriaSnapshot?.status, "PUBLISHED", r.id);
    if (r.status === "upcoming")
      assert.equal(
        db.criteriaSets.find((c) => c.id === r.criteriaSetId).status,
        "PUBLISHED",
      );
    if (r.status === "draft") assert.equal(r.criteriaSnapshot, null);
  }
});
test("Danh sách phiên bản/bước duyệt khớp trạng thái ĐXT", () => {
  for (const r of db.rounds.filter((r) =>
    ["approving", "published"].includes(r.status),
  )) {
    const list = latestList(db, r.id);
    assert.ok(list, r.id);
    assert.equal(
      list.status,
      r.status === "published" ? "PUBLISHED" : "PENDING",
    );
    const approved = db.approvalSteps
      .filter((s) => s.listId === list.id && s.decision === "APPROVED")
      .map((s) => s.level);
    const expected =
      r.status === "published"
        ? ["HEAD", "DEAN", "TRAINING"]
        : r.approvalSubstatus === "waiting_training"
          ? ["HEAD", "DEAN"]
          : r.approvalSubstatus === "waiting_dean"
            ? ["HEAD"]
            : [];
    assert.deepEqual(approved, expected, r.id);
  }
  assert.equal(latestList(db, "DXT-2026-04").version, 2);
  assert.ok(
    db.admissionLists.some(
      (l) =>
        l.roundId === "DXT-2026-04" &&
        l.version === 1 &&
        l.status === "RETURNED",
    ),
  );
  const tied = latestList(db, "DXT-2026-03");
  assert.equal(tied.payload.rows.filter((r) => r.tieGroup).length, 2);
  assert.equal(tied.payload.rows.filter((r) => r.proposed === true).length, 2);
  assert.equal(
    isFirstRound(
      db,
      db.rounds.find((r) => r.id === "DXT-2026-05"),
    ),
    false,
  );
});

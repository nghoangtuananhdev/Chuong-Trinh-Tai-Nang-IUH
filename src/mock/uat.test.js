import { test } from "node:test";
import assert from "node:assert/strict";
import { createMockClient } from "./client.js";
import { buildSeedDb } from "./seed/index.js";
import { latestList } from "../domain/selectors.js";
import { can } from "../domain/permissions.js";
import { buildCtx } from "./services/_kernel.js";
function setup() {
  const client = createMockClient({
    initialState: { db: buildSeedDb(), session: null },
    persist: async () => {},
    onState: () => {},
    entropy: () => crypto.randomUUID(),
    seedFactory: buildSeedDb,
    clearFiles: async () => {},
  });
  const db = () => client.getState().db;
  const call = client.call;
  const login = async (username) =>
    call("system.demoLogin", {
      userId: db().users.find((u) => u.username === username).id,
    });
  return { client, db, call, login };
}
async function token(m, studentCode, email, purpose = "REGISTER") {
  const r = await m.call("otp.request", { studentCode, email, purpose });
  const mail = m
    .db()
    .emailOutbox.find((e) => e.relatedEntity === r.challengeId);
  assert.ok(mail);
  const code = mail.body.match(/\b\d{6}\b/)[0];
  return m.call("otp.verify", { challengeId: r.challengeId, code });
}
function filled(snapshot) {
  return snapshot.criteria.map((c) => ({
    criterionId: c.id,
    declaredValue:
      c.sampleValue ??
      (c.refCriterionId
        ? null
        : Math.max(...c.levels.map((l) => Number(l.valueFrom) || 0))),
    declaredCount: c.sampleValue ?? 1,
    evidence:
      c.evidenceRequired && c.valueType !== "ACCUMULATIVE_ENUM"
        ? [
            {
              fileKey: "test-file",
              name: "minh-chung.pdf",
              mime: "application/pdf",
              size: 100,
              uploadedAt: "2026-11-09T09:00:00+07:00",
            },
          ]
        : [],
    declaredEntries:
      c.valueType === "ACCUMULATIVE_ENUM"
        ? [
            {
              id: "achievement",
              title: "Giải mẫu",
              levelId: c.levels[0].id,
              evidence: [
                {
                  fileKey: "test-achievement",
                  name: "giai.pdf",
                  mime: "application/pdf",
                  size: 100,
                },
              ],
            },
          ]
        : [],
  }));
}
test("U1: đăng ký → OTP hộp thư → tạo TK → nháp R1 → nộp → email có mã", async () => {
  const m = setup(),
    v = await token(m, "26019999", "khang.26019999@student.iuh.edu.vn");
  const user = await m.call("account.registerStudent", {
    otpToken: v.otpToken,
    password: "demo5678",
    phone: "0900000000",
  });
  assert.equal(
    m.db().studentProfiles.find((p) => p.userId === user.userId).isKSTN,
    false,
  );
  const draft = await m.call("applications.createDraft", {
    roundId: "DXT-2026-01",
  });
  const app = await m.call("applications.submit", {
    id: draft.id,
    items: filled(
      m.db().rounds.find((r) => r.id === draft.roundId).criteriaSnapshot,
    ),
    committed: true,
  });
  assert.equal(app.status, "pending");
  assert.equal(app.flow, "A");
  assert.ok(
    m
      .db()
      .emailOutbox.some(
        (e) =>
          e.template === "APPLICATION_SUBMITTED" && e.body.includes(app.code),
      ),
  );
});
test("U2: giả email không nhận OTP, không lộ việc MSSV có TK", async () => {
  const m = setup(),
    count = m.db().emailOutbox.length;
  const r = await m.call("otp.request", {
    studentCode: "21094501",
    email: "hacker.21094501@student.iuh.edu.vn",
    purpose: "REGISTER",
  });
  assert.match(r.message, /Nếu thông tin hợp lệ/);
  assert.equal(
    m
      .db()
      .emailOutbox.filter((e) => e.to === "hacker.21094501@student.iuh.edu.vn")
      .length,
    0,
  );
  await assert.rejects(
    m.call("otp.verify", { challengeId: r.challengeId, code: "000000" }),
  );
});
test("U3: OTP chính chủ xong báo đã có tài khoản; Nam đăng nhập luồng C", async () => {
  const m = setup(),
    v = await token(m, "21094501", "21094501@student.iuh.edu.vn");
  assert.equal(v.accountExists, true);
  await assert.rejects(
    m.call("account.registerStudent", {
      otpToken: v.otpToken,
      password: "demo5678",
    }),
    { code: "CONFLICT" },
  );
  await m.call("auth.login", { username: "21094501", password: "demo1234" });
  assert.equal(m.client.getState().session.userId, "usr_21094501");
});
test("U4a: Bảo sửa giá trị trong hạn → pending, reset xác minh và báo GV", async () => {
  const m = setup();
  await m.login("21094602");
  const app = m
      .db()
      .applications.find(
        (a) => a.studentCode === "21094602" && a.status === "needs_update",
      ),
    items = structuredClone(app.items);
  items.find((i) => i.criterionId === "c_ta").declaredValue = 650;
  const r = await m.call("applications.resubmit", {
    id: app.id,
    items,
    committed: true,
  });
  assert.equal(r.status, "pending");
  assert.equal(
    r.items.find((i) => i.criterionId === "c_ta").verifyStatus,
    "UNVERIFIED",
  );
  assert.ok(
    m
      .db()
      .notifications.some(
        (n) => n.type === "APPLICATION_RESUBMITTED" && n.userId === "usr_gv001",
      ),
  );
});
test("U4b: qua hạn Bảo → rejected + email; không được bổ sung sau hạn", async () => {
  const m = setup();
  await m.call("system.setClock", { now: "2026-11-12T09:01:00+07:00" });
  const app = m
    .db()
    .applications.find(
      (a) => a.studentCode === "21094602" && a.roundId === "DXT-2026-02",
    );
  assert.equal(app.status, "rejected");
  assert.ok(
    m.db().emailOutbox.some((e) => e.template === "NEEDS_UPDATE_EXPIRED"),
  );
  await m.login("21094602");
  await assert.rejects(
    m.call("applications.resubmit", {
      id: app.id,
      items: app.items,
      committed: true,
    }),
    { code: "INVALID_STATE" },
  );
});
test("U5: BLĐ trả về R4 → review, chốt v3 → HEAD từ đầu", async () => {
  const m = setup();
  await m.login("GV004");
  await m.call("lists.return", {
    listId: latestList(m.db(), "DXT-2026-04").id,
    level: "DEAN",
    reason: "Rà soát minh chứng",
  });
  assert.equal(
    m.db().rounds.find((r) => r.id === "DXT-2026-04").status,
    "review",
  );
  await m.login("GV002");
  const list = await m.call("lists.closeReview", { roundId: "DXT-2026-04" });
  assert.equal(list.version, 3);
  assert.equal(
    m.db().rounds.find((r) => r.id === "DXT-2026-04").approvalSubstatus,
    "waiting_head",
  );
});
test("U6: PĐT công bố R5 và public results che MSSV/tên", async () => {
  const m = setup();
  await m.login("GV900");
  const r = await m.call("lists.publish", {
    listId: latestList(m.db(), "DXT-2026-05").id,
  });
  assert.equal(r.confirmed, 3);
  assert.equal(r.dropped, 1);
  const rows = await m.call("public.results", { roundId: "DXT-2026-05" });
  assert.ok(
    rows.every((r) => r.studentCode.includes("****") && r.name.includes(".")),
  );
  await m.login("quantri");
  await assert.rejects(
    m.call("rounds.update", { id: "DXT-2026-05", changes: { quota: 99 } }),
    { code: "INVALID_STATE" },
  );
});
test("U7: GV009 phải đổi MK, sau đổi mới có quyền", async () => {
  const m = setup();
  await m.call("auth.login", { username: "GV009", password: "demo1234" });
  assert.equal(
    can(buildCtx(m.db(), m.client.getState().session), "class.view"),
    false,
  );
  await m.call("auth.changePassword", {
    oldPassword: "demo1234",
    newPassword: "changed5678",
  });
  assert.equal(
    can(buildCtx(m.db(), m.client.getState().session), "class.view"),
    true,
  );
});
test("U8: tạo v2 CS2, snapshot R2 v1 bất biến", async () => {
  const m = setup();
  await m.login("GV005");
  const snapshot = structuredClone(
    m.db().rounds.find((r) => r.id === "DXT-2026-02").criteriaSnapshot,
  );
  const v = await m.call("criteria.newVersion", { id: "cs_2" });
  assert.equal(v.version, 2);
  assert.equal(v.status, "DRAFT");
  assert.deepEqual(
    m.db().rounds.find((r) => r.id === "DXT-2026-02").criteriaSnapshot,
    snapshot,
  );
});
test("U9: hoàn tất R2 → Tú không nộp bị DROPPED, isKSTN false", async () => {
  const m = setup();
  await m.call("system.setClock", { now: "2026-11-12T09:01:00+07:00" });
  await m.login("GV001");
  for (const a of m
    .db()
    .applications.filter(
      (a) => a.roundId === "DXT-2026-02" && a.status === "pending",
    ))
    await m.call("reviews.decide", {
      applicationId: a.id,
      decision: "REJECTED",
      note: "Không đạt minh chứng trong kịch bản kiểm thử",
    });
  const list = await m.call("lists.closeReview", { roundId: "DXT-2026-02" });
  for (const [user, level] of [
    ["GV005", "HEAD"],
    ["GV004", "DEAN"],
  ]) {
    await m.login(user);
    await m.call("lists.approve", { listId: list.id, level });
  }
  await m.login("GV900");
  await m.call("lists.publish", { listId: list.id });
  assert.equal(
    m
      .db()
      .memberships.find(
        (x) => x.studentUserId === "usr_21094777" && x.studyYear === 3,
      ).status,
    "DROPPED",
  );
  assert.equal(
    m.db().studentProfiles.find((p) => p.userId === "usr_21094777").isKSTN,
    false,
  );
  assert.ok(
    m
      .db()
      .emailOutbox.some(
        (e) => e.template === "RESULT_DROPPED" && e.to.includes("21094777"),
      ),
  );
});
test("U10: CNN HTTT không được duyệt hồ sơ KTPM", async () => {
  const m = setup();
  await m.login("GV002");
  const id = m
    .db()
    .applications.find(
      (a) => a.roundId === "DXT-2026-02" && a.status === "pending",
    ).id;
  await assert.rejects(
    m.call("reviews.decide", {
      applicationId: id,
      decision: "REJECTED",
      note: "Ngoài ngành",
    }),
    { code: "FORBIDDEN" },
  );
});
test("U11: GV005 HEAD ↔ LECTURER phạm vi khác nhau", async () => {
  const m = setup();
  await m.login("GV005");
  assert.equal(
    m.client.getState().session.activeRoleId,
    m.db().userRoles.find((r) => r.userId === "usr_gv005" && r.role === "HEAD")
      .id,
  );
  const r = m
    .db()
    .userRoles.find((r) => r.userId === "usr_gv005" && r.role === "LECTURER");
  await m.call("auth.switchRole", { roleId: r.id });
  const ctx = buildCtx(m.db(), m.client.getState().session);
  assert.equal(
    can(ctx, "application.review", { type: "round", id: "DXT-2026-02" }),
    false,
  );
  assert.equal(
    can(ctx, "application.review", { type: "round", id: "DXT-2026-01" }),
    true,
  );
});
test("U12: clock R6 tự mở, snapshot và audit hệ thống", async () => {
  const m = setup();
  await m.call("system.setClock", { now: "2026-11-15T00:00:00+07:00" });
  const r = m.db().rounds.find((r) => r.id === "DXT-2026-06");
  assert.equal(r.status, "open");
  assert.ok(r.criteriaSnapshot);
  assert.ok(
    m
      .db()
      .auditLogs.some(
        (l) =>
          l.action === "ROUND_OPENED" &&
          l.entityId === r.id &&
          l.actorId === null,
      ),
  );
});
test("U13: một SV được chọn ở 2 ĐXT cùng năm, ĐXT sau lấp suất kế tiếp", async () => {
  const m = setup();
  let db = m.db();
  const first = db.rounds.find((r) => r.id === "DXT-2026-05"),
    list = latestList(db, first.id);
  const selected = list.payload.rows.find((r) => r.proposed);
  db.memberships.push({
    id: "uat_other_class",
    classId: "cls_ktpm_22",
    studentUserId: selected.studentUserId,
    studyYear: 1,
    status: "ACTIVE",
  });
  const waitingApp = structuredClone(
    db.applications.find(
      (a) =>
        a.roundId === first.id &&
        a.status === "approved" &&
        a.studentUserId !== selected.studentUserId,
    ),
  );
  waitingApp.id = "uat_waiting";
  waitingApp.studentUserId = "usr_26900012";
  waitingApp.studentCode = "26900012";
  waitingApp.applicantName = "Nguyễn Anh Phúc";
  db.applications.push(waitingApp);
  list.payload.rows.push({
    ...structuredClone(list.payload.rows.at(-1)),
    applicationId: waitingApp.id,
    studentUserId: waitingApp.studentUserId,
    studentCode: waitingApp.studentCode,
    name: waitingApp.applicantName,
    rank: 4,
    proposed: false,
    group: selected.group,
  });
  m.client.replaceState({ db, session: null });
  await m.login("GV900");
  await m.call("lists.publish", { listId: list.id });
  assert.equal(
    m.db().applications.find((a) => a.id === selected.applicationId).status,
    "not_admitted",
  );
  assert.equal(
    m.db().applications.find((a) => a.id === waitingApp.id).status,
    "confirmed",
  );
  assert.equal(
    m
      .db()
      .applications.filter(
        (a) => a.roundId === first.id && a.status === "confirmed",
      ).length,
    3,
  );
});
test("U14: CNN phải chọn 1 trong 2 đồng hạng R3, BLĐ thấy tieResolution", async () => {
  const m = setup();
  await m.login("GV005");
  const l = latestList(m.db(), "DXT-2026-03");
  await assert.rejects(
    m.call("lists.approve", { listId: l.id, level: "HEAD" }),
    { code: "VALIDATION" },
  );
  const id = l.payload.rows.find((r) => r.tieGroup).applicationId;
  await m.call("lists.approve", {
    listId: l.id,
    level: "HEAD",
    tieResolution: { selectedApplicationIds: [id] },
  });
  await m.login("GV004");
  assert.deepEqual(
    latestList(m.db(), "DXT-2026-03").tieResolution.selectedApplicationIds,
    [id],
  );
});
test("U15: GVPT reset SV K20 gửi MK tạm, SV buộc đổi khi đăng nhập", async () => {
  const m = setup();
  await m.login("GV001");
  const r = await m.call("users.resetPassword", { userId: "usr_21094501" });
  assert.ok(r.temporaryPassword.length >= 10);
  assert.ok(
    m
      .db()
      .emailOutbox.some(
        (e) => e.template === "PASSWORD_TEMP" && e.to.includes("21094501"),
      ),
  );
  await m.call("auth.login", {
    username: "21094501",
    password: r.temporaryPassword,
  });
  assert.equal(
    buildCtx(m.db(), m.client.getState().session).actor.user.mustChangePassword,
    true,
  );
});

test("Thông tin cá nhân: đổi email IUH bằng OTP alias trong danh bạ", async () => {
  const m = setup();
  await m.login("21094501");
  const v = await token(
    m,
    "21094501",
    "nam.21094501@student.iuh.edu.vn",
    "CHANGE_EMAIL",
  );
  const r = await m.call("me.update", {
    phone: "0900000000",
    newEmail: "nam.21094501@student.iuh.edu.vn",
    otpToken: v.otpToken,
  });
  assert.equal(r.email, "nam.21094501@student.iuh.edu.vn");
  assert.equal(
    m.db().auditLogs.filter((l) => l.action === "PROFILE_UPDATED").length,
    1,
  );
});

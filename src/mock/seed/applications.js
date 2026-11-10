import { scoreApplication } from "../../domain/scoring.js";
import { studyYear, latestMemberships } from "../../domain/selectors.js";
export function seedApplication(
  db,
  roundId,
  studentCode,
  status,
  { flow = "A", gpa = 3.5, toeic = 600, prior = null } = {},
) {
  const round = db.rounds.find((r) => r.id === roundId),
    user = db.users.find((u) => u.username === studentCode),
    profile = db.studentProfiles.find((p) => p.userId === user.id);
  const set =
    round.criteriaSnapshot ??
    db.criteriaSets.find((s) => s.id === round.criteriaSetId);
  const id = `seed_app_${db.applications.length + 1}`;
  const sample = (name) => ({
    fileKey: null,
    name,
    mime: "application/pdf",
    size: 1024,
    uploadedAt: round.intakeStart,
    sample: true,
  });
  const verified = !["draft", "pending", "needs_update", "withdrawn"].includes(
    status,
  );
  const value = {
    c_tc_dat: 40,
    c_tc_rot: status === "rejected" ? 1 : 0,
    c_gpa: status === "rejected" ? 2.5 : gpa,
    c_rl: 85,
    c_ta: toeic,
    c_nckh: 1,
    c_hd: 2,
  };
  const items = set.criteria.map((c) => ({
    criterionId: c.id,
    declaredValue: c.refCriterionId ? null : (value[c.id] ?? null),
    declaredCount: value[c.id] ?? null,
    declaredEntries:
      c.valueType === "ACCUMULATIVE_ENUM"
        ? ["g1", "g3"].map((levelId, i) => ({
            id: `${id}_entry_${i}`,
            title: `Thành tích ${i + 1}`,
            levelId,
            evidence: [sample(`thanh-tich-${i + 1}.pdf`)],
            verifyStatus: verified ? "VALID" : "UNVERIFIED",
            verifyNote: "",
          }))
        : [],
    evidence:
      c.evidenceRequired && c.valueType !== "ACCUMULATIVE_ENUM"
        ? [sample(`${c.id}-${studentCode}.pdf`)]
        : [],
    verifyStatus: verified ? "VALID" : "UNVERIFIED",
    verifiedValue: null,
    verifyNote: "",
    verifiedBy: verified ? round.lecturerId : null,
    verifiedAt: verified ? round.reviewStart : null,
  }));
  const self = scoreApplication(set, items),
    official = scoreApplication(set, items, "official");
  const application = {
    id,
    code: `HS-${round.academicYear.slice(0, 4)}-${String(db.applications.length + 1).padStart(6, "0")}`,
    roundId,
    studentUserId: user.id,
    studentCode,
    applicantName: user.fullName,
    dob: profile.dob,
    email: user.email,
    phone: user.phone,
    homeClass: profile.homeClass,
    majorName: db.majors.find((m) => m.id === profile.majorId).name,
    flow,
    status,
    committed: status !== "draft",
    items,
    selfScore: self.total,
    selfEligible: self.eligible,
    officialScore: verified ? official.total : null,
    officialEligible: verified ? official.eligible : null,
    rank: null,
    submittedAt: status === "draft" ? null : round.intakeStart,
    lastEditedAt: round.intakeStart,
    previousApplicationId: prior,
    decisionNote: status === "rejected" ? "Không đạt tiêu chí bắt buộc" : "",
    decidedBy: verified ? round.lecturerId : null,
    decidedAt: verified ? round.reviewStart : null,
    remindersSent: [],
    history: [
      {
        at: round.intakeStart,
        actorId: user.id,
        actorName: user.fullName,
        actorRoleLabel: "Sinh viên",
        action: status === "draft" ? "Lưu nháp" : "Nộp hồ sơ",
        note: "",
      },
    ],
  };
  if (verified)
    application.history.push({
      at: round.reviewStart,
      actorId: round.lecturerId,
      actorName: db.users.find((u) => u.id === round.lecturerId).fullName,
      actorRoleLabel: "Giảng viên phụ trách",
      action: status === "rejected" ? "Không đạt" : "Đạt điều kiện",
      note: application.decisionNote,
    });
  if (["confirmed", "not_admitted"].includes(status))
    application.history.push({
      at: round.publishedAt,
      actorId: "usr_gv900",
      actorName: "Nguyễn Minh Anh",
      actorRoleLabel: "PĐT",
      action: "Công bố kết quả",
      note: status === "confirmed" ? "Trúng tuyển" : "Ngoài chỉ tiêu",
    });
  db.applications.push(application);
  return application;
}
function member(db, roundId, app, status = "ACTIVE") {
  const round = db.rounds.find((r) => r.id === roundId);
  db.memberships.push({
    id: `seed_member_${db.memberships.length + 1}`,
    classId: round.classId,
    studentUserId: app.studentUserId,
    studyYear: studyYear(db, round),
    status,
    sourceApplicationId: app.id,
    note: "Dữ liệu minh họa",
    updatedAt: round.publishedAt ?? round.intakeStart,
  });
}
export function seedApplications(db) {
  const add = (...args) => seedApplication(db, ...args);
  for (const code of [
    "21094501",
    "21094518",
    "21094602",
    "21094777",
    "21094650",
  ]) {
    const year1 = add("DXT-2024-01", code, "confirmed");
    member(db, "DXT-2024-01", year1);
    const year2 = add(
      "DXT-2025-02",
      code,
      code === "21094650" ? "rejected" : "confirmed",
      { flow: "C", prior: year1.id },
    );
    member(
      db,
      "DXT-2025-02",
      year2,
      code === "21094650" ? "DROPPED" : "ACTIVE",
    );
    if (code === "21094777") continue;
    const status = {
      21094501: "approved",
      21094518: "pending",
      21094602: "needs_update",
      21094650: "rejected",
    }[code];
    const app = add("DXT-2026-02", code, status, {
      flow: code === "21094650" ? "B" : "C",
      prior: year2.id,
    });
    if (status === "needs_update")
      db.reviewRequests.push({
        id: "seed_request_1",
        applicationId: app.id,
        message: "Vui lòng bổ sung bản quét chứng chỉ tiếng Anh rõ nét.",
        dueAt: "2026-11-12T09:00:00+07:00",
        createdBy: "usr_gv001",
        createdAt: "2026-11-08T09:00:00+07:00",
        resolvedAt: null,
      });
  }
  const han = add("DXT-2025-01", "22073210", "not_admitted");
  add("DXT-2026-02", "22073210", "pending", { flow: "B", prior: han.id });
  for (const code of ["26900001", "26900002", "26900003"])
    member(db, "DXT-2025-01", add("DXT-2025-01", code, "confirmed"));
  add("DXT-2025-01", "26900011", "rejected");
  add("DXT-2026-01", "26010011", "draft");
  add("DXT-2026-01", "26010022", "pending");
  for (const code of ["26900004", "26900005", "26900006"])
    add("DXT-2026-01", code, "pending");
  // Two retained students, then two new applicants tied for one remaining seat.
  add("DXT-2026-03", "26900001", "approved", { flow: "C", gpa: 3.6 });
  add("DXT-2026-03", "26900002", "approved", { flow: "C", gpa: 3.55 });
  add("DXT-2026-03", "26010022", "approved");
  add("DXT-2026-03", "22073210", "approved", { flow: "B" });
  for (const [i, code] of ["26900004", "26900005", "26900006"].entries())
    add("DXT-2026-04", code, "approved", { gpa: 3.6 - i * 0.1 });
  for (const code of ["26900007", "26900010"])
    member(db, "DXT-2025-03", add("DXT-2025-03", code, "confirmed"));
  add("DXT-2026-05", "26900007", "approved", { flow: "C" });
  add("DXT-2026-05", "26900008", "approved", { gpa: 3.6 });
  add("DXT-2026-05", "26900009", "approved", { gpa: 3.4 });
  add("DXT-2026-01", "26900012", "withdrawn");
  for (const profile of db.studentProfiles)
    profile.isKSTN = latestMemberships(db, profile.userId).some(
      (m) => m.status === "ACTIVE",
    );
}

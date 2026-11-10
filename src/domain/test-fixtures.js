export const assessment = {
  id: "cs_2",
  rootId: "cs_2",
  version: 1,
  facultyId: "fac_cntt",
  majorId: "maj_ktpm",
  createdBy: "usr_gv005",
  name: "Duy trì & bổ sung năm 3 – theo Assessment Sample",
  status: "PUBLISHED",
  criteria: [
    {
      id: "c_tc_dat",
      name: "Số tín chỉ đạt",
      kind: "REQUIRED",
      valueType: "NUMBER_THRESHOLD",
      unit: "tín chỉ",
      evidenceRequired: true,
      evidenceGuide: "Bảng điểm năm học có xác nhận (PDF).",
      tieBreakOrder: null,
      refCriterionId: null,
      sortOrder: 1,
      levels: [
        { id: "l1", label: "Đạt", operator: "GTE", valueFrom: 38, points: 5 },
      ],
    },
    {
      id: "c_tc_rot",
      name: "Số tín chỉ không đạt",
      kind: "REQUIRED",
      valueType: "NUMBER_THRESHOLD",
      unit: "tín chỉ",
      evidenceRequired: false,
      evidenceGuide: "Dùng chung bảng điểm.",
      tieBreakOrder: null,
      sortOrder: 2,
      levels: [
        {
          id: "l1",
          label: "Không nợ môn",
          operator: "EQ",
          valueFrom: 0,
          points: 5,
        },
      ],
    },
    {
      id: "c_gpa",
      name: "GPA năm 2",
      kind: "REQUIRED",
      valueType: "NUMBER_THRESHOLD",
      unit: "/4.0",
      evidenceRequired: true,
      evidenceGuide: "Bảng điểm năm 2 (PDF).",
      tieBreakOrder: 1,
      sortOrder: 3,
      levels: [
        {
          id: "l1",
          label: "Giỏi",
          operator: "GTE",
          valueFrom: 3.2,
          points: 30,
        },
        {
          id: "l2",
          label: "Giỏi+",
          operator: "GTE",
          valueFrom: 3.4,
          points: 40,
        },
        {
          id: "l3",
          label: "Xuất sắc",
          operator: "GTE",
          valueFrom: 3.6,
          points: 50,
        },
      ],
    },
    {
      id: "c_rl",
      name: "Rèn luyện năm 2",
      kind: "REQUIRED",
      valueType: "NUMBER_THRESHOLD",
      unit: "điểm",
      evidenceRequired: true,
      evidenceGuide: "Phiếu điểm rèn luyện (PDF/ảnh).",
      tieBreakOrder: 3,
      sortOrder: 4,
      levels: [
        { id: "l1", label: "Tốt", operator: "GT", valueFrom: 80, points: 20 },
      ],
    },
    {
      id: "c_ta",
      name: "Tiếng Anh",
      kind: "REQUIRED",
      valueType: "NUMBER_THRESHOLD",
      unit: "TOEIC",
      evidenceRequired: true,
      evidenceGuide:
        "Chứng chỉ còn hạn; IELTS/khác quy đổi theo bảng của khoa.",
      tieBreakOrder: 2,
      sortOrder: 5,
      levels: [
        {
          id: "l1",
          label: "Chuẩn",
          operator: "GTE",
          valueFrom: 450,
          points: 20,
        },
      ],
    },
    {
      id: "c_nckh",
      name: "Thành tích NCKH",
      kind: "REQUIRED",
      valueType: "COUNT",
      countMode: "LEVEL",
      unit: "thành tích",
      evidenceRequired: true,
      evidenceGuide: "Mỗi thành tích 1 minh chứng (giấy chứng nhận/bài báo).",
      sortOrder: 6,
      levels: [
        {
          id: "l1",
          label: "Có ≥ 1 thành tích",
          operator: "GTE",
          valueFrom: 1,
          points: 20,
        },
      ],
    },
    {
      id: "c_ta_ut",
      name: "Tiếng Anh nâng cao",
      kind: "PRIORITY",
      valueType: "NUMBER_THRESHOLD",
      unit: "TOEIC",
      evidenceRequired: false,
      refCriterionId: "c_ta",
      sortOrder: 7,
      levels: [
        {
          id: "l1",
          label: "Nâng cao",
          operator: "GTE",
          valueFrom: 550,
          points: 20,
        },
      ],
    },
    {
      id: "c_contest",
      name: "Cuộc thi chuyên ngành",
      kind: "PRIORITY",
      valueType: "ACCUMULATIVE_ENUM",
      unit: "giải",
      evidenceRequired: true,
      evidenceGuide: "Giấy chứng nhận giải (PDF/ảnh) cho từng giải.",
      maxPoints: null,
      sortOrder: 8,
      levels: [
        { id: "g1", label: "Giải Nhất", points: 40 },
        { id: "g2", label: "Giải Nhì", points: 30 },
        { id: "g3", label: "Giải Ba", points: 20 },
        { id: "g4", label: "Giải Khuyến khích", points: 10 },
      ],
    },
  ],
};
export const now = "2026-11-09T09:00:00+07:00";
export function assessmentItems(overrides = {}) {
  const values = {
    c_tc_dat: 40,
    c_tc_rot: 0,
    c_gpa: 3.5,
    c_rl: 85,
    c_ta: 600,
    c_nckh: 1,
    ...overrides,
  };
  return assessment.criteria.map((c) => ({
    criterionId: c.id,
    declaredValue: values[c.id],
    declaredCount: values[c.id],
    declaredEntries:
      c.id === "c_contest"
        ? ["g1", "g3"].map((levelId, i) => ({
            id: `entry_${i}`,
            levelId,
            title: "Thành tích mẫu",
            evidence: [],
            verifyStatus: "VALID",
          }))
        : [],
    evidence: [],
    verifyStatus: "VALID",
    verifiedValue: null,
  }));
}
export function emptyDb() {
  return {
    counters: {},
    clock: { now },
    config: {
      reminders: { draftHoursBefore: [48, 24], approvalHoldDays: 3 },
      email: { failPattern: "fail", maxAttempts: 3 },
      templates: {},
    },
    faculties: [{ id: "f1" }, { id: "f2" }],
    majors: [
      { id: "m1", facultyId: "f1" },
      { id: "m2", facultyId: "f1" },
      { id: "m3", facultyId: "f2" },
    ],
    programs: [
      { id: "p1", majorId: "m1" },
      { id: "p2", majorId: "m2" },
      { id: "p3", majorId: "m3" },
    ],
    classes: [
      { id: "c1", programId: "p1", startYear: 2024 },
      { id: "c2", programId: "p2", startYear: 2024 },
      { id: "c3", programId: "p3", startYear: 2024 },
    ],
    users: [],
    userRoles: [],
    studentProfiles: [],
    lecturerProfiles: [],
    memberships: [],
    criteriaSets: [],
    rounds: [],
    applications: [],
    reviewRequests: [],
    admissionLists: [],
    approvalSteps: [],
    notifications: [],
    emailOutbox: [],
    auditLogs: [],
  };
}
export function testCtx(db, role, scopeId = null, extras = {}) {
  const scopeType = {
    ADMIN: "SCHOOL",
    TRAINING: "SCHOOL",
    DEAN: "FACULTY",
    HEAD: "MAJOR",
    LECTURER: "CLASS",
    STUDENT: "SELF",
  }[role];
  return {
    db,
    now,
    actor: {
      user: { id: "actor", status: "ACTIVE" },
      roleAssignment: {
        id: "role",
        userId: "actor",
        role,
        scopeType,
        scopeId,
        validFrom: "2020-01-01T00:00:00+07:00",
        validTo: null,
        revokedAt: null,
        ...extras,
      },
    },
  };
}
export function testRound(overrides = {}) {
  return {
    id: "r1",
    classId: "c1",
    name: "Đợt mẫu",
    code: "DXT-MAU",
    quota: 2,
    academicYear: "2026–2027",
    semester: "Học kỳ 1",
    criteriaSetId: assessment.id,
    criteriaSnapshot: structuredClone(assessment),
    rankingMode: "MAINTAIN_THEN_FILL",
    status: "review",
    intakeStart: "2026-10-01T00:00:00+07:00",
    intakeEnd: "2026-10-31T00:00:00+07:00",
    reviewStart: "2026-11-01T00:00:00+07:00",
    reviewEnd: "2026-11-20T00:00:00+07:00",
    ...overrides,
  };
}
export function testApplication(id = "a1", values = {}, extras = {}) {
  return {
    id,
    code: `HS-${id}`,
    studentUserId: `u_${id}`,
    studentCode: "00000000",
    applicantName: "Sinh viên mẫu",
    roundId: "r1",
    status: "approved",
    flow: "A",
    items: assessmentItems(values),
    history: [],
    ...extras,
  };
}

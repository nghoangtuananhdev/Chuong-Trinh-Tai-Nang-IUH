const assessment = {
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
export function seedCriteria(db) {
  const base = {
    description: "Bộ tiêu chí minh họa, chỉ dùng cho prototype",
    publishedBy: "usr_gv004",
    publishedAt: "2026-09-01T00:00:00+07:00",
    updatedAt: db.clock.now,
  };
  const sample = {
    c_tc_dat: 40,
    c_tc_rot: 0,
    c_gpa: 3.5,
    c_rl: 85,
    c_ta: 600,
    c_nckh: 1,
  };
  assessment.criteria.forEach((c) => {
    if (sample[c.id] != null) c.sampleValue = sample[c.id];
  });
  const cs2 = { ...base, ...structuredClone(assessment) };
  const entryCriteria = cs2.criteria
    .filter((c) => ["c_gpa", "c_ta", "c_ta_ut", "c_contest"].includes(c.id))
    .map((c) => ({
      ...c,
      name: c.id === "c_gpa" ? "GPA học kỳ gần nhất" : c.name,
    }));
  db.criteriaSets.push(
    {
      ...base,
      id: "cs_1",
      rootId: "cs_1",
      version: 1,
      facultyId: "fac_cntt",
      majorId: null,
      createdBy: "usr_gv004",
      name: "Xét tuyển đầu vào KSTN Khoa CNTT 2026",
      status: "PUBLISHED",
      criteria: structuredClone(entryCriteria),
    },
    cs2,
  );
  const cs3 = {
    ...structuredClone(cs2),
    id: "cs_3",
    rootId: "cs_3",
    version: 2,
    name: "Duy trì năm 2 KTPM",
    criteria: cs2.criteria
      .filter((c) => c.id !== "c_nckh")
      .map((c) => ({ ...c, name: c.name.replace("năm 2", "năm 1") })),
  };
  db.criteriaSets.push(
    { ...structuredClone(cs3), id: "cs_3_v1", version: 1, status: "ARCHIVED" },
    cs3,
    {
      ...structuredClone(cs2),
      id: "cs_4",
      rootId: "cs_4",
      name: "Bản nháp tiêu chí của ThS. Phạm Thị Dung",
      createdBy: "usr_gv001",
      status: "DRAFT",
      publishedAt: null,
      publishedBy: null,
    },
    {
      ...base,
      id: "cs_5",
      rootId: "cs_5",
      version: 1,
      facultyId: "fac_qtkd",
      majorId: null,
      createdBy: "usr_gv010",
      publishedBy: "usr_gv010",
      name: "Xét tuyển CNTN Khoa QTKD",
      status: "PUBLISHED",
      criteria: [
        ...structuredClone(
          entryCriteria.filter((c) => ["c_gpa", "c_ta"].includes(c.id)),
        ),
        {
          id: "c_hd",
          name: "Hoạt động ngoại khóa",
          kind: "PRIORITY",
          valueType: "COUNT",
          countMode: "PER_ITEM",
          maxPoints: 20,
          evidenceRequired: true,
          evidenceGuide: "Giấy chứng nhận tham gia từng hoạt động.",
          sortOrder: 3,
          levels: [
            {
              id: "hd1",
              label: "Tham gia hoạt động",
              operator: "GTE",
              valueFrom: 1,
              points: 5,
            },
          ],
        },
      ],
    },
  );
}

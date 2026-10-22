export const roles = {
  admin: {
    key: "admin",
    name: "Quản trị hệ thống",
    label: "Quản trị viên",
    initials: "QT",
    scope: "Phạm vi: Toàn trường",
    menus: [
      ["majors", "Quản lý chuyên ngành", "book"],
      ["classes", "Quản lý lớp", "class"],
      ["teachers", "Tài khoản giảng viên", "teacher"],
      ["students", "Tài khoản sinh viên", "users"],
      ["permissions", "Phân quyền giảng viên", "permission"],
      ["rounds", "Đợt xét tuyển", "calendar"]
    ]
  },
  training: {
    key: "training",
    name: "Nguyễn Minh Anh",
    label: "Đại diện Phòng Đào tạo",
    initials: "PĐT",
    scope: "Phạm vi: Toàn trường",
    menus: [
      ["majors", "Quản lý chuyên ngành", "book"],
      ["classesView", "Thông tin lớp toàn trường", "class"],
      ["teachers", "Tài khoản giảng viên", "teacher"],
      ["students", "Tài khoản sinh viên", "users"],
      ["permissions", "Phân quyền giảng viên", "permission"],
      ["roundsView", "Đợt xét tuyển", "calendar"],
      ["profiles", "Hồ sơ sinh viên", "folder"],
      ["finalApproval", "Duyệt danh sách trúng tuyển", "check"]
    ]
  },
  dean: {
    key: "dean",
    name: "PGS. TS. Lê Hoàng",
    label: "Ban lãnh đạo khoa",
    initials: "BLĐ",
    scope: "Phạm vi: Khoa Công nghệ Thông tin",
    menus: [
      ["majorsFaculty", "Chuyên ngành của khoa", "book"],
      ["classes", "Lớp CN/KSTN của khoa", "class"],
      ["teachers", "Tài khoản giảng viên khoa", "teacher"],
      ["permissions", "Phân quyền giảng viên", "permission"],
      ["rounds", "Đợt xét tuyển", "calendar"],
      ["criteria", "Bộ tiêu chí xét tuyển", "criteria"],
      ["profiles", "Hồ sơ sinh viên", "folder"],
      ["approvals", "Phê duyệt hồ sơ", "approve"],
      ["results", "Danh sách trúng tuyển", "award"]
    ]
  },
  head: {
    key: "head",
    name: "TS. Trần Ngọc Bình",
    label: "Chủ nhiệm ngành",
    initials: "CN",
    scope: "Phạm vi: Ngành Kỹ thuật phần mềm",
    menus: [
      ["teachers", "Tài khoản giảng viên ngành", "teacher"],
      ["permissions", "Phân quyền giảng viên", "permission"],
      ["rounds", "Đợt xét tuyển", "calendar"],
      ["criteria", "Bộ tiêu chí xét tuyển", "criteria"],
      ["classes", "Lớp CN/KSTN của ngành", "class"],
      ["profiles", "Hồ sơ sinh viên", "folder"],
      ["approvals", "Phê duyệt hồ sơ", "approve"],
      ["results", "Xác nhận danh sách trúng tuyển", "award"]
    ]
  },
  lecturer: {
    key: "lecturer",
    name: "ThS. Phạm Thị Dung",
    label: "Giảng viên phụ trách",
    initials: "GV",
    scope: "Phạm vi: Lớp KSTN-KTPM-K20",
    menus: [
      ["classes", "Lớp đang đảm nhận", "class"],
      ["rounds", "Đợt xét tuyển", "calendar"],
      ["criteria", "Bộ tiêu chí xét tuyển", "criteria"],
      ["profiles", "Hồ sơ sinh viên", "folder"],
      ["approvals", "Phê duyệt hồ sơ", "approve"],
      ["studentPasswords", "Đặt lại mật khẩu sinh viên", "key"]
    ]
  },
  student: {
    key: "student",
    name: "Nguyễn Hoàng Nam",
    label: "Sinh viên CN/KSTN",
    initials: "SV",
    scope: "Phạm vi: Hồ sơ cá nhân (21094501)",
    menus: [
      ["application", "Cập nhật hồ sơ xét tuyển duy trì", "file"]
    ]
  }
};

export const initialRounds = [
  {
    id: "DXT-2026-01",
    name: "Xét tuyển KSTN khóa 22",
    major: "Khoa Công nghệ Thông tin",
    time: "01/08 - 15/08/2026",
    status: "open",
    label: "Đang mở",
    desc: "Dành cho sinh viên năm nhất chưa từng tham gia lớp KSTN.",
    target: "Sinh viên năm nhất trúng tuyển chính quy",
    quota: 60,
    requirements: [
      "Điểm thi ĐGNL ĐHQG-HCM ≥ 750 hoặc điểm thi tốt nghiệp THPT theo tổ hợp ≥ 24.5",
      "GPA học kỳ gần nhất đạt từ 3.2 trở lên (nếu đã có kết quả)",
      "Chứng chỉ tiếng Anh quốc tế TOEIC ≥ 450 điểm hoặc IELTS ≥ 4.5",
      "Không bị kỷ luật từ mức khiển trách trở lên"
    ],
    documents: [
      "Đơn đăng ký xét tuyển chương trình Kỹ sư tài năng (mẫu trực tuyến)",
      "Bản sao bảng điểm hoặc giấy chứng nhận điểm thi hợp lệ (PDF)",
      "Bản sao chứng chỉ ngoại ngữ (PDF hoặc ảnh rõ nét)"
    ]
  },
  {
    id: "DXT-2026-02",
    name: "Duy trì KSTN năm 3",
    major: "Kỹ thuật phần mềm",
    time: "10/08 - 25/08/2026",
    status: "review",
    label: "Đang xét duyệt",
    desc: "Cập nhật hồ sơ duy trì dành cho sinh viên đang học lớp KSTN khóa 20.",
    target: "Sinh viên lớp KSTN-KTPM-K20 chuyển tiếp năm 3",
    quota: 30,
    requirements: [
      "Số tín chỉ tích lũy năm 2 đạt tối thiểu 38 tín chỉ",
      "Số tín chỉ không đạt / nợ môn: 0 tín chỉ",
      "Điểm trung bình tích lũy GPA năm 2 đạt ≥ 3.2",
      "Điểm rèn luyện trung bình năm 2 đạt > 80 điểm",
      "Chứng chỉ năng lực ngoại ngữ TOEIC đạt chuẩn giai đoạn (≥ 450)"
    ],
    documents: [
      "Bảng điểm kết quả học tập và rèn luyện năm 2 (PDF)",
      "Chứng chỉ năng lực tiếng Anh còn thời hạn (PDF)",
      "Minh chứng thành tích nghiên cứu khoa học hoặc cuộc thi chuyên ngành (nếu có)"
    ]
  },
  {
    id: "DXT-2025-03",
    name: "Xét tuyển bổ sung khóa 21",
    major: "Khoa Công nghệ Thông tin",
    time: "01/09 - 08/09/2025",
    status: "closed",
    label: "Đã kết thúc",
    desc: "Đợt tuyển bổ sung sinh viên có nguyện vọng và đạt thành tích xuất sắc khóa 21.",
    target: "Sinh viên khóa 21 thuộc Khoa CNTT",
    quota: 10,
    requirements: [
      "GPA năm nhất đạt từ 3.4 trở lên",
      "Điểm rèn luyện năm nhất đạt từ 85 trở lên"
    ],
    documents: [
      "Bảng điểm năm nhất",
      "Chứng chỉ ngoại ngữ"
    ]
  },
  {
    id: "DXT-2026-04",
    name: "Xét tuyển CNTN khóa 22",
    major: "Khoa Quản trị Kinh doanh",
    time: "01/09 - 20/09/2026",
    status: "upcoming",
    label: "Chưa mở",
    desc: "Dành cho tân sinh viên chương trình Cử nhân tài năng ngành Marketing và Quản trị kinh doanh.",
    target: "Tân sinh viên khóa 22 Khoa Quản trị Kinh doanh",
    quota: 30,
    requirements: [
      "Điểm chuẩn trúng tuyển thuộc top 10% ngành xét tuyển",
      "Chứng chỉ tiếng Anh quốc tế đạt chuẩn đầu vào"
    ],
    documents: [
      "Hồ sơ đăng ký chương trình CNTN",
      "Minh chứng học tập THPT và ngoại ngữ"
    ]
  }
];

export const publicRounds = initialRounds;

const sampleMajorClasses = {
  "Công nghệ kỹ thuật điện, điện tử": [
    { code: "KSTN-K20-DĐT", cohort: "Khóa 20", academicYear: "2023 - 2024", status: "Đang hoạt động" },
    { code: "KSTN-K21-DĐT", cohort: "Khóa 21", academicYear: "2024 - 2025", status: "Đang hoạt động" }
  ],
  "Công nghệ kỹ thuật cơ điện tử": [
    { code: "KSTN-K21-CĐT", cohort: "Khóa 21", academicYear: "2024 - 2025", status: "Đang hoạt động" }
  ],
  "Kỹ thuật phần mềm": [
    { code: "KSTN-K20-KTPM", cohort: "Khóa 20", academicYear: "2023 - 2024", status: "Đang hoạt động" },
    { code: "KSTN-K21-KTPM", cohort: "Khóa 21", academicYear: "2024 - 2025", status: "Đang hoạt động" },
    { code: "KSTN-K22-KTPM", cohort: "Khóa 22", academicYear: "2025 - 2026", status: "Đang tuyển sinh" }
  ],
  "Hệ thống thông tin": [
    { code: "KSTN-K20-HTTT", cohort: "Khóa 20", academicYear: "2023 - 2024", status: "Đang hoạt động" },
    { code: "KSTN-K21-HTTT", cohort: "Khóa 21", academicYear: "2024 - 2025", status: "Đang hoạt động" }
  ],
  "Quản trị kinh doanh": [
    { code: "CNTN-K20-QTKD", cohort: "Khóa 20", academicYear: "2023 - 2024", status: "Đang hoạt động" },
    { code: "CNTN-K21-QTKD", cohort: "Khóa 21", academicYear: "2024 - 2025", status: "Đang hoạt động" }
  ],
  "Marketing": [
    { code: "CNTN-K20-MKT", cohort: "Khóa 20", academicYear: "2023 - 2024", status: "Đang hoạt động" },
    { code: "CNTN-K21-MKT", cohort: "Khóa 21", academicYear: "2024 - 2025", status: "Đang hoạt động" },
    { code: "CNTN-K22-MKT", cohort: "Khóa 22", academicYear: "2025 - 2026", status: "Đang tuyển sinh" }
  ],
  "Quản trị khách sạn": [
    { code: "CNTN-K21-QTKS", cohort: "Khóa 21", academicYear: "2024 - 2025", status: "Đang hoạt động" }
  ]
};

export const schoolMajorCatalog = [
  ["Khoa Công nghệ Điện", ["Công nghệ kỹ thuật điện, điện tử", "Năng lượng tái tạo", "Điện hạt nhân", "Công nghệ kỹ thuật điều khiển và tự động hóa", "Robot và hệ thống điều khiển thông minh"]],
  ["Khoa Công nghệ Điện tử", ["Điện tử công nghiệp", "Kỹ thuật viễn thông", "IoT và Trí tuệ nhân tạo ứng dụng", "Kỹ thuật Radar - Dẫn đường", "Công nghệ kỹ thuật máy tính", "Kỹ thuật thiết kế vi mạch"]],
  ["Khoa Công nghệ Cơ khí", ["Công nghệ kỹ thuật cơ khí", "Công nghệ kỹ thuật cơ điện tử", "Công nghệ chế tạo máy", "Công nghệ kỹ thuật ô tô", "Công nghệ kỹ thuật ô tô điện", "Công nghệ kỹ thuật nhiệt", "Công nghệ kỹ thuật năng lượng", "Quản lý năng lượng"]],
  ["Khoa Kỹ thuật Xây dựng", ["Kỹ thuật xây dựng", "Xây dựng cầu đường", "Kỹ thuật công trình đường sắt", "Quản lý xây dựng"]],
  ["Khoa Công nghệ May - Thời trang", ["Công nghệ dệt, may", "Thiết kế thời trang"]],
  ["Khoa Công nghệ Thông tin", ["Công nghệ thông tin", "Kỹ thuật phần mềm", "Khoa học máy tính", "Hệ thống thông tin", "Khoa học dữ liệu", "Trí tuệ nhân tạo"]],
  ["Khoa Công nghệ Hóa học", ["Công nghệ kỹ thuật hóa học", "Kỹ thuật hóa phân tích", "Hóa dược"]],
  ["Khoa Dược", ["Dược học"]],
  ["Viện Công nghệ Sinh học và Thực phẩm", ["Công nghệ thực phẩm", "Đảm bảo chất lượng và An toàn thực phẩm", "Dinh dưỡng và Khoa học thực phẩm", "Công nghệ sinh học"]],
  ["Khoa Quản lý Đất đai", ["Quản lý đất đai", "Kinh tế tài nguyên thiên nhiên"]],
  ["Viện Khoa học Công nghệ và Quản lý Môi trường", ["Quản lý tài nguyên và môi trường", "Công nghệ kỹ thuật môi trường"]],
  ["Khoa Kế toán - Kiểm toán", ["Kế toán", "Kiểm toán", "Kế toán tích hợp chứng chỉ quốc tế ACCA", "Kiểm toán tích hợp chứng chỉ quốc tế CFAB"]],
  ["Khoa Tài chính - Ngân hàng", ["Tài chính", "Ngân hàng", "Công nghệ tài chính"]],
  ["Khoa Quản trị Kinh doanh", ["Quản trị kinh doanh", "Quản trị nguồn nhân lực", "Marketing", "Digital Marketing"]],
  ["Khoa Thương mại - Du lịch", ["Logistics và Quản lý chuỗi cung ứng", "Quản trị dịch vụ du lịch và lữ hành", "Quản trị khách sạn", "Quản trị nhà hàng và dịch vụ ăn uống", "Kinh doanh quốc tế", "Thương mại điện tử"]],
  ["Khoa Ngoại ngữ", ["Ngôn ngữ Anh", "Ngôn ngữ Trung Quốc"]],
  ["Khoa Luật", ["Luật kinh tế"]]
];

export function createInitialMajors() {
  let id = 1;
  return schoolMajorCatalog.flatMap(([faculty, majors]) =>
    majors.map(name => ({
      id: id++,
      faculty,
      name,
      classes: (sampleMajorClasses[name] || []).map(item => ({ ...item }))
    }))
  );
}

const classStudents = {
  software20: [
    { id: "21094501", name: "Nguyễn Hoàng Nam", email: "nam.21094501@iuh.edu.vn", status: "Đang học" },
    { id: "21094518", name: "Trần Minh Khoa", email: "khoa.21094518@iuh.edu.vn", status: "Đang học" },
    { id: "21094602", name: "Võ Gia Bảo", email: "bao.21094602@iuh.edu.vn", status: "Đang học" }
  ],
  information21: [
    { id: "22073102", name: "Lê Khánh An", email: "an.22073102@iuh.edu.vn", status: "Đang học" },
    { id: "22073210", name: "Phạm Gia Hân", email: "han.22073210@iuh.edu.vn", status: "Đang học" }
  ],
  marketing20: [
    { id: "21081207", name: "Đỗ Minh Thư", email: "thu.21081207@iuh.edu.vn", status: "Đang học" },
    { id: "21081314", name: "Ngô Hoàng Phúc", email: "phuc.21081314@iuh.edu.vn", status: "Đang học" }
  ]
};

export function createInitialClasses() {
  return [
    { id: 1, className: "KSTN-KTPM-K20", major: "Kỹ thuật phần mềm", cohort: "20", lecturer: "ThS. Phạm Thị Dung", current: 20, capacity: 30, status: "Đang hoạt động", admissionRound: { code: "DXT-2023-01", name: "Xét tuyển KSTN khóa 20", opened: true }, students: classStudents.software20 },
    { id: 2, className: "KSTN-HTTT-K21", major: "Hệ thống thông tin", cohort: "21", lecturer: "TS. Nguyễn Văn Hải", current: 15, capacity: 20, status: "Đang hoạt động", admissionRound: { code: "DXT-2024-02", name: "Xét tuyển KSTN khóa 21", opened: true }, students: classStudents.information21 },
    { id: 3, className: "KSTN-KHDL-K22", major: "Khoa học dữ liệu", cohort: "22", lecturer: "ThS. Lê Minh Tâm", current: 0, capacity: 30, status: "Đang tuyển sinh", admissionRound: { code: "DXT-2026-01", name: "Xét tuyển KSTN khóa 22", opened: true }, students: [] },
    { id: 4, className: "KSTN-CNTT-K20", major: "Công nghệ thông tin", cohort: "20", lecturer: "TS. Trần Ngọc Bình", current: 28, capacity: 35, status: "Đang hoạt động", admissionRound: { code: "DXT-2023-03", name: "Xét tuyển KSTN khóa 20", opened: true }, students: [] },
    { id: 5, className: "KSTN-ĐĐT-K20", major: "Công nghệ kỹ thuật điện, điện tử", cohort: "20", lecturer: "ThS. Nguyễn Quốc Bảo", current: 22, capacity: 30, status: "Đang hoạt động", admissionRound: { code: "DXT-2023-04", name: "Xét tuyển KSTN khóa 20", opened: true }, students: [] },
    { id: 6, className: "KSTN-CĐT-K21", major: "Công nghệ kỹ thuật cơ điện tử", cohort: "21", lecturer: "TS. Lê Thanh Tùng", current: 18, capacity: 25, status: "Đang hoạt động", admissionRound: { code: "DXT-2024-05", name: "Xét tuyển KSTN khóa 21", opened: true }, students: [] },
    { id: 7, className: "CNTN-QTKD-K20", major: "Quản trị kinh doanh", cohort: "20", lecturer: "ThS. Trần Mỹ Linh", current: 25, capacity: 30, status: "Đang hoạt động", admissionRound: { code: "DXT-2023-06", name: "Xét tuyển CNTN khóa 20", opened: true }, students: [] },
    { id: 8, className: "CNTN-MKT-K20", major: "Marketing", cohort: "20", lecturer: "TS. Hoàng Minh Châu", current: 20, capacity: 25, status: "Đang hoạt động", admissionRound: { code: "DXT-2023-07", name: "Xét tuyển CNTN khóa 20", opened: true }, students: classStudents.marketing20 },
    { id: 9, className: "CNTN-MKT-K22", major: "Marketing", cohort: "22", lecturer: "ThS. Đặng Thu Hà", current: 0, capacity: 25, status: "Chưa mở", admissionRound: { code: "DXT-2026-04", name: "Xét tuyển CNTN khóa 22", opened: false }, students: [] },
    { id: 10, className: "CNTN-QTKS-K21", major: "Quản trị khách sạn", cohort: "21", lecturer: "ThS. Nguyễn Hải Yến", current: 16, capacity: 20, status: "Đang hoạt động", admissionRound: { code: "DXT-2024-08", name: "Xét tuyển CNTN khóa 21", opened: true }, students: [] },
    { id: 11, className: "CNTN-LOG-K22", major: "Logistics và Quản lý chuỗi cung ứng", cohort: "22", lecturer: "TS. Phan Anh Khoa", current: 0, capacity: 30, status: "Chưa mở", admissionRound: null, students: [] },
    { id: 12, className: "KSTN-VIM-K22", major: "Kỹ thuật thiết kế vi mạch", cohort: "22", lecturer: "TS. Bùi Quốc Huy", current: 0, capacity: 25, status: "Chưa mở", admissionRound: null, students: [] },
    { id: 13, className: "KSTN-AI-K23", major: "Trí tuệ nhân tạo", cohort: "23", lecturer: "ThS. Nguyễn Tường Vy", current: 0, capacity: 30, status: "Chưa mở", admissionRound: null, students: [] }
  ].map(item => ({
    ...item,
    students: item.students.map(student => ({ ...student })),
    admissionRound: item.admissionRound ? { ...item.admissionRound } : null
  }));
}

export const permissionActorRoles = [
  "Quản trị viên",
  "Đại diện phòng đào tạo",
  "Ban lãnh đạo khoa",
  "Chủ nhiệm ngành",
  "Giảng viên phụ trách"
];

export function createInitialPermissions() {
  return [
    { id: 1, name: "Quản trị hệ thống", role: "Quản trị viên", scope: "Toàn hệ thống" },
    { id: 2, name: "Nguyễn Minh Anh", role: "Đại diện phòng đào tạo", scope: "Toàn trường" },
    { id: 3, name: "PGS. TS. Lê Hoàng", role: "Ban lãnh đạo khoa", scope: "Khoa CNTT" },
    { id: 4, name: "TS. Trần Ngọc Bình", role: "Chủ nhiệm ngành", scope: "Ngành Kỹ thuật phần mềm" },
    { id: 5, name: "ThS. Phạm Thị Dung", role: "Giảng viên phụ trách", scope: "Lớp KSTN-KTPM-K20" },
    { id: 6, name: "TS. Nguyễn Văn Hải", role: "Chủ nhiệm ngành", scope: "Ngành Hệ thống thông tin" },
    { id: 7, name: "ThS. Lê Minh Tâm", role: "Giảng viên phụ trách", scope: "Lớp KSTN-KHDL-K22" },
    { id: 8, name: "ThS. Nguyễn Quốc Bảo", role: "Giảng viên phụ trách", scope: "Lớp KSTN-ĐĐT-K20" },
    { id: 9, name: "TS. Lê Thanh Tùng", role: "Ban lãnh đạo khoa", scope: "Khoa Cơ khí" },
    { id: 10, name: "ThS. Trần Mỹ Linh", role: "Giảng viên phụ trách", scope: "Lớp CNTN-QTKD-K20" },
    { id: 11, name: "TS. Hoàng Minh Châu", role: "Chủ nhiệm ngành", scope: "Ngành Marketing" },
    { id: 12, name: "ThS. Đặng Thu Hà", role: "Giảng viên phụ trách", scope: "Lớp CNTN-MKT-K22" }
  ];
}

export const initialTeachers = [
  { id: "GV001", name: "ThS. Phạm Thị Dung", email: "ptdung@iuh.edu.vn", role: "Giảng viên phụ trách", department: "Khoa Công nghệ Thông tin", status: "Hoạt động" },
  { id: "GV002", name: "TS. Nguyễn Văn Hải", email: "nvhai@iuh.edu.vn", role: "Chủ nhiệm ngành", department: "Khoa Công nghệ Thông tin", status: "Hoạt động" },
  { id: "GV003", name: "ThS. Lê Minh Tâm", email: "lmtam@iuh.edu.vn", role: "Giảng viên", department: "Khoa Công nghệ Thông tin", status: "Hoạt động" },
  { id: "GV004", name: "PGS. TS. Lê Hoàng", email: "lehoang@iuh.edu.vn", role: "Ban lãnh đạo khoa", department: "Khoa Công nghệ Thông tin", status: "Hoạt động" },
  { id: "GV005", name: "TS. Trần Ngọc Bình", email: "tnbinh@iuh.edu.vn", role: "Chủ nhiệm ngành", department: "Khoa Công nghệ Thông tin", status: "Hoạt động" }
];

export const initialStudents = [
  { id: "21094501", name: "Nguyễn Hoàng Nam", className: "KSTN-KTPM-K20", gmail: "nam.21094501@iuh.edu.vn", status: "Hoạt động" },
  { id: "21094518", name: "Trần Minh Khoa", className: "KSTN-KTPM-K20", gmail: "khoa.21094518@iuh.edu.vn", status: "Hoạt động" },
  { id: "22073102", name: "Lê Khánh An", className: "KSTN-HTTT-K21", gmail: "an.22073102@iuh.edu.vn", status: "Chờ duyệt" },
  { id: "22073210", name: "Phạm Gia Hân", className: "KSTN-HTTT-K21", gmail: "han.22073210@iuh.edu.vn", status: "Hoạt động" },
  { id: "21081207", name: "Đỗ Minh Thư", className: "CNTN-MKT-K20", gmail: "thu.21081207@iuh.edu.vn", status: "Hoạt động" },
  { id: "21081314", name: "Ngô Hoàng Phúc", className: "CNTN-MKT-K20", gmail: "phuc.21081314@iuh.edu.vn", status: "Hoạt động" },
  { id: "21094602", name: "Võ Gia Bảo", className: "KSTN-KTPM-K20", gmail: "bao.21094602@iuh.edu.vn", status: "Hoạt động" }
];

export const criteriaRows = [
  ["Bắt buộc", "Số tín chỉ đạt", "≥ 38 tín chỉ", "5", "1"],
  ["Bắt buộc", "Số tín chỉ không đạt / nợ môn", "0 tín chỉ", "5", "2"],
  ["Bắt buộc", "GPA năm 2", "≥ 3.6 / ≥ 3.4 / ≥ 3.2", "50 / 40 / 30", "3"],
  ["Bắt buộc", "Điểm rèn luyện trung bình năm 2", "> 80 điểm", "20", "4"],
  ["Bắt buộc", "Năng lực ngoại ngữ (TOEIC)", "≥ 450 điểm", "20", "5"],
  ["Bắt buộc", "Thành tích nghiên cứu khoa học", "Tối thiểu 1 thành tích", "20", "6"],
  ["Ưu tiên", "Ngoại ngữ nâng cao (TOEIC)", "≥ 550 điểm", "20", "7"],
  ["Ưu tiên", "Cuộc thi chuyên ngành", "Nhất / Nhì / Ba / KK", "40 / 30 / 20 / 10", "8"]
];

export const initialApplications = [
  {
    id: "HS-2026-001",
    studentId: "21094501",
    studentName: "Nguyễn Hoàng Nam",
    studentClass: "KSTN-KTPM-K20",
    major: "Kỹ thuật phần mềm",
    roundCode: "DXT-2026-02",
    roundName: "Duy trì KSTN năm 3",
    type: "Duy trì năm 3",
    gpa: 3.54,
    creditsEarned: 42,
    creditsFailed: 0,
    trainingScore: 92,
    toeicScore: 610,
    achievement: "Giải Ba NCKH cấp Trường",
    documents: [
      { name: "bang-diem-nam-2.pdf", size: "1.2 MB" },
      { name: "chung-chi-toeic-610.pdf", size: "850 KB" },
      { name: "chung-nhan-nckh.pdf", size: "640 KB" }
    ],
    totalScore: "92 điểm",
    status: "approved",
    submittedAt: "12/08/2026 14:30",
    reviewLevel: "Đã duyệt cấp Khoa",
    reviewerNote: "Hồ sơ đầy đủ, thành tích học tập và rèn luyện xuất sắc.",
    history: [
      { date: "12/08/2026 14:30", actor: "Nguyễn Hoàng Nam", role: "Sinh viên", action: "Nộp hồ sơ duy trì", note: "Hồ sơ nộp đúng hạn." },
      { date: "16/08/2026 09:15", actor: "ThS. Phạm Thị Dung", role: "Giảng viên phụ trách", action: "Duyệt hồ sơ cấp 1", note: "Điểm và minh chứng hợp lệ, chuyển Ban lãnh đạo khoa." },
      { date: "18/08/2026 15:40", actor: "PGS. TS. Lê Hoàng", role: "Ban lãnh đạo khoa", action: "Phê duyệt khoa", note: "Đủ điều kiện duy trì học tập lớp KSTN khóa 20." }
    ]
  },
  {
    id: "HS-2026-002",
    studentId: "21094518",
    studentName: "Trần Minh Khoa",
    studentClass: "KSTN-KTPM-K20",
    major: "Kỹ thuật phần mềm",
    roundCode: "DXT-2026-02",
    roundName: "Duy trì KSTN năm 3",
    type: "Duy trì năm 3",
    gpa: 3.42,
    creditsEarned: 40,
    creditsFailed: 0,
    trainingScore: 86,
    toeicScore: 520,
    achievement: "Không có",
    documents: [
      { name: "bang-diem-nam2-khoa.pdf", size: "1.1 MB" },
      { name: "chung-chi-toeic-520.pdf", size: "900 KB" }
    ],
    totalScore: "86 điểm",
    status: "pending",
    submittedAt: "14/08/2026 10:20",
    reviewLevel: "Chờ GV phụ trách duyệt",
    reviewerNote: "",
    history: [
      { date: "14/08/2026 10:20", actor: "Trần Minh Khoa", role: "Sinh viên", action: "Nộp hồ sơ duy trì", note: "Chờ thẩm định." }
    ]
  },
  {
    id: "HS-2026-003",
    studentId: "22073102",
    studentName: "Lê Khánh An",
    studentClass: "CLC-K21",
    major: "Hệ thống thông tin",
    roundCode: "DXT-2026-01",
    roundName: "Xét tuyển KSTN khóa 22",
    type: "Xét tuyển mới",
    gpa: 3.65,
    creditsEarned: 38,
    creditsFailed: 0,
    trainingScore: 88,
    toeicScore: 580,
    achievement: "Giải Nhì Olympic Tin học",
    documents: [
      { name: "bang-diem-hoc-ky-an.pdf", size: "1.4 MB" },
      { name: "chung-chi-toeic-an.pdf", size: "780 KB" }
    ],
    totalScore: "88 điểm",
    status: "pending",
    submittedAt: "05/08/2026 09:00",
    reviewLevel: "Chờ duyệt cấp Ngành",
    reviewerNote: "",
    history: [
      { date: "05/08/2026 09:00", actor: "Lê Khánh An", role: "Sinh viên", action: "Nộp hồ sơ xét tuyển mới", note: "Nộp hồ sơ xét tuyển vào lớp KSTN." }
    ]
  },
  {
    id: "HS-2026-004",
    studentId: "22073210",
    studentName: "Phạm Gia Hân",
    studentClass: "CLC-K21",
    major: "Hệ thống thông tin",
    roundCode: "DXT-2026-01",
    roundName: "Xét tuyển KSTN khóa 22",
    type: "Xét tuyển mới",
    gpa: 3.15,
    creditsEarned: 35,
    creditsFailed: 0,
    trainingScore: 74,
    toeicScore: 420,
    achievement: "Không có",
    documents: [
      { name: "bang-diem-han.pdf", size: "950 KB" }
    ],
    totalScore: "74 điểm",
    status: "needs_update",
    submittedAt: "06/08/2026 16:45",
    reviewLevel: "Cần bổ sung",
    reviewerNote: "Chứng chỉ TOEIC đạt 420 điểm (chưa đạt ngưỡng tối thiểu 450). Đề nghị nộp bản cam kết bổ sung chứng chỉ ngoại ngữ trước ngày 20/08/2026.",
    history: [
      { date: "06/08/2026 16:45", actor: "Phạm Gia Hân", role: "Sinh viên", action: "Nộp hồ sơ xét tuyển mới", note: "Nộp hồ sơ." },
      { date: "08/08/2026 11:20", actor: "TS. Nguyễn Văn Hải", role: "Chủ nhiệm ngành", action: "Yêu cầu bổ sung", note: "Chứng chỉ TOEIC đạt 420 điểm (chưa đạt ngưỡng tối thiểu 450). Đề nghị nộp bản cam kết bổ sung chứng chỉ ngoại ngữ trước ngày 20/08/2026." }
    ]
  }
];

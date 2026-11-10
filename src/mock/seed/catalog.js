export const schoolMajorCatalog = [
  [
    "Khoa Công nghệ Điện",
    [
      "Công nghệ kỹ thuật điện, điện tử",
      "Năng lượng tái tạo",
      "Điện hạt nhân",
      "Công nghệ kỹ thuật điều khiển và tự động hóa",
      "Robot và hệ thống điều khiển thông minh",
    ],
  ],
  [
    "Khoa Công nghệ Điện tử",
    [
      "Điện tử công nghiệp",
      "Kỹ thuật viễn thông",
      "IoT và Trí tuệ nhân tạo ứng dụng",
      "Kỹ thuật Radar - Dẫn đường",
      "Công nghệ kỹ thuật máy tính",
      "Kỹ thuật thiết kế vi mạch",
    ],
  ],
  [
    "Khoa Công nghệ Cơ khí",
    [
      "Công nghệ kỹ thuật cơ khí",
      "Công nghệ kỹ thuật cơ điện tử",
      "Công nghệ chế tạo máy",
      "Công nghệ kỹ thuật ô tô",
      "Công nghệ kỹ thuật ô tô điện",
      "Công nghệ kỹ thuật nhiệt",
      "Công nghệ kỹ thuật năng lượng",
      "Quản lý năng lượng",
    ],
  ],
  [
    "Khoa Kỹ thuật Xây dựng",
    [
      "Kỹ thuật xây dựng",
      "Xây dựng cầu đường",
      "Kỹ thuật công trình đường sắt",
      "Quản lý xây dựng",
    ],
  ],
  [
    "Khoa Công nghệ May - Thời trang",
    ["Công nghệ dệt, may", "Thiết kế thời trang"],
  ],
  [
    "Khoa Công nghệ Thông tin",
    [
      "Công nghệ thông tin",
      "Kỹ thuật phần mềm",
      "Khoa học máy tính",
      "Hệ thống thông tin",
      "Khoa học dữ liệu",
      "Trí tuệ nhân tạo",
    ],
  ],
  [
    "Khoa Công nghệ Hóa học",
    ["Công nghệ kỹ thuật hóa học", "Kỹ thuật hóa phân tích", "Hóa dược"],
  ],
  ["Khoa Dược", ["Dược học"]],
  [
    "Viện Công nghệ Sinh học và Thực phẩm",
    [
      "Công nghệ thực phẩm",
      "Đảm bảo chất lượng và An toàn thực phẩm",
      "Dinh dưỡng và Khoa học thực phẩm",
      "Công nghệ sinh học",
    ],
  ],
  [
    "Khoa Quản lý Đất đai",
    ["Quản lý đất đai", "Kinh tế tài nguyên thiên nhiên"],
  ],
  [
    "Viện Khoa học Công nghệ và Quản lý Môi trường",
    ["Quản lý tài nguyên và môi trường", "Công nghệ kỹ thuật môi trường"],
  ],
  [
    "Khoa Kế toán - Kiểm toán",
    [
      "Kế toán",
      "Kiểm toán",
      "Kế toán tích hợp chứng chỉ quốc tế ACCA",
      "Kiểm toán tích hợp chứng chỉ quốc tế CFAB",
    ],
  ],
  [
    "Khoa Tài chính - Ngân hàng",
    ["Tài chính", "Ngân hàng", "Công nghệ tài chính"],
  ],
  [
    "Khoa Quản trị Kinh doanh",
    [
      "Quản trị kinh doanh",
      "Quản trị nguồn nhân lực",
      "Marketing",
      "Digital Marketing",
    ],
  ],
  [
    "Khoa Thương mại - Du lịch",
    [
      "Logistics và Quản lý chuỗi cung ứng",
      "Quản trị dịch vụ du lịch và lữ hành",
      "Quản trị khách sạn",
      "Quản trị nhà hàng và dịch vụ ăn uống",
      "Kinh doanh quốc tế",
      "Thương mại điện tử",
    ],
  ],
  ["Khoa Ngoại ngữ", ["Ngôn ngữ Anh", "Ngôn ngữ Trung Quốc"]],
  ["Khoa Luật", ["Luật kinh tế"]],
];

export function seedCatalog(db) {
  const knownFaculties = {
    "Khoa Công nghệ Thông tin": "cntt",
    "Khoa Quản trị Kinh doanh": "qtkd",
  };
  const knownMajors = {
    "Kỹ thuật phần mềm": "ktpm",
    "Hệ thống thông tin": "httt",
    "Khoa học dữ liệu": "khdl",
    Marketing: "mkt",
  };
  schoolMajorCatalog.forEach(([name, majors], fi) => {
    const id = `fac_${knownFaculties[name] ?? fi}`;
    db.faculties.push({
      id,
      code: (knownFaculties[name] ?? `K${fi}`).toUpperCase(),
      name,
      status: "ACTIVE",
    });
    majors.forEach((name, mi) =>
      db.majors.push({
        id: `maj_${knownMajors[name] ?? `${fi}_${mi}`}`,
        facultyId: id,
        code: (knownMajors[name] ?? `N${fi}_${mi}`).toUpperCase(),
        name,
      }),
    );
  });
  for (const [suffix, majorId, type] of [
    ["ktpm", "maj_ktpm", "KSTN"],
    ["httt", "maj_httt", "KSTN"],
    ["khdl", "maj_khdl", "KSTN"],
    ["mkt", "maj_mkt", "CNTN"],
  ]) {
    db.programs.push({
      id: `prg_${suffix}`,
      majorId,
      type,
      name: `${type}-${suffix.toUpperCase()}`,
      status: "ACTIVE",
    });
  }
  for (const [suffix, cohort, lecturer] of [
    ["ktpm", 20, "001"],
    ["ktpm", 21, "003"],
    ["ktpm", 22, "005"],
    ["httt", 21, "006"],
    ["khdl", 22, "005"],
    ["mkt", 20, "008"],
    ["mkt", 22, "009"],
  ]) {
    const program = db.programs.find((p) => p.id === `prg_${suffix}`);
    db.classes.push({
      id: `cls_${suffix}_${cohort}`,
      programId: program.id,
      code: `${program.type}-${suffix.toUpperCase()}-K${cohort}`,
      cohort: `K${cohort}`,
      startYear: 2004 + cohort,
      lecturerId: `usr_gv${lecturer}`,
      description: "Lớp chương trình tài năng – dữ liệu minh họa",
      endedAt: null,
    });
  }
}

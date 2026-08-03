export const roles = {
  admin: {
    name: "Quản trị hệ thống", label: "Quản trị viên", initials: "QT",
    menus: [["majors","Quản lý chuyên ngành","book"],["classes","Quản lý lớp","class"],["teachers","Tài khoản giảng viên","teacher"],["students","Tài khoản sinh viên","users"],["permissions","Phân quyền giảng viên","permission"],["rounds","Đợt xét tuyển toàn trường","calendar"]]
  },
  training: {
    name: "Nguyễn Minh Anh", label: "Đại diện Phòng Đào tạo", initials: "PĐT",
    menus: [["majors","Quản lý chuyên ngành","book"],["classesView","Thông tin lớp toàn trường","class"],["teachers","Tài khoản giảng viên","teacher"],["students","Tài khoản sinh viên","users"],["permissions","Phân quyền giảng viên","permission"],["roundsView","Thông tin đợt xét tuyển","calendar"],["profiles","Hồ sơ sinh viên","folder"],["finalApproval","Duyệt danh sách trúng tuyển","check"]]
  },
  dean: {
    name: "PGS. TS. Lê Hoàng", label: "Ban lãnh đạo khoa", initials: "BLĐ",
    menus: [["majorsFaculty","Chuyên ngành của khoa","book"],["classes","Lớp CN/KSTN của khoa","class"],["teachers","Tài khoản giảng viên khoa","teacher"],["permissions","Phân quyền giảng viên","permission"],["rounds","Đợt xét tuyển của khoa","calendar"],["criteria","Bộ tiêu chí xét tuyển","criteria"],["profiles","Hồ sơ sinh viên","folder"],["approvals","Phê duyệt hồ sơ","approve"],["results","Danh sách trúng tuyển","award"]]
  },
  head: {
    name: "TS. Trần Ngọc Bình", label: "Chủ nhiệm ngành", initials: "CN",
    menus: [["teachers","Tài khoản giảng viên ngành","teacher"],["permissions","Phân quyền giảng viên","permission"],["rounds","Đợt xét tuyển của ngành","calendar"],["criteria","Bộ tiêu chí xét tuyển","criteria"],["classes","Lớp CN/KSTN của ngành","class"],["profiles","Hồ sơ sinh viên","folder"],["approvals","Phê duyệt hồ sơ","approve"],["results","Xác nhận danh sách trúng tuyển","award"]]
  },
  lecturer: {
    name: "ThS. Phạm Thị Dung", label: "Giảng viên phụ trách", initials: "GV",
    menus: [["classes","Lớp đang đảm nhận","class"],["rounds","Đợt xét tuyển của lớp","calendar"],["criteria","Bộ tiêu chí xét tuyển","criteria"],["profiles","Hồ sơ sinh viên","folder"],["approvals","Phê duyệt hồ sơ","approve"],["studentPasswords","Đặt lại mật khẩu sinh viên","key"]]
  },
  student: {
    name: "Nguyễn Hoàng Nam", label: "Sinh viên CN/KSTN", initials: "SV",
    menus: [["application","Cập nhật hồ sơ xét tuyển duy trì","file"]]
  }
};

export const publicRounds = [
  {id:"DXT-2026-01",name:"Xét tuyển KSTN khóa 22",major:"Khoa Công nghệ Thông tin",time:"01/08 - 15/08/2026",status:"open",label:"Đang mở",desc:"Dành cho sinh viên năm nhất chưa từng tham gia lớp KSTN."},
  {id:"DXT-2026-02",name:"Duy trì KSTN năm 3",major:"Kỹ thuật phần mềm",time:"10/08 - 25/08/2026",status:"review",label:"Đang xét duyệt",desc:"Cập nhật hồ sơ duy trì dành cho sinh viên đang học lớp KSTN."}
];

const sampleMajorClasses = {
  "Công nghệ kỹ thuật điện, điện tử": [
    {code:"KSTN-K20-DĐT",cohort:"Khóa 20",academicYear:"2023 - 2024",status:"Đang hoạt động"},
    {code:"KSTN-K21-DĐT",cohort:"Khóa 21",academicYear:"2024 - 2025",status:"Đang hoạt động"}
  ],
  "Công nghệ kỹ thuật cơ điện tử": [{code:"KSTN-K21-CĐT",cohort:"Khóa 21",academicYear:"2024 - 2025",status:"Đang hoạt động"}],
  "Kỹ thuật phần mềm": [
    {code:"KSTN-K20-KTPM",cohort:"Khóa 20",academicYear:"2023 - 2024",status:"Đang hoạt động"},
    {code:"KSTN-K21-KTPM",cohort:"Khóa 21",academicYear:"2024 - 2025",status:"Đang hoạt động"},
    {code:"KSTN-K22-KTPM",cohort:"Khóa 22",academicYear:"2025 - 2026",status:"Đang tuyển sinh"}
  ],
  "Hệ thống thông tin": [
    {code:"KSTN-K20-HTTT",cohort:"Khóa 20",academicYear:"2023 - 2024",status:"Đang hoạt động"},
    {code:"KSTN-K21-HTTT",cohort:"Khóa 21",academicYear:"2024 - 2025",status:"Đang hoạt động"}
  ],
  "Quản trị kinh doanh": [
    {code:"CNTN-K20-QTKD",cohort:"Khóa 20",academicYear:"2023 - 2024",status:"Đang hoạt động"},
    {code:"CNTN-K21-QTKD",cohort:"Khóa 21",academicYear:"2024 - 2025",status:"Đang hoạt động"}
  ],
  "Marketing": [
    {code:"CNTN-K20-MKT",cohort:"Khóa 20",academicYear:"2023 - 2024",status:"Đang hoạt động"},
    {code:"CNTN-K21-MKT",cohort:"Khóa 21",academicYear:"2024 - 2025",status:"Đang hoạt động"},
    {code:"CNTN-K22-MKT",cohort:"Khóa 22",academicYear:"2025 - 2026",status:"Đang tuyển sinh"}
  ],
  "Quản trị khách sạn": [{code:"CNTN-K21-QTKS",cohort:"Khóa 21",academicYear:"2024 - 2025",status:"Đang hoạt động"}]
};

const schoolMajorCatalog = [
  ["Khoa Công nghệ Điện",["Công nghệ kỹ thuật điện, điện tử","Năng lượng tái tạo","Điện hạt nhân","Công nghệ kỹ thuật điều khiển và tự động hóa","Robot và hệ thống điều khiển thông minh"]],
  ["Khoa Công nghệ Điện tử",["Điện tử công nghiệp","Kỹ thuật viễn thông","IoT và Trí tuệ nhân tạo ứng dụng","Kỹ thuật Radar - Dẫn đường","Công nghệ kỹ thuật máy tính","Kỹ thuật thiết kế vi mạch"]],
  ["Khoa Công nghệ Cơ khí",["Công nghệ kỹ thuật cơ khí","Công nghệ kỹ thuật cơ điện tử","Công nghệ chế tạo máy","Công nghệ kỹ thuật ô tô","Công nghệ kỹ thuật ô tô điện","Công nghệ kỹ thuật nhiệt","Công nghệ kỹ thuật năng lượng","Quản lý năng lượng"]],
  ["Khoa Kỹ thuật Xây dựng",["Kỹ thuật xây dựng","Xây dựng cầu đường","Kỹ thuật công trình đường sắt","Quản lý xây dựng"]],
  ["Khoa Công nghệ May - Thời trang",["Công nghệ dệt, may","Thiết kế thời trang"]],
  ["Khoa Công nghệ Thông tin",["Công nghệ thông tin","Kỹ thuật phần mềm","Khoa học máy tính","Hệ thống thông tin","Khoa học dữ liệu","Trí tuệ nhân tạo"]],
  ["Khoa Công nghệ Hóa học",["Công nghệ kỹ thuật hóa học","Kỹ thuật hóa phân tích","Hóa dược"]],
  ["Khoa Dược",["Dược học"]],
  ["Viện Công nghệ Sinh học và Thực phẩm",["Công nghệ thực phẩm","Đảm bảo chất lượng và An toàn thực phẩm","Dinh dưỡng và Khoa học thực phẩm","Công nghệ sinh học"]],
  ["Khoa Quản lý Đất đai",["Quản lý đất đai","Kinh tế tài nguyên thiên nhiên"]],
  ["Viện Khoa học Công nghệ và Quản lý Môi trường",["Quản lý tài nguyên và môi trường","Công nghệ kỹ thuật môi trường"]],
  ["Khoa Kế toán - Kiểm toán",["Kế toán","Kiểm toán","Kế toán tích hợp chứng chỉ quốc tế ACCA","Kiểm toán tích hợp chứng chỉ quốc tế CFAB"]],
  ["Khoa Tài chính - Ngân hàng",["Tài chính","Ngân hàng","Công nghệ tài chính"]],
  ["Khoa Quản trị Kinh doanh",["Quản trị kinh doanh","Quản trị nguồn nhân lực","Marketing","Digital Marketing"]],
  ["Khoa Thương mại - Du lịch",["Logistics và Quản lý chuỗi cung ứng","Quản trị dịch vụ du lịch và lữ hành","Quản trị khách sạn","Quản trị nhà hàng và dịch vụ ăn uống","Kinh doanh quốc tế","Thương mại điện tử"]],
  ["Khoa Ngoại ngữ",["Ngôn ngữ Anh","Ngôn ngữ Trung Quốc"]],
  ["Khoa Luật",["Luật kinh tế"]]
];

export function createInitialMajors() {
  let id = 1;
  return schoolMajorCatalog.flatMap(([faculty,majors])=>majors.map(name=>({
    id:id++, faculty, name, classes:(sampleMajorClasses[name] || []).map(item=>({...item}))
  })));
}

const classStudents = {
  software20: [
    {id:"21094501",name:"Nguyễn Hoàng Nam",email:"nam.21094501@iuh.edu.vn",status:"Đang học"},
    {id:"21094518",name:"Trần Minh Khoa",email:"khoa.21094518@iuh.edu.vn",status:"Đang học"},
    {id:"21094602",name:"Võ Gia Bảo",email:"bao.21094602@iuh.edu.vn",status:"Đang học"}
  ],
  information21: [
    {id:"22073102",name:"Lê Khánh An",email:"an.22073102@iuh.edu.vn",status:"Đang học"},
    {id:"22073210",name:"Phạm Gia Hân",email:"han.22073210@iuh.edu.vn",status:"Đang học"}
  ],
  marketing20: [
    {id:"21081207",name:"Đỗ Minh Thư",email:"thu.21081207@iuh.edu.vn",status:"Đang học"},
    {id:"21081314",name:"Ngô Hoàng Phúc",email:"phuc.21081314@iuh.edu.vn",status:"Đang học"}
  ]
};

export function createInitialClasses() {
  return [
    {id:1,major:"Kỹ thuật phần mềm",cohort:"20",lecturer:"ThS. Phạm Thị Dung",current:20,capacity:30,status:"Đang hoạt động",admissionRound:{code:"DXT-2023-01",name:"Xét tuyển KSTN khóa 20",opened:true},students:classStudents.software20},
    {id:2,major:"Hệ thống thông tin",cohort:"21",lecturer:"TS. Nguyễn Văn Hải",current:15,capacity:20,status:"Đang hoạt động",admissionRound:{code:"DXT-2024-02",name:"Xét tuyển KSTN khóa 21",opened:true},students:classStudents.information21},
    {id:3,major:"Khoa học dữ liệu",cohort:"22",lecturer:"ThS. Lê Minh Tâm",current:0,capacity:30,status:"Đang tuyển sinh",admissionRound:{code:"DXT-2026-01",name:"Xét tuyển KSTN khóa 22",opened:true},students:[]},
    {id:4,major:"Công nghệ thông tin",cohort:"20",lecturer:"TS. Trần Ngọc Bình",current:28,capacity:35,status:"Đang hoạt động",admissionRound:{code:"DXT-2023-03",name:"Xét tuyển KSTN khóa 20",opened:true},students:[]},
    {id:5,major:"Công nghệ kỹ thuật điện, điện tử",cohort:"20",lecturer:"ThS. Nguyễn Quốc Bảo",current:22,capacity:30,status:"Đang hoạt động",admissionRound:{code:"DXT-2023-04",name:"Xét tuyển KSTN khóa 20",opened:true},students:[]},
    {id:6,major:"Công nghệ kỹ thuật cơ điện tử",cohort:"21",lecturer:"TS. Lê Thanh Tùng",current:18,capacity:25,status:"Đang hoạt động",admissionRound:{code:"DXT-2024-05",name:"Xét tuyển KSTN khóa 21",opened:true},students:[]},
    {id:7,major:"Quản trị kinh doanh",cohort:"20",lecturer:"ThS. Trần Mỹ Linh",current:25,capacity:30,status:"Đang hoạt động",admissionRound:{code:"DXT-2023-06",name:"Xét tuyển CNTN khóa 20",opened:true},students:[]},
    {id:8,major:"Marketing",cohort:"20",lecturer:"TS. Hoàng Minh Châu",current:20,capacity:25,status:"Đang hoạt động",admissionRound:{code:"DXT-2023-07",name:"Xét tuyển CNTN khóa 20",opened:true},students:classStudents.marketing20},
    {id:9,major:"Marketing",cohort:"22",lecturer:"ThS. Đặng Thu Hà",current:0,capacity:25,status:"Chưa mở",admissionRound:{code:"DXT-2026-04",name:"Xét tuyển CNTN khóa 22",opened:false},students:[]},
    {id:10,major:"Quản trị khách sạn",cohort:"21",lecturer:"ThS. Nguyễn Hải Yến",current:16,capacity:20,status:"Đang hoạt động",admissionRound:{code:"DXT-2024-08",name:"Xét tuyển CNTN khóa 21",opened:true},students:[]},
    {id:11,major:"Logistics và Quản lý chuỗi cung ứng",cohort:"22",lecturer:"TS. Phan Anh Khoa",current:0,capacity:30,status:"Chưa mở",admissionRound:null,students:[]},
    {id:12,major:"Kỹ thuật thiết kế vi mạch",cohort:"22",lecturer:"TS. Bùi Quốc Huy",current:0,capacity:25,status:"Chưa mở",admissionRound:null,students:[]},
    {id:13,major:"Trí tuệ nhân tạo",cohort:"23",lecturer:"ThS. Nguyễn Tường Vy",current:0,capacity:30,status:"Chưa mở",admissionRound:null,students:[]}
  ].map(item=>({...item,students:item.students.map(student=>({...student})),admissionRound:item.admissionRound?{...item.admissionRound}:null}));
}

export const tableData = {
  majorsFaculty: {
    title:"Quản lý chuyên ngành", desc:"Danh mục ngành đào tạo CN/KSTN trong phạm vi được phân quyền.",
    columns:["Mã ngành","Tên chuyên ngành","Đơn vị","Quy mô","Trạng thái"],
    rows:[["7480201","Công nghệ thông tin","Khoa CNTT","5 lớp","Đang hoạt động"],["7480103","Kỹ thuật phần mềm","Khoa CNTT","3 lớp","Đang hoạt động"],["7480104","Hệ thống thông tin","Khoa CNTT","2 lớp","Đang hoạt động"],["7480108","Khoa học dữ liệu","Khoa CNTT","2 lớp","Đang hoạt động"]]
  },
  classes: {
    title:"Quản lý lớp CN/KSTN", desc:"Theo dõi lớp, niên khóa, giảng viên phụ trách và sĩ số.",
    columns:["Mã lớp","Chuyên ngành","Niên khóa","Giảng viên phụ trách","Sĩ số"],
    rows:[["KSTN-K20","Kỹ thuật phần mềm","2023 - 2027","ThS. Phạm Thị Dung","32/35"],["CLC-K21","Công nghệ thông tin","2024 - 2028","TS. Nguyễn Văn Hải","38/40"],["KSTN-K22","Khoa học dữ liệu","2025 - 2029","ThS. Lê Minh Tâm","30/35"]]
  },
  classesView: {title:"Thông tin lớp CN/KSTN",desc:"Tra cứu danh sách lớp và sinh viên trúng tuyển chính thức.",columns:["Mã lớp","Chuyên ngành","Niên khóa","Giảng viên phụ trách","Sĩ số"],readonly:true,source:"classes"},
  teachers: {
    title:"Tài khoản giảng viên",desc:"Quản lý hồ sơ, trạng thái tài khoản và phạm vi công tác.",columns:["Mã NV","Họ và tên","Email","Vai trò","Trạng thái"],
    rows:[["GV00128","Phạm Thị Dung","ptdung@iuh.edu.vn","Giảng viên phụ trách","Hoạt động"],["GV00143","Nguyễn Văn Hải","nvhai@iuh.edu.vn","Chủ nhiệm ngành","Hoạt động"],["GV00201","Lê Minh Tâm","lmtam@iuh.edu.vn","Giảng viên","Hoạt động"]]
  },
  students: {
    title:"Tài khoản sinh viên",desc:"Quản lý tài khoản sinh viên CN/KSTN toàn trường.",columns:["MSSV","Họ và tên","Lớp","Email","Trạng thái"],
    rows:[["21094501","Nguyễn Hoàng Nam","KSTN-K20","nam.21094501@iuh.edu.vn","Hoạt động"],["21094518","Trần Minh Khoa","KSTN-K20","khoa.21094518@iuh.edu.vn","Hoạt động"],["22073102","Lê Khánh An","CLC-K21","an.22073102@iuh.edu.vn","Chờ duyệt"]]
  },
  permissions: {
    title:"Phân quyền tài khoản giảng viên",desc:"Gán vai trò theo ma trận quyền, không cho phép cấp quyền cao hơn tài khoản hiện tại.",columns:["Mã NV","Họ và tên","Vai trò","Phạm vi","Quyền truy cập"],
    rows:[["GV00128","Phạm Thị Dung","Giảng viên phụ trách","KSTN-K20","Hồ sơ, lớp, xét tuyển"],["GV00143","Nguyễn Văn Hải","Chủ nhiệm ngành","Kỹ thuật phần mềm","Tài khoản, xét tuyển, tiêu chí"],["GV00201","Lê Minh Tâm","Giảng viên","KSTN-K22","Chỉ xem"]]
  },
  profiles: {
    title:"Hồ sơ sinh viên CN/KSTN",desc:"Tra cứu hồ sơ, minh chứng và lịch sử xét tuyển của sinh viên.",columns:["MSSV","Họ và tên","Lớp","Loại hồ sơ","Tổng điểm","Trạng thái"],readonly:true,
    rows:[["21094501","Nguyễn Hoàng Nam","KSTN-K20","Duy trì năm 3","92 điểm","Đã duyệt"],["21094518","Trần Minh Khoa","KSTN-K20","Duy trì năm 3","86 điểm","Chờ duyệt"],["22073102","Lê Khánh An","CLC-K21","Xét tuyển mới","88 điểm","Chờ duyệt"],["22073210","Phạm Gia Hân","CLC-K21","Xét tuyển mới","74 điểm","Cần bổ sung"]]
  }
};
tableData.classesView.rows = tableData.classes.rows;

export const roundRows = [
  ["DXT-2026-01","Xét tuyển KSTN khóa 22","Khoa CNTT","01/08 - 15/08/2026","Tiếp nhận hồ sơ"],
  ["DXT-2026-02","Duy trì KSTN năm 3","Khoa CNTT","10/08 - 25/08/2026","Đang xét duyệt"],
  ["DXT-2025-03","Xét tuyển bổ sung khóa 21","Khoa CNTT","01/09 - 08/09/2025","Đã kết thúc"]
];

export const criteriaRows = [
  ["Bắt buộc","Số tín chỉ đạt","≥ 38","5","1"],["Bắt buộc","Số tín chỉ không đạt","0","5","2"],["Bắt buộc","GPA năm 2","≥ 3.6 / ≥ 3.4 / ≥ 3.2","50 / 40 / 30","3"],["Bắt buộc","Điểm rèn luyện trung bình năm 2","> 80","20","4"],["Bắt buộc","Năng lực ngoại ngữ (TOEIC)","≥ 450","20","5"],["Bắt buộc","Thành tích nghiên cứu khoa học","1 thành tích","20","6"],["Ưu tiên","Ngoại ngữ nâng cao (TOEIC)","≥ 550","20","7"],["Ưu tiên","Cuộc thi chuyên ngành","Nhất / Nhì / Ba / KK","40 / 30 / 20 / 10","8"]
];

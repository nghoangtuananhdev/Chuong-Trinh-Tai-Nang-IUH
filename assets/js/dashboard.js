(() => {
  const roles = {
    admin: {
      name: "Quản trị hệ thống", label: "Quản trị viên", initials: "QT",
      menus: [["majors","Chuyên ngành toàn trường","journal-bookmark"],["classes","Lớp CN/KSTN toàn trường","easel"],["teachers","Tài khoản giảng viên","person-workspace"],["students","Tài khoản sinh viên","people"],["permissions","Phân quyền giảng viên","person-gear"],["rounds","Đợt xét tuyển toàn trường","calendar2-check"]]
    },
    training: {
      name: "Nguyễn Minh Anh", label: "Đại diện Phòng Đào tạo", initials: "PĐT",
      menus: [["majors","Chuyên ngành toàn trường","journal-bookmark"],["classesView","Thông tin lớp toàn trường","easel"],["teachers","Tài khoản giảng viên","person-workspace"],["students","Tài khoản sinh viên","people"],["permissions","Phân quyền giảng viên","person-gear"],["roundsView","Thông tin đợt xét tuyển","calendar2-check"],["profiles","Hồ sơ sinh viên","folder2-open"],["finalApproval","Duyệt danh sách trúng tuyển","check2-square"]]
    },
    dean: {
      name: "PGS. TS. Lê Hoàng", label: "Ban lãnh đạo khoa", initials: "BLĐ",
      menus: [["majors","Chuyên ngành của khoa","journal-bookmark"],["classes","Lớp CN/KSTN của khoa","easel"],["teachers","Tài khoản giảng viên khoa","person-workspace"],["permissions","Phân quyền giảng viên","person-gear"],["rounds","Đợt xét tuyển của khoa","calendar2-check"],["criteria","Bộ tiêu chí xét tuyển","list-check"],["profiles","Hồ sơ sinh viên","folder2-open"],["approvals","Phê duyệt hồ sơ","clipboard-check"],["results","Danh sách trúng tuyển","award"]]
    },
    head: {
      name: "TS. Trần Ngọc Bình", label: "Chủ nhiệm ngành", initials: "CN",
      menus: [["teachers","Tài khoản giảng viên ngành","person-workspace"],["permissions","Phân quyền giảng viên","person-gear"],["rounds","Đợt xét tuyển của ngành","calendar2-check"],["criteria","Bộ tiêu chí xét tuyển","list-check"],["classes","Lớp CN/KSTN của ngành","easel"],["profiles","Hồ sơ sinh viên","folder2-open"],["approvals","Phê duyệt hồ sơ","clipboard-check"],["results","Xác nhận danh sách trúng tuyển","award"]]
    },
    lecturer: {
      name: "ThS. Phạm Thị Dung", label: "Giảng viên phụ trách", initials: "GV",
      menus: [["classes","Lớp đang đảm nhận","easel"],["rounds","Đợt xét tuyển của lớp","calendar2-check"],["criteria","Bộ tiêu chí xét tuyển","list-check"],["profiles","Hồ sơ sinh viên","folder2-open"],["approvals","Phê duyệt hồ sơ","clipboard-check"],["studentPasswords","Đặt lại mật khẩu sinh viên","key"]]
    },
    student: {
      name: "Nguyễn Hoàng Nam", label: "Sinh viên CN/KSTN", initials: "SV",
      menus: [["application","Cập nhật hồ sơ xét tuyển duy trì","file-earmark-person"]]
    }
  };

  const data = {
    majors: [
      ["7480201","Công nghệ thông tin","Khoa CNTT","5 lớp","Đang hoạt động"],
      ["7480103","Kỹ thuật phần mềm","Khoa CNTT","3 lớp","Đang hoạt động"],
      ["7480104","Hệ thống thông tin","Khoa CNTT","2 lớp","Đang hoạt động"],
      ["7480108","Khoa học dữ liệu","Khoa CNTT","2 lớp","Đang hoạt động"]
    ],
    classes: [
      ["KSTN-K20","Kỹ thuật phần mềm","2023 - 2027","ThS. Phạm Thị Dung","32/35"],
      ["CLC-K21","Công nghệ thông tin","2024 - 2028","TS. Nguyễn Văn Hải","38/40"],
      ["KSTN-K22","Khoa học dữ liệu","2025 - 2029","ThS. Lê Minh Tâm","30/35"]
    ],
    teachers: [
      ["GV00128","Phạm Thị Dung","ptdung@iuh.edu.vn","Giảng viên phụ trách","Hoạt động"],
      ["GV00143","Nguyễn Văn Hải","nvhai@iuh.edu.vn","Chủ nhiệm ngành","Hoạt động"],
      ["GV00201","Lê Minh Tâm","lmtam@iuh.edu.vn","Giảng viên","Hoạt động"]
    ],
    students: [
      ["21094501","Nguyễn Hoàng Nam","KSTN-K20","nam.21094501@iuh.edu.vn","Hoạt động"],
      ["21094518","Trần Minh Khoa","KSTN-K20","khoa.21094518@iuh.edu.vn","Hoạt động"],
      ["22073102","Lê Khánh An","CLC-K21","an.22073102@iuh.edu.vn","Chờ duyệt"]
    ],
    profiles: [
      ["21094501","Nguyễn Hoàng Nam","KSTN-K20","Duy trì năm 3","92 điểm","Đã duyệt"],
      ["21094518","Trần Minh Khoa","KSTN-K20","Duy trì năm 3","86 điểm","Chờ duyệt"],
      ["22073102","Lê Khánh An","CLC-K21","Xét tuyển mới","88 điểm","Chờ duyệt"],
      ["22073210","Phạm Gia Hân","CLC-K21","Xét tuyển mới","74 điểm","Cần bổ sung"]
    ],
    permissions: [
      ["GV00128","Phạm Thị Dung","Giảng viên phụ trách","KSTN-K20","Hồ sơ, lớp, xét tuyển"],
      ["GV00143","Nguyễn Văn Hải","Chủ nhiệm ngành","Kỹ thuật phần mềm","Tài khoản, xét tuyển, tiêu chí"],
      ["GV00201","Lê Minh Tâm","Giảng viên","KSTN-K22","Chỉ xem"]
    ]
  };

  const tableMeta = {
    majors: {title:"Quản lý chuyên ngành", desc:"Danh mục ngành đào tạo CN/KSTN trong phạm vi được phân quyền.", icon:"journal-bookmark", cols:["Mã ngành","Tên chuyên ngành","Đơn vị","Quy mô","Trạng thái"]},
    classes: {title:"Quản lý lớp CN/KSTN", desc:"Theo dõi lớp, niên khóa, giảng viên phụ trách và sĩ số.", icon:"easel", cols:["Mã lớp","Chuyên ngành","Niên khóa","Giảng viên phụ trách","Sĩ số"]},
    classesView: {title:"Thông tin lớp CN/KSTN", desc:"Tra cứu danh sách lớp và sinh viên trúng tuyển chính thức.", icon:"easel", cols:["Mã lớp","Chuyên ngành","Niên khóa","Giảng viên phụ trách","Sĩ số"], readonly:true, source:"classes"},
    teachers: {title:"Tài khoản giảng viên", desc:"Quản lý hồ sơ, trạng thái tài khoản và phạm vi công tác.", icon:"person-workspace", cols:["Mã NV","Họ và tên","Email","Vai trò","Trạng thái"]},
    students: {title:"Tài khoản sinh viên", desc:"Quản lý tài khoản sinh viên CN/KSTN toàn trường.", icon:"people", cols:["MSSV","Họ và tên","Lớp","Email","Trạng thái"]},
    permissions: {title:"Phân quyền tài khoản giảng viên", desc:"Gán vai trò theo ma trận quyền, không cho phép cấp quyền cao hơn tài khoản hiện tại.", icon:"person-gear", cols:["Mã NV","Họ và tên","Vai trò","Phạm vi","Quyền truy cập"]},
    profiles: {title:"Hồ sơ sinh viên CN/KSTN", desc:"Tra cứu hồ sơ, minh chứng và lịch sử xét tuyển của sinh viên.", icon:"folder2-open", cols:["MSSV","Họ và tên","Lớp","Loại hồ sơ","Tổng điểm","Trạng thái"], readonly:true}
  };

  const roundRows = [
    ["DXT-2026-01","Xét tuyển KSTN khóa 22","Khoa CNTT","01/08 - 15/08/2026","Tiếp nhận hồ sơ"],
    ["DXT-2026-02","Duy trì KSTN năm 3","Khoa CNTT","10/08 - 25/08/2026","Đang xét duyệt"],
    ["DXT-2025-03","Xét tuyển bổ sung khóa 21","Khoa CNTT","01/09 - 08/09/2025","Đã kết thúc"]
  ];

  const criteria = [
    ["Bắt buộc","Số tín chỉ đạt","≥ 38","5","1"],
    ["Bắt buộc","Số tín chỉ không đạt","0","5","2"],
    ["Bắt buộc","GPA năm 2","≥ 3.6 / ≥ 3.4 / ≥ 3.2","50 / 40 / 30","3"],
    ["Bắt buộc","Điểm rèn luyện trung bình năm 2","> 80","20","4"],
    ["Bắt buộc","Năng lực ngoại ngữ (TOEIC)","≥ 450","20","5"],
    ["Bắt buộc","Thành tích nghiên cứu khoa học","1 thành tích","20","6"],
    ["Ưu tiên","Ngoại ngữ nâng cao (TOEIC)","≥ 550","20","7"],
    ["Ưu tiên","Cuộc thi chuyên ngành","Nhất / Nhì / Ba / KK","40 / 30 / 20 / 10","8"]
  ];

  const $ = (s, root=document) => root.querySelector(s);
  const roleKey = document.body.dataset.role || "admin";
  const role = roles[roleKey] || roles.admin;
  let active = role.menus[0][0];

  function badge(value) {
    const v = String(value);
    const cls = /Hoạt động|Đã duyệt|Tiếp nhận|Đạt/.test(v) ? "badge-green" : /Chờ|Đang xét|Cần bổ sung/.test(v) ? "badge-yellow" : /Từ chối|Khóa/.test(v) ? "badge-red" : "";
    return `<span class="badge-soft ${cls}">${v}</span>`;
  }

  function setupChrome() {
    $("#roleLabel").textContent = role.label;
    $("#userName").textContent = role.name;
    $("#userRole").textContent = role.label;
    $("#avatar").textContent = role.initials;
    $("#sidebarMenu").innerHTML = role.menus.map(([id,label,icon],i) => `<button class="menu-btn${i===0?" active":""}" data-page="${id}"><i class="bi bi-${icon}"></i><span>${label}</span></button>`).join("");
  }

  function pageHead(title, desc, action="") {
    return `<div class="page-head"><div><h1>${title}</h1><p>${desc}</p></div>${action}</div>`;
  }

  function tablePage(key) {
    const meta = tableMeta[key];
    const source = meta.source || key;
    const rows = data[source] || [];
    const add = meta.readonly ? "" : `<button class="btn btn-primary" data-action="add" data-type="${source}"><i class="bi bi-plus-lg me-1"></i> Thêm mới</button>`;
    return `${pageHead(meta.title,meta.desc,add)}<section class="panel"><div class="panel-body">
      <div class="toolbar"><div class="search"><i class="bi bi-search"></i><input class="form-control table-search" placeholder="Tìm kiếm trong danh sách..."></div><select class="form-select" style="max-width:190px"><option>Tất cả trạng thái</option><option>Đang hoạt động</option><option>Chờ duyệt</option></select><button class="btn btn-outline-secondary" data-action="export"><i class="bi bi-download me-1"></i> Xuất Excel</button></div>
      <div class="table-responsive"><table class="table data-table"><thead><tr>${meta.cols.map(c=>`<th>${c}</th>`).join("")}<th class="text-end">Thao tác</th></tr></thead><tbody>${rows.map((r,idx)=>`<tr>${r.map((v,i)=>`<td>${i===r.length-1?badge(v):v}</td>`).join("")}<td class="text-end"><button class="action-btn" title="Xem chi tiết" data-action="view" data-index="${idx}"><i class="bi bi-eye"></i></button>${meta.readonly?"":` <button class="action-btn" title="Chỉnh sửa" data-action="edit" data-type="${source}" data-index="${idx}"><i class="bi bi-pencil"></i></button> <button class="action-btn" title="Xóa" data-action="delete" data-index="${idx}"><i class="bi bi-trash"></i></button>`}</td></tr>`).join("")}</tbody></table></div>
      <div class="d-flex justify-content-between align-items-center mt-3 small text-muted"><span>Hiển thị ${rows.length} bản ghi</span><nav><button class="btn btn-sm btn-light" disabled>Trước</button> <button class="btn btn-sm btn-primary">1</button> <button class="btn btn-sm btn-light" disabled>Sau</button></nav></div>
    </div></section>`;
  }

  function rounds(readonly=false) {
    return `${pageHead(readonly?"Thông tin đợt xét tuyển":"Quản lý đợt xét tuyển","Mỗi đợt gồm các giai đoạn tiếp nhận hồ sơ, xét duyệt và công bố kết quả.",readonly?"":`<button class="btn btn-primary" data-action="add" data-type="round"><i class="bi bi-plus-lg me-1"></i> Tạo đợt xét tuyển</button>`)}
      <section class="panel"><div class="panel-body"><div class="toolbar"><div class="search"><i class="bi bi-search"></i><input class="form-control table-search" placeholder="Tìm theo mã hoặc tên đợt..."></div><select class="form-select" style="max-width:190px"><option>Tất cả trạng thái</option><option>Tiếp nhận hồ sơ</option><option>Đang xét duyệt</option><option>Đã kết thúc</option></select></div>
      <div class="table-responsive"><table class="table data-table"><thead><tr><th>Mã đợt</th><th>Tên đợt</th><th>Đơn vị</th><th>Thời gian</th><th>Trạng thái</th><th class="text-end">Thao tác</th></tr></thead><tbody>${roundRows.map((r,i)=>`<tr>${r.map((v,j)=>`<td>${j===4?badge(v):v}</td>`).join("")}<td class="text-end"><button class="action-btn" data-action="roundDetail"><i class="bi bi-eye"></i></button>${readonly?"":` <button class="action-btn" data-action="edit" data-type="round"><i class="bi bi-pencil"></i></button>`}</td></tr>`).join("")}</tbody></table></div></div></section>`;
  }

  function criteriaPage() {
    return `${pageHead("Cấu hình bộ tiêu chí xét tuyển","Thiết lập điều kiện, mức đánh giá, điểm và thứ tự xét hòa.",`<button class="btn btn-primary" data-action="add" data-type="criteria"><i class="bi bi-plus-lg me-1"></i> Thêm tiêu chí</button>`)}
      <section class="panel"><div class="panel-head"><h2 class="panel-title">Bộ tiêu chí KSTN năm học 2026 - 2027</h2><span class="badge-soft badge-green">Đang áp dụng</span></div><div class="panel-body"><div class="table-responsive"><table class="table data-table"><thead><tr><th>Loại</th><th>Tên tiêu chí</th><th>Mức đánh giá</th><th>Điểm</th><th>Thứ tự xét hòa</th><th></th></tr></thead><tbody>${criteria.map((r,i)=>`<tr>${r.map((v,j)=>`<td>${j===0?badge(v):v}</td>`).join("")}<td class="text-end"><button class="action-btn" data-action="edit" data-type="criteria" data-index="${i}"><i class="bi bi-pencil"></i></button></td></tr>`).join("")}</tbody></table></div></div></section>`;
  }

  function approvals(final=false) {
    const title = final ? (roleKey==="head"?"Xác nhận danh sách trúng tuyển":"Duyệt danh sách trúng tuyển") : "Phê duyệt hồ sơ xét tuyển";
    const rows = data.profiles.filter(r => final ? r[5]==="Đã duyệt" : r[5]!=="Đã duyệt");
    return `${pageHead(title,final?"Kiểm tra và phê duyệt danh sách trước khi công bố chính thức.":"Duyệt hoặc từ chối hồ sơ trong phạm vi được phân quyền.",`<button class="btn btn-outline-secondary" data-action="export"><i class="bi bi-download me-1"></i> Xuất danh sách</button>`)}
      <section class="panel"><div class="panel-body"><div class="toolbar"><div class="search"><i class="bi bi-search"></i><input class="form-control table-search" placeholder="Tìm MSSV, họ tên hoặc lớp..."></div><span class="badge-soft badge-yellow">${rows.length} hồ sơ cần xử lý</span></div>
      <div class="table-responsive"><table class="table data-table"><thead><tr><th>MSSV</th><th>Họ tên</th><th>Lớp</th><th>Loại hồ sơ</th><th>Tổng điểm</th><th>Trạng thái</th><th class="text-end">Quyết định</th></tr></thead><tbody>${rows.map(r=>`<tr>${r.map((v,i)=>`<td>${i===5?badge(v):v}</td>`).join("")}<td class="text-end"><button class="btn btn-sm btn-outline-primary" data-action="view">Chi tiết</button> <button class="btn btn-sm btn-success" data-action="approve">${final?"Xác nhận":"Duyệt"}</button> <button class="btn btn-sm btn-outline-danger" data-action="reject">Từ chối</button></td></tr>`).join("")}</tbody></table></div></div></section>`;
  }

  function application() {
    return `${pageHead("Cập nhật hồ sơ xét tuyển duy trì","Đợt duy trì KSTN năm 3 - hạn cập nhật 25/08/2026",`<button class="btn btn-outline-secondary" data-action="saveDraft"><i class="bi bi-save me-1"></i> Lưu nháp</button>`)}
      <div class="process mb-3"><div class="process-step done"><strong>1. Thông tin cá nhân</strong><br><small>Đã xác nhận</small></div><div class="process-step current"><strong>2. Tiêu chí & minh chứng</strong><br><small>Đang cập nhật</small></div><div class="process-step"><strong>3. Gửi phê duyệt</strong><br><small>Chưa gửi</small></div></div>
      <section class="panel"><div class="panel-head"><h2 class="panel-title">Thông tin tiêu chí xét tuyển</h2><span class="badge-soft">Tự động lưu trên thiết bị</span></div><div class="panel-body"><form id="applicationForm"><div class="form-grid">
        <div><label class="form-label fw-semibold">Số tín chỉ đạt</label><input class="form-control" type="number" value="42" min="0" required><div class="form-text">Yêu cầu tối thiểu 38 tín chỉ</div></div>
        <div><label class="form-label fw-semibold">Số tín chỉ không đạt</label><input class="form-control" type="number" value="0" min="0" required></div>
        <div><label class="form-label fw-semibold">GPA năm 2</label><input class="form-control" type="number" step="0.01" value="3.54" required></div>
        <div><label class="form-label fw-semibold">Điểm rèn luyện trung bình</label><input class="form-control" type="number" value="92" required></div>
        <div><label class="form-label fw-semibold">Điểm TOEIC</label><input class="form-control" type="number" value="610" required></div>
        <div><label class="form-label fw-semibold">Thành tích chuyên ngành</label><select class="form-select"><option>Không có</option><option selected>Giải Ba</option><option>Giải Nhì</option><option>Giải Nhất</option></select></div>
      </div><hr class="my-4"><h3 class="h6 fw-bold">Tệp minh chứng</h3><div class="row g-3"><div class="col-md-6"><label class="form-label">Bảng điểm / kết quả học tập</label><input class="form-control" type="file" accept=".pdf,image/*"></div><div class="col-md-6"><label class="form-label">Chứng chỉ ngoại ngữ</label><input class="form-control" type="file" accept=".pdf,image/*"></div></div>
      <div class="d-flex justify-content-end mt-4"><button class="btn btn-primary" type="submit"><i class="bi bi-send me-1"></i> Cập nhật và gửi phê duyệt</button></div></form></div></section>`;
  }

  function passwordPage() {
    return `${pageHead("Đặt lại mật khẩu sinh viên","Tạo mật khẩu mặc định mới và yêu cầu sinh viên đổi ở lần đăng nhập kế tiếp.")}<section class="panel"><div class="panel-body"><div class="toolbar"><div class="search"><i class="bi bi-search"></i><input class="form-control table-search" placeholder="Tìm MSSV hoặc họ tên..."></div></div><div class="table-responsive"><table class="table data-table"><thead><tr><th>MSSV</th><th>Họ tên</th><th>Lớp</th><th>Email</th><th class="text-end">Thao tác</th></tr></thead><tbody>${data.students.map(r=>`<tr>${r.slice(0,4).map(v=>`<td>${v}</td>`).join("")}<td class="text-end"><button class="btn btn-sm btn-outline-primary" data-action="resetPassword">Đặt lại mật khẩu</button></td></tr>`).join("")}</tbody></table></div></div></section>`;
  }

  function profilePage() {
    return `${pageHead("Thông tin cá nhân","Thông tin hồ sơ tài khoản đang đăng nhập.")}<section class="panel"><div class="panel-body"><div class="profile-grid"><div class="profile-card"><div class="profile-avatar">${role.initials}</div><h2 class="h6 fw-bold mb-1">${role.name}</h2><p class="small text-muted">${role.label}</p><span class="badge-soft badge-green">Tài khoản hoạt động</span></div><form id="profileForm"><div class="form-grid"><div><label class="form-label">Họ và tên</label><input class="form-control" value="${role.name}"></div><div><label class="form-label">Mã tài khoản</label><input class="form-control" value="${roleKey==='student'?'21094501':'GV00128'}" readonly></div><div><label class="form-label">Email</label><input class="form-control" type="email" value="${roleKey==='student'?'nam.21094501@iuh.edu.vn':'account@iuh.edu.vn'}"></div><div><label class="form-label">Số điện thoại</label><input class="form-control" value="090 123 4567"></div><div><label class="form-label">Ngày sinh</label><input class="form-control" type="date" value="2003-10-12"></div><div><label class="form-label">Đơn vị / Lớp</label><input class="form-control" value="${roleKey==='student'?'KSTN-K20':'Khoa Công nghệ Thông tin'}"></div></div><div class="text-end mt-4"><button class="btn btn-primary" type="submit">Lưu thay đổi</button></div></form></div></div></section>`;
  }

  function render(page) {
    active = page;
    document.querySelectorAll(".menu-btn").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
    let html;
    if (tableMeta[page]) html = tablePage(page);
    else if (page === "rounds" || page === "roundsView") html = rounds(page === "roundsView");
    else if (page === "criteria") html = criteriaPage();
    else if (page === "approvals") html = approvals(false);
    else if (page === "results" || page === "finalApproval") html = approvals(true);
    else if (page === "application") html = application();
    else if (page === "studentPasswords") html = passwordPage();
    else if (page === "profile") html = profilePage();
    else { render(role.menus[0][0]); return; }
    $("#workspace").innerHTML = html;
    document.body.classList.remove("menu-open");
  }

  function toast(message, type="success") {
    const el = document.createElement("div");
    el.className = `toast align-items-center text-bg-${type} border-0`;
    el.innerHTML = `<div class="d-flex"><div class="toast-body"><i class="bi bi-check-circle me-2"></i>${message}</div><button class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
    $("#toastContainer").append(el);
    const t = bootstrap.Toast.getOrCreateInstance(el,{delay:2600}); t.show(); el.addEventListener("hidden.bs.toast",()=>el.remove());
  }

  function exportCsv() {
    const table = document.querySelector(".data-table");
    if (!table) { toast("Màn hình hiện tại không có dữ liệu để xuất.","danger"); return; }
    const rows = [...table.querySelectorAll("tr")].map(tr => [...tr.querySelectorAll("th,td")].slice(0,-1).map(cell => `"${cell.innerText.trim().replaceAll('"','""')}"`).join(","));
    const blob = new Blob(["\ufeff" + rows.join("\r\n")], {type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `du-lieu-${active}-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    setTimeout(()=>URL.revokeObjectURL(url),500); toast("Đã xuất danh sách thành tệp CSV mở được bằng Excel.");
  }

  function openForm(type="item", edit=false) {
    $("#genericModalLabel").textContent = `${edit?"Chỉnh sửa":"Thêm mới"} ${type==="round"?"đợt xét tuyển":type==="criteria"?"tiêu chí":"bản ghi"}`;
    $("#genericModalBody").innerHTML = `<div class="mb-3"><label class="form-label">Mã / Định danh</label><input class="form-control" value="${edit?"IUH-2026-01":""}" required></div><div class="mb-3"><label class="form-label">Tên hiển thị</label><input class="form-control" value="${edit?"Thông tin mẫu":""}" required></div><div class="row g-3"><div class="col-md-6"><label class="form-label">Trạng thái</label><select class="form-select"><option>Đang hoạt động</option><option>Chờ duyệt</option></select></div><div class="col-md-6"><label class="form-label">Đơn vị</label><select class="form-select"><option>Khoa CNTT</option><option>Toàn trường</option></select></div></div>`;
    bootstrap.Modal.getOrCreateInstance($("#genericModal")).show();
  }

  document.addEventListener("click", e => {
    const pageBtn = e.target.closest("[data-page]");
    if (pageBtn) { e.preventDefault(); render(pageBtn.dataset.page); return; }
    const actionBtn = e.target.closest("[data-action]");
    if (!actionBtn) return;
    const action = actionBtn.dataset.action;
    if (action === "add" || action === "edit") openForm(actionBtn.dataset.type,action === "edit");
    else if (action === "delete") { if (confirm("Bạn có chắc muốn xóa bản ghi này?")) { actionBtn.closest("tr")?.remove(); toast("Đã xóa bản ghi khỏi danh sách."); } }
    else if (action === "approve") { actionBtn.closest("tr")?.remove(); toast("Đã phê duyệt hồ sơ sinh viên."); }
    else if (action === "reject") { const reason=prompt("Nhập lý do từ chối hồ sơ:"); if(reason){ actionBtn.closest("tr")?.remove(); toast("Đã từ chối hồ sơ và lưu lý do.","danger"); } }
    else if (action === "export") exportCsv();
    else if (action === "recoverPassword") toast("Đã gửi hướng dẫn khôi phục mật khẩu đến email tài khoản.");
    else if (action === "resetPassword") { if(confirm("Đặt lại mật khẩu mặc định cho sinh viên này?")) toast("Đã tạo mật khẩu mặc định và yêu cầu đổi ở lần đăng nhập sau."); }
    else if (action === "roundDetail") alert("Đợt xét tuyển gồm 3 giai đoạn: Tiếp nhận hồ sơ → Xét duyệt → Công bố kết quả.");
    else if (action === "view") alert("Đã mở chế độ xem chi tiết. Dữ liệu hiện đang được mô phỏng ở front-end.");
    else if (action === "saveDraft") toast("Đã lưu bản nháp trên thiết bị.");
  });

  document.addEventListener("input", e => {
    if (!e.target.classList.contains("table-search")) return;
    const q = e.target.value.toLowerCase();
    e.target.closest(".panel")?.querySelectorAll("tbody tr").forEach(tr => tr.hidden = !tr.textContent.toLowerCase().includes(q));
  });

  document.addEventListener("submit", e => {
    if (e.target.id === "genericForm") { e.preventDefault(); bootstrap.Modal.getInstance($("#genericModal"))?.hide(); toast("Đã lưu thông tin thành công."); }
    if (e.target.id === "applicationForm") { e.preventDefault(); toast("Hồ sơ đã được cập nhật và chuyển sang chờ phê duyệt."); }
    if (e.target.id === "profileForm") { e.preventDefault(); toast("Đã cập nhật thông tin cá nhân."); }
    if (e.target.id === "changePasswordForm") { e.preventDefault(); const inputs=e.target.querySelectorAll("input"); if(inputs[1].value!==inputs[2].value){toast("Mật khẩu xác nhận không khớp.","danger");return;} bootstrap.Modal.getInstance($("#changePasswordModal"))?.hide(); toast("Đổi mật khẩu thành công."); e.target.reset(); }
  });

  $("#profileLink")?.addEventListener("click",e=>{e.preventDefault();render("profile")});
  setupChrome();
  render(active);
})();

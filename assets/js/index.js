(() => {
  const rounds = [
    {id:"DXT-2026-01",name:"Xét tuyển KSTN khóa 22",major:"Khoa Công nghệ Thông tin",time:"01/08 - 15/08/2026",status:"open",label:"Đang mở",desc:"Dành cho sinh viên năm nhất chưa từng tham gia lớp KSTN."},
    {id:"DXT-2026-02",name:"Duy trì KSTN năm 3",major:"Kỹ thuật phần mềm",time:"10/08 - 25/08/2026",status:"review",label:"Đang xét duyệt",desc:"Cập nhật hồ sơ duy trì dành cho sinh viên đang học lớp KSTN."},
    {id:"DXT-2025-03",name:"Xét tuyển bổ sung khóa 21",major:"Công nghệ thông tin",time:"01/09 - 08/09/2025",status:"done",label:"Đã kết thúc",desc:"Đợt bổ sung chỉ tiêu cho lớp CN/KSTN khóa 21."}
  ];
  const criteria = [["Số tín chỉ đạt","≥ 38","5 điểm"],["Số tín chỉ không đạt","0","5 điểm"],["GPA năm 2","≥ 3.6 / 3.4 / 3.2","50 / 40 / 30 điểm"],["Điểm rèn luyện","Trên 80","20 điểm"],["Năng lực ngoại ngữ","TOEIC ≥ 450","20 điểm"],["Nghiên cứu khoa học","Tối thiểu 1 thành tích","20 điểm"],["Ngoại ngữ ưu tiên","TOEIC ≥ 550","20 điểm"],["Cuộc thi chuyên ngành","Nhất / Nhì / Ba / Khuyến khích","40 / 30 / 20 / 10 điểm"]];
  const list = document.querySelector("#roundList");
  const render = filter => list.innerHTML = rounds.filter(r=>filter==="all"||r.status===filter).map(r=>`<div class="col-lg-4 col-md-6"><article class="round-card"><div class="d-flex justify-content-between gap-2"><span class="small text-primary fw-bold">${r.id}</span><span class="status status-${r.status}">${r.label}</span></div><h3 class="h5 fw-bold mt-3">${r.name}</h3><p class="small text-muted">${r.desc}</p><div class="round-meta"><span><i class="bi bi-building"></i>${r.major}</span><span><i class="bi bi-calendar3"></i>${r.time}</span></div><button class="btn ${r.status==="open"?"btn-primary":"btn-outline-secondary"} w-100 apply-btn" data-name="${r.name}" ${r.status!=="open"?"disabled":""}>${r.status==="open"?"Nộp hồ sơ ngay":"Không nhận hồ sơ"}</button></article></div>`).join("");
  render("all");
  document.querySelector("#roundFilter").addEventListener("change",e=>render(e.target.value));
  document.addEventListener("click",e=>{const b=e.target.closest(".apply-btn");if(!b)return;document.querySelector("#applyRoundName").textContent=b.dataset.name;bootstrap.Modal.getOrCreateInstance(document.querySelector("#applyModal")).show();});
  document.querySelector("#publicCriteria").innerHTML=criteria.map((r,i)=>`<div class="criteria-row"><strong>${i+1}. ${r[0]}</strong><span>${r[1]}</span><span class="badge-soft">${r[2]}</span></div>`).join("");
  const toast = msg => { const el=document.createElement("div");el.className="toast text-bg-success border-0";el.innerHTML=`<div class="d-flex"><div class="toast-body"><i class="bi bi-check-circle me-2"></i>${msg}</div><button class="btn-close btn-close-white m-auto me-2" data-bs-dismiss="toast"></button></div>`;document.querySelector("#toastContainer").append(el);bootstrap.Toast.getOrCreateInstance(el).show(); };
  document.querySelector("#loginForm").addEventListener("submit",e=>{e.preventDefault();location.href=document.querySelector("#demoRole").value;});
  document.querySelector("#applyForm").addEventListener("submit",e=>{e.preventDefault();bootstrap.Modal.getInstance(document.querySelector("#applyModal")).hide();toast("Hồ sơ đã được gửi. Kết quả sẽ được thông báo qua email.");e.target.reset();});
  document.querySelector("#sendOtp").addEventListener("click",()=>toast("Mã OTP dùng thử đã được gửi. Mã có hiệu lực trong 5 phút."));
})();

(() => {
  const rounds = [
    {id:"DXT-2026-01",name:"Xét tuyển KSTN khóa 22",major:"Khoa Công nghệ Thông tin",time:"01/08 - 15/08/2026",status:"open",label:"Đang mở",desc:"Dành cho sinh viên năm nhất chưa từng tham gia lớp KSTN."},
    {id:"DXT-2026-02",name:"Duy trì KSTN năm 3",major:"Kỹ thuật phần mềm",time:"10/08 - 25/08/2026",status:"review",label:"Đang xét duyệt",desc:"Cập nhật hồ sơ duy trì dành cho sinh viên đang học lớp KSTN."},
  ];
  const list = document.querySelector("#roundList");
  const render = () => list.innerHTML = rounds.map(r=>`<div class="col-lg-6"><article class="round-card"><div class="round-card-head"><span class="round-code">${r.id}</span><span class="status status-${r.status}">${r.label}</span></div><div class="round-card-content"><h3>${r.name}</h3><p>${r.desc}</p><div class="round-meta"><span><i class="bi bi-building"></i><span>${r.major}</span></span><span><i class="bi bi-calendar3"></i><span>${r.time}</span></span></div></div><div class="round-card-footer"><button class="btn btn-primary w-100 apply-btn" data-name="${r.name}">Nộp hồ sơ <i class="bi bi-arrow-right ms-2"></i></button></div></article></div>`).join("");
  render();
  document.addEventListener("click",e=>{const b=e.target.closest(".apply-btn");if(!b)return;document.querySelector("#applyRoundName").textContent=b.dataset.name;bootstrap.Modal.getOrCreateInstance(document.querySelector("#applyModal")).show();});
  const toast = msg => { const el=document.createElement("div");el.className="toast text-bg-success border-0";el.innerHTML=`<div class="d-flex"><div class="toast-body"><i class="bi bi-check-circle me-2"></i>${msg}</div><button class="btn-close btn-close-white m-auto me-2" data-bs-dismiss="toast"></button></div>`;document.querySelector("#toastContainer").append(el);bootstrap.Toast.getOrCreateInstance(el).show(); };
  document.querySelector("#loginForm").addEventListener("submit",e=>{e.preventDefault();location.href=document.querySelector("#demoRole").value;});
  document.querySelector("#applyForm").addEventListener("submit",e=>{e.preventDefault();bootstrap.Modal.getInstance(document.querySelector("#applyModal")).hide();toast("Hồ sơ đã được gửi. Kết quả sẽ được gửi qua email.");e.target.reset();});
  document.querySelector("#sendOtp").addEventListener("click",()=>toast("Mã OTP dùng thử đã được gửi. Mã có hiệu lực trong 5 phút."));
})();

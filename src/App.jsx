import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, Award, BookOpen, Building2, CalendarCheck, CalendarDays,
  CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ClipboardCheck,
  ClipboardList, Download, Eye, FileText, FolderOpen, GraduationCap, Info,
  KeyRound, LockKeyhole, LogIn, LogOut, Pencil, Plus, RotateCcw, Save, Search,
  Send, ShieldCheck, Trash2, User, UserCog, Users, X
} from "lucide-react";
import logo from "../assets/img/logo-iuh-khoa-cntt.svg";
import { createInitialClasses, createInitialMajors, criteriaRows, publicRounds, roles, roundRows, tableData } from "./data.js";

const menuIcons = {
  book: BookOpen, class: GraduationCap, teacher: UserCog, users: Users,
  permission: ShieldCheck, calendar: CalendarCheck, criteria: ClipboardList,
  folder: FolderOpen, approve: ClipboardCheck, award: Award, key: KeyRound,
  file: FileText, check: CheckCircle2
};

function Modal({open,onClose,title,description,children,size="md",footer}) {
  useEffect(()=>{
    if (!open) return;
    const onKey = event => event.key === "Escape" && onClose();
    document.addEventListener("keydown",onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown",onKey); document.body.style.overflow = previous; };
  },[open,onClose]);
  if (!open) return null;
  const widths = {sm:"max-w-sm",md:"max-w-lg",lg:"max-w-3xl",xl:"max-w-5xl"};
  return <div className="modal-backdrop fixed inset-0 z-50 grid place-items-center p-4" onMouseDown={onClose}>
    <section role="dialog" aria-modal="true" aria-labelledby="modal-title" className={`modal-panel max-h-[92vh] w-full ${widths[size]} overflow-hidden rounded-2xl bg-white`} onMouseDown={event=>event.stopPropagation()}>
      <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div><h2 id="modal-title" className="text-lg font-bold text-slate-900">{title}</h2>{description && <p className="mt-1 text-xs text-slate-500">{description}</p>}</div>
        <button type="button" className="ui-icon-btn shrink-0" onClick={onClose} aria-label="Đóng"><X size={17}/></button>
      </header>
      <div className="max-h-[calc(92vh-140px)] overflow-y-auto p-5 scrollbar-thin">{children}</div>
      {footer && <footer className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">{footer}</footer>}
    </section>
  </div>;
}

function Toast({message,onClose}) {
  useEffect(()=>{ if (!message) return; const id=setTimeout(onClose,2800); return()=>clearTimeout(id); },[message,onClose]);
  if (!message) return null;
  return <div className="toast-panel fixed bottom-5 right-5 z-[70] flex max-w-sm items-center gap-3 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-medium text-white">
    <CheckCircle2 size={18}/><span>{message}</span><button onClick={onClose} aria-label="Đóng"><X size={16}/></button>
  </div>;
}

function StatusBadge({children}) {
  const value = String(children).toLowerCase();
  const style = /hoạt động|đã duyệt|tiếp nhận|đạt|hoàn thành|đang mở/.test(value)
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : /chờ|đang xét|tuyển sinh|cần bổ sung/.test(value)
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : /từ chối|khóa|kết thúc/.test(value)
        ? "bg-rose-50 text-rose-700 ring-rose-200"
        : "bg-slate-100 text-slate-600 ring-slate-200";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${style}`}>{children}</span>;
}

function Pagination({page,totalPages,onChange,total}) {
  if (!total) return null;
  return <div className="flex justify-end border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
    <nav className="flex flex-wrap items-center gap-1" aria-label="Phân trang">
      <button className="ui-btn-secondary min-h-8 px-2.5 text-xs" disabled={page===1} onClick={()=>onChange(page-1)}><ChevronLeft size={14}/>Trước</button>
      {Array.from({length:totalPages},(_,i)=>i+1).map(number=><button key={number} aria-current={number===page?"page":undefined} className={`grid size-8 place-items-center rounded-lg text-xs font-semibold ${number===page?"bg-brand text-white":"border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`} onClick={()=>onChange(number)}>{number}</button>)}
      <button className="ui-btn-secondary min-h-8 px-2.5 text-xs" disabled={page===totalPages} onClick={()=>onChange(page+1)}>Sau<ChevronRight size={14}/></button>
    </nav>
  </div>;
}

function PublicHome() {
  const [loginOpen,setLoginOpen]=useState(false);
  const [applyRound,setApplyRound]=useState(null);
  const [forgot,setForgot]=useState(false);
  const [toast,setToast]=useState("");
  const login = event => { event.preventDefault(); window.location.href=new FormData(event.currentTarget).get("role"); };
  const submitApplication = event => { event.preventDefault(); setApplyRound(null); setToast("Hồ sơ đã được gửi. Kết quả sẽ được gửi qua email."); event.currentTarget.reset(); };
  return <div className="public-shell flex min-h-[100dvh] flex-col bg-white">
    <header className="public-header sticky top-0 z-30">
      <div className="public-header-inner mx-auto grid min-h-[88px] max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 md:grid-cols-[220px_minmax(0,1fr)_auto] md:px-6">
        <img src={logo} className="public-logo h-10 w-full max-w-[220px] object-contain object-left" alt="IUH - Khoa Công nghệ Thông tin"/>
        <p className="portal-title order-3 col-span-2 px-4 py-3 text-center font-display text-sm font-bold leading-relaxed text-brand md:order-none md:col-span-1 md:text-[clamp(14px,1.4vw,19px)]">Cổng thông tin xét tuyển chương trình Cử nhân tài năng và Kỹ sư tài năng</p>
        <button className="portal-login ui-btn-primary whitespace-nowrap" onClick={()=>setLoginOpen(true)}><LogIn size={17}/>Đăng nhập</button>
      </div>
    </header>
    <main className="public-main flex-1 px-4 py-14 md:px-6 md:py-20">
      <section className="public-rounds mx-auto max-w-6xl">
        <h1 className="public-section-title mb-9 text-center text-3xl font-semibold tracking-[-.04em] text-slate-900 md:text-4xl">Các đợt xét tuyển đang diễn ra</h1>
        <div className="public-round-grid grid gap-5 lg:grid-cols-2">{publicRounds.map(round=><article key={round.id} className="public-round-card ui-card flex min-h-[290px] flex-col overflow-hidden">
          <div className="round-card-head flex items-center justify-between border-b border-slate-100 px-6 py-4"><span className="font-mono text-xs font-bold tracking-wide text-brand">{round.id}</span><StatusBadge>{round.label}</StatusBadge></div>
          <div className="round-card-body flex-1 p-6"><h2 className="text-xl font-bold text-slate-900">{round.name}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{round.desc}</p><div className="round-card-meta mt-7 grid gap-3 text-sm text-slate-600"><span className="flex items-center gap-2"><Building2 size={17} className="text-brand"/>{round.major}</span><span className="flex items-center gap-2"><CalendarDays size={17} className="text-brand"/>{round.time}</span></div></div>
          <div className="p-5 pt-0"><button className="ui-btn-primary w-full" onClick={()=>setApplyRound(round)}>Nộp hồ sơ<ArrowRight size={17}/></button></div>
        </article>)}</div>
      </section>
    </main>
    <footer className="public-footer px-4 py-7 text-slate-300 md:px-6"><div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 text-sm"><div><strong className="text-white">Khoa Công nghệ Thông tin - IUH</strong><p className="mt-1 text-xs">12 Nguyễn Văn Bảo, Phường Hạnh Thông, TP. Hồ Chí Minh</p></div><p className="text-xs">Hỗ trợ: fit@iuh.edu.vn · (028) 3894 0390</p></div></footer>

    <Modal open={loginOpen} onClose={()=>setLoginOpen(false)} title="Đăng nhập hệ thống" description="Chọn vai trò để xem bản mô phỏng front-end." footer={null}>
      <form onSubmit={login} className="space-y-4"><label className="block"><span className="ui-label">Mã tài khoản / Email</span><input className="ui-input" defaultValue="demo@iuh.edu.vn" required/></label><label className="block"><span className="ui-label">Mật khẩu</span><input className="ui-input" type="password" defaultValue="12345678" required/></label><label className="block"><span className="ui-label">Vai trò dùng thử</span><select name="role" className="ui-input"><option value="sinh-vien.html">Sinh viên CN/KSTN</option><option value="giang-vien-phu-trach.html">Giảng viên phụ trách</option><option value="chu-nhiem-nganh.html">Chủ nhiệm ngành</option><option value="ban-lanh-dao-khoa.html">Ban lãnh đạo khoa</option><option value="dai-dien-phong-dao-tao.html">Đại diện Phòng Đào tạo</option><option value="quan-tri-vien.html">Quản trị viên</option></select></label><button type="button" className="text-sm font-semibold text-brand hover:underline" onClick={()=>setForgot(value=>!value)}>Quên mật khẩu?</button>{forgot&&<div className="rounded-xl bg-slate-50 p-4"><label className="ui-label">Email nhận mã OTP</label><div className="flex gap-2"><input className="ui-input" type="email" placeholder="email@iuh.edu.vn"/><button type="button" className="ui-btn-secondary shrink-0" onClick={()=>setToast("Mã OTP dùng thử đã được gửi. Mã có hiệu lực trong 5 phút.")}>Gửi mã</button></div></div>}<div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" className="ui-btn-secondary" onClick={()=>setLoginOpen(false)}>Hủy</button><button className="ui-btn-primary">Đăng nhập</button></div></form>
    </Modal>
    <Modal open={Boolean(applyRound)} onClose={()=>setApplyRound(null)} size="lg" title="Nộp hồ sơ xét tuyển" description={applyRound?.name}>
      <form onSubmit={submitApplication}><div className="mb-5 flex gap-2 rounded-xl bg-brand-soft p-3 text-xs leading-5 text-brand"><Info size={17} className="shrink-0"/>Nếu MSSV đã có tài khoản, hệ thống sẽ hướng dẫn bạn đăng nhập để cập nhật hồ sơ.</div><div className="grid gap-4 sm:grid-cols-2">{[["Họ và tên","text"],["Mã số sinh viên","text"],["Email","email"],["Số điện thoại","tel"],["GPA năm 2","number"],["Điểm TOEIC","number"]].map(([label,type])=><label key={label}><span className="ui-label">{label}</span><input className="ui-input" type={type} step={label.includes("GPA")?"0.01":undefined} required/></label>)}</div><label className="mt-4 block"><span className="ui-label">Tệp minh chứng tổng hợp (PDF, tối đa 5MB)</span><input className="ui-input py-2" type="file" accept=".pdf" required/></label><div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" className="ui-btn-secondary" onClick={()=>setApplyRound(null)}>Hủy</button><button className="ui-btn-primary"><Send size={16}/>Gửi hồ sơ</button></div></form>
    </Modal>
    <Toast message={toast} onClose={()=>setToast("")}/>
  </div>;
}

function PageHead({title,description,action}) {
  return <div className="page-head mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-semibold tracking-[-.035em] text-slate-900">{title}</h1><p className="mt-1 text-sm text-slate-500">{description}</p></div>{action}</div>;
}

function TableActions({readonly=false,onView,onEdit,onDelete}) {
  return <div className="flex justify-end gap-1.5"><button className="ui-icon-btn" title="Xem chi tiết" onClick={onView}><Eye size={15}/></button>{!readonly&&<><button className="ui-icon-btn" title="Chỉnh sửa" onClick={onEdit}><Pencil size={14}/></button><button className="ui-icon-btn hover:!border-rose-200 hover:!bg-rose-50 hover:!text-rose-600" title="Xóa" onClick={onDelete}><Trash2 size={14}/></button></>}</div>;
}

function DataTablePage({meta,onToast,onOpenForm}) {
  const [query,setQuery]=useState(""), [page,setPage]=useState(1);
  const rows=useMemo(()=>meta.rows.filter(row=>row.join(" ").toLowerCase().includes(query.toLowerCase())),[meta.rows,query]);
  const totalPages=Math.max(1,Math.ceil(rows.length/10));
  useEffect(()=>setPage(1),[query]);
  const visible=rows.slice((page-1)*10,page*10);
  const exportCsv=()=>{ const csv=[meta.columns,...rows].map(row=>row.map(value=>`"${String(value).replaceAll('"','""')}"`).join(",")).join("\r\n"); const url=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"})); const anchor=document.createElement("a"); anchor.href=url; anchor.download="du-lieu-iuh.csv"; anchor.click(); URL.revokeObjectURL(url); onToast("Đã xuất danh sách thành tệp CSV mở được bằng Excel."); };
  return <><PageHead title={meta.title} description={meta.desc} action={!meta.readonly&&<button className="ui-btn-primary" onClick={()=>onOpenForm("Thêm mới bản ghi")}><Plus size={16}/>Thêm mới</button>}/><section className="ui-card overflow-hidden"><div className="flex flex-wrap gap-2 p-4"><label className="relative min-w-[220px] flex-1 sm:max-w-sm"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input className="ui-input pl-9" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Tìm kiếm trong danh sách..."/></label><button className="ui-btn-secondary" onClick={exportCsv}><Download size={16}/>Xuất Excel</button></div><div className="overflow-x-auto"><table className="ui-table"><thead><tr>{meta.columns.map(column=><th key={column}>{column}</th>)}<th className="text-right">Thao tác</th></tr></thead><tbody>{visible.map(row=><tr key={row.join("-")} >{row.map((value,cell)=><td key={cell}>{cell===row.length-1?<StatusBadge>{value}</StatusBadge>:value}</td>)}<td><TableActions readonly={meta.readonly} onView={()=>onOpenForm("Chi tiết bản ghi",true)} onEdit={()=>onOpenForm("Chỉnh sửa bản ghi")} onDelete={()=>onToast("Đã xóa bản ghi khỏi danh sách.")}/></td></tr>)}</tbody></table></div><Pagination page={page} totalPages={totalPages} onChange={setPage} total={rows.length}/></section></>;
}

function MajorManagement({majors,setMajors,onToast}) {
  const [page,setPage]=useState(1), [modal,setModal]=useState(null), [query,setQuery]=useState(""), [facultyFilter,setFacultyFilter]=useState("");
  const faculties=useMemo(()=>[...new Set(majors.map(major=>major.faculty))].sort((a,b)=>a.localeCompare(b,"vi")),[majors]);
  const filteredMajors=useMemo(()=>{
    const keyword=query.trim().toLocaleLowerCase("vi");
    return majors.filter(major=>(!facultyFilter||major.faculty===facultyFilter)&&(!keyword||`${major.faculty} ${major.name}`.toLocaleLowerCase("vi").includes(keyword)));
  },[majors,query,facultyFilter]);
  const totalPages=Math.max(1,Math.ceil(filteredMajors.length/10));
  const visible=filteredMajors.slice((page-1)*10,page*10);
  useEffect(()=>setPage(1),[query,facultyFilter]);
  useEffect(()=>{ if(page>totalPages)setPage(totalPages); },[page,totalPages]);
  const saveMajor=event=>{ event.preventDefault(); const values=Object.fromEntries(new FormData(event.currentTarget)); const faculty=values.faculty.trim().replace(/\s+/g," "), name=values.name.trim().replace(/\s+/g," "); const normalize=value=>value.toLocaleLowerCase("vi"); const duplicate=majors.some(item=>item.id!==modal.id&&normalize(item.faculty)===normalize(faculty)&&normalize(item.name)===normalize(name)); if(duplicate){setModal({...modal,type:"duplicate",draft:{faculty,name}});return;} if(modal.id){setMajors(list=>list.map(item=>item.id===modal.id?{...item,faculty,name}:item));onToast("Đã cập nhật thông tin chuyên ngành.");}else{const id=Math.max(0,...majors.map(item=>item.id))+1;setMajors(list=>[...list,{id,faculty,name,classes:[]}]);setPage(Math.ceil((majors.length+1)/10));onToast("Đã thêm chuyên ngành mới.");}setModal(null); };
  const requestDelete=major=>setModal(major.classes.length?{type:"blocked",major}:{type:"confirmDelete",major});
  const removeMajor=()=>{setMajors(list=>list.filter(item=>item.id!==modal.major.id));setModal(null);onToast("Đã xóa chuyên ngành khỏi danh sách.");};
  const formModal=modal?.type==="form";
  return <><section className="ui-card overflow-hidden"><div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/60 p-4 lg:flex-row lg:items-center lg:justify-between"><button className="ui-btn-primary shrink-0" onClick={()=>setModal({type:"form",id:null,faculty:"",name:""})}><Plus size={16}/>Thêm chuyên ngành mới</button><div className="flex flex-1 flex-col gap-3 sm:flex-row lg:max-w-3xl lg:justify-end"><label className="relative block flex-1 lg:max-w-md"><span className="sr-only">Tìm kiếm</span><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input className="ui-input pl-9" aria-label="Tìm kiếm theo khoa hoặc chuyên ngành" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Tìm theo khoa hoặc chuyên ngành..."/></label><label className="block sm:w-72"><span className="sr-only">Khoa</span><select className="ui-input" aria-label="Lọc theo khoa" value={facultyFilter} onChange={event=>setFacultyFilter(event.target.value)}><option value="">Tất cả khoa</option>{faculties.map(faculty=><option key={faculty} value={faculty}>{faculty}</option>)}</select></label>{(query||facultyFilter)&&<button type="button" className="ui-btn-secondary shrink-0" onClick={()=>{setQuery("");setFacultyFilter("");}}><RotateCcw size={16}/>Đặt lại</button>}</div></div><div className="overflow-x-auto"><table className="ui-table"><thead><tr><th className="w-[39%]">Khoa</th><th className="w-[39%]">Chuyên ngành</th><th className="text-center">Số lượng lớp</th><th className="text-right">Thao tác</th></tr></thead><tbody>{visible.map(major=><tr key={major.id}><td>{major.faculty}</td><td className="font-semibold text-slate-800">{major.name}</td><td className="text-center"><span className="inline-grid min-w-8 place-items-center rounded-full bg-brand-soft px-2 py-1 text-xs font-bold text-brand">{major.classes.length}</span></td><td><TableActions onView={()=>setModal({type:"detail",major})} onEdit={()=>setModal({type:"form",id:major.id,faculty:major.faculty,name:major.name})} onDelete={()=>requestDelete(major)}/></td></tr>)}{!visible.length&&<tr><td colSpan="4"><div className="grid min-h-40 place-items-center text-center"><div><Search className="mx-auto text-slate-400"/><strong className="mt-3 block text-sm text-slate-700">Không tìm thấy chuyên ngành phù hợp</strong><span className="mt-1 block text-xs text-slate-500">Hãy thử thay đổi từ khóa hoặc khoa đang chọn.</span></div></div></td></tr>}</tbody></table></div><Pagination page={page} totalPages={totalPages} onChange={setPage} total={filteredMajors.length}/></section>
    <Modal open={formModal} onClose={()=>setModal(null)} title={modal?.id?"Cập nhật chuyên ngành":"Thêm chuyên ngành mới"} footer={null}><form onSubmit={saveMajor} className="space-y-4"><label className="block"><span className="ui-label">Tên khoa <b className="text-rose-600">*</b></span><input name="faculty" className="ui-input" defaultValue={modal?.faculty} placeholder="Ví dụ: Khoa Công nghệ Thông tin" required/></label><label className="block"><span className="ui-label">Tên chuyên ngành <b className="text-rose-600">*</b></span><input name="name" className="ui-input" defaultValue={modal?.name} placeholder="Ví dụ: Kỹ thuật phần mềm" required/></label><p className="flex gap-2 text-xs leading-5 text-slate-500"><Info size={15} className="shrink-0"/>Mỗi chuyên ngành được xác định duy nhất bởi tên khoa và tên chuyên ngành.</p><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" className="ui-btn-secondary" onClick={()=>setModal(null)}>Hủy</button><button className="ui-btn-primary">Lưu thông tin</button></div></form></Modal>
    <Modal open={modal?.type==="duplicate"} onClose={()=>setModal(null)} size="sm" title="Chuyên ngành đã tồn tại"><div className="text-center"><div className="mx-auto grid size-12 place-items-center rounded-full bg-amber-50 text-amber-600"><Info/></div><p className="mt-4 text-sm leading-6 text-slate-600">Đã có chuyên ngành <b>{modal?.draft?.name}</b> thuộc <b>{modal?.draft?.faculty}</b> được tạo trước đó.</p><button className="ui-btn-primary mt-5 w-full" onClick={()=>setModal({...modal,type:"form",faculty:modal.draft.faculty,name:modal.draft.name})}>Quay lại kiểm tra</button></div></Modal>
    <Modal open={modal?.type==="detail"} onClose={()=>setModal(null)} size="lg" title={`Danh sách lớp — ${modal?.major?.name || ""}`}><div className="mb-4 grid gap-3 sm:grid-cols-[1fr_130px]"><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] font-bold uppercase text-slate-400">Khoa</span><strong className="mt-1 block text-sm">{modal?.major?.faculty}</strong></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] font-bold uppercase text-slate-400">Số lượng lớp</span><strong className="mt-1 block text-sm">{modal?.major?.classes.length}</strong></div></div>{modal?.major?.classes.length?<div className="overflow-x-auto rounded-xl border border-slate-200"><table className="ui-table min-w-[600px]"><thead><tr><th>Mã lớp</th><th>Khóa</th><th>Năm học</th><th>Trạng thái</th></tr></thead><tbody>{modal.major.classes.map(item=><tr key={item.code}><td className="font-semibold">{item.code}</td><td>{item.cohort}</td><td>{item.academicYear}</td><td><StatusBadge>{item.status}</StatusBadge></td></tr>)}</tbody></table></div>:<div className="grid min-h-44 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center"><div><GraduationCap className="mx-auto text-slate-400"/><strong className="mt-2 block text-sm">Chưa có lớp CN/KSTN</strong><span className="text-xs text-slate-500">Chuyên ngành này hiện chưa được tạo lớp cho bất kỳ khóa nào.</span></div></div>}</Modal>
    <Modal open={modal?.type==="blocked"} onClose={()=>setModal(null)} size="sm" title="Không thể xóa chuyên ngành"><div className="text-center"><div className="mx-auto grid size-12 place-items-center rounded-full bg-amber-50 text-amber-600"><Info/></div><p className="mt-4 text-sm leading-6 text-slate-600">Chuyên ngành <b>{modal?.major?.name}</b> đang có <b>{modal?.major?.classes.length} lớp</b>. Hãy xóa các lớp trực thuộc trước.</p><button className="ui-btn-secondary mt-5 w-full" onClick={()=>setModal(null)}>Đã hiểu</button></div></Modal>
    <Modal open={modal?.type==="confirmDelete"} onClose={()=>setModal(null)} size="sm" title="Xác nhận xóa chuyên ngành"><div className="text-center"><div className="mx-auto grid size-12 place-items-center rounded-full bg-rose-50 text-rose-600"><Trash2/></div><p className="mt-4 text-sm leading-6 text-slate-600">Bạn có chắc muốn xóa <b>{modal?.major?.name}</b>? Thao tác này không thể hoàn tác.</p><div className="mt-5 flex gap-2"><button className="ui-btn-secondary flex-1" onClick={()=>setModal(null)}>Hủy</button><button className="ui-btn flex-1 bg-rose-600 text-white hover:bg-rose-700" onClick={removeMajor}>Xóa chuyên ngành</button></div></div></Modal>
  </>;
}

function ClassManagement({classes,setClasses,majors,onToast}) {
  const [page,setPage]=useState(1);
  const [modal,setModal]=useState(null);
  const [query,setQuery]=useState("");
  const [majorFilter,setMajorFilter]=useState("");
  const majorOptions=useMemo(()=>[...new Set(majors.map(major=>major.name))].sort((a,b)=>a.localeCompare(b,"vi")),[majors]);
  const filteredClasses=useMemo(()=>{
    const keyword=query.trim().toLocaleLowerCase("vi");
    return classes.filter(item=>(!majorFilter||item.major===majorFilter)&&(!keyword||`${item.major} ${item.cohort} ${item.lecturer}`.toLocaleLowerCase("vi").includes(keyword)));
  },[classes,query,majorFilter]);
  const totalPages=Math.max(1,Math.ceil(filteredClasses.length/10));
  const visible=filteredClasses.slice((page-1)*10,page*10);
  useEffect(()=>setPage(1),[query,majorFilter]);
  useEffect(()=>{if(page>totalPages)setPage(totalPages);},[page,totalPages]);

  const openCreate=()=>setModal({type:"form",id:null,major:majorOptions[0]||"",cohort:"22",lecturer:"",current:0,capacity:30});
  const openEdit=item=>setModal({type:"form",...item});
  const saveClass=event=>{
    event.preventDefault();
    const values=Object.fromEntries(new FormData(event.currentTarget));
    const major=values.major;
    const cohort=values.cohort.trim();
    const lecturer=values.lecturer.trim().replace(/\s+/g," ");
    const current=Number(values.current);
    const capacity=Number(values.capacity);
    if(current>capacity){onToast("Sĩ số hiện tại không được lớn hơn sĩ số tối đa.");return;}
    const duplicate=classes.some(item=>item.id!==modal.id&&item.major===major&&item.cohort===cohort);
    if(duplicate){onToast("Ngành này đã có lớp thuộc khóa đã chọn.");return;}
    if(modal.id){
      setClasses(list=>list.map(item=>item.id===modal.id?{...item,major,cohort,lecturer,current,capacity}:item));
      onToast("Đã cập nhật thông tin lớp.");
    }else{
      const id=Math.max(0,...classes.map(item=>item.id))+1;
      setClasses(list=>[...list,{id,major,cohort,lecturer,current,capacity,status:"Chưa mở",admissionRound:null,students:[]}]);
      onToast("Đã thêm lớp mới.");
    }
    setModal(null);
  };
  const requestDelete=item=>setModal(item.admissionRound?.opened?{type:"blocked",item}:{type:"confirmDelete",item});
  const removeClass=()=>{
    setClasses(list=>list.filter(item=>item.id!==modal.item.id));
    setModal(null);
    onToast("Đã xóa lớp khỏi danh sách.");
  };
  const detail=modal?.item;

  return <>
    <section className="ui-card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/60 p-4 lg:flex-row lg:items-center lg:justify-between">
        <button className="ui-btn-primary shrink-0" onClick={openCreate}><Plus size={16}/>Thêm lớp mới</button>
        <div className="flex flex-1 flex-col gap-3 sm:flex-row lg:max-w-3xl lg:justify-end">
          <label className="relative block flex-1 lg:max-w-md"><span className="sr-only">Tìm kiếm</span><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input className="ui-input pl-9" aria-label="Tìm kiếm lớp" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Tìm theo ngành, khóa hoặc giảng viên..."/></label>
          <label className="block sm:w-72"><span className="sr-only">Ngành</span><select className="ui-input" aria-label="Lọc theo ngành" value={majorFilter} onChange={event=>setMajorFilter(event.target.value)}><option value="">Tất cả ngành</option>{majorOptions.map(major=><option key={major} value={major}>{major}</option>)}</select></label>
          {(query||majorFilter)&&<button type="button" className="ui-btn-secondary shrink-0" onClick={()=>{setQuery("");setMajorFilter("");}}><RotateCcw size={16}/>Đặt lại</button>}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="ui-table">
          <thead><tr><th className="w-[28%]">Ngành</th><th>Khóa</th><th className="w-[27%]">Giảng viên phụ trách</th><th className="text-center">Sĩ số</th><th className="text-right">Thao tác</th></tr></thead>
          <tbody>
            {visible.map(item=><tr key={item.id}><td className="font-semibold text-slate-800">{item.major}</td><td><span className="inline-grid min-w-8 place-items-center rounded-full bg-brand-soft px-2 py-1 text-xs font-bold text-brand">{item.cohort}</span></td><td>{item.lecturer}</td><td className="text-center font-semibold text-slate-700">{item.current}/{item.capacity}</td><td><TableActions onView={()=>setModal({type:"detail",item})} onEdit={()=>openEdit(item)} onDelete={()=>requestDelete(item)}/></td></tr>)}
            {!visible.length&&<tr><td colSpan="5"><div className="grid min-h-40 place-items-center text-center"><div><Search className="mx-auto text-slate-400"/><strong className="mt-3 block text-sm text-slate-700">Không tìm thấy lớp phù hợp</strong><span className="mt-1 block text-xs text-slate-500">Hãy thử thay đổi từ khóa hoặc ngành đang chọn.</span></div></div></td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} total={filteredClasses.length}/>
    </section>

    <Modal open={modal?.type==="form"} onClose={()=>setModal(null)} title={modal?.id?"Cập nhật lớp":"Thêm lớp mới"}>
      <form onSubmit={saveClass} className="space-y-4">
        <label className="block"><span className="ui-label">Ngành <b className="text-rose-600">*</b></span><select name="major" className="ui-input" defaultValue={modal?.major} required>{majorOptions.map(major=><option key={major} value={major}>{major}</option>)}</select></label>
        <div className="grid gap-4 sm:grid-cols-2"><label><span className="ui-label">Khóa <b className="text-rose-600">*</b></span><input name="cohort" className="ui-input" type="number" min="1" max="99" defaultValue={modal?.cohort} required/></label><label><span className="ui-label">Giảng viên phụ trách <b className="text-rose-600">*</b></span><input name="lecturer" className="ui-input" defaultValue={modal?.lecturer} placeholder="Nhập họ tên giảng viên" required/></label></div>
        <div className="grid gap-4 sm:grid-cols-2"><label><span className="ui-label">Sĩ số hiện tại <b className="text-rose-600">*</b></span><input name="current" className="ui-input" type="number" min="0" defaultValue={modal?.current} required/></label><label><span className="ui-label">Sĩ số tối đa <b className="text-rose-600">*</b></span><input name="capacity" className="ui-input" type="number" min="1" defaultValue={modal?.capacity} required/></label></div>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" className="ui-btn-secondary" onClick={()=>setModal(null)}>Hủy</button><button className="ui-btn-primary">Lưu thông tin</button></div>
      </form>
    </Modal>

    <Modal open={modal?.type==="detail"} onClose={()=>setModal(null)} size="xl" title={`Thông tin lớp khóa ${detail?.cohort||""}`} description={detail?.major}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[['Ngành',detail?.major],['Khóa',detail?.cohort],['Giảng viên phụ trách',detail?.lecturer],['Sĩ số',detail?`${detail.current}/${detail.capacity}`:""],['Trạng thái',detail?.status]].map(([label,value],index)=><div key={label} className={`rounded-xl border border-slate-200 bg-slate-50 p-3 ${index===0?'sm:col-span-2 lg:col-span-1':''}`}><span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</span>{label==='Trạng thái'?<div className="mt-1"><StatusBadge>{value}</StatusBadge></div>:<strong className="mt-1 block text-sm text-slate-800">{value}</strong>}</div>)}
      </div>
      <div className="mt-5"><h3 className="mb-3 text-sm font-bold text-slate-800">Danh sách sinh viên</h3>{detail?.admissionRound?.opened?(detail.students.length?<div className="overflow-x-auto rounded-xl border border-slate-200"><table className="ui-table min-w-[680px]"><thead><tr><th>MSSV</th><th>Họ và tên</th><th>Email</th><th>Trạng thái</th></tr></thead><tbody>{detail.students.map(student=><tr key={student.id}><td className="font-semibold">{student.id}</td><td>{student.name}</td><td>{student.email}</td><td><StatusBadge>{student.status}</StatusBadge></td></tr>)}</tbody></table></div>:<div className="grid min-h-36 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center"><div><Users className="mx-auto text-slate-400"/><strong className="mt-2 block text-sm">Chưa có sinh viên trong lớp</strong><span className="text-xs text-slate-500">Danh sách sẽ được cập nhật sau khi có kết quả chính thức.</span></div></div>):<div className="grid min-h-36 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center"><div><LockKeyhole className="mx-auto text-slate-400"/><strong className="mt-2 block text-sm">Lớp chưa chính thức được mở</strong><span className="text-xs text-slate-500">Danh sách sinh viên sẽ hiển thị khi đợt xét tuyển của lớp được mở.</span></div></div>}</div>
    </Modal>

    <Modal open={modal?.type==="blocked"} onClose={()=>setModal(null)} size="sm" title="Không thể xóa lớp"><div className="text-center"><div className="mx-auto grid size-12 place-items-center rounded-full bg-amber-50 text-amber-600"><Info/></div><p className="mt-4 text-sm leading-6 text-slate-600">Lớp thuộc ngành <b>{modal?.item?.major}</b>, khóa <b>{modal?.item?.cohort}</b> đã được gắn với đợt xét tuyển <b>{modal?.item?.admissionRound?.code}</b> và đợt này đã mở nên không thể xóa.</p><button className="ui-btn-secondary mt-5 w-full" onClick={()=>setModal(null)}>Đã hiểu</button></div></Modal>
    <Modal open={modal?.type==="confirmDelete"} onClose={()=>setModal(null)} size="sm" title="Xác nhận xóa lớp"><div className="text-center"><div className="mx-auto grid size-12 place-items-center rounded-full bg-rose-50 text-rose-600"><Trash2/></div><p className="mt-4 text-sm leading-6 text-slate-600">Bạn có chắc muốn xóa lớp thuộc ngành <b>{modal?.item?.major}</b>, khóa <b>{modal?.item?.cohort}</b>? Thao tác này không thể hoàn tác.</p><div className="mt-5 flex gap-2"><button className="ui-btn-secondary flex-1" onClick={()=>setModal(null)}>Hủy</button><button className="ui-btn flex-1 bg-rose-600 text-white hover:bg-rose-700" onClick={removeClass}>Xóa lớp</button></div></div></Modal>
  </>;
}

function RoundsPage({readonly,onToast,onOpenForm}) {
  return <><PageHead title={readonly?"Thông tin đợt xét tuyển":"Quản lý đợt xét tuyển"} description="Mỗi đợt gồm các giai đoạn tiếp nhận hồ sơ, xét duyệt và công bố kết quả." action={!readonly&&<button className="ui-btn-primary" onClick={()=>onOpenForm("Tạo đợt xét tuyển")}><Plus size={16}/>Tạo đợt xét tuyển</button>}/><section className="ui-card overflow-hidden"><div className="overflow-x-auto"><table className="ui-table"><thead><tr>{["Mã đợt","Tên đợt","Đơn vị","Thời gian","Trạng thái"].map(item=><th key={item}>{item}</th>)}<th className="text-right">Thao tác</th></tr></thead><tbody>{roundRows.map(row=><tr key={row[0]}>{row.map((value,index)=><td key={value}>{index===4?<StatusBadge>{value}</StatusBadge>:value}</td>)}<td><TableActions readonly={readonly} onView={()=>onOpenForm("Chi tiết đợt xét tuyển",true)} onEdit={()=>onOpenForm("Chỉnh sửa đợt xét tuyển")} onDelete={()=>onToast("Đã xóa đợt xét tuyển.")}/></td></tr>)}</tbody></table></div><Pagination page={1} totalPages={1} onChange={()=>{}} total={roundRows.length}/></section></>;
}

function CriteriaPage({onOpenForm}) { return <><PageHead title="Cấu hình bộ tiêu chí xét tuyển" description="Thiết lập điều kiện, mức đánh giá, điểm và thứ tự xét hòa." action={<button className="ui-btn-primary" onClick={()=>onOpenForm("Thêm tiêu chí")}><Plus size={16}/>Thêm tiêu chí</button>}/><section className="ui-card overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 p-4"><h2 className="text-sm font-bold">Bộ tiêu chí KSTN năm học 2026 - 2027</h2><StatusBadge>Đang áp dụng</StatusBadge></div><div className="overflow-x-auto"><table className="ui-table"><thead><tr>{["Loại","Tên tiêu chí","Mức đánh giá","Điểm","Thứ tự xét hòa",""].map(item=><th key={item}>{item}</th>)}</tr></thead><tbody>{criteriaRows.map(row=><tr key={row[1]}>{row.map((value,i)=><td key={i}>{i===0?<StatusBadge>{value}</StatusBadge>:value}</td>)}<td className="text-right"><button className="ui-icon-btn" onClick={()=>onOpenForm("Chỉnh sửa tiêu chí")}><Pencil size={14}/></button></td></tr>)}</tbody></table></div><Pagination page={1} totalPages={1} onChange={()=>{}} total={criteriaRows.length}/></section></>; }

function ApprovalsPage({final,roleKey,onToast}) {
  const source=tableData.profiles.rows.filter(row=>final?row[5]==="Đã duyệt":row[5]!=="Đã duyệt");
  const title=final?(roleKey==="head"?"Xác nhận danh sách trúng tuyển":"Duyệt danh sách trúng tuyển"):"Phê duyệt hồ sơ xét tuyển";
  return <><PageHead title={title} description={final?"Kiểm tra và phê duyệt danh sách trước khi công bố chính thức.":"Duyệt hoặc từ chối hồ sơ trong phạm vi được phân quyền."}/><section className="ui-card overflow-hidden"><div className="overflow-x-auto"><table className="ui-table"><thead><tr>{["MSSV","Họ tên","Lớp","Loại hồ sơ","Tổng điểm","Trạng thái","Quyết định"].map(item=><th key={item}>{item}</th>)}</tr></thead><tbody>{source.map(row=><tr key={row[0]}>{row.map((value,i)=><td key={i}>{i===5?<StatusBadge>{value}</StatusBadge>:value}</td>)}<td><div className="flex justify-end gap-1"><button className="ui-btn-secondary min-h-8 px-2 text-xs">Chi tiết</button><button className="ui-btn min-h-8 bg-emerald-600 px-2 text-xs text-white" onClick={()=>onToast(final?"Đã xác nhận hồ sơ sinh viên.":"Đã phê duyệt hồ sơ sinh viên.")}>{final?"Xác nhận":"Duyệt"}</button><button className="ui-btn min-h-8 border border-rose-200 bg-white px-2 text-xs text-rose-600" onClick={()=>onToast("Đã từ chối hồ sơ và lưu lý do.")}>Từ chối</button></div></td></tr>)}</tbody></table></div></section></>;
}

function ApplicationPage({onToast}) { return <><PageHead title="Cập nhật hồ sơ xét tuyển duy trì" description="Đợt duy trì KSTN năm 3 - hạn cập nhật 25/08/2026" action={<button className="ui-btn-secondary" onClick={()=>onToast("Đã lưu bản nháp trên thiết bị.")}><Save size={16}/>Lưu nháp</button>}/><div className="mb-4 grid gap-2 md:grid-cols-3">{[["1. Thông tin cá nhân","Đã xác nhận","done"],["2. Tiêu chí & minh chứng","Đang cập nhật","current"],["3. Gửi phê duyệt","Chưa gửi",""]].map(([title,label,state])=><div key={title} className={`rounded-xl border p-4 ${state==="current"?"border-brand bg-brand-soft":state==="done"?"border-emerald-200 bg-emerald-50":"border-slate-200 bg-white"}`}><strong className="text-sm">{title}</strong><span className="mt-1 block text-xs text-slate-500">{label}</span></div>)}</div><section className="ui-card p-5"><h2 className="mb-5 text-sm font-bold">Thông tin tiêu chí xét tuyển</h2><form onSubmit={event=>{event.preventDefault();onToast("Hồ sơ đã được cập nhật và chuyển sang chờ phê duyệt.");}}><div className="grid gap-4 md:grid-cols-2">{[["Số tín chỉ đạt","42"],["Số tín chỉ không đạt","0"],["GPA năm 2","3.54"],["Điểm rèn luyện trung bình","92"],["Điểm TOEIC","610"]].map(([label,value])=><label key={label}><span className="ui-label">{label}</span><input className="ui-input" type="number" step={label.includes("GPA")?"0.01":undefined} defaultValue={value}/></label>)}<label><span className="ui-label">Thành tích chuyên ngành</span><select className="ui-input" defaultValue="Giải Ba"><option>Không có</option><option>Giải Ba</option><option>Giải Nhì</option><option>Giải Nhất</option></select></label></div><div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-2"><label><span className="ui-label">Bảng điểm / kết quả học tập</span><input className="ui-input py-2" type="file" accept=".pdf,image/*"/></label><label><span className="ui-label">Chứng chỉ ngoại ngữ</span><input className="ui-input py-2" type="file" accept=".pdf,image/*"/></label></div><div className="mt-5 flex justify-end"><button className="ui-btn-primary"><Send size={16}/>Cập nhật và gửi phê duyệt</button></div></form></section></>; }

function PasswordPage({onToast}) { const rows=tableData.students.rows; return <><PageHead title="Đặt lại mật khẩu sinh viên" description="Tạo mật khẩu mặc định mới và yêu cầu sinh viên đổi ở lần đăng nhập kế tiếp."/><section className="ui-card overflow-hidden"><div className="overflow-x-auto"><table className="ui-table"><thead><tr>{["MSSV","Họ tên","Lớp","Email","Thao tác"].map(item=><th key={item}>{item}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row[0]}>{row.slice(0,4).map(value=><td key={value}>{value}</td>)}<td className="text-right"><button className="ui-btn-secondary min-h-8 px-2 text-xs" onClick={()=>onToast("Đã tạo mật khẩu mặc định và yêu cầu đổi ở lần đăng nhập sau.")}>Đặt lại mật khẩu</button></td></tr>)}</tbody></table></div></section></>; }

function ProfilePage({role,roleKey,onToast}) { return <><PageHead title="Thông tin cá nhân" description="Thông tin hồ sơ tài khoản đang đăng nhập."/><section className="ui-card p-5"><div className="grid gap-6 lg:grid-cols-[240px_1fr]"><div className="rounded-xl bg-slate-50 p-6 text-center"><div className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand text-lg font-bold text-white">{role.initials}</div><h2 className="mt-4 font-bold">{role.name}</h2><p className="mt-1 text-xs text-slate-500">{role.label}</p><div className="mt-3"><StatusBadge>Tài khoản hoạt động</StatusBadge></div></div><form onSubmit={event=>{event.preventDefault();onToast("Đã cập nhật thông tin cá nhân.");}}><div className="grid gap-4 md:grid-cols-2">{[["Họ và tên",role.name],["Mã tài khoản",roleKey==="student"?"21094501":"GV00128"],["Email",roleKey==="student"?"nam.21094501@iuh.edu.vn":"account@iuh.edu.vn"],["Số điện thoại","090 123 4567"],["Ngày sinh","12/10/2003"],["Đơn vị / Lớp",roleKey==="student"?"KSTN-K20":"Khoa Công nghệ Thông tin"]].map(([label,value])=><label key={label}><span className="ui-label">{label}</span><input className="ui-input" defaultValue={value}/></label>)}</div><div className="mt-5 flex justify-end"><button className="ui-btn-primary">Lưu thay đổi</button></div></form></div></section></>; }

function GenericFormModal({dialog,setDialog,onToast}) {
  if(!dialog)return null;
  if(dialog.readonly)return <Modal open onClose={()=>setDialog(null)} title={dialog.title}><div className="grid min-h-40 place-items-center text-center"><div><Eye className="mx-auto text-brand"/><p className="mt-3 text-sm text-slate-600">Đã mở chế độ xem chi tiết. Dữ liệu hiện đang được mô phỏng ở front-end.</p></div></div></Modal>;
  return <Modal open onClose={()=>setDialog(null)} title={dialog.title}><form onSubmit={event=>{event.preventDefault();setDialog(null);onToast("Đã lưu thông tin thành công.");}} className="space-y-4"><label className="block"><span className="ui-label">Mã / Định danh</span><input className="ui-input" defaultValue="IUH-2026-01" required/></label><label className="block"><span className="ui-label">Tên hiển thị</span><input className="ui-input" defaultValue="Thông tin mẫu" required/></label><div className="grid gap-4 sm:grid-cols-2"><label><span className="ui-label">Trạng thái</span><select className="ui-input"><option>Đang hoạt động</option><option>Chờ duyệt</option></select></label><label><span className="ui-label">Đơn vị</span><select className="ui-input"><option>Khoa CNTT</option><option>Toàn trường</option></select></label></div><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" className="ui-btn-secondary" onClick={()=>setDialog(null)}>Hủy</button><button className="ui-btn-primary">Lưu thông tin</button></div></form></Modal>;
}

function Dashboard({roleKey}) {
  const role=roles[roleKey] || roles.admin;
  const [active,setActive]=useState(role.menus[0][0]);
  const [majors,setMajors]=useState(createInitialMajors);
  const [classRecords,setClassRecords]=useState(createInitialClasses);
  const [accountOpen,setAccountOpen]=useState(false);
  const [passwordOpen,setPasswordOpen]=useState(false);
  const [dialog,setDialog]=useState(null);
  const [toast,setToast]=useState("");
  const openForm=(title,readonly=false)=>setDialog({title,readonly});
  const renderPage=()=>{
    if(active==="majors")return <MajorManagement majors={majors} setMajors={setMajors} onToast={setToast}/>;
    if(active==="classes")return <ClassManagement classes={classRecords} setClasses={setClassRecords} majors={majors} onToast={setToast}/>;
    if(tableData[active])return <DataTablePage meta={tableData[active]} onToast={setToast} onOpenForm={openForm}/>;
    if(active==="rounds"||active==="roundsView")return <RoundsPage readonly={active==="roundsView"} onToast={setToast} onOpenForm={openForm}/>;
    if(active==="criteria")return <CriteriaPage onOpenForm={openForm}/>;
    if(active==="approvals")return <ApprovalsPage final={false} roleKey={roleKey} onToast={setToast}/>;
    if(active==="results"||active==="finalApproval")return <ApprovalsPage final roleKey={roleKey} onToast={setToast}/>;
    if(active==="application")return <ApplicationPage onToast={setToast}/>;
    if(active==="studentPasswords")return <PasswordPage onToast={setToast}/>;
    if(active==="profile")return <ProfilePage role={role} roleKey={roleKey} onToast={setToast}/>;
    return null;
  };
  const NavButton=({item,mobile=false})=>{const [id,label,icon]=item, Icon=menuIcons[icon]||BookOpen; return <button onClick={()=>{setActive(id);setAccountOpen(false);}} className={`dashboard-nav-item ${mobile?"shrink-0":"w-full"} flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition ${active===id?mobile?"is-active-mobile bg-white text-brand":"is-active bg-slate-700 text-white":"text-slate-400 hover:bg-slate-800 hover:text-white"}`}><Icon size={17}/><span>{label}</span></button>;};
  return <div className="dashboard-shell flex h-[100dvh] overflow-hidden bg-slate-50">
    <aside className="dashboard-sidebar hidden w-64 shrink-0 flex-col border-r border-white/10 lg:flex"><div className="dashboard-logo-panel flex h-[72px] items-center bg-white px-4"><img src={logo} alt="IUH - Khoa Công nghệ Thông tin" className="h-11 w-full object-contain"/></div><div className="sidebar-role px-4 pb-2 pt-5 text-[10px] font-bold uppercase tracking-[.12em] text-slate-500">{role.label}</div><nav className="sidebar-nav flex-1 space-y-1 overflow-y-auto px-3 pb-5 scrollbar-thin">{role.menus.map(item=><NavButton key={item[0]} item={item}/>)}</nav></aside>
    <div className="flex min-w-0 flex-1 flex-col"><header className="dashboard-topbar flex h-[72px] shrink-0 items-center justify-end px-4 md:px-6"><div className="relative"><button className="account-trigger flex items-center gap-2 rounded-xl p-1.5 text-left transition" onClick={()=>setAccountOpen(value=>!value)}><span className="grid size-9 place-items-center rounded-lg bg-brand text-xs font-bold text-white">{role.initials}</span><span className="hidden sm:block"><strong className="block text-xs text-slate-800">{role.name}</strong><small className="text-[11px] text-slate-500">{role.label}</small></span><ChevronDown size={15} className="text-slate-400"/></button>{accountOpen&&<div className="account-menu absolute right-0 top-[calc(100%+8px)] z-40 w-56 rounded-xl border border-slate-200 bg-white p-2 text-sm"><button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50" onClick={()=>{setActive("profile");setAccountOpen(false);}}><User size={16}/>Thông tin cá nhân</button><button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50" onClick={()=>{setPasswordOpen(true);setAccountOpen(false);}}><LockKeyhole size={16}/>Đổi mật khẩu</button><button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50" onClick={()=>{setToast("Đã gửi hướng dẫn khôi phục mật khẩu đến email tài khoản.");setAccountOpen(false);}}><RotateCcw size={16}/>Khôi phục mật khẩu</button><div className="my-1 border-t border-slate-100"/><a href="index.html" className="flex items-center gap-2 rounded-lg px-3 py-2 text-rose-600 hover:bg-rose-50"><LogOut size={16}/>Đăng xuất</a></div>}</div></header>
      <nav className="dashboard-mobile-nav flex shrink-0 gap-1 overflow-x-auto p-2 lg:hidden scrollbar-thin">{role.menus.map(item=><NavButton key={item[0]} item={item} mobile/>)}</nav>
      <main className="dashboard-workspace min-h-0 flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin"><div className="workspace-inner mx-auto max-w-[1440px]">{renderPage()}</div></main>
    </div>
    <Modal open={passwordOpen} onClose={()=>setPasswordOpen(false)} title="Đổi mật khẩu"><form onSubmit={event=>{event.preventDefault();setPasswordOpen(false);setToast("Đổi mật khẩu thành công.");}} className="space-y-4"><label className="block"><span className="ui-label">Mật khẩu hiện tại</span><input className="ui-input" type="password" required/></label><label className="block"><span className="ui-label">Mật khẩu mới</span><input className="ui-input" type="password" minLength="8" required/><small className="mt-1 block text-xs text-slate-500">Tối thiểu 8 ký tự, có chữ hoa, chữ thường và ký tự đặc biệt.</small></label><label className="block"><span className="ui-label">Xác nhận mật khẩu mới</span><input className="ui-input" type="password" minLength="8" required/></label><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" className="ui-btn-secondary" onClick={()=>setPasswordOpen(false)}>Hủy</button><button className="ui-btn-primary">Đổi mật khẩu</button></div></form></Modal>
    <GenericFormModal dialog={dialog} setDialog={setDialog} onToast={setToast}/><Toast message={toast} onClose={()=>setToast("")}/>
  </div>;
}

export default function App({roleKey}) { return roleKey==="public"?<PublicHome/>:<Dashboard roleKey={roleKey}/>; }

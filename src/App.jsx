import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ArrowRight, Award, BookOpen, Building2, CalendarCheck, CalendarDays,
  CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ClipboardCheck,
  ClipboardList, Eye, FileText, FolderOpen, GraduationCap, GripVertical, Info,
  KeyRound, LockKeyhole, LogIn, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Pencil, Plus, RotateCcw, Save, Search,
  Send, ShieldCheck, Trash2, User, UserCog, Users, X
} from "lucide-react";
import logo from "../assets/img/logo-iuh-khoa-cntt.svg";
import { createInitialClasses, createInitialMajors, createInitialPermissions, criteriaRows, permissionActorRoles, publicRounds, roles, roundRows, tableData } from "./data.js";

const menuIcons = {
  book: BookOpen, class: GraduationCap, teacher: UserCog, users: Users,
  permission: ShieldCheck, calendar: CalendarCheck, criteria: ClipboardList,
  folder: FolderOpen, approve: ClipboardCheck, award: Award, key: KeyRound,
  file: FileText, check: CheckCircle2
};

function Modal({open,onClose,title,description,children,size="md",footer}) {
  const panelRef=useRef(null);
  const closeRef=useRef(onClose);
  const titleId=useId();
  const descriptionId=useId();
  useEffect(()=>{closeRef.current=onClose;},[onClose]);
  useEffect(()=>{
    if (!open) return;
    const previousFocus=document.activeElement;
    const panel=panelRef.current;
    const focusable=()=>Array.from(panel.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')).filter(element=>element.getClientRects().length);
    const onKey = event => {
      if(event.key === "Escape") {event.preventDefault();closeRef.current();}
      if(event.key === "Tab") {
        const items=focusable(), first=items[0], last=items.at(-1);
        if(!first) {event.preventDefault();panel.focus();return;}
        if(event.shiftKey && (document.activeElement===first || document.activeElement===panel)) {event.preventDefault();last.focus();}
        else if(!event.shiftKey && (document.activeElement===last || !panel.contains(document.activeElement))) {event.preventDefault();first.focus();}
      }
    };
    const containFocus=event=>{if(!panel.contains(event.target)) (focusable()[0]||panel).focus();};
    document.addEventListener("keydown",onKey);
    document.addEventListener("focusin",containFocus);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    (panel.querySelector('input:not(:disabled), select:not(:disabled), textarea:not(:disabled)')||focusable()[0]||panel).focus();
    return () => { document.removeEventListener("keydown",onKey); document.removeEventListener("focusin",containFocus); document.body.style.overflow = previous; if(previousFocus?.isConnected)previousFocus.focus(); };
  },[open]);
  if (!open) return null;
  const widths = {sm:"max-w-sm",md:"max-w-lg",lg:"max-w-3xl",xl:"max-w-5xl"};
  return <div className="modal-backdrop fixed inset-0 z-50 grid place-items-center p-4" onMouseDown={onClose}>
    <section ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description?descriptionId:undefined} className={`modal-panel max-h-[92vh] w-full ${widths[size]} overflow-hidden bg-white`} onMouseDown={event=>event.stopPropagation()}>
      <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div><h2 id={titleId} className="text-lg font-bold text-slate-900">{title}</h2>{description && <p id={descriptionId} className="mt-1 text-xs text-slate-500">{description}</p>}</div>
        <button type="button" className="ui-icon-btn shrink-0" onClick={onClose} aria-label="Đóng"><X size={17}/></button>
      </header>
      <div className="max-h-[calc(92vh-140px)] overflow-y-auto p-5 scrollbar-thin">{children}</div>
      {footer && <footer className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">{footer}</footer>}
    </section>
  </div>;
}

function Toast({message,onClose}) {
  useEffect(()=>{ if (!message) return; const id=setTimeout(onClose,5000); return()=>clearTimeout(id); },[message,onClose]);
  if (!message) return null;
  return <div role="status" aria-live="polite" aria-atomic="true" className="toast-panel fixed bottom-5 right-5 z-[70] flex max-w-sm items-center gap-3 bg-emerald-700 px-4 py-3 text-sm font-medium text-white">
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
  return <span className={`status-badge inline-flex px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style}`}>{children}</span>;
}

function Pagination({page,totalPages,onChange,total}) {
  if (!total) return null;
  return <div className="table-pagination flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
    <p role="status">{total} bản ghi <span aria-hidden="true">·</span> Trang {page}/{totalPages}</p>
    <nav className="flex flex-wrap items-center gap-1" aria-label="Phân trang">
      <button className="ui-btn-secondary min-h-8 px-2.5 text-xs" disabled={page===1} onClick={()=>onChange(page-1)}><ChevronLeft size={14}/>Trước</button>
      {Array.from({length:totalPages},(_,i)=>i+1).map(number=><button key={number} aria-current={number===page?"page":undefined} className={`grid size-8 place-items-center text-xs font-semibold ${number===page?"bg-brand text-white":"border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`} onClick={()=>onChange(number)}>{number}</button>)}
      <button className="ui-btn-secondary min-h-8 px-2.5 text-xs" disabled={page===totalPages} onClick={()=>onChange(page+1)}>Sau<ChevronRight size={14}/></button>
    </nav>
  </div>;
}

function PublicHome() {
  const [roundQuery,setRoundQuery]=useState("");
  const [roundStatus,setRoundStatus]=useState("");
  const visibleRounds=useMemo(()=>publicRounds.filter(round=>(!roundStatus||round.status===roundStatus)&&`${round.id} ${round.name} ${round.major}`.toLocaleLowerCase("vi").includes(roundQuery.trim().toLocaleLowerCase("vi"))),[roundQuery,roundStatus]);
  const [loginOpen,setLoginOpen]=useState(false);
  const [applyRound,setApplyRound]=useState(null);
  const [forgot,setForgot]=useState(false);
  const [toast,setToast]=useState("");
  const login = event => { event.preventDefault(); window.location.href=new FormData(event.currentTarget).get("role"); };
  const submitApplication = event => { event.preventDefault(); setApplyRound(null); setToast("Hồ sơ đã được gửi. Kết quả sẽ được gửi qua email."); event.currentTarget.reset(); };
  return <div className="public-shell flex min-h-[100dvh] flex-col bg-white">
    <a className="skip-link" href="#main-content">Đến nội dung chính</a>
    <header className="public-header sticky top-0 z-30">
      <div className="public-header-inner mx-auto grid min-h-[88px] max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 md:grid-cols-[220px_minmax(0,1fr)_auto] md:px-6">
        <img src={logo} className="public-logo h-10 w-full max-w-[220px] object-contain object-left" alt="IUH - Khoa Công nghệ Thông tin"/>
        <p className="portal-title order-3 col-span-2 px-4 py-3 text-center font-display text-sm font-bold leading-relaxed text-brand md:order-none md:col-span-1 md:text-[clamp(14px,1.4vw,19px)]">Cổng thông tin xét tuyển chương trình Cử nhân tài năng và Kỹ sư tài năng</p>
        <button className="portal-login ui-btn-primary whitespace-nowrap" onClick={()=>setLoginOpen(true)}><LogIn size={17}/>Đăng nhập</button>
      </div>
    </header>
    <main id="main-content" tabIndex={-1} className="public-main flex-1">
      <div className="admissions-content px-4 py-10 md:px-6 md:py-12">
      <section id="dot-xet-tuyen" className="public-rounds mx-auto max-w-6xl">
        <div className="rounds-heading"><div><p className="section-eyebrow">CHƯƠNG TRÌNH CN / KSTN</p><h1 className="public-section-title">Các đợt xét tuyển</h1><p className="section-description">Tra cứu thông tin và chọn đợt xét tuyển phù hợp với bạn.</p></div><span className="round-count" role="status" aria-atomic="true">{visibleRounds.length} đợt xét tuyển</span></div>
        <div className="admissions-toolbar"><label className="admissions-search"><span className="ui-label">Tìm đợt xét tuyển</span><span className="relative block"><Search aria-hidden="true" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/><input className="ui-input pl-10" autoComplete="off" value={roundQuery} onChange={event=>setRoundQuery(event.target.value)} placeholder="Tên đợt, mã đợt hoặc chuyên ngành…"/></span></label><label><span className="ui-label">Trạng thái</span><select className="ui-input" value={roundStatus} onChange={event=>setRoundStatus(event.target.value)}><option value="">Tất cả trạng thái</option><option value="open">Đang mở</option><option value="review">Đang xét duyệt</option></select></label>{(roundQuery||roundStatus)&&<button className="ui-btn-secondary" onClick={()=>{setRoundQuery("");setRoundStatus("");}}><RotateCcw size={16}/>Đặt lại</button>}</div>
        <div className="public-round-grid grid gap-5 lg:grid-cols-2">{visibleRounds.map(round=><article key={round.id} className="public-round-card ui-card flex min-h-[290px] flex-col overflow-hidden">
          <div className="round-card-head flex items-center justify-between border-b border-slate-100 px-6 py-4"><span className="font-mono text-xs font-bold tracking-wide text-brand">{round.id}</span><StatusBadge>{round.label}</StatusBadge></div>
          <div className="round-card-body flex-1 p-6"><h2 className="text-xl font-bold text-slate-900">{round.name}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{round.desc}</p><div className="round-card-meta mt-7 grid gap-3 text-sm text-slate-600"><span className="flex items-center gap-2"><Building2 size={17} className="text-brand"/>{round.major}</span><span className="flex items-center gap-2"><CalendarDays size={17} className="text-brand"/>{round.time}</span></div></div>
          <div className="p-5 pt-0"><button className="ui-btn-primary w-full" onClick={()=>setApplyRound(round)}>Nộp hồ sơ<ArrowRight size={17}/></button></div>
        </article>)}</div>
        {!visibleRounds.length&&<div className="admissions-empty ui-card"><Search size={28} aria-hidden="true"/><h2>Không tìm thấy đợt xét tuyển</h2><p>Thử từ khóa khác hoặc đặt lại bộ lọc.</p><button className="ui-btn-secondary" onClick={()=>{setRoundQuery("");setRoundStatus("");}}>Đặt lại bộ lọc</button></div>}
      </section>
      </div>
    </main>

    <Modal open={loginOpen} onClose={()=>setLoginOpen(false)} title="Đăng nhập hệ thống" description="Chọn vai trò để xem bản mô phỏng front-end." footer={null}>
      <form onSubmit={login} className="space-y-4" autoComplete="off"><label className="block"><span className="ui-label">Mã tài khoản / Email</span><input className="ui-input" defaultValue="demo@iuh.edu.vn" autoComplete="off" required/></label><label className="block"><span className="ui-label">Mật khẩu</span><input className="ui-input" type="password" defaultValue="12345678" autoComplete="off" required/></label><label className="block"><span className="ui-label">Vai trò dùng thử</span><select name="role" className="ui-input"><option value="sinh-vien.html">Sinh viên CN/KSTN</option><option value="giang-vien-phu-trach.html">Giảng viên phụ trách</option><option value="chu-nhiem-nganh.html">Chủ nhiệm ngành</option><option value="ban-lanh-dao-khoa.html">Ban lãnh đạo khoa</option><option value="dai-dien-phong-dao-tao.html">Đại diện Phòng Đào tạo</option><option value="quan-tri-vien.html">Quản trị viên</option></select></label><button type="button" className="text-sm font-semibold text-brand hover:underline" onClick={()=>setForgot(value=>!value)}>Quên mật khẩu?</button>{forgot&&<div className="bg-slate-50 p-4"><label className="ui-label">Email nhận mã OTP</label><div className="flex gap-2"><input className="ui-input" type="email" placeholder="email@iuh.edu.vn" autoComplete="off"/><button type="button" className="ui-btn-secondary shrink-0" onClick={()=>setToast("Mã OTP dùng thử đã được gửi. Mã có hiệu lực trong 5 phút.")}>Gửi mã</button></div></div>}<div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" className="ui-btn-secondary" onClick={()=>setLoginOpen(false)}>Hủy</button><button className="ui-btn-primary">Đăng nhập</button></div></form>
    </Modal>
    <Modal open={Boolean(applyRound)} onClose={()=>setApplyRound(null)} size="lg" title="Nộp hồ sơ xét tuyển" description={applyRound?.name}>
      <form onSubmit={submitApplication} autoComplete="off"><div className="mb-5 flex gap-2 bg-brand-soft p-3 text-xs leading-5 text-brand"><Info size={17} className="shrink-0"/>Nếu MSSV đã có tài khoản, hệ thống sẽ hướng dẫn bạn đăng nhập để cập nhật hồ sơ.</div><div className="grid gap-4 sm:grid-cols-2">{[["Họ và tên","text"],["Mã số sinh viên","text"],["Email","email"],["Số điện thoại","tel"],["GPA năm 2","number"],["Điểm TOEIC","number"]].map(([label,type])=><label key={label}><span className="ui-label">{label}</span><input className="ui-input" type={type} step={label.includes("GPA")?"0.01":undefined} autoComplete="off" required/></label>)}</div><label className="mt-4 block"><span className="ui-label">Tệp minh chứng tổng hợp (PDF, tối đa 5MB)</span><input className="ui-input py-2" type="file" accept=".pdf" required/></label><div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" className="ui-btn-secondary" onClick={()=>setApplyRound(null)}>Hủy</button><button className="ui-btn-primary"><Send size={16}/>Gửi hồ sơ</button></div></form>
    </Modal>
    <Toast message={toast} onClose={()=>setToast("")}/>
  </div>;
}

function PageHead({title,description,action}) {
  return <div className="page-head mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-semibold tracking-[-.035em] text-slate-900">{title}</h1><p className="mt-1 text-sm text-slate-500">{description}</p></div>{action}</div>;
}

function TableActions({readonly=false,onView,onEdit,onDelete}) {
  return <div className="flex justify-end gap-1.5"><button type="button" className="ui-icon-btn" title="Xem chi tiết" aria-label="Xem chi tiết" onClick={onView}><Eye size={15}/></button>{!readonly&&<><button type="button" className="ui-icon-btn" title="Chỉnh sửa" aria-label="Chỉnh sửa" onClick={onEdit}><Pencil size={14}/></button><button type="button" className="ui-icon-btn hover:!border-rose-200 hover:!bg-rose-50 hover:!text-rose-600" title="Xóa" aria-label="Xóa" onClick={onDelete}><Trash2 size={14}/></button></>}</div>;
}

function TableToolbar({action,query,onQueryChange,searchLabel,placeholder,filterValue="",onFilterChange,filterLabel,filterAllLabel,filterOptions=[]}) {
  const hasFilters=Boolean(query||filterValue);
  return <div className="table-toolbar">
    <div className="table-toolbar-controls">
      <label className="table-search"><span className="sr-only">{searchLabel}</span><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input className="ui-input pl-9" autoComplete="off" aria-label={searchLabel} value={query} onChange={event=>onQueryChange(event.target.value)} placeholder={placeholder}/></label>
      {onFilterChange&&<label className="table-filter"><span className="sr-only">{filterLabel}</span><select className="ui-input" aria-label={filterLabel} value={filterValue} onChange={event=>onFilterChange(event.target.value)}><option value="">{filterAllLabel}</option>{filterOptions.map(option=><option key={option} value={option}>{option}</option>)}</select></label>}
      {hasFilters&&<button type="button" className="ui-btn-secondary table-reset" onClick={()=>{onQueryChange("");onFilterChange?.("");}}><RotateCcw size={16}/>Đặt lại</button>}
    </div>
    {action&&<div className="table-toolbar-action">{action}</div>}
  </div>;
}

function TableEmptyState({colSpan,title,description,icon:Icon=Search}) {
  return <tr><td colSpan={colSpan}><div className="table-empty"><div><Icon className="mx-auto text-slate-400"/><strong className="mt-3 block text-sm text-slate-700">{title}</strong><span className="mt-1 block text-xs text-slate-500">{description}</span></div></div></td></tr>;
}

function TablePanel({toolbar,children,pagination}) {
  return <section className="ui-card table-panel overflow-hidden">{toolbar}{children}{pagination}</section>;
}

function DataTablePage({meta,onToast,onOpenForm}) {
  const [query,setQuery]=useState(""), [filter,setFilter]=useState(""), [page,setPage]=useState(1);
  const filterOptions=useMemo(()=>meta.filterIndex===undefined?[]:[...new Set(meta.rows.map(row=>row[meta.filterIndex]))].sort((a,b)=>String(a).localeCompare(String(b),"vi")),[meta]);
  const rows=useMemo(()=>{const keyword=query.trim().toLocaleLowerCase("vi");return meta.rows.filter(row=>(!filter||row[meta.filterIndex]===filter)&&(!keyword||row.join(" ").toLocaleLowerCase("vi").includes(keyword)));},[meta,query,filter]);
  const totalPages=Math.max(1,Math.ceil(rows.length/10));
  useEffect(()=>setPage(1),[query,filter]);
  useEffect(()=>{if(page>totalPages)setPage(totalPages);},[page,totalPages]);
  const visible=rows.slice((page-1)*10,page*10);
  const action=!meta.readonly?<button className="ui-btn-primary" onClick={()=>onOpenForm("Thêm mới bản ghi")}><Plus size={16}/>Thêm mới</button>:null;
  return <TablePanel toolbar={<TableToolbar action={action} query={query} onQueryChange={setQuery} searchLabel={`Tìm kiếm ${meta.title.toLocaleLowerCase("vi")}`} placeholder={meta.searchPlaceholder||"Tìm kiếm trong danh sách..."} filterValue={filter} onFilterChange={meta.filterIndex===undefined?undefined:setFilter} filterLabel={meta.filterLabel} filterAllLabel={meta.filterAllLabel} filterOptions={filterOptions}/>} pagination={<Pagination page={page} totalPages={totalPages} onChange={setPage} total={rows.length}/>}> <div className="overflow-x-auto"><table className="ui-table"><thead><tr>{meta.columns.map(column=><th key={column}>{column}</th>)}<th className="text-right">Thao tác</th></tr></thead><tbody>{visible.map(row=><tr key={row.join("-")} >{row.map((value,cell)=><td key={cell}>{cell===row.length-1&&meta.statusLast!==false?<StatusBadge>{value}</StatusBadge>:value}</td>)}<td><TableActions readonly={meta.readonly} onView={()=>onOpenForm("Chi tiết bản ghi",true)} onEdit={()=>onOpenForm("Chỉnh sửa bản ghi")} onDelete={()=>onToast("Đã xóa bản ghi khỏi danh sách.")}/></td></tr>)}{!visible.length&&<TableEmptyState colSpan={meta.columns.length+1} title="Không tìm thấy dữ liệu phù hợp" description="Hãy thử thay đổi từ khóa hoặc bộ lọc đang chọn."/>}</tbody></table></div></TablePanel>;
}

function TeacherManagement({onToast,onOpenForm}) {
  const rows=tableData.teachers.rows;
  const [query,setQuery]=useState(""), [roleFilter,setRoleFilter]=useState(""), [page,setPage]=useState(1);
  const roleOptions=useMemo(()=>[...new Set(rows.map(row=>row[2]))].sort((a,b)=>a.localeCompare(b,"vi")),[rows]);
  const filteredRows=useMemo(()=>{
    const keyword=query.trim().toLocaleLowerCase("vi");
    return rows.filter(row=>(!roleFilter||row[2]===roleFilter)&&(!keyword||row.join(" ").toLocaleLowerCase("vi").includes(keyword)));
  },[rows,query,roleFilter]);
  const totalPages=Math.max(1,Math.ceil(filteredRows.length/10));
  const visible=filteredRows.slice((page-1)*10,page*10);
  useEffect(()=>setPage(1),[query,roleFilter]);

  return <section className="ui-card overflow-hidden">
    <TableToolbar action={<button className="ui-btn-primary" onClick={()=>onOpenForm("Thêm tài khoản giảng viên")}><Plus size={16}/>Thêm tài khoản giảng viên</button>} query={query} onQueryChange={setQuery} searchLabel="Tìm kiếm tài khoản giảng viên" placeholder="Tìm theo họ tên, Gmail hoặc vai trò..." filterValue={roleFilter} onFilterChange={setRoleFilter} filterLabel="Lọc theo vai trò" filterAllLabel="Tất cả vai trò" filterOptions={roleOptions}/>
    <div className="overflow-x-auto">
      <table className="ui-table">
        <thead><tr><th className="w-[24%]">Họ và tên</th><th className="w-[30%]">Gmail</th><th>Vai trò</th><th>Trạng thái</th><th className="text-right">Thao tác</th></tr></thead>
        <tbody>
          {visible.map(row=><tr key={row[1]}><td className="font-semibold text-slate-800">{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td><StatusBadge>{row[3]}</StatusBadge></td><td><TableActions onView={()=>onOpenForm("Chi tiết tài khoản giảng viên",true)} onEdit={()=>onOpenForm("Chỉnh sửa tài khoản giảng viên")} onDelete={()=>onToast("Đã xóa tài khoản giảng viên khỏi danh sách.")}/></td></tr>)}
          {!visible.length&&<TableEmptyState colSpan={5} title="Không tìm thấy tài khoản phù hợp" description="Hãy thử thay đổi từ khóa hoặc vai trò đang chọn."/>}
        </tbody>
      </table>
    </div>
    <Pagination page={page} totalPages={totalPages} onChange={setPage} total={filteredRows.length}/>
  </section>;
}

function StudentManagement({students,setStudents,classes,onToast}) {
  const [query,setQuery]=useState(""), [classFilter,setClassFilter]=useState(""), [page,setPage]=useState(1), [modal,setModal]=useState(null);
  const classOptions=useMemo(()=>[...new Set([...classes.map(item=>item.className),...students.map(item=>item.className)])].filter(Boolean).sort((a,b)=>a.localeCompare(b,"vi")),[classes,students]);
  const filteredStudents=useMemo(()=>{
    const keyword=query.trim().toLocaleLowerCase("vi");
    return students.filter(item=>(!classFilter||item.className===classFilter)&&(!keyword||`${item.id} ${item.name} ${item.className} ${item.gmail}`.toLocaleLowerCase("vi").includes(keyword)));
  },[students,query,classFilter]);
  const totalPages=Math.max(1,Math.ceil(filteredStudents.length/10));
  const visible=filteredStudents.slice((page-1)*10,page*10);
  useEffect(()=>setPage(1),[query,classFilter]);
  useEffect(()=>{if(page>totalPages)setPage(totalPages);},[page,totalPages]);

  const saveStudent=event=>{
    event.preventDefault();
    const values=Object.fromEntries(new FormData(event.currentTarget));
    const next={
      id:values.id.trim(),
      name:values.name.trim().replace(/\s+/g," "),
      className:values.className,
      gmail:values.gmail.trim().toLocaleLowerCase("vi"),
      status:values.status
    };
    const duplicate=students.some(item=>item.id!==modal.originalId&&(item.id===next.id||item.gmail===next.gmail));
    if(duplicate){onToast("MSSV hoặc Gmail đã tồn tại trong hệ thống.");return;}
    if(modal.originalId){
      setStudents(list=>list.map(item=>item.id===modal.originalId?next:item));
      onToast("Đã cập nhật tài khoản sinh viên.");
    }else{
      setStudents(list=>[...list,next]);
      onToast("Đã thêm tài khoản sinh viên mới.");
    }
    setModal(null);
  };
  const removeStudent=()=>{
    setStudents(list=>list.filter(item=>item.id!==modal.student.id));
    setModal(null);
    onToast("Đã xóa tài khoản sinh viên khỏi danh sách.");
  };

  return <>
    <section className="ui-card overflow-hidden">
      <TableToolbar action={<button className="ui-btn-primary" onClick={()=>setModal({type:"form",originalId:null,id:"",name:"",className:classOptions[0]||"",gmail:"",status:"Hoạt động"})}><Plus size={16}/>Thêm tài khoản sinh viên</button>} query={query} onQueryChange={setQuery} searchLabel="Tìm kiếm tài khoản sinh viên" placeholder="Tìm theo MSSV, họ tên hoặc Gmail..." filterValue={classFilter} onFilterChange={setClassFilter} filterLabel="Lọc theo tên lớp" filterAllLabel="Tất cả lớp" filterOptions={classOptions}/>
      <div className="overflow-x-auto">
        <table className="ui-table min-w-[900px]">
          <thead><tr><th className="w-[13%]">MSSV</th><th className="w-[23%]">Họ và tên</th><th className="w-[18%]">Tên lớp</th><th className="w-[25%]">GMAIL</th><th>Trạng thái</th><th className="text-right">Thao tác</th></tr></thead>
          <tbody>
            {visible.map(student=><tr key={student.id}><td className="font-semibold text-brand">{student.id}</td><td className="font-semibold text-slate-800">{student.name}</td><td>{student.className}</td><td>{student.gmail}</td><td><StatusBadge>{student.status}</StatusBadge></td><td><TableActions onView={()=>setModal({type:"detail",student})} onEdit={()=>setModal({type:"form",originalId:student.id,...student})} onDelete={()=>setModal({type:"confirmDelete",student})}/></td></tr>)}
            {!visible.length&&<TableEmptyState colSpan={6} title="Không tìm thấy tài khoản phù hợp" description="Hãy thử thay đổi từ khóa hoặc lớp đang chọn."/>}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} total={filteredStudents.length}/>
    </section>

    <Modal open={modal?.type==="form"} onClose={()=>setModal(null)} title={modal?.originalId?"Cập nhật tài khoản sinh viên":"Thêm tài khoản sinh viên"}>
      <form onSubmit={saveStudent} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2"><label><span className="ui-label">MSSV <b className="text-rose-600">*</b></span><input name="id" className="ui-input" inputMode="numeric" defaultValue={modal?.id} placeholder="Ví dụ: 21094501" required/></label><label><span className="ui-label">Họ và tên <b className="text-rose-600">*</b></span><input name="name" className="ui-input" defaultValue={modal?.name} placeholder="Nhập họ và tên" required/></label></div>
        <label className="block"><span className="ui-label">Gmail <b className="text-rose-600">*</b></span><input name="gmail" className="ui-input" type="email" defaultValue={modal?.gmail} placeholder="mssv@iuh.edu.vn" required/></label>
        <div className="grid gap-4 sm:grid-cols-2"><label><span className="ui-label">Tên lớp <b className="text-rose-600">*</b></span><select name="className" className="ui-input" defaultValue={modal?.className} required>{classOptions.map(name=><option key={name} value={name}>{name}</option>)}</select></label><label><span className="ui-label">Trạng thái</span><select name="status" className="ui-input" defaultValue={modal?.status}><option>Hoạt động</option><option>Chờ duyệt</option><option>Khóa</option></select></label></div>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" className="ui-btn-secondary" onClick={()=>setModal(null)}>Hủy</button><button className="ui-btn-primary">Lưu tài khoản</button></div>
      </form>
    </Modal>
    <Modal open={modal?.type==="detail"} onClose={()=>setModal(null)} title="Chi tiết tài khoản sinh viên">
      <dl className="grid gap-x-5 gap-y-4 sm:grid-cols-2">{[["MSSV",modal?.student?.id],["Họ và tên",modal?.student?.name],["Tên lớp",modal?.student?.className],["Gmail",modal?.student?.gmail]].map(([label,value])=><div key={label} className="border-b border-slate-100 pb-3"><dt className="text-[11px] font-semibold uppercase tracking-[.05em] text-slate-400">{label}</dt><dd className="mt-1 text-sm font-semibold text-slate-800">{value}</dd></div>)}<div><dt className="text-[11px] font-semibold uppercase tracking-[.05em] text-slate-400">Trạng thái</dt><dd className="mt-2"><StatusBadge>{modal?.student?.status}</StatusBadge></dd></div></dl>
    </Modal>
    <Modal open={modal?.type==="confirmDelete"} onClose={()=>setModal(null)} size="sm" title="Xác nhận xóa tài khoản"><div className="text-center"><div className="mx-auto grid size-12 place-items-center bg-rose-50 text-rose-600"><Trash2/></div><p className="mt-4 text-sm leading-6 text-slate-600">Bạn có chắc muốn xóa tài khoản của <b>{modal?.student?.name}</b> ({modal?.student?.id})? Thao tác này không thể hoàn tác.</p><div className="mt-5 flex gap-2"><button className="ui-btn-secondary flex-1" onClick={()=>setModal(null)}>Hủy</button><button className="ui-btn flex-1 bg-rose-600 text-white hover:bg-rose-700" onClick={removeStudent}>Xóa tài khoản</button></div></div></Modal>
  </>;
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
  return <><section className="ui-card overflow-hidden"><TableToolbar action={<button className="ui-btn-primary" onClick={()=>setModal({type:"form",id:null,faculty:"",name:""})}><Plus size={16}/>Thêm chuyên ngành mới</button>} query={query} onQueryChange={setQuery} searchLabel="Tìm kiếm theo khoa hoặc chuyên ngành" placeholder="Tìm theo khoa hoặc chuyên ngành..." filterValue={facultyFilter} onFilterChange={setFacultyFilter} filterLabel="Lọc theo khoa" filterAllLabel="Tất cả khoa" filterOptions={faculties}/><div className="overflow-x-auto"><table className="ui-table"><thead><tr><th className="w-[39%]">Khoa</th><th className="w-[39%]">Chuyên ngành</th><th className="text-center">Số lượng lớp</th><th className="text-right">Thao tác</th></tr></thead><tbody>{visible.map(major=><tr key={major.id}><td>{major.faculty}</td><td className="font-semibold text-slate-800">{major.name}</td><td className="text-center"><span className="inline-grid min-w-8 place-items-center bg-brand-soft px-2 py-1 text-xs font-bold text-brand">{major.classes.length}</span></td><td><TableActions onView={()=>setModal({type:"detail",major})} onEdit={()=>setModal({type:"form",id:major.id,faculty:major.faculty,name:major.name})} onDelete={()=>requestDelete(major)}/></td></tr>)}{!visible.length&&<tr><td colSpan="4"><div className="grid min-h-40 place-items-center text-center"><div><Search className="mx-auto text-slate-400"/><strong className="mt-3 block text-sm text-slate-700">Không tìm thấy chuyên ngành phù hợp</strong><span className="mt-1 block text-xs text-slate-500">Hãy thử thay đổi từ khóa hoặc khoa đang chọn.</span></div></div></td></tr>}</tbody></table></div><Pagination page={page} totalPages={totalPages} onChange={setPage} total={filteredMajors.length}/></section>
    <Modal open={formModal} onClose={()=>setModal(null)} title={modal?.id?"Cập nhật chuyên ngành":"Thêm chuyên ngành mới"} footer={null}><form onSubmit={saveMajor} className="space-y-4" autoComplete="off"><label className="block"><span className="ui-label">Tên khoa <b className="text-rose-600">*</b></span><input name="faculty" className="ui-input" defaultValue={modal?.faculty} placeholder="Ví dụ: Khoa Công nghệ Thông tin" autoComplete="off" required/></label><label className="block"><span className="ui-label">Tên chuyên ngành <b className="text-rose-600">*</b></span><input name="name" className="ui-input" defaultValue={modal?.name} placeholder="Ví dụ: Kỹ thuật phần mềm" autoComplete="off" required/></label><p className="flex gap-2 text-xs leading-5 text-slate-500"><Info size={15} className="shrink-0"/>Mỗi chuyên ngành được xác định duy nhất bởi tên khoa và tên chuyên ngành.</p><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" className="ui-btn-secondary" onClick={()=>setModal(null)}>Hủy</button><button className="ui-btn-primary">Lưu thông tin</button></div></form></Modal>
    <Modal open={modal?.type==="duplicate"} onClose={()=>setModal(null)} size="sm" title="Chuyên ngành đã tồn tại"><div className="text-center"><div className="mx-auto grid size-12 place-items-center bg-amber-50 text-amber-600"><Info/></div><p className="mt-4 text-sm leading-6 text-slate-600">Đã có chuyên ngành <b>{modal?.draft?.name}</b> thuộc <b>{modal?.draft?.faculty}</b> được tạo trước đó.</p><button className="ui-btn-primary mt-5 w-full" onClick={()=>setModal({...modal,type:"form",faculty:modal.draft.faculty,name:modal.draft.name})}>Quay lại kiểm tra</button></div></Modal>
    <Modal open={modal?.type==="detail"} onClose={()=>setModal(null)} size="lg" title={`Danh sách lớp — ${modal?.major?.name || ""}`}><div className="mb-4 grid gap-3 sm:grid-cols-[1fr_130px]"><div className="border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] font-bold uppercase text-slate-400">Khoa</span><strong className="mt-1 block text-sm">{modal?.major?.faculty}</strong></div><div className="border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] font-bold uppercase text-slate-400">Số lượng lớp</span><strong className="mt-1 block text-sm">{modal?.major?.classes.length}</strong></div></div>{modal?.major?.classes.length?<div className="overflow-x-auto border border-slate-200"><table className="ui-table min-w-[600px]"><thead><tr><th>Mã lớp</th><th>Khóa</th><th>Năm học</th><th>Trạng thái</th></tr></thead><tbody>{modal.major.classes.map(item=><tr key={item.code}><td className="font-semibold">{item.code}</td><td>{item.cohort}</td><td>{item.academicYear}</td><td><StatusBadge>{item.status}</StatusBadge></td></tr>)}</tbody></table></div>:<div className="grid min-h-44 place-items-center border border-dashed border-slate-300 bg-slate-50 text-center"><div><GraduationCap className="mx-auto text-slate-400"/><strong className="mt-2 block text-sm">Chưa có lớp CN/KSTN</strong><span className="text-xs text-slate-500">Chuyên ngành này hiện chưa được tạo lớp cho bất kỳ khóa nào.</span></div></div>}</Modal>
    <Modal open={modal?.type==="blocked"} onClose={()=>setModal(null)} size="sm" title="Không thể xóa chuyên ngành"><div className="text-center"><div className="mx-auto grid size-12 place-items-center bg-amber-50 text-amber-600"><Info/></div><p className="mt-4 text-sm leading-6 text-slate-600">Chuyên ngành <b>{modal?.major?.name}</b> đang có <b>{modal?.major?.classes.length} lớp</b>. Hãy xóa các lớp trực thuộc trước.</p><button className="ui-btn-secondary mt-5 w-full" onClick={()=>setModal(null)}>Đã hiểu</button></div></Modal>
    <Modal open={modal?.type==="confirmDelete"} onClose={()=>setModal(null)} size="sm" title="Xác nhận xóa chuyên ngành"><div className="text-center"><div className="mx-auto grid size-12 place-items-center bg-rose-50 text-rose-600"><Trash2/></div><p className="mt-4 text-sm leading-6 text-slate-600">Bạn có chắc muốn xóa <b>{modal?.major?.name}</b>? Thao tác này không thể hoàn tác.</p><div className="mt-5 flex gap-2"><button className="ui-btn-secondary flex-1" onClick={()=>setModal(null)}>Hủy</button><button className="ui-btn flex-1 bg-rose-600 text-white hover:bg-rose-700" onClick={removeMajor}>Xóa chuyên ngành</button></div></div></Modal>
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
    return classes.filter(item=>(!majorFilter||item.major===majorFilter)&&(!keyword||`${item.className} ${item.major} ${item.cohort} ${item.lecturer}`.toLocaleLowerCase("vi").includes(keyword)));
  },[classes,query,majorFilter]);
  const totalPages=Math.max(1,Math.ceil(filteredClasses.length/10));
  const visible=filteredClasses.slice((page-1)*10,page*10);
  useEffect(()=>setPage(1),[query,majorFilter]);
  useEffect(()=>{if(page>totalPages)setPage(totalPages);},[page,totalPages]);

  const openCreate=()=>setModal({type:"form",id:null,className:"",major:majorOptions[0]||"",cohort:"22",lecturer:"",current:0,capacity:30});
  const openEdit=item=>setModal({type:"form",...item});
  const saveClass=event=>{
    event.preventDefault();
    const values=Object.fromEntries(new FormData(event.currentTarget));
    const className=values.className.trim().replace(/\s+/g," ");
    const major=values.major;
    const cohort=values.cohort.trim();
    const lecturer=values.lecturer.trim().replace(/\s+/g," ");
    const current=Number(values.current);
    const capacity=Number(values.capacity);
    if(current>capacity){onToast("Sĩ số hiện tại không được lớn hơn sĩ số tối đa.");return;}
    const duplicate=classes.some(item=>item.id!==modal.id&&(item.className.toLocaleLowerCase("vi")===className.toLocaleLowerCase("vi")||(item.major===major&&item.cohort===cohort)));
    if(duplicate){onToast("Tên lớp đã tồn tại hoặc ngành này đã có lớp thuộc khóa đã chọn.");return;}
    if(modal.id){
      setClasses(list=>list.map(item=>item.id===modal.id?{...item,className,major,cohort,lecturer,current,capacity}:item));
      onToast("Đã cập nhật thông tin lớp.");
    }else{
      const id=Math.max(0,...classes.map(item=>item.id))+1;
      setClasses(list=>[...list,{id,className,major,cohort,lecturer,current,capacity,status:"Chưa mở",admissionRound:null,students:[]}]);
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
      <TableToolbar action={<button className="ui-btn-primary" onClick={openCreate}><Plus size={16}/>Thêm lớp mới</button>} query={query} onQueryChange={setQuery} searchLabel="Tìm kiếm lớp" placeholder="Tìm theo tên lớp, ngành hoặc giảng viên..." filterValue={majorFilter} onFilterChange={setMajorFilter} filterLabel="Lọc theo ngành" filterAllLabel="Tất cả ngành" filterOptions={majorOptions}/>
      <div className="overflow-x-auto">
        <table className="ui-table min-w-[900px]">
          <thead><tr><th className="w-[16%]">Tên lớp</th><th className="w-[25%]">Ngành</th><th>Khóa</th><th className="w-[24%]">Giảng viên phụ trách</th><th className="text-center">Sĩ số</th><th className="text-right">Thao tác</th></tr></thead>
          <tbody>
            {visible.map(item=><tr key={item.id}><td className="font-semibold text-brand">{item.className}</td><td className="font-semibold text-slate-800">{item.major}</td><td><span className="inline-grid min-w-8 place-items-center bg-brand-soft px-2 py-1 text-xs font-bold text-brand">{item.cohort}</span></td><td>{item.lecturer}</td><td className="text-center font-semibold text-slate-700">{item.current}/{item.capacity}</td><td><TableActions onView={()=>setModal({type:"detail",item})} onEdit={()=>openEdit(item)} onDelete={()=>requestDelete(item)}/></td></tr>)}
            {!visible.length&&<TableEmptyState colSpan={6} title="Không tìm thấy lớp phù hợp" description="Hãy thử thay đổi từ khóa hoặc ngành đang chọn."/>}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} total={filteredClasses.length}/>
    </section>

    <Modal open={modal?.type==="form"} onClose={()=>setModal(null)} title={modal?.id?"Cập nhật lớp":"Thêm lớp mới"}>
      <form onSubmit={saveClass} className="space-y-4" autoComplete="off">
        <label className="block"><span className="ui-label">Tên lớp <b className="text-rose-600">*</b></span><input name="className" className="ui-input" defaultValue={modal?.className} placeholder="Ví dụ: KSTN-KTPM-K22" autoComplete="off" required/></label>
        <label className="block"><span className="ui-label">Ngành <b className="text-rose-600">*</b></span><select name="major" className="ui-input" defaultValue={modal?.major} required>{majorOptions.map(major=><option key={major} value={major}>{major}</option>)}</select></label>
        <div className="grid gap-4 sm:grid-cols-2"><label><span className="ui-label">Khóa <b className="text-rose-600">*</b></span><input name="cohort" className="ui-input" type="number" min="1" max="99" defaultValue={modal?.cohort} required/></label><label><span className="ui-label">Giảng viên phụ trách <b className="text-rose-600">*</b></span><input name="lecturer" className="ui-input" defaultValue={modal?.lecturer} placeholder="Nhập họ tên giảng viên" autoComplete="off" required/></label></div>
        <div className="grid gap-4 sm:grid-cols-2"><label><span className="ui-label">Sĩ số hiện tại <b className="text-rose-600">*</b></span><input name="current" className="ui-input" type="number" min="0" defaultValue={modal?.current} required/></label><label><span className="ui-label">Sĩ số tối đa <b className="text-rose-600">*</b></span><input name="capacity" className="ui-input" type="number" min="1" defaultValue={modal?.capacity} required/></label></div>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" className="ui-btn-secondary" onClick={()=>setModal(null)}>Hủy</button><button className="ui-btn-primary">Lưu thông tin</button></div>
      </form>
    </Modal>

    <Modal open={modal?.type==="detail"} onClose={()=>setModal(null)} size="xl" title={`Thông tin lớp ${detail?.className||""}`} description={`${detail?.major||""} · Khóa ${detail?.cohort||""}`}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {[['Tên lớp',detail?.className],['Ngành',detail?.major],['Khóa',detail?.cohort],['Giảng viên phụ trách',detail?.lecturer],['Sĩ số',detail?`${detail.current}/${detail.capacity}`:""],['Trạng thái',detail?.status]].map(([label,value])=><div key={label} className="border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</span>{label==='Trạng thái'?<div className="mt-1"><StatusBadge>{value}</StatusBadge></div>:<strong className="mt-1 block text-sm text-slate-800">{value}</strong>}</div>)}
      </div>
      <div className="mt-5"><h3 className="mb-3 text-sm font-bold text-slate-800">Danh sách sinh viên</h3>{detail?.admissionRound?.opened?(detail.students.length?<div className="overflow-x-auto border border-slate-200"><table className="ui-table min-w-[680px]"><thead><tr><th>MSSV</th><th>Họ và tên</th><th>Email</th><th>Trạng thái</th></tr></thead><tbody>{detail.students.map(student=><tr key={student.id}><td className="font-semibold">{student.id}</td><td>{student.name}</td><td>{student.email}</td><td><StatusBadge>{student.status}</StatusBadge></td></tr>)}</tbody></table></div>:<div className="grid min-h-36 place-items-center border border-dashed border-slate-300 bg-slate-50 text-center"><div><Users className="mx-auto text-slate-400"/><strong className="mt-2 block text-sm">Chưa có sinh viên trong lớp</strong><span className="text-xs text-slate-500">Danh sách sẽ được cập nhật sau khi có kết quả chính thức.</span></div></div>):<div className="grid min-h-36 place-items-center border border-dashed border-slate-300 bg-slate-50 text-center"><div><LockKeyhole className="mx-auto text-slate-400"/><strong className="mt-2 block text-sm">Lớp chưa chính thức được mở</strong><span className="text-xs text-slate-500">Danh sách sinh viên sẽ hiển thị khi đợt xét tuyển của lớp được mở.</span></div></div>}</div>
    </Modal>

    <Modal open={modal?.type==="blocked"} onClose={()=>setModal(null)} size="sm" title="Không thể xóa lớp"><div className="text-center"><div className="mx-auto grid size-12 place-items-center bg-amber-50 text-amber-600"><Info/></div><p className="mt-4 text-sm leading-6 text-slate-600">Lớp thuộc ngành <b>{modal?.item?.major}</b>, khóa <b>{modal?.item?.cohort}</b> đã được gắn với đợt xét tuyển <b>{modal?.item?.admissionRound?.code}</b> và đợt này đã mở nên không thể xóa.</p><button className="ui-btn-secondary mt-5 w-full" onClick={()=>setModal(null)}>Đã hiểu</button></div></Modal>
    <Modal open={modal?.type==="confirmDelete"} onClose={()=>setModal(null)} size="sm" title="Xác nhận xóa lớp"><div className="text-center"><div className="mx-auto grid size-12 place-items-center bg-rose-50 text-rose-600"><Trash2/></div><p className="mt-4 text-sm leading-6 text-slate-600">Bạn có chắc muốn xóa lớp thuộc ngành <b>{modal?.item?.major}</b>, khóa <b>{modal?.item?.cohort}</b>? Thao tác này không thể hoàn tác.</p><div className="mt-5 flex gap-2"><button className="ui-btn-secondary flex-1" onClick={()=>setModal(null)}>Hủy</button><button className="ui-btn flex-1 bg-rose-600 text-white hover:bg-rose-700" onClick={removeClass}>Xóa lớp</button></div></div></Modal>
  </>;
}

function PermissionManagement({permissions,setPermissions,onToast}) {
  const [page,setPage]=useState(1);
  const [modal,setModal]=useState(null);
  const [query,setQuery]=useState("");
  const [roleFilter,setRoleFilter]=useState("");
  const filteredPermissions=useMemo(()=>{
    const keyword=query.trim().toLocaleLowerCase("vi");
    return permissions.filter(item=>(!roleFilter||item.role===roleFilter)&&(!keyword||`${item.name} ${item.role}`.toLocaleLowerCase("vi").includes(keyword)));
  },[permissions,query,roleFilter]);
  const totalPages=Math.max(1,Math.ceil(filteredPermissions.length/10));
  const visible=filteredPermissions.slice((page-1)*10,page*10);
  useEffect(()=>setPage(1),[query,roleFilter]);
  useEffect(()=>{if(page>totalPages)setPage(totalPages);},[page,totalPages]);

  const openCreate=()=>setModal({type:"form",id:null,name:"",role:permissionActorRoles[4]});
  const savePermission=event=>{
    event.preventDefault();
    const values=Object.fromEntries(new FormData(event.currentTarget));
    const name=values.name.trim().replace(/\s+/g," ");
    const role=values.role;
    const duplicate=permissions.some(item=>item.id!==modal.id&&item.name.toLocaleLowerCase("vi")===name.toLocaleLowerCase("vi"));
    if(duplicate){onToast("Tài khoản này đã được phân quyền trước đó.");return;}
    if(modal.id){
      setPermissions(list=>list.map(item=>item.id===modal.id?{...item,name,role}:item));
      onToast("Đã cập nhật vai trò tài khoản.");
    }else{
      const id=Math.max(0,...permissions.map(item=>item.id))+1;
      setPermissions(list=>[...list,{id,name,role}]);
      onToast("Đã thêm phân quyền mới.");
    }
    setModal(null);
  };
  const removePermission=()=>{
    setPermissions(list=>list.filter(item=>item.id!==modal.item.id));
    setModal(null);
    onToast("Đã xóa phân quyền khỏi danh sách.");
  };

  return <>
    <section className="ui-card overflow-hidden">
      <TableToolbar action={<button className="ui-btn-primary" onClick={openCreate}><Plus size={16}/>Thêm phân quyền</button>} query={query} onQueryChange={setQuery} searchLabel="Tìm kiếm tài khoản được phân quyền" placeholder="Tìm theo họ và tên..." filterValue={roleFilter} onFilterChange={setRoleFilter} filterLabel="Lọc theo vai trò" filterAllLabel="Tất cả vai trò" filterOptions={permissionActorRoles}/>
      <div className="overflow-x-auto">
        <table className="ui-table min-w-[640px]">
          <thead><tr><th className="w-[50%]">Họ và tên</th><th className="w-[34%]">Vai trò</th><th className="text-right">Thao tác</th></tr></thead>
          <tbody>
            {visible.map(item=><tr key={item.id}><td className="font-semibold text-slate-800">{item.name}</td><td><span className="inline-flex items-center gap-2 font-medium text-slate-700"><ShieldCheck size={15} className="shrink-0 text-brand"/>{item.role}</span></td><td><TableActions onView={()=>setModal({type:"detail",item})} onEdit={()=>setModal({type:"form",...item})} onDelete={()=>setModal({type:"confirmDelete",item})}/></td></tr>)}
            {!visible.length&&<TableEmptyState colSpan={3} title="Không tìm thấy phân quyền phù hợp" description="Hãy thử thay đổi từ khóa hoặc vai trò đang chọn."/>}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} total={filteredPermissions.length}/>
    </section>

    <Modal open={modal?.type==="form"} onClose={()=>setModal(null)} title={modal?.id?"Cập nhật phân quyền":"Thêm phân quyền"}>
      <form onSubmit={savePermission} className="space-y-4" autoComplete="off">
        <label className="block"><span className="ui-label">Họ và tên <b className="text-rose-600">*</b></span><input name="name" className="ui-input" defaultValue={modal?.name} placeholder="Nhập họ và tên" autoComplete="off" required/></label>
        <label className="block"><span className="ui-label">Vai trò <b className="text-rose-600">*</b></span><select name="role" className="ui-input" defaultValue={modal?.role} required>{permissionActorRoles.map(role=><option key={role} value={role}>{role}</option>)}</select></label>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" className="ui-btn-secondary" onClick={()=>setModal(null)}>Hủy</button><button className="ui-btn-primary">Lưu thông tin</button></div>
      </form>
    </Modal>

    <Modal open={modal?.type==="detail"} onClose={()=>setModal(null)} size="sm" title="Thông tin phân quyền"><div className="space-y-3"><div className="border border-slate-200 bg-slate-50 p-4"><span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Họ và tên</span><strong className="mt-1 block text-sm text-slate-900">{modal?.item?.name}</strong></div><div className="border border-slate-200 bg-slate-50 p-4"><span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Vai trò</span><span className="mt-2 flex items-center gap-2 text-sm font-semibold text-brand"><ShieldCheck size={17}/>{modal?.item?.role}</span></div></div></Modal>

    <Modal open={modal?.type==="confirmDelete"} onClose={()=>setModal(null)} size="sm" title="Xác nhận xóa phân quyền"><div className="text-center"><div className="mx-auto grid size-12 place-items-center bg-rose-50 text-rose-600"><Trash2/></div><p className="mt-4 text-sm leading-6 text-slate-600">Bạn có chắc muốn xóa vai trò <b>{modal?.item?.role}</b> của <b>{modal?.item?.name}</b>? Thao tác này không thể hoàn tác.</p><div className="mt-5 flex gap-2"><button className="ui-btn-secondary flex-1" onClick={()=>setModal(null)}>Hủy</button><button className="ui-btn flex-1 bg-rose-600 text-white hover:bg-rose-700" onClick={removePermission}>Xóa phân quyền</button></div></div></Modal>
  </>;
}

function RoundsPage({readonly,onToast,onOpenForm}) {
  const [page,setPage]=useState(1);
  const [query,setQuery]=useState("");
  const [statusFilter,setStatusFilter]=useState("");
  const statuses=useMemo(()=>[...new Set(roundRows.map(row=>row[4]))],[roundRows]);
  const filteredRounds=useMemo(()=>{
    const keyword=query.trim().toLocaleLowerCase("vi");
    return roundRows.filter(row=>(!statusFilter||row[4]===statusFilter)&&(!keyword||`${row[1]} ${row[2]} ${row[3]}`.toLocaleLowerCase("vi").includes(keyword)));
  },[query,statusFilter]);
  const totalPages=Math.max(1,Math.ceil(filteredRounds.length/10));
  const visible=filteredRounds.slice((page-1)*10,page*10);
  useEffect(()=>setPage(1),[query,statusFilter]);
  useEffect(()=>{if(page>totalPages)setPage(totalPages);},[page,totalPages]);

  return <>
    <section className="ui-card overflow-hidden">
      <TableToolbar action={!readonly?<button className="ui-btn-primary" onClick={()=>onOpenForm("Tạo đợt xét tuyển")}><Plus size={16}/>Tạo đợt xét tuyển</button>:null} query={query} onQueryChange={setQuery} searchLabel="Tìm kiếm đợt xét tuyển" placeholder="Tìm theo tên đợt, đơn vị hoặc thời gian..." filterValue={statusFilter} onFilterChange={setStatusFilter} filterLabel="Lọc theo trạng thái" filterAllLabel="Tất cả trạng thái" filterOptions={statuses}/>
      <div className="overflow-x-auto">
        <table className="ui-table min-w-[780px]">
          <thead><tr><th className="w-[34%]">Tên đợt</th><th className="w-[22%]">Đơn vị</th><th className="w-[24%]">Thời gian</th><th>Trạng thái</th><th className="text-right">Thao tác</th></tr></thead>
          <tbody>
            {visible.map(row=><tr key={row[0]}><td className="font-semibold text-slate-800">{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td><StatusBadge>{row[4]}</StatusBadge></td><td><TableActions readonly={readonly} onView={()=>onOpenForm("Chi tiết đợt xét tuyển",true)} onEdit={()=>onOpenForm("Chỉnh sửa đợt xét tuyển")} onDelete={()=>onToast("Đã xóa đợt xét tuyển.")}/></td></tr>)}
            {!visible.length&&<TableEmptyState colSpan={5} title="Không tìm thấy đợt xét tuyển phù hợp" description="Hãy thử thay đổi từ khóa hoặc trạng thái đang chọn."/>}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} total={filteredRounds.length}/>
    </section>
  </>;
}

function CriteriaPage({onOpenForm}) {
  const [query,setQuery]=useState(""), [typeFilter,setTypeFilter]=useState(""), [page,setPage]=useState(1);
  const types=useMemo(()=>[...new Set(criteriaRows.map(row=>row[0]))].sort((a,b)=>a.localeCompare(b,"vi")),[]);
  const rows=useMemo(()=>{const keyword=query.trim().toLocaleLowerCase("vi");return criteriaRows.filter(row=>(!typeFilter||row[0]===typeFilter)&&(!keyword||row[1].toLocaleLowerCase("vi").includes(keyword)));},[query,typeFilter]);
  const totalPages=Math.max(1,Math.ceil(rows.length/10));
  const visible=rows.slice((page-1)*10,page*10);
  useEffect(()=>setPage(1),[query,typeFilter]);
  useEffect(()=>{if(page>totalPages)setPage(totalPages);},[page,totalPages]);
  const action=<button className="ui-btn-primary" onClick={()=>onOpenForm("Thêm tiêu chí")}><Plus size={16}/>Thêm tiêu chí</button>;
  return <TablePanel toolbar={<TableToolbar action={action} query={query} onQueryChange={setQuery} searchLabel="Tìm kiếm tiêu chí" placeholder="Tìm theo tên tiêu chí..." filterValue={typeFilter} onFilterChange={setTypeFilter} filterLabel="Lọc theo loại tiêu chí" filterAllLabel="Tất cả loại tiêu chí" filterOptions={types}/>} pagination={<Pagination page={page} totalPages={totalPages} onChange={setPage} total={rows.length}/>}> <div className="overflow-x-auto"><table className="ui-table min-w-[860px]"><thead><tr>{["Loại","Tên tiêu chí","Mức đánh giá","Điểm","Thứ tự xét hòa","Thao tác"].map(item=><th className={item==="Thao tác"?"text-right":undefined} key={item}>{item}</th>)}</tr></thead><tbody>{visible.map(row=><tr key={row[1]}>{row.map((value,i)=><td key={i}>{i===0?<StatusBadge>{value}</StatusBadge>:value}</td>)}<td className="text-right"><button type="button" className="ui-icon-btn" aria-label="Chỉnh sửa tiêu chí" title="Chỉnh sửa" onClick={()=>onOpenForm("Chỉnh sửa tiêu chí")}><Pencil size={14}/></button></td></tr>)}{!visible.length&&<TableEmptyState colSpan={6} title="Không tìm thấy tiêu chí phù hợp" description="Hãy thử thay đổi tên hoặc loại tiêu chí đang chọn."/>}</tbody></table></div></TablePanel>;
}

function ApprovalsPage({final,roleKey,onToast}) {
  const source=tableData.profiles.rows.filter(row=>final?row[5]==="Đã duyệt":row[5]!=="Đã duyệt");
  const [query,setQuery]=useState(""), [typeFilter,setTypeFilter]=useState(""), [page,setPage]=useState(1);
  const types=useMemo(()=>[...new Set(source.map(row=>row[3]))].sort((a,b)=>a.localeCompare(b,"vi")),[source]);
  const rows=useMemo(()=>{const keyword=query.trim().toLocaleLowerCase("vi");return source.filter(row=>(!typeFilter||row[3]===typeFilter)&&(!keyword||`${row[0]} ${row[1]} ${row[2]}`.toLocaleLowerCase("vi").includes(keyword)));},[source,query,typeFilter]);
  const totalPages=Math.max(1,Math.ceil(rows.length/10));
  const visible=rows.slice((page-1)*10,page*10);
  useEffect(()=>setPage(1),[query,typeFilter,final]);
  useEffect(()=>{if(page>totalPages)setPage(totalPages);},[page,totalPages]);
  return <TablePanel toolbar={<TableToolbar query={query} onQueryChange={setQuery} searchLabel="Tìm kiếm hồ sơ sinh viên" placeholder="Tìm theo MSSV, họ tên hoặc lớp..." filterValue={typeFilter} onFilterChange={setTypeFilter} filterLabel="Lọc theo loại hồ sơ" filterAllLabel="Tất cả loại hồ sơ" filterOptions={types}/>} pagination={<Pagination page={page} totalPages={totalPages} onChange={setPage} total={rows.length}/>}> <div className="overflow-x-auto"><table className="ui-table min-w-[980px]"><thead><tr>{["MSSV","Họ tên","Lớp","Loại hồ sơ","Tổng điểm","Trạng thái","Quyết định"].map(item=><th className={item==="Quyết định"?"text-right":undefined} key={item}>{item}</th>)}</tr></thead><tbody>{visible.map(row=><tr key={row[0]}>{row.map((value,i)=><td key={i} className={i===0?"font-semibold text-brand":undefined}>{i===5?<StatusBadge>{value}</StatusBadge>:value}</td>)}<td><div className="flex justify-end gap-1"><button type="button" className="ui-btn-secondary min-h-8 px-2 text-xs">Chi tiết</button><button type="button" className="ui-btn min-h-8 bg-emerald-600 px-2 text-xs text-white" onClick={()=>onToast(final?"Đã xác nhận hồ sơ sinh viên.":"Đã phê duyệt hồ sơ sinh viên.")}>{final?"Xác nhận":"Duyệt"}</button><button type="button" className="ui-btn min-h-8 border border-rose-200 bg-white px-2 text-xs text-rose-600" onClick={()=>onToast("Đã từ chối hồ sơ và lưu lý do.")}>Từ chối</button></div></td></tr>)}{!visible.length&&<TableEmptyState colSpan={7} title="Không tìm thấy hồ sơ phù hợp" description="Hãy thử thay đổi từ khóa hoặc loại hồ sơ đang chọn."/>}</tbody></table></div></TablePanel>;
}

function ApplicationPage({onToast}) { return <><PageHead title="Cập nhật hồ sơ xét tuyển duy trì" description="Đợt duy trì KSTN năm 3 - hạn cập nhật 25/08/2026" action={<button className="ui-btn-secondary" onClick={()=>onToast("Đã lưu bản nháp trên thiết bị.")}><Save size={16}/>Lưu nháp</button>}/><div className="mb-4 grid gap-2 md:grid-cols-3">{[["1. Thông tin cá nhân","Đã xác nhận","done"],["2. Tiêu chí & minh chứng","Đang cập nhật","current"],["3. Gửi phê duyệt","Chưa gửi",""]].map(([title,label,state])=><div key={title} className={`border p-4 ${state==="current"?"border-brand bg-brand-soft":state==="done"?"border-emerald-200 bg-emerald-50":"border-slate-200 bg-white"}`}><strong className="text-sm">{title}</strong><span className="mt-1 block text-xs text-slate-500">{label}</span></div>)}</div><section className="ui-card p-5"><h2 className="mb-5 text-sm font-bold">Thông tin tiêu chí xét tuyển</h2><form onSubmit={event=>{event.preventDefault();onToast("Hồ sơ đã được cập nhật và chuyển sang chờ phê duyệt.");}} autoComplete="off"><div className="grid gap-4 md:grid-cols-2">{[["Số tín chỉ đạt","42"],["Số tín chỉ không đạt","0"],["GPA năm 2","3.54"],["Điểm rèn luyện trung bình","92"],["Điểm TOEIC","610"]].map(([label,value])=><label key={label}><span className="ui-label">{label}</span><input className="ui-input" type="number" step={label.includes("GPA")?"0.01":undefined} defaultValue={value} autoComplete="off"/></label>)}<label><span className="ui-label">Thành tích chuyên ngành</span><select className="ui-input" defaultValue="Giải Ba"><option>Không có</option><option>Giải Ba</option><option>Giải Nhì</option><option>Giải Nhất</option></select></label></div><div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-2"><label><span className="ui-label">Bảng điểm / kết quả học tập</span><input className="ui-input py-2" type="file" accept=".pdf,image/*"/></label><label><span className="ui-label">Chứng chỉ ngoại ngữ</span><input className="ui-input py-2" type="file" accept=".pdf,image/*"/></label></div><div className="mt-5 flex justify-end"><button className="ui-btn-primary"><Send size={16}/>Cập nhật và gửi phê duyệt</button></div></form></section></>; }

function PasswordPage({onToast}) {
  const source=tableData.students.rows;
  const [query,setQuery]=useState(""), [classFilter,setClassFilter]=useState(""), [page,setPage]=useState(1);
  const classes=useMemo(()=>[...new Set(source.map(row=>row[2]))].sort((a,b)=>a.localeCompare(b,"vi")),[source]);
  const rows=useMemo(()=>{const keyword=query.trim().toLocaleLowerCase("vi");return source.filter(row=>(!classFilter||row[2]===classFilter)&&(!keyword||`${row[0]} ${row[1]} ${row[3]}`.toLocaleLowerCase("vi").includes(keyword)));},[source,query,classFilter]);
  const totalPages=Math.max(1,Math.ceil(rows.length/10));
  const visible=rows.slice((page-1)*10,page*10);
  useEffect(()=>setPage(1),[query,classFilter]);
  useEffect(()=>{if(page>totalPages)setPage(totalPages);},[page,totalPages]);
  return <TablePanel toolbar={<TableToolbar query={query} onQueryChange={setQuery} searchLabel="Tìm kiếm tài khoản sinh viên" placeholder="Tìm theo MSSV, họ tên hoặc email..." filterValue={classFilter} onFilterChange={setClassFilter} filterLabel="Lọc theo lớp" filterAllLabel="Tất cả lớp" filterOptions={classes}/>} pagination={<Pagination page={page} totalPages={totalPages} onChange={setPage} total={rows.length}/>}> <div className="overflow-x-auto"><table className="ui-table min-w-[780px]"><thead><tr>{["MSSV","Họ tên","Lớp","Email","Thao tác"].map(item=><th className={item==="Thao tác"?"text-right":undefined} key={item}>{item}</th>)}</tr></thead><tbody>{visible.map(row=><tr key={row[0]}>{row.slice(0,4).map((value,index)=><td key={value} className={index===0?"font-semibold text-brand":undefined}>{value}</td>)}<td className="text-right"><button type="button" className="ui-btn-secondary min-h-8 px-2 text-xs" onClick={()=>onToast("Đã tạo mật khẩu mặc định và yêu cầu đổi ở lần đăng nhập sau.")}>Đặt lại mật khẩu</button></td></tr>)}{!visible.length&&<TableEmptyState colSpan={5} title="Không tìm thấy tài khoản phù hợp" description="Hãy thử thay đổi từ khóa hoặc lớp đang chọn."/>}</tbody></table></div></TablePanel>;
}

function ProfilePage({role,roleKey,onToast}) { return <><PageHead title="Thông tin cá nhân" description="Thông tin hồ sơ tài khoản đang đăng nhập."/><section className="ui-card p-5"><div className="grid gap-6 lg:grid-cols-[240px_1fr]"><div className="bg-slate-50 p-6 text-center"><div className="mx-auto grid size-16 place-items-center bg-brand text-lg font-bold text-white">{role.initials}</div><h2 className="mt-4 font-bold">{role.name}</h2><p className="mt-1 text-xs text-slate-500">{role.label}</p><div className="mt-3"><StatusBadge>Tài khoản hoạt động</StatusBadge></div></div><form onSubmit={event=>{event.preventDefault();onToast("Đã cập nhật thông tin cá nhân.");}} autoComplete="off"><div className="grid gap-4 md:grid-cols-2">{[["Họ và tên",role.name],["Mã tài khoản",roleKey==="student"?"21094501":"GV00128"],["Email",roleKey==="student"?"nam.21094501@iuh.edu.vn":"account@iuh.edu.vn"],["Số điện thoại","090 123 4567"],["Ngày sinh","12/10/2003"],["Đơn vị / Lớp",roleKey==="student"?"KSTN-K20":"Khoa Công nghệ Thông tin"]].map(([label,value])=><label key={label}><span className="ui-label">{label}</span><input className="ui-input" defaultValue={value} autoComplete="off"/></label>)}</div><div className="mt-5 flex justify-end"><button className="ui-btn-primary">Lưu thay đổi</button></div></form></div></section></>; }

function GenericFormModal({dialog,setDialog,onToast}) {
  if(!dialog)return null;
  if(dialog.readonly)return <Modal open onClose={()=>setDialog(null)} title={dialog.title}><div className="grid min-h-40 place-items-center text-center"><div><Eye className="mx-auto text-brand"/><p className="mt-3 text-sm text-slate-600">Đã mở chế độ xem chi tiết. Dữ liệu hiện đang được mô phỏng ở front-end.</p></div></div></Modal>;
  return <Modal open onClose={()=>setDialog(null)} title={dialog.title}><form onSubmit={event=>{event.preventDefault();setDialog(null);onToast("Đã lưu thông tin thành công.");}} className="space-y-4" autoComplete="off"><label className="block"><span className="ui-label">Mã / Định danh</span><input className="ui-input" defaultValue="IUH-2026-01" autoComplete="off" required/></label><label className="block"><span className="ui-label">Tên hiển thị</span><input className="ui-input" defaultValue="Thông tin mẫu" autoComplete="off" required/></label><div className="grid gap-4 sm:grid-cols-2"><label><span className="ui-label">Trạng thái</span><select className="ui-input"><option>Đang hoạt động</option><option>Chờ duyệt</option></select></label><label><span className="ui-label">Đơn vị</span><select className="ui-input"><option>Khoa CNTT</option><option>Toàn trường</option></select></label></div><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" className="ui-btn-secondary" onClick={()=>setDialog(null)}>Hủy</button><button className="ui-btn-primary">Lưu thông tin</button></div></form></Modal>;
}

function Dashboard({roleKey}) {
  const role=roles[roleKey] || roles.admin;
  const [active,setActive]=useState(role.menus[0][0]);
  const [majors,setMajors]=useState(createInitialMajors);
  const [classRecords,setClassRecords]=useState(createInitialClasses);
  const [permissionRecords,setPermissionRecords]=useState(createInitialPermissions);
  const [studentAccounts,setStudentAccounts]=useState(()=>tableData.students.rows.map(([id,name,className,gmail,status])=>({id,name,className,gmail,status})));
  const [accountOpen,setAccountOpen]=useState(false);
  const [mobileNavOpen,setMobileNavOpen]=useState(false);
  const accountRef=useRef(null);
  const SIDEBAR_MIN=200, SIDEBAR_MAX=420, SIDEBAR_DEFAULT=256;
  const [sidebarCollapsed,setSidebarCollapsed]=useState(false);
  const [sidebarWidth,setSidebarWidth]=useState(SIDEBAR_DEFAULT);
  const isDragging=useRef(false);
  const sidebarRef=useRef(null);
  const handleMouseDown=useCallback(event=>{
    event.preventDefault();
    isDragging.current=true;
    const startX=event.clientX, startWidth=sidebarWidth;
    const onMouseMove=moveEvent=>{
      const delta=moveEvent.clientX-startX;
      const newWidth=Math.min(SIDEBAR_MAX,Math.max(SIDEBAR_MIN,startWidth+delta));
      setSidebarWidth(newWidth);
    };
    const onMouseUp=()=>{isDragging.current=false;document.removeEventListener('mousemove',onMouseMove);document.removeEventListener('mouseup',onMouseUp);document.body.style.cursor='';document.body.style.userSelect='';};
    document.body.style.cursor='col-resize';
    document.body.style.userSelect='none';
    document.addEventListener('mousemove',onMouseMove);
    document.addEventListener('mouseup',onMouseUp);
  },[sidebarWidth]);
  const handleTouchStart=useCallback(event=>{
    const touch=event.touches[0];
    const startX=touch.clientX, startWidth=sidebarWidth;
    const onTouchMove=moveEvent=>{
      const delta=moveEvent.touches[0].clientX-startX;
      const newWidth=Math.min(SIDEBAR_MAX,Math.max(SIDEBAR_MIN,startWidth+delta));
      setSidebarWidth(newWidth);
    };
    const onTouchEnd=()=>{document.removeEventListener('touchmove',onTouchMove);document.removeEventListener('touchend',onTouchEnd);};
    document.addEventListener('touchmove',onTouchMove,{passive:true});
    document.addEventListener('touchend',onTouchEnd);
  },[sidebarWidth]);
  useEffect(()=>{
    if(!accountOpen)return;
    const dismiss=event=>{if(!accountRef.current?.contains(event.target))setAccountOpen(false);};
    const escape=event=>{if(event.key==="Escape") {setAccountOpen(false);accountRef.current?.querySelector('button')?.focus();}};
    document.addEventListener('pointerdown',dismiss);
    document.addEventListener('keydown',escape);
    return()=>{document.removeEventListener('pointerdown',dismiss);document.removeEventListener('keydown',escape);};
  },[accountOpen]);
  const [passwordOpen,setPasswordOpen]=useState(false);
  const [dialog,setDialog]=useState(null);
  const [toast,setToast]=useState("");
  const openForm=(title,readonly=false)=>setDialog({title,readonly});
  const activeLabel=role.menus.find(item=>item[0]===active)?.[1]||"Thông tin cá nhân";
  const pageDescriptions={
    majors:"Quản lý danh mục chuyên ngành và đơn vị đào tạo.",
    classes:"Theo dõi niên khóa, giảng viên phụ trách và sĩ số lớp.",
    teachers:"Tra cứu tài khoản, vai trò và thông tin giảng viên.",
    students:"Tra cứu và quản lý tài khoản sinh viên CN/KSTN.",
    permissions:"Quản lý vai trò và phạm vi truy cập của giảng viên.",
    rounds:"Theo dõi thời gian, đối tượng và trạng thái xét tuyển.",
    roundsView:"Tra cứu các đợt xét tuyển chương trình tài năng.",
    criteria:"Tra cứu điều kiện, trọng số và tiêu chí xét tuyển.",
    approvals:"Kiểm tra minh chứng và phê duyệt hồ sơ sinh viên.",
    results:"Theo dõi danh sách và kết quả xét tuyển.",
    finalApproval:"Kiểm tra và xác nhận danh sách trúng tuyển.",
    studentPasswords:"Tra cứu tài khoản sinh viên cần đặt lại mật khẩu."
  };
  const renderPage=()=>{
    if(active==="majors")return <MajorManagement majors={majors} setMajors={setMajors} onToast={setToast}/>;
    if(active==="classes")return <ClassManagement classes={classRecords} setClasses={setClassRecords} majors={majors} onToast={setToast}/>;
    if(active==="permissions")return <PermissionManagement permissions={permissionRecords} setPermissions={setPermissionRecords} onToast={setToast}/>;
    if(active==="teachers")return <TeacherManagement onToast={setToast} onOpenForm={openForm}/>;
    if(active==="students")return <StudentManagement students={studentAccounts} setStudents={setStudentAccounts} classes={classRecords} onToast={setToast}/>;
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
  const NavButton=({item,mobile=false})=>{const [id,label,icon]=item, Icon=menuIcons[icon]||BookOpen; return <button title={sidebarCollapsed&&!mobile?label:undefined} aria-current={active===id?"page":undefined} onClick={()=>{setActive(id);setAccountOpen(false);setMobileNavOpen(false);}} className={`dashboard-nav-item ${mobile?"shrink-0":"w-full"} flex items-center ${sidebarCollapsed&&!mobile?"justify-center px-0":"px-3"} gap-3 py-2.5 text-left text-[13px] font-medium transition ${active===id?mobile?"is-active-mobile bg-white text-brand":"is-active bg-slate-700 text-white":"text-slate-400 hover:bg-slate-800 hover:text-white"}`}><Icon size={17} aria-hidden="true" className="shrink-0"/>{(!sidebarCollapsed||mobile)&&<span className="sidebar-label">{label}</span>}</button>;};
  return <div className="dashboard-shell flex h-[100dvh] overflow-hidden bg-slate-50">
    <a className="skip-link" href="#workspace-content">Đến nội dung chính</a>
    <aside ref={sidebarRef} className={`dashboard-sidebar sidebar-resizable hidden shrink-0 flex-col border-r border-white/10 lg:flex ${sidebarCollapsed?"sidebar-collapsed":""}`} style={sidebarCollapsed?{width:64}:{width:sidebarWidth}}>
      <div className={`dashboard-logo-panel flex h-[72px] items-center bg-white ${sidebarCollapsed?"justify-center px-2":"px-4"}`}>{sidebarCollapsed?<img src={logo} alt="IUH" className="h-9 w-9 object-contain"/>:<img src={logo} alt="IUH - Khoa Công nghệ Thông tin" className="h-11 w-full object-contain"/>}</div>
      {!sidebarCollapsed&&<div className="sidebar-role px-4 pb-2 pt-5 text-[10px] font-bold uppercase tracking-[.12em] text-slate-500">{role.label}</div>}
      <nav aria-label="Chức năng quản lý" className={`sidebar-nav flex-1 space-y-1 overflow-y-auto ${sidebarCollapsed?"px-1.5":"px-3"} pb-3 scrollbar-thin`}>{role.menus.map(item=><NavButton key={item[0]} item={item}/>)}</nav>
      <div className={`sidebar-collapse-toggle border-t border-white/10 ${sidebarCollapsed?"px-1.5":"px-3"} py-3`}><button title={sidebarCollapsed?"Mở rộng sidebar":"Thu gọn sidebar"} aria-label={sidebarCollapsed?"Mở rộng sidebar":"Thu gọn sidebar"} onClick={()=>setSidebarCollapsed(value=>!value)} className={`flex w-full items-center ${sidebarCollapsed?"justify-center":"gap-3 px-3"} py-2.5 text-[13px] font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white`}>{sidebarCollapsed?<PanelLeftOpen size={17}/>:<><PanelLeftClose size={17}/><span>Thu gọn</span></>}</button></div>
      {!sidebarCollapsed&&<div className="sidebar-resize-handle" role="separator" aria-orientation="vertical" aria-label="Kéo để thay đổi độ rộng sidebar" tabIndex={0} onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} onKeyDown={event=>{if(event.key==="ArrowLeft")setSidebarWidth(value=>Math.max(SIDEBAR_MIN,value-20));if(event.key==="ArrowRight")setSidebarWidth(value=>Math.min(SIDEBAR_MAX,value+20));}} onDoubleClick={()=>setSidebarWidth(SIDEBAR_DEFAULT)}><GripVertical size={12} aria-hidden="true"/></div>}
    </aside>
    <div className="flex min-w-0 flex-1 flex-col"><header className="dashboard-topbar flex h-[72px] shrink-0 items-center justify-between gap-3 px-4 md:px-6"><a className="workspace-brand" href="index.html"><span>IUH / CN &amp; KSTN</span><strong>Cổng quản lý xét tuyển</strong></a><div ref={accountRef} className="relative"><button aria-controls="account-options" aria-expanded={accountOpen} aria-label="Menu tài khoản" className="account-trigger flex items-center gap-2 p-1.5 text-left transition" onClick={()=>setAccountOpen(value=>!value)}><span className="grid size-9 place-items-center bg-brand text-xs font-bold text-white">{role.initials}</span><span className="hidden sm:block"><strong className="block text-xs text-slate-800">{role.name}</strong><small className="text-[11px] text-slate-500">{role.label}</small></span><ChevronDown size={15} className="text-slate-400"/></button>{accountOpen&&<div id="account-options" className="account-menu absolute right-0 top-[calc(100%+8px)] z-40 w-56 border border-slate-200 bg-white p-2 text-sm"><button className="flex w-full items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50" onClick={()=>{setActive("profile");setAccountOpen(false);}}><User size={16}/>Thông tin cá nhân</button><button className="flex w-full items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50" onClick={()=>{setPasswordOpen(true);setAccountOpen(false);}}><LockKeyhole size={16}/>Đổi mật khẩu</button><button className="flex w-full items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50" onClick={()=>{setToast("Đã gửi hướng dẫn khôi phục mật khẩu đến email tài khoản.");setAccountOpen(false);}}><RotateCcw size={16}/>Khôi phục mật khẩu</button><div className="my-1 border-t border-slate-100"/><a href="index.html" className="flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50"><LogOut size={16}/>Đăng xuất</a></div>}</div></header>
      <div className="mobile-navigation lg:hidden"><button className="mobile-menu-trigger" aria-expanded={mobileNavOpen} aria-controls="mobile-navigation" onClick={()=>setMobileNavOpen(value=>!value)}><Menu size={19} aria-hidden="true"/><span>{activeLabel}</span><ChevronDown size={16} aria-hidden="true"/></button><nav id="mobile-navigation" aria-label="Chức năng quản lý" hidden={!mobileNavOpen} className="dashboard-mobile-nav">{role.menus.map(item=><NavButton key={item[0]} item={item} mobile/>)}</nav></div>
      <main id="workspace-content" tabIndex={-1} className="dashboard-workspace min-h-0 flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin"><div className="workspace-inner mx-auto max-w-[1440px]">{!["application","profile"].includes(active)&&<PageHead title={activeLabel} description={pageDescriptions[active]||tableData[active]?.desc}/>}<div key={active} className="workspace-page">{renderPage()}</div></div></main>
    </div>
    <Modal open={passwordOpen} onClose={()=>setPasswordOpen(false)} title="Đổi mật khẩu"><form onSubmit={event=>{event.preventDefault();setPasswordOpen(false);setToast("Đổi mật khẩu thành công.");}} className="space-y-4" autoComplete="off"><label className="block"><span className="ui-label">Mật khẩu hiện tại</span><input className="ui-input" type="password" autoComplete="off" required/></label><label className="block"><span className="ui-label">Mật khẩu mới</span><input className="ui-input" type="password" minLength="8" autoComplete="off" required/><small className="mt-1 block text-xs text-slate-500">Tối thiểu 8 ký tự, có chữ hoa, chữ thường và ký tự đặc biệt.</small></label><label className="block"><span className="ui-label">Xác nhận mật khẩu mới</span><input className="ui-input" type="password" minLength="8" autoComplete="off" required/></label><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" className="ui-btn-secondary" onClick={()=>setPasswordOpen(false)}>Hủy</button><button className="ui-btn-primary">Đổi mật khẩu</button></div></form></Modal>
    <GenericFormModal dialog={dialog} setDialog={setDialog} onToast={setToast}/><Toast message={toast} onClose={()=>setToast("")}/>
  </div>;
}

export default function App({roleKey}) { return roleKey==="public"?<PublicHome/>:<Dashboard roleKey={roleKey}/>; }

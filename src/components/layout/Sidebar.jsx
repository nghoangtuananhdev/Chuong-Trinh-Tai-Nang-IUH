import { useRef, useCallback } from "react";
import {
  BookOpen,
  GraduationCap,
  UserCog,
  Users,
  ShieldCheck,
  CalendarCheck,
  ClipboardList,
  ClipboardCheck,
  KeyRound,
  FileText,
  LayoutDashboard,
  Network,
  Stamp,
  ChartColumn,
  ScrollText,
  Mail,
  Settings,
  Bell,
  UserRound,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import logoWhite from "../../../assets/img/brand/iuh-logo-white.svg";
import faviconMark from "../../../assets/img/brand/favicon-32x32.png";
import { Tooltip } from "../ui/Tooltip.jsx";

const menuIcons = {
  dashboard: LayoutDashboard,
  catalog: Network,
  book: BookOpen,
  class: GraduationCap,
  teacher: UserCog,
  users: Users,
  permission: ShieldCheck,
  calendar: CalendarCheck,
  criteria: ClipboardList,
  approve: ClipboardCheck,
  stamp: Stamp,
  report: ChartColumn,
  audit: ScrollText,
  mail: Mail,
  settings: Settings,
  bell: Bell,
  key: KeyRound,
  file: FileText,
  profile: UserRound
};

export const SIDEBAR_MIN = 200;
export const SIDEBAR_MAX = 360;
export const SIDEBAR_DEFAULT = 248;
export const SIDEBAR_COLLAPSED = 72;

/** Logo + vai trò + phạm vi — dùng chung cho sidebar desktop và drawer mobile. */
export function SidebarBrand({ role, collapsed = false }) {
  return (
    <div className="shrink-0">
      <div className={collapsed ? "flex justify-center px-2 pt-5 pb-4" : "px-5 pt-5 pb-4"}>
        <a href="#/" aria-label="Về trang chủ" className="on-dark inline-flex items-center rounded-xs">
          <img
            src={collapsed ? faviconMark : logoWhite}
            alt="IUH"
            className={collapsed ? "size-8 rounded-xs" : "h-10 w-auto"}
          />
        </a>
      </div>
      {!collapsed && (
        <div className="border-b border-white/10 px-5 pb-4">
          <p className="text-body-sm font-semibold text-white">{role.label}</p>
          <p className="mt-0.5 break-words text-body-sm text-brand-200">
            {role.scope}
          </p>
        </div>
      )}
    </div>
  );
}

export function SidebarNav({ role, activePage, onNavigate, collapsed = false }) {
  return (
    <nav aria-label="Chức năng không gian làm việc" className={`scrollbar-thin flex-1 space-y-0.5 overflow-y-auto py-2 ${collapsed ? "px-2" : "px-3"}`}>
      {role.menus.map(([id, label, iconKey]) => {
        const Icon = menuIcons[iconKey] || BookOpen;
        const isActive = activePage === id;
        const item = (
          <button
            type="button"
            aria-current={isActive ? "page" : undefined}
            aria-label={collapsed ? label : undefined}
            onClick={() => onNavigate(id)}
            className={`on-dark relative flex min-h-10 w-full items-center gap-3 rounded-control py-2 text-left text-body-sm transition-colors duration-120 ${
              collapsed ? "justify-center px-0" : "px-3"
            } ${
              isActive
                ? "bg-white font-semibold text-brand-700"
                : "font-medium text-brand-100 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon size={18} aria-hidden="true" className={`shrink-0 ${isActive ? "text-brand-600" : "text-brand-200"}`} />
            {!collapsed && <span className="min-w-0 break-words">{label}</span>}
          </button>
        );
        return collapsed ? (
          <Tooltip key={id} label={label} side="right" delay={150} className="flex w-full">
            {item}
          </Tooltip>
        ) : (
          <div key={id}>{item}</div>
        );
      })}
    </nav>
  );
}

export function Sidebar({ role, activePage, onNavigate, collapsed, onToggleCollapse, width, onWidthChange }) {
  const isDragging = useRef(false);
  const handleRef = useRef(null);

  const handleMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      isDragging.current = true;
      handleRef.current?.setAttribute("data-dragging", "true");
      const startX = e.clientX;
      const startWidth = width;

      const onMouseMove = (moveEvent) => {
        if (!isDragging.current) return;
        const next = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, startWidth + moveEvent.clientX - startX));
        onWidthChange(next);
      };

      const onMouseUp = () => {
        isDragging.current = false;
        handleRef.current?.removeAttribute("data-dragging");
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [width, onWidthChange]
  );

  return (
    <aside
      className="relative z-30 hidden shrink-0 select-none flex-col border-r border-brand-700 bg-brand-600 text-white transition-[width] duration-180 lg:flex"
      style={{ width: collapsed ? SIDEBAR_COLLAPSED : width }}
    >
      <SidebarBrand role={role} collapsed={collapsed} />
      <SidebarNav role={role} activePage={activePage} onNavigate={onNavigate} collapsed={collapsed} />

      <div className="w-full shrink-0 border-t border-white/10 p-3">
        {(() => {
          const label = collapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng";
          const btn = (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={label}
              className={`on-dark flex h-10 w-full items-center gap-2.5 rounded-control text-body-sm font-medium text-brand-100 transition-colors hover:bg-white/10 hover:text-white ${
                collapsed ? "justify-center" : "px-3"
              }`}
            >
              {collapsed ? (
                <PanelLeftOpen size={18} aria-hidden="true" />
              ) : (
                <>
                  <PanelLeftClose size={18} aria-hidden="true" />
                  <span>Thu gọn</span>
                </>
              )}
            </button>
          );
          return collapsed ? (
            <Tooltip label={label} side="right" delay={150} className="flex w-full">
              {btn}
            </Tooltip>
          ) : (
            btn
          );
        })()}
      </div>

      {!collapsed && (
        <div
          ref={handleRef}
          role="separator"
          tabIndex={0}
          aria-orientation="vertical"
          aria-valuenow={width}
          aria-valuemin={SIDEBAR_MIN}
          aria-valuemax={SIDEBAR_MAX}
          aria-label="Kéo để thay đổi độ rộng thanh điều hướng"
          onMouseDown={handleMouseDown}
          onDoubleClick={() => onWidthChange(SIDEBAR_DEFAULT)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") onWidthChange(Math.max(SIDEBAR_MIN, width - 20));
            if (e.key === "ArrowRight") onWidthChange(Math.min(SIDEBAR_MAX, width + 20));
          }}
          className="on-dark group absolute inset-y-0 -right-[3px] z-10 w-1.5 cursor-col-resize"
        >
          <span className="absolute inset-y-0 left-[2px] w-0.5 bg-transparent transition-colors group-hover:bg-white/40 group-focus-visible:bg-accent-400 group-data-[dragging=true]:bg-accent-400" />
        </div>
      )}
    </aside>
  );
}

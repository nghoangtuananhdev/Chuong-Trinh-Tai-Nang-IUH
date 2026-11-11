import { useState, useEffect } from "react";
import { WorkspaceHeader } from "../components/layout/WorkspaceHeader.jsx";
import {
  Sidebar,
  SidebarBrand,
  SidebarNav,
} from "../components/layout/Sidebar.jsx";
import { RoleSwitcher } from "../components/layout/RoleSwitcher.jsx";
import { NotificationBell } from "../components/layout/NotificationBell.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Drawer } from "../components/ui/Drawer.jsx";
import { useBackend } from "../mock/backend.jsx";
import { useToast } from "../components/ui/ToastProvider.jsx";
import { ROLE_LABEL } from "../domain/constants.js";
import {
  studentProfile,
  maintenanceRounds,
  scopeLabel,
} from "../domain/selectors.js";
import { MENUS } from "./menus.js";
import { navigate, buildHref } from "./router.js";
export function WorkspaceLayout({ route, children }) {
  const { db, me, activeRole, call } = useBackend(),
    { showToast } = useToast();
  const [mobile, setMobile] = useState(false),
    [collapsed, setCollapsed] = useState(false),
    [width, setWidth] = useState(248);
  let menus = MENUS[activeRole.role] ?? [];
  if (activeRole.role === "STUDENT" && studentProfile(db, me.id)?.isKSTN) {
    menus = menus.filter((m) => m[0] !== "open-rounds");
    if (maintenanceRounds(db, me.id).length)
      menus = [
        menus[0],
        ["maintenance", "Cập nhật hồ sơ tích lũy", "file"],
        ...menus.slice(1),
      ];
  }
  const role = {
    label: ROLE_LABEL[activeRole.role],
    scope: `Phạm vi: ${scopeLabel(db, activeRole)}`,
    menus,
  };
  const go = (page) => {
    navigate(`/app/${page}`);
    setMobile(false);
  };
  const page = route.segments[1],
    label =
      menus.find((m) => m[0] === page)?.[1] ??
      {
        dashboard: "Tổng quan",
        profile: "Thông tin cá nhân",
        "doi-mat-khau": "Đổi mật khẩu",
        apply: "Nộp hồ sơ",
        maintenance: "Cập nhật hồ sơ tích lũy",
        "open-rounds": "Đợt xét tuyển đang mở",
        "my-applications": "Hồ sơ của tôi",
        approvals: "Danh sách phê duyệt",
        records: "Hồ sơ sinh viên",
        reviews: "Duyệt hồ sơ",
        rounds: "Đợt xét tuyển",
        classes: "Lớp",
        criteria: "Bộ tiêu chí",
        "email-outbox": "Hàng đợi email",
        notifications: "Thông báo",
      }[page] ??
      "Chi tiết";
  useEffect(() => {
    document
      .querySelector("[data-page-heading]")
      ?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [route.path]);
  return (
    <div className="flex min-h-screen bg-ink-50">
      <a href="#workspace-main" className="skip-link">
        Đến nội dung chính
      </a>
      <div className="sticky top-0 hidden h-screen lg:flex">
        <Sidebar
          role={role}
          activePage={page}
          onNavigate={go}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          width={width}
          onWidthChange={setWidth}
        />
      </div>
      <Drawer
        open={mobile}
        onClose={() => setMobile(false)}
        title="Chức năng không gian làm việc"
        side="left"
        size="nav"
        sheetOnMobile={false}
      >
        <div className="bg-brand-600 text-white">
          <SidebarBrand role={role} />
          <SidebarNav role={role} activePage={page} onNavigate={go} />
        </div>
      </Drawer>
      <div className="min-w-0 flex-1">
        <WorkspaceHeader
          role={{ ...role, name: me.fullName }}
          activeLabel={label}
          onNavigate={go}
          onOpenPassword={() => navigate("/app/doi-mat-khau")}
          onToggleMobileNav={() => setMobile(!mobile)}
          mobileNavOpen={mobile}
        />
        <main
          id="workspace-main"
          tabIndex={-1}
          className="mx-auto max-w-screen-2xl space-y-6 px-4 pb-24 pt-6 sm:px-6 lg:px-8"
        >
          <div>
            <h1 data-page-heading tabIndex={-1} className="text-title-1 text-ink-900 outline-none">
              {label}
            </h1>
          </div>
          {children}
        </main>
        <p aria-live="polite" className="sr-only">
          {label}
        </p>
      </div>
    </div>
  );
}

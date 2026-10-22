import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { DemoStoreProvider, useDemoStore } from "./data/demo-store.jsx";
import { roles } from "./data/fixtures.js";
import { pageMeta } from "./data/page-meta.js";
import { ToastStack } from "./components/ui/Toast.jsx";
import { Drawer } from "./components/ui/Drawer.jsx";
import { IconButton } from "./components/ui/IconButton.jsx";
import { Sidebar, SidebarBrand, SidebarNav, SIDEBAR_DEFAULT, SIDEBAR_MAX, SIDEBAR_MIN } from "./components/layout/Sidebar.jsx";
import { WorkspaceHeader } from "./components/layout/WorkspaceHeader.jsx";
import { PublicHome } from "./features/public/PublicHome.jsx";
import { MajorManagement } from "./features/majors/MajorManagement.jsx";
import { ClassManagement } from "./features/classes/ClassManagement.jsx";
import { TeacherManagement } from "./features/teachers/TeacherManagement.jsx";
import { StudentManagement } from "./features/students/StudentManagement.jsx";
import { PermissionManagement } from "./features/permissions/PermissionManagement.jsx";
import { RoundsPage } from "./features/rounds/RoundsPage.jsx";
import { CriteriaPage } from "./features/criteria/CriteriaPage.jsx";
import { ApprovalsPage } from "./features/approvals/ApprovalsPage.jsx";
import { StudentApplicationPage } from "./features/student-application/StudentApplicationPage.jsx";
import { PasswordResetPage } from "./features/passwords/PasswordResetPage.jsx";
import { ProfilePage } from "./features/profile/ProfilePage.jsx";
import { ChangePasswordModal } from "./features/passwords/ChangePasswordModal.jsx";

const SIDEBAR_STORAGE_KEY = "iuh_talent_v2_sidebar";

function readSidebarPrefs() {
  try {
    const raw = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        collapsed: Boolean(parsed.collapsed),
        width: Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, Number(parsed.width) || SIDEBAR_DEFAULT))
      };
    }
  } catch {
    // localStorage không khả dụng — dùng mặc định
  }
  return { collapsed: false, width: SIDEBAR_DEFAULT };
}

function WorkspaceShell() {
  const { currentRole, setCurrentRoleKey, toasts, hideToast } = useDemoStore();
  const [activePage, setActivePage] = useState(() => currentRole.menus?.[0]?.[0] || "majors");

  const [sidebarPrefs, setSidebarPrefs] = useState(readSidebarPrefs);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(null);
  const firstRender = useRef(true);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(sidebarPrefs));
    } catch {
      // bỏ qua
    }
  }, [sidebarPrefs]);

  // Đồng bộ trang đang mở khi đổi vai trò
  useEffect(() => {
    if (currentRole.menus && currentRole.menus.length > 0) {
      const pageExists = currentRole.menus.some((m) => m[0] === activePage);
      if (!pageExists && activePage !== "profile") {
        setActivePage(currentRole.menus[0][0]);
      }
    }
  }, [currentRole, activePage]);

  // Đổi trang: cuộn về đầu và đưa focus vào H1 của trang mới
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    scrollRef.current?.scrollTo({ top: 0 });
    const id = requestAnimationFrame(() => {
      document.querySelector("[data-page-heading]")?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, [activePage]);

  const handleSwitchRole = (newRoleKey) => {
    setCurrentRoleKey(newRoleKey);
    const targetRole = roles[newRoleKey];
    if (targetRole && targetRole.menus.length > 0) {
      setActivePage(targetRole.menus[0][0]);
    }
  };

  const activeLabel =
    activePage === "profile"
      ? "Thông tin cá nhân"
      : currentRole.menus.find((m) => m[0] === activePage)?.[1] || pageMeta[activePage]?.title || "Không gian làm việc";

  const renderActiveFeature = () => {
    switch (activePage) {
      case "majors":
      case "majorsFaculty":
        return <MajorManagement pageKey={activePage} />;
      case "classes":
        return <ClassManagement pageKey={activePage} readonly={false} />;
      case "classesView":
        return <ClassManagement pageKey={activePage} readonly={true} />;
      case "teachers":
        return <TeacherManagement pageKey={activePage} />;
      case "students":
        return <StudentManagement pageKey={activePage} />;
      case "permissions":
        return <PermissionManagement pageKey={activePage} />;
      case "rounds":
        return <RoundsPage pageKey={activePage} readonly={false} />;
      case "roundsView":
        return <RoundsPage pageKey={activePage} readonly={true} />;
      case "criteria":
        return <CriteriaPage pageKey={activePage} />;
      case "approvals":
        return <ApprovalsPage pageKey={activePage} isFinal={false} title="Phê duyệt hồ sơ" />;
      case "results":
        return <ApprovalsPage pageKey={activePage} isFinal={true} title="Danh sách trúng tuyển" />;
      case "finalApproval":
        return <ApprovalsPage pageKey={activePage} isFinal={true} title="Duyệt danh sách trúng tuyển" />;
      case "profiles":
        return <ApprovalsPage pageKey={activePage} readonly={true} title="Hồ sơ sinh viên CN/KSTN" />;
      case "application":
        return <StudentApplicationPage />;
      case "studentPasswords":
        return <PasswordResetPage pageKey={activePage} />;
      case "profile":
        return <ProfilePage />;
      default:
        return <MajorManagement pageKey="majors" />;
    }
  };

  const navigate = (page) => {
    setActivePage(page);
    setMobileNavOpen(false);
  };

  const wide = ["application", "profile"].includes(activePage);

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50">
      <a href="#workspace-main" className="skip-link">
        Đến nội dung chính
      </a>

      <Sidebar
        role={currentRole}
        activePage={activePage}
        onNavigate={navigate}
        collapsed={sidebarPrefs.collapsed}
        onToggleCollapse={() => setSidebarPrefs((p) => ({ ...p, collapsed: !p.collapsed }))}
        width={sidebarPrefs.width}
        onWidthChange={(w) => setSidebarPrefs((p) => ({ ...p, width: w }))}
      />

      <Drawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        side="left"
        size="nav"
        sheetOnMobile={false}
        hideHeader
        title="Chức năng không gian làm việc"
        panelClassName="overflow-hidden bg-brand-900 !rounded-l-none text-white"
      >
        <div className="relative flex min-h-0 flex-1 flex-col bg-brand-900 text-white">
          <div className="flex shrink-0 justify-end px-2 pt-2">
            <IconButton
              icon={X}
              label="Đóng menu"
              variant="tertiary"
              size="sm"
              onClick={() => setMobileNavOpen(false)}
              className="on-dark !text-white/80 hover:!bg-white/10 hover:!text-white"
            />
          </div>
          <SidebarBrand role={currentRole} />
          <SidebarNav role={currentRole} activePage={activePage} onNavigate={navigate} />
        </div>
      </Drawer>

      <div
        ref={scrollRef}
        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}
        className="scrollbar-thin flex min-w-0 flex-1 flex-col overflow-y-auto"
      >
        <WorkspaceHeader
          role={currentRole}
          activeLabel={activeLabel}
          onNavigate={(page) => setActivePage(page)}
          onOpenPassword={() => setPasswordModalOpen(true)}
          onSwitchRole={handleSwitchRole}
          onToggleMobileNav={() => setMobileNavOpen((v) => !v)}
          mobileNavOpen={mobileNavOpen}
          scrolled={scrolled}
        />

        <main id="workspace-main" tabIndex={-1} className="flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8">
          <div key={activePage} className={`page-in mx-auto ${wide ? "max-w-[1080px]" : "max-w-[1440px]"}`}>
            {renderActiveFeature()}
          </div>
        </main>
      </div>

      <p className="sr-only" aria-live="polite" role="status">
        {activeLabel}
      </p>

      <ChangePasswordModal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />

      <ToastStack toasts={toasts} onClose={hideToast} />
    </div>
  );
}

function MainApp() {
  const { currentRoleKey, setCurrentRoleKey, toasts, hideToast } = useDemoStore();

  const handleSelectRoleFile = (roleFile) => {
    const map = {
      "sinh-vien.html": "student",
      "giang-vien-phu-trach.html": "lecturer",
      "chu-nhiem-nganh.html": "head",
      "ban-lanh-dao-khoa.html": "dean",
      "dai-dien-phong-dao-tao.html": "training",
      "quan-tri-vien.html": "admin"
    };
    setCurrentRoleKey(map[roleFile] || "admin");
  };

  if (currentRoleKey === "public") {
    return (
      <>
        <PublicHome onSelectRole={handleSelectRoleFile} />
        <ToastStack toasts={toasts} onClose={hideToast} />
      </>
    );
  }

  return <WorkspaceShell />;
}

export default function App({ roleKey = "public" }) {
  return (
    <DemoStoreProvider initialRole={roleKey}>
      <MainApp />
    </DemoStoreProvider>
  );
}

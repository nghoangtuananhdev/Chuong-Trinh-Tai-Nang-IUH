import { useState, useRef, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  User,
  Lock,
  LogOut,
  Menu,
  MapPin,
} from "lucide-react";
import { Avatar } from "../ui/Display.jsx";
import { IconButton } from "../ui/IconButton.jsx";
import { RoleSwitcher } from "./RoleSwitcher.jsx";
import { NotificationBell } from "./NotificationBell.jsx";
import { useBackend } from "../../mock/backend.jsx";
import { useToast } from "../ui/ToastProvider.jsx";
import { navigate } from "../../app/router.js";

export function WorkspaceHeader({
  role,
  activeLabel,
  onNavigate,
  onOpenPassword,
  onToggleMobileNav,
  mobileNavOpen,
}) {
  const { call } = useBackend();
  const { showToast } = useToast();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!accountOpen) return undefined;
    const handleDismiss = (e) => {
      if (!accountRef.current?.contains(e.target)) setAccountOpen(false);
    };
    document.addEventListener("pointerdown", handleDismiss);
    return () => document.removeEventListener("pointerdown", handleDismiss);
  }, [accountOpen]);

  // Focus mục đầu tiên khi mở menu
  useEffect(() => {
    if (accountOpen)
      menuRef.current?.querySelector('[role="menuitem"]')?.focus();
  }, [accountOpen]);

  const closeMenu = (restoreFocus = true) => {
    setAccountOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  const onMenuKeyDown = (e) => {
    const items = Array.from(
      menuRef.current?.querySelectorAll('[role="menuitem"]') || [],
    );
    const idx = items.indexOf(document.activeElement);
    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(idx + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    } else if (e.key === "Tab") {
      setAccountOpen(false);
    }
  };

  const itemCls =
    "flex min-h-10 w-full items-center gap-2.5 px-4 py-2 text-left text-body text-ink-900 outline-none transition-colors hover:bg-ink-50 focus-visible:bg-ink-50";

  return (
    <header
      className="sticky top-0 z-20 flex h-14 shrink-0 flex-nowrap items-center justify-between gap-4 border-b border-ink-200 bg-white px-4 sm:px-6"
    >
      <div className="flex min-w-0 items-center gap-3">
        <IconButton
          icon={Menu}
          label="Mở menu"
          variant="secondary"
          onClick={onToggleMobileNav}
          aria-expanded={mobileNavOpen}
          className="lg:hidden"
        />

        <nav
          aria-label="Đường dẫn điều hướng"
          className="hidden min-w-0 flex-nowrap items-center gap-1.5 overflow-hidden whitespace-nowrap text-body-sm text-ink-600 sm:flex"
        >
          <span className="truncate text-ink-600">Cổng xét tuyển</span>
          <ChevronRight
            size={14}
            className="shrink-0 text-ink-300"
            aria-hidden="true"
          />
          <span className="truncate font-medium text-ink-700">{role.label}</span>
          <ChevronRight
            size={14}
            className="shrink-0 text-ink-300"
            aria-hidden="true"
          />
          <span
            aria-current="page"
            className="truncate font-medium text-ink-900"
          >
            {activeLabel}
          </span>
        </nav>

        <span className="truncate text-title-3 text-ink-900 sm:hidden">
          {activeLabel}
        </span>
      </div>

      <div className="flex shrink-0 flex-nowrap items-center gap-3">
        <RoleSwitcher />
        <NotificationBell />

        <div ref={accountRef} className="relative">
          <button
            ref={triggerRef}
            type="button"
            aria-expanded={accountOpen}
            aria-haspopup="menu"
            aria-label="Tùy chọn tài khoản"
            onClick={() => setAccountOpen((v) => !v)}
            className="flex items-center gap-2 rounded-control border border-transparent p-1.5 transition-colors hover:border-ink-200 hover:bg-ink-25"
          >
            <Avatar initials={role.initials} name={role.name} size={32} />
            <div className="hidden max-w-40 text-left leading-tight lg:block">
              <strong className="block truncate text-body-sm font-semibold text-ink-900">
                {role.name}
              </strong>
              <span className="text-caption text-ink-600">{role.label}</span>
            </div>
            <ChevronDown
              size={14}
              className={`hidden shrink-0 text-ink-500 transition-transform duration-180 sm:block ${accountOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          {accountOpen && (
            <div
              ref={menuRef}
              role="menu"
              aria-label="Tùy chọn tài khoản"
              onKeyDown={onMenuKeyDown}
              className="popover-in absolute right-0 top-[calc(100%+8px)] z-40 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-card border border-ink-200 bg-white py-1.5 shadow-overlay"
            >
              <div className="border-b border-ink-200 px-4 pb-3 pt-2">
                <p className="truncate font-semibold text-ink-900">
                  {role.name}
                </p>
                <p className="text-body-sm text-ink-600">{role.label}</p>
                <p className="mt-0.5 truncate text-body-sm font-medium text-brand-700">
                  {role.scope}
                </p>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => {
                    onNavigate("profile");
                    closeMenu(false);
                  }}
                  className={itemCls}
                >
                  <User size={16} className="text-ink-500" aria-hidden="true" />
                  <span>Thông tin cá nhân</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => {
                    onOpenPassword();
                    closeMenu(false);
                  }}
                  className={itemCls}
                >
                  <Lock size={16} className="text-ink-500" aria-hidden="true" />
                  <span>Đổi mật khẩu</span>
                </button>
              </div>

              <div className="border-t border-ink-200 pt-1">
                <button
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  className={`${itemCls} text-danger-fg hover:bg-danger-bg focus-visible:bg-danger-bg`}
                  onClick={async () => {
                    try {
                      await call("auth.logout");
                      closeMenu(false);
                      navigate("/");
                    } catch (error) {
                      showToast(error.message, "error");
                    }
                  }}
                >
                  <LogOut size={16} aria-hidden="true" />
                  <span>Đăng xuất (Về trang chủ)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

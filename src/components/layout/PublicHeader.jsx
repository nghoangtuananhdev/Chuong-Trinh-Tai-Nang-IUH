import { useEffect, useState } from "react";
import { ArrowUpRight, LogIn, Menu, X } from "lucide-react";
import logo from "../../../assets/img/logo-iuh-khoa-cntt.svg";
import logoWhite from "../../../assets/img/brand/iuh-logo-white.svg";
import { Button } from "../ui/Button.jsx";
import { IconButton } from "../ui/IconButton.jsx";

/**
 * Header trang công khai. Đặt trên khối xanh IUH: trong suốt, logo trắng;
 * cuộn xuống thành nền trắng mờ kính với logo Khoa CNTT.
 */
export function PublicHeader({ onOpenLogin }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const dark = !scrolled;
  // Đang ở trang chủ thì cuộn tới quy trình thay vì nạp lại route.
  const toProcess = (e) => {
    const list = document.getElementById("quy-trinh");
    if (!list) return;
    e.preventDefault();
    setMenuOpen(false);
    list.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  const linkCls = `items-center gap-1.5 rounded-full px-3.5 py-2 text-body font-medium transition-colors ${
    dark ? "on-dark text-brand-50 hover:bg-white/10 hover:text-white" : "text-ink-700 hover:bg-brand-50 hover:text-brand-700"
  }`;
  const menuLinkCls = "flex w-full items-center gap-1.5 rounded-control px-3 py-2.5 text-body font-medium text-ink-800 hover:bg-brand-50 hover:text-brand-700";

  return (
    <header
      className={`sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-300 ${
        dark ? "border-b border-transparent bg-transparent" : "border-b border-ink-200/70 bg-white/85 shadow-raised backdrop-blur-xl backdrop-saturate-150"
      }`}
    >
      <div className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-[height] duration-300 sm:px-6 lg:px-10 ${scrolled ? "h-16" : "h-20"}`}>
        <a href="#/" className={`flex min-w-0 shrink-0 items-center gap-3 rounded-xs ${dark ? "on-dark" : ""}`} aria-label="IUH - Về trang chủ">
          <span className="relative grid h-10 sm:h-11">
            <img
              src={logoWhite}
              alt=""
              className={`col-start-1 row-start-1 h-10 w-auto object-contain transition-opacity duration-300 sm:h-11 ${dark ? "opacity-100" : "opacity-0"}`}
            />
            <img
              src={logo}
              alt=""
              className={`col-start-1 row-start-1 h-10 w-auto object-contain transition-opacity duration-300 sm:h-11 ${dark ? "opacity-0" : "opacity-100"}`}
            />
          </span>
          <span className="sr-only">Trường Đại học Công nghiệp TP. Hồ Chí Minh · Khoa Công nghệ Thông tin</span>
          <span className={`hidden border-l pl-3 lg:block ${dark ? "border-white/25" : "border-ink-200"}`}>
            <span className={`block text-body-sm font-semibold leading-5 ${dark ? "text-white" : "text-brand-900"}`}>Cổng xét tuyển</span>
            <span className={`block text-caption ${dark ? "text-brand-100" : "text-ink-600"}`}>Cử nhân tài năng · Kỹ sư tài năng</span>
          </span>
        </a>

        <nav aria-label="Điều hướng cổng tuyển sinh" className="flex shrink-0 items-center gap-1">
          <a href="#/" onClick={toProcess} className={`${linkCls} hidden md:inline-flex`}>
            Quy trình xét tuyển
          </a>
          <a href="#/dang-ky" className={`${linkCls} hidden md:inline-flex`}>
            Đăng ký tài khoản
          </a>
          <a href="https://iuh.edu.vn" target="_blank" rel="noreferrer" className={`${linkCls} hidden lg:inline-flex`}>
            <span>iuh.edu.vn</span>
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <Button variant={dark ? "accent" : "primary"} size="md" icon={LogIn} onClick={onOpenLogin} className="ml-2">
            Đăng nhập
          </Button>
          <div className="relative md:hidden">
            <IconButton
              icon={menuOpen ? X : Menu}
              label={menuOpen ? "Đóng menu" : "Mở menu"}
              variant="secondary"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              tooltip={false}
              className="ml-1"
            />
            {menuOpen && (
              <div className="popover-in absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-card border border-ink-200 bg-white p-1.5 shadow-overlay">
                <a href="#/" onClick={(e) => { toProcess(e); setMenuOpen(false); }} className={menuLinkCls}>
                  Quy trình xét tuyển
                </a>
                <a href="#/dang-ky" onClick={() => setMenuOpen(false)} className={menuLinkCls}>
                  Đăng ký tài khoản
                </a>
                <a href="https://iuh.edu.vn" target="_blank" rel="noreferrer" className={menuLinkCls}>
                  <span>Website trường IUH</span>
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

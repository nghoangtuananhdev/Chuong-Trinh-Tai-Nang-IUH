import { useEffect, useState } from "react";
import { ArrowUpRight, GraduationCap, LogIn, Menu, X } from "lucide-react";
import logo from "../../../assets/img/logo-iuh-khoa-cntt.svg";
import { Button } from "../ui/Button.jsx";
import { IconButton } from "../ui/IconButton.jsx";

export function PublicHeader({ onOpenLogin }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
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

  const linkCls = "items-center gap-1.5 rounded-control px-3 py-2 text-body font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900";

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-[background-color,box-shadow,border-color] duration-180 ${
        scrolled ? "border-ink-200 bg-white/90 shadow-raised backdrop-blur-md" : "border-ink-200 bg-white"
      }`}
    >
      <div
        className={`mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 transition-[height] duration-180 sm:px-6 lg:px-8 ${scrolled ? "h-[60px]" : "h-[72px]"}`}
      >
        <div className="flex min-w-0 items-center gap-4">
          <a href="index.html" className="flex shrink-0 items-center" aria-label="IUH - Về trang chủ">
            <img src={logo} alt="IUH - Khoa Công nghệ Thông tin" className="h-10 w-auto object-contain sm:h-11" />
          </a>
          <div className="hidden min-w-0 border-l border-ink-200 pl-4 lg:block">
            <p className="line-clamp-2 text-body font-bold leading-5 text-brand-900">
              Cổng thông tin xét tuyển chương trình Cử nhân tài năng &amp; Kỹ sư tài năng
            </p>
            <p className="hidden truncate text-body-sm text-ink-600 2xl:block">Trường Đại học Công nghiệp Thành phố Hồ Chí Minh · Khoa Công nghệ Thông tin</p>
          </div>
        </div>

        <nav aria-label="Điều hướng cổng tuyển sinh" className="flex shrink-0 items-center gap-1">
          <a href="#cac-dot-xet-tuyen" className={`${linkCls} hidden md:inline-flex`}>
            <GraduationCap size={16} aria-hidden="true" />
            <span>Thông tin xét tuyển</span>
          </a>
          <a href="https://iuh.edu.vn" target="_blank" rel="noreferrer" className={`${linkCls} hidden md:inline-flex`}>
            <span>Website trường IUH</span>
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <Button variant="primary" size="md" icon={LogIn} onClick={onOpenLogin} className="ml-1">
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
            />
            {menuOpen && (
              <div className="popover-in absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-card border border-ink-200 bg-white p-1.5 shadow-overlay">
                <a href="#cac-dot-xet-tuyen" onClick={() => setMenuOpen(false)} className={`${linkCls} flex w-full`}>
                  <GraduationCap size={16} aria-hidden="true" />
                  <span>Thông tin xét tuyển</span>
                </a>
                <a href="https://iuh.edu.vn" target="_blank" rel="noreferrer" className={`${linkCls} flex w-full`}>
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

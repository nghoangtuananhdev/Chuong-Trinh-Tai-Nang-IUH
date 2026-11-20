import { ArrowUpRight } from "lucide-react";
import logoWhite from "../../../assets/img/brand/iuh-logo-white.svg";

/** Chân trang công khai: dải xanh thẫm, góc chữ U phía trên. */
export function PublicFooter() {
  return (
    <footer className="on-dark relative isolate mt-20 overflow-hidden rounded-tr-u bg-brand-950 text-brand-100 lg:rounded-tr-hero">
      <div aria-hidden="true" className="chev-pattern absolute inset-0 -z-10 opacity-60" />
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-10">
        <div className="space-y-4">
          <img src={logoWhite} alt="Trường Đại học Công nghiệp TP. Hồ Chí Minh" className="h-12 w-auto" />
          <p className="text-body-sm">Khoa Công nghệ Thông tin</p>
        </div>
        <div className="space-y-2 text-body-sm md:text-right">
          <a
            href="https://iuh.edu.vn"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-xs font-semibold text-white hover:text-accent-400"
          >
            iuh.edu.vn
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <p className="text-brand-200">Bản prototype · dữ liệu minh họa</p>
        </div>
      </div>
    </footer>
  );
}

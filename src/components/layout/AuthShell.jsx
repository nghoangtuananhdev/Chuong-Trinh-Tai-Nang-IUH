import { ArrowLeft } from "lucide-react";
import logoWhite from "../../../assets/img/brand/iuh-logo-white.svg";
import { buildHref } from "../../app/router.js";
import { ChevronField } from "../ui/ChevronField.jsx";

/** Khung trang xác thực: khối xanh IUH với trường chevron + cột biểu mẫu. */
export function AuthShell({ title, children, footer }) {
  return (
    <div className="min-h-screen bg-ink-50 lg:grid lg:grid-cols-12">
      <aside className="on-dark relative isolate flex h-20 items-center overflow-hidden rounded-bl-u bg-brand-600 px-4 sm:px-6 lg:sticky lg:top-0 lg:col-span-5 lg:h-screen lg:flex-col lg:items-stretch lg:justify-between lg:rounded-bl-none lg:rounded-br-hero lg:p-12">
        <div aria-hidden="true" className="chev-pattern absolute inset-0 -z-20" />
        <ChevronField className="-z-10 max-lg:hidden" quality="low" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-brand-800/95 via-brand-700/60 to-brand-700/10" />
        <a href={buildHref("/")} className="inline-flex shrink-0 items-center rounded-xs" aria-label="Về trang chủ">
          <img src={logoWhite} alt="IUH" className="h-9 w-auto lg:h-12" />
        </a>
        <div className="hidden lg:block">
          <p className="text-display text-white">
            Cổng xét tuyển
            <br />
            <span className="whitespace-nowrap">Cử nhân tài năng</span>
            <br />
            <span className="whitespace-nowrap">&amp; Kỹ sư tài năng</span>
          </p>
          <p className="mt-8 text-body-sm text-brand-200">Trường Đại học Công nghiệp TP. Hồ Chí Minh · Khoa Công nghệ Thông tin</p>
        </div>
      </aside>
      <main className="px-4 py-10 sm:px-6 lg:col-span-7 lg:flex lg:items-center lg:justify-center lg:py-14">
        <div className="page-in mx-auto w-full max-w-md space-y-6">
          <a href={buildHref("/")} className="inline-flex items-center gap-1.5 rounded-full text-body-sm font-semibold text-brand-600 hover:text-brand-700">
            <ArrowLeft size={14} aria-hidden="true" />
            Về trang chủ
          </a>
          <h1 data-page-heading tabIndex={-1} className="text-display text-brand-950 outline-none">
            {title}
          </h1>
          {children}
          {footer}
        </div>
      </main>
    </div>
  );
}

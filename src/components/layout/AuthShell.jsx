import { ArrowLeft } from "lucide-react";
import logoWhite from "../../../assets/img/brand/iuh-logo-white.svg";
import { buildHref } from "../../app/router.js";

/** Khung trang xác thực: cột thương hiệu xanh IUH + cột biểu mẫu. */
export function AuthShell({ title, children, footer }) {
  return (
    <div className="min-h-screen bg-ink-50 lg:grid lg:grid-cols-12">
      <aside className="flex h-16 items-center bg-brand-600 px-4 sm:px-6 lg:col-span-5 lg:h-auto lg:min-h-screen lg:flex-col lg:items-stretch lg:justify-between lg:p-10">
        <a href={buildHref("/")} className="on-dark inline-flex shrink-0 items-center rounded-xs" aria-label="Về trang chủ">
          <img src={logoWhite} alt="IUH" className="h-8 w-auto lg:h-12" />
        </a>
        <div className="hidden lg:block">
          <p className="text-title-2 text-white">Cổng thông tin xét tuyển chương trình Cử nhân tài năng &amp; Kỹ sư tài năng</p>
          <p className="mt-2 text-body-sm text-brand-100">Trường Đại học Công nghiệp Thành phố Hồ Chí Minh · Khoa Công nghệ Thông tin</p>
        </div>
      </aside>
      <main className="px-4 py-8 sm:px-6 lg:col-span-7 lg:flex lg:items-center lg:justify-center lg:py-12">
        <div className="mx-auto w-full max-w-md space-y-5">
          <a href={buildHref("/")} className="inline-flex items-center gap-1.5 text-body-sm font-medium text-brand-600 hover:text-brand-700">
            <ArrowLeft size={14} aria-hidden="true" />
            Về trang chủ
          </a>
          <h1 data-page-heading tabIndex={-1} className="text-title-1 text-ink-900 outline-none">
            {title}
          </h1>
          {children}
          {footer}
        </div>
      </main>
    </div>
  );
}

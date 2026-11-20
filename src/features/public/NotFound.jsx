import { ArrowLeft, LogIn } from "lucide-react";
import { PublicHeader } from "../../components/layout/PublicHeader.jsx";
import { PublicFooter } from "../../components/layout/PublicFooter.jsx";
import { Button } from "../../components/ui/Button.jsx";

/** Đường dẫn không tồn tại — gồm các link cũ tới đợt/kết quả công khai đã bỏ (A-25). */
export function NotFound({ onLogin, onHome }) {
  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <PublicHeader onOpenLogin={onLogin} />
      <section className="on-dark relative isolate -mt-20 overflow-hidden rounded-bl-u bg-brand-600 pt-20 text-white lg:rounded-bl-hero">
        <div aria-hidden="true" className="chev-pattern absolute inset-0 -z-20" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-brand-800/90 to-brand-600/10" />
        <div className="page-in mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <h1 data-page-heading tabIndex={-1} className="text-display outline-none">
            Không tìm thấy trang
          </h1>
          <p className="mt-3 max-w-2xl text-body-lg text-brand-100">
            Đợt xét tuyển và kết quả chỉ xem được sau khi đăng nhập.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="accent" size="lg" icon={LogIn} onClick={onLogin}>
              Đăng nhập
            </Button>
            <Button variant="onDark" size="lg" icon={ArrowLeft} onClick={onHome}>
              Về trang chủ
            </Button>
          </div>
        </div>
      </section>
      <div className="flex-1" />
      <PublicFooter />
    </div>
  );
}

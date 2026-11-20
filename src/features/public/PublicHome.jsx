import { motion } from "motion/react";
import { ArrowRight, LogIn } from "lucide-react";
import { useBackend } from "../../mock/backend.jsx";
import { PublicHeader } from "../../components/layout/PublicHeader.jsx";
import { PublicFooter } from "../../components/layout/PublicFooter.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ChevronField, ChevronMark } from "../../components/ui/ChevronField.jsx";

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] } }),
};

/**
 * Trang chủ công khai. Đợt xét tuyển và kết quả KHÔNG hiển thị công khai:
 * sinh viên phải đăng ký tài khoản, hệ thống mới hiện đợt theo ngành và khóa.
 */
export function PublicHome({ onLogin, onRegister, onWorkspace }) {
  const { db, me } = useBackend();
  const steps = [
    {
      actor: "Chủ nhiệm ngành",
      title: "Nhập danh sách sinh viên",
      text: "Theo từng khóa, trước khi mở đăng ký.",
    },
    {
      actor: "Sinh viên",
      title: "Đăng ký tài khoản",
      text: "Bằng email @student.iuh.edu.vn và mã OTP; ngành, khóa lấy từ danh sách.",
    },
    {
      actor: "Hệ thống",
      title: "Hiện đợt phù hợp",
      text: "Chỉ đợt của lớp CN/KSTN cùng ngành, cùng khóa.",
    },
    {
      actor: "Sinh viên",
      title: "Nộp hồ sơ",
      text: `Khai tiêu chí, tải minh chứng PDF/JPG/PNG tối đa ${db.config.files.maxMb} MB/tệp.`,
    },
    {
      actor: "Giảng viên phụ trách",
      short: "GV phụ trách",
      title: "Xét duyệt",
      text: "Kiểm tiêu chí và minh chứng, có thể yêu cầu bổ sung kèm hạn.",
    },
    {
      actor: "Ba cấp phê duyệt",
      short: "CNN · BLĐ · PĐT",
      title: "Phê duyệt và công bố",
      text: "Chủ nhiệm ngành → Ban lãnh đạo khoa → Phòng Đào tạo. Kết quả gửi về tài khoản và email.",
    },
  ];
  // Bước kế tiếp của người đang xem: khách → đăng ký; sinh viên → nộp hồ sơ.
  const next = !me ? 1 : me.kind === "STUDENT" ? 3 : -1;

  return (
    <div className="min-h-screen bg-ink-50">
      <a className="skip-link" href="#quy-trinh">
        Đến quy trình xét tuyển
      </a>
      <PublicHeader onOpenLogin={onLogin} />

      <section className="on-dark relative isolate -mt-20 overflow-hidden rounded-bl-u bg-brand-600 pt-20 text-white lg:rounded-bl-hero">
        <div aria-hidden="true" className="chev-pattern absolute inset-0 -z-20" />
        <ChevronField className="-z-10" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-r from-brand-800/95 via-brand-700/70 to-brand-700/0 max-lg:via-brand-800/75 max-lg:to-brand-800/45"
        />
        <div className="mx-auto max-w-7xl px-4 pb-36 pt-12 sm:px-6 lg:px-10 lg:pb-44 lg:pt-24">
          <motion.h1
            data-page-heading
            tabIndex={-1}
            initial="hidden"
            animate="show"
            variants={rise}
            className="max-w-5xl text-hero outline-none"
          >
            Xét tuyển <span className="whitespace-nowrap">Cử nhân tài năng</span>
            <br className="max-lg:hidden" /> <span className="whitespace-nowrap">&amp; Kỹ sư tài năng</span>
          </motion.h1>
          <motion.p initial="hidden" animate="show" custom={1} variants={rise} className="mt-5 max-w-xl text-body-lg text-brand-100">
            Đăng ký bằng email sinh viên IUH để xem các đợt dành cho ngành và khóa của bạn.
          </motion.p>
          <motion.div initial="hidden" animate="show" custom={2} variants={rise} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            {me ? (
              <Button variant="accent" size="lg" iconRight={ArrowRight} onClick={onWorkspace}>
                Vào trang của bạn
              </Button>
            ) : (
              <>
                <Button variant="accent" size="lg" iconRight={ArrowRight} onClick={onRegister}>
                  Đăng ký tài khoản sinh viên
                </Button>
                <Button variant="onDark" size="lg" icon={LogIn} onClick={onLogin}>
                  Đã có tài khoản? Đăng nhập
                </Button>
              </>
            )}
          </motion.div>
          {!me && (
            <motion.p initial="hidden" animate="show" custom={3} variants={rise} className="mt-6 max-w-xl text-body-sm text-brand-100">
              Chỉ sinh viên có tên trong danh sách do Chủ nhiệm ngành nhập mới đăng ký được.
            </motion.p>
          )}
        </div>
      </section>

      <main id="quy-trinh" className="relative mx-auto -mt-24 max-w-7xl scroll-mt-24 px-4 sm:px-6 lg:-mt-28 lg:px-10">
        <motion.section
          initial={{ y: 40 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          aria-labelledby="quy-trinh-title"
          className="overflow-hidden rounded-modal bg-white shadow-sheet ring-1 ring-ink-200/70"
        >
          <div className="px-5 pb-2 pt-7 sm:px-8 sm:pt-9">
            <h2 id="quy-trinh-title" className="text-title-1 text-brand-950">
              Quy trình xét tuyển
            </h2>
          </div>
          <ol className="chev-track grid gap-y-6 px-5 pb-8 pt-6 sm:px-8 lg:grid-cols-6 lg:gap-y-0" style={{ "--k": "14px" }}>
            {steps.map((s, i) => {
              const mine = i === next;
              return (
                <li key={s.title} className="page-in min-w-0" style={{ animationDelay: `${340 + i * 70}ms` }}>
                  <span aria-hidden="true" title={s.actor} className={`chev-seg h-14 max-lg:hidden ${mine ? "bg-accent-500" : "bg-brand-600"}`}>
                    <span className={`flex h-full items-center gap-2 pl-7 pr-5 text-body-sm font-semibold ${mine ? "text-brand-950" : "text-white"}`}>
                      <span className="text-title-2 tabular-nums">{i + 1}</span>
                      <span className="truncate">{s.short ?? s.actor}</span>
                    </span>
                  </span>
                  <div className="flex gap-4 lg:block lg:pr-5 lg:pt-4">
                    <span
                      aria-hidden="true"
                      className={`chev-up flex h-11 w-9 shrink-0 items-center justify-center pt-1 text-body font-bold tabular-nums lg:hidden ${
                        mine ? "bg-accent-500 text-brand-950" : "bg-brand-600 text-white"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-title-3 text-pretty text-brand-950">{s.title}</h3>
                      <p className="mt-1 text-body-sm text-ink-600">
                        <span className="font-semibold text-brand-600 lg:sr-only">{s.actor} · </span>
                        {s.text}
                      </p>
                      {mine && (
                        <p className="mt-2 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-brand-50 py-1 pl-2 pr-2.5 text-caption font-semibold text-brand-700">
                          <ChevronMark className="text-caption text-accent-500" />
                          Bước tiếp theo
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </motion.section>
      </main>

      <PublicFooter />
    </div>
  );
}

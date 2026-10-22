import { useMemo, useState } from "react";
import { Search, RotateCcw, Building2, CalendarClock, Clock, ArrowRight, Users, ArrowUpRight } from "lucide-react";
import { PublicHeader } from "../../components/layout/PublicHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { FilterTabs } from "../../components/ui/FilterTabs.jsx";
import { CodeTag } from "../../components/ui/Display.jsx";
import { RoundDetailModal } from "./RoundDetailModal.jsx";
import { PublicApplyModal } from "./PublicApplyModal.jsx";
import { LoginModal } from "./LoginModal.jsx";
import { useDemoStore } from "../../data/demo-store.jsx";
import logo from "../../../assets/img/logo-iuh-khoa-cntt.svg";

const STATUS_TABS = [
  { value: "open", label: "Đang mở (Đang nhận hồ sơ)" },
  { value: "review", label: "Đang xét duyệt" },
  { value: "upcoming", label: "Chưa mở" },
  { value: "closed", label: "Đã kết thúc" }
];

const accentBar = {
  open: "bg-success-solid",
  review: "bg-warning-solid",
  upcoming: "bg-info-solid",
  closed: "bg-ink-300"
};

/** Tách "01/08 - 15/08/2026" thành 2 mốc; nếu không parse được trả null để hiện nguyên chuỗi. */
function parseRange(time = "") {
  const m = time.match(/^\s*(\d{1,2}\/\d{1,2})(?:\/(\d{4}))?\s*-\s*(\d{1,2}\/\d{1,2})(?:\/(\d{4}))?\s*$/);
  if (!m) return null;
  return { start: m[1], end: m[3], year: m[4] || m[2] };
}

function DateBlock({ time }) {
  const range = parseRange(time);
  if (!range) {
    return (
      <span className="inline-flex items-center gap-2 text-body-sm text-ink-700">
        <CalendarClock size={16} className="text-brand-600" aria-hidden="true" />
        <span className="tabular-nums">{time}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 flex-col items-center rounded-control border border-ink-200 bg-ink-25 px-3 py-2 text-center" aria-label={time}>
      <span className="text-body font-bold tabular-nums text-ink-900">{range.start}</span>
      <span aria-hidden="true" className="my-1 h-px w-5 bg-ink-300" />
      <span className="text-body font-bold tabular-nums text-ink-900">{range.end}</span>
      {range.year && <span className="mt-0.5 text-caption tabular-nums text-ink-500">{range.year}</span>}
    </span>
  );
}

export function PublicHome({ onSelectRole }) {
  const { rounds } = useDemoStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [selectedDetailRound, setSelectedDetailRound] = useState(null);
  const [selectedApplyRound, setSelectedApplyRound] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);

  const filteredRounds = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return rounds.filter((r) => {
      const matchStatus = !statusFilter || r.status === statusFilter;
      const matchQuery = !query || `${r.id} ${r.name} ${r.major} ${r.desc}`.toLowerCase().includes(query);
      return matchStatus && matchQuery;
    });
  }, [rounds, searchQuery, statusFilter]);

  const tabOptions = useMemo(
    () => [
      { value: "", label: "Tất cả trạng thái", count: rounds.length },
      ...STATUS_TABS.map((t) => ({ ...t, count: rounds.filter((r) => r.status === t.value).length }))
    ],
    [rounds]
  );

  const hasFilterActive = Boolean(searchQuery || statusFilter);
  const reset = () => {
    setSearchQuery("");
    setStatusFilter("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <a href="#cac-dot-xet-tuyen" className="skip-link">
        Đến danh sách đợt xét tuyển
      </a>

      <PublicHeader onOpenLogin={() => setLoginOpen(true)} />

      {/* Hero */}
      <section className="academic-grid on-dark relative bg-brand-900 text-white">
        <div className="mx-auto max-w-[1200px] px-4 pb-24 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pb-28">
          <span className="honor-rule on-dark mb-4" aria-hidden="true" />
          <p className="text-overline uppercase text-accent-300">CHƯƠNG TRÌNH CỬ NHÂN &amp; KỸ SƯ TÀI NĂNG (CN/KSTN)</p>
          <h1 className="mt-3 font-bold max-sm:text-[2rem] max-sm:leading-10 max-sm:tracking-[-0.022em] sm:text-display">Các đợt xét tuyển</h1>
          <p className="mt-3 max-w-[56ch] text-body-lg text-white/75">
            Tra cứu thông tin, điều kiện tiêu chuẩn và chọn đợt xét tuyển phù hợp với chương trình đào tạo của bạn.
          </p>

          <div className="relative mt-8 max-w-[720px]">
            <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên đợt, mã đợt hoặc chuyên ngành..."
              aria-label="Tìm kiếm đợt xét tuyển"
              className="h-14 w-full rounded-card border border-white/20 bg-white pl-12 pr-4 text-body-lg text-ink-900 shadow-overlay outline-none placeholder:text-ink-400 focus:border-white focus:ring-4 focus:ring-white/25 [&::-webkit-search-cancel-button]:hidden"
            />
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-white/10 pt-4">
            <p className="text-overline uppercase text-white/70">Học thuật · Chất lượng · Đổi mới</p>
            <p className="text-overline uppercase text-white/70">ĐẠI HỌC CÔNG NGHIỆP TP. HỒ CHÍ MINH</p>
          </div>
        </div>
      </section>

      <main id="cac-dot-xet-tuyen" tabIndex={-1} className="flex-1 px-4 pb-16 outline-none sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          {/* Thanh lọc nổi chồng lên hero */}
          <div className="relative z-10 -mt-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-card border border-ink-200 bg-white px-3 shadow-card sm:px-4">
            <FilterTabs appearance="underline" label="Lọc theo trạng thái đợt xét tuyển" options={tabOptions} value={statusFilter} onChange={setStatusFilter} className="min-w-0 max-w-full" />
            {hasFilterActive && (
              <Button variant="tertiary" size="sm" icon={RotateCcw} onClick={reset}>
                Đặt lại
              </Button>
            )}
          </div>

          <div className="mb-4 mt-6 px-1">
            <p className="text-body-sm font-semibold text-ink-600" role="status" aria-atomic="true">
              {filteredRounds.length} đợt xét tuyển khả dụng
            </p>
          </div>

          {filteredRounds.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {filteredRounds.map((round) => {
                const isOpen = round.status === "open";
                const isReview = round.status === "review";
                const isClosed = round.status === "closed";

                return (
                  <article
                    key={round.id}
                    className={`group relative flex flex-col overflow-hidden rounded-card border shadow-card transition-[box-shadow,border-color] duration-180 hover:border-ink-300 hover:shadow-overlay ${
                      isClosed ? "border-ink-200 bg-ink-25" : "border-ink-200 bg-white"
                    }`}
                  >
                    {isOpen && <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-[3px] ${accentBar.open}`} />}
                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <CodeTag>{round.id}</CodeTag>
                        <StatusBadge domain="round">{round.label || round.status}</StatusBadge>
                      </div>

                      <h2 className={`text-title-2 ${isClosed ? "text-ink-700" : "text-ink-900"}`}>{round.name}</h2>
                      <p className="mt-2 line-clamp-2 text-body text-ink-600">{round.desc}</p>

                      <div className="mt-5 flex items-center gap-4">
                        <DateBlock time={round.time} />
                        <ul className="min-w-0 space-y-2 text-body-sm text-ink-700">
                          <li className="flex items-center gap-2">
                            <Building2 size={16} className="shrink-0 text-brand-600" aria-hidden="true" />
                            <span className="truncate">{round.major}</span>
                          </li>
                          {round.quota ? (
                            <li className="flex items-center gap-2">
                              <Users size={16} className="shrink-0 text-brand-600" aria-hidden="true" />
                              <span className="tabular-nums">{round.quota} sinh viên</span>
                            </li>
                          ) : null}
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-ink-200 px-6 py-4">
                      <Button variant="secondary" size="md" onClick={() => setSelectedDetailRound(round)}>
                        Xem chi tiết
                      </Button>

                      {isOpen ? (
                        <Button variant="primary" size="md" iconRight={ArrowRight} onClick={() => setSelectedApplyRound(round)}>
                          Nộp hồ sơ
                        </Button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-body-sm text-ink-500">
                          <Clock size={14} aria-hidden="true" />
                          {isReview ? "Đang trong kỳ chấm" : "Chưa nhận hồ sơ"}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="ui-card p-6">
              <EmptyState
                title="Không tìm thấy đợt xét tuyển phù hợp"
                description="Hãy thử thay đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc trạng thái để xem tất cả các đợt."
                actionLabel="Đặt lại bộ lọc"
                onAction={reset}
              />
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-ink-200 bg-white">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="h-8 w-auto object-contain" />
            <p className="text-body-sm text-ink-600">Trường Đại học Công nghiệp Thành phố Hồ Chí Minh · Khoa Công nghệ Thông tin</p>
          </div>
          <a href="https://iuh.edu.vn" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-body-sm font-medium text-brand-700 hover:underline">
            Website trường IUH
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </footer>

      <RoundDetailModal round={selectedDetailRound} onClose={() => setSelectedDetailRound(null)} onApply={(r) => setSelectedApplyRound(r)} />
      <PublicApplyModal round={selectedApplyRound} onClose={() => setSelectedApplyRound(null)} />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onSelectRole={onSelectRole} />
    </div>
  );
}

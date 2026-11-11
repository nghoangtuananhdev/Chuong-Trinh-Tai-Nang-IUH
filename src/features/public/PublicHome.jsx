import { useState } from "react";
import { CalendarClock, Search, SearchX, Users } from "lucide-react";
import { useBackend } from "../../mock/backend.jsx";
import { PublicHeader } from "../../components/layout/PublicHeader.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Field, Input, Select } from "../../components/ui/Form.jsx";
import { FilterTabs } from "../../components/ui/FilterTabs.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { CodeTag, DescriptionList } from "../../components/ui/Display.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { Pagination } from "../../components/ui/Pagination.jsx";
import { Panel } from "../../components/ui/Panel.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { RoundTrack } from "../../components/domain-ui/RoundTrack.jsx";
import { CriteriaTable } from "../../components/domain-ui/CriteriaTable.jsx";
import { usePagedFilter } from "../../hooks/usePagedFilter.js";
import { ROUND_STATUSES } from "../../domain/constants.js";
import { classifyFlow } from "../../domain/flows.js";
import { studentProfile } from "../../domain/selectors.js";
import { roundView } from "../../domain/selectors.js";
import { formatIct } from "../../domain/time.js";
export function PublicHome({
  onLogin,
  onApply,
  onLookup,
  onDetail,
  onResults,
}) {
  const { db, me } = useBackend();
  const allowed = (r) =>
    !me || (me.kind === "STUDENT" && classifyFlow(db, me.id, r).allowed);
  const maintaining = me && studentProfile(db, me.id)?.isKSTN;
  const [academicYear, setAcademicYear] = useState(""),
    [semester, setSemester] = useState(""),
    [faculty, setFaculty] = useState(""),
    [detail, setDetail] = useState(null);
  const rounds = db.rounds
    .filter((r) => r.status !== "draft")
    .map((r) => roundView(db, r));
  const list = usePagedFilter(rounds, {
    match: (r, q, status) =>
      (!status || r.status === status) &&
      (!academicYear || r.academicYear === academicYear) &&
      (!semester || r.semester === semester) &&
      (!faculty || r.faculty?.id === faculty) &&
      `${r.code} ${r.name} ${r.faculty?.name} ${r.major?.name}`
        .toLowerCase()
        .includes(q),
  });
  const selected = rounds.find((r) => r.id === detail);
  const openDetail = (r) => (onDetail ? onDetail(r.id) : setDetail(r.id));
  return (
    <div className="min-h-screen bg-ink-50 pb-20">
      <a className="skip-link" href="#dot-xet-tuyen">
        Đến danh sách đợt xét tuyển
      </a>
      <PublicHeader onOpenLogin={onLogin} />
      <section className="bg-brand-600 text-white">
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <p className="text-body-sm font-semibold text-accent-400">
            CHƯƠNG TRÌNH CỬ NHÂN &amp; KỸ SƯ TÀI NĂNG
          </p>
          <h1
            data-page-heading
            tabIndex={-1}
            className="mt-2 text-title-1 sm:text-display"
          >
            Các đợt xét tuyển
          </h1>
          <p className="mt-3 max-w-2xl text-body-lg text-brand-100">
            Tìm đợt xét tuyển phù hợp, xem điều kiện tham gia và theo dõi kết
            quả hồ sơ của bạn.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field
              label="Tìm theo tên đợt, mã đợt hoặc chuyên ngành"
              labelClassName="!text-white"
              className="sm:max-w-xl sm:flex-1"
            >
              <Input
                type="search"
                leadingIcon={Search}
                className="h-11"
                value={list.query}
                onChange={(e) => list.setQuery(e.target.value)}
                placeholder="Nhập từ khóa tìm kiếm…"
              />
            </Field>
            <Button
              variant="accent"
              size="md"
              className="h-11"
              onClick={onLookup ?? onLogin}
            >
              Tra cứu kết quả
            </Button>
          </div>
        </div>
      </section>
      <main
        id="dot-xet-tuyen"
        className="mx-auto max-w-6xl space-y-6 px-4 pb-6 sm:px-6 lg:px-8"
      >
        <Panel className="relative -mt-12">
        <FilterTabs
          label="Trạng thái ĐXT"
          options={[
            { value: "", label: "Tất cả", count: rounds.length },
            ...Object.entries(ROUND_STATUSES)
              .filter(([s]) => s !== "draft")
              .map(([value, meta]) => ({
                value,
                label: meta.label,
                count: rounds.filter((r) => r.status === value).length,
              })),
          ]}
          value={list.filter}
          onChange={list.setFilter}
        />
        <div className="mt-4 grid gap-4 border-t border-ink-200 pt-4 sm:grid-cols-3">
          <Field label="Năm học">
            <Select
              value={academicYear}
              onChange={(e) => {
                setAcademicYear(e.target.value);
                list.setPage(1);
              }}
            >
              <option value="">Tất cả năm học</option>
              {[...new Set(rounds.map((r) => r.academicYear))]
                .sort()
                .reverse()
                .map((y) => (
                  <option key={y}>{y}</option>
                ))}
            </Select>
          </Field>
          <Field label="Học kỳ">
            <Select
              value={semester}
              onChange={(e) => {
                setSemester(e.target.value);
                list.setPage(1);
              }}
            >
              <option value="">Tất cả học kỳ</option>
              {[...new Set(rounds.map((r) => r.semester))].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label="Khoa">
            <Select
              value={faculty}
              onChange={(e) => {
                setFaculty(e.target.value);
                list.setPage(1);
              }}
            >
              <option value="">Tất cả khoa</option>
              {db.faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        </Panel>
        <p className="text-body-sm text-ink-600" role="status">
          {list.total} đợt xét tuyển phù hợp
        </p>
        <div className="surface overflow-hidden">
          {list.total > 0 && (
            <ul className="divide-y divide-ink-200">
              {list.rows.map((r) => (
                <li key={r.id}>
                  <article className="grid min-w-0 gap-4 p-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_auto] lg:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <CodeTag>{r.code}</CodeTag>
                        <StatusBadge domain="round">{r.status}</StatusBadge>
                      </div>
                      <h2 className="mt-2 text-title-2">{r.name}</h2>
                      <p className="mt-1 text-body-sm font-medium text-brand-700">
                        {r.typeLabel}
                      </p>
                      <p className="mt-1 text-body-sm text-ink-600">
                        {r.class.code} · {r.program?.name} · {r.faculty?.name}
                      </p>
                      <p className="mt-1 text-body-sm text-ink-600">
                        Năm học {r.academicYear} · {r.semester}
                      </p>
                    </div>
                    <div className="min-w-0 space-y-2">
                      <RoundTrack
                        status={r.status}
                        size="sm"
                        showLabels={false}
                        decorative
                      />
                      <p className="flex items-start gap-2 text-body-sm tabular-nums">
                        <CalendarClock
                          size={16}
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 text-ink-500"
                        />
                        <span>
                          Tiếp nhận: {formatIct(r.intakeStart)} –{" "}
                          {formatIct(r.intakeEnd)}
                        </span>
                      </p>
                      <p className="flex items-center gap-2 text-body-sm tabular-nums">
                        <Users
                          size={16}
                          aria-hidden="true"
                          className="shrink-0 text-ink-500"
                        />
                        Sĩ số tối đa: {r.quota}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <Button variant="secondary" onClick={() => openDetail(r)}>
                        Xem chi tiết
                      </Button>
                      {r.status === "open" &&
                        !allowed(r) &&
                        me?.kind === "STUDENT" && (
                          <p className="text-body-sm text-ink-600">
                            Bạn đang học lớp CN/KSTN khác.
                          </p>
                        )}
                      {r.status === "open" && allowed(r) && (
                        <Button
                          onClick={() => (onApply ? onApply(r.id) : onLogin?.())}
                        >
                          {maintaining ? "Cập nhật hồ sơ tích lũy" : "Nộp hồ sơ"}
                        </Button>
                      )}
                      {r.status === "published" && onResults && (
                        <Button onClick={() => onResults(r.id)}>Xem kết quả</Button>
                      )}
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
          {!list.total && (
            <EmptyState
              icon={SearchX}
              title="Không có ĐXT phù hợp. Vui lòng đổi bộ lọc."
              description={null}
            />
          )}
          <Pagination {...list} onChange={list.setPage} />
        </div>
      </main>
      <footer className="mx-auto mt-10 max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="border-t border-ink-200 py-6 text-body-sm text-ink-600">
          Đại học Công nghiệp TP. Hồ Chí Minh · Bản prototype – dữ liệu minh họa
        </p>
      </footer>
      <Modal
        open={Boolean(selected)}
        onClose={() => setDetail(null)}
        title={selected?.name}
        size="xl"
      >
        {selected && (
          <div className="space-y-5">
            <DescriptionList
              items={[
                {
                  label: "Lớp",
                  value: <CodeTag>{selected.class.code}</CodeTag>,
                },
                {
                  label: "Năm học / Học kỳ",
                  value: `${selected.academicYear} · ${selected.semester}`,
                },
                {
                  label: "Tiếp nhận",
                  value: `${formatIct(selected.intakeStart)} – ${formatIct(selected.intakeEnd)}`,
                },
                {
                  label: "Xét duyệt",
                  value: `${formatIct(selected.reviewStart)} – ${formatIct(selected.reviewEnd)}`,
                },
                { label: "Sĩ số tối đa", value: selected.quota },
                {
                  label: "Bộ tiêu chí",
                  value: (
                    selected.criteriaSnapshot ??
                    db.criteriaSets.find((c) => c.id === selected.criteriaSetId)
                  )?.name,
                },
              ]}
            />
            <RoundTrack status={selected.status} />
            <p className="text-body">{selected.description}</p>
            <div className="surface overflow-hidden">
              <CriteriaTable
                snapshot={
                  selected.criteriaSnapshot ??
                  db.criteriaSets.find((c) => c.id === selected.criteriaSetId)
                }
              />
            </div>
            <p className="text-body-sm text-ink-600">
              Minh chứng PDF/JPG/PNG, tối đa {db.config.files.maxMb} MB/tệp.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

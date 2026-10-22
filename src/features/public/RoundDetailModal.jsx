import { CalendarDays, Users, CheckCircle2, FileText, ArrowRight, Clock } from "lucide-react";
import { Modal } from "../../components/ui/Modal.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { CodeTag, DescriptionList } from "../../components/ui/Display.jsx";

export function RoundDetailModal({ round, onClose, onApply }) {
  if (!round) return null;

  const isOpen = round.status === "open";

  return (
    <Modal
      open={Boolean(round)}
      onClose={onClose}
      size="lg"
      eyebrow={
        <>
          <CodeTag>{round.id}</CodeTag>
          <StatusBadge domain="round">{round.label || round.status}</StatusBadge>
        </>
      }
      title={round.name}
      description={`Mã đợt: ${round.id} · ${round.major}`}
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
          {isOpen ? (
            <Button
              variant="primary"
              iconRight={ArrowRight}
              onClick={() => {
                onClose();
                onApply(round);
              }}
            >
              Nộp hồ sơ đợt này
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-right text-body-sm text-ink-500">
              <Clock size={14} className="shrink-0" aria-hidden="true" />
              {round.status === "review"
                ? "Đợt xét tuyển đang trong giai đoạn chấm hồ sơ."
                : round.status === "closed"
                ? "Đợt xét tuyển đã kết thúc tiếp nhận hồ sơ."
                : "Đợt xét tuyển sẽ mở theo kế hoạch."}
            </span>
          )}
        </div>
      }
    >
      <div className="space-y-6 text-ink-900">
        <DescriptionList
          columns={3}
          items={[
            { label: "Trạng thái tiếp nhận", value: <StatusBadge domain="round">{round.label || round.status}</StatusBadge> },
            {
              label: "Thời gian nhận hồ sơ",
              value: (
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <CalendarDays size={14} className="text-brand-600" aria-hidden="true" />
                  {round.time}
                </span>
              )
            },
            {
              label: "Chỉ tiêu tuyển sinh",
              value: (
                <span className="inline-flex items-center gap-1.5">
                  <Users size={14} className="text-brand-600" aria-hidden="true" />
                  {round.quota ? `${round.quota} sinh viên` : "Theo chỉ tiêu khoa"}
                </span>
              )
            }
          ]}
        />

        <div>
          <h3 className="mb-2 text-title-3 text-ink-900">Mục tiêu &amp; Đối tượng áp dụng</h3>
          <p className="max-w-[68ch] text-body text-ink-600">{round.desc}</p>
          {round.target && (
            <div className="mt-3 rounded-r-control border-l-[3px] border-brand-600 bg-brand-25 px-3 py-2.5 text-body font-medium text-brand-900">
              Đối tượng: {round.target}
            </div>
          )}
        </div>

        {round.requirements && round.requirements.length > 0 && (
          <div>
            <h3 className="mb-3 text-title-3 text-ink-900">Điều kiện &amp; Tiêu chuẩn xét tuyển</h3>
            <ul className="space-y-2.5">
              {round.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2.5 text-body text-ink-800">
                  <CheckCircle2 size={16} className="mt-[3px] shrink-0 text-success-solid" aria-hidden="true" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {round.documents && round.documents.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-title-3 text-ink-900">
              <FileText size={16} className="text-brand-600" aria-hidden="true" />
              <span>Minh chứng &amp; Hồ sơ cần chuẩn bị</span>
            </h3>
            <ol className="divide-y divide-ink-200 overflow-hidden rounded-card border border-ink-200 bg-white">
              {round.documents.map((doc, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-3 text-body text-ink-800">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-xs bg-brand-50 font-mono text-caption font-semibold tabular-nums text-brand-700">
                    {i + 1}
                  </span>
                  <span>{doc}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </Modal>
  );
}

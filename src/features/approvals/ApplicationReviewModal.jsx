import { useRef, useState } from "react";
import { Award, CheckCircle2, Check, Clock, FileCheck2, FileText, Send, XCircle, AlertTriangle } from "lucide-react";
import { FullscreenDialog } from "../../components/ui/FullscreenDialog.jsx";
import { Drawer } from "../../components/ui/Drawer.jsx";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Field, Textarea } from "../../components/ui/Form.jsx";
import { CodeTag, DescriptionList, Timeline } from "../../components/ui/Display.jsx";
import { FileItem } from "../../components/ui/FileDropzone.jsx";
import { useDemoStore } from "../../data/demo-store.jsx";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";


const NOTE_WARNING = "* Khuyến nghị: Vui lòng nhập nội dung cần bổ sung vào ô ý kiến thẩm định trước khi gửi yêu cầu.";

const decisionMeta = {
  approve: { title: "Xác nhận phê duyệt hồ sơ", action: "Phê duyệt", tone: "success", icon: CheckCircle2 },
  confirm: { title: "Xác nhận trúng tuyển chính thức", action: "Xác nhận trúng tuyển", tone: "success", icon: CheckCircle2 },
  needs_update: { title: "Yêu cầu sinh viên bổ sung", action: "Yêu cầu bổ sung", tone: "warning", icon: AlertTriangle },
  reject: { title: "Xác nhận từ chối hồ sơ", action: "Từ chối", tone: "danger", icon: XCircle }
};

function SectionTitle({ children, icon: Icon }) {
  return (
    <h3 className="mb-3 flex items-center gap-2 text-title-3 text-ink-900">
      {Icon && <Icon size={16} className="text-ink-500" aria-hidden="true" />}
      <span>{children}</span>
    </h3>
  );
}

function buildCriteriaRows(application) {
  return [
    { name: "Điểm GPA tích lũy", standard: "≥ 3.20", declared: application.gpa || "3.54", highlight: true, evidence: "Có bảng điểm", verdict: "pass" },
    { name: "Số tín chỉ nợ / không đạt", standard: "0 tín chỉ", declared: `${application.creditsFailed ?? 0} tín chỉ`, evidence: "Khớp bảng điểm", verdict: "pass" },
    { name: "Điểm rèn luyện", standard: "> 80 điểm", declared: `${application.trainingScore || 90} điểm`, evidence: "Xác nhận khoa", verdict: "pass" },
    { name: "Năng lực ngoại ngữ (TOEIC)", standard: "≥ 450 điểm", declared: `${application.toeicScore || 610} điểm`, highlight: true, evidence: "Chứng chỉ TOEIC", verdict: "pass" },
    { name: "Thành tích NCKH / Cuộc thi", standard: "Khuyến khích", declared: application.achievement || "Không có", evidence: "Giấy chứng nhận", verdict: "note" }
  ];
}

function Verdict({ verdict }) {
  return verdict === "pass" ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-success-border bg-success-bg px-2 py-0.5 text-caption font-semibold text-success-fg">
      <Check size={12} strokeWidth={3} aria-hidden="true" /> Đạt
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full border border-neutral-border bg-neutral-bg px-2 py-0.5 text-caption font-semibold text-neutral-fg">
      Ghi nhận
    </span>
  );
}

function EvidenceChip({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-xs border border-ink-200 bg-ink-25 px-2 py-0.5 text-body-sm text-ink-700">
      <FileCheck2 size={13} className="text-ink-500" aria-hidden="true" />
      {children}
    </span>
  );
}

function CriteriaTable({ rows }) {
  return (
    <div className="overflow-hidden rounded-card border border-ink-200 bg-white">
      <div className="scrollbar-thin overflow-x-auto">
        <table className="ui-table">
          <caption className="sr-only">Bảng đối chiếu tiêu chuẩn &amp; Tự khai hồ sơ</caption>
          <thead>
            <tr>
              <th>Tiêu chí đánh giá</th>
              <th>Yêu cầu chuẩn</th>
              <th>Giá trị tự khai</th>
              <th>Minh chứng</th>
              <th className="text-right">Thẩm định</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td className="font-semibold text-ink-900">{r.name}</td>
                <td className="whitespace-nowrap text-ink-600">{r.standard}</td>
                <td className={`font-semibold tabular-nums ${r.highlight ? "text-brand-700" : "text-ink-900"}`}>{r.declared}</td>
                <td>
                  <EvidenceChip>{r.evidence}</EvidenceChip>
                </td>
                <td className="text-right">
                  <Verdict verdict={r.verdict} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ApplicationReviewModal({ application, onClose, isFinal = false, readonly = false }) {
  const { reviewApplication, currentRole } = useDemoStore();
  const [reviewNote, setReviewNote] = useState("");
  const [actionConfirm, setActionConfirm] = useState(null); // 'approve' | 'needs_update' | 'reject' | 'confirm'
  const [noteWarning, setNoteWarning] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const noteRef = useRef(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  if (!application) return null;

  const rows = buildCriteriaRows(application);
  const passCount = rows.filter((r) => r.verdict === "pass").length;
  const gradedCount = rows.filter((r) => r.verdict !== "note").length;
  const positiveDecision = isFinal ? "confirm" : "approve";

  const startDecision = (decision) => {
    if (decision === "needs_update" && !reviewNote.trim()) setNoteWarning(true);
    setActionConfirm(decision);
  };

  const cancelDecision = () => {
    setActionConfirm(null);
    if (noteWarning && !reviewNote.trim()) requestAnimationFrame(() => noteRef.current?.focus());
  };

  const handleClose = () => {
    setReviewNote("");
    setNoteWarning(false);
    setActionConfirm(null);
    onClose();
  };

  const handleExecuteDecision = () => {
    if (!actionConfirm) return;
    reviewApplication(application.id, actionConfirm, reviewNote.trim(), {
      name: currentRole.name,
      role: currentRole.label
    });
    handleClose();
  };

  const noteField = (
    <Field
      label="Ý kiến thẩm định & Ghi chú quyết định"
      error={noteWarning && !reviewNote.trim() ? NOTE_WARNING : undefined}
    >
      <Textarea
        ref={noteRef}
        rows={isDesktop ? 6 : 4}
        value={reviewNote}
        onChange={(e) => {
          setReviewNote(e.target.value);
          if (e.target.value.trim()) setNoteWarning(false);
        }}
        placeholder="Nhập nhận xét về tính hợp lệ của bảng điểm, ngoại ngữ, hoặc ghi rõ nội dung cần sinh viên bổ sung..."
      />
    </Field>
  );

  const previousNote = application.reviewerNote && (
    <p className="rounded-control border border-warning-border bg-warning-bg px-3 py-2 text-body-sm text-warning-fg">
      <strong>Ý kiến trước đó:</strong> {application.reviewerNote}
    </p>
  );

  const decisionButtons = (compact) => (
    <>
      <Button
        variant="primary"
        size={compact ? "md" : "lg"}
        fullWidth
        icon={isFinal ? Award : CheckCircle2}
        className={isFinal ? "[&_svg]:text-accent-300" : ""}
        onClick={() => startDecision(positiveDecision)}
      >
        {isFinal ? "Xác nhận trúng tuyển" : "Phê duyệt hồ sơ"}
      </Button>
      <Button variant="warningOutline" size={compact ? "md" : "lg"} fullWidth icon={Send} onClick={() => startDecision("needs_update")}>
        Yêu cầu bổ sung
      </Button>
      <Button
        variant="dangerOutline"
        size={compact ? "md" : "lg"}
        fullWidth
        icon={XCircle}
        className={compact ? "" : "mt-4"}
        onClick={() => startDecision("reject")}
      >
        Từ chối hồ sơ
      </Button>
    </>
  );

  const decision = actionConfirm ? decisionMeta[actionConfirm] : null;
  const trimmedNote = reviewNote.trim();

  return (
    <>
      <FullscreenDialog
        open
        onClose={handleClose}
        title={`Xét duyệt hồ sơ — ${application.studentName} (${application.studentId})`}
        subtitle={`Đợt: ${application.roundName} · Lớp: ${application.studentClass}`}
      >
        <div className="flex h-full flex-col lg:flex-row">
          {/* Cột nội dung */}
          <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[960px] space-y-8">
              {/* Dải trạng thái */}
              <div className="flex flex-col gap-3 rounded-card border border-ink-200 bg-white p-4 shadow-raised sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-overline uppercase text-ink-500">Trạng thái hiện tại</span>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <StatusBadge domain="application">{application.status}</StatusBadge>
                    <span className="text-body-sm text-ink-600">({application.reviewLevel})</span>
                  </div>
                </div>
                <div className="sm:text-right">
                  <span className="text-overline uppercase text-ink-500">Thời gian nộp hồ sơ</span>
                  <p className="mt-1.5 text-body font-semibold tabular-nums text-ink-900">{application.submittedAt}</p>
                </div>
              </div>

              <section>
                <SectionTitle>1. Thông tin sinh viên &amp; Chương trình đào tạo</SectionTitle>
                <DescriptionList
                  columns={4}
                  items={[
                    { label: "Họ và tên", value: application.studentName },
                    { label: "MSSV", value: <CodeTag tone="plain">{application.studentId}</CodeTag> },
                    { label: "Lớp sinh hoạt", value: application.studentClass },
                    { label: "Chuyên ngành", value: application.major }
                  ]}
                />
              </section>

              <section>
                <SectionTitle>2. Bảng đối chiếu tiêu chuẩn &amp; Tự khai hồ sơ</SectionTitle>
                <CriteriaTable rows={rows} />
              </section>

              <section>
                <SectionTitle>3. Danh mục tệp minh chứng đính kèm</SectionTitle>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {application.documents?.map((doc, idx) => (
                    <FileItem key={`${doc.name}-${idx}`} name={doc.name} size={doc.size || "1.2 MB"} onView={() => setPreviewDoc(doc)} />
                  ))}
                </div>
              </section>

              {/* Ghi chú: trên mobile/tablet nằm cuối cột nội dung, ngay trên lịch sử */}
              {!readonly && !isDesktop && (
                <section className="space-y-3">
                  {noteField}
                  {previousNote}
                </section>
              )}

              {application.history && application.history.length > 0 && (
                <section>
                  <SectionTitle icon={Clock}>Lịch sử xử lý hồ sơ</SectionTitle>
                  <Timeline items={application.history} />
                </section>
              )}

              {!readonly && !isDesktop && <div aria-hidden="true" className="h-36 sm:h-24" />}
            </div>
          </div>

          {/* Cột quyết định (desktop) */}
          {!readonly && isDesktop && (
            <aside className="scrollbar-thin w-[360px] shrink-0 overflow-y-auto border-l border-ink-200 bg-white">
              <div className="space-y-6 p-6">
                <div>
                  <span className="text-overline uppercase text-ink-500">Trạng thái hiện tại</span>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <StatusBadge domain="application">{application.status}</StatusBadge>
                  </div>
                  <p className="mt-1 text-body-sm text-ink-600">{application.reviewLevel}</p>
                </div>

                <div className="flex items-center justify-between rounded-control border border-ink-200 bg-ink-25 px-4 py-3">
                  <span className="text-overline uppercase text-ink-500">Thẩm định</span>
                  <span className="inline-flex items-center gap-1.5 text-body font-semibold tabular-nums text-success-fg">
                    <CheckCircle2 size={16} aria-hidden="true" />
                    {passCount}/{gradedCount} Đạt
                  </span>
                </div>

                <div className="space-y-3 border-t border-ink-200 pt-6">
                  {noteField}
                  {previousNote}
                </div>

                <div className="space-y-2.5 border-t border-ink-200 pt-6">{decisionButtons(false)}</div>
              </div>
            </aside>
          )}
        </div>

        {/* Thanh quyết định dính đáy (mobile/tablet) */}
        {!readonly && !isDesktop && (
          <div className="absolute inset-x-0 bottom-0 z-10 border-t border-ink-200 bg-white/90 px-4 py-3 backdrop-blur-md [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="mx-auto grid max-w-[960px] grid-cols-2 gap-2 sm:grid-cols-3 [&>*:first-child]:col-span-2 sm:[&>*:first-child]:col-span-1">
              {decisionButtons(true)}
            </div>
          </div>
        )}
      </FullscreenDialog>

      <ConfirmDialog
        open={Boolean(decision)}
        tone={decision?.tone || "info"}
        icon={decision?.icon}
        title={decision?.title || ""}
        description={
          decision && (
            <>
              Bạn đang thực hiện thao tác <strong className="text-ink-900">{decision.action}</strong> đối với hồ sơ của sinh viên{" "}
              <strong className="text-ink-900">{application.studentName}</strong>.
            </>
          )
        }
        note={actionConfirm === "needs_update" && !trimmedNote ? NOTE_WARNING : undefined}
        cancelLabel="Quay lại"
        confirmLabel="Xác nhận"
        confirmVariant={actionConfirm === "reject" ? "danger" : "primary"}
        onCancel={cancelDecision}
        onConfirm={handleExecuteDecision}
      >
        {trimmedNote && (
          <blockquote className="mt-3 border-l-2 border-ink-300 bg-ink-25 px-3 py-2 text-body-sm text-ink-700">
            <span className="mb-0.5 block text-overline uppercase text-ink-500">Ý kiến thẩm định &amp; Ghi chú quyết định</span>
            “{trimmedNote}”
          </blockquote>
        )}
      </ConfirmDialog>

      <Drawer
        open={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        size="lg"
        title={`Xem minh chứng — ${previewDoc?.name || ""}`}
        footer={
          <Button variant="secondary" onClick={() => setPreviewDoc(null)}>
            Đóng xem trước
          </Button>
        }
      >
        <div className="rounded-card border border-ink-200 bg-ink-25 p-6 text-center">
          <FileText size={48} className="mx-auto mb-3 text-brand-600" aria-hidden="true" />
          <h4 className="text-title-3 text-ink-900">{previewDoc?.name}</h4>
          <p className="mt-1 text-body-sm text-ink-600">Định dạng PDF · Dung lượng {previewDoc?.size || "1.2 MB"}</p>
          <div className="mt-4 rounded-control border border-ink-200 bg-white p-4 text-left font-mono text-body-sm leading-relaxed text-ink-700">
            [BẢNG ĐIỂM HỌC KỲ / CHỨNG CHỈ TIẾNG ANH ĐÍNH KÈM]
            <br />
            Sinh viên: {application.studentName}
            <br />
            MSSV: {application.studentId}
            <br />
            Ngành: {application.major}
            <br />
            Trạng thái xác thực: Đã có chữ ký số điện tử của Phòng Đào tạo IUH.
          </div>
        </div>
      </Drawer>
    </>
  );
}

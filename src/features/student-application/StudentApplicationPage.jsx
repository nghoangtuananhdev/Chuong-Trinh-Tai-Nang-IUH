import { useState, useEffect, useRef } from "react";
import { Save, Send, CheckCircle2, ArrowRight, ArrowLeft, Clock, AlertTriangle, Check, FileText, Loader2 } from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Drawer } from "../../components/ui/Drawer.jsx";
import { Stepper } from "../../components/ui/Stepper.jsx";
import { Field, Input, Select, Checkbox } from "../../components/ui/Form.jsx";
import { FileDropzone, FileItem } from "../../components/ui/FileDropzone.jsx";
import { Callout, CodeTag, DescriptionList, Timeline } from "../../components/ui/Display.jsx";
import { APPLICATION_STATUSES } from "../../data/status-definitions.js";
import { useDemoStore } from "../../data/demo-store.jsx";

const STEPS = [
  { title: "Thông tin cá nhân & đào tạo", description: "Xác thực định danh sinh viên" },
  { title: "Tiêu chí & Minh chứng", description: "Điểm số và chứng chỉ đính kèm" },
  { title: "Kiểm tra & Nộp hồ sơ", description: "Xác nhận và gửi phê duyệt" }
];

const AUTOSAVE_MS = 1500;

/** Ngưỡng theo dòng "Yêu cầu chuẩn" ở từng ô. */
const checks = {
  creditsEarned: (v) => Number(v) >= 38,
  creditsFailed: (v) => v !== "" && Number(v) === 0,
  gpa: (v) => Number(v) >= 3.2,
  trainingScore: (v) => Number(v) > 80,
  toeicScore: (v) => Number(v) >= 450
};

function Standard({ ok, children }) {
  return (
    <span className={`inline-flex items-start gap-1.5 font-medium ${ok ? "text-success-fg" : "text-warning-fg"}`}>
      {ok ? <Check size={14} strokeWidth={3} aria-hidden="true" className="mt-[3px] shrink-0" /> : <AlertTriangle size={14} aria-hidden="true" className="mt-[3px] shrink-0" />}
      <span>{children}</span>
    </span>
  );
}

function EvidenceSlot({ item, onUpload, onRemove, onView }) {
  const replaceRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div>
      <p className="mb-2 text-body font-medium text-ink-800">{item.label}</p>
      {item.name ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            onUpload(e.dataTransfer.files?.[0], item.id);
          }}
          className={`rounded-control transition-shadow ${dragging ? "ring-2 ring-brand-600" : ""}`}
        >
          <FileItem
            name={item.name}
            size={item.size}
            status={item.valid ? "ok" : "error"}
            onView={() => onView(item)}
            onReplace={() => replaceRef.current?.click()}
            onRemove={() => onRemove(item.id)}
          />
          <input
            ref={replaceRef}
            type="file"
            accept=".pdf"
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only"
            onChange={(e) => {
              onUpload(e.target.files?.[0], item.id);
              e.target.value = "";
            }}
          />
        </div>
      ) : (
        <FileDropzone compact onFiles={(files) => onUpload(files[0], item.id)}>
          <span className="text-ink-500">Chưa chọn tệp đính kèm</span>
        </FileDropzone>
      )}
    </div>
  );
}

export function StudentApplicationPage() {
  const { applications, submitApplication, saveStudentDraft, loadStudentDraft, showToast } = useDemoStore();

  const currentStudentId = "21094501";
  const existingApp = applications.find((a) => a.studentId === currentStudentId);

  const [isEditing, setIsEditing] = useState(false);
  const [step, setStep] = useState(1);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveState, setSaveState] = useState("idle"); // idle | dirty | saving | saved
  const [previewDoc, setPreviewDoc] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);
  const directionRef = useRef("forward");
  const editVersion = useRef(0);
  const [version, setVersion] = useState(0);

  const [formData, setFormData] = useState({
    studentName: "Nguyễn Hoàng Nam",
    studentId: "21094501",
    studentClass: "KSTN-KTPM-K20",
    major: "Kỹ thuật phần mềm",
    email: "nam.21094501@iuh.edu.vn",
    phone: "0901234567",
    address: "Ký túc xá IUH, Gò Vấp, TP. Hồ Chí Minh",
    creditsEarned: "42",
    creditsFailed: "0",
    gpa: "3.54",
    trainingScore: "92",
    toeicScore: "610",
    achievement: "Giải Ba NCKH sinh viên cấp Trường",
    committed: false
  });

  const [files, setFiles] = useState([
    { id: "transcript", label: "Bảng điểm kết quả học tập & rèn luyện năm 2 (PDF)", name: "bang-diem-nam-2.pdf", size: "1.2 MB", valid: true },
    { id: "language", label: "Bản sao chứng chỉ năng lực tiếng Anh TOEIC (PDF)", name: "chung-chi-toeic-610.pdf", size: "850 KB", valid: true },
    { id: "award", label: "Giấy khen / Chứng nhận thành tích NCKH (Nếu có)", name: "giay-khen-nckh-2025.pdf", size: "640 KB", valid: true }
  ]);

  useEffect(() => {
    const saved = loadStudentDraft();
    if (saved && saved.data) {
      setFormData((prev) => ({ ...prev, ...saved.data }));
      setLastSaved(saved.savedAt);
      setSaveState("saved");
    }
  }, [loadStudentDraft]);

  const update = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    editVersion.current += 1;
    setVersion(editVersion.current);
    setSaveState("dirty");
  };

  // Tự lưu nháp sau 1.5s không gõ — không bắn toast, chỉ cập nhật chỉ báo.
  useEffect(() => {
    if (version === 0) return undefined;
    const timer = setTimeout(() => {
      setSaveState("saving");
      const time = saveStudentDraft(formData, { silent: true });
      setTimeout(() => {
        if (time) {
          setLastSaved(time);
          setSaveState("saved");
        } else {
          setSaveState("dirty");
        }
      }, 350);
    }, AUTOSAVE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  // Cảnh báo mặc định của trình duyệt khi rời trang có thay đổi chưa lưu
  useEffect(() => {
    if (saveState !== "dirty" && saveState !== "saving") return undefined;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [saveState]);

  const handleSaveDraft = () => {
    setSaveState("saving");
    const time = saveStudentDraft(formData);
    if (time) {
      setLastSaved(time);
      setSaveState("saved");
    } else {
      setSaveState("dirty");
    }
  };

  const handleFileUpload = (file, fileId) => {
    if (!file) return;

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isUnder5Mb = file.size <= 5 * 1024 * 1024;

    if (!isPdf) {
      showToast("Vui lòng chọn tệp định dạng PDF (.pdf).", "error");
      return;
    }
    if (!isUnder5Mb) {
      showToast("Dung lượng tệp vượt quá 5MB. Vui lòng chọn tệp nhỏ hơn.", "error");
      return;
    }

    const sizeStr = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, name: file.name, size: sizeStr, valid: true } : f)));
    showToast(`Đã tải lên tệp "${file.name}".`, "success");
  };

  const handleRemoveFile = (fileId) => {
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, name: null, size: null, valid: false } : f)));
  };

  // Chuyển bước: chỉ tiến khi các trường bắt buộc của bước hiện tại hợp lệ
  const goToStep = (target) => {
    if (target === step) return;
    if (target > step) {
      if (target !== step + 1) return;
      if (formRef.current && !formRef.current.reportValidity()) return;
    }
    directionRef.current = target > step ? "forward" : "back";
    setStep(target);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 3) {
      goToStep(step + 1);
      return;
    }

    if (!formData.committed) {
      showToast("Vui lòng tích chọn cam kết tính chính xác của thông tin trước khi nộp.", "warning");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      submitApplication({
        studentId: formData.studentId,
        studentName: formData.studentName,
        studentClass: formData.studentClass,
        major: formData.major,
        roundCode: "DXT-2026-02",
        roundName: "Duy trì KSTN năm 3",
        type: "Duy trì năm 3",
        gpa: formData.gpa,
        creditsEarned: formData.creditsEarned,
        creditsFailed: formData.creditsFailed,
        trainingScore: formData.trainingScore,
        toeicScore: formData.toeicScore,
        achievement: formData.achievement,
        documents: files.filter((f) => f.name)
      });
      setSubmitting(false);
      setIsEditing(false);
    }, 600);
  };

  const previewDrawer = (
    <Drawer
      open={Boolean(previewDoc)}
      onClose={() => setPreviewDoc(null)}
      size="md"
      title={`Minh chứng — ${previewDoc?.name || ""}`}
    >
      <div className="rounded-card border border-ink-200 bg-ink-25 p-6 text-center">
        <FileText size={40} className="mx-auto mb-2 text-brand-600" aria-hidden="true" />
        <p className="text-body font-semibold text-ink-900">{previewDoc?.name}</p>
        <p className="mt-1 text-body-sm text-ink-500">Tệp đã nộp và được lưu trữ trong hồ sơ sinh viên.</p>
      </div>
    </Drawer>
  );

  // --- Chế độ theo dõi hồ sơ đã nộp ---
  if (existingApp && !isEditing) {
    const isNeedsUpdate = existingApp.status === "needs_update";
    const finalStatuses = ["approved", "confirmed", "rejected"];
    const isFinalStatus = finalStatuses.includes(existingApp.status);
    const firstAction = existingApp.history?.[0]?.action;
    const progress = firstAction
      ? [
          { label: firstAction, state: "done" },
          { label: existingApp.reviewLevel, state: isFinalStatus ? "done" : "active" },
          ...(isFinalStatus ? [{ label: APPLICATION_STATUSES[existingApp.status].label, state: "active" }] : [])
        ]
      : [];

    return (
      <div>
        <PageHeader
          title="Hồ sơ xét tuyển duy trì KSTN"
          description={`Đợt xét tuyển: ${existingApp.roundName} (2026 - 2027)`}
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditing(true);
                setStep(1);
              }}
            >
              Chỉnh sửa / Cập nhật hồ sơ
            </Button>
          }
        />

        {isNeedsUpdate && (
          <Callout
            tone="warning"
            className="mb-6"
            title="Cán bộ xét duyệt yêu cầu bổ sung hồ sơ"
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsEditing(true);
                  setStep(2);
                }}
              >
                Cập nhật minh chứng ngay
              </Button>
            }
          >
            {existingApp.reviewerNote || "Đề nghị kiểm tra lại bảng điểm hoặc chứng chỉ ngoại ngữ theo yêu cầu."}
          </Callout>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="ui-card divide-y divide-ink-200">
            <div className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <CodeTag>{existingApp.id}</CodeTag>
                <h2 className="mt-2 text-title-2 text-ink-900">{existingApp.roundName}</h2>
                <p className="mt-1 text-body-sm text-ink-600">
                  Ngày gửi hồ sơ: <span className="font-medium tabular-nums text-ink-900">{existingApp.submittedAt}</span>
                </p>
              </div>
              <div className="flex flex-col items-start gap-1.5 sm:items-end">
                <span className="text-overline uppercase text-ink-500">Trạng thái thẩm định</span>
                <StatusBadge domain="application">{existingApp.status}</StatusBadge>
                <span className="text-body-sm text-ink-600">({existingApp.reviewLevel})</span>
              </div>
            </div>

            {progress.length > 1 && (
              <div className="p-5 sm:p-6">
                <ol className="flex items-start" aria-label="Tiến độ hồ sơ">
                  {progress.map((p, i) => (
                    <li key={`${p.label}-${i}`} className="relative flex-1 text-center">
                      {i > 0 && <span aria-hidden="true" className="absolute right-1/2 top-[13px] h-0.5 w-full bg-brand-600" />}
                      <span
                        className={`relative z-10 mx-auto flex size-7 items-center justify-center rounded-full border-2 ${
                          p.state === "done" ? "border-success-solid bg-success-solid text-white" : "border-brand-600 bg-white text-brand-600 ring-4 ring-brand-100"
                        }`}
                      >
                        {p.state === "done" ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : <span className="size-2 rounded-full bg-brand-600" />}
                      </span>
                      <span className={`mt-2 block px-1 text-body-sm ${p.state === "active" ? "font-semibold text-ink-900" : "text-ink-600"}`}>{p.label}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="p-5 sm:p-6">
              <DescriptionList
                columns={4}
                items={[
                  { label: "Họ và tên", value: existingApp.studentName },
                  { label: "MSSV", value: <CodeTag tone="plain">{existingApp.studentId}</CodeTag> },
                  { label: "Lớp sinh hoạt", value: existingApp.studentClass },
                  { label: "Điểm GPA năm 2", value: <span className="text-brand-700">{existingApp.gpa} (Thang 4.0)</span> }
                ]}
              />
            </div>

            <div className="p-5 sm:p-6">
              <h3 className="mb-3 text-title-3 text-ink-900">Minh chứng đã đính kèm</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {existingApp.documents?.map((doc, idx) => (
                  <FileItem key={`${doc.name}-${idx}`} name={doc.name} size={doc.size || "1.2 MB"} viewLabel="Xem" onView={() => setPreviewDoc(doc)} />
                ))}
              </div>
            </div>
          </div>

          <section className="ui-card h-fit p-5 sm:p-6 xl:sticky xl:top-24">
            <h3 className="mb-4 flex items-center gap-2 text-title-3 text-ink-900">
              <Clock size={16} className="text-brand-600" aria-hidden="true" />
              <span>Tiến trình xử lý &amp; Phê duyệt</span>
            </h3>
            <Timeline items={existingApp.history || []} />
          </section>
        </div>

        {previewDrawer}
      </div>
    );
  }

  // --- Wizard ---
  const saveIndicator =
    saveState === "saving" ? (
      <span className="inline-flex items-center gap-1.5 text-body-sm text-ink-600">
        <Loader2 size={14} className="animate-spin" aria-hidden="true" /> Đang lưu…
      </span>
    ) : lastSaved && saveState === "saved" ? (
      <span className="inline-flex items-center gap-1.5 text-body-sm text-ink-600">
        <CheckCircle2 size={14} className="draw-check text-success-solid" aria-hidden="true" /> Đã lưu nháp: <span className="tabular-nums">{lastSaved}</span>
      </span>
    ) : lastSaved ? (
      <span className="text-body-sm text-ink-600">
        Đã lưu nháp: <span className="tabular-nums">{lastSaved}</span>
      </span>
    ) : null;

  const summaryRows = [
    { label: "Tín chỉ tích lũy", key: "creditsEarned", value: formData.creditsEarned },
    { label: "Nợ môn", key: "creditsFailed", value: formData.creditsFailed },
    { label: "GPA tích lũy", key: "gpa", value: formData.gpa, suffix: " / 4.0" },
    { label: "Điểm rèn luyện", key: "trainingScore", value: formData.trainingScore, suffix: " điểm" },
    { label: "Điểm TOEIC", key: "toeicScore", value: formData.toeicScore, suffix: " điểm" }
  ];

  const stepHeading =
    step === 1
      ? { title: "Bước 1: Thông tin định danh & Liên hệ", desc: "Các thông tin định danh học vụ được khóa để đảm bảo tính xác thực. Bạn có thể cập nhật thông tin liên hệ." }
      : step === 2
      ? { title: "Bước 2: Tự khai tiêu chuẩn học vụ & Đính kèm minh chứng", desc: "Điền các chỉ số kết quả học tập năm 2 và tải lên tệp chứng chỉ hợp lệ định dạng PDF (tối đa 5MB)." }
      : { title: "Bước 3: Rà soát thông tin & Xác nhận gửi hồ sơ", desc: "Vui lòng kiểm tra kỹ toàn bộ thông tin tự khai và minh chứng đính kèm trước khi nhấn gửi." };

  return (
    <div>
      <PageHeader
        title="Cập nhật hồ sơ xét tuyển duy trì KSTN"
        description="Đợt duy trì KSTN năm 3 — Hạn cập nhật hồ sơ: 25/08/2026"
        action={
          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
            <span aria-live="polite">{saveIndicator}</span>
            <Button variant="secondary" icon={Save} onClick={handleSaveDraft}>
              Lưu nháp
            </Button>
          </div>
        }
      />

      <div className="ui-card mb-6 px-4 py-5 sm:px-6">
        <Stepper steps={STEPS} current={step - 1} onStep={(i) => goToStep(i + 1)} canGoTo={(i) => i <= step} />
      </div>

      <form ref={formRef} onSubmit={handleSubmit} noValidate={false}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div key={step} className={`ui-card ${directionRef.current === "forward" ? "step-in-forward" : "step-in-back"}`}>
            <div className="border-b border-ink-200 px-5 py-4 sm:px-6">
              <h2 className="text-title-3 text-ink-900">{stepHeading.title}</h2>
              <p className="mt-0.5 max-w-[68ch] text-body-sm text-ink-600">{stepHeading.desc}</p>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              {step === 1 && (
                <>
                  <DescriptionList
                    columns={2}
                    items={[
                      { label: "Họ và tên sinh viên (Xác thực)", value: formData.studentName },
                      { label: "Mã số sinh viên (MSSV)", value: <CodeTag tone="plain">{formData.studentId}</CodeTag> },
                      { label: "Lớp sinh hoạt CN/KSTN", value: formData.studentClass },
                      { label: "Chuyên ngành đào tạo", value: formData.major }
                    ]}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Email liên hệ" required>
                      <Input type="email" value={formData.email} onChange={(e) => update("email", e.target.value)} />
                    </Field>
                    <Field label="Số điện thoại di động" required>
                      <Input type="tel" value={formData.phone} onChange={(e) => update("phone", e.target.value)} />
                    </Field>
                    <Field label="Địa chỉ liên lạc hiện tại" className="sm:col-span-2">
                      <Input value={formData.address} onChange={(e) => update("address", e.target.value)} />
                    </Field>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Số tín chỉ đạt năm 2" required hint={<Standard ok={checks.creditsEarned(formData.creditsEarned)}>Yêu cầu chuẩn: ≥ 38 tín chỉ</Standard>}>
                      <Input type="number" min="0" value={formData.creditsEarned} onChange={(e) => update("creditsEarned", e.target.value)} />
                    </Field>
                    <Field label="Số tín chỉ nợ / rớt" required hint={<Standard ok={checks.creditsFailed(formData.creditsFailed)}>Yêu cầu chuẩn: 0 tín chỉ</Standard>}>
                      <Input type="number" min="0" value={formData.creditsFailed} onChange={(e) => update("creditsFailed", e.target.value)} />
                    </Field>
                    <Field label="Điểm GPA tích lũy năm 2" required hint={<Standard ok={checks.gpa(formData.gpa)}>Yêu cầu chuẩn: ≥ 3.20</Standard>}>
                      <Input type="number" step="0.01" min="0" max="4.0" trailing="/ 4.0" value={formData.gpa} onChange={(e) => update("gpa", e.target.value)} />
                    </Field>
                    <Field label="Điểm rèn luyện năm 2" required hint={<Standard ok={checks.trainingScore(formData.trainingScore)}>Yêu cầu chuẩn: &gt; 80 điểm</Standard>}>
                      <Input type="number" min="0" max="100" value={formData.trainingScore} onChange={(e) => update("trainingScore", e.target.value)} />
                    </Field>
                    <Field label="Điểm chứng chỉ TOEIC" required hint={<Standard ok={checks.toeicScore(formData.toeicScore)}>Yêu cầu chuẩn: ≥ 450 điểm</Standard>}>
                      <Input type="number" min="0" max="990" trailing="/ 990" value={formData.toeicScore} onChange={(e) => update("toeicScore", e.target.value)} />
                    </Field>
                    <Field label="Thành tích NCKH / Cuộc thi">
                      <Select value={formData.achievement} onChange={(e) => update("achievement", e.target.value)}>
                        <option value="Không có">Không có</option>
                        <option value="Giải Ba NCKH sinh viên cấp Trường">Giải Ba NCKH cấp Trường</option>
                        <option value="Giải Nhì NCKH sinh viên cấp Trường">Giải Nhì NCKH cấp Trường</option>
                        <option value="Giải Nhất NCKH sinh viên cấp Trường">Giải Nhất NCKH cấp Trường</option>
                        <option value="Giải Khuyến khích cuộc thi học thuật">Giải Khuyến khích</option>
                      </Select>
                    </Field>
                  </div>

                  <div className="border-t border-ink-200 pt-6">
                    <h3 className="mb-4 text-title-3 text-ink-900">Tệp minh chứng đính kèm (PDF, tối đa 5MB / tệp)</h3>
                    <div className="space-y-5">
                      {files.map((item) => (
                        <EvidenceSlot key={item.id} item={item} onUpload={handleFileUpload} onRemove={handleRemoveFile} onView={setPreviewDoc} />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <section className="rounded-card border border-ink-200 bg-ink-25 p-4">
                      <div className="mb-3 flex items-center justify-between border-b border-ink-200 pb-2">
                        <h3 className="text-title-3 text-ink-900">Thông tin sinh viên</h3>
                        <Button variant="link" size="sm" onClick={() => goToStep(1)}>
                          Sửa
                        </Button>
                      </div>
                      <DescriptionList
                        layout="inline"
                        items={[
                          { label: "Họ tên", value: `${formData.studentName} (MSSV: ${formData.studentId})` },
                          { label: "Lớp", value: formData.studentClass },
                          { label: "Ngành", value: formData.major },
                          { label: "Email", value: formData.email },
                          { label: "SĐT", value: formData.phone }
                        ]}
                      />
                    </section>

                    <section className="rounded-card border border-ink-200 bg-ink-25 p-4">
                      <div className="mb-3 flex items-center justify-between border-b border-ink-200 pb-2">
                        <h3 className="text-title-3 text-ink-900">Kết quả tự khai</h3>
                        <Button variant="link" size="sm" onClick={() => goToStep(2)}>
                          Sửa
                        </Button>
                      </div>
                      <DescriptionList
                        layout="inline"
                        items={[
                          { label: "GPA tích lũy", value: <span className="text-brand-700">{formData.gpa} / 4.0</span> },
                          { label: "Tín chỉ tích lũy", value: `${formData.creditsEarned} (Nợ môn: ${formData.creditsFailed})` },
                          { label: "Điểm rèn luyện", value: `${formData.trainingScore} điểm` },
                          { label: "Điểm TOEIC", value: <span className="text-brand-700">{formData.toeicScore} điểm</span> },
                          { label: "Thành tích", value: formData.achievement }
                        ]}
                      />
                    </section>
                  </div>

                  <section>
                    <h3 className="mb-3 text-title-3 text-ink-900">Tệp minh chứng nộp kèm:</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {files
                        .filter((f) => f.name)
                        .map((f) => (
                          <FileItem key={f.id} label={f.label} name={f.name} size={f.size} viewLabel="Xem" onView={() => setPreviewDoc(f)} />
                        ))}
                    </div>
                  </section>

                  <Callout tone="brand">
                    <Checkbox checked={formData.committed} onChange={(e) => update("committed", e.target.checked)}>
                      <span className="text-body leading-relaxed text-brand-900">
                        Tôi cam kết toàn bộ thông tin tự khai và các tệp minh chứng kết quả học tập, ngoại ngữ đính kèm là hoàn toàn trung thực và chính xác. Nếu sai phạm, tôi xin chịu hoàn toàn trách nhiệm theo quy chế đào tạo của Trường Đại học Công nghiệp TP. Hồ Chí Minh.
                      </span>
                    </Checkbox>
                  </Callout>
                </>
              )}
            </div>
          </div>

          {step < 3 && (
            <aside className="ui-card hidden h-fit p-5 xl:sticky xl:top-24 xl:block">
              <h3 className="mb-3 text-title-3 text-ink-900">Kết quả tự khai</h3>
              <ul className="divide-y divide-ink-200">
                {summaryRows.map((row) => {
                  const ok = checks[row.key](row.value);
                  return (
                    <li key={row.key} className="flex items-center justify-between gap-3 py-2.5 text-body">
                      <span className="text-ink-600">{row.label}</span>
                      <span className={`inline-flex items-center gap-1.5 font-semibold tabular-nums ${ok ? "text-success-fg" : "text-warning-fg"}`}>
                        {row.value === "" ? "—" : `${row.value}${row.suffix || ""}`}
                        {ok ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : <AlertTriangle size={14} aria-hidden="true" />}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </aside>
          )}
        </div>

        {/* Thanh hành động dính đáy */}
        <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-ink-200 bg-white/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="mx-auto flex max-w-[1080px] items-center justify-between gap-3">
            <div className="min-w-[1px]">
              {step > 1 && (
                <Button variant="secondary" icon={ArrowLeft} onClick={() => goToStep(step - 1)}>
                  <span className="hidden sm:inline">Quay lại Bước {step - 1}</span>
                  <span className="sm:hidden">Quay lại</span>
                </Button>
              )}
            </div>
            <span className="hidden text-body-sm font-semibold tabular-nums text-ink-600 sm:inline">
              Bước {step}/{STEPS.length}
            </span>
            <div>
              {step === 1 && (
                <Button variant="primary" iconRight={ArrowRight} onClick={() => goToStep(2)}>
                  Tiếp tục sang Tiêu chí &amp; Minh chứng
                </Button>
              )}
              {step === 2 && (
                <Button variant="primary" iconRight={ArrowRight} onClick={() => goToStep(3)}>
                  Tiếp tục sang Kiểm tra &amp; Nộp
                </Button>
              )}
              {step === 3 && (
                <Button variant="primary" type="submit" icon={Send} loading={submitting} disabled={!formData.committed}>
                  Nộp hồ sơ xét duyệt chính thức
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>

      {previewDrawer}
    </div>
  );
}

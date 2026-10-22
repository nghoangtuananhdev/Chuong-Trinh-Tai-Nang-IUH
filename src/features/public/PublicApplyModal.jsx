import { useState } from "react";
import { Send } from "lucide-react";
import { Modal } from "../../components/ui/Modal.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Field, Input } from "../../components/ui/Form.jsx";
import { FileDropzone, FileItem } from "../../components/ui/FileDropzone.jsx";
import { Callout } from "../../components/ui/Display.jsx";
import { useDemoStore } from "../../data/demo-store.jsx";

const emptyForm = { studentName: "", studentId: "", email: "", phone: "", gpa: "", toeic: "" };

export function PublicApplyModal({ round, onClose }) {
  const { submitApplication, showToast } = useDemoStore();
  const [formData, setFormData] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState(null); // { name, size, valid, error }
  const [submitting, setSubmitting] = useState(false);

  if (!round) return null;

  const set = (name) => (e) => setFormData({ ...formData, [name]: e.target.value });

  const handleFiles = (files) => {
    const file = files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }
    const size = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isUnder5Mb = file.size <= 5 * 1024 * 1024;

    if (!isPdf) {
      setSelectedFile({ name: file.name, size, valid: false, error: "Định dạng không hợp lệ. Vui lòng chọn tệp PDF (.pdf)." });
      return;
    }
    if (!isUnder5Mb) {
      setSelectedFile({ name: file.name, size, valid: false, error: "Dung lượng tệp vượt quá 5MB. Vui lòng nén hoặc chọn tệp nhỏ hơn." });
      return;
    }
    setSelectedFile({ name: file.name, size, valid: true, error: null });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedFile || !selectedFile.valid) {
      showToast("Vui lòng đính kèm tệp minh chứng hợp lệ định dạng PDF (tối đa 5MB).", "warning");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      submitApplication({
        studentName: formData.studentName.trim(),
        studentId: formData.studentId.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        gpa: formData.gpa,
        toeicScore: formData.toeic,
        roundCode: round.id,
        roundName: round.name,
        type: "Xét tuyển mới",
        major: round.major,
        documents: [{ name: selectedFile.name, size: selectedFile.size, type: "application/pdf" }]
      });
      setSubmitting(false);
      setFormData(emptyForm);
      setSelectedFile(null);
      onClose();
    }, 600);
  };

  return (
    <Modal
      open={Boolean(round)}
      onClose={onClose}
      closeOnBackdrop={false}
      size="lg"
      title="Nộp hồ sơ xét tuyển trực tuyến"
      description={`Đợt xét tuyển: ${round.name} (${round.id})`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" form="public-apply-form" icon={Send} loading={submitting}>
            Gửi hồ sơ xét tuyển
          </Button>
        </>
      }
    >
      <form id="public-apply-form" onSubmit={handleSubmit} className="space-y-6">
        <Callout tone="info">
          Hệ thống tiếp nhận thông tin và lưu trữ hồ sơ xét tuyển vào hệ thống mô phỏng. Cán bộ khoa sẽ đối chiếu minh chứng và thông báo trạng thái qua cổng.
        </Callout>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Họ và tên sinh viên" required>
            <Input value={formData.studentName} onChange={set("studentName")} placeholder="Ví dụ: Nguyễn Văn A" />
          </Field>
          <Field label="Mã số sinh viên (MSSV)" required>
            <Input value={formData.studentId} onChange={set("studentId")} placeholder="Ví dụ: 22019481" />
          </Field>
          <Field label="Email liên hệ" required>
            <Input type="email" value={formData.email} onChange={set("email")} placeholder="mssv@iuh.edu.vn hoặc email cá nhân" />
          </Field>
          <Field label="Số điện thoại liên lạc" required>
            <Input type="tel" value={formData.phone} onChange={set("phone")} placeholder="Ví dụ: 0912345678" />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-ink-200 pt-6 sm:grid-cols-2">
          <Field label="Điểm GPA học kỳ gần nhất" required>
            <Input type="number" step="0.01" min="0" max="4.0" trailing="/ 4.0" value={formData.gpa} onChange={set("gpa")} placeholder="Thang điểm 4.0 (VD: 3.45)" />
          </Field>
          <Field label="Điểm ngoại ngữ TOEIC hoặc tương đương">
            <Input type="number" min="0" max="990" trailing="/ 990" value={formData.toeic} onChange={set("toeic")} placeholder="Ví dụ: 550" />
          </Field>
        </div>

        <div className="border-t border-ink-200 pt-6">
          <p className="ui-label">
            Tệp minh chứng tổng hợp (Bảng điểm, chứng chỉ)
            <span aria-hidden="true" className="ml-0.5 text-danger-fg">*</span>
            <span className="sr-only">Bắt buộc</span>
          </p>
          <p className="mb-3 text-body-sm text-ink-600">
            Định dạng yêu cầu: <strong>PDF (.pdf)</strong>, dung lượng tối đa: <strong>5.0 MB</strong>.
          </p>

          {!selectedFile ? (
            <FileDropzone onFiles={handleFiles} buttonLabel="Chọn tệp PDF từ máy tính" />
          ) : (
            <div>
              <FileItem
                name={selectedFile.name}
                size={selectedFile.size}
                status={selectedFile.valid ? "ok" : "error"}
                removeLabel="Xóa tệp đã chọn"
                onRemove={() => setSelectedFile(null)}
                className={selectedFile.valid ? "" : "!border-danger-border !bg-danger-bg"}
              />
              {selectedFile.error && (
                <p role="alert" className="mt-2 text-body-sm font-medium text-danger-fg">
                  {selectedFile.error}
                </p>
              )}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}

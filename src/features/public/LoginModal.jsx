import { useState } from "react";
import { LogIn } from "lucide-react";
import { Modal } from "../../components/ui/Modal.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Field, Input, RadioCard } from "../../components/ui/Form.jsx";
import { PasswordInput } from "../../components/ui/PasswordInput.jsx";
import { Avatar } from "../../components/ui/Display.jsx";
import { roles } from "../../data/fixtures.js";
import { useDemoStore } from "../../data/demo-store.jsx";

// Tách chuỗi tùy chọn gốc "N. Vai trò (Tên người)" thành 2 phần để hiển thị.
const ROLE_OPTIONS = [
  { file: "sinh-vien.html", no: "1.", role: "Sinh viên CN/KSTN", person: "Nguyễn Hoàng Nam", key: "student" },
  { file: "giang-vien-phu-trach.html", no: "2.", role: "Giảng viên phụ trách", person: "ThS. Phạm Thị Dung", key: "lecturer" },
  { file: "chu-nhiem-nganh.html", no: "3.", role: "Chủ nhiệm ngành", person: "TS. Trần Ngọc Bình", key: "head" },
  { file: "ban-lanh-dao-khoa.html", no: "4.", role: "Ban lãnh đạo khoa", person: "PGS. TS. Lê Hoàng", key: "dean" },
  { file: "dai-dien-phong-dao-tao.html", no: "5.", role: "Đại diện Phòng Đào tạo", person: "Nguyễn Minh Anh", key: "training" },
  { file: "quan-tri-vien.html", no: "6.", role: "Quản trị hệ thống", person: "Toàn quyền", key: "admin" }
];

export function LoginModal({ open, onClose, onSelectRole }) {
  const { showToast } = useDemoStore();
  const [forgot, setForgot] = useState(false);
  const [selectedRoleFile, setSelectedRoleFile] = useState("quan-tri-vien.html");

  if (!open) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    if (onSelectRole) onSelectRole(selectedRoleFile);
    else window.location.href = selectedRoleFile;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeOnBackdrop={false}
      size="md"
      title="Đăng nhập Cổng thông tin xét tuyển"
      description="Chọn vai trò để trải nghiệm phiên làm việc mô phỏng."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" form="login-form" icon={LogIn}>
            Vào không gian làm việc
          </Button>
        </>
      }
    >
      <form id="login-form" onSubmit={handleLogin} className="space-y-5" autoComplete="off">
        <div className="space-y-4">
          <Field label="Tài khoản / Email trường" required>
            <Input defaultValue="demo@iuh.edu.vn" autoComplete="off" />
          </Field>
          <Field label="Mật khẩu" required>
            <PasswordInput defaultValue="12345678" autoComplete="off" />
          </Field>
        </div>

        <fieldset className="border-t border-ink-200 pt-5">
          <legend className="ui-label">
            Vai trò trải nghiệm
            <span aria-hidden="true" className="ml-0.5 text-danger-fg">*</span>
            <span className="sr-only">Bắt buộc</span>
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ROLE_OPTIONS.map((opt) => (
              <RadioCard
                key={opt.file}
                name="role"
                value={opt.file}
                checked={selectedRoleFile === opt.file}
                onChange={() => setSelectedRoleFile(opt.file)}
                leading={<Avatar initials={roles[opt.key].initials} size={32} />}
                description={opt.person}
              >
                {opt.no} {opt.role}
              </RadioCard>
            ))}
          </div>
        </fieldset>

        <div className="flex items-center justify-between gap-3 text-body-sm">
          <button
            type="button"
            onClick={() => setForgot((v) => !v)}
            aria-expanded={forgot}
            className="font-medium text-brand-700 underline-offset-4 hover:underline"
          >
            {forgot ? "Ẩn hướng dẫn khôi phục" : "Quên mật khẩu?"}
          </button>
          <span className="rounded-full border border-ink-200 bg-ink-100 px-2.5 py-0.5 text-caption font-medium text-ink-600">Phiên bản thử nghiệm 2.0</span>
        </div>

        <div className="collapse-grid" data-open={forgot}>
          <div>
            <div className="space-y-2 rounded-control border border-ink-200 bg-ink-25 p-4 text-body-sm" inert={forgot ? undefined : true}>
              <p className="font-semibold text-ink-900">Khôi phục mật khẩu demo:</p>
              <p className="text-ink-600">
                Nhập email IUH để nhận hướng dẫn. Trong phiên bản front-end, bạn có thể đăng nhập bằng tài khoản và mật khẩu mặc định (12345678).
              </p>
              <div className="flex gap-2">
                <Input type="email" placeholder="email@iuh.edu.vn" aria-label="email@iuh.edu.vn" />
                <Button variant="secondary" onClick={() => showToast("Mã xác thực mô phỏng đã được gửi đến email.", "info")}>
                  Gửi mã
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

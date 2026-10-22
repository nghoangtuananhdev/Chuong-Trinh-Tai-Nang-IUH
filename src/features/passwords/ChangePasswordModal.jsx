import { useState } from "react";
import { Lock } from "lucide-react";
import { Modal } from "../../components/ui/Modal.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Field } from "../../components/ui/Form.jsx";
import { PasswordInput, PasswordStrength } from "../../components/ui/PasswordInput.jsx";
import { useDemoStore } from "../../data/demo-store.jsx";

const MISMATCH = "Mật khẩu mới và mật khẩu xác nhận không trùng khớp.";
const TOO_SHORT = "Mật khẩu mới phải có tối thiểu 8 ký tự.";

export function ChangePasswordModal({ open, onClose }) {
  const { showToast } = useDemoStore();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  if (!open) return null;

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: MISMATCH });
      showToast(MISMATCH, "error");
      return;
    }
    if (newPassword.length < 8) {
      setErrors({ newPassword: TOO_SHORT });
      showToast(TOO_SHORT, "error");
      return;
    }

    showToast("Đổi mật khẩu tài khoản thành công.", "success");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeOnBackdrop={false}
      size="sm"
      title="Đổi mật khẩu tài khoản"
      description="Cập nhật mật khẩu bảo mật tài khoản Cổng xét tuyển."
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" form="change-password-form" icon={Lock}>
            Đổi mật khẩu
          </Button>
        </>
      }
    >
      <form id="change-password-form" onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        <Field label="Mật khẩu hiện tại" required>
          <PasswordInput value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} autoComplete="current-password" />
        </Field>

        <Field label="Mật khẩu mới" required hint="Tối thiểu 8 ký tự, bao gồm chữ cái và số." error={errors.newPassword}>
          <PasswordInput
            minLength={8}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setErrors({});
            }}
            autoComplete="new-password"
          />
        </Field>
        <PasswordStrength value={newPassword} />

        <Field label="Xác nhận mật khẩu mới" required error={errors.confirmPassword}>
          <PasswordInput
            minLength={8}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrors({});
            }}
            autoComplete="new-password"
          />
        </Field>
      </form>
    </Modal>
  );
}

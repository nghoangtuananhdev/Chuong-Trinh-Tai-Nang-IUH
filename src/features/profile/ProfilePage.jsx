import { useState } from "react";
import { MapPin } from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Field, Input } from "../../components/ui/Form.jsx";
import { Avatar, CodeTag } from "../../components/ui/Display.jsx";
import { useDemoStore } from "../../data/demo-store.jsx";

export function ProfilePage() {
  const { currentRole, showToast } = useDemoStore();
  const [phone, setPhone] = useState("0901234567");
  const [birthDate, setBirthDate] = useState("2003-10-12");

  const handleSave = (e) => {
    e.preventDefault();
    showToast("Đã cập nhật thông tin cá nhân thành công.", "success");
  };

  const isStudent = currentRole.key === "student";

  return (
    <div>
      <PageHeader title="Thông tin cá nhân" description="Quản lý thông tin hồ sơ tài khoản và dữ liệu liên hệ cá nhân." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* Thẻ danh tính */}
        <aside className="academic-grid on-dark relative flex flex-col items-center self-start overflow-hidden rounded-card bg-brand-900 px-6 py-8 text-center shadow-card">
          <Avatar initials={currentRole.initials} size={80} className="ring-4 ring-white/90" />
          <h2 className="mt-4 text-title-3 text-white">{currentRole.name}</h2>
          <p className="mt-0.5 text-body-sm text-white/70">{currentRole.label}</p>
          <div className="mt-4">
            <StatusBadge domain="account">Hoạt động</StatusBadge>
          </div>
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-caption font-medium text-white">
            <MapPin size={12} aria-hidden="true" />
            {currentRole.scope}
          </p>
        </aside>

        {/* Form */}
        <form onSubmit={handleSave} className="ui-card overflow-hidden">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2 sm:p-6">
            <Field label="Họ và tên">
              <Input value={currentRole.name} readOnly className="font-semibold" />
            </Field>
            <Field label="Mã định danh tài khoản">
              <Input value={isStudent ? "21094501" : "GV00128"} readOnly className="font-mono font-semibold" />
            </Field>
            <Field label="Email IUH">
              <Input value={isStudent ? "nam.21094501@iuh.edu.vn" : "account@iuh.edu.vn"} readOnly className="font-mono text-body-sm" />
            </Field>
            <Field label="Đơn vị / Lớp trực thuộc">
              <Input value={isStudent ? "KSTN-KTPM-K20" : "Khoa Công nghệ Thông tin"} readOnly />
            </Field>
            <Field label="Số điện thoại liên lạc" required>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
            <Field label="Ngày sinh">
              <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </Field>
          </div>
          <div className="flex justify-end border-t border-ink-200 bg-ink-25 px-5 py-3.5 sm:px-6">
            <Button variant="primary" type="submit">
              Lưu thay đổi thông tin
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

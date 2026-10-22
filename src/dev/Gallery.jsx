import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { DemoStoreProvider, useDemoStore } from "../data/demo-store.jsx";
import { Button } from "../components/ui/Button.jsx";
import { IconButton } from "../components/ui/IconButton.jsx";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";
import { Field, Input, Textarea, Select, Checkbox, RadioCard } from "../components/ui/Form.jsx";
import { Avatar, Callout, Capacity, CodeTag, DescriptionList, Timeline } from "../components/ui/Display.jsx";
import { FilterTabs } from "../components/ui/FilterTabs.jsx";
import { Stepper } from "../components/ui/Stepper.jsx";
import { FileDropzone, FileItem } from "../components/ui/FileDropzone.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Pagination } from "../components/ui/Pagination.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { Drawer } from "../components/ui/Drawer.jsx";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.jsx";
import { ToastStack } from "../components/ui/Toast.jsx";
import { PasswordInput, PasswordStrength } from "../components/ui/PasswordInput.jsx";

function Section({ title, children }) {
  return (
    <section className="ui-card p-5">
      <h2 className="mb-4 text-title-3 text-ink-900">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function GalleryContent() {
  const { toasts, showToast, hideToast } = useDemoStore();
  const [tab, setTab] = useState("");
  const [step, setStep] = useState(1);
  const [page, setPage] = useState(1);
  const [overlay, setOverlay] = useState(null);
  const [pw, setPw] = useState("");

  return (
    <div className="mx-auto max-w-[1080px] space-y-6 px-4 py-8">
      <h1 className="text-title-1 text-ink-900">Gallery thành phần (chỉ chạy ở chế độ dev)</h1>

      <Section title="Button">
        <div className="flex flex-wrap items-center gap-3">
          {["primary", "secondary", "tertiary", "danger", "dangerOutline", "warningOutline", "link"].map((v) => (
            <Button key={v} variant={v} icon={v === "link" ? undefined : Plus}>
              {v}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">sm</Button>
          <Button size="md">md</Button>
          <Button size="lg">lg</Button>
          <Button loading>loading</Button>
          <Button disabled>disabled</Button>
          <Button variant="secondary" disabled>disabled</Button>
          <IconButton icon={Save} label="Lưu" />
          <IconButton icon={Trash2} label="Xóa" variant="danger" />
          <IconButton icon={Save} label="Lưu" variant="tertiary" size="sm" />
        </div>
      </Section>

      <Section title="Badge · CodeTag · Avatar · Capacity">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge domain="round">open</StatusBadge>
          <StatusBadge domain="round">review</StatusBadge>
          <StatusBadge domain="application">rejected</StatusBadge>
          <StatusBadge domain="account" appearance="outline">Khóa</StatusBadge>
          <StatusBadge domain="class" size="sm">Chưa mở</StatusBadge>
          <CodeTag>DXT-2026-01</CodeTag>
          <CodeTag tone="plain">21094501</CodeTag>
          <CodeTag tone="neutral">K20</CodeTag>
          <Avatar name="Nguyễn Hoàng Nam" />
          <Avatar initials="QT" size={40} />
          <Capacity current={20} max={30} />
          <Capacity current={28} max={30} />
          <Capacity current={30} max={30} />
        </div>
      </Section>

      <Section title="Form">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mặc định" required hint="Gợi ý dưới ô nhập">
            <Input placeholder="Placeholder" />
          </Field>
          <Field label="Lỗi" error="Thông báo lỗi tại chỗ">
            <Input defaultValue="Giá trị sai" />
          </Field>
          <Field label="Khóa">
            <Input defaultValue="21094501" readOnly />
          </Field>
          <Field label="Đơn vị">
            <Input trailing="/ 4.0" defaultValue="3.54" />
          </Field>
          <Field label="Select">
            <Select defaultValue="a">
              <option value="a">Tùy chọn A</option>
              <option value="b">Tùy chọn B</option>
            </Select>
          </Field>
          <Field label="Mật khẩu">
            <PasswordInput value={pw} onChange={(e) => setPw(e.target.value)} />
          </Field>
          <Field label="Textarea" className="sm:col-span-2">
            <Textarea />
          </Field>
        </div>
        <PasswordStrength value={pw} />
        <Checkbox defaultChecked>Checkbox</Checkbox>
        <div className="grid gap-2 sm:grid-cols-2">
          <RadioCard name="g" value="1" defaultChecked description="Mô tả">Radio card 1</RadioCard>
          <RadioCard name="g" value="2">Radio card 2</RadioCard>
        </div>
      </Section>

      <Section title="Điều hướng & tiến trình">
        <FilterTabs label="demo" value={tab} onChange={setTab} options={[{ value: "", label: "Tất cả", count: 4 }, { value: "a", label: "Đang mở", count: 1 }, { value: "b", label: "Đã kết thúc", count: 1 }]} />
        <FilterTabs appearance="underline" label="demo2" value={tab} onChange={setTab} options={[{ value: "", label: "Tất cả", count: 4 }, { value: "a", label: "Đang mở", count: 1 }]} />
        <Stepper
          steps={[{ title: "Bước một", description: "Mô tả" }, { title: "Bước hai", description: "Mô tả" }, { title: "Bước ba", description: "Mô tả" }]}
          current={step - 1}
          onStep={(i) => setStep(i + 1)}
          canGoTo={(i) => i <= step}
        />
        <Pagination page={page} totalPages={8} total={76} onChange={setPage} />
      </Section>

      <Section title="Hiển thị dữ liệu">
        <DescriptionList columns={3} items={[{ label: "Tên lớp", value: "KSTN-KTPM-K20" }, { label: "Sĩ số", value: <Capacity current={20} max={30} /> }, { label: "Trạng thái", value: <StatusBadge domain="class">Đang hoạt động</StatusBadge> }]} />
        <DescriptionList layout="inline" items={[{ label: "Email", value: "a@iuh.edu.vn" }, { label: "Vai trò", value: "Giảng viên" }]} />
        <Callout tone="info">Callout thông tin</Callout>
        <Callout tone="warning" title="Cảnh báo">Nội dung cảnh báo</Callout>
        <Timeline items={[{ action: "Nộp hồ sơ", actor: "Sinh viên A", role: "Sinh viên", date: "12/08/2026 14:30", note: "Ghi chú" }, { action: "Phê duyệt khoa", actor: "Cán bộ B", role: "Ban lãnh đạo", date: "18/08/2026 15:40" }]} />
        <EmptyState compact />
      </Section>

      <Section title="Tệp">
        <FileDropzone onFiles={() => {}} />
        <FileItem name="bang-diem-nam-2.pdf" size="1.2 MB" onView={() => {}} onReplace={() => {}} onRemove={() => {}} />
        <FileItem name="sai-dinh-dang.docx" size="2 MB" status="error" onRemove={() => {}} />
      </Section>

      <Section title="Overlay & Toast">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setOverlay("modal")}>Modal</Button>
          <Button variant="secondary" onClick={() => setOverlay("drawer")}>Drawer</Button>
          <Button variant="secondary" onClick={() => setOverlay("confirm")}>ConfirmDialog</Button>
          {["success", "info", "warning", "error"].map((t) => (
            <Button key={t} variant="tertiary" onClick={() => showToast(`Toast ${t}`, t)}>
              Toast {t}
            </Button>
          ))}
        </div>
      </Section>

      <Modal open={overlay === "modal"} onClose={() => setOverlay(null)} title="Modal mẫu" description="Mô tả modal" footer={<Button onClick={() => setOverlay(null)}>Đóng</Button>}>
        <p className="text-body text-ink-700">Nội dung modal.</p>
      </Modal>
      <Drawer open={overlay === "drawer"} onClose={() => setOverlay(null)} title="Drawer mẫu">
        <p className="text-body text-ink-700">Nội dung drawer.</p>
      </Drawer>
      <ConfirmDialog open={overlay === "confirm"} tone="danger" title="Xác nhận xóa" description="Bạn có chắc chắn?" note="Thao tác này không thể hoàn tác." cancelLabel="Hủy" confirmLabel="Xóa" onCancel={() => setOverlay(null)} onConfirm={() => setOverlay(null)} />
      <ToastStack toasts={toasts} onClose={hideToast} />
    </div>
  );
}

export default function Gallery() {
  return (
    <DemoStoreProvider initialRole="admin">
      <GalleryContent />
    </DemoStoreProvider>
  );
}

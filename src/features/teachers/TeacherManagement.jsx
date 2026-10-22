import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { TablePanel } from "../../components/data/TablePanel.jsx";
import { TableToolbar } from "../../components/data/TableToolbar.jsx";
import { TableActions } from "../../components/data/TableActions.jsx";
import { ResponsiveTable } from "../../components/data/ResponsiveTable.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { Drawer } from "../../components/ui/Drawer.jsx";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Field, Input, Select } from "../../components/ui/Form.jsx";
import { Avatar, DescriptionList } from "../../components/ui/Display.jsx";
import { useDemoStore } from "../../data/demo-store.jsx";
import { pageMeta } from "../../data/page-meta.js";
import { usePagedFilter } from "../../hooks/usePagedFilter.js";

function RoleChip({ children }) {
  return (
    <span className="inline-flex h-6 items-center rounded-full border border-ink-200 bg-ink-100 px-2.5 text-caption font-medium text-ink-700">
      {children}
    </span>
  );
}

export function TeacherManagement({ pageKey = "teachers" }) {
  const { teachers, setTeachers, showToast } = useDemoStore();

  const [formModal, setFormModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const roleOptions = useMemo(
    () => [...new Set(teachers.map((t) => t.role))].sort((a, b) => a.localeCompare(b, "vi")),
    [teachers]
  );

  const matchTeacher = useMemo(
    () => (t, keyword, role) =>
      (!role || t.role === role) && (!keyword || `${t.name} ${t.email} ${t.role} ${t.department}`.toLowerCase().includes(keyword)),
    []
  );
  const table = usePagedFilter(teachers, { match: matchTeacher });

  const handleSaveTeacher = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name").trim();
    const email = formData.get("email").trim().toLowerCase();
    const role = formData.get("role");
    const department = formData.get("department").trim();
    const status = formData.get("status");

    if (formModal.id) {
      setTeachers((prev) => prev.map((t) => (t.id === formModal.id ? { ...t, name, email, role, department, status } : t)));
      showToast("Đã cập nhật thông tin tài khoản giảng viên.", "success");
    } else {
      const newId = `GV${String(teachers.length + 1).padStart(3, "0")}`;
      setTeachers((prev) => [...prev, { id: newId, name, email, role, department, status }]);
      showToast("Đã thêm tài khoản giảng viên mới.", "success");
    }
    setFormModal(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteModal) return;
    setTeachers((prev) => prev.filter((t) => t.id !== deleteModal.id));
    showToast(`Đã xóa tài khoản giảng viên "${deleteModal.name}".`, "success");
    setDeleteModal(null);
  };

  const rowActions = (t) => (
    <TableActions
      onView={() => setDetailModal(t)}
      onEdit={() => setFormModal({ ...t })}
      onDelete={() => setDeleteModal(t)}
      viewLabel={`Xem chi tiết ${t.name}`}
      editLabel={`Chỉnh sửa ${t.name}`}
      deleteLabel={`Xóa ${t.name}`}
    />
  );

  const columns = [
    {
      key: "name",
      header: "Họ và tên",
      width: "27%",
      cell: (t) => (
        <div className="flex items-center gap-3">
          <Avatar name={t.name} size={28} />
          <span className="min-w-0">
            <span className="block font-semibold text-ink-900">{t.name}</span>
            <span className="block truncate font-mono text-body-sm text-ink-600 xl:hidden">{t.email}</span>
          </span>
        </div>
      )
    },
    { key: "email", header: "Email IUH", width: "26%", hideBelow: "xl", cell: (t) => <span className="font-mono text-body-sm text-ink-600">{t.email}</span> },
    { key: "role", header: "Vai trò công tác", width: "21%", hideBelow: "md", cell: (t) => <RoleChip>{t.role}</RoleChip> },
    { key: "status", header: "Trạng thái", width: "14%", cell: (t) => <StatusBadge domain="account">{t.status}</StatusBadge> },
    { key: "actions", header: "Thao tác", width: "12%", align: "right", cell: rowActions }
  ];

  return (
    <>
      <PageHeader
        title={pageMeta[pageKey].title}
        description={pageMeta[pageKey].desc}
        action={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() =>
              setFormModal({
                id: null,
                name: "",
                email: "",
                role: roleOptions[0] || "Giảng viên phụ trách",
                department: "Khoa Công nghệ Thông tin",
                status: "Hoạt động"
              })
            }
          >
            Thêm tài khoản giảng viên
          </Button>
        }
      />

      <TablePanel
        toolbar={
          <TableToolbar
            searchQuery={table.query}
            onSearchChange={table.setQuery}
            searchPlaceholder="Tìm theo họ tên, email hoặc vai trò..."
            filterValue={table.filter}
            onFilterChange={table.setFilter}
            filterLabel="Lọc theo vai trò"
            filterAllLabel="Tất cả các vai trò"
            filterOptions={roleOptions}
          />
        }
        pagination={{ page: table.page, totalPages: table.totalPages, onChange: table.setPage, total: table.total, pageSize: table.pageSize }}
      >
        <ResponsiveTable
          columns={columns}
          rows={table.rows}
          rowKey={(t) => t.id}
          caption={pageMeta[pageKey].title}
          getRowProps={(t) => ({ "data-selected": detailModal?.id === t.id ? "true" : undefined })}
          empty={
            <EmptyState
              title="Không tìm thấy tài khoản giảng viên"
              description="Hãy thử từ khóa tìm kiếm khác hoặc đặt lại bộ lọc vai trò."
              actionLabel="Đặt lại bộ lọc"
              onAction={table.reset}
            />
          }
          mobileCard={(t) => (
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={t.name} size={32} />
                  <div className="min-w-0">
                    <p className="font-semibold text-ink-900">{t.name}</p>
                    <p className="truncate font-mono text-body-sm text-ink-600">{t.email}</p>
                  </div>
                </div>
                <StatusBadge domain="account">{t.status}</StatusBadge>
              </div>
              <RoleChip>{t.role}</RoleChip>
              <div className="flex justify-end border-t border-ink-200 pt-2">{rowActions(t)}</div>
            </div>
          )}
        />
      </TablePanel>

      <Modal
        open={Boolean(formModal)}
        onClose={() => setFormModal(null)}
        closeOnBackdrop={false}
        title={formModal?.id ? "Chỉnh sửa tài khoản giảng viên" : "Thêm tài khoản giảng viên"}
        description="Quản lý hồ sơ công tác và vai trò phân nhiệm."
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormModal(null)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" form="teacher-form">
              {formModal?.id ? "Lưu thay đổi" : "Tạo tài khoản"}
            </Button>
          </>
        }
      >
        {formModal && (
          <form id="teacher-form" onSubmit={handleSaveTeacher} className="space-y-4" autoComplete="off">
            <Field label="Họ và tên giảng viên" required>
              <Input name="name" defaultValue={formModal.name} placeholder="Ví dụ: TS. Nguyễn Văn A" />
            </Field>
            <Field label="Email công vụ IUH" required>
              <Input name="email" type="email" defaultValue={formModal.email} placeholder="email@iuh.edu.vn" />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Vai trò phân công" required>
                <Select name="role" defaultValue={formModal.role}>
                  <option value="Giảng viên phụ trách">Giảng viên phụ trách</option>
                  <option value="Chủ nhiệm ngành">Chủ nhiệm ngành</option>
                  <option value="Ban lãnh đạo khoa">Ban lãnh đạo khoa</option>
                  <option value="Giảng viên">Giảng viên</option>
                </Select>
              </Field>
              <Field label="Trạng thái tài khoản">
                <Select name="status" defaultValue={formModal.status}>
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Chờ duyệt">Chờ duyệt</option>
                  <option value="Khóa">Khóa</option>
                </Select>
              </Field>
            </div>
            <Field label="Khoa / Đơn vị công tác">
              <Input name="department" defaultValue={formModal.department} />
            </Field>
          </form>
        )}
      </Modal>

      <Drawer
        open={Boolean(detailModal)}
        onClose={() => setDetailModal(null)}
        size="md"
        title="Thông tin tài khoản giảng viên"
        description="Chi tiết hồ sơ và quyền hạn công tác."
      >
        {detailModal && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Avatar name={detailModal.name} size={40} />
              <div className="min-w-0">
                <p className="text-title-3 text-ink-900">{detailModal.name}</p>
                <StatusBadge domain="account" size="sm">{detailModal.status}</StatusBadge>
              </div>
            </div>
            <DescriptionList
              layout="inline"
              items={[
                { label: "Họ và tên", value: detailModal.name },
                { label: "Email công vụ", value: <span className="font-mono text-body-sm text-brand-700">{detailModal.email}</span> },
                { label: "Vai trò phụ trách", value: detailModal.role },
                { label: "Khoa / Đơn vị", value: detailModal.department },
                { label: "Trạng thái", value: <StatusBadge domain="account">{detailModal.status}</StatusBadge> }
              ]}
            />
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleteModal)}
        tone="danger"
        title="Xác nhận xóa tài khoản giảng viên"
        description={
          <>
            Bạn có chắc chắn muốn xóa tài khoản của giảng viên <strong className="text-ink-900">{deleteModal?.name}</strong>?
          </>
        }
        cancelLabel="Hủy"
        confirmLabel="Xóa tài khoản"
        onCancel={() => setDeleteModal(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

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
import { CodeTag, DescriptionList } from "../../components/ui/Display.jsx";
import { useDemoStore } from "../../data/demo-store.jsx";
import { pageMeta } from "../../data/page-meta.js";
import { usePagedFilter } from "../../hooks/usePagedFilter.js";

const DUPLICATE_ERROR = "MSSV hoặc Gmail đã tồn tại trên hệ thống.";

export function StudentManagement({ pageKey = "students" }) {
  const { students, setStudents, classes, showToast } = useDemoStore();

  const [formModal, setFormModal] = useState(null);
  const [formError, setFormError] = useState("");
  const [detailModal, setDetailModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const classOptions = useMemo(
    () =>
      [...new Set([...classes.map((c) => c.className), ...students.map((s) => s.className)])]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "vi")),
    [classes, students]
  );

  const matchStudent = useMemo(
    () => (s, keyword, className) =>
      (!className || s.className === className) && (!keyword || `${s.id} ${s.name} ${s.className} ${s.gmail}`.toLowerCase().includes(keyword)),
    []
  );
  const table = usePagedFilter(students, { match: matchStudent });

  const closeForm = () => {
    setFormModal(null);
    setFormError("");
  };

  const handleSaveStudent = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const id = formData.get("id").trim();
    const name = formData.get("name").trim().replace(/\s+/g, " ");
    const className = formData.get("className");
    const gmail = formData.get("gmail").trim().toLowerCase();
    const status = formData.get("status");

    const isDuplicate = students.some((s) => s.id !== formModal.originalId && (s.id === id || s.gmail === gmail));

    if (isDuplicate) {
      setFormError(DUPLICATE_ERROR);
      showToast(DUPLICATE_ERROR, "error");
      form.elements.id?.focus();
      return;
    }

    if (formModal.originalId) {
      setStudents((prev) => prev.map((s) => (s.id === formModal.originalId ? { id, name, className, gmail, status } : s)));
      showToast("Đã cập nhật thông tin tài khoản sinh viên.", "success");
    } else {
      setStudents((prev) => [...prev, { id, name, className, gmail, status }]);
      showToast("Đã thêm tài khoản sinh viên mới.", "success");
    }
    closeForm();
  };

  const handleConfirmDelete = () => {
    if (!deleteModal) return;
    setStudents((prev) => prev.filter((s) => s.id !== deleteModal.id));
    showToast(`Đã xóa tài khoản sinh viên "${deleteModal.name}".`, "success");
    setDeleteModal(null);
  };

  const rowActions = (st) => (
    <TableActions
      onView={() => setDetailModal(st)}
      onEdit={() => setFormModal({ originalId: st.id, ...st })}
      onDelete={() => setDeleteModal(st)}
      viewLabel={`Xem chi tiết ${st.name}`}
      editLabel={`Chỉnh sửa ${st.name}`}
      deleteLabel={`Xóa ${st.name}`}
    />
  );

  const columns = [
    { key: "id", header: "MSSV", width: "14%", cell: (st) => <CodeTag tone="plain">{st.id}</CodeTag> },
    {
      key: "name",
      header: "Họ và tên",
      width: "25%",
      cell: (st) => (
        <>
          <span className="font-semibold text-ink-900">{st.name}</span>
          <span className="mt-0.5 block text-body-sm text-ink-600 md:hidden">{st.className}</span>
        </>
      )
    },
    { key: "className", header: "Tên lớp", width: "18%", hideBelow: "md", cell: (st) => <span className="text-ink-600">{st.className}</span> },
    { key: "gmail", header: "Gmail IUH", width: "24%", hideBelow: "xl", cell: (st) => <span className="font-mono text-body-sm text-ink-600">{st.gmail}</span> },
    { key: "status", header: "Trạng thái", width: "11%", cell: (st) => <StatusBadge domain="account">{st.status}</StatusBadge> },
    { key: "actions", header: "Thao tác", width: "8%", align: "right", cell: rowActions }
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
              setFormModal({ originalId: null, id: "", name: "", className: classOptions[0] || "", gmail: "", status: "Hoạt động" })
            }
          >
            Thêm tài khoản sinh viên
          </Button>
        }
      />

      <TablePanel
        toolbar={
          <TableToolbar
            searchQuery={table.query}
            onSearchChange={table.setQuery}
            searchPlaceholder="Tìm theo MSSV, họ tên hoặc Gmail..."
            filterValue={table.filter}
            onFilterChange={table.setFilter}
            filterLabel="Lọc theo lớp"
            filterAllLabel="Tất cả các lớp"
            filterOptions={classOptions}
          />
        }
        pagination={{ page: table.page, totalPages: table.totalPages, onChange: table.setPage, total: table.total, pageSize: table.pageSize }}
      >
        <ResponsiveTable
          columns={columns}
          rows={table.rows}
          rowKey={(st) => st.id}
          caption={pageMeta[pageKey].title}
          getRowProps={(st) => ({ "data-selected": detailModal?.id === st.id ? "true" : undefined })}
          empty={
            <EmptyState
              title="Không tìm thấy sinh viên phù hợp"
              description="Hãy thử thay đổi từ khóa hoặc bộ lọc lớp."
              actionLabel="Đặt lại bộ lọc"
              onAction={table.reset}
            />
          }
          mobileCard={(st) => (
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <CodeTag>{st.id}</CodeTag>
                <StatusBadge domain="account">{st.status}</StatusBadge>
              </div>
              <div>
                <p className="font-semibold text-ink-900">{st.name}</p>
                <p className="text-body-sm text-ink-600">{st.className}</p>
                <p className="truncate font-mono text-body-sm text-ink-600">{st.gmail}</p>
              </div>
              <div className="flex justify-end border-t border-ink-200 pt-2">{rowActions(st)}</div>
            </div>
          )}
        />
      </TablePanel>

      <Modal
        open={Boolean(formModal)}
        onClose={closeForm}
        closeOnBackdrop={false}
        title={formModal?.originalId ? "Chỉnh sửa tài khoản sinh viên" : "Thêm tài khoản sinh viên"}
        description="Thông tin tài khoản sinh viên hệ Cử nhân / Kỹ sư tài năng."
        footer={
          <>
            <Button variant="secondary" onClick={closeForm}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" form="student-form">
              {formModal?.originalId ? "Lưu thay đổi" : "Tạo tài khoản"}
            </Button>
          </>
        }
      >
        {formModal && (
          <form id="student-form" onSubmit={handleSaveStudent} onChange={() => formError && setFormError("")} className="space-y-4" autoComplete="off">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Mã số sinh viên (MSSV)" required error={formError}>
                <Input name="id" defaultValue={formModal.id} placeholder="Ví dụ: 21094501" />
              </Field>
              <Field label="Họ và tên sinh viên" required>
                <Input name="name" defaultValue={formModal.name} placeholder="Nhập họ và tên" />
              </Field>
            </div>
            <Field label="Gmail sinh viên" required>
              <Input name="gmail" type="email" defaultValue={formModal.gmail} placeholder="mssv@iuh.edu.vn" />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Tên lớp phân bổ" required>
                <Select name="className" defaultValue={formModal.className}>
                  {classOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
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
          </form>
        )}
      </Modal>

      <Drawer open={Boolean(detailModal)} onClose={() => setDetailModal(null)} size="md" title="Chi tiết tài khoản sinh viên">
        {detailModal && (
          <DescriptionList
            layout="inline"
            items={[
              { label: "MSSV", value: <CodeTag tone="plain">{detailModal.id}</CodeTag> },
              { label: "Họ và tên", value: detailModal.name },
              { label: "Lớp sinh hoạt", value: detailModal.className },
              { label: "Gmail", value: <span className="font-mono text-body-sm text-ink-600">{detailModal.gmail}</span> },
              { label: "Trạng thái", value: <StatusBadge domain="account">{detailModal.status}</StatusBadge> }
            ]}
          />
        )}
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleteModal)}
        tone="danger"
        title="Xác nhận xóa tài khoản sinh viên"
        description={
          <>
            Bạn có chắc muốn xóa tài khoản của sinh viên <strong className="text-ink-900">{deleteModal?.name}</strong> (MSSV: {deleteModal?.id})?
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

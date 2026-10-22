import { useState } from "react";
import { Plus, ShieldCheck, MapPin } from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { TablePanel } from "../../components/data/TablePanel.jsx";
import { TableToolbar } from "../../components/data/TableToolbar.jsx";
import { TableActions } from "../../components/data/TableActions.jsx";
import { ResponsiveTable } from "../../components/data/ResponsiveTable.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { Drawer } from "../../components/ui/Drawer.jsx";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Field, Input, Select } from "../../components/ui/Form.jsx";
import { Avatar, DescriptionList } from "../../components/ui/Display.jsx";
import { permissionActorRoles } from "../../data/fixtures.js";
import { useDemoStore } from "../../data/demo-store.jsx";
import { pageMeta } from "../../data/page-meta.js";
import { usePagedFilter } from "../../hooks/usePagedFilter.js";

const roleTone = {
  "Quản trị viên": "border-brand-100 bg-brand-50 text-brand-700",
  "Đại diện phòng đào tạo": "border-brand-100 bg-brand-50 text-brand-700",
  "Ban lãnh đạo khoa": "border-brand-100 bg-brand-50 text-brand-700",
  "Chủ nhiệm ngành": "border-info-border bg-info-bg text-info-fg",
  "Giảng viên phụ trách": "border-neutral-border bg-neutral-bg text-neutral-fg"
};

function RoleChip({ role }) {
  return (
    <span className={`inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-caption font-semibold ${roleTone[role] || roleTone["Giảng viên phụ trách"]}`}>
      <ShieldCheck size={13} aria-hidden="true" />
      <span>{role}</span>
    </span>
  );
}

function ScopeChip({ scope }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-body-sm text-ink-600">
      <MapPin size={13} aria-hidden="true" className="shrink-0 text-ink-400" />
      <span>{scope || "Toàn trường"}</span>
    </span>
  );
}

const matchPermission = (p, keyword, role) =>
  (!role || p.role === role) && (!keyword || `${p.name} ${p.role} ${p.scope || ""}`.toLowerCase().includes(keyword));

export function PermissionManagement({ pageKey = "permissions" }) {
  const { permissions, setPermissions, showToast } = useDemoStore();

  const [formModal, setFormModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const table = usePagedFilter(permissions, { match: matchPermission });

  const handleSavePermission = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name").trim();
    const role = formData.get("role");
    const scope = formData.get("scope").trim();

    if (formModal.id) {
      setPermissions((prev) => prev.map((p) => (p.id === formModal.id ? { ...p, name, role, scope } : p)));
      showToast("Đã cập nhật phân quyền tài khoản thành công.", "success");
    } else {
      const newId = Math.max(0, ...permissions.map((p) => p.id)) + 1;
      setPermissions((prev) => [...prev, { id: newId, name, role, scope }]);
      showToast("Đã thêm phân quyền mới thành công.", "success");
    }
    setFormModal(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteModal) return;
    setPermissions((prev) => prev.filter((p) => p.id !== deleteModal.id));
    showToast(`Đã xóa vai trò "${deleteModal.role}" của ${deleteModal.name}.`, "success");
    setDeleteModal(null);
  };

  const rowActions = (item) => (
    <TableActions
      onView={() => setDetailModal(item)}
      onEdit={() => setFormModal({ ...item })}
      onDelete={() => setDeleteModal(item)}
      viewLabel={`Xem chi tiết ${item.name}`}
      editLabel={`Chỉnh sửa quyền ${item.name}`}
      deleteLabel={`Xóa quyền ${item.name}`}
    />
  );

  const columns = [
    {
      key: "name",
      header: "Họ và tên cán bộ / giảng viên",
      width: "36%",
      cell: (item) => (
        <div className="flex items-center gap-3">
          <Avatar name={item.name} size={28} />
          <span className="min-w-0">
            <span className="block font-semibold text-ink-900">{item.name}</span>
            <span className="mt-0.5 block md:hidden">
              <ScopeChip scope={item.scope} />
            </span>
          </span>
        </div>
      )
    },
    { key: "role", header: "Vai trò đảm nhận", width: "30%", cell: (item) => <RoleChip role={item.role} /> },
    { key: "scope", header: "Phạm vi tác nghiệp", width: "24%", hideBelow: "md", cell: (item) => <ScopeChip scope={item.scope} /> },
    { key: "actions", header: "Thao tác", width: "10%", align: "right", cell: rowActions }
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
            onClick={() => setFormModal({ id: null, name: "", role: permissionActorRoles[4], scope: "Lớp phụ trách" })}
          >
            Thêm phân quyền
          </Button>
        }
      />

      <TablePanel
        toolbar={
          <TableToolbar
            searchQuery={table.query}
            onSearchChange={table.setQuery}
            searchPlaceholder="Tìm theo họ tên hoặc vai trò..."
            filterValue={table.filter}
            onFilterChange={table.setFilter}
            filterLabel="Lọc theo vai trò"
            filterAllLabel="Tất cả các vai trò"
            filterOptions={permissionActorRoles}
          />
        }
        pagination={{ page: table.page, totalPages: table.totalPages, onChange: table.setPage, total: table.total, pageSize: table.pageSize }}
      >
        <ResponsiveTable
          columns={columns}
          rows={table.rows}
          rowKey={(p) => p.id}
          caption={pageMeta[pageKey].title}
          getRowProps={(p) => ({ "data-selected": detailModal?.id === p.id ? "true" : undefined })}
          empty={
            <EmptyState
              title="Không tìm thấy phân quyền phù hợp"
              description="Hãy thử từ khóa khác hoặc đặt lại bộ lọc vai trò."
              actionLabel="Đặt lại bộ lọc"
              onAction={table.reset}
            />
          }
          mobileCard={(p) => (
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <Avatar name={p.name} size={32} />
                <p className="font-semibold text-ink-900">{p.name}</p>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <RoleChip role={p.role} />
                <ScopeChip scope={p.scope} />
              </div>
              <div className="flex justify-end border-t border-ink-200 pt-2">{rowActions(p)}</div>
            </div>
          )}
        />
      </TablePanel>

      <Modal
        open={Boolean(formModal)}
        onClose={() => setFormModal(null)}
        closeOnBackdrop={false}
        title={formModal?.id ? "Chỉnh sửa phân quyền" : "Thêm phân quyền tài khoản"}
        description="Gán quyền hạn và phạm vi tác nghiệp trong chu trình xét duyệt tuyển sinh."
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormModal(null)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" form="permission-form">
              {formModal?.id ? "Lưu thay đổi" : "Lưu phân quyền"}
            </Button>
          </>
        }
      >
        {formModal && (
          <form id="permission-form" onSubmit={handleSavePermission} className="space-y-4" autoComplete="off">
            <Field label="Họ và tên cán bộ / giảng viên" required>
              <Input name="name" defaultValue={formModal.name} placeholder="Ví dụ: ThS. Nguyễn Quốc Bảo" />
            </Field>
            <Field label="Vai trò phân nhiệm" required>
              <Select name="role" defaultValue={formModal.role}>
                {permissionActorRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Phạm vi phân quyền" required>
              <Input name="scope" defaultValue={formModal.scope} placeholder="Ví dụ: Khoa CNTT, Ngành KTPM, hoặc Lớp KSTN-KTPM-K20" />
            </Field>
          </form>
        )}
      </Modal>

      <Drawer open={Boolean(detailModal)} onClose={() => setDetailModal(null)} size="md" title="Chi tiết phân quyền">
        {detailModal && (
          <DescriptionList
            layout="inline"
            items={[
              { label: "Họ và tên", value: detailModal.name },
              { label: "Vai trò phân công", value: <RoleChip role={detailModal.role} /> },
              { label: "Phạm vi tác nghiệp", value: detailModal.scope || "Toàn trường" }
            ]}
          />
        )}
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleteModal)}
        tone="danger"
        title="Xác nhận xóa phân quyền"
        description={
          <>
            Bạn có chắc muốn xóa vai trò <strong className="text-ink-900">{deleteModal?.role}</strong> của{" "}
            <strong className="text-ink-900">{deleteModal?.name}</strong>?
          </>
        }
        cancelLabel="Hủy"
        confirmLabel="Xóa phân quyền"
        onCancel={() => setDeleteModal(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

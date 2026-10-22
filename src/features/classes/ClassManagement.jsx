import { useState, useMemo } from "react";
import { Plus, Users, Lock } from "lucide-react";
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
import { Capacity, CodeTag, DescriptionList } from "../../components/ui/Display.jsx";
import { useDemoStore } from "../../data/demo-store.jsx";
import { pageMeta } from "../../data/page-meta.js";
import { usePagedFilter } from "../../hooks/usePagedFilter.js";

const CAPACITY_ERROR = "Sĩ số hiện tại không được lớn hơn sĩ số tối đa của lớp.";
const DUPLICATE_ERROR = "Tên lớp đã tồn tại hoặc ngành này đã có lớp thuộc khóa đã chọn.";

export function ClassManagement({ pageKey = "classes", readonly = false }) {
  const { classes, setClasses, majors, showToast } = useDemoStore();

  const [formModal, setFormModal] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [detailModal, setDetailModal] = useState(null);
  const [blockedModal, setBlockedModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const majorOptions = useMemo(
    () => [...new Set(majors.map((m) => m.name))].sort((a, b) => a.localeCompare(b, "vi")),
    [majors]
  );

  const matchClass = useMemo(
    () => (c, keyword, major) =>
      (!major || c.major === major) &&
      (!keyword || `${c.className} ${c.major} ${c.cohort} ${c.lecturer}`.toLowerCase().includes(keyword)),
    []
  );
  const table = usePagedFilter(classes, { match: matchClass });

  const handleSaveClass = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const className = formData.get("className").trim().replace(/\s+/g, " ");
    const major = formData.get("major");
    const cohort = formData.get("cohort").trim();
    const lecturer = formData.get("lecturer").trim().replace(/\s+/g, " ");
    const current = Number(formData.get("current"));
    const capacity = Number(formData.get("capacity"));

    if (current > capacity) {
      setFormErrors({ current: CAPACITY_ERROR });
      showToast(CAPACITY_ERROR, "error");
      form.elements.current?.focus();
      return;
    }

    const norm = (s) => s.toLowerCase();
    const isDuplicate = classes.some(
      (c) =>
        c.id !== formModal.id &&
        (norm(c.className) === norm(className) || (norm(c.major) === norm(major) && norm(c.cohort) === norm(cohort)))
    );

    if (isDuplicate) {
      setFormErrors({ className: DUPLICATE_ERROR });
      showToast(DUPLICATE_ERROR, "error");
      form.elements.className?.focus();
      return;
    }

    if (formModal.id) {
      setClasses((prev) => prev.map((c) => (c.id === formModal.id ? { ...c, className, major, cohort, lecturer, current, capacity } : c)));
      showToast("Đã cập nhật thông tin lớp thành công.", "success");
    } else {
      const newId = Math.max(0, ...classes.map((c) => c.id)) + 1;
      setClasses((prev) => [
        ...prev,
        { id: newId, className, major, cohort, lecturer, current, capacity, status: "Chưa mở", admissionRound: null, students: [] }
      ]);
      showToast("Đã thêm lớp CN/KSTN mới thành công.", "success");
    }

    closeForm();
  };

  const closeForm = () => {
    setFormModal(null);
    setFormErrors({});
  };

  const handleDeleteRequest = (item) => {
    if (item.admissionRound?.opened) setBlockedModal(item);
    else setDeleteModal(item);
  };

  const handleConfirmDelete = () => {
    if (!deleteModal) return;
    setClasses((prev) => prev.filter((c) => c.id !== deleteModal.id));
    showToast(`Đã xóa lớp "${deleteModal.className}" khỏi danh sách.`, "success");
    setDeleteModal(null);
  };

  const openCreate = () =>
    setFormModal({ id: null, className: "", major: majorOptions[0] || "", cohort: "22", lecturer: "", current: 0, capacity: 30 });

  const rowActions = (item) => (
    <TableActions
      readonly={readonly}
      onView={() => setDetailModal(item)}
      onEdit={() => setFormModal({ ...item })}
      onDelete={() => handleDeleteRequest(item)}
      viewLabel={`Xem chi tiết ${item.className}`}
      editLabel={`Chỉnh sửa ${item.className}`}
      deleteLabel={`Xóa lớp ${item.className}`}
    />
  );

  const columns = [
    {
      key: "className",
      header: "Tên lớp",
      width: "18%",
      cell: (item) => (
        <>
          <CodeTag tone="plain">{item.className}</CodeTag>
          <span className="mt-0.5 block text-body-sm text-ink-600 xl:hidden">{item.major}</span>
        </>
      )
    },
    { key: "major", header: "Chuyên ngành", width: "25%", hideBelow: "xl", cell: (item) => <span className="font-medium text-ink-900">{item.major}</span> },
    { key: "cohort", header: "Khóa", width: "9%", align: "center", hideBelow: "md", cell: (item) => <CodeTag tone="neutral">K{item.cohort}</CodeTag> },
    { key: "lecturer", header: "Giảng viên phụ trách", width: "23%", hideBelow: "md", cell: (item) => <span className="text-ink-600">{item.lecturer}</span> },
    { key: "capacity", header: "Sĩ số", width: "12%", align: "center", cell: (item) => <Capacity current={item.current} max={item.capacity} /> },
    { key: "actions", header: "Thao tác", width: "13%", align: "right", cell: rowActions }
  ];

  const fieldErr = formErrors;

  return (
    <>
      <PageHeader
        title={pageMeta[pageKey].title}
        description={pageMeta[pageKey].desc}
        action={
          !readonly && (
            <Button variant="primary" icon={Plus} onClick={openCreate}>
              Thêm lớp mới
            </Button>
          )
        }
      />

      <TablePanel
        toolbar={
          <TableToolbar
            searchQuery={table.query}
            onSearchChange={table.setQuery}
            searchPlaceholder="Tìm theo tên lớp, ngành hoặc giảng viên..."
            filterValue={table.filter}
            onFilterChange={table.setFilter}
            filterLabel="Lọc theo ngành"
            filterAllLabel="Tất cả các ngành"
            filterOptions={majorOptions}
          />
        }
        pagination={{ page: table.page, totalPages: table.totalPages, onChange: table.setPage, total: table.total, pageSize: table.pageSize }}
      >
        <ResponsiveTable
          columns={columns}
          rows={table.rows}
          rowKey={(c) => c.id}
          caption={pageMeta[pageKey].title}
          onRowClick={readonly ? setDetailModal : undefined}
          getRowProps={(c) => ({ "data-selected": detailModal?.id === c.id ? "true" : undefined })}
          empty={
            <EmptyState
              title="Không tìm thấy lớp học phù hợp"
              description="Hãy thử thay đổi từ khóa hoặc chọn chuyên ngành khác trong bộ lọc."
              actionLabel="Đặt lại bộ lọc"
              onAction={table.reset}
            />
          }
          mobileCard={(c) => (
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <CodeTag>{c.className}</CodeTag>
                <CodeTag tone="neutral">K{c.cohort}</CodeTag>
              </div>
              <p className="font-semibold text-ink-900">{c.major}</p>
              <p className="text-body-sm text-ink-600">{c.lecturer}</p>
              <div className="flex items-center gap-3 text-body-sm text-ink-600">
                <span>Sĩ số</span>
                <Capacity current={c.current} max={c.capacity} />
              </div>
              <div className="flex justify-end border-t border-ink-200 pt-2">{rowActions(c)}</div>
            </div>
          )}
        />
      </TablePanel>

      <Modal
        open={Boolean(formModal)}
        onClose={closeForm}
        closeOnBackdrop={false}
        size="md"
        title={formModal?.id ? "Chỉnh sửa thông tin lớp" : "Thêm lớp CN/KSTN mới"}
        description="Điền thông tin định danh lớp, chuyên ngành, niên khóa và giảng viên phụ trách."
        footer={
          <>
            <Button variant="secondary" onClick={closeForm}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" form="class-form">
              {formModal?.id ? "Lưu thay đổi" : "Tạo lớp"}
            </Button>
          </>
        }
      >
        {formModal && (
          <form id="class-form" onSubmit={handleSaveClass} onChange={() => Object.keys(formErrors).length && setFormErrors({})} className="space-y-6" autoComplete="off">
            <div className="space-y-4">
              <Field label="Tên lớp" required error={fieldErr.className}>
                <Input name="className" defaultValue={formModal.className} placeholder="Ví dụ: KSTN-KTPM-K22" />
              </Field>
              <Field label="Chuyên ngành" required>
                <Select name="major" defaultValue={formModal.major}>
                  {majorOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Khóa học (Số khóa)" required>
                <Input name="cohort" type="number" min="1" max="99" defaultValue={formModal.cohort} placeholder="Ví dụ: 22" />
              </Field>
            </div>

            <div className="space-y-4 border-t border-ink-200 pt-6">
              <Field label="Giảng viên phụ trách" required>
                <Input name="lecturer" defaultValue={formModal.lecturer} placeholder="Ví dụ: ThS. Lê Minh Tâm" />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Sĩ số hiện tại" required error={fieldErr.current}>
                  <Input name="current" type="number" min="0" defaultValue={formModal.current} />
                </Field>
                <Field label="Chỉ tiêu / Sĩ số tối đa" required>
                  <Input name="capacity" type="number" min="1" defaultValue={formModal.capacity} />
                </Field>
              </div>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(blockedModal)}
        tone="warning"
        title="Không thể xóa lớp học"
        description={
          <>
            Lớp <strong className="text-ink-900">{blockedModal?.className}</strong> đã được gắn với đợt xét tuyển{" "}
            <strong className="text-ink-900">{blockedModal?.admissionRound?.code}</strong> và đợt xét tuyển này đã mở tiếp nhận hồ sơ.
          </>
        }
        note="Không thể xóa lớp đang trong chu trình tuyển sinh hoạt động để bảo đảm tính toàn vẹn dữ liệu."
        cancelLabel="Đã hiểu"
        onCancel={() => setBlockedModal(null)}
      />

      <ConfirmDialog
        open={Boolean(deleteModal)}
        tone="danger"
        title="Xác nhận xóa lớp học"
        description={
          <>
            Bạn có chắc chắn muốn xóa lớp <strong className="text-ink-900">{deleteModal?.className}</strong> thuộc ngành{" "}
            <strong className="text-ink-900">{deleteModal?.major}</strong>?
          </>
        }
        note="Thao tác này sẽ gỡ lớp khỏi danh sách quản lý."
        cancelLabel="Hủy"
        confirmLabel="Xác nhận xóa"
        onCancel={() => setDeleteModal(null)}
        onConfirm={handleConfirmDelete}
      />

      <Drawer
        open={Boolean(detailModal)}
        onClose={() => setDetailModal(null)}
        size="xl"
        title={`Thông tin lớp ${detailModal?.className || ""}`}
        description={`${detailModal?.major || ""} · Khóa ${detailModal?.cohort || ""}`}
      >
        <div className="space-y-6">
          <DescriptionList
            columns={3}
            items={[
              { label: "Tên lớp", value: detailModal?.className },
              { label: "Chuyên ngành", value: detailModal?.major },
              { label: "Khóa học", value: `Khóa ${detailModal?.cohort}` },
              { label: "Giảng viên phụ trách", value: detailModal?.lecturer },
              { label: "Sĩ số", value: detailModal && <Capacity current={detailModal.current} max={detailModal.capacity} /> },
              { label: "Trạng thái", value: detailModal && <StatusBadge domain="class">{detailModal.status}</StatusBadge> }
            ]}
          />

          <div>
            <h3 className="mb-3 text-title-3 text-ink-900">Danh sách sinh viên trong lớp</h3>

            {detailModal?.admissionRound?.opened ? (
              detailModal.students && detailModal.students.length > 0 ? (
                <div className="overflow-hidden rounded-card border border-ink-200">
                  <div className="scrollbar-thin overflow-x-auto">
                    <table className="ui-table">
                      <thead>
                        <tr>
                          <th>MSSV</th>
                          <th>Họ và tên</th>
                          <th>Email IUH</th>
                          <th>Trạng thái học vụ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailModal.students.map((st) => (
                          <tr key={st.id}>
                            <td>
                              <CodeTag tone="plain">{st.id}</CodeTag>
                            </td>
                            <td className="font-semibold text-ink-900">{st.name}</td>
                            <td className="font-mono text-body-sm text-ink-600">{st.email}</td>
                            <td>
                              <StatusBadge domain="account">{st.status}</StatusBadge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <EmptyState
                  compact
                  icon={Users}
                  title="Chưa có sinh viên trong lớp"
                  description="Danh sách sinh viên sẽ được cập nhật đồng bộ sau khi công bố kết quả tuyển sinh chính thức."
                />
              )
            ) : (
              <EmptyState
                compact
                icon={Lock}
                title="Lớp chưa chính thức tiếp nhận sinh viên"
                description="Danh sách sinh viên sẽ hiển thị khi đợt xét tuyển gắn với lớp được mở và hoàn tất xét duyệt."
              />
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
}

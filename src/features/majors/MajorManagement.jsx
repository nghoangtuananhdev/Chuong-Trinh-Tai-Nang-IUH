import { useState, useMemo, useRef } from "react";
import { Plus, GraduationCap, ArrowRight } from "lucide-react";
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
import { Field, Input } from "../../components/ui/Form.jsx";
import { Callout, CodeTag, DescriptionList } from "../../components/ui/Display.jsx";
import { useDemoStore } from "../../data/demo-store.jsx";
import { pageMeta } from "../../data/page-meta.js";
import { usePagedFilter } from "../../hooks/usePagedFilter.js";

function ClassCount({ value }) {
  return (
    <span
      className={`inline-flex h-6 min-w-7 items-center justify-center rounded-full border px-2 text-caption font-bold tabular-nums ${
        value > 0 ? "border-brand-100 bg-brand-50 text-brand-700" : "border-ink-200 bg-ink-100 text-ink-400"
      }`}
    >
      {value}
    </span>
  );
}

export function MajorManagement({ pageKey = "majors" }) {
  const { majors, setMajors, showToast } = useDemoStore();
  const nameRef = useRef(null);

  const [formModal, setFormModal] = useState(null); // { id: null | number, faculty, name }
  const [duplicateModal, setDuplicateModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [blockedModal, setBlockedModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const faculties = useMemo(
    () => [...new Set(majors.map((m) => m.faculty))].sort((a, b) => a.localeCompare(b, "vi")),
    [majors]
  );

  const matchMajor = useMemo(
    () => (m, keyword, faculty) =>
      (!faculty || m.faculty === faculty) && (!keyword || `${m.faculty} ${m.name}`.toLowerCase().includes(keyword)),
    []
  );
  const table = usePagedFilter(majors, { match: matchMajor });

  const handleSaveMajor = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const faculty = formData.get("faculty").trim().replace(/\s+/g, " ");
    const name = formData.get("name").trim().replace(/\s+/g, " ");
    const norm = (str) => str.toLowerCase();

    const isDuplicate = majors.some(
      (m) => m.id !== formModal.id && norm(m.faculty) === norm(faculty) && norm(m.name) === norm(name)
    );

    if (isDuplicate) {
      setDuplicateModal({ faculty, name });
      return;
    }

    if (formModal.id) {
      setMajors((prev) => prev.map((m) => (m.id === formModal.id ? { ...m, faculty, name } : m)));
      showToast("Đã cập nhật thông tin chuyên ngành thành công.", "success");
    } else {
      const newId = Math.max(0, ...majors.map((m) => m.id)) + 1;
      setMajors((prev) => [...prev, { id: newId, faculty, name, classes: [] }]);
      showToast("Đã thêm chuyên ngành mới vào danh mục toàn trường.", "success");
    }
    setFormModal(null);
  };

  const closeDuplicate = () => {
    setDuplicateModal(null);
    requestAnimationFrame(() => {
      nameRef.current?.focus();
      nameRef.current?.select();
    });
  };

  const handleDeleteRequest = (major) => {
    if (major.classes && major.classes.length > 0) setBlockedModal(major);
    else setDeleteModal(major);
  };

  const handleConfirmDelete = () => {
    if (!deleteModal) return;
    setMajors((prev) => prev.filter((m) => m.id !== deleteModal.id));
    showToast(`Đã xóa chuyên ngành "${deleteModal.name}" khỏi danh mục.`, "success");
    setDeleteModal(null);
  };

  const openCreate = () => setFormModal({ id: null, faculty: faculties[0] || "", name: "" });
  const rowActions = (major) => (
    <TableActions
      onView={() => setDetailModal(major)}
      onEdit={() => setFormModal({ id: major.id, faculty: major.faculty, name: major.name })}
      onDelete={() => handleDeleteRequest(major)}
      viewLabel={`Xem chi tiết lớp của ${major.name}`}
      editLabel={`Chỉnh sửa ${major.name}`}
      deleteLabel={`Xóa chuyên ngành ${major.name}`}
    />
  );

  const columns = [
    { key: "faculty", header: "Khoa", width: "34%", hideBelow: "md", cell: (m) => <span className="font-medium text-ink-600">{m.faculty}</span> },
    {
      key: "name",
      header: "Chuyên ngành",
      width: "34%",
      cell: (m) => (
        <>
          <span className="font-semibold text-ink-900">{m.name}</span>
          <span className="mt-0.5 block text-body-sm text-ink-600 md:hidden">{m.faculty}</span>
        </>
      )
    },
    { key: "count", header: "Số lượng lớp", width: "14%", align: "center", cell: (m) => <ClassCount value={m.classes.length} /> },
    { key: "actions", header: "Thao tác", width: "14%", align: "right", cell: rowActions }
  ];

  return (
    <>
      <PageHeader
        title={pageMeta[pageKey].title}
        description={pageMeta[pageKey].desc}
        action={
          <Button variant="primary" icon={Plus} onClick={openCreate}>
            Thêm chuyên ngành mới
          </Button>
        }
      />

      <TablePanel
        toolbar={
          <TableToolbar
            searchQuery={table.query}
            onSearchChange={table.setQuery}
            searchPlaceholder="Tìm theo khoa hoặc chuyên ngành..."
            filterValue={table.filter}
            onFilterChange={table.setFilter}
            filterLabel="Lọc theo khoa"
            filterAllLabel="Tất cả các khoa"
            filterOptions={faculties}
          />
        }
        pagination={{ page: table.page, totalPages: table.totalPages, onChange: table.setPage, total: table.total, pageSize: table.pageSize }}
      >
        <ResponsiveTable
          columns={columns}
          rows={table.rows}
          rowKey={(m) => m.id}
          caption={pageMeta[pageKey].title}
          getRowProps={(m) => ({ "data-selected": detailModal?.id === m.id ? "true" : undefined })}
          empty={
            <EmptyState
              title="Không tìm thấy chuyên ngành phù hợp"
              description="Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn khoa khác trong bộ lọc."
              actionLabel="Đặt lại bộ lọc"
              onAction={table.reset}
            />
          }
          mobileCard={(m) => (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink-900">{m.name}</p>
                  <p className="text-body-sm text-ink-600">{m.faculty}</p>
                </div>
                <ClassCount value={m.classes.length} />
              </div>
              <div className="flex justify-end border-t border-ink-200 pt-2">{rowActions(m)}</div>
            </div>
          )}
        />
      </TablePanel>

      <Modal
        open={Boolean(formModal)}
        onClose={() => setFormModal(null)}
        closeOnBackdrop={false}
        title={formModal?.id ? "Chỉnh sửa chuyên ngành" : "Thêm chuyên ngành mới"}
        description="Nhập thông tin khoa và tên chuyên ngành đào tạo."
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormModal(null)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" form="major-form">
              {formModal?.id ? "Lưu thay đổi" : "Tạo chuyên ngành"}
            </Button>
          </>
        }
      >
        {formModal && (
          <form id="major-form" onSubmit={handleSaveMajor} className="space-y-4" autoComplete="off">
            <Field label="Tên khoa phụ trách" required>
              <Input name="faculty" defaultValue={formModal.faculty} placeholder="Ví dụ: Khoa Công nghệ Thông tin" />
            </Field>
            <Field label="Tên chuyên ngành đào tạo" required>
              <Input ref={nameRef} name="name" defaultValue={formModal.name} placeholder="Ví dụ: Kỹ thuật phần mềm" />
            </Field>
            <Callout tone="neutral">
              Mỗi chuyên ngành được xác định duy nhất bởi cặp Tên khoa và Tên chuyên ngành. Hệ thống sẽ kiểm tra trùng lặp trước khi lưu.
            </Callout>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(duplicateModal)}
        tone="warning"
        title="Chuyên ngành đã tồn tại"
        description={
          <>
            Đã có chuyên ngành <strong className="text-ink-900">{duplicateModal?.name}</strong> thuộc{" "}
            <strong className="text-ink-900">{duplicateModal?.faculty}</strong> được tạo trước đó trên hệ thống.
          </>
        }
        note="Vui lòng kiểm tra lại tên chuyên ngành hoặc khoa trực thuộc để tránh tạo dữ liệu trùng lặp."
        cancelLabel="Quay lại kiểm tra"
        onCancel={closeDuplicate}
      />

      <ConfirmDialog
        open={Boolean(blockedModal)}
        tone="warning"
        title="Không thể xóa chuyên ngành"
        description={
          <>
            Chuyên ngành <strong className="text-ink-900">{blockedModal?.name}</strong> đang có{" "}
            <strong className="text-brand-700">{blockedModal?.classes?.length} lớp CN/KSTN</strong> trực thuộc.
          </>
        }
        cancelLabel="Đóng thông báo"
        confirmLabel="Xem danh sách lớp"
        confirmVariant="primary"
        onCancel={() => setBlockedModal(null)}
        onConfirm={() => {
          const target = blockedModal;
          setBlockedModal(null);
          setDetailModal(target);
        }}
      >
        <div className="mt-3 flex flex-wrap items-center gap-2 text-caption font-semibold" aria-hidden="true">
          <span className="rounded-full border border-ink-200 bg-ink-100 px-2.5 py-1 text-ink-600">Khoa</span>
          <ArrowRight size={14} className="text-ink-400" />
          <span className="rounded-full border border-ink-200 bg-ink-100 px-2.5 py-1 text-ink-600">Ngành</span>
          <ArrowRight size={14} className="text-ink-400" />
          <span className="rounded-full border border-warning-border bg-warning-bg px-2.5 py-1 text-warning-fg">
            Lớp · {blockedModal?.classes?.length}
          </span>
        </div>
        <p className="mt-3 text-body-sm text-ink-600">
          Theo quy định phân cấp <em className="not-italic font-medium text-ink-800">(Khoa → Ngành → Lớp)</em>, thành phần con phải được xóa trước thành phần cha. Hãy xóa các lớp thuộc chuyên ngành này trước khi tiến hành xóa chuyên ngành.
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={Boolean(deleteModal)}
        tone="danger"
        title="Xác nhận xóa chuyên ngành"
        description={
          <>
            Bạn có chắc chắn muốn xóa chuyên ngành <strong className="text-ink-900">{deleteModal?.name}</strong> thuộc{" "}
            <strong className="text-ink-900">{deleteModal?.faculty}</strong>?
          </>
        }
        note="Thao tác này không thể hoàn tác sau khi thực hiện."
        cancelLabel="Hủy"
        confirmLabel="Xác nhận xóa"
        onCancel={() => setDeleteModal(null)}
        onConfirm={handleConfirmDelete}
      />

      <Drawer
        open={Boolean(detailModal)}
        onClose={() => setDetailModal(null)}
        size="lg"
        title={`Danh sách lớp CN/KSTN — ${detailModal?.name || ""}`}
        description={`Khoa: ${detailModal?.faculty || ""}`}
      >
        <div className="space-y-5">
          <DescriptionList
            columns={2}
            items={[
              { label: "Khoa quản lý", value: detailModal?.faculty },
              { label: "Tổng số lớp hiện có", value: <span className="text-brand-700">{detailModal?.classes?.length || 0} lớp</span> }
            ]}
          />

          {detailModal?.classes && detailModal.classes.length > 0 ? (
            <div className="overflow-hidden rounded-card border border-ink-200">
              <div className="scrollbar-thin overflow-x-auto">
                <table className="ui-table">
                  <thead>
                    <tr>
                      <th>Mã lớp</th>
                      <th>Khóa</th>
                      <th>Năm học</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailModal.classes.map((c) => (
                      <tr key={c.code}>
                        <td>
                          <CodeTag tone="plain">{c.code}</CodeTag>
                        </td>
                        <td>{c.cohort}</td>
                        <td className="tabular-nums">{c.academicYear}</td>
                        <td>
                          <StatusBadge domain="class">{c.status}</StatusBadge>
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
              icon={GraduationCap}
              title="Chưa có lớp CN/KSTN trực thuộc"
              description="Chuyên ngành này hiện chưa được mở lớp cho bất kỳ khóa đào tạo nào."
            />
          )}
        </div>
      </Drawer>
    </>
  );
}

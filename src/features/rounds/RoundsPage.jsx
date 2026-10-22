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
import { Field, Input, Textarea, RadioCard } from "../../components/ui/Form.jsx";
import { CodeTag, DescriptionList } from "../../components/ui/Display.jsx";
import { ROUND_STATUSES } from "../../data/status-definitions.js";
import { useDemoStore } from "../../data/demo-store.jsx";
import { pageMeta } from "../../data/page-meta.js";
import { usePagedFilter } from "../../hooks/usePagedFilter.js";

const STATUS_KEYS = ["open", "review", "upcoming", "closed"];

const statusLabels = {
  open: "Đang mở",
  review: "Đang xét duyệt",
  upcoming: "Chưa mở",
  closed: "Đã kết thúc"
};

const statusOptionLabels = {
  open: "Đang mở (Đang nhận hồ sơ)",
  review: "Đang xét duyệt",
  upcoming: "Chưa mở",
  closed: "Đã kết thúc"
};

const dotTone = {
  success: "bg-success-solid",
  warning: "bg-warning-solid",
  neutral: "bg-neutral-solid",
  info: "bg-info-solid"
};

const matchRound = (r, keyword, status) =>
  (!status || r.status === status) && (!keyword || `${r.id} ${r.name} ${r.major} ${r.time}`.toLowerCase().includes(keyword));

export function RoundsPage({ pageKey = "rounds", readonly = false }) {
  const { rounds, setRounds, showToast } = useDemoStore();

  const [formModal, setFormModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const table = usePagedFilter(rounds, { match: matchRound });

  const statusOptions = useMemo(
    () =>
      STATUS_KEYS.map((key) => ({
        value: key,
        label: statusLabels[key],
        count: rounds.filter((r) => r.status === key).length
      })),
    [rounds]
  );

  const handleSaveRound = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = formData.get("id")?.trim() || formModal.id;
    const name = formData.get("name").trim();
    const major = formData.get("major").trim();
    const time = formData.get("time").trim();
    const status = formData.get("status");
    const desc = formData.get("desc").trim();

    if (formModal.id && formModal.isEdit) {
      setRounds((prev) =>
        prev.map((r) => (r.id === formModal.id ? { ...r, name, major, time, status, label: statusLabels[status] || status, desc } : r))
      );
      showToast("Đã cập nhật thông tin đợt xét tuyển.", "success");
    } else {
      setRounds((prev) => [
        ...prev,
        { id, name, major, time, status, label: statusLabels[status] || status, desc, quota: 30, target: "Sinh viên đủ điều kiện" }
      ]);
      showToast("Đã tạo đợt xét tuyển mới thành công.", "success");
    }
    setFormModal(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteModal) return;
    setRounds((prev) => prev.filter((r) => r.id !== deleteModal.id));
    showToast(`Đã xóa đợt xét tuyển "${deleteModal.name}".`, "success");
    setDeleteModal(null);
  };

  const rowActions = (r) => (
    <TableActions
      readonly={readonly}
      onView={() => setDetailModal(r)}
      onEdit={() => setFormModal({ ...r, isEdit: true })}
      onDelete={() => setDeleteModal(r)}
      viewLabel={`Xem chi tiết ${r.name}`}
      editLabel={`Chỉnh sửa ${r.name}`}
      deleteLabel={`Xóa đợt ${r.name}`}
    />
  );

  const columns = [
    { key: "id", header: "Mã đợt", width: "14%", cell: (r) => <CodeTag>{r.id}</CodeTag> },
    {
      key: "name",
      header: "Tên đợt xét tuyển",
      width: "28%",
      cell: (r) => (
        <>
          <span className="font-semibold text-ink-900">{r.name}</span>
          <span className="mt-0.5 block text-body-sm text-ink-600 xl:hidden">{r.major}</span>
        </>
      )
    },
    { key: "major", header: "Đơn vị quản trị", width: "22%", hideBelow: "xl", cell: (r) => <span className="text-ink-600">{r.major}</span> },
    { key: "time", header: "Thời gian tiếp nhận", width: "17%", hideBelow: "md", cell: (r) => <span className="tabular-nums text-ink-600">{r.time}</span> },
    { key: "status", header: "Trạng thái", width: "12%", cell: (r) => <StatusBadge domain="round">{r.label || r.status}</StatusBadge> },
    { key: "actions", header: "Thao tác", width: "7%", align: "right", cell: rowActions }
  ];

  return (
    <>
      <PageHeader
        title={pageMeta[pageKey].title}
        description={pageMeta[pageKey].desc}
        action={
          !readonly && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() =>
                setFormModal({
                  id: `DXT-2026-${String(rounds.length + 1).padStart(2, "0")}`,
                  name: "",
                  major: "Khoa Công nghệ Thông tin",
                  time: "01/09 - 15/09/2026",
                  status: "open",
                  desc: "",
                  isEdit: false
                })
              }
            >
              Tạo đợt xét tuyển
            </Button>
          )
        }
      />

      <TablePanel
        toolbar={
          <TableToolbar
            searchQuery={table.query}
            onSearchChange={table.setQuery}
            searchPlaceholder="Tìm theo tên đợt, mã hoặc đơn vị..."
            filterValue={table.filter}
            onFilterChange={table.setFilter}
            filterLabel="Lọc theo trạng thái"
            filterAllLabel="Tất cả trạng thái"
            filterAllCount={rounds.length}
            filterOptions={statusOptions}
            filterVariant="tabs"
          />
        }
        pagination={{ page: table.page, totalPages: table.totalPages, onChange: table.setPage, total: table.total, pageSize: table.pageSize }}
      >
        <ResponsiveTable
          columns={columns}
          rows={table.rows}
          rowKey={(r) => r.id}
          caption={pageMeta[pageKey].title}
          onRowClick={readonly ? setDetailModal : undefined}
          getRowProps={(r) => ({ "data-selected": detailModal?.id === r.id ? "true" : undefined })}
          empty={
            <EmptyState
              title="Không tìm thấy đợt xét tuyển phù hợp"
              description="Hãy thử từ khóa khác hoặc chọn tất cả trạng thái."
              actionLabel="Đặt lại bộ lọc"
              onAction={table.reset}
            />
          }
          mobileCard={(r) => (
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <CodeTag>{r.id}</CodeTag>
                <StatusBadge domain="round">{r.label || r.status}</StatusBadge>
              </div>
              <p className="font-semibold text-ink-900">{r.name}</p>
              <p className="text-body-sm text-ink-600">{r.major}</p>
              <p className="text-body-sm tabular-nums text-ink-600">{r.time}</p>
              <div className="flex justify-end border-t border-ink-200 pt-2">{rowActions(r)}</div>
            </div>
          )}
        />
      </TablePanel>

      <Modal
        open={Boolean(formModal)}
        onClose={() => setFormModal(null)}
        closeOnBackdrop={false}
        size="lg"
        title={formModal?.isEdit ? "Chỉnh sửa đợt xét tuyển" : "Tạo đợt xét tuyển mới"}
        description="Thiết lập thời hạn, chỉ tiêu và đối tượng áp dụng."
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormModal(null)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" form="round-form">
              {formModal?.isEdit ? "Lưu thay đổi" : "Tạo đợt"}
            </Button>
          </>
        }
      >
        {formModal && (
          <form id="round-form" onSubmit={handleSaveRound} className="space-y-5" autoComplete="off">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Mã đợt xét tuyển" required>
                <Input name="id" defaultValue={formModal.id} locked={formModal.isEdit} disabled={formModal.isEdit} className="font-mono" />
              </Field>
              <Field label="Tên đợt xét tuyển" required>
                <Input name="name" defaultValue={formModal.name} placeholder="Ví dụ: Xét tuyển KSTN khóa 22" />
              </Field>
            </div>

            <fieldset>
              <legend className="ui-label">
                Trạng thái
                <span aria-hidden="true" className="ml-0.5 text-danger-fg">*</span>
                <span className="sr-only">Bắt buộc</span>
              </legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {STATUS_KEYS.map((key) => (
                  <RadioCard
                    key={key}
                    name="status"
                    value={key}
                    defaultChecked={formModal.status === key}
                    leading={<span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${dotTone[ROUND_STATUSES[key].tone]}`} />}
                  >
                    <span className="text-body-sm">{statusOptionLabels[key]}</span>
                  </RadioCard>
                ))}
              </div>
            </fieldset>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Đơn vị phụ trách" required>
                <Input name="major" defaultValue={formModal.major} />
              </Field>
              <Field label="Thời gian tiếp nhận hồ sơ" required>
                <Input name="time" defaultValue={formModal.time} placeholder="DD/MM - DD/MM/YYYY" />
              </Field>
            </div>

            <Field label="Mô tả & Đối tượng">
              <Textarea name="desc" rows={4} defaultValue={formModal.desc} placeholder="Mô tả tóm tắt đối tượng và điều kiện..." />
            </Field>
          </form>
        )}
      </Modal>

      <Drawer
        open={Boolean(detailModal)}
        onClose={() => setDetailModal(null)}
        size="md"
        title={detailModal?.name}
        description={`Mã: ${detailModal?.id} · ${detailModal?.major}`}
        eyebrow={detailModal && <CodeTag>{detailModal.id}</CodeTag>}
      >
        {detailModal && (
          <div className="space-y-5">
            <DescriptionList
              columns={2}
              items={[
                { label: "Thời gian", value: <span className="tabular-nums">{detailModal.time}</span> },
                { label: "Trạng thái", value: <StatusBadge domain="round">{detailModal.label || detailModal.status}</StatusBadge> }
              ]}
            />
            <div>
              <h4 className="mb-1 text-overline uppercase text-ink-500">Mô tả</h4>
              <p className="max-w-[68ch] text-body text-ink-900">{detailModal.desc || "Chưa có mô tả chi tiết."}</p>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleteModal)}
        tone="danger"
        title="Xác nhận xóa đợt xét tuyển"
        description={
          <>
            Bạn có chắc muốn xóa đợt xét tuyển <strong className="text-ink-900">{deleteModal?.name}</strong>?
          </>
        }
        cancelLabel="Hủy"
        confirmLabel="Xóa đợt"
        onCancel={() => setDeleteModal(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

import { useState, useMemo } from "react";
import { Plus, Pencil } from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { TablePanel } from "../../components/data/TablePanel.jsx";
import { TableToolbar } from "../../components/data/TableToolbar.jsx";
import { ResponsiveTable } from "../../components/data/ResponsiveTable.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { IconButton } from "../../components/ui/IconButton.jsx";
import { Field, Input, Select } from "../../components/ui/Form.jsx";
import { useDemoStore } from "../../data/demo-store.jsx";
import { pageMeta } from "../../data/page-meta.js";
import { usePagedFilter } from "../../hooks/usePagedFilter.js";

const TYPES = ["Bắt buộc", "Ưu tiên"];

/** Trọng số dạng "50 / 40 / 30" → các chip nhỏ. */
function WeightChips({ value }) {
  const parts = String(value).split(" / ");
  return (
    <span className="inline-flex flex-wrap items-center justify-center gap-1">
      {parts.map((p, i) => (
        <span key={`${p}-${i}`} className="rounded-xs bg-brand-50 px-1.5 py-0.5 font-semibold tabular-nums text-brand-700">
          {p}
        </span>
      ))}
    </span>
  );
}

function OrderBadge({ value }) {
  return (
    <span className="inline-flex size-6 items-center justify-center rounded-full bg-ink-100 font-mono text-caption font-semibold tabular-nums text-ink-700">
      {value}
    </span>
  );
}

const matchCriterion = ({ row }, keyword, type) =>
  (!type || row[0] === type) && (!keyword || `${row[0]} ${row[1]} ${row[2]}`.toLowerCase().includes(keyword));

export function CriteriaPage({ pageKey = "criteria" }) {
  const { criteria, setCriteria, showToast } = useDemoStore();
  const [formModal, setFormModal] = useState(null);

  // Gắn chỉ số gốc để sửa đúng dòng khi đang lọc (lỗi 11.3).
  const items = useMemo(() => criteria.map((row, originalIndex) => ({ row, originalIndex })), [criteria]);
  const table = usePagedFilter(items, { match: matchCriterion });

  const handleSaveCriterion = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const type = formData.get("type");
    const name = formData.get("name").trim();
    const condition = formData.get("condition").trim();
    const points = formData.get("points").trim();
    const tieOrder = formData.get("tieOrder").trim();

    if (formModal.index !== null) {
      setCriteria((prev) => prev.map((item, idx) => (idx === formModal.index ? [type, name, condition, points, tieOrder] : item)));
      showToast("Đã cập nhật tiêu chí xét tuyển.", "success");
    } else {
      setCriteria((prev) => [...prev, [type, name, condition, points, tieOrder]]);
      showToast("Đã thêm tiêu chí xét tuyển mới.", "success");
    }
    setFormModal(null);
  };

  const editAction = ({ row, originalIndex }) => (
    <IconButton
      icon={Pencil}
      label="Chỉnh sửa tiêu chí"
      size="sm"
      variant="tertiary"
      onClick={() =>
        setFormModal({ index: originalIndex, type: row[0], name: row[1], condition: row[2], points: row[3], tieOrder: row[4] })
      }
    />
  );

  const columns = [
    { key: "type", header: "Phân loại", width: "13%", cell: ({ row }) => <StatusBadge domain="criteria">{row[0]}</StatusBadge> },
    {
      key: "name",
      header: "Tên tiêu chí",
      width: "32%",
      cell: ({ row }) => (
        <>
          <span className="font-semibold text-ink-900">{row[1]}</span>
          <span className="mt-0.5 block text-body-sm text-ink-600 md:hidden">{row[2]}</span>
        </>
      )
    },
    { key: "condition", header: "Mức đánh giá / Điều kiện", width: "24%", hideBelow: "md", cell: ({ row }) => <span className="text-ink-600">{row[2]}</span> },
    { key: "points", header: "Trọng số điểm", width: "14%", align: "center", cell: ({ row }) => <WeightChips value={row[3]} /> },
    { key: "order", header: "Thứ tự", width: "9%", align: "center", cell: ({ row }) => <OrderBadge value={row[4]} /> },
    { key: "actions", header: "Thao tác", width: "8%", align: "right", cell: editAction }
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
              setFormModal({ index: null, type: "Bắt buộc", name: "", condition: "", points: "10", tieOrder: String(criteria.length + 1) })
            }
          >
            Thêm tiêu chí
          </Button>
        }
      />

      <TablePanel
        toolbar={
          <TableToolbar
            searchQuery={table.query}
            onSearchChange={table.setQuery}
            searchPlaceholder="Tìm theo tên tiêu chí..."
            filterValue={table.filter}
            onFilterChange={table.setFilter}
            filterLabel="Lọc theo loại tiêu chí"
            filterAllLabel="Tất cả các loại"
            filterOptions={TYPES}
          />
        }
        pagination={{ page: table.page, totalPages: table.totalPages, onChange: table.setPage, total: table.total, pageSize: table.pageSize }}
      >
        <ResponsiveTable
          columns={columns}
          rows={table.rows}
          rowKey={(it) => it.originalIndex}
          caption={pageMeta[pageKey].title}
          empty={
            <EmptyState
              title="Không tìm thấy tiêu chí phù hợp"
              description="Hãy thử thay đổi từ khóa hoặc bộ lọc loại tiêu chí."
              actionLabel="Đặt lại bộ lọc"
              onAction={table.reset}
            />
          }
          mobileCard={(it) => (
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <StatusBadge domain="criteria">{it.row[0]}</StatusBadge>
                <OrderBadge value={it.row[4]} />
              </div>
              <p className="font-semibold text-ink-900">{it.row[1]}</p>
              <p className="text-body-sm text-ink-600">{it.row[2]}</p>
              <WeightChips value={it.row[3]} />
              <div className="flex justify-end border-t border-ink-200 pt-2">{editAction(it)}</div>
            </div>
          )}
        />
      </TablePanel>

      <Modal
        open={Boolean(formModal)}
        onClose={() => setFormModal(null)}
        closeOnBackdrop={false}
        title={formModal?.index !== null ? "Chỉnh sửa tiêu chí xét tuyển" : "Thêm tiêu chí xét tuyển mới"}
        description="Quy định trọng số và thứ tự ưu tiên khi xét tuyển."
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormModal(null)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" form="criteria-form">
              {formModal?.index !== null ? "Lưu thay đổi" : "Thêm tiêu chí"}
            </Button>
          </>
        }
      >
        {formModal && (
          <form id="criteria-form" onSubmit={handleSaveCriterion} className="space-y-4" autoComplete="off">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Phân loại tiêu chí" required>
                <Select name="type" defaultValue={formModal.type}>
                  <option value="Bắt buộc">Bắt buộc</option>
                  <option value="Ưu tiên">Ưu tiên</option>
                </Select>
              </Field>
              <Field label="Thứ tự xét hòa (Tie-break)" required>
                <Input name="tieOrder" type="number" min="1" defaultValue={formModal.tieOrder} />
              </Field>
            </div>
            <Field label="Tên tiêu chí đánh giá" required>
              <Input name="name" defaultValue={formModal.name} placeholder="Ví dụ: Điểm trung bình tích lũy GPA" />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Điều kiện / Mức ngưỡng" required>
                <Input name="condition" defaultValue={formModal.condition} placeholder="Ví dụ: ≥ 3.2" />
              </Field>
              <Field label="Điểm / Trọng số" required>
                <Input name="points" defaultValue={formModal.points} placeholder="Ví dụ: 30 điểm" />
              </Field>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}

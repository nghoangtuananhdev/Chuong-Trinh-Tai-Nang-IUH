import { useState, useMemo, useRef, useEffect } from "react";
import { KeyRound, Check } from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { TablePanel } from "../../components/data/TablePanel.jsx";
import { TableToolbar } from "../../components/data/TableToolbar.jsx";
import { ResponsiveTable } from "../../components/data/ResponsiveTable.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { CodeTag } from "../../components/ui/Display.jsx";
import { useDemoStore } from "../../data/demo-store.jsx";
import { pageMeta } from "../../data/page-meta.js";
import { usePagedFilter } from "../../hooks/usePagedFilter.js";

const matchStudent = (s, keyword, className) =>
  (!className || s.className === className) && (!keyword || `${s.id} ${s.name} ${s.className} ${s.gmail}`.toLowerCase().includes(keyword));

export function PasswordResetPage({ pageKey = "studentPasswords" }) {
  const { students, showToast } = useDemoStore();
  const [confirmModal, setConfirmModal] = useState(null);
  const [justReset, setJustReset] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const classOptions = useMemo(() => [...new Set(students.map((s) => s.className))].filter(Boolean).sort(), [students]);
  const table = usePagedFilter(students, { match: matchStudent });

  const handleReset = () => {
    if (!confirmModal) return;
    showToast(`Đã cấp lại mật khẩu mặc định (12345678) cho sinh viên ${confirmModal.name}.`, "success");
    setJustReset(confirmModal.id);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setJustReset(null), 3000);
    setConfirmModal(null);
  };

  const action = (s) => (
    <span className="inline-flex items-center justify-end gap-2">
      {justReset === s.id && (
        <span className="inline-flex size-6 items-center justify-center rounded-full border border-success-border bg-success-bg text-success-fg" aria-hidden="true">
          <Check size={14} strokeWidth={3} />
        </span>
      )}
      <Button variant="secondary" size="sm" icon={KeyRound} onClick={() => setConfirmModal(s)}>
        Đặt lại mật khẩu
      </Button>
    </span>
  );

  const columns = [
    { key: "id", header: "MSSV", width: "16%", cell: (s) => <CodeTag tone="plain">{s.id}</CodeTag> },
    {
      key: "name",
      header: "Họ và tên",
      width: "26%",
      cell: (s) => (
        <>
          <span className="font-semibold text-ink-900">{s.name}</span>
          <span className="mt-0.5 block text-body-sm text-ink-600 md:hidden">{s.className}</span>
        </>
      )
    },
    { key: "className", header: "Lớp sinh hoạt", width: "18%", hideBelow: "md", cell: (s) => <span className="text-ink-600">{s.className}</span> },
    { key: "gmail", header: "Email tài khoản", width: "22%", hideBelow: "xl", cell: (s) => <span className="font-mono text-body-sm text-ink-600">{s.gmail}</span> },
    { key: "actions", header: "Thao tác", width: "18%", align: "right", cell: action }
  ];

  return (
    <>
      <PageHeader title={pageMeta[pageKey].title} description={pageMeta[pageKey].desc} />

      <TablePanel
        toolbar={
          <TableToolbar
            searchQuery={table.query}
            onSearchChange={table.setQuery}
            searchPlaceholder="Tìm theo MSSV, họ tên hoặc email..."
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
          rowKey={(s) => s.id}
          caption={pageMeta[pageKey].title}
          empty={
            <EmptyState
              title="Không tìm thấy sinh viên"
              description="Hãy thử từ khóa tìm kiếm khác hoặc đặt lại bộ lọc lớp."
              actionLabel="Đặt lại bộ lọc"
              onAction={table.reset}
            />
          }
          mobileCard={(s) => (
            <div className="space-y-2.5">
              <CodeTag>{s.id}</CodeTag>
              <div>
                <p className="font-semibold text-ink-900">{s.name}</p>
                <p className="text-body-sm text-ink-600">{s.className}</p>
                <p className="truncate font-mono text-body-sm text-ink-600">{s.gmail}</p>
              </div>
              <div className="flex justify-end border-t border-ink-200 pt-2">{action(s)}</div>
            </div>
          )}
        />
      </TablePanel>

      <ConfirmDialog
        open={Boolean(confirmModal)}
        tone="warning"
        icon={KeyRound}
        title="Đặt lại mật khẩu tài khoản"
        description={
          <>
            Bạn có chắc chắn muốn đặt lại mật khẩu cho sinh viên <strong className="text-ink-900">{confirmModal?.name}</strong> (MSSV:{" "}
            {confirmModal?.id})?
          </>
        }
        note="Mật khẩu tạm thời sẽ được khôi phục về mặc định và yêu cầu sinh viên đổi mật khẩu ở lần đăng nhập tiếp theo."
        cancelLabel="Hủy"
        confirmLabel="Xác nhận cấp lại"
        onCancel={() => setConfirmModal(null)}
        onConfirm={handleReset}
      />
    </>
  );
}

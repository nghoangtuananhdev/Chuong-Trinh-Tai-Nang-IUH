import { useState, useMemo } from "react";
import { Eye } from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { TablePanel } from "../../components/data/TablePanel.jsx";
import { TableToolbar } from "../../components/data/TableToolbar.jsx";
import { ResponsiveTable } from "../../components/data/ResponsiveTable.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { CodeTag } from "../../components/ui/Display.jsx";
import { ApplicationReviewModal } from "./ApplicationReviewModal.jsx";
import { APPLICATION_STATUSES } from "../../data/status-definitions.js";
import { useDemoStore } from "../../data/demo-store.jsx";
import { pageMeta } from "../../data/page-meta.js";
import { usePagedFilter } from "../../hooks/usePagedFilter.js";

const matchApp = (app, keyword, status) =>
  (!status || app.status === status) &&
  (!keyword || `${app.studentId} ${app.studentName} ${app.studentClass} ${app.type}`.toLowerCase().includes(keyword));

function Score({ app }) {
  if (app.gpa) {
    return (
      <span className="font-semibold tabular-nums text-ink-900">
        {app.gpa} <span className="font-normal text-ink-500">(GPA)</span>
      </span>
    );
  }
  return <span className="font-semibold tabular-nums text-ink-900">{app.totalScore}</span>;
}

export function ApprovalsPage({ pageKey = "approvals", isFinal = false, readonly = false }) {
  const { applications } = useDemoStore();
  const [selectedId, setSelectedId] = useState(null);
  const selectedApp = applications.find((a) => a.id === selectedId) || null;

  const table = usePagedFilter(applications, { match: matchApp });

  const statusOptions = useMemo(
    () =>
      [...new Set(applications.map((a) => a.status))]
        .filter(Boolean)
        .map((status) => ({
          value: status,
          label: APPLICATION_STATUSES[status]?.label || status,
          count: applications.filter((a) => a.status === status).length
        })),
    [applications]
  );

  const openApp = (app) => setSelectedId(app.id);

  const action = (app) => (
    <Button variant={app.status === "pending" ? "primary" : "secondary"} size="sm" icon={Eye} onClick={() => openApp(app)}>
      {readonly ? "Xem hồ sơ" : "Xem & Chấm"}
    </Button>
  );

  const columns = [
    { key: "id", header: "MSSV", width: "13%", cell: (app) => <CodeTag tone="plain">{app.studentId}</CodeTag> },
    {
      key: "name",
      header: "Họ và tên",
      width: "21%",
      cell: (app) => (
        <>
          <span className="font-semibold text-ink-900">{app.studentName}</span>
          <span className="mt-0.5 block text-body-sm text-ink-600 xl:hidden">{app.studentClass}</span>
        </>
      )
    },
    { key: "class", header: "Lớp sinh hoạt", width: "15%", hideBelow: "xl", cell: (app) => <span className="text-ink-600">{app.studentClass}</span> },
    { key: "type", header: "Loại hồ sơ", width: "17%", hideBelow: "lg", cell: (app) => <span className="text-body-sm text-ink-800">{app.type}</span> },
    { key: "score", header: "Tổng điểm", width: "12%", align: "center", hideBelow: "md", cell: (app) => <Score app={app} /> },
    { key: "status", header: "Trạng thái", width: "12%", cell: (app) => <StatusBadge domain="application">{app.status}</StatusBadge> },
    { key: "actions", header: "Thao tác", width: "10%", align: "right", cell: action }
  ];

  const meta = pageMeta[pageKey];

  return (
    <>
      <PageHeader title={meta.title} description={meta.desc} />

      <TablePanel
        toolbar={
          <TableToolbar
            searchQuery={table.query}
            onSearchChange={table.setQuery}
            searchPlaceholder="Tìm theo MSSV, họ tên hoặc lớp..."
            filterValue={table.filter}
            onFilterChange={table.setFilter}
            filterLabel="Lọc theo trạng thái hồ sơ"
            filterAllLabel="Tất cả trạng thái"
            filterAllCount={applications.length}
            filterOptions={statusOptions}
            filterVariant="tabs"
          />
        }
        pagination={{ page: table.page, totalPages: table.totalPages, onChange: table.setPage, total: table.total, pageSize: table.pageSize }}
      >
        <ResponsiveTable
          columns={columns}
          rows={table.rows}
          rowKey={(app) => app.id}
          caption={meta.title}
          onRowClick={openApp}
          getRowProps={(app) => ({
            "data-attention": app.status === "pending" ? "true" : undefined,
            "data-selected": selectedId === app.id ? "true" : undefined
          })}
          empty={
            <EmptyState
              title="Không tìm thấy hồ sơ phù hợp"
              description="Hãy thử từ khóa khác hoặc đặt lại bộ lọc trạng thái."
              actionLabel="Đặt lại bộ lọc"
              onAction={table.reset}
            />
          }
          mobileCard={(app) => (
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <CodeTag>{app.studentId}</CodeTag>
                <StatusBadge domain="application">{app.status}</StatusBadge>
              </div>
              <div>
                <p className="font-semibold text-ink-900">{app.studentName}</p>
                <p className="text-body-sm text-ink-600">
                  {app.studentClass} · {app.type}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-ink-200 pt-2">
                <Score app={app} />
                {action(app)}
              </div>
            </div>
          )}
        />
      </TablePanel>

      <ApplicationReviewModal application={selectedApp} onClose={() => setSelectedId(null)} isFinal={isFinal} readonly={readonly} />
    </>
  );
}

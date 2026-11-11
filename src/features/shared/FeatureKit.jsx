import { useId, useState } from "react";
import { Search } from "lucide-react";
import { useBackend } from "../../mock/backend.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";
import { TablePanel } from "../../components/data/TablePanel.jsx";
import { ResponsiveTable } from "../../components/data/ResponsiveTable.jsx";
import { Pagination } from "../../components/ui/Pagination.jsx";
import {
  Field,
  Input,
  Select,
  Textarea,
  Checkbox,
} from "../../components/ui/Form.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { Callout } from "../../components/ui/Display.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { usePagedFilter } from "../../hooks/usePagedFilter.js";
export function useAction() {
  const { call } = useBackend(),
    { showToast } = useToast();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(null);
  const run = async (name, payload = {}, message = "Đã lưu thay đổi.") => {
    setBusy(true);
    setError(null);
    try {
      const result = await call(name, payload);
      if (message) showToast(message);
      return { ok: true, result };
    } catch (e) {
      setError(e);
      showToast(e.message, "error");
      return { ok: false };
    } finally {
      setBusy(false);
    }
  };
  return { run, busy, error, setError };
}
export function DataList({
  rows,
  columns,
  actions,
  caption = "Danh sách",
  search = true,
}) {
  const list = usePagedFilter(rows, {
    match: (r, q) => !q || JSON.stringify(r).toLowerCase().includes(q),
  });
  const searchLabel = `Tìm kiếm ${caption.toLowerCase()}`;
  return (
    <div className="space-y-3">
      <TablePanel
        toolbar={
          search && (
            <div className="border-b border-ink-200 p-3">
              <Input
                type="search"
                leadingIcon={Search}
                aria-label={searchLabel}
                placeholder={searchLabel}
                className="w-full sm:max-w-sm"
                value={list.query}
                onChange={(e) => list.setQuery(e.target.value)}
              />
            </div>
          )
        }
      >
        <ResponsiveTable
          caption={caption}
          rows={list.rows}
          rowKey={(r) => r.id ?? r.userId ?? r.applicationId ?? r.studentCode}
          columns={[
            ...columns,
            ...(actions
              ? [
                  {
                    key: "actions",
                    header: "Thao tác",
                    align: "right",
                    className: "whitespace-nowrap",
                    cell: (r) => (
                      <div className="flex justify-end gap-1">{actions(r)}</div>
                    ),
                  },
                ]
              : []),
          ]}
          mobileCard={(r) => (
            <div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
                {columns.map((c) => (
                  <div key={c.key} className="contents">
                    <dt className="text-body-sm text-ink-600">{c.header}:</dt>
                    <dd className="min-w-0 break-words">{c.cell(r)}</dd>
                  </div>
                ))}
              </dl>
              {actions && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-ink-200 pt-3">
                  {actions(r)}
                </div>
              )}
            </div>
          )}
          empty={
            <EmptyState
              compact
              title="Không có dữ liệu phù hợp."
              description={null}
            />
          }
        />
        <Pagination {...list} onChange={list.setPage} />
      </TablePanel>
    </div>
  );
}
export function FormDialog({
  open,
  onClose,
  title,
  fields,
  values,
  onChange,
  onSubmit,
  busy,
  error,
  children,
}) {
  const formId = useId();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      closeOnBackdrop={false}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form={formId} loading={busy}>
            Xác nhận
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        {error && (
          <Callout tone="danger" role="alert">
            {error.message}
          </Callout>
        )}
        <div className={fields.length > 4 ? "grid gap-4 sm:grid-cols-2" : "space-y-4"}>
        {fields.map((f) => (
          <Field
            key={f.key}
            className={fields.length > 4 && (f.type === "textarea" || (f.hint && String(f.hint).length > 40)) ? "sm:col-span-2" : undefined}
            label={f.label}
            required={f.required}
            hint={f.hint}
            error={error?.details?.field === f.key ? error.message : undefined}
          >
            {f.type === "select" ? (
              <Select
                value={values[f.key] ?? ""}
                onChange={(e) =>
                  onChange({ ...values, [f.key]: e.target.value })
                }
              >
                <option value="">Chọn…</option>
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            ) : f.type === "textarea" ? (
              <Textarea
                value={values[f.key] ?? ""}
                onChange={(e) =>
                  onChange({ ...values, [f.key]: e.target.value })
                }
              />
            ) : (
              <Input
                type={f.type ?? "text"}
                readOnly={f.readOnly}
                step={f.step}
                value={values[f.key] ?? ""}
                onChange={(e) =>
                  onChange({ ...values, [f.key]: e.target.value })
                }
              />
            )}
          </Field>
        ))}
        </div>
        {children}
      </form>
    </Modal>
  );
}
export const choices = (rows, label = "name") =>
  rows.map((r) => ({
    value: r.id ?? r.userId,
    label: r[label] ?? r.code ?? r.id,
  }));

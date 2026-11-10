import { useState } from "react";
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
  return (
    <div className="space-y-3">
      {search && (
        <Field label={`Tìm kiếm ${caption.toLowerCase()}`}>
          <Input
            type="search"
            value={list.query}
            onChange={(e) => list.setQuery(e.target.value)}
          />
        </Field>
      )}
      <TablePanel>
        <ResponsiveTable
          caption={caption}
          rows={list.rows}
          rowKey={(r) => r.id ?? r.userId ?? r.applicationId ?? r.studentCode}
          columns={[
            ...columns,
            ...(actions
              ? [{ key: "actions", header: "Thao tác", cell: actions }]
              : []),
          ]}
          mobileCard={(r) => (
            <div className="space-y-2">
              {columns.map((c) => (
                <div key={c.key}>
                  <span className="text-caption text-ink-500">
                    {c.header}:{" "}
                  </span>
                  {c.cell(r)}
                </div>
              ))}
              {actions && (
                <div className="flex flex-wrap gap-2 pt-2">{actions(r)}</div>
              )}
            </div>
          )}
          empty={<p className="p-6 text-ink-600">Không có dữ liệu phù hợp.</p>}
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
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      closeOnBackdrop={false}
      size="lg"
    >
      <form
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
        {fields.map((f) => (
          <Field
            key={f.key}
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
        {children}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" loading={busy}>
            Xác nhận
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export const choices = (rows, label = "name") =>
  rows.map((r) => ({
    value: r.id ?? r.userId,
    label: r[label] ?? r.code ?? r.id,
  }));

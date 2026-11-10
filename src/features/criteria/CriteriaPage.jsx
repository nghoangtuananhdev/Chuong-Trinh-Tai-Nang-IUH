import { useState } from "react";
import { assignmentChain } from "../../domain/scope.js";
import { useBackend } from "../../mock/backend.jsx";
import {
  DataList,
  FormDialog,
  useAction,
  choices,
} from "../shared/FeatureKit.jsx";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog.jsx";
import { Button } from "../../components/ui/Button.jsx";
import {
  Field,
  Input,
  Select,
  Textarea,
  Checkbox,
} from "../../components/ui/Form.jsx";
import { Callout } from "../../components/ui/Display.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { CriterionField } from "../../components/domain-ui/CriterionField.jsx";
import { CriteriaTable } from "../../components/domain-ui/CriteriaTable.jsx";
import { scoreApplication } from "../../domain/scoring.js";
import { VALUE_TYPE, OPERATOR } from "../../domain/constants.js";
import { navigate } from "../../app/router.js";
export function CriteriaPage({ id }) {
  const { db, can, me, activeRole } = useBackend(),
    action = useAction();
  const [create, setCreate] = useState(false),
    [form, setForm] = useState({}),
    [editing, setEditing] = useState(null),
    [criterion, setCriterion] = useState(null),
    [items, setItems] = useState([]),
    [mode, setMode] = useState("all"),
    [operation, setOperation] = useState(null);
  const sets = db.criteriaSets.filter((s) =>
    can("criteria.view", { type: "criteriaSet", entity: s }),
  );
  const set = sets.find((s) => s.id === id);
  const local = editing ?? set;
  const addCriterion = () =>
    setCriterion({
      id: crypto.randomUUID(),
      name: "",
      kind: "REQUIRED",
      valueType: "NUMBER_THRESHOLD",
      unit: "",
      evidenceRequired: false,
      evidenceGuide: "",
      sortOrder: (local?.criteria.length ?? 0) + 1,
      tieBreakOrder: null,
      refCriterionId: null,
      countMode: "LEVEL",
      maxPoints: null,
      levels: [
        {
          id: crypto.randomUUID(),
          label: "Đạt",
          operator: "GTE",
          valueFrom: 0,
          points: 0,
        },
      ],
    });
  if (!id)
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setMode("all")}>
            Tất cả trong khoa
          </Button>
          <Button variant="secondary" onClick={() => setMode("own")}>
            Do tôi tạo
          </Button>
          <Button variant="secondary" onClick={() => setMode("archive")}>
            Lưu trữ
          </Button>
          {can("criteria.create") && (
            <Button onClick={() => setCreate(true)}>Tạo bộ tiêu chí</Button>
          )}
        </div>
        <DataList
          rows={sets.filter((s) =>
            mode === "own"
              ? s.createdBy === me.id
              : mode === "archive"
                ? s.status === "ARCHIVED"
                : true,
          )}
          columns={[
            { key: "name", header: "Tên bộ", cell: (s) => s.name },
            {
              key: "version",
              header: "Phiên bản",
              cell: (s) => `v${s.version}`,
            },
            {
              key: "owner",
              header: "Người tạo",
              cell: (s) => db.users.find((u) => u.id === s.createdBy)?.fullName,
            },
            {
              key: "scope",
              header: "Phạm vi",
              cell: (s) =>
                s.majorId
                  ? `Ngành ${db.majors.find((m) => m.id === s.majorId)?.name ?? s.majorId}`
                  : (db.faculties.find((f) => f.id === s.facultyId)?.name ??
                    s.facultyId),
            },
            {
              key: "status",
              header: "Trạng thái",
              cell: (s) => (
                <StatusBadge domain="criteriaSet">{s.status}</StatusBadge>
              ),
            },
            {
              key: "used",
              header: "Đang dùng bởi",
              cell: (s) =>
                db.rounds.filter((r) => r.criteriaSetId === s.id).length,
            },
          ]}
          actions={(s) => (
            <Button
              size="sm"
              variant="link"
              onClick={() => {
                setEditing(null);
                navigate(`/app/criteria/${s.id}`);
              }}
            >
              Xem / Chỉnh sửa
            </Button>
          )}
        />
        <FormDialog
          open={create}
          onClose={() => setCreate(false)}
          title="Tạo bộ tiêu chí"
          fields={[
            { key: "name", label: "Tên bộ", required: true },
            {
              key: "facultyId",
              label: "Khoa",
              type: "select",
              options: choices(
                db.faculties.filter(
                  (f) =>
                    activeRole.role === "ADMIN" ||
                    f.id === assignmentChain(db, activeRole)?.facultyId,
                ),
              ),
            },
          ]}
          values={form}
          onChange={setForm}
          error={action.error}
          busy={action.busy}
          onSubmit={async () => {
            const r = await action.run("criteria.create", form);
            if (r.ok) {
              setCreate(false);
              navigate(`/app/criteria/${r.result.id}`);
            }
          }}
        />
      </div>
    );
  if (!set)
    return (
      <Callout tone="danger">
        Không tìm thấy bộ tiêu chí hoặc không có quyền.
      </Callout>
    );
  const writable =
      set.status === "DRAFT" &&
      can("criteria.update", { type: "criteriaSet", entity: set }),
    preview = scoreApplication(local, items);
  const save = async () => {
    const r = await action.run("criteria.update", {
      id: set.id,
      name: local.name,
      description: local.description,
      criteria: local.criteria,
    });
    if (r.ok) setEditing(null);
    return r;
  };
  return (
    <div className="space-y-5">
      <h2 className="text-title-2">
        {set.name} · v{set.version}
      </h2>
      <StatusBadge domain="criteriaSet">{set.status}</StatusBadge>
      {db.rounds.some(
        (r) => r.criteriaSetId === set.id && r.criteriaSnapshot,
      ) && (
        <Callout>
          ĐXT đang chạy dùng bản snapshot; phiên bản mới không ảnh hưởng điểm
          của ĐXT.
        </Callout>
      )}
      {writable ? (
        <>
          <Field label="Tên bộ">
            <Input
              value={local.name}
              onChange={(e) => setEditing({ ...local, name: e.target.value })}
            />
          </Field>
          <Field label="Mô tả">
            <Textarea
              value={local.description}
              onChange={(e) =>
                setEditing({ ...local, description: e.target.value })
              }
            />
          </Field>
          <Button variant="secondary" onClick={addCriterion}>
            Thêm tiêu chí
          </Button>
        </>
      ) : null}
      <CriteriaTable snapshot={local} />
      {writable &&
        local.criteria.map((c, i) => (
          <div key={c.id} className="flex flex-wrap gap-2">
            <span className="text-body">{c.name}</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setCriterion(structuredClone(c))}
            >
              Sửa
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={i === 0}
              onClick={() => {
                const copy = [...local.criteria];
                [copy[i - 1], copy[i]] = [copy[i], copy[i - 1]];
                setEditing({
                  ...local,
                  criteria: copy.map((c, i) => ({ ...c, sortOrder: i + 1 })),
                });
              }}
            >
              Lên
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={i === local.criteria.length - 1}
              onClick={() => {
                const copy = [...local.criteria];
                [copy[i], copy[i + 1]] = [copy[i + 1], copy[i]];
                setEditing({
                  ...local,
                  criteria: copy.map((c, i) => ({ ...c, sortOrder: i + 1 })),
                });
              }}
            >
              Xuống
            </Button>
            <Button
              size="sm"
              variant="dangerOutline"
              onClick={() =>
                setEditing({
                  ...local,
                  criteria: local.criteria.filter((x) => x.id !== c.id),
                })
              }
            >
              Xóa tiêu chí
            </Button>
          </div>
        ))}
      <section className="rounded-card border border-ink-200 bg-white p-5">
        <h3 className="text-title-3">Xem trước điểm</h3>
        <Button
          variant="secondary"
          className="my-3"
          onClick={() =>
            setItems(
              local.criteria.map((c) => ({
                criterionId: c.id,
                declaredValue:
                  c.sampleValue ??
                  (c.refCriterionId
                    ? null
                    : Math.max(
                        ...c.levels.map((l) => Number(l.valueFrom) || 0),
                      )),
                declaredCount: c.sampleValue ?? 1,
                declaredEntries:
                  c.valueType === "ACCUMULATIVE_ENUM"
                    ? [c.levels[0], c.levels[2]].filter(Boolean).map((l) => ({
                        id: crypto.randomUUID(),
                        levelId: l.id,
                      }))
                    : [],
              })),
            )
          }
        >
          Điền dữ liệu mẫu Assessment
        </Button>
        {local.criteria.map((c) => (
          <CriterionField
            key={c.id}
            criterion={c}
            item={
              items.find((i) => i.criterionId === c.id) ?? { criterionId: c.id }
            }
            withEvidence={false}
            onChange={(item) =>
              setItems((previous) => [
                ...previous.filter((i) => i.criterionId !== c.id),
                item,
              ])
            }
          />
        ))}
        <p aria-live="polite" className="mt-4 text-title-2">
          {preview.total} điểm · {preview.eligible ? "Đạt BB" : "Chưa đạt BB"}
        </p>
      </section>
      <div className="flex flex-wrap gap-2">
        {writable && (
          <>
            <Button loading={action.busy} onClick={save}>
              Lưu nháp
            </Button>
            <Button
              onClick={async () => {
                if (editing && !(await save()).ok) return;
                await action.run("criteria.publish", { id: set.id });
              }}
            >
              Ban hành
            </Button>
          </>
        )}
        {can("criteria.update", { type: "criteriaSet", entity: set }) && (
          <>
            <Button
              variant="secondary"
              onClick={async () => {
                const r = await action.run("criteria.newVersion", {
                  id: set.id,
                });
                if (r.ok) {
                  setEditing(null);
                  navigate(`/app/criteria/${r.result.id}`);
                }
              }}
            >
              Tạo phiên bản mới
            </Button>
            <Button variant="secondary" onClick={() => setOperation("archive")}>
              Lưu trữ
            </Button>
            {set.status === "DRAFT" && (
              <Button
                variant="dangerOutline"
                onClick={() => setOperation("delete")}
              >
                Xóa bộ nháp
              </Button>
            )}
          </>
        )}
      </div>
      <ConfirmDialog
        open={Boolean(operation)}
        title={
          operation === "delete"
            ? "Xóa bộ tiêu chí nháp?"
            : "Lưu trữ bộ tiêu chí?"
        }
        description="Bộ lưu trữ không còn được chọn cho ĐXT mới. Snapshot của các ĐXT đã mở được giữ nguyên."
        confirmLabel="Xác nhận"
        loading={action.busy}
        onCancel={() => setOperation(null)}
        onConfirm={async () => {
          const r = await action.run(`criteria.${operation}`, { id: set.id });
          if (r.ok) {
            setOperation(null);
            setEditing(null);
            if (operation === "delete") navigate("/app/criteria");
          }
        }}
      />
      <FormDialog
        open={Boolean(criterion)}
        onClose={() => setCriterion(null)}
        title="Chỉnh sửa tiêu chí"
        values={criterion ?? {}}
        onChange={setCriterion}
        fields={[
          { key: "name", label: "Tên tiêu chí", required: true },
          {
            key: "kind",
            label: "Nhóm",
            type: "select",
            options: [
              { value: "REQUIRED", label: "Bắt buộc (BB)" },
              { value: "PRIORITY", label: "Ưu tiên (UT)" },
            ],
          },
          {
            key: "valueType",
            label: "Kiểu tính điểm",
            type: "select",
            options: Object.entries(VALUE_TYPE).map(([value, label]) => ({
              value,
              label,
            })),
          },
          { key: "unit", label: "Đơn vị" },
          {
            key: "evidenceGuide",
            label: "Mô tả yêu cầu minh chứng",
            type: "textarea",
          },
          { key: "tieBreakOrder", label: "Thứ tự xét hòa", type: "number" },
          {
            key: "refCriterionId",
            label: "Tham chiếu giá trị",
            type: "select",
            options: local.criteria
              .filter(
                (c) =>
                  c.id !== criterion?.id &&
                  c.valueType === "NUMBER_THRESHOLD" &&
                  !c.refCriterionId,
              )
              .map((c) => ({ value: c.id, label: c.name })),
          },
          {
            key: "countMode",
            label: "Chế độ đếm",
            type: "select",
            options: [
              { value: "LEVEL", label: "Điểm theo mức" },
              { value: "PER_ITEM", label: "Điểm × số lượng" },
            ],
          },
          {
            key: "maxPoints",
            label: "Điểm trần (không áp dụng tích lũy)",
            type: "number",
          },
        ]}
        onSubmit={() => {
          const copy = {
            ...criterion,
            tieBreakOrder: criterion.tieBreakOrder
              ? Number(criterion.tieBreakOrder)
              : null,
            maxPoints:
              criterion.valueType === "ACCUMULATIVE_ENUM"
                ? null
                : criterion.maxPoints
                  ? Number(criterion.maxPoints)
                  : null,
            refCriterionId: criterion.refCriterionId || null,
          };
          setEditing({
            ...local,
            criteria: [
              ...local.criteria.filter((c) => c.id !== copy.id),
              copy,
            ].sort((a, b) => a.sortOrder - b.sortOrder),
          });
          setCriterion(null);
        }}
      >
        {criterion && (
          <>
            <Checkbox
              checked={criterion.evidenceRequired}
              onChange={(e) =>
                setCriterion({
                  ...criterion,
                  evidenceRequired: e.target.checked,
                })
              }
            >
              Bắt buộc minh chứng
            </Checkbox>
            {criterion.levels.map((l, i) => (
              <div
                key={l.id}
                className="grid grid-cols-2 gap-2 rounded-control border border-ink-200 p-3"
              >
                {[
                  "label",
                  ...(criterion.valueType === "ACCUMULATIVE_ENUM"
                    ? []
                    : ["operator", "valueFrom", "valueTo"]),
                  "points",
                ].map((key) => (
                  <Field
                    key={key}
                    label={
                      {
                        label: "Nhãn mức",
                        operator: "Toán tử",
                        valueFrom: "Từ",
                        valueTo: "Đến",
                        points: "Điểm",
                      }[key]
                    }
                  >
                    {key === "operator" ? (
                      <Select
                        value={l[key]}
                        onChange={(e) =>
                          setCriterion({
                            ...criterion,
                            levels: criterion.levels.map((x, j) =>
                              j === i ? { ...x, [key]: e.target.value } : x,
                            ),
                          })
                        }
                      >
                        {Object.entries(OPERATOR).map(([v, t]) => (
                          <option key={v} value={v}>
                            {t}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <Input
                        type={key === "label" ? "text" : "number"}
                        step="any"
                        value={l[key] ?? ""}
                        onChange={(e) =>
                          setCriterion({
                            ...criterion,
                            levels: criterion.levels.map((x, j) =>
                              j === i
                                ? {
                                    ...x,
                                    [key]:
                                      key === "label"
                                        ? e.target.value
                                        : Number(e.target.value),
                                  }
                                : x,
                            ),
                          })
                        }
                      />
                    )}
                  </Field>
                ))}
                <Button
                  size="sm"
                  variant="dangerOutline"
                  onClick={() =>
                    setCriterion({
                      ...criterion,
                      levels: criterion.levels.filter((x) => x.id !== l.id),
                    })
                  }
                >
                  Xóa mức
                </Button>
              </div>
            ))}
            <Button
              variant="secondary"
              onClick={() =>
                setCriterion({
                  ...criterion,
                  levels: [
                    ...criterion.levels,
                    {
                      id: crypto.randomUUID(),
                      label: "Mức mới",
                      operator: "GTE",
                      valueFrom: 0,
                      points: 0,
                    },
                  ],
                })
              }
            >
              Thêm mức
            </Button>
          </>
        )}
      </FormDialog>
    </div>
  );
}

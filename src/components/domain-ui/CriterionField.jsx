import { FileText, Plus } from "lucide-react";
import { Field, Input, Select } from "../ui/Form.jsx";
import { Button } from "../ui/Button.jsx";
import { Callout } from "../ui/Display.jsx";
import { Panel } from "../ui/Panel.jsx";
import { EvidenceUploader } from "./EvidenceUploader.jsx";
import { OPERATOR } from "../../domain/constants.js";
export function CriterionField({
  criterion: c,
  item = {},
  onChange,
  withEvidence = true,
  onView,
  readOnly = false,
}) {
  const change = (patch) => onChange({ ...item, criterionId: c.id, ...patch });
  return (
    <Panel
      titleAs="h3"
      title={
        <>
          {c.name}{" "}
          <span
            className={`rounded-full px-2 text-caption font-semibold ${c.kind === "REQUIRED" ? "bg-brand-50 text-brand-700" : "bg-ink-100 text-ink-700"}`}
          >
            {c.kind === "REQUIRED" ? "BB" : "UT"}
          </span>{" "}
          <span className="text-body-sm font-normal text-ink-600">
            · {c.unit}
          </span>
        </>
      }
    >
     <div className="space-y-3">
      <div className="space-y-1 rounded-control bg-ink-25 px-3 py-2 text-body-sm text-ink-700">
        <p>
          Mức điểm:{" "}
          {c.levels
            .map((l) =>
              c.valueType === "ACCUMULATIVE_ENUM"
                ? `${l.label}: ${l.points} điểm`
                : `${OPERATOR[l.operator]} ${l.valueFrom}${l.operator === "BETWEEN" ? `–${l.valueTo}` : ""} → ${l.points} điểm`,
            )
            .join(" · ")}
        </p>
        <p className="text-ink-600">{c.evidenceGuide}</p>
      </div>
      {c.refCriterionId ? (
        <p className="text-body-sm">
          Dùng giá trị của tiêu chí được tham chiếu.
        </p>
      ) : c.valueType === "ACCUMULATIVE_ENUM" ? (
        <div className="space-y-3">
          {(item.declaredEntries ?? []).map((entry, i) => (
            <div
              key={entry.id}
              className="space-y-3 rounded-control border border-ink-200 p-4"
            >
              <div className="grid gap-3 sm:grid-cols-2">
              <Field label={`Tên thành tích ${i + 1}`}>
                <Input
                  value={entry.title ?? ""}
                  readOnly={readOnly}
                  onChange={(e) =>
                    change({
                      declaredEntries: item.declaredEntries.map((x, j) =>
                        i === j ? { ...x, title: e.target.value } : x,
                      ),
                    })
                  }
                />
              </Field>
              <Field label="Mức giải">
                <Select
                  disabled={readOnly}
                  value={entry.levelId ?? ""}
                  onChange={(e) =>
                    change({
                      declaredEntries: item.declaredEntries.map((x, j) =>
                        i === j ? { ...x, levelId: e.target.value } : x,
                      ),
                    })
                  }
                >
                  <option value="">Chọn mức</option>
                  {c.levels.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label} · {l.points} điểm
                    </option>
                  ))}
                </Select>
              </Field>
              </div>
              {readOnly && (entry.evidence ?? []).length > 0 && (
                <div className="flex flex-col items-start gap-1">
                  {(entry.evidence ?? []).map((file, i) => (
                    <Button
                      key={i}
                      size="sm"
                      variant="link"
                      icon={FileText}
                      onClick={() => onView?.(file)}
                    >
                      {file.name}
                    </Button>
                  ))}
                </div>
              )}
              {withEvidence && !readOnly && (
                <EvidenceUploader
                  files={entry.evidence}
                  onView={onView}
                  onChange={(files) =>
                    change({
                      declaredEntries: item.declaredEntries.map((x, j) =>
                        i === j ? { ...x, evidence: files } : x,
                      ),
                    })
                  }
                />
              )}
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="dangerOutline"
                  disabled={readOnly}
                  onClick={() =>
                    change({
                      declaredEntries: item.declaredEntries.filter(
                        (_, j) => i !== j,
                      ),
                    })
                  }
                >
                  Xóa thành tích
                </Button>
              </div>
            </div>
          ))}
          {!readOnly && (
            <Button
              variant="secondary"
              icon={Plus}
              onClick={() =>
                change({
                  declaredEntries: [
                    ...(item.declaredEntries ?? []),
                    {
                      id: crypto.randomUUID(),
                      title: "",
                      levelId: "",
                      evidence: [],
                    },
                  ],
                })
              }
            >
              Thêm thành tích
            </Button>
          )}
        </div>
      ) : (
        <>
          <Field
            label={
              c.valueType === "COUNT" ? "Số lượng" : `Giá trị (${c.unit ?? ""})`
            }
          >
            <Input
              type="number"
              step={c.valueType === "COUNT" ? "1" : "any"}
              value={
                (c.valueType === "COUNT"
                  ? item.declaredCount
                  : item.declaredValue) ?? ""
              }
              readOnly={readOnly}
              onChange={(e) =>
                change(
                  c.valueType === "COUNT"
                    ? { declaredCount: e.target.value }
                    : { declaredValue: e.target.value },
                )
              }
            />
          </Field>
          {readOnly && (item.evidence ?? []).length > 0 && (
            <div className="flex flex-col items-start gap-1">
              {(item.evidence ?? []).map((file, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant="link"
                  icon={FileText}
                  onClick={() => onView?.(file)}
                >
                  {file.name}
                </Button>
              ))}
            </div>
          )}
          {withEvidence &&
            c.valueType === "COUNT" &&
            Number(item.declaredCount) > (item.evidence?.length ?? 0) && (
              <Callout tone="warning" role="status">
                Số tệp minh chứng đang ít hơn số thành tích khai báo. Nên có một
                minh chứng cho mỗi thành tích.
              </Callout>
            )}
          {withEvidence && !readOnly && (
            <EvidenceUploader
              files={item.evidence}
              onView={onView}
              onChange={(files) => change({ evidence: files })}
            />
          )}
        </>
      )}
     </div>
    </Panel>
  );
}

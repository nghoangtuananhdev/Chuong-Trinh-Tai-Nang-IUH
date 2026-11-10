import { Field, Input, Select } from "../ui/Form.jsx";
import { Button } from "../ui/Button.jsx";
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
    <section className="space-y-3 rounded-card border border-ink-200 bg-white p-4">
      <h3 className="text-title-3">
        {c.name}{" "}
        <span className="text-body-sm text-ink-500">
          {c.kind === "REQUIRED" ? "BB" : "UT"} · {c.unit}
        </span>
      </h3>
      <p className="text-body-sm text-ink-700">
        Mức điểm:{" "}
        {c.levels
          .map((l) =>
            c.valueType === "ACCUMULATIVE_ENUM"
              ? `${l.label}: ${l.points} điểm`
              : `${OPERATOR[l.operator]} ${l.valueFrom}${l.operator === "BETWEEN" ? `–${l.valueTo}` : ""} → ${l.points} điểm`,
          )
          .join(" · ")}
      </p>
      <p className="text-body-sm text-ink-600">{c.evidenceGuide}</p>
      {c.refCriterionId ? (
        <p className="text-body-sm">
          Dùng giá trị của tiêu chí được tham chiếu.
        </p>
      ) : c.valueType === "ACCUMULATIVE_ENUM" ? (
        <div className="space-y-3">
          {(item.declaredEntries ?? []).map((entry, i) => (
            <div
              key={entry.id}
              className="space-y-2 border-l-2 border-brand-200 pl-3"
            >
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
              {readOnly &&
                (entry.evidence ?? []).map((file, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant="link"
                    onClick={() => onView?.(file)}
                  >
                    {file.name}
                  </Button>
                ))}
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
          ))}
          {!readOnly && (
            <Button
              variant="secondary"
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
          {readOnly &&
            (item.evidence ?? []).map((file, i) => (
              <Button
                key={i}
                size="sm"
                variant="link"
                onClick={() => onView?.(file)}
              >
                {file.name}
              </Button>
            ))}
          {withEvidence &&
            c.valueType === "COUNT" &&
            Number(item.declaredCount) > (item.evidence?.length ?? 0) && (
              <p className="text-body-sm text-warning-fg" role="status">
                Số tệp minh chứng đang ít hơn số thành tích khai báo. Nên có một
                minh chứng cho mỗi thành tích.
              </p>
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
    </section>
  );
}

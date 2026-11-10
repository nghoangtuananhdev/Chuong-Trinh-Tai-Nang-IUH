import { ResponsiveTable } from "../data/ResponsiveTable.jsx";
import { VALUE_TYPE, OPERATOR } from "../../domain/constants.js";
export function CriteriaTable({ snapshot }) {
  const criteria = snapshot?.criteria ?? [];
  const levels = (c) =>
    c.levels
      .map((l) =>
        c.valueType === "ACCUMULATIVE_ENUM"
          ? `${l.label}: ${l.points} điểm`
          : `${OPERATOR[l.operator]} ${l.valueFrom}${l.operator === "BETWEEN" ? `–${l.valueTo}` : ""} → ${l.points} điểm`,
      )
      .join(" · ");
  return (
    <ResponsiveTable
      caption="Bộ tiêu chí xét tuyển"
      rows={criteria}
      rowKey={(c) => c.id}
      columns={[
        {
          key: "kind",
          header: "Loại",
          cell: (c) => (c.kind === "REQUIRED" ? "BB" : "UT"),
        },
        {
          key: "name",
          header: "Tiêu chí",
          cell: (c) => (
            <>
              <p className="font-semibold">{c.name}</p>
              <p className="text-body-sm text-ink-500">
                {VALUE_TYPE[c.valueType]}
              </p>
            </>
          ),
        },
        { key: "levels", header: "Các mức điểm", cell: levels },
        {
          key: "evidence",
          header: "Minh chứng",
          cell: (c) => (
            <>
              <p>{c.evidenceRequired ? "Bắt buộc" : "Không bắt buộc"}</p>
              <p className="text-body-sm text-ink-500">{c.evidenceGuide}</p>
            </>
          ),
        },
      ]}
      mobileCard={(c) => (
        <div className="space-y-2">
          <p className="font-semibold">
            {c.kind === "REQUIRED" ? "BB" : "UT"} · {c.name}
          </p>
          <p className="text-body-sm">{levels(c)}</p>
          <p className="text-body-sm text-ink-600">{c.evidenceGuide}</p>
        </div>
      )}
      empty={<p>Chưa có tiêu chí.</p>}
    />
  );
}

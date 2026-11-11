import { DataList } from "../../features/shared/FeatureKit.jsx";
import { Checkbox } from "../ui/Form.jsx";
import { CodeTag } from "../ui/Display.jsx";
import { Button } from "../ui/Button.jsx";
import { navigate } from "../../app/router.js";
export function AdmissionListTable({
  payload,
  selected = [],
  onSelect,
  readOnly = false,
}) {
  return (
    <DataList
      rows={payload?.rows ?? []}
      columns={[
        {
          key: "rank",
          header: "Hạng",
          align: "right",
          width: 64,
          className: "tabular-nums",
          cell: (r) => r.rank,
        },
        {
          key: "code",
          header: "MSSV",
          cell: (r) => <CodeTag>{r.studentCode}</CodeTag>,
        },
        { key: "name", header: "Họ tên", cell: (r) => r.name },
        {
          key: "group",
          header: "Nhóm",
          cell: (r) => (r.group === "RETAINED" ? "SV cũ" : "SV mới"),
        },
        {
          key: "score",
          header: "Điểm chính thức",
          align: "right",
          className: "tabular-nums",
          cell: (r) => r.officialScore,
        },
        {
          key: "proposed",
          header: "Đề xuất",
          cell: (r) =>
            r.tieGroup ? (
              <Checkbox
                disabled={readOnly || !onSelect}
                checked={selected.includes(r.applicationId)}
                onChange={(e) =>
                  onSelect(
                    e.target.checked
                      ? [...selected, r.applicationId]
                      : selected.filter((id) => id !== r.applicationId),
                  )
                }
              >
                Đồng hạng {r.tieGroup}
              </Checkbox>
            ) : r.proposed ? (
              <span className="inline-block rounded-full bg-success-bg px-2 text-caption font-medium text-success-fg">
                Đề xuất
              </span>
            ) : (
              <span className="inline-block rounded-full bg-neutral-bg px-2 text-caption font-medium text-neutral-fg">
                Ngoài chỉ tiêu
              </span>
            ),
        },
        { key: "note", header: "Ghi chú", cell: (r) => r.note },
      ]}
      actions={(r) => (
        <Button
          size="sm"
          variant="link"
          onClick={() =>
            navigate(`/app/records/application/${r.applicationId}`)
          }
        >
          Xem hồ sơ
        </Button>
      )}
    />
  );
}

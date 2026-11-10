import { EvidenceViewer } from "../../components/domain-ui/EvidenceViewer.jsx";
import { Drawer } from "../../components/ui/Drawer.jsx";
import { ApprovalStepper } from "../../components/domain-ui/ApprovalStepper.jsx";
import { APPROVAL_SUBSTATUS } from "../../domain/constants.js";
import { useState } from "react";
import { useBackend } from "../../mock/backend.jsx";
import { useAction, DataList } from "../shared/FeatureKit.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Field, Select, Textarea } from "../../components/ui/Form.jsx";
import { Callout, Timeline, CodeTag } from "../../components/ui/Display.jsx";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog.jsx";
import { AdmissionListTable } from "../../components/domain-ui/AdmissionListTable.jsx";
import { EvidenceUploader } from "../../components/domain-ui/EvidenceUploader.jsx";
import { latestList } from "../../domain/selectors.js";
import { ROLE_LABEL } from "../../domain/constants.js";
import { formatIct } from "../../domain/time.js";
import { navigate } from "../../app/router.js";
export function ApprovalsPage({ id }) {
  const { db, can, activeRole } = useBackend(),
    action = useAction();
  const [version, setVersion] = useState(""),
    [selected, setSelected] = useState([]),
    [comment, setComment] = useState(""),
    [operation, setOperation] = useState(null),
    [files, setFiles] = useState([]),
    [viewFile, setViewFile] = useState(null),
    [publishSummary, setPublishSummary] = useState(null);
  const rounds = db.rounds.filter(
    (r) =>
      ["approving", "published", "review"].includes(r.status) &&
      can("round.view", { type: "round", entity: r }),
  );
  if (!id)
    return (
      <DataList
        rows={rounds.sort(
          (a, b) =>
            Number(
              b.approvalSubstatus ===
                `waiting_${activeRole.role.toLowerCase()}`,
            ) -
            Number(
              a.approvalSubstatus ===
                `waiting_${activeRole.role.toLowerCase()}`,
            ),
        )}
        columns={[
          {
            key: "code",
            header: "ĐXT",
            cell: (r) => (
              <>
                <CodeTag>{r.code}</CodeTag>
                <p>{r.name}</p>
              </>
            ),
          },
          {
            key: "step",
            header: "Đang giữ",
            cell: (r) =>
              r.approvalSubstatus === `waiting_${activeRole.role.toLowerCase()}`
                ? "Chờ tôi xử lý"
                : (APPROVAL_SUBSTATUS[r.approvalSubstatus]?.label ??
                  (r.status === "published" ? "Đã công bố" : "Đang xét duyệt")),
          },
          {
            key: "version",
            header: "Phiên bản",
            cell: (r) => latestList(db, r.id)?.version ?? "Chưa chốt",
          },
        ]}
        actions={(r) => (
          <Button
            size="sm"
            variant="link"
            onClick={() => {
              setVersion("");
              setSelected([]);
              navigate(`/app/approvals/${r.id}`);
            }}
          >
            Xem danh sách
          </Button>
        )}
      />
    );
  const round = rounds.find((r) => r.id === id);
  if (!round)
    return (
      <Callout tone="danger">Không có quyền truy cập danh sách này.</Callout>
    );
  const lists = db.admissionLists
      .filter((l) => l.roundId === id)
      .sort((a, b) => b.version - a.version),
    latest = lists[0],
    list = lists.find((l) => l.id === version) ?? latest;
  if (!list) return <Callout>ĐXT chưa được chốt danh sách.</Callout>;
  const myTurn =
    list.id === latest.id &&
    list.status === "PENDING" &&
    round.approvalSubstatus === `waiting_${activeRole.role.toLowerCase()}`;
  const steps = db.approvalSteps.filter((s) =>
    lists.some((l) => l.id === s.listId),
  );
  const tie = list.payload.rows.some((r) => r.tieGroup),
    selection = list.tieResolution?.selectedApplicationIds ?? selected;
  return (
    <div className="space-y-5">
      <h2 className="text-title-2">
        {round.name} · Chỉ tiêu {list.payload.quota}
      </h2>
      <Field label="Phiên bản danh sách">
        <Select
          value={list.id}
          onChange={(e) => {
            setVersion(e.target.value);
            setSelected([]);
          }}
        >
          {lists.map((l) => (
            <option key={l.id} value={l.id}>
              v{l.version} ·{" "}
              {l.status === "RETURNED"
                ? "Đã trả về"
                : l.status === "PUBLISHED"
                  ? "Đã công bố"
                  : "Chờ phê duyệt"}
            </option>
          ))}
        </Select>
      </Field>
      <ApprovalStepper round={round} list={list} steps={steps} />
      {list.payload.warnings.map((w) => (
        <Callout key={w} tone="warning">
          {w}
        </Callout>
      ))}
      {tie && myTurn && activeRole.role === "HEAD" && (
        <Callout tone="warning">
          Chọn đúng số hồ sơ đồng hạng để lấp số suất còn lại. Service sẽ kiểm
          tra trước khi xác nhận.
        </Callout>
      )}
      <AdmissionListTable
        payload={list.payload}
        selected={selection}
        onSelect={
          myTurn && activeRole.role === "HEAD" ? setSelected : undefined
        }
        readOnly={!myTurn || activeRole.role !== "HEAD"}
      />
      <Timeline
        items={steps.map((s) => ({
          date: formatIct(s.decidedAt),
          actor: db.users.find((u) => u.id === s.decidedBy)?.fullName,
          role: `${ROLE_LABEL[s.level]} · v${lists.find((l) => l.id === s.listId)?.version}`,
          action: s.decision === "RETURNED" ? "Trả về" : "Phê duyệt",
          note: s.comment,
        }))}
      />
      {myTurn && (
        <>
          <Field label="Ý kiến (bắt buộc khi trả về)">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </Field>
          <EvidenceUploader
            files={files}
            onChange={(refs) => setFiles(refs.slice(-1))}
            onView={setViewFile}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="dangerOutline"
              onClick={() => setOperation("return")}
            >
              Trả về
            </Button>
            <Button
              disabled={
                activeRole.role === "HEAD" &&
                tie &&
                selected.length !==
                  Math.min(list.payload.quota, list.payload.rows.length) -
                    list.payload.rows.filter((r) => r.proposed === true).length
              }
              onClick={async () => {
                if (activeRole.role === "TRAINING") {
                  const r = await action.run(
                    "lists.previewPublish",
                    { listId: list.id },
                    "",
                  );
                  if (!r.ok) return;
                  setPublishSummary(r.result);
                }
                setOperation(
                  activeRole.role === "TRAINING" ? "publish" : "approve",
                );
              }}
            >
              {activeRole.role === "TRAINING"
                ? "Phê duyệt & Công bố"
                : activeRole.role === "HEAD"
                  ? "Xác nhận danh sách"
                  : "Phê duyệt danh sách"}
            </Button>
          </div>
        </>
      )}
      {round.status === "published" && (
        <Callout tone="success" title="ĐXT đã công bố và bất biến">
          Đã cập nhật hồ sơ, tư cách CN/KSTN, thành viên lớp và hàng đợi email.{" "}
          <Button
            variant="link"
            onClick={() => navigate(`/app/email-outbox?round=${round.id}`)}
          >
            Email gửi lỗi
          </Button>
        </Callout>
      )}
      {steps
        .filter((s) => s.attachment)
        .map((s) => (
          <Button
            key={s.id}
            variant="link"
            onClick={() => setViewFile(s.attachment)}
          >
            Tệp đính kèm phê duyệt {ROLE_LABEL[s.level]}
          </Button>
        ))}
      <Drawer
        open={Boolean(viewFile)}
        onClose={() => setViewFile(null)}
        title={viewFile?.name}
        size="xl"
      >
        <EvidenceViewer file={viewFile} />
      </Drawer>
      <ConfirmDialog
        open={Boolean(operation)}
        title={
          operation === "publish"
            ? "Phê duyệt & công bố kết quả?"
            : operation === "return"
              ? "Trả về danh sách?"
              : "Xác nhận phê duyệt?"
        }
        description={
          operation === "publish"
            ? `Công bố ${publishSummary?.confirmed ?? 0} sinh viên trúng tuyển; ${publishSummary?.dropped ?? 0} sinh viên DROPPED; đưa ${publishSummary?.emails ?? 0} email vào hàng đợi. ĐXT sẽ bất biến.`
            : comment || "Quyết định áp dụng cho đúng phiên bản đang xem."
        }
        confirmLabel="Xác nhận"
        loading={action.busy}
        onCancel={() => setOperation(null)}
        onConfirm={async () => {
          const payload = {
            listId: list.id,
            level: activeRole.role,
            comment,
            reason: comment,
            attachment: files[0] ?? null,
            tieResolution: { selectedApplicationIds: selected },
          };
          const r = await action.run(`lists.${operation}`, payload);
          if (r.ok) {
            setOperation(null);
            setComment("");
            setSelected([]);
          }
        }}
      />
    </div>
  );
}

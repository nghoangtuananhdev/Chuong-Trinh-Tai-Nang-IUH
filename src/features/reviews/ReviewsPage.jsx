import { useState } from "react";
import { useBackend } from "../../mock/backend.jsx";
import { useAction, DataList } from "../shared/FeatureKit.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Field, Input, Select, Textarea } from "../../components/ui/Form.jsx";
import {
  Callout,
  DescriptionList,
  Timeline,
  CodeTag,
} from "../../components/ui/Display.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Panel } from "../../components/ui/Panel.jsx";
import { IdentityHeader } from "../../components/ui/IdentityHeader.jsx";
import { StatePage } from "../../components/ui/StatePage.jsx";
import { ActionBar } from "../../components/layout/ActionBar.jsx";
import { FileText } from "lucide-react";
import { Modal } from "../../components/ui/Modal.jsx";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog.jsx";
import { EvidenceViewer } from "../../components/domain-ui/EvidenceViewer.jsx";
import { AdmissionListTable } from "../../components/domain-ui/AdmissionListTable.jsx";
import { scoreApplication } from "../../domain/scoring.js";
import { buildAdmissionList } from "../../domain/ranking.js";
import { isFirstRound } from "../../domain/selectors.js";
import { formatIct, addDays, toIct } from "../../domain/time.js";
import { canReviewApplications, phaseState } from "../../domain/round-machine.js";
import { APPLICATION_STATUSES, VERIFY_STATUS } from "../../domain/constants.js";
import { navigate } from "../../app/router.js";
const verifyPill = {
  VALID: "bg-success-bg text-success-fg",
  INVALID: "bg-danger-bg text-danger-fg",
  NEW: "bg-info-bg text-info-fg",
};
function VerifyPill({ status, children }) {
  return (
    <span
      className={`inline-block rounded-full px-2 text-caption font-medium ${verifyPill[status] ?? "bg-neutral-bg text-neutral-fg"}`}
    >
      {children}
    </span>
  );
}
const PHASE_LABEL = {
  upcoming: "Chưa bắt đầu",
  active: "Đang diễn ra",
  ended: "Đã kết thúc",
};
const VERIFY_LABEL = {
  VALID: "Hợp lệ",
  INVALID: "Không hợp lệ",
  UNVERIFIED: "Chưa xác minh",
};
function VerifyToggle({ status, disabled, onPick, label }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant={status === "VALID" ? "primary" : "secondary"}
        aria-pressed={status === "VALID"}
        disabled={disabled}
        onClick={() => onPick("VALID")}
      >
        Hợp lệ
      </Button>
      <Button
        size="sm"
        variant={status === "INVALID" ? "danger" : "dangerOutline"}
        aria-pressed={status === "INVALID"}
        disabled={disabled}
        onClick={() => onPick("INVALID")}
      >
        Không hợp lệ
      </Button>
    </div>
  );
}
function NoteInput({ stored, disabled, onSave }) {
  return (
    <Field label="Ghi chú cho sinh viên (không bắt buộc)">
      <Input
        key={stored}
        defaultValue={stored}
        disabled={disabled}
        onBlur={(e) => {
          if (e.target.value !== stored) onSave(e.target.value);
        }}
      />
    </Field>
  );
}
function AdjustValue({ item, declared, disabled, onApply }) {
  const [open, setOpen] = useState(false),
    [value, setValue] = useState(item.verifiedValue ?? declared ?? ""),
    [reason, setReason] = useState(""),
    [error, setError] = useState("");
  const adjusted = item.verifiedValue != null;
  return (
    <div className="space-y-2">
      {adjusted && (
        <p className="text-body-sm text-ink-700">
          Đã điều chỉnh: {declared} → {item.verifiedValue}{" "}
          <Button
            size="sm"
            variant="link"
            disabled={disabled}
            onClick={() => onApply({ verifiedValue: null, note: "" })}
          >
            Bỏ điều chỉnh
          </Button>
        </p>
      )}
      {!open ? (
        <Button
          size="sm"
          variant="link"
          disabled={disabled}
          onClick={() => setOpen(true)}
        >
          Điều chỉnh giá trị
        </Button>
      ) : (
        <div className="space-y-3 rounded-control border border-ink-200 p-3">
          <Field label="Giá trị xác minh">
            <Input
              type="number"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </Field>
          <Field label="Lý do điều chỉnh" required error={error}>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={disabled}
              onClick={async () => {
                if (value === "" || !Number.isFinite(Number(value)))
                  return setError("Nhập giá trị số hợp lệ.");
                if (!reason.trim())
                  return setError("Vui lòng ghi lý do điều chỉnh.");
                setError("");
                const r = await onApply({
                  verifiedValue: Number(value),
                  note: reason,
                });
                if (r?.ok) {
                  setOpen(false);
                  setReason("");
                }
              }}
            >
              Áp dụng
            </Button>
            <Button size="sm" variant="tertiary" onClick={() => setOpen(false)}>
              Đóng
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
export function ReviewsPage({ id, roundId, readOnly = false }) {
  const { db, can } = useBackend(),
    action = useAction();
  const rounds = db.rounds.filter((r) =>
    can(readOnly ? "round.view" : "application.review", {
      type: "round",
      entity: r,
    }),
  );
  const [selectedRound, setSelectedRound] = useState(
      roundId ??
        rounds.find(
          (r) =>
            canReviewApplications(r) &&
            db.applications.some(
              (a) => a.roundId === r.id && a.status === "pending",
            ),
        )?.id ??
        rounds.find((r) => r.status === "review")?.id ??
        rounds[0]?.id ??
        "",
    ),
    [status, setStatus] = useState(""),
    [sort, setSort] = useState("score"),
    [preview, setPreview] = useState(false),
    [file, setFile] = useState(null),
    [dialog, setDialog] = useState(null),
    [text, setText] = useState(""),
    [due, setDue] = useState(""),
    [formError, setFormError] = useState({});
  const round = db.rounds.find((r) => r.id === selectedRound),
    // Bản nháp chưa nộp không thuộc danh sách xét duyệt của giảng viên.
    apps = db.applications.filter(
      (a) => a.roundId === selectedRound && a.status !== "draft",
    );
  const app = db.applications.find((a) => a.id === id);
  if (!id) {
    const waiting = apps.filter((a) =>
      ["pending", "needs_update"].includes(a.status),
    ).length;
    const payload = round?.criteriaSnapshot
      ? buildAdmissionList({
          round,
          snapshot: round.criteriaSnapshot,
          applications: apps,
          isFirstRound: isFirstRound(db, round),
        })
      : null;
    return (
      <div className="space-y-4">
        <Field label="Đợt xét tuyển">
          <Select
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value)}
          >
            {rounds.map((r) => (
              <option key={r.id} value={r.id}>
                {r.code} · {r.name}
              </option>
            ))}
          </Select>
        </Field>
        {round && (
          <Panel>
            <div className="space-y-1 text-body text-ink-700">
              <p>
                Tiếp nhận: {formatIct(round.intakeStart)} –{" "}
                {formatIct(round.intakeEnd)} ·{" "}
                {PHASE_LABEL[
                  phaseState(round.intakeStart, round.intakeEnd, db.clock.now)
                ]}
              </p>
              <p>
                Xét duyệt dự kiến: {formatIct(round.reviewStart)} –{" "}
                {formatIct(round.reviewEnd)} ·{" "}
                {PHASE_LABEL[
                  phaseState(round.reviewStart, round.reviewEnd, db.clock.now)
                ]}
              </p>
              <p>Còn {waiting} hồ sơ chờ duyệt / chờ bổ sung.</p>
            </div>
          </Panel>
        )}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap items-end gap-3">
          <Field label="Trạng thái">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Tất cả</option>
              {Object.entries(APPLICATION_STATUSES).map(([value, m]) => (
                <option key={value} value={value}>
                  {m.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Sắp xếp">
            <Select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="score">Điểm giảm dần</option>
              <option value="status">Trạng thái</option>
            </Select>
          </Field>
          </div>
          <Button
            disabled={!round || round.status !== "review" || waiting > 0}
            title={
              round?.status === "open"
                ? "Cần đóng tiếp nhận trước khi chốt danh sách"
                : waiting
                  ? "Cần xử lý hết hồ sơ chờ duyệt và bổ sung"
                  : "Xem trước và chốt danh sách"
            }
            onClick={() => setPreview(true)}
          >
            Chốt & gửi phê duyệt
          </Button>
        </div>
        <DataList
          rows={apps
            .filter((a) => !status || a.status === status)
            .sort((a, b) =>
              sort === "score"
                ? (b.officialScore ?? b.selfScore) -
                  (a.officialScore ?? a.selfScore)
                : a.status.localeCompare(b.status),
            )}
          columns={[
            {
              key: "code",
              header: "MSSV",
              cell: (a) => <CodeTag>{a.studentCode}</CodeTag>,
            },
            { key: "name", header: "Họ tên", cell: (a) => a.applicantName },
            {
              key: "flow",
              header: "Luồng",
              cell: (a) => (a.flow === "C" ? "C · SV cũ" : a.flow),
            },
            {
              key: "score",
              header: "Tự khai / Chính thức",
              cell: (a) => `${a.selfScore} / ${a.officialScore ?? "Chưa có"}`,
            },
            {
              key: "status",
              header: "Trạng thái",
              cell: (a) => (
                <StatusBadge domain="application">{a.status}</StatusBadge>
              ),
            },
          ]}
          actions={(a) => (
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate(`/app/reviews/${a.id}`)}
            >
              Xét duyệt / Xem
            </Button>
          )}
        />
        <Modal
          open={preview}
          onClose={() => setPreview(false)}
          title="Xem trước danh sách đề xuất"
          size="xl"
        >
          {payload && (
            <div className="space-y-4">
              <p className="text-body text-ink-700">
                Chỉ tiêu {payload.quota} · SV cũ giữ lại {payload.retainedCount}{" "}
                · Suất bổ sung {payload.slotsForNew}
              </p>
              {payload.warnings.map((w) => (
                <Callout key={w} tone="warning">
                  {w}
                </Callout>
              ))}
              <AdmissionListTable payload={payload} readOnly />
              <Button
                loading={action.busy}
                onClick={async () => {
                  const r = await action.run("lists.closeReview", {
                    roundId: selectedRound,
                  });
                  if (r.ok) {
                    setPreview(false);
                    navigate(`/app/approvals/${selectedRound}`);
                  }
                }}
              >
                Xác nhận chốt, tạo phiên bản mới
              </Button>
            </div>
          )}
        </Modal>
      </div>
    );
  }
  if (
    !app ||
    !can(readOnly ? "application.view" : "application.review", {
      type: "application",
      entity: app,
    })
  )
    return (
      <StatePage tone="danger" title="Không có quyền truy cập">
        Hồ sơ không nằm trong phạm vi hiện tại.
      </StatePage>
    );
  const target = db.rounds.find((r) => r.id === app.roundId),
    score = scoreApplication(target.criteriaSnapshot, app.items, "official");
  const editable =
    !readOnly && canReviewApplications(target) && app.status === "pending";
  const allVerified = app.items.every(
    (i) =>
      ["VALID", "INVALID"].includes(i.verifyStatus) &&
      (i.declaredEntries ?? []).every((e) =>
        ["VALID", "INVALID"].includes(e.verifyStatus),
      ),
  );
  const criteria = target.criteriaSnapshot.criteria,
    requiredAll = criteria.filter((c) => c.kind === "REQUIRED").length,
    requiredOk = requiredAll - score.failedRequired.length,
    verifiedCount = app.items.filter((i) =>
      ["VALID", "INVALID"].includes(i.verifyStatus),
    ).length,
    unverified = app.items.length - verifiedCount;
  const openRequest = db.reviewRequests
    .filter((r) => r.applicationId === app.id && !r.resolvedAt)
    .at(-1);
  const lastResolved = db.reviewRequests
    .filter((r) => r.applicationId === app.id && r.resolvedAt && !r.cancelledBy)
    .at(-1);
  const itemName = (c, e) => (e ? `${c.name} — ${e.title}` : c.name);
  const invalidLines = () =>
    app.items.flatMap((i) => {
      const c = criteria.find((x) => x.id === i.criterionId);
      const lines = [];
      if (i.verifyStatus === "INVALID")
        lines.push(`- ${c.name}${i.verifyNote ? `: ${i.verifyNote}` : ""}`);
      for (const e of i.declaredEntries ?? [])
        if (e.verifyStatus === "INVALID")
          lines.push(
            `- ${itemName(c, e)}${e.verifyNote ? `: ${e.verifyNote}` : ""}`,
          );
      return lines;
    });
  const closeDialog = () => {
    setDialog(null);
    setText("");
    setDue("");
    setFormError({});
    action.setError(null);
  };
  const openDialog = (kind) => {
    setFormError({});
    action.setError(null);
    if (kind === "NEEDS_UPDATE") {
      setText(invalidLines().join("\n"));
      setDue(toIct(addDays(db.clock.now, 3)).slice(0, 16));
    } else if (kind === "REJECTED") setText(invalidLines().join("\n"));
    else setText("");
    setDialog(kind);
  };
  const submitDialog = async () => {
    const errors = {};
    if (!text.trim())
      errors.text =
        dialog === "NEEDS_UPDATE"
          ? "Vui lòng nhập nội dung yêu cầu."
          : "Vui lòng ghi lý do.";
    if (dialog === "NEEDS_UPDATE" && !due) errors.due = "Vui lòng chọn hạn bổ sung.";
    setFormError(errors);
    if (Object.keys(errors).length) return;
    const messages = {
      REJECTED: "Đã ghi nhận hồ sơ không đạt.",
      NEEDS_UPDATE: "Đã gửi yêu cầu bổ sung cho sinh viên.",
      CANCEL: "Đã hủy yêu cầu bổ sung.",
      REOPEN: "Đã mở lại hồ sơ để xét duyệt.",
    };
    const r = await action.run(
      {
        REOPEN: "reviews.reopen",
        CANCEL: "reviews.cancelRequest",
      }[dialog] ?? "reviews.decide",
      dialog === "REOPEN" || dialog === "CANCEL"
        ? { applicationId: app.id, reason: text }
        : {
            applicationId: app.id,
            decision: dialog,
            note: text,
            ...(dialog === "NEEDS_UPDATE" ? { dueAt: `${due}:00+07:00` } : {}),
          },
      messages[dialog],
    );
    if (r.ok) closeDialog();
  };
  const approve = () =>
    action.run(
      "reviews.decide",
      { applicationId: app.id, decision: "APPROVED" },
      "Đã ghi nhận hồ sơ đạt điều kiện.",
    );
  const verify = (item, status, entry, extra = {}) =>
    action.run(
      "reviews.verifyItem",
      {
        applicationId: app.id,
        criterionId: item.criterionId,
        entryId: entry?.id,
        verifyStatus: status,
        ...extra,
      },
      "",
    );
  const approveReason = !allVerified
    ? `Còn ${unverified || 1} tiêu chí chưa xác minh`
    : !score.eligible
      ? "Chưa đạt đủ tiêu chí bắt buộc"
      : "";
  const justUpdated = (item) =>
    lastResolved && item.updatedAt && item.updatedAt >= lastResolved.createdAt;
  return (
    <div className="space-y-6">
      <Panel>
        <IdentityHeader
          as="h2"
          name={
            <>
              {app.applicantName} · <CodeTag>{app.studentCode}</CodeTag>
            </>
          }
          avatarName={app.applicantName}
          aside={<StatusBadge domain="application">{app.status}</StatusBadge>}
        />
        <p className="mt-3 text-body text-ink-700">
          Luồng {app.flow} · Điểm tự khai{" "}
          <span className="font-semibold tabular-nums text-ink-900">
            {app.selfScore}
          </span>{" "}
          → chính thức{" "}
          <span className="font-semibold tabular-nums text-ink-900">
            {score.total}
          </span>
        </p>
        <p className="mt-1 text-body-sm text-ink-600">
          Tiêu chí bắt buộc đạt {requiredOk}/{requiredAll} · Đã xác minh{" "}
          {verifiedCount}/{app.items.length}
        </p>
        {lastResolved && (
          <p className="mt-1 text-body-sm text-ink-600">
            Sinh viên đã gửi bổ sung lúc {formatIct(lastResolved.resolvedAt)}.
          </p>
        )}
        <div className="mt-4 border-t border-ink-200 pt-4">
          <DescriptionList
            layout="plain"
            columns={4}
            items={[
              { label: "Email IUH", value: app.email },
              { label: "Lớp sinh hoạt", value: app.homeClass },
              { label: "ĐXT", value: target.name },
              {
                label: "Ngày nộp",
                value: app.submittedAt
                  ? formatIct(app.submittedAt)
                  : "Bản nháp",
              },
            ]}
          />
        </div>
      </Panel>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          {target.criteriaSnapshot.criteria.map((c) => {
            const item = app.items.find((i) => i.criterionId === c.id);
            return (
              <Panel
                key={c.id}
                titleAs="h3"
                title={`${c.name} · ${c.kind === "REQUIRED" ? "BB" : "UT"}`}
              >
               <div className="space-y-3">
                <p className="text-body-sm">
                  Khai:{" "}
                  {c.valueType === "COUNT"
                    ? item.declaredCount
                    : c.valueType === "ACCUMULATIVE_ENUM"
                      ? `${item.declaredEntries.length} thành tích`
                      : (item.declaredValue ?? "Tham chiếu")}{" "}
                  · {score.rows.find((r) => r.criterionId === c.id)?.points}{" "}
                  điểm ·{" "}
                  <VerifyPill status={item.verifyStatus}>
                    {VERIFY_LABEL[item.verifyStatus] ?? "Chưa xác minh"}
                  </VerifyPill>
                  {justUpdated(item) && (
                    <>
                      {" "}
                      <VerifyPill status="NEW">Vừa cập nhật</VerifyPill>
                    </>
                  )}
                </p>
                {(item.evidence ?? []).length > 0 && (
                  <div className="flex flex-col items-start gap-1">
                    {(item.evidence ?? []).map((f, i) => (
                      <Button
                        key={i}
                        size="sm"
                        variant="link"
                        icon={FileText}
                        onClick={() => setFile(f)}
                      >
                        {f.name}
                      </Button>
                    ))}
                  </div>
                )}
                {(item.declaredEntries ?? []).map((e) => (
                  <div
                    key={e.id}
                    className="space-y-2 rounded-control border border-ink-200 p-3"
                  >
                    <p className="text-body-sm">
                      {e.title} ·{" "}
                      {c.levels.find((l) => l.id === e.levelId)?.label} ·{" "}
                      <VerifyPill status={e.verifyStatus}>
                        {VERIFY_STATUS[e.verifyStatus] ?? "Chưa xác minh"}
                      </VerifyPill>
                    </p>
                    {(e.evidence ?? []).length > 0 && (
                      <div className="flex flex-col items-start gap-1">
                        {e.evidence.map((f, i) => (
                          <Button
                            key={i}
                            size="sm"
                            variant="link"
                            icon={FileText}
                            onClick={() => setFile(f)}
                          >
                            {f.name}
                          </Button>
                        ))}
                      </div>
                    )}
                    {editable && (
                      <>
                        <VerifyToggle
                          label={`Xác minh thành tích ${e.title}`}
                          status={e.verifyStatus}
                          disabled={action.busy}
                          onPick={(st) => verify(item, st, e, { note: e.verifyNote })}
                        />
                        {["VALID", "INVALID"].includes(e.verifyStatus) && (
                          <NoteInput
                            stored={e.verifyNote ?? ""}
                            disabled={action.busy}
                            onSave={(note) => verify(item, e.verifyStatus, e, { note })}
                          />
                        )}
                      </>
                    )}
                  </div>
                ))}
                {editable && (
                  <>
                    <VerifyToggle
                      label={`Xác minh tiêu chí ${c.name}`}
                      status={item.verifyStatus}
                      disabled={action.busy}
                      onPick={(st) => verify(item, st, null, { note: item.verifyNote })}
                    />
                    {["VALID", "INVALID"].includes(item.verifyStatus) && (
                      <NoteInput
                        stored={item.verifyNote ?? ""}
                        disabled={action.busy}
                        onSave={(note) => verify(item, item.verifyStatus, null, { note })}
                      />
                    )}
                    {c.valueType !== "ACCUMULATIVE_ENUM" &&
                      !c.refCriterionId && (
                        <AdjustValue
                          item={item}
                          declared={
                            c.valueType === "COUNT"
                              ? item.declaredCount
                              : item.declaredValue
                          }
                          disabled={action.busy}
                          onApply={(extra) =>
                            verify(item, "VALID", null, extra)
                          }
                        />
                      )}
                  </>
                )}
               </div>
              </Panel>
            );
          })}
        </div>
        <aside className="h-fit lg:sticky lg:top-20">
          <Panel padded={false} className="overflow-auto lg:max-h-[calc(100vh-6rem)]">
            <EvidenceViewer file={file} />
          </Panel>
        </aside>
      </div>
      {!readOnly && canReviewApplications(target) && editable && (
        <Panel>
          <ActionBar
            start={
              <Button
                variant="dangerOutline"
                disabled={action.busy}
                onClick={() => openDialog("REJECTED")}
              >
                Không đạt
              </Button>
            }
          >
            <Button
              variant="secondary"
              disabled={action.busy}
              onClick={() => openDialog("NEEDS_UPDATE")}
            >
              Yêu cầu bổ sung
            </Button>
            <Button
              disabled={Boolean(approveReason) || action.busy}
              onClick={approve}
            >
              Đạt điều kiện
            </Button>
          </ActionBar>
          {approveReason && (
            <p className="mt-3 text-body-sm text-ink-600">{approveReason}</p>
          )}
        </Panel>
      )}
      {!readOnly && canReviewApplications(target) && app.status === "needs_update" && (
        <Panel title="Đang chờ sinh viên bổ sung">
          <div className="space-y-3">
            <p className="text-body text-ink-700">
              Đang chờ sinh viên bổ sung đến{" "}
              {openRequest ? formatIct(openRequest.dueAt) : "—"}.
            </p>
            {openRequest && (
              <p className="whitespace-pre-line text-body-sm text-ink-600">
                {openRequest.message}
              </p>
            )}
            <Button
              variant="secondary"
              disabled={action.busy}
              onClick={() => openDialog("CANCEL")}
            >
              Hủy yêu cầu bổ sung
            </Button>
          </div>
        </Panel>
      )}
      {!readOnly &&
        canReviewApplications(target) &&
        ["approved", "rejected"].includes(app.status) && (
          <Panel>
            <ActionBar>
              <Button variant="secondary" onClick={() => openDialog("REOPEN")}>
                Mở lại để xét duyệt
              </Button>
            </ActionBar>
          </Panel>
        )}
      <Modal
        open={dialog === "NEEDS_UPDATE"}
        onClose={closeDialog}
        closeOnBackdrop={false}
        title="Yêu cầu bổ sung hồ sơ"
        footer={
          <>
            <Button variant="secondary" onClick={closeDialog}>
              Hủy
            </Button>
            <Button loading={action.busy} onClick={submitDialog}>
              Gửi yêu cầu
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Nội dung yêu cầu" required error={formError.text}>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} />
          </Field>
          <Field
            label="Hạn bổ sung"
            required
            error={formError.due ?? (action.error?.details?.field === "dueAt" ? action.error.message : undefined)}
            className="sm:max-w-xs"
          >
            <Input
              type="datetime-local"
              value={due}
              onChange={(e) => setDue(e.target.value)}
            />
          </Field>
        </div>
      </Modal>
      <ConfirmDialog
        open={["REJECTED", "CANCEL", "REOPEN"].includes(dialog)}
        tone={dialog === "REJECTED" ? "danger" : "warning"}
        title={
          dialog === "REJECTED"
            ? "Ghi nhận hồ sơ không đạt?"
            : dialog === "CANCEL"
              ? "Hủy yêu cầu bổ sung?"
              : "Mở lại hồ sơ để xét duyệt?"
        }
        confirmLabel="Xác nhận"
        onConfirm={submitDialog}
        onCancel={closeDialog}
        loading={action.busy}
      >
        <div className="mt-3">
          <Field label="Lý do" required error={formError.text}>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} />
          </Field>
        </div>
      </ConfirmDialog>
      <Panel>
        <Timeline
          items={app.history.map((h) => ({
            date: formatIct(h.at),
            actor: h.actorName,
            role: h.actorRoleLabel,
            action: h.action,
            note: h.note,
          }))}
        />
      </Panel>
    </div>
  );
}

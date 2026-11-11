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
import { EvidenceViewer } from "../../components/domain-ui/EvidenceViewer.jsx";
import { AdmissionListTable } from "../../components/domain-ui/AdmissionListTable.jsx";
import { scoreApplication } from "../../domain/scoring.js";
import { buildAdmissionList } from "../../domain/ranking.js";
import { isFirstRound } from "../../domain/selectors.js";
import { formatIct } from "../../domain/time.js";
import { APPLICATION_STATUSES, VERIFY_STATUS } from "../../domain/constants.js";
import { navigate } from "../../app/router.js";
const verifyPill = {
  VALID: "bg-success-bg text-success-fg",
  INVALID: "bg-danger-bg text-danger-fg",
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
        rounds.find((r) => r.status === "review")?.id ??
        rounds[0]?.id ??
        "",
    ),
    [status, setStatus] = useState(""),
    [sort, setSort] = useState("score"),
    [preview, setPreview] = useState(false),
    [file, setFile] = useState(null),
    [note, setNote] = useState(""),
    [due, setDue] = useState(""),
    [values, setValues] = useState({});
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
          <Panel title={`Xét duyệt đến ${formatIct(round.reviewEnd)}`}>
            <p className="text-body text-ink-700">
              Còn {waiting} hồ sơ chờ duyệt / chờ bổ sung.
            </p>
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
              waiting
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
    !readOnly && target.status === "review" && app.status === "pending";
  const allVerified = app.items.every(
    (i) =>
      ["VALID", "INVALID"].includes(i.verifyStatus) &&
      (i.declaredEntries ?? []).every((e) =>
        ["VALID", "INVALID"].includes(e.verifyStatus),
      ),
  );
  const decide = async (decision, extra = {}) => {
    const r = await action.run(
      decision === "REOPEN" ? "reviews.reopen" : "reviews.decide",
      decision === "REOPEN"
        ? { applicationId: app.id, reason: note }
        : { applicationId: app.id, decision, note, ...extra },
      {
        APPROVED: "Đã ghi nhận hồ sơ đạt điều kiện.",
        REJECTED: "Đã ghi nhận hồ sơ không đạt.",
        NEEDS_UPDATE: "Đã gửi yêu cầu bổ sung cho sinh viên.",
        REOPEN: "Đã mở lại hồ sơ để xét duyệt.",
      }[decision],
    );
    if (r.ok) {
      setNote("");
      setDue("");
      setValues({});
    }
  };
  const verify = (item, status, entry) =>
    action.run("reviews.verifyItem", {
      applicationId: app.id,
      criterionId: item.criterionId,
      entryId: entry?.id,
      verifyStatus: status,
      verifiedValue: entry ? undefined : values[item.criterionId],
      note,
    });
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
      {!score.eligible && (
        <Callout tone="danger">
          Hồ sơ chưa đạt tiêu chí bắt buộc:{" "}
          {score.failedRequired
            .map(
              (id) =>
                target.criteriaSnapshot.criteria.find((c) => c.id === id)?.name,
            )
            .join(", ")}
        </Callout>
      )}
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
                    {item.verifyStatus === "VALID"
                      ? "Hợp lệ"
                      : item.verifyStatus === "INVALID"
                        ? "Không hợp lệ"
                        : "Chưa xác minh"}
                  </VerifyPill>
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
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => verify(item, "VALID", e)}
                        >
                          Thành tích hợp lệ
                        </Button>
                        <Button
                          size="sm"
                          variant="dangerOutline"
                          onClick={() => verify(item, "INVALID", e)}
                        >
                          Thành tích sai
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {editable && (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => verify(item, "VALID")}
                      >
                        Hợp lệ
                      </Button>
                      <Button
                        size="sm"
                        variant="dangerOutline"
                        onClick={() => verify(item, "INVALID")}
                      >
                        Không hợp lệ
                      </Button>
                    </div>
                    {c.valueType !== "ACCUMULATIVE_ENUM" &&
                      !c.refCriterionId && (
                        <Field label="Giá trị điều chỉnh (cần ghi lý do bên dưới)">
                          <Input
                            type="number"
                            step="any"
                            value={values[c.id] ?? ""}
                            onChange={(e) =>
                              setValues({
                                ...values,
                                [c.id]:
                                  e.target.value === "" ? null : e.target.value,
                              })
                            }
                          />
                        </Field>
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
      {!readOnly && target.status === "review" && (
        <Panel>
          <div className="space-y-4">
            <Field label="Ý kiến thẩm định / Lý do điều chỉnh">
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
            {editable ? (
              <>
                <Field
                  label="Hạn bổ sung (không vượt ngày kết thúc xét duyệt)"
                  className="sm:max-w-xs"
                >
                  <Input
                    type="datetime-local"
                    value={due}
                    onChange={(e) => setDue(e.target.value)}
                  />
                </Field>
                <ActionBar
                  className="border-t border-ink-200 pt-4"
                  start={
                    <Button
                      variant="dangerOutline"
                      disabled={action.busy}
                      onClick={() => decide("REJECTED")}
                    >
                      Không đạt
                    </Button>
                  }
                >
                  <Button
                    variant="secondary"
                    disabled={action.busy}
                    onClick={() =>
                      decide("NEEDS_UPDATE", {
                        dueAt: due ? `${due}:00+07:00` : null,
                      })
                    }
                  >
                    Yêu cầu bổ sung
                  </Button>
                  <Button
                    disabled={!score.eligible || !allVerified || action.busy}
                    onClick={() => decide("APPROVED")}
                  >
                    Đạt điều kiện
                  </Button>
                </ActionBar>
              </>
            ) : (
              ["approved", "rejected"].includes(app.status) && (
                <ActionBar>
                  <Button variant="secondary" onClick={() => decide("REOPEN")}>
                    Mở lại để xét duyệt
                  </Button>
                </ActionBar>
              )
            )}
          </div>
        </Panel>
      )}
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

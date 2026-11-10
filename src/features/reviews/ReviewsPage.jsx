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
import { Modal } from "../../components/ui/Modal.jsx";
import { EvidenceViewer } from "../../components/domain-ui/EvidenceViewer.jsx";
import { AdmissionListTable } from "../../components/domain-ui/AdmissionListTable.jsx";
import { scoreApplication } from "../../domain/scoring.js";
import { buildAdmissionList } from "../../domain/ranking.js";
import { isFirstRound } from "../../domain/selectors.js";
import { formatIct } from "../../domain/time.js";
import { APPLICATION_STATUSES, VERIFY_STATUS } from "../../domain/constants.js";
import { navigate } from "../../app/router.js";
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
          <Callout title={`Xét duyệt đến ${formatIct(round.reviewEnd)}`}>
            Còn {waiting} hồ sơ chờ duyệt / chờ bổ sung.
          </Callout>
        )}
        <div className="flex flex-wrap gap-3">
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
              <p>
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
      <Callout tone="danger" title="Không có quyền truy cập">
        Hồ sơ không nằm trong phạm vi hiện tại.
      </Callout>
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
    <div className="space-y-5">
      <h2 className="text-title-2">
        {app.applicantName} · <CodeTag>{app.studentCode}</CodeTag>
      </h2>
      <div className="flex flex-wrap gap-3">
        <StatusBadge domain="application">{app.status}</StatusBadge>
        <p>
          Luồng {app.flow} · Điểm tự khai {app.selfScore} → chính thức{" "}
          {score.total}
        </p>
      </div>
      <DescriptionList
        items={[
          { label: "Email IUH", value: app.email },
          { label: "Lớp sinh hoạt", value: app.homeClass },
          { label: "ĐXT", value: target.name },
          {
            label: "Ngày nộp",
            value: app.submittedAt ? formatIct(app.submittedAt) : "Bản nháp",
          },
        ]}
      />
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
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          {target.criteriaSnapshot.criteria.map((c) => {
            const item = app.items.find((i) => i.criterionId === c.id);
            return (
              <section
                key={c.id}
                className="space-y-3 rounded-card border border-ink-200 bg-white p-4"
              >
                <h3 className="text-title-3">
                  {c.name} · {c.kind === "REQUIRED" ? "BB" : "UT"}
                </h3>
                <p className="text-body-sm">
                  Khai:{" "}
                  {c.valueType === "COUNT"
                    ? item.declaredCount
                    : c.valueType === "ACCUMULATIVE_ENUM"
                      ? `${item.declaredEntries.length} thành tích`
                      : (item.declaredValue ?? "Tham chiếu")}{" "}
                  · {score.rows.find((r) => r.criterionId === c.id)?.points}{" "}
                  điểm ·{" "}
                  {item.verifyStatus === "VALID"
                    ? "Hợp lệ"
                    : item.verifyStatus === "INVALID"
                      ? "Không hợp lệ"
                      : "Chưa xác minh"}
                </p>
                {(item.evidence ?? []).map((f, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant="link"
                    onClick={() => setFile(f)}
                  >
                    {f.name}
                  </Button>
                ))}
                {(item.declaredEntries ?? []).map((e) => (
                  <div
                    key={e.id}
                    className="space-y-2 border-l-2 border-brand-200 pl-3"
                  >
                    <p className="text-body-sm">
                      {e.title} ·{" "}
                      {c.levels.find((l) => l.id === e.levelId)?.label} ·{" "}
                      {VERIFY_STATUS[e.verifyStatus] ?? "Chưa xác minh"}
                    </p>
                    {e.evidence?.map((f, i) => (
                      <Button
                        key={i}
                        size="sm"
                        variant="link"
                        onClick={() => setFile(f)}
                      >
                        {f.name}
                      </Button>
                    ))}
                    {editable && (
                      <div className="flex gap-2">
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
              </section>
            );
          })}
        </div>
        <aside className="h-fit rounded-card border border-ink-200 bg-white p-4 lg:sticky lg:top-4">
          <EvidenceViewer file={file} />
        </aside>
      </div>
      {!readOnly && target.status === "review" && (
        <section className="space-y-4 rounded-card border border-ink-200 bg-white p-5">
          <Field label="Ý kiến thẩm định / Lý do điều chỉnh">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          {editable ? (
            <>
              <Field label="Hạn bổ sung (không vượt ngày kết thúc xét duyệt)">
                <Input
                  type="datetime-local"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                />
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={!score.eligible || !allVerified || action.busy}
                  onClick={() => decide("APPROVED")}
                >
                  Đạt điều kiện
                </Button>
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
                  variant="dangerOutline"
                  disabled={action.busy}
                  onClick={() => decide("REJECTED")}
                >
                  Không đạt
                </Button>
              </div>
            </>
          ) : (
            ["approved", "rejected"].includes(app.status) && (
              <Button
                variant="secondary"
                onClick={() => decide("REOPEN")}
              >
                Mở lại để xét duyệt
              </Button>
            )
          )}
        </section>
      )}
      <Timeline
        items={app.history.map((h) => ({
          date: formatIct(h.at),
          actor: h.actorName,
          role: h.actorRoleLabel,
          action: h.action,
          note: h.note,
        }))}
      />
    </div>
  );
}

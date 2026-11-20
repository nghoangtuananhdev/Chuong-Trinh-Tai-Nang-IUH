import { ScoreSummary } from "../../components/ui/ScoreSummary.jsx";
import { Countdown } from "../../components/ui/Countdown.jsx";
import { ProgramTimeline } from "../../components/domain-ui/ProgramTimeline.jsx";
import { useState, useEffect, useRef } from "react";
import { useBackend } from "../../mock/backend.jsx";
import { DataList, useAction } from "../shared/FeatureKit.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Field, Input, Checkbox } from "../../components/ui/Form.jsx";
import { CircleAlert, CircleCheck, CheckCircle2 } from "lucide-react";
import {
  Callout,
  CodeTag,
  DescriptionList,
  Timeline,
} from "../../components/ui/Display.jsx";
import { Panel } from "../../components/ui/Panel.jsx";
import { IdentityHeader } from "../../components/ui/IdentityHeader.jsx";
import { StatePage } from "../../components/ui/StatePage.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { ActionBar } from "../../components/layout/ActionBar.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Stepper } from "../../components/ui/Stepper.jsx";
import { Drawer } from "../../components/ui/Drawer.jsx";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog.jsx";
import { CriterionField } from "../../components/domain-ui/CriterionField.jsx";
import { EvidenceViewer } from "../../components/domain-ui/EvidenceViewer.jsx";
import { classifyFlow } from "../../domain/flows.js";
import { canReviewApplications } from "../../domain/round-machine.js";
import { scoreApplication } from "../../domain/scoring.js";
import {
  maintenanceRounds,
  studentProfile,
  latestMemberships,
  eligibleClasses,
} from "../../domain/selectors.js";
import { formatIct } from "../../domain/time.js";
import { FLOW_LABEL } from "../../domain/constants.js";
import { navigate } from "../../app/router.js";
export function ApplicationForm({ roundId, applicationId }) {
  const { db, me, call } = useBackend(),
    action = useAction();
  const existing = applicationId
    ? db.applications.find(
        (a) => a.id === applicationId && a.studentUserId === me.id,
      )
    : db.applications.find(
        (a) =>
          a.roundId === roundId &&
          a.studentUserId === me.id &&
          ["draft", "pending", "needs_update", "approved", "rejected"].includes(
            a.status,
          ),
      );
  const round = db.rounds.find((r) => r.id === (roundId ?? existing?.roundId));
  const [data, setData] = useState(() =>
      existing ? structuredClone(existing) : null,
    ),
    [dirty, setDirty] = useState(false),
    [step, setStep] = useState(existing?.status === "needs_update" ? 1 : 0),
    [file, setFile] = useState(null),
    [confirm, setConfirm] = useState(null),
    [saved, setSaved] = useState(""),
    [done, setDone] = useState(null);
  const doneRef = useRef(null);
  useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);
  const started = useRef(false),
    revision = useRef(0);
  const allowExit = useRef(false);
  const [pendingPath, setPendingPath] = useState(null);
  const leave = (path) => {
    allowExit.current = true;
    setDirty(false);
    navigate(path);
  };
  useEffect(() => {
    if (!existing && round && !started.current) {
      started.current = true;
      action
        .run("applications.createDraft", { roundId: round.id }, "")
        .then((r) => {
          if (r.ok) setData(r.result);
        });
    }
  }, [existing, round?.id]);
  useEffect(() => {
    const before = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", before);
    const guard = (event) => {
      if (dirty && !allowExit.current) {
        event.preventDefault();
        setPendingPath(event.detail);
      }
    };
    window.addEventListener("prototype:before-navigate", guard);
    return () => {
      window.removeEventListener("beforeunload", before);
      window.removeEventListener("prototype:before-navigate", guard);
    };
  }, [dirty]);
  const change = (patch) => {
    revision.current++;
    setData((d) => ({ ...d, ...patch }));
    setDirty(true);
  };
  useEffect(() => {
    if (!dirty || !data || data.status !== "draft") return;
    const version = revision.current;
    const timer = setTimeout(async () => {
      try {
        await call("applications.saveDraft", {
          id: data.id,
          items: data.items,
          phone: data.phone,
          homeClass: data.homeClass,
          committed: data.committed,
        });
        if (revision.current === version) {
          setDirty(false);
          setSaved("Đã lưu nháp");
        }
      } catch (e) {
        setSaved(e.message);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [data, dirty, call]);
  if (!round)
    return <StatePage tone="danger">Không tìm thấy đợt xét tuyển.</StatePage>;
  if (!data)
    return (
      <StatePage
        action={
          action.error && (
            <Button onClick={() => navigate("/app/dashboard")}>
              Về tổng quan
            </Button>
          )
        }
      >
        {action.error?.message ?? "Đang tạo hồ sơ nháp…"}
      </StatePage>
    );
  const persisted = db.applications.find((a) => a.id === data.id) ?? data;
  const request = db.reviewRequests
    .filter((r) => r.applicationId === data.id && !r.resolvedAt)
    .at(-1);
  const editable =
    (round.status === "open" &&
      ["draft", "pending"].includes(persisted.status)) ||
    (canReviewApplications(round) && persisted.status === "needs_update");
  const score = scoreApplication(round.criteriaSnapshot, data.items);
  const saveAction = async () => {
    const r = await action.run(
      persisted.status === "draft"
        ? "applications.saveDraft"
        : "applications.update",
      {
        id: data.id,
        items: data.items,
        phone: data.phone,
        homeClass: data.homeClass,
        committed: data.committed,
      },
    );
    if (r.ok) {
      setDirty(false);
      setSaved("Đã lưu");
    }
  };
  const history = (
    <Panel title="Lịch sử xử lý">
      <Timeline
        items={(persisted.history ?? []).map((h) => ({
          date: formatIct(h.at),
          actor: h.actorName,
          role: h.actorRoleLabel,
          action: h.action,
          note: h.note,
        }))}
      />
    </Panel>
  );
  if (done)
    return (
      <div className="mx-auto max-w-xl">
        <Panel>
          <div className="flex flex-col items-center py-6 text-center">
            <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-success-bg text-success-fg">
              <CheckCircle2 size={24} aria-hidden="true" />
            </span>
            <h2
              ref={doneRef}
              tabIndex={-1}
              className="text-title-2 text-ink-900 outline-none"
            >
              {done === "resubmit"
                ? "Đã gửi bổ sung thành công"
                : "Nộp hồ sơ thành công"}
            </h2>
            <dl className="mt-4 space-y-1 text-body text-ink-700">
              <div>
                Mã hồ sơ: <CodeTag>{persisted.code}</CodeTag>
              </div>
              <div>Đợt xét tuyển: {round.name}</div>
              <div>
                Thời điểm nộp:{" "}
                {formatIct(
                  done === "resubmit"
                    ? (persisted.lastEditedAt ?? db.clock.now)
                    : (persisted.submittedAt ?? db.clock.now),
                )}
              </div>
            </dl>
            <p className="mt-4 text-body text-ink-600">
              Kết quả xét duyệt sẽ được gửi qua email và mục Thông báo.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => {
                  setDone(null);
                  navigate(`/app/my-applications/${data.id}`);
                }}
              >
                Xem hồ sơ đã nộp
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate("/app/dashboard")}
              >
                Về tổng quan
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    );
  if (!editable && persisted.status !== "draft")
    return (
      <div className="space-y-6">
        <Panel>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-title-2">{round.name}</h2>
              <p className="mt-1 text-body-sm text-ink-600">
                {FLOW_LABEL[data.flow]} · Mã hồ sơ{" "}
                <CodeTag>{persisted.code}</CodeTag>
                {persisted.submittedAt
                  ? ` · Nộp lúc ${formatIct(persisted.submittedAt)}`
                  : ""}
              </p>
            </div>
            <StatusBadge domain="application">{persisted.status}</StatusBadge>
          </div>
          {round.status === "published" && (
            <p className="mt-4 flex items-baseline gap-2 border-t border-ink-200 pt-4">
              <span className="text-body text-ink-700">Điểm chính thức:</span>
              <span className="text-metric tabular-nums text-ink-900">
                {persisted.officialScore ?? "Chưa có"}
              </span>
            </p>
          )}
          {persisted.decisionNote && (
            <p className="mt-2 text-body-sm text-ink-600">
              {persisted.decisionNote}
            </p>
          )}
        </Panel>
        <Panel title="Thông tin cá nhân">
          <DescriptionList
            layout="plain"
            columns={3}
            items={[
              { label: "Họ tên", value: data.applicantName },
              {
                label: "MSSV",
                value: <CodeTag>{data.studentCode}</CodeTag>,
              },
              { label: "Ngày sinh", value: data.dob },
              { label: "Email IUH", value: data.email },
              { label: "Ngành", value: data.majorName },
              { label: "Số điện thoại", value: data.phone || "—" },
              { label: "Lớp sinh hoạt", value: data.homeClass || "—" },
            ]}
          />
        </Panel>
        {round.criteriaSnapshot.criteria.map((c) => (
          <CriterionField
            key={c.id}
            criterion={c}
            item={data.items.find((i) => i.criterionId === c.id)}
            readOnly
            feedback
            onView={setFile}
          />
        ))}
        {history}
        <Drawer
          open={Boolean(file)}
          onClose={() => setFile(null)}
          title={file?.name}
          size="xl"
        >
          <EvidenceViewer file={file} />
        </Drawer>
      </div>
    );
  const feedback = persisted.status !== "draft";
  const flagged = (c) => {
    const i = data.items.find((x) => x.criterionId === c.id);
    return (
      i?.verifyStatus === "INVALID" ||
      (i?.declaredEntries ?? []).some((e) => e.verifyStatus === "INVALID")
    );
  };
  const criteriaList =
    persisted.status === "needs_update"
      ? [...round.criteriaSnapshot.criteria].sort(
          (a, b) => Number(flagged(b)) - Number(flagged(a)),
        )
      : round.criteriaSnapshot.criteria;
  const flaggedCount = round.criteriaSnapshot.criteria.filter(flagged).length;
  return (
    <div className="space-y-6">
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-title-2">{round.name}</h2>
            <p className="mt-1 text-body-sm text-ink-600">
              {FLOW_LABEL[data.flow]} ·{" "}
              {request
                ? `Hạn bổ sung: ${formatIct(request.dueAt)}`
                : `Hạn tiếp nhận: ${formatIct(round.intakeEnd)}`}
            </p>
          </div>
          <div className="flex flex-col items-start gap-1.5 sm:items-end">
            <StatusBadge domain="application">{persisted.status}</StatusBadge>
            <Countdown now={db.clock.now} until={request?.dueAt ?? round.intakeEnd} />
          </div>
        </div>
        <div className="mt-4 border-t border-ink-200 pt-4">
          <Stepper
            steps={[
              { title: "Thông tin cá nhân" },
              { title: "Tiêu chí & minh chứng" },
              { title: "Kiểm tra & nộp" },
            ]}
            current={step}
            onStep={setStep}
          />
        </div>
      </Panel>
      {round.status === "published" && (
        <Panel>
          <p className="flex items-baseline gap-2">
            <span className="text-body text-ink-700">Điểm chính thức:</span>
            <span className="text-metric tabular-nums text-ink-900">
              {persisted.officialScore ?? "Chưa có"}
            </span>
          </p>
          {persisted.decisionNote && (
            <p className="mt-1 text-body-sm text-ink-600">
              {persisted.decisionNote}
            </p>
          )}
        </Panel>
      )}
      {request && (
        <Callout
          tone="warning"
          title={`Yêu cầu bổ sung trước ${formatIct(request.dueAt)}`}
        >
          {request.message}
        </Callout>
      )}
      {action.error && (
        <Callout tone="danger" role="alert">
          {action.error.message}
        </Callout>
      )}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          {step === 0 && (
            <Panel>
              <DescriptionList
                layout="plain"
                items={[
                  { label: "Họ tên", value: data.applicantName },
                  {
                    label: "MSSV",
                    value: <CodeTag>{data.studentCode}</CodeTag>,
                  },
                  { label: "Ngày sinh", value: data.dob },
                  { label: "Email IUH", value: data.email },
                  { label: "Ngành", value: data.majorName },
                ]}
              />
              <div className="mt-5 grid gap-4 border-t border-ink-200 pt-5 sm:grid-cols-2">
                <Field label="Số điện thoại">
                  <Input
                    value={data.phone ?? ""}
                    readOnly={!editable}
                    onChange={(e) => change({ phone: e.target.value })}
                  />
                </Field>
                <Field label="Lớp sinh hoạt">
                  <Input
                    value={data.homeClass ?? ""}
                    readOnly={!editable}
                    onChange={(e) => change({ homeClass: e.target.value })}
                  />
                </Field>
              </div>
            </Panel>
          )}
          {step === 1 && persisted.status === "needs_update" && (
            <p className="text-body text-ink-700">
              Giảng viên đánh dấu {flaggedCount} tiêu chí cần xem lại.
            </p>
          )}
          {step === 1 &&
            criteriaList.map((c) => (
              <CriterionField
                key={c.id}
                feedback={feedback}
                criterion={c}
                item={data.items.find((i) => i.criterionId === c.id)}
                readOnly={!editable}
                onView={setFile}
                onChange={(item) =>
                  change({
                    items: data.items.map((i) =>
                      i.criterionId === c.id ? item : i,
                    ),
                  })
                }
              />
            ))}
          {step === 2 && (
            <Panel>
              <p className="flex items-baseline gap-2">
                <span className="text-body text-ink-700">Điểm tự khai:</span>
                <span className="text-metric tabular-nums text-ink-900">
                  {score.total}
                </span>
              </p>
              <p className="mt-2 flex items-center gap-2 text-body text-ink-700">
                {score.eligible ? (
                  <CircleCheck size={18} aria-hidden="true" className="shrink-0 text-success-solid" />
                ) : (
                  <CircleAlert size={18} aria-hidden="true" className="shrink-0 text-warning-solid" />
                )}
                {score.eligible
                  ? "Đạt các tiêu chí BB theo tự khai."
                  : "Còn tiêu chí BB chưa đạt."}
              </p>
              <div className="mt-4 rounded-control border border-ink-200 p-4">
                <Checkbox
                  disabled={!editable}
                  checked={data.committed}
                  onChange={(e) => change({ committed: e.target.checked })}
                >
                  Tôi cam kết thông tin và minh chứng là trung thực.
                </Checkbox>
              </div>
            </Panel>
          )}
        </div>
        <aside className="h-fit xl:sticky xl:top-20">
          <ScoreSummary score={score} />
        </aside>
      </div>
      <ActionBar
        sticky
        className="sm:pr-60! max-sm:pb-16!"
        start={
          <>
            {persisted.status === "pending" && round.status === "open" && (
              <Button
                variant="dangerOutline"
                onClick={() => setConfirm("withdraw")}
              >
                Rút hồ sơ
              </Button>
            )}
            {persisted.status === "draft" && round.status === "open" && (
              <Button
                variant="dangerOutline"
                onClick={() => setConfirm("deleteDraft")}
              >
                Hủy nháp
              </Button>
            )}
            <p aria-live="polite" className="text-body-sm text-ink-600">
              {persisted.status === "needs_update" && step === 2 && !dirty
                ? "Hãy chỉnh giá trị hoặc minh chứng được yêu cầu trước khi gửi."
                : dirty
                  ? "Có thay đổi chưa lưu"
                  : saved}
            </p>
          </>
        }
      >
        {step > 0 && (
          <Button
            variant="secondary"
            className="max-sm:flex-1"
            onClick={() => setStep(step - 1)}
          >
            Quay lại
          </Button>
        )}
        {editable && persisted.status !== "needs_update" && (
          <Button
            variant="secondary"
            className="max-sm:flex-1"
            disabled={action.busy}
            onClick={saveAction}
          >
            {persisted.status === "draft" ? "Lưu nháp" : "Lưu chỉnh sửa"}
          </Button>
        )}
        {step < 2 && (
          <Button className="max-sm:flex-1" onClick={() => setStep(step + 1)}>
            Tiếp tục
          </Button>
        )}
        {step === 2 && editable && (
          <Button
            className="max-sm:flex-1"
            loading={action.busy}
            disabled={
              !data.committed || (persisted.status === "needs_update" && !dirty)
            }
            onClick={async () => {
              const method =
                persisted.status === "needs_update"
                  ? "applications.resubmit"
                  : persisted.status === "draft"
                    ? "applications.submit"
                    : "applications.update";
              const r = await action.run(
                method,
                {
                  id: data.id,
                  items: data.items,
                  phone: data.phone,
                  homeClass: data.homeClass,
                  committed: data.committed,
                },
                method === "applications.update" ? "Đã cập nhật hồ sơ." : "",
              );
              if (r.ok) {
                setDirty(false);
                if (method !== "applications.update")
                  setDone(
                    method === "applications.resubmit" ? "resubmit" : "submit",
                  );
                else leave(`/app/my-applications/${data.id}`);
              }
            }}
          >
            {persisted.status === "needs_update"
              ? "Gửi bổ sung"
              : "Nộp hồ sơ chính thức"}
          </Button>
        )}
      </ActionBar>
      {applicationId && history}
      <Drawer
        open={Boolean(file)}
        onClose={() => setFile(null)}
        title={file?.name}
        size="xl"
      >
        <EvidenceViewer file={file} />
      </Drawer>
      <ConfirmDialog
        open={Boolean(pendingPath)}
        title="Rời trang khi chưa lưu?"
        description="Các thay đổi chưa lưu sẽ mất."
        confirmLabel="Rời trang"
        onCancel={() => setPendingPath(null)}
        onConfirm={() => {
          const path = pendingPath;
          setPendingPath(null);
          leave(path);
        }}
      />
      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm === "withdraw" ? "Rút hồ sơ?" : "Hủy bản nháp?"}
        description="Bạn có thể tạo hồ sơ mới nếu ĐXT vẫn tiếp nhận."
        confirmLabel="Xác nhận"
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          const r = await action.run(`applications.${confirm}`, {
            id: data.id,
          });
          if (r.ok) {
            setDirty(false);
            leave("/app/my-applications");
          }
        }}
      />
    </div>
  );
}
export function StudentPortal({ page, id }) {
  const { db, me } = useBackend();
  const profile = studentProfile(db, me.id);
  const apps = db.applications.filter((a) => a.studentUserId === me.id);
  const eligible = eligibleClasses(db, me.id);
  const relevant = db.rounds.filter(
    (r) => r.status === "open" && classifyFlow(db, me.id, r).allowed,
  );
  if (page === "apply") return <ApplicationForm key={id} roundId={id} />;
  if (page === "my-applications" && id) {
    const app = apps.find((a) => a.id === id);
    if (!app)
      return (
        <StatePage tone="danger">Không tìm thấy hồ sơ của bạn.</StatePage>
      );
    return <ApplicationForm key={id} applicationId={id} />;
  }
  if (page === "my-applications")
    return (
      <div className="space-y-5">
        <Panel title="Dòng thời gian chương trình">
          <ProgramTimeline db={db} userId={me.id} />
        </Panel>
        <DataList
          rows={apps}
          columns={[
            {
              key: "code",
              header: "Mã hồ sơ",
              cell: (a) => <CodeTag>{a.code}</CodeTag>,
            },
            {
              key: "round",
              header: "ĐXT",
              cell: (a) => db.rounds.find((r) => r.id === a.roundId)?.name,
            },
            { key: "flow", header: "Luồng", cell: (a) => a.flow },
            {
              key: "score",
              header: "Điểm tự khai / Chính thức",
              // Điểm chính thức chỉ hiện khi ĐXT đã công bố, như trang chi tiết hồ sơ.
              cell: (a) =>
                `${a.selfScore} / ${
                  db.rounds.find((r) => r.id === a.roundId)?.status === "published"
                    ? (a.officialScore ?? "Chưa có")
                    : "Chưa công bố"
                }`,
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
              onClick={() => navigate(`/app/my-applications/${a.id}`)}
            >
              Xem / Cập nhật
            </Button>
          )}
        />
      </div>
    );
  const rounds =
    page === "maintenance" ? maintenanceRounds(db, me.id) : relevant;
  return (
    <div className="space-y-4">
      {page === "dashboard" && (
        <Panel>
          <IdentityHeader
            name={me.fullName}
            meta={
              profile?.isKSTN
                ? `Sinh viên CN/KSTN${latestMemberships(db, me.id)
                    .filter((m) => m.status === "ACTIVE")
                    .map(
                      (m) =>
                        ` – Lớp ${db.classes.find((c) => c.id === m.classId)?.code} (năm ${m.studyYear})`,
                    )
                    .join("")}`
                : "Ứng viên (chưa thuộc lớp CN/KSTN)"
            }
          />
        </Panel>
      )}
      {apps
        .filter((a) => a.status === "needs_update" || a.status === "draft")
        .map((a) => (
          <Callout
            key={a.id}
            tone="warning"
            title={
              a.status === "draft"
                ? "Bạn còn bản nháp chưa nộp"
                : "Hồ sơ cần bổ sung"
            }
          >
            <Button
              variant="link"
              onClick={() => navigate(`/app/my-applications/${a.id}`)}
            >
              {a.code}
            </Button>
          </Callout>
        ))}
      {page === "dashboard" && !profile?.isKSTN && (
        <Panel title="Lớp phù hợp với bạn">
          {eligible.length ? (
            <ul className="divide-y divide-ink-200">
              {eligible.map((c) => {
                const program = db.programs.find((p) => p.id === c.programId),
                  major = db.majors.find((m) => m.id === program?.majorId),
                  lecturer = db.users.find((u) => u.id === c.lecturerId),
                  classRound = db.rounds
                    .filter((r) => r.classId === c.id && r.status !== "draft")
                    .sort((a, b) =>
                      String(b.intakeStart).localeCompare(String(a.intakeStart)),
                    )[0];
                return (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 text-body text-ink-700">
                      <p className="font-medium text-ink-900">
                        <CodeTag>{c.code}</CodeTag> · {major?.name} · {c.cohort}
                      </p>
                      <p className="text-body-sm text-ink-600">
                        GVPT: {lecturer?.fullName ?? "—"} ·{" "}
                        {classRound?.status === "open"
                          ? `Đang tiếp nhận đến ${formatIct(classRound.intakeEnd)}`
                          : classRound?.status === "upcoming"
                            ? `Mở tiếp nhận ${formatIct(classRound.intakeStart)}`
                            : "Chưa có đợt xét tuyển"}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              title="Chưa có lớp CN/KSTN cho ngành và khóa của bạn."
              description="Nếu ngành hoặc khóa của bạn chưa đúng, hãy liên hệ Chủ nhiệm ngành."
            />
          )}
        </Panel>
      )}
      <DataList
        rows={rounds}
        columns={[
          { key: "name", header: "Đợt phù hợp", cell: (r) => r.name },
          {
            key: "end",
            header: "Hạn tiếp nhận",
            cell: (r) => formatIct(r.intakeEnd),
          },
        ]}
        actions={(r) => {
          const existing = apps.find(
            (a) =>
              a.roundId === r.id &&
              ["draft", "pending", "needs_update", "approved", "rejected"].includes(a.status),
          );
          return (
            <Button
              size="sm"
              onClick={() =>
                navigate(existing ? `/app/my-applications/${existing.id}` : `/app/apply/${r.id}`)
              }
            >
              {existing?.status === "draft"
                ? "Tiếp tục bản nháp"
                : existing
                  ? "Xem hồ sơ"
                  : profile?.isKSTN
                    ? "Cập nhật hồ sơ tích lũy"
                    : "Nộp hồ sơ"}
            </Button>
          );
        }}
      />
    </div>
  );
}

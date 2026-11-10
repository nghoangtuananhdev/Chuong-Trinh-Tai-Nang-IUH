import { ScoreSummary } from "../../components/ui/ScoreSummary.jsx";
import { Countdown } from "../../components/ui/Countdown.jsx";
import { ProgramTimeline } from "../../components/domain-ui/ProgramTimeline.jsx";
import { useState, useEffect, useRef } from "react";
import { useBackend } from "../../mock/backend.jsx";
import { DataList, useAction } from "../shared/FeatureKit.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Field, Input, Checkbox } from "../../components/ui/Form.jsx";
import {
  Callout,
  CodeTag,
  DescriptionList,
  Timeline,
} from "../../components/ui/Display.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Stepper } from "../../components/ui/Stepper.jsx";
import { Drawer } from "../../components/ui/Drawer.jsx";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog.jsx";
import { CriterionField } from "../../components/domain-ui/CriterionField.jsx";
import { EvidenceViewer } from "../../components/domain-ui/EvidenceViewer.jsx";
import { classifyFlow } from "../../domain/flows.js";
import { scoreApplication } from "../../domain/scoring.js";
import {
  maintenanceRounds,
  studentProfile,
  latestMemberships,
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
          ["draft", "pending", "needs_update", "approved"].includes(a.status),
      );
  const round = db.rounds.find((r) => r.id === (roundId ?? existing?.roundId));
  const [data, setData] = useState(() =>
      existing ? structuredClone(existing) : null,
    ),
    [dirty, setDirty] = useState(false),
    [step, setStep] = useState(existing?.status === "needs_update" ? 1 : 0),
    [file, setFile] = useState(null),
    [confirm, setConfirm] = useState(null),
    [saved, setSaved] = useState("");
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
    return <Callout tone="danger">Không tìm thấy đợt xét tuyển.</Callout>;
  if (!data)
    return <Callout>{action.error?.message ?? "Đang tạo hồ sơ nháp…"}</Callout>;
  const persisted = db.applications.find((a) => a.id === data.id) ?? data;
  const request = db.reviewRequests
    .filter((r) => r.applicationId === data.id && !r.resolvedAt)
    .at(-1);
  const editable =
    (round.status === "open" &&
      ["draft", "pending"].includes(persisted.status)) ||
    (round.status === "review" && persisted.status === "needs_update");
  const score = scoreApplication(round.criteriaSnapshot, data.items);
  return (
    <div className="space-y-5">
      <h2 className="text-title-2">{round.name}</h2>
      <p>
        {FLOW_LABEL[data.flow]} · Hạn tiếp nhận: {formatIct(round.intakeEnd)}
      </p>
      <StatusBadge domain="application">{persisted.status}</StatusBadge>
      <Countdown now={db.clock.now} until={request?.dueAt ?? round.intakeEnd} />
      {round.status === "published" && (
        <Callout
          title={`Điểm chính thức: ${persisted.officialScore ?? "Chưa có"}`}
        >
          {persisted.decisionNote}
        </Callout>
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
      <Stepper
        steps={[
          { title: "Thông tin cá nhân" },
          { title: "Tiêu chí & minh chứng" },
          { title: "Kiểm tra & nộp" },
        ]}
        current={step}
        onStep={setStep}
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          {step === 0 && (
            <>
              <DescriptionList
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
            </>
          )}
          {step === 1 &&
            round.criteriaSnapshot.criteria.map((c) => (
              <CriterionField
                key={c.id}
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
            <>
              <Callout title={`Điểm tự khai: ${score.total}`}>
                Điểm chính thức do giảng viên xác minh có thể khác.{" "}
                {score.eligible
                  ? "Đạt các tiêu chí BB theo tự khai."
                  : "Còn tiêu chí BB chưa đạt."}
              </Callout>
              <Checkbox
                disabled={!editable}
                checked={data.committed}
                onChange={(e) => change({ committed: e.target.checked })}
              >
                Tôi cam kết thông tin và minh chứng là trung thực.
              </Checkbox>
            </>
          )}
          <div className="flex flex-wrap gap-2">
            {step > 0 && (
              <Button variant="secondary" onClick={() => setStep(step - 1)}>
                Quay lại
              </Button>
            )}
            {step < 2 && (
              <Button onClick={() => setStep(step + 1)}>Tiếp tục</Button>
            )}
            {editable && persisted.status !== "needs_update" && (
              <Button
                variant="secondary"
                disabled={action.busy}
                onClick={async () => {
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
                }}
              >
                {persisted.status === "draft" ? "Lưu nháp" : "Lưu chỉnh sửa"}
              </Button>
            )}
            {step === 2 && editable && (
              <Button
                loading={action.busy}
                disabled={!data.committed}
                onClick={async () => {
                  const method =
                    persisted.status === "needs_update"
                      ? "applications.resubmit"
                      : persisted.status === "draft"
                        ? "applications.submit"
                        : "applications.update";
                  const r = await action.run(method, {
                    id: data.id,
                    items: data.items,
                    phone: data.phone,
                    homeClass: data.homeClass,
                    committed: data.committed,
                  });
                  if (r.ok) {
                    setDirty(false);
                    leave(`/app/my-applications/${data.id}`);
                  }
                }}
              >
                {persisted.status === "needs_update"
                  ? "Gửi bổ sung"
                  : "Nộp hồ sơ chính thức"}
              </Button>
            )}
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
          </div>
          <p aria-live="polite" className="text-body-sm text-ink-600">
            {dirty ? "Có thay đổi chưa lưu" : saved}
          </p>
        </div>
        <aside className="h-fit xl:sticky xl:top-4">
          <ScoreSummary score={score} />
        </aside>
      </div>
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
        description="Bạn còn thay đổi chưa được lưu. Chọn Hủy để quay lại lưu hồ sơ."
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
  const relevant = db.rounds.filter(
    (r) => r.status === "open" && classifyFlow(db, me.id, r).allowed,
  );
  if (page === "apply") return <ApplicationForm key={id} roundId={id} />;
  if (page === "my-applications" && id) {
    const app = apps.find((a) => a.id === id);
    if (!app)
      return <Callout tone="danger">Không tìm thấy hồ sơ của bạn.</Callout>;
    return (
      <div className="space-y-5">
        <ApplicationForm key={id} applicationId={id} />
        <h2 className="text-title-3">Lịch sử xử lý</h2>
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
  if (page === "my-applications")
    return (
      <div className="space-y-5">
        <h2 className="text-title-3">Dòng thời gian chương trình</h2>
        <ProgramTimeline db={db} userId={me.id} />
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
        <Callout title={me.fullName}>
          {profile?.isKSTN
            ? `Sinh viên CN/KSTN${latestMemberships(db, me.id)
                .filter((m) => m.status === "ACTIVE")
                .map(
                  (m) =>
                    ` – Lớp ${db.classes.find((c) => c.id === m.classId)?.code} (năm ${m.studyYear})`,
                )
                .join("")}`
            : "Ứng viên (chưa thuộc lớp CN/KSTN)"}
        </Callout>
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
      <p className="text-body-sm text-ink-600">
        Bạn có thể nộp nhiều ĐXT, nhưng chỉ được trúng tuyển vào một lớp
        CN/KSTN.
      </p>
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
        actions={(r) => (
          <Button
            size="sm"
            onClick={() => {
              const existing = apps.find(
                (a) =>
                  a.roundId === r.id &&
                  ["draft", "pending", "needs_update", "approved"].includes(
                    a.status,
                  ),
              );
              navigate(
                existing
                  ? `/app/my-applications/${existing.id}`
                  : `/app/apply/${r.id}`,
              );
            }}
          >
            {profile?.isKSTN ? "Cập nhật hồ sơ tích lũy" : "Nộp hồ sơ"}
          </Button>
        )}
      />
    </div>
  );
}

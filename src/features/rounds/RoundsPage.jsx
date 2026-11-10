import { EvidenceUploader } from "../../components/domain-ui/EvidenceUploader.jsx";
import { EvidenceViewer } from "../../components/domain-ui/EvidenceViewer.jsx";
import { Drawer } from "../../components/ui/Drawer.jsx";
import { ManagementPage } from "../catalog/ManagementPage.jsx";
import { RoundMilestones } from "../../components/domain-ui/RoundMilestones.jsx";
import { useState } from "react";
import { useBackend } from "../../mock/backend.jsx";
import {
  DataList,
  FormDialog,
  useAction,
  choices,
} from "../shared/FeatureKit.jsx";
import { Button } from "../../components/ui/Button.jsx";
import {
  CodeTag,
  Callout,
  DescriptionList,
} from "../../components/ui/Display.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog.jsx";
import { Field, Textarea, Select } from "../../components/ui/Form.jsx";
import { CriteriaTable } from "../../components/domain-ui/CriteriaTable.jsx";
import { resolveScopeChain } from "../../domain/scope.js";
import { roundView } from "../../domain/selectors.js";
import { editableFields } from "../../domain/round-machine.js";
import { formatIct, toIct } from "../../domain/time.js";
import {
  ROUND_STATUSES,
  RANKING_MODE,
  SEMESTERS,
} from "../../domain/constants.js";
import { FilterTabs } from "../../components/ui/FilterTabs.jsx";
import { navigate } from "../../app/router.js";
export function RoundsPage({ id, publicView = false }) {
  const { db, can, activeRole, me } = useBackend(),
    action = useAction();
  const [view, setView] = useState("rounds"),
    [file, setFile] = useState(null),
    [edit, setEdit] = useState(false),
    [form, setForm] = useState({}),
    [confirm, setConfirm] = useState(null),
    [reason, setReason] = useState(""),
    [status, setStatus] = useState(""),
    [year, setYear] = useState(""),
    [semester, setSemester] = useState("");
  const rows = db.rounds
    .filter((r) =>
      publicView
        ? r.status !== "draft"
        : can("round.view", { type: "round", entity: r }),
    )
    .map((r) => roundView(db, r));
  const round = rows.find((r) => r.id === id);
  const dates = [
    "intakeStart",
    "intakeEnd",
    "reviewStart",
    "reviewEnd",
    "approvalDue",
  ];
  const fields = [
    {
      key: "classId",
      label: "Lớp CN/KSTN",
      type: "select",
      options: choices(
        db.classes.filter((c) =>
          can("round.manage", { type: "class", entity: c }),
        ),
        "code",
      ),
      required: true,
    },
    { key: "name", label: "Tên ĐXT", required: true },
    {
      key: "semester",
      label: "Học kỳ",
      type: "select",
      options: SEMESTERS.map((value) => ({ value, label: value })),
      required: true,
    },
    {
      key: "academicYear",
      label: "Năm học",
      type: "select",
      options: ["2025–2026", "2026–2027", "2027–2028"].map((value) => ({
        value,
        label: value,
      })),
      required: true,
    },
    { key: "quota", label: "Sĩ số tối đa", type: "number", required: true },
    {
      key: "criteriaSetId",
      label: "Bộ tiêu chí đã ban hành cùng khoa",
      type: "select",
      options: choices(
        db.criteriaSets.filter(
          (s) =>
            s.status === "PUBLISHED" &&
            (!form.classId ||
              s.facultyId ===
                resolveScopeChain(db, "class", form.classId)?.facultyId) &&
            can("criteria.view", { type: "criteriaSet", entity: s }),
        ),
      ),
      required: true,
    },
    {
      key: "lecturerId",
      label: "GVPT",
      type: "select",
      options: choices(
        db.users.filter((u) =>
          db.lecturerProfiles.some(
            (l) =>
              l.userId === u.id &&
              (!form.classId ||
                l.facultyId ===
                  resolveScopeChain(db, "class", form.classId)?.facultyId),
          ),
        ),
        "fullName",
      ),
      required: true,
    },
    {
      key: "rankingMode",
      label: "Chế độ xếp hạng",
      type: "select",
      options: Object.entries(RANKING_MODE).map(([value, label]) => ({
        value,
        label,
      })),
    },
    ...dates.map((key) => ({
      key,
      label: {
        intakeStart: "Bắt đầu tiếp nhận",
        intakeEnd: "Kết thúc tiếp nhận",
        reviewStart: "Bắt đầu xét duyệt",
        reviewEnd: "Kết thúc xét duyệt",
        approvalDue: "Hạn phê duyệt dự kiến",
      }[key],
      type: "datetime-local",
      required: key !== "approvalDue",
    })),
    { key: "description", label: "Mô tả tuyển sinh", type: "textarea" },
  ];
  const showForm = (r) => {
    action.setError(null);
    const values = r
      ? Object.fromEntries(
          fields.map((f) => [
            f.key,
            dates.includes(f.key)
              ? r[f.key]
                ? toIct(r[f.key]).slice(0, 16)
                : ""
              : (r[f.key] ?? ""),
          ]),
        )
      : {
          semester: SEMESTERS[0],
          academicYear: "2026–2027",
          rankingMode: "MAINTAIN_THEN_FILL",
          quota: 20,
        };
    setForm(values);
    setEdit(true);
  };
  const dialog = (
    <>
      <FormDialog
        open={edit}
        onClose={() => setEdit(false)}
        title={id ? "Sửa đợt xét tuyển" : "Tạo đợt xét tuyển"}
        fields={fields
          .filter(
            (f) =>
              !id ||
              editableFields(round?.status, activeRole?.role).includes(f.key),
          )
          .filter((f) => !(round?.isFirstRound && f.key === "rankingMode"))}
        values={form}
        onChange={setForm}
        busy={action.busy}
        error={action.error}
        onSubmit={async () => {
          const values = { ...form };
          dates.forEach((k) => {
            if (k in values)
              values[k] = values[k] ? `${values[k]}:00+07:00` : null;
          });
          values.quota = Number(values.quota);
          const permitted = Object.fromEntries(
            Object.entries(values).filter(
              ([k]) =>
                !id ||
                editableFields(round.status, activeRole.role).includes(k),
            ),
          );
          const r = await action.run(
            id ? "rounds.update" : "rounds.create",
            id ? { id, changes: permitted } : permitted,
          );
          if (r.ok) {
            setEdit(false);
            navigate(`/app/rounds/${r.result.id}`);
          }
        }}
      >
        {(!id ||
          editableFields(round?.status, activeRole?.role).includes(
            "attachments",
          )) && (
          <EvidenceUploader
            files={form.attachments ?? []}
            onChange={(files) => setForm({ ...form, attachments: files })}
            onView={setFile}
          />
        )}
      </FormDialog>
      <Drawer
        open={Boolean(file)}
        onClose={() => setFile(null)}
        title={file?.name}
        size="xl"
      >
        <EvidenceViewer file={file} />
      </Drawer>
      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title}
        description="Thao tác sẽ được ghi nhật ký."
        confirmLabel="Xác nhận"
        loading={action.busy}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          const r = await action.run(confirm.name, {
            id,
            ...confirm.payload,
            reason,
          });
          if (r.ok) {
            setConfirm(null);
            if (confirm.name === "rounds.delete") navigate("/app/rounds");
          }
        }}
      >
        {confirm?.name === "rounds.transition" && (
          <Field label="Lý do bắt buộc">
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>
        )}
      </ConfirmDialog>
    </>
  );
  if (!id && activeRole?.role === "TRAINING" && view === "classes")
    return (
      <div className="space-y-4">
        <Button variant="secondary" onClick={() => setView("rounds")}>
          Tra cứu ĐXT
        </Button>
        <ManagementPage page="classes" />
      </div>
    );
  if (!id)
    return (
      <div className="space-y-4">
        {activeRole?.role === "TRAINING" && (
          <Button variant="secondary" onClick={() => setView("classes")}>
            Tra cứu lớp
          </Button>
        )}
        <FilterTabs
          label="Trạng thái ĐXT"
          value={status}
          onChange={setStatus}
          options={[
            { value: "", label: "Tất cả" },
            ...Object.entries(ROUND_STATUSES).map(([value, m]) => ({
              value,
              label: m.label,
            })),
          ]}
        />
        <div className="flex flex-wrap gap-3">
          <Field label="Năm học">
            <Select value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">Tất cả</option>
              {[...new Set(rows.map((r) => r.academicYear))].map((y) => (
                <option key={y}>{y}</option>
              ))}
            </Select>
          </Field>
          <Field label="Học kỳ">
            <Select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            >
              <option value="">Tất cả</option>
              {SEMESTERS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          {can("round.manage") && (
            <Button onClick={() => showForm()}>Tạo đợt xét tuyển</Button>
          )}
        </div>
        <DataList
          rows={rows.filter(
            (r) =>
              (!status || r.status === status) &&
              (!year || r.academicYear === year) &&
              (!semester || r.semester === semester),
          )}
          columns={[
            {
              key: "code",
              header: "Mã đợt",
              cell: (r) => <CodeTag>{r.code}</CodeTag>,
            },
            { key: "name", header: "Tên / Lớp", cell: (r) => r.name },
            {
              key: "year",
              header: "Năm học / HK / Năm ĐT",
              cell: (r) =>
                `${r.academicYear} · ${r.semester} · năm ${r.studyYear}`,
            },
            {
              key: "time",
              header: "Tiếp nhận",
              cell: (r) =>
                `${r.intakeStart ? formatIct(r.intakeStart) : "Chưa đặt"} – ${r.intakeEnd ? formatIct(r.intakeEnd) : "Chưa đặt"}`,
            },
            { key: "quota", header: "Chỉ tiêu", cell: (r) => r.quota },
            {
              key: "status",
              header: "Trạng thái",
              cell: (r) => <StatusBadge domain="round">{r.status}</StatusBadge>,
            },
          ]}
          actions={(r) => (
            <Button
              size="sm"
              variant="link"
              onClick={() => navigate(`/app/rounds/${r.id}`)}
            >
              Xem chi tiết
            </Button>
          )}
        />
        {dialog}
      </div>
    );
  if (!round)
    return (
      <Callout tone="danger">
        Không tìm thấy ĐXT hoặc không có quyền truy cập.
      </Callout>
    );
  return (
    <div className="space-y-5">
      <h2 className="text-title-2">{round.name}</h2>
      <CodeTag>{round.code}</CodeTag>
      <StatusBadge domain="round">{round.status}</StatusBadge>
      <DescriptionList
        items={[
          { label: "Lớp", value: round.class.code },
          { label: "Phân loại", value: round.typeLabel },
          {
            label: "Năm học",
            value: `${round.academicYear} · ${round.semester}`,
          },
          { label: "Sĩ số tối đa", value: round.quota },
          {
            label: "Chế độ",
            value: round.isFirstRound
              ? "Xếp hạng chung"
              : RANKING_MODE[round.rankingMode],
          },
        ]}
      />
      <RoundMilestones round={round} now={db.clock.now} />
      <p>{round.description}</p>
      {(round.attachments ?? []).map((f, i) => (
        <Button key={i} variant="link" onClick={() => setFile(f)}>
          {f.name}
        </Button>
      ))}
      {round.criteriaSnapshot && (
        <Callout>
          Snapshot bộ tiêu chí v{round.criteriaSnapshot.version} lúc{" "}
          {formatIct(round.openedAt)}
        </Callout>
      )}
      <CriteriaTable
        snapshot={
          round.criteriaSnapshot ??
          db.criteriaSets.find((s) => s.id === round.criteriaSetId)
        }
      />
      <div className="flex flex-wrap gap-2">
        {publicView && (
          <>
            <Button variant="secondary" onClick={() => navigate("/")}>
              Về trang chủ
            </Button>
            {round.status === "open" && (
              <Button
                onClick={() =>
                  navigate(
                    me
                      ? `/app/apply/${id}`
                      : `/dang-nhap?returnTo=${encodeURIComponent(`/app/apply/${id}`)}`,
                  )
                }
              >
                Nộp hồ sơ
              </Button>
            )}
            {round.status === "published" && (
              <Button onClick={() => navigate(`/ket-qua/${id}`)}>
                Xem kết quả
              </Button>
            )}
          </>
        )}
        {!publicView &&
          can("round.editTimeline", { type: "round", id }) &&
          editableFields(round.status, activeRole.role).length > 0 && (
            <Button onClick={() => showForm(round)}>Sửa</Button>
          )}
        {!publicView &&
          can("round.manage", { type: "round", id }) &&
          round.status === "draft" && (
            <Button
              onClick={() =>
                setConfirm({ name: "rounds.release", title: "Phát hành ĐXT?" })
              }
            >
              Phát hành
            </Button>
          )}
        {!publicView &&
          can("round.transitionManual", { type: "round", id }) &&
          ["upcoming", "open"].includes(round.status) && (
            <Button
              variant="secondary"
              onClick={() =>
                setConfirm({
                  name: "rounds.transition",
                  title:
                    round.status === "upcoming"
                      ? "Mở tiếp nhận sớm?"
                      : "Đóng tiếp nhận sớm?",
                  payload: {
                    to: round.status === "upcoming" ? "open" : "review",
                  },
                })
              }
            >
              {round.status === "upcoming"
                ? "Mở tiếp nhận sớm"
                : "Đóng tiếp nhận sớm"}
            </Button>
          )}
        {!publicView &&
          can("round.manage", { type: "round", id }) &&
          ["draft", "upcoming"].includes(round.status) && (
            <Button
              variant="dangerOutline"
              onClick={() =>
                setConfirm({ name: "rounds.delete", title: "Xóa ĐXT?" })
              }
            >
              Xóa
            </Button>
          )}
        {!publicView && can("application.review", { type: "round", id }) && (
          <Button
            variant="secondary"
            onClick={() => navigate(`/app/reviews?round=${id}`)}
          >
            Duyệt hồ sơ
          </Button>
        )}
        {!publicView && (
          <Button
            variant="secondary"
            onClick={() => navigate(`/app/approvals/${id}`)}
          >
            Danh sách phê duyệt
          </Button>
        )}
      </div>
      {dialog}
    </div>
  );
}

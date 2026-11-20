import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { useBackend } from "../../mock/backend.jsx";
import { useAction, DataList } from "../shared/FeatureKit.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Field, Input, Select, Textarea } from "../../components/ui/Form.jsx";
import { Callout, CodeTag } from "../../components/ui/Display.jsx";
import { Panel } from "../../components/ui/Panel.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog.jsx";
import { FileDropzone } from "../../components/ui/FileDropzone.jsx";
import { StatePage } from "../../components/ui/StatePage.jsx";
import {
  IMPORT_TEMPLATE_CSV,
  normalizeCohort,
  normalizeStudentRow,
  parseStudentTable,
  planStudentImport,
} from "../../domain/student-import.js";

const HEADER_NAME = { studentCode: "MSSV", fullName: "Họ tên" };
const ACTION_LABEL = { CREATE: "Thêm mới", UPDATE: "Cập nhật", ERROR: "Lỗi" };
const NEW_COHORT = "__new";

function downloadTemplate() {
  const url = URL.createObjectURL(
    new Blob(["﻿" + IMPORT_TEMPLATE_CSV], {
      type: "text/csv;charset=utf-8;",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "mau-danh-sach-sinh-vien.csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function StudentImportPage() {
  const { db, activeRole } = useBackend(),
    action = useAction();
  const majorId = activeRole?.scopeId;
  const [cohortFilter, setCohortFilter] = useState(""),
    [open, setOpen] = useState(false),
    [step, setStep] = useState(1),
    [cohortChoice, setCohortChoice] = useState(""),
    [newCohort, setNewCohort] = useState(""),
    [text, setText] = useState(""),
    [fileName, setFileName] = useState(""),
    [problem, setProblem] = useState(""),
    [report, setReport] = useState(null),
    [removing, setRemoving] = useState(null);
  const registered = useMemo(
    () => new Set(db.studentProfiles.map((p) => p.studentCode)),
    [db.studentProfiles],
  );
  const rows = useMemo(() => {
    const seen = new Set();
    return db.schoolDirectory.filter((s) => {
      if (s.majorId !== majorId || seen.has(s.studentCode)) return false;
      seen.add(s.studentCode);
      return true;
    });
  }, [db.schoolDirectory, majorId]);
  const cohorts = useMemo(() => {
    const set = new Set(rows.map((r) => r.cohort).filter(Boolean));
    for (const c of db.classes)
      if (db.programs.find((p) => p.id === c.programId)?.majorId === majorId)
        set.add(c.cohort);
    return [...set].sort();
  }, [rows, db.classes, db.programs, majorId]);
  const cohort = normalizeCohort(
    cohortChoice === NEW_COHORT ? newCohort : cohortChoice,
  );
  const parsed = useMemo(() => parseStudentTable(text), [text]);
  const plan = useMemo(
    () =>
      planStudentImport(
        db,
        majorId,
        parsed.rows.map((r) =>
          normalizeStudentRow(r, { defaultCohort: cohort }),
        ),
      ),
    [db, majorId, parsed, cohort],
  );
  const count = (a) => plan.filter((p) => p.action === a).length;
  if (!majorId)
    return (
      <StatePage tone="danger" title="Không có quyền truy cập">
        Chỉ Chủ nhiệm ngành được nhập danh sách sinh viên.
      </StatePage>
    );
  const reset = () => {
    setOpen(false);
    setStep(1);
    setText("");
    setFileName("");
    setProblem("");
    setReport(null);
    setCohortChoice("");
    setNewCohort("");
  };
  const toPreview = () => {
    if (!cohort) return setProblem("Vui lòng chọn khóa hợp lệ (ví dụ K22).");
    if (!text.trim()) return setProblem("Vui lòng chọn tệp hoặc dán dữ liệu.");
    if (parsed.missing.length)
      return setProblem(
        `Thiếu cột bắt buộc: ${parsed.missing.map((k) => HEADER_NAME[k]).join(", ")}.`,
      );
    if (!parsed.rows.length) return setProblem("Không có dòng dữ liệu nào.");
    setProblem("");
    setStep(2);
  };
  const submit = async () => {
    const r = await action.run(
      "directory.import",
      { majorId, cohort, rows: parsed.rows },
      "",
    );
    if (r.ok) {
      setReport(r.result);
      setStep(3);
    }
  };
  const visible = rows.filter((r) => !cohortFilter || r.cohort === cohortFilter);
  return (
    <div className="space-y-4">
      <p className="text-body text-ink-700">
        Chỉ sinh viên có trong danh sách này mới đăng ký được tài khoản và nộp
        hồ sơ. Hệ thống không kết nối dữ liệu gốc của trường.
      </p>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Field label="Khóa" className="sm:w-48">
          <Select
            value={cohortFilter}
            onChange={(e) => setCohortFilter(e.target.value)}
          >
            <option value="">Tất cả</option>
            {cohorts.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Button onClick={() => setOpen(true)}>Nhập danh sách</Button>
      </div>
      <DataList
        caption="Danh sách sinh viên"
        rows={visible}
        columns={[
          {
            key: "code",
            header: "MSSV",
            cell: (r) => <CodeTag>{r.studentCode}</CodeTag>,
          },
          { key: "name", header: "Họ tên", cell: (r) => r.fullName },
          { key: "cohort", header: "Khóa", cell: (r) => r.cohort ?? "—" },
          {
            key: "home",
            header: "Lớp sinh hoạt",
            hideBelow: "md",
            cell: (r) => r.homeClass || "—",
          },
          { key: "email", header: "Email", hideBelow: "lg", cell: (r) => r.email },
          {
            key: "account",
            header: "Tài khoản",
            cell: (r) =>
              registered.has(r.studentCode) ? "Đã đăng ký" : "Chưa đăng ký",
          },
        ]}
        actions={(r) =>
          !registered.has(r.studentCode) && (
            <Button
              size="sm"
              variant="dangerOutline"
              onClick={() => setRemoving(r)}
            >
              Xóa
            </Button>
          )
        }
      />
      <Modal
        open={open}
        onClose={reset}
        closeOnBackdrop={false}
        size="xl"
        title="Nhập danh sách sinh viên"
        footer={
          step === 1 ? (
            <>
              <Button variant="secondary" onClick={reset}>
                Hủy
              </Button>
              <Button onClick={toPreview}>Xem trước</Button>
            </>
          ) : step === 2 ? (
            <>
              <Button variant="secondary" onClick={() => setStep(1)}>
                Quay lại
              </Button>
              <Button
                loading={action.busy}
                disabled={count("CREATE") + count("UPDATE") === 0}
                onClick={submit}
              >
                Nhập {count("CREATE") + count("UPDATE")} dòng hợp lệ
              </Button>
            </>
          ) : (
            <Button onClick={reset}>Đóng</Button>
          )
        }
      >
        {step === 1 && (
          <div className="space-y-4">
            <Field label="Khóa" required>
              <Select
                value={cohortChoice}
                onChange={(e) => setCohortChoice(e.target.value)}
              >
                <option value="">Chọn khóa</option>
                {cohorts.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value={NEW_COHORT}>Khóa mới…</option>
              </Select>
            </Field>
            {cohortChoice === NEW_COHORT && (
              <Field label="Tên khóa mới" hint="Ví dụ: K23">
                <Input
                  value={newCohort}
                  onChange={(e) => setNewCohort(e.target.value)}
                />
              </Field>
            )}
            <FileDropzone
              accept=".csv,text/csv"
              buttonLabel="Chọn tệp CSV"
              onFiles={async ([file]) => {
                setFileName(file.name);
                setText(await file.text());
              }}
            />
            {fileName && (
              <p className="text-body-sm text-ink-600">Tệp: {fileName}</p>
            )}
            <Field label="Hoặc dán trực tiếp từ Excel">
              <Textarea
                rows={6}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </Field>
            <p className="text-body-sm text-ink-600">
              Cột nhận diện: MSSV, Họ tên, Ngày sinh, Email, Lớp sinh hoạt, Khóa
              (tùy chọn). Tệp Excel: chọn Lưu thành → CSV UTF-8, hoặc sao chép
              vùng dữ liệu và dán vào ô trên.{" "}
              <Button
                size="sm"
                variant="link"
                icon={Download}
                onClick={downloadTemplate}
              >
                Tải tệp mẫu
              </Button>
            </p>
            {problem && (
              <Callout tone="danger" role="alert">
                {problem}
              </Callout>
            )}
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-body text-ink-700">
              Thêm mới {count("CREATE")} · Cập nhật {count("UPDATE")} · Lỗi{" "}
              {count("ERROR")}. Dòng lỗi không chặn việc nhập các dòng hợp lệ.
            </p>
            <DataList
              caption="Xem trước"
              search={false}
              rows={plan.map((p) => ({ ...p, id: p.line }))}
              columns={[
                { key: "line", header: "Dòng", cell: (p) => p.line },
                {
                  key: "code",
                  header: "MSSV",
                  cell: (p) => p.row.studentCode || "—",
                },
                { key: "name", header: "Họ tên", cell: (p) => p.row.fullName },
                {
                  key: "action",
                  header: "Kết quả",
                  cell: (p) => ACTION_LABEL[p.action],
                },
                { key: "reason", header: "Lý do", cell: (p) => p.reason ?? "" },
              ]}
            />
          </div>
        )}
        {step === 3 && report && (
          <div className="space-y-3">
            <p className="text-body text-ink-700">
              Đã thêm mới {report.created} · cập nhật {report.updated} · bỏ qua{" "}
              {report.skipped} dòng lỗi.
            </p>
            {report.errors.length > 0 && (
              <ul className="list-disc space-y-1 pl-5 text-body-sm text-ink-700">
                {report.errors.map((e) => (
                  <li key={e.line}>
                    Dòng {e.line}
                    {e.studentCode ? ` (${e.studentCode})` : ""}: {e.reason}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Modal>
      <ConfirmDialog
        open={Boolean(removing)}
        title="Xóa khỏi danh sách?"
        description={
          removing &&
          `${removing.fullName} (${removing.studentCode}) sẽ không còn đăng ký được tài khoản.`
        }
        confirmLabel="Xóa"
        loading={action.busy}
        onCancel={() => setRemoving(null)}
        onConfirm={async () => {
          const r = await action.run(
            "directory.remove",
            { majorId, studentCode: removing.studentCode },
            "Đã xóa khỏi danh sách.",
          );
          if (r.ok) setRemoving(null);
        }}
      />
    </div>
  );
}

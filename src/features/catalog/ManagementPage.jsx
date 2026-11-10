import { useState } from "react";
import { useBackend } from "../../mock/backend.jsx";
import {
  DataList,
  FormDialog,
  useAction,
  choices,
} from "../shared/FeatureKit.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { CodeTag, Callout } from "../../components/ui/Display.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { Drawer } from "../../components/ui/Drawer.jsx";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog.jsx";
import { Field, Textarea, Select } from "../../components/ui/Form.jsx";
import { ROLE_LABEL, ROLE_SCOPE } from "../../domain/constants.js";
import { ASSIGNABLE_ROLES } from "../../domain/permissions.js";
import {
  classView,
  latestMemberships,
  scopeLabel,
} from "../../domain/selectors.js";
import { formatIct } from "../../domain/time.js";
import { resolveScopeChain } from "../../domain/scope.js";
import { isRoleEffective } from "../../domain/permissions.js";
import { navigate } from "../../app/router.js";
export function ManagementPage({ page, id }) {
  const { db, can, activeRole } = useBackend(),
    action = useAction();
  const [tab, setTab] = useState("faculty"),
    [edit, setEdit] = useState(null),
    [form, setForm] = useState({}),
    [confirmation, setConfirmation] = useState(null),
    [reason, setReason] = useState(""),
    [temporary, setTemporary] = useState(""),
    [detail, setDetail] = useState(null),
    [memberYear, setMemberYear] = useState("");
  const visible = (rows, perm, type) =>
    rows.filter((r) => can(perm, { type, entity: r }));
  const open = (name, fields, values = {}, title = "Cập nhật thông tin") => {
    action.setError(null);
    setEdit({ name, fields, title });
    setForm(
      page === "programs" && values.majorId
        ? {
            ...values,
            facultyId: db.majors.find((m) => m.id === values.majorId)
              ?.facultyId,
          }
        : values,
    );
  };
  const scope =
    resolveScopeChain(db, "class", activeRole.scopeId) ??
    resolveScopeChain(db, "major", activeRole.scopeId) ??
    {};
  let rows = [],
    columns = [],
    fields = [],
    base = "",
    permission = "",
    type = "",
    newLabel = "Thêm mới";
  const programs = visible(db.programs, "program.view", "program"),
    classes = visible(db.classes, "class.view", "class");
  if (page === "catalog") {
    type = tab;
    base = `catalog.${tab}`;
    permission = "catalog.manage";
    rows = tab === "faculty" ? db.faculties : db.majors;
    columns =
      tab === "faculty"
        ? [
            {
              key: "code",
              header: "Mã khoa",
              cell: (r) => <CodeTag>{r.code}</CodeTag>,
            },
            { key: "name", header: "Tên khoa", cell: (r) => r.name },
            {
              key: "count",
              header: "Số ngành",
              cell: (r) => db.majors.filter((m) => m.facultyId === r.id).length,
            },
          ]
        : [
            {
              key: "faculty",
              header: "Khoa",
              cell: (r) => db.faculties.find((f) => f.id === r.facultyId)?.name,
            },
            {
              key: "code",
              header: "Mã ngành",
              cell: (r) => <CodeTag>{r.code}</CodeTag>,
            },
            { key: "name", header: "Ngành", cell: (r) => r.name },
          ];
    fields = [
      ...(tab === "major"
        ? [
            {
              key: "facultyId",
              label: "Khoa",
              type: "select",
              options: choices(db.faculties),
              required: true,
            },
          ]
        : []),
      { key: "code", label: "Mã", required: true },
      { key: "name", label: "Tên", required: true },
    ];
  }
  if (page === "programs") {
    type = "program";
    base = "programs";
    permission = "program.manage";
    rows = programs;
    columns = [
      {
        key: "faculty",
        header: "Khoa",
        cell: (r) =>
          db.faculties.find(
            (f) =>
              f.id === db.majors.find((m) => m.id === r.majorId)?.facultyId,
          )?.name,
      },
      { key: "name", header: "Chuyên ngành", cell: (r) => r.name },
      {
        key: "count",
        header: "Số lượng lớp",
        cell: (r) => db.classes.filter((c) => c.programId === r.id).length,
      },
    ];
    fields = [
      {
        key: "facultyId",
        label: "Khoa",
        type: "select",
        options: choices(
          db.faculties.filter((f) =>
            can("program.manage", { type: "faculty", entity: f }),
          ),
        ),
        required: true,
      },
      {
        key: "majorId",
        label: "Ngành (thuộc Khoa)",
        type: "select",
        options: choices(
          db.majors.filter(
            (m) =>
              can("program.manage", { type: "major", entity: m }) &&
              (!form.facultyId || m.facultyId === form.facultyId),
          ),
        ).map((o) => ({
          ...o,
          label: `${db.faculties.find((f) => f.id === db.majors.find((m) => m.id === o.value)?.facultyId)?.name} · ${o.label}`,
        })),
        required: true,
      },
      {
        key: "type",
        label: "Loại",
        type: "select",
        options: [
          { value: "KSTN", label: "KSTN" },
          { value: "CNTN", label: "CNTN" },
        ],
        required: true,
      },
      { key: "name", label: "Tên chuyên ngành", required: true },
    ];
    newLabel = "Thêm chuyên ngành mới";
  }
  if (page === "classes") {
    type = "class";
    base = "classes";
    permission = "class.manage";
    rows = classes.map((c) => classView(db, c));
    columns = [
      {
        key: "code",
        header: "Mã lớp",
        cell: (r) => <CodeTag>{r.code}</CodeTag>,
      },
      { key: "program", header: "Chuyên ngành", cell: (r) => r.program?.name },
      {
        key: "cohort",
        header: "Khóa / Năm bắt đầu",
        cell: (r) => `${r.cohort} / ${r.startYear}`,
      },
      {
        key: "lecturer",
        header: "GVPT",
        cell: (r) => db.users.find((u) => u.id === r.lecturerId)?.fullName,
      },
      { key: "size", header: "Sĩ số ACTIVE", cell: (r) => r.size },
      {
        key: "status",
        header: "Trạng thái",
        cell: (r) => <StatusBadge domain="class">{r.status}</StatusBadge>,
      },
    ];
    fields = [
      {
        key: "programId",
        label: "Chuyên ngành",
        type: "select",
        options: choices(
          db.programs.filter((p) =>
            can("class.manage", { type: "program", entity: p }),
          ),
        ),
        required: true,
      },
      { key: "cohort", label: "Khóa (VD K23)", required: true },
      {
        key: "startYear",
        label: "Năm bắt đầu",
        type: "number",
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
                (!form.programId ||
                  l.facultyId ===
                    resolveScopeChain(db, "program", form.programId)
                      ?.facultyId),
            ),
          ),
          "fullName",
        ),
        required: true,
      },
      { key: "description", label: "Mô tả", type: "textarea" },
    ];
  }
  const userPage = ["lecturers", "students", "student-passwords"].includes(
    page,
  );
  if (userPage) {
    type = "user";
    const student = page !== "lecturers";
    rows = visible(
      db.users.filter(
        (u) =>
          u.kind === (student ? "STUDENT" : "STAFF") &&
          (student || db.lecturerProfiles.some((l) => l.userId === u.id)),
      ),
      student ? "student.view" : "lecturer.view",
      "user",
    );
    permission = student ? "student.manage" : "lecturer.manage";
    base = "lecturers";
    columns = [
      {
        key: "username",
        header: student ? "MSSV" : "Mã GV",
        cell: (r) => <CodeTag>{r.username}</CodeTag>,
      },
      { key: "name", header: "Họ tên", cell: (r) => r.fullName },
      {
        key: "email",
        header: "Email",
        cell: (r) => <span className="break-all">{r.email}</span>,
      },
      {
        key: "state",
        header: student ? "Chương trình" : "Vai trò",
        cell: (r) =>
          student
            ? db.studentProfiles.find((p) => p.userId === r.id)?.isKSTN
              ? "SV CN/KSTN"
              : "Ứng viên"
            : db.userRoles
                .filter(
                  (a) => a.userId === r.id && isRoleEffective(a, db.clock.now),
                )
                .map((a) => ROLE_LABEL[a.role])
                .join(" · "),
      },
      {
        key: "status",
        header: "Trạng thái TK",
        cell: (r) => <StatusBadge domain="account">{r.status}</StatusBadge>,
      },
    ];
    fields = [
      { key: "lecturerCode", label: "Mã GV", required: true },
      { key: "fullName", label: "Họ tên", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      {
        key: "classId",
        label: "Lớp phụ trách (xác định Khoa)",
        type: "select",
        options: choices(classes, "code"),
        required: true,
      },
    ];
  }
  if (
    page === "permissions" ||
    (page === "lecturers" && tab === "permissions")
  ) {
    return (
      <div className="space-y-4">
        {page === "lecturers" && (
          <Button variant="secondary" onClick={() => setTab("faculty")}>
            Quay lại tài khoản
          </Button>
        )}
        <Button
          onClick={() =>
            open(
              "roles.assign",
              [
                {
                  key: "userId",
                  label: "Giảng viên",
                  type: "select",
                  options: choices(
                    visible(
                      db.users.filter((u) =>
                        db.lecturerProfiles.some((l) => l.userId === u.id),
                      ),
                      "lecturer.view",
                      "user",
                    ),
                    "fullName",
                  ),
                  required: true,
                },
                {
                  key: "role",
                  label: "Vai trò",
                  type: "select",
                  options: Object.entries(ROLE_LABEL)
                    .filter(
                      ([r]) =>
                        r !== "STUDENT" &&
                        ASSIGNABLE_ROLES[activeRole.role]?.includes(r),
                    )
                    .map(([value, label]) => ({ value, label })),
                  required: true,
                },
                {
                  key: "scopeId",
                  label: "Phạm vi (để trống cho Toàn trường)",
                  type: "select",
                  options: choices(
                    [...db.faculties, ...db.majors, ...db.classes].filter((r) =>
                      can(
                        "role.assign",
                        resolveScopeChain(
                          db,
                          db.faculties.includes(r)
                            ? "faculty"
                            : db.majors.includes(r)
                              ? "major"
                              : "class",
                          r,
                        ),
                      ),
                    ),
                  ),
                },
                {
                  key: "validFrom",
                  label: "Hiệu lực từ",
                  type: "datetime-local",
                },
                {
                  key: "validTo",
                  label: "Hiệu lực đến",
                  type: "datetime-local",
                },
              ],
              {},
            )
          }
        >
          Gán vai trò
        </Button>
        <DataList
          rows={db.userRoles.filter(
            (r) =>
              r.role !== "STUDENT" &&
              can("role.assign", { type: "user", id: r.userId }),
          )}
          columns={[
            {
              key: "user",
              header: "Người dùng",
              cell: (r) => db.users.find((u) => u.id === r.userId)?.fullName,
            },
            { key: "role", header: "Vai trò", cell: (r) => ROLE_LABEL[r.role] },
            {
              key: "scope",
              header: "Phạm vi",
              cell: (r) => scopeLabel(db, r),
            },
            {
              key: "valid",
              header: "Hiệu lực",
              cell: (r) =>
                `${formatIct(r.validFrom)} – ${r.validTo ? formatIct(r.validTo) : "Vô hạn"}`,
            },
            {
              key: "state",
              header: "Trạng thái",
              cell: (r) =>
                r.revokedAt
                  ? "Đã thu hồi"
                  : isRoleEffective(r, db.clock.now)
                    ? "Đang hiệu lực"
                    : "Hết hạn",
            },
          ]}
          actions={(r) =>
            !r.revokedAt && (
              <Button
                size="sm"
                variant="dangerOutline"
                onClick={() =>
                  setConfirmation({
                    name: "roles.revoke",
                    payload: { id: r.id },
                    title: "Thu hồi vai trò?",
                  })
                }
              >
                Thu hồi
              </Button>
            )
          }
        />
        {dialogs()}
      </div>
    );
  }
  function dialogs() {
    return (
      <>
        <Drawer
          open={Boolean(detail)}
          onClose={() => setDetail(null)}
          title={detail?.name ?? detail?.fullName ?? "Chi tiết"}
        >
          {detail?.programId ? (
            <p>{detail.description}</p>
          ) : detail?.majorId ? (
            <DataList
              rows={db.classes
                .filter((c) => c.programId === detail.id)
                .map((c) => classView(db, c))}
              columns={[
                { key: "code", header: "Mã lớp", cell: (c) => c.code },
                {
                  key: "status",
                  header: "Trạng thái",
                  cell: (c) => (
                    <StatusBadge domain="class">{c.status}</StatusBadge>
                  ),
                },
              ]}
              actions={(c) => (
                <Button
                  variant="link"
                  onClick={() => {
                    setDetail(null);
                    navigate(`/app/classes/${c.id}`);
                  }}
                >
                  Xem thành viên
                </Button>
              )}
            />
          ) : (
            <div className="space-y-2">
              <p>
                {detail?.username} · {detail?.email}
              </p>
              {db.userRoles
                .filter((r) => r.userId === detail?.id)
                .map((r) => (
                  <p key={r.id}>
                    {ROLE_LABEL[r.role]} · {scopeLabel(db, r)}
                  </p>
                ))}
            </div>
          )}
        </Drawer>
        <FormDialog
          open={Boolean(edit)}
          onClose={() => setEdit(null)}
          title={edit?.title}
          fields={(edit?.fields ?? []).map((f) =>
            // Phạm vi phụ thuộc vai trò: Khoa cho BLĐ khoa, Ngành cho CNN, Lớp cho GVPT.
            edit.name === "roles.assign" && f.key === "scopeId"
              ? {
                  ...f,
                  label:
                    {
                      FACULTY: "Phạm vi: Khoa",
                      MAJOR: "Phạm vi: Ngành",
                      CLASS: "Phạm vi: Lớp",
                      SCHOOL: "Phạm vi: Toàn trường (không cần chọn)",
                    }[ROLE_SCOPE[form.role]] ?? "Phạm vi (chọn vai trò trước)",
                  options: f.options.filter(
                    (o) =>
                      ({
                        FACULTY: db.faculties,
                        MAJOR: db.majors,
                        CLASS: db.classes,
                      })[ROLE_SCOPE[form.role]]?.some((x) => x.id === o.value),
                  ),
                }
              : f,
          )}
          values={form}
          onChange={setForm}
          busy={action.busy}
          error={action.error}
          onSubmit={async () => {
            let payload = { ...form };
            if (edit.name === "roles.assign") {
              payload.scopeType = ROLE_SCOPE[payload.role];
              for (const k of ["validFrom", "validTo"])
                if (payload[k]) payload[k] = `${payload[k]}:00+07:00`;
              if (payload.scopeType === "SCHOOL") payload.scopeId = null;
            }
            const r = await action.run(edit.name, payload);
            if (r.ok) {
              if (r.result?.temporaryPassword)
                setTemporary(r.result.temporaryPassword);
              setEdit(null);
            }
          }}
        />
        <ConfirmDialog
          open={Boolean(confirmation)}
          title={confirmation?.title}
          description="Thao tác được kiểm tra quyền và ghi nhật ký."
          confirmLabel="Xác nhận"
          onCancel={() => setConfirmation(null)}
          loading={action.busy}
          onConfirm={async () => {
            const r = await action.run(confirmation.name, {
              ...confirmation.payload,
              reason,
            });
            if (r.ok) {
              if (r.result?.temporaryPassword)
                setTemporary(r.result.temporaryPassword);
              setConfirmation(null);
              setReason("");
            }
          }}
        >
          <Field label="Lý do">
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>
        </ConfirmDialog>
      </>
    );
  }
  if (page === "classes" && id) {
    const cls = rows.find((r) => r.id === id);
    if (!cls)
      return <Callout tone="danger">Không có quyền truy cập lớp này.</Callout>;
    const members = db.memberships.filter((m) => m.classId === id);
    return (
      <div className="space-y-5">
        <p className="text-title-3">{cls.code}</p>
        <p>{cls.description}</p>
        {can("class.updateOwn", { type: "class", id }) && (
          <Button
            onClick={() =>
              open(
                "classes.updateOwn",
                [{ key: "description", label: "Mô tả lớp", type: "textarea" }],
                cls,
              )
            }
          >
            Sửa mô tả lớp
          </Button>
        )}
        <Field label="Thành viên theo năm đào tạo">
          <Select
            value={memberYear}
            onChange={(e) => setMemberYear(e.target.value)}
          >
            <option value="">Tất cả năm</option>
            {[...new Set(members.map((m) => m.studyYear))]
              .sort((a, b) => b - a)
              .map((y) => (
                <option key={y} value={y}>
                  Năm {y}
                </option>
              ))}
          </Select>
        </Field>
        <DataList
          rows={members.filter(
            (m) => !memberYear || String(m.studyYear) === memberYear,
          )}
          columns={[
            {
              key: "name",
              header: "Sinh viên",
              cell: (r) =>
                db.users.find((u) => u.id === r.studentUserId)?.fullName,
            },
            { key: "year", header: "Năm đào tạo", cell: (r) => r.studyYear },
            {
              key: "status",
              header: "Trạng thái",
              cell: (r) => (
                <StatusBadge domain="membership">{r.status}</StatusBadge>
              ),
            },
            {
              key: "source",
              header: "Nguồn hồ sơ",
              cell: (r) => (
                <CodeTag>
                  {db.applications.find((a) => a.id === r.sourceApplicationId)
                    ?.code ?? "—"}
                </CodeTag>
              ),
            },
          ]}
          actions={(r) =>
            (can("class.manage", { type: "class", id }) ||
              can("class.updateOwn", { type: "class", id })) &&
            r.status === "ACTIVE" &&
            latestMemberships(db, r.studentUserId).some(
              (m) => m.id === r.id,
            ) && (
              <Button
                variant="dangerOutline"
                size="sm"
                onClick={() =>
                  setConfirmation({
                    name: "classes.withdrawMember",
                    payload: {
                      membershipId: r.id,
                      own: activeRole.role === "LECTURER",
                    },
                    title: "Ghi nhận SV tự rút khỏi lớp?",
                  })
                }
              >
                Ghi nhận tự rút
              </Button>
            )
          }
        />
        <DataList
          rows={db.rounds.filter((r) => r.classId === id)}
          columns={[
            { key: "round", header: "ĐXT", cell: (r) => r.name },
            {
              key: "status",
              header: "Trạng thái",
              cell: (r) => <StatusBadge domain="round">{r.status}</StatusBadge>,
            },
          ]}
          actions={(r) => (
            <Button
              variant="link"
              onClick={() => navigate(`/app/rounds/${r.id}`)}
            >
              Xem đợt
            </Button>
          )}
        />
        {can("class.manage", { type: "class", id }) && (
          <Button
            variant="dangerOutline"
            onClick={() =>
              setConfirmation({
                name: "classes.end",
                payload: { id },
                title: "Kết thúc lớp?",
              })
            }
          >
            Kết thúc lớp
          </Button>
        )}
        {dialogs()}
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {page === "catalog" && (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setTab("faculty")}>
            Khoa
          </Button>
          <Button variant="secondary" onClick={() => setTab("major")}>
            Ngành
          </Button>
        </div>
      )}
      {page === "lecturers" && (
        <Button variant="secondary" onClick={() => setTab("permissions")}>
          Phân quyền
        </Button>
      )}
      {temporary && (
        <Callout title="Mật khẩu tạm (hiển thị trong phiên này)">
          {temporary}
          <Button variant="link" onClick={() => setTemporary("")}>
            Ẩn
          </Button>
        </Callout>
      )}
      {!["students", "student-passwords"].includes(page) && can(permission) && (
        <Button
          onClick={() =>
            open(
              userPage ? "lecturers.create" : `${base}.create`,
              fields,
              {},
              newLabel,
            )
          }
        >
          {userPage ? "Tạo tài khoản GV" : newLabel}
        </Button>
      )}
      <DataList
        rows={rows}
        caption="Danh sách"
        columns={columns}
        actions={(r) => (
          <div className="flex flex-wrap gap-2">
            {page === "classes" && (
              <Button
                size="sm"
                variant="link"
                onClick={() => navigate(`/app/classes/${r.id}`)}
              >
                Xem thành viên
              </Button>
            )}
            {page === "programs" && (
              <Button
                size="sm"
                variant="link"
                onClick={() => {
                  setDetail(r);
                }}
              >
                Xem chi tiết
              </Button>
            )}
            {can(permission, { type, entity: r }) && !userPage && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => open(`${base}.update`, fields, r)}
                >
                  Sửa
                </Button>
                <Button
                  size="sm"
                  variant="dangerOutline"
                  onClick={() =>
                    setConfirmation({
                      name: `${base}.delete`,
                      payload: { id: r.id },
                      title: "Xóa bản ghi này?",
                    })
                  }
                >
                  Xóa
                </Button>
              </>
            )}
            {userPage && (
              <>
                {can(permission, { type: "user", id: r.id }) && (
                  <Button
                    size="sm"
                    variant="dangerOutline"
                    onClick={() =>
                      setConfirmation({
                        name:
                          r.status === "LOCKED" ? "users.unlock" : "users.lock",
                        payload: { userId: r.id },
                        title:
                          r.status === "LOCKED"
                            ? "Mở khóa tài khoản?"
                            : "Khóa tài khoản?",
                      })
                    }
                  >
                    {r.status === "LOCKED" ? "Mở khóa" : "Khóa"}
                  </Button>
                )}
                {can(
                  page === "lecturers"
                    ? "lecturer.resetPassword"
                    : "student.resetPassword",
                  { type: "user", id: r.id },
                ) && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      setConfirmation({
                        name: "users.resetPassword",
                        payload: { userId: r.id },
                        title: "Đặt lại mật khẩu?",
                      })
                    }
                  >
                    Đặt lại MK
                  </Button>
                )}
                {page === "lecturers" &&
                  can("lecturer.manage", { type: "user", id: r.id }) && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        open(
                          "lecturers.update",
                          fields.filter((f) =>
                            ["fullName", "email"].includes(f.key),
                          ),
                          { ...r, userId: r.id },
                        )
                      }
                    >
                      Sửa
                    </Button>
                  )}
                <Button
                  size="sm"
                  variant="link"
                  onClick={() =>
                    page === "lecturers"
                      ? setDetail(r)
                      : navigate(`/app/records/${r.id}`)
                  }
                >
                  Xem hồ sơ
                </Button>
              </>
            )}
          </div>
        )}
      />
      {dialogs()}
    </div>
  );
}

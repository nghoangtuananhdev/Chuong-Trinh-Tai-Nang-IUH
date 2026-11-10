import { assertCan } from "../../domain/permissions.js";
import { resolveScopeChain } from "../../domain/scope.js";
import { latestMemberships } from "../../domain/selectors.js";
import { defineService, find, requireValue, nextId, audit } from "./_kernel.js";
const specs = {
  faculty: ["faculties", "catalog.manage", "faculty", null],
  major: ["majors", "catalog.manage", "major", ["faculty", "facultyId"]],
  program: ["programs", "program.manage", "program", ["major", "majorId"]],
  class: ["classes", "class.manage", "class", ["program", "programId"]],
};
function service(kind, action) {
  const [table, permission, type, parent] = specs[kind];
  const plural = {
    faculty: "catalog.faculty",
    major: "catalog.major",
    program: "programs",
    class: "classes",
  }[kind];
  return defineService(`${plural}.${action}`, {
    permission,
    resolve: (db, p) =>
      action === "create"
        ? parent
          ? { type: parent[0], id: p[parent[1]] }
          : {}
        : { type, id: p.id },
    handler(db, ctx, p) {
      const existing = action === "create" ? null : find(db, table, p.id),
        before = existing ? structuredClone(existing) : null;
      if (action === "delete") {
        const dependencies = {
          faculty: () => db.majors.some((x) => x.facultyId === p.id),
          major: () =>
            db.programs.some((x) => x.majorId === p.id) ||
            db.studentProfiles.some((x) => x.majorId === p.id),
          program: () => db.classes.some((x) => x.programId === p.id),
          class: () =>
            db.rounds.some((x) => x.classId === p.id) ||
            db.memberships.some((x) => x.classId === p.id),
        };
        requireValue(
          !dependencies[kind](),
          "CONFLICT",
          "Phải xóa thành phần con trước thành phần cha: Khoa → Ngành → Chuyên ngành → Lớp.",
        );
        db[table] = db[table].filter((x) => x.id !== p.id);
      } else {
        const keys = {
          faculty: ["code", "name"],
          major: ["facultyId", "code", "name"],
          program: ["majorId", "type", "name"],
          class: [
            "programId",
            "cohort",
            "startYear",
            "lecturerId",
            "description",
          ],
        }[kind];
        const values = { ...(existing ?? {}) };
        keys.forEach((k) => {
          if (p[k] !== undefined) values[k] = p[k];
        });
        if (kind !== "class")
          requireValue(
            values.name?.trim(),
            "VALIDATION",
            "Vui lòng nhập tên.",
            { field: "name" },
          );
        if (parent) {
          assertCan(ctx, permission, {
            type: parent[0],
            id: values[parent[1]],
          });
          const parentRow = find(db, specs[parent[0]][0], values[parent[1]]);
          requireValue(
            parentRow,
            "VALIDATION",
            "Vui lòng chọn thành phần cha.",
          );
        }
        if (kind === "program") {
          if (p.facultyId)
            requireValue(
              find(db, "majors", values.majorId).facultyId === p.facultyId,
              "VALIDATION",
              "Ngành phải thuộc khoa được chọn.",
              { field: "majorId" },
            );
          requireValue(
            ["KSTN", "CNTN"].includes(values.type),
            "VALIDATION",
            "Vui lòng chọn loại KSTN hoặc CNTN.",
          );
          requireValue(
            !db.programs.some(
              (x) =>
                x.id !== p.id &&
                x.majorId === values.majorId &&
                x.name.trim().toLowerCase() ===
                  values.name.trim().toLowerCase(),
            ),
            "CONFLICT",
            "Đã có chuyên ngành giống hệt được tạo trước đó.",
          );
        }
        if (kind === "class") {
          const program = find(db, "programs", values.programId),
            major = find(db, "majors", program.majorId);
          requireValue(
            /^K\d+$/.test(values.cohort) &&
              Number.isInteger(Number(values.startYear)),
            "VALIDATION",
            "Khóa phải có dạng K20; năm bắt đầu phải là số nguyên.",
            { field: "cohort" },
          );
          values.startYear = Number(values.startYear);
          requireValue(
            !db.classes.some(
              (c) =>
                c.id !== p.id &&
                c.cohort === values.cohort &&
                find(db, "programs", c.programId).majorId === major.id,
            ),
            "CONFLICT",
            "Mỗi ngành và khóa chỉ có tối đa một lớp CN/KSTN.",
          );
          requireValue(
            db.lecturerProfiles.some(
              (l) =>
                l.userId === values.lecturerId &&
                l.facultyId === major.facultyId,
            ),
            "VALIDATION",
            "GVPT phải thuộc cùng khoa của lớp.",
            { field: "lecturerId" },
          );
          values.code = `${program.type}-${major.code}-${values.cohort}`;
          values.endedAt = existing?.endedAt ?? null;
        } else if (kind !== "program")
          requireValue(
            values.code?.trim() &&
              !db[table].some((x) => x.id !== p.id && x.code === values.code),
            "CONFLICT",
            "Mã không được trống hoặc trùng.",
          );
        if (existing) Object.assign(existing, values);
        else
          db[table].push({
            ...values,
            id: nextId(db, kind),
            ...(kind === "class" ? {} : { status: "ACTIVE" }),
          });
      }
      const after = action === "delete" ? null : (existing ?? db[table].at(-1));
      audit(db, ctx, {
        action: `${kind.toUpperCase()}_${action.toUpperCase()}`,
        entity: kind,
        entityId: existing?.id ?? after?.id,
        before,
        after,
      });
      return { result: after };
    },
  });
}
export const facultyCreate = service("faculty", "create"),
  facultyUpdate = service("faculty", "update"),
  facultyDelete = service("faculty", "delete");
export const majorCreate = service("major", "create"),
  majorUpdate = service("major", "update"),
  majorDelete = service("major", "delete");
export const programCreate = service("program", "create"),
  programUpdate = service("program", "update"),
  programDelete = service("program", "delete");
export const classCreate = service("class", "create"),
  classUpdate = service("class", "update"),
  classDelete = service("class", "delete");
export const updateOwn = defineService("classes.updateOwn", {
  permission: "class.updateOwn",
  resolve: (db, p) => ({ type: "class", id: p.id }),
  handler(db, ctx, p) {
    const cls = find(db, "classes", p.id),
      before = structuredClone(cls);
    cls.description = String(p.description ?? "");
    audit(db, ctx, {
      action: "CLASS_UPDATED",
      entity: "class",
      entityId: cls.id,
      before,
      after: cls,
    });
    return { result: cls };
  },
});
export const withdrawMember = defineService("classes.withdrawMember", {
  permission: (db, p) => (p.own ? "class.updateOwn" : "class.manage"),
  resolve: (db, p) => ({ type: "membership", id: p.membershipId }),
  handler(db, ctx, p) {
    const member = find(db, "memberships", p.membershipId);
    requireValue(
      p.reason?.trim(),
      "VALIDATION",
      "Vui lòng ghi lý do sinh viên tự rút.",
    );
    requireValue(
      member.status === "ACTIVE" &&
        latestMemberships(db, member.studentUserId).some(
          (m) => m.id === member.id,
        ),
      "INVALID_STATE",
      "Chỉ ghi nhận tự rút ở năm đào tạo hiện tại đang học.",
    );
    const before = structuredClone(member);
    Object.assign(member, {
      status: "WITHDRAWN",
      note: p.reason,
      updatedAt: ctx.now,
    });
    const profile = db.studentProfiles.find(
      (x) => x.userId === member.studentUserId,
    );
    profile.isKSTN = latestMemberships(db, profile.userId).some(
      (m) => m.status === "ACTIVE",
    );
    audit(db, ctx, {
      action: "MEMBERSHIP_WITHDRAWN",
      entity: "membership",
      entityId: member.id,
      before,
      after: member,
      reason: p.reason,
    });
    return { result: member };
  },
});
export const end = defineService("classes.end", {
  permission: "class.manage",
  resolve: (db, p) => ({ type: "class", id: p.id }),
  handler(db, ctx, p) {
    const cls = find(db, "classes", p.id);
    requireValue(
      !db.rounds.some(
        (r) =>
          r.classId === cls.id && !["draft", "published"].includes(r.status),
      ),
      "CONFLICT",
      "Cần hoàn tất ĐXT đang chạy trước khi kết thúc lớp.",
    );
    const before = structuredClone(cls);
    cls.endedAt = ctx.now;
    for (const m of latestMemberships(db).filter(
      (m) => m.classId === cls.id && m.status === "ACTIVE",
    )) {
      m.status = "GRADUATED";
      m.updatedAt = ctx.now;
      const profile = db.studentProfiles.find(
        (p) => p.userId === m.studentUserId,
      );
      profile.isKSTN = latestMemberships(db, profile.userId).some(
        (m) => m.status === "ACTIVE",
      );
      audit(db, ctx, {
        action: "MEMBERSHIP_CHANGED",
        entity: "membership",
        entityId: m.id,
        after: m,
      });
    }
    audit(db, ctx, {
      action: "CLASS_ENDED",
      entity: "class",
      entityId: cls.id,
      before,
      after: cls,
    });
    return { result: cls };
  },
});

import { assignmentChain } from "../../domain/scope.js";
import { scoreApplication } from "../../domain/scoring.js";
import { defineService, find, requireValue, nextId, audit } from "./_kernel.js";
const resource = (db, p) => ({ type: "criteriaSet", id: p.id ?? p.setId });
function validate(set) {
  requireValue(
    set.name?.trim() && set.criteria?.length,
    "VALIDATION",
    "Cần tên bộ và ít nhất một tiêu chí.",
  );
  const ids = new Set(),
    orders = new Set();
  for (const c of set.criteria) {
    requireValue(
      c.id && !ids.has(c.id) && c.name?.trim(),
      "VALIDATION",
      "Tên và mã tiêu chí không được trống hoặc trùng.",
    );
    ids.add(c.id);
    requireValue(
      ["REQUIRED", "PRIORITY"].includes(c.kind) &&
        ["NUMBER_THRESHOLD", "COUNT", "ACCUMULATIVE_ENUM"].includes(
          c.valueType,
        ),
      "VALIDATION",
      "Loại hoặc kiểu tiêu chí không hợp lệ.",
    );
    requireValue(
      c.levels?.length,
      "VALIDATION",
      `Tiêu chí ${c.name} cần ít nhất một mức.`,
    );
    if (c.evidenceRequired)
      requireValue(
        c.evidenceGuide?.trim(),
        "VALIDATION",
        `Vui lòng mô tả yêu cầu minh chứng cho ${c.name}.`,
      );
    if (c.tieBreakOrder != null) {
      requireValue(
        Number.isInteger(Number(c.tieBreakOrder)) &&
          Number(c.tieBreakOrder) > 0 &&
          !orders.has(Number(c.tieBreakOrder)),
        "VALIDATION",
        "Thứ tự xét hòa phải là số nguyên dương và không trùng.",
      );
      orders.add(Number(c.tieBreakOrder));
    }
    const levelIds = new Set();
    for (const l of c.levels) {
      requireValue(
        l.id &&
          !levelIds.has(l.id) &&
          Number.isFinite(Number(l.points)) &&
          Number(l.points) >= 0,
        "VALIDATION",
        "Mức phải có mã riêng và điểm không âm.",
      );
      levelIds.add(l.id);
      if (c.valueType !== "ACCUMULATIVE_ENUM")
        requireValue(
          ["GTE", "GT", "EQ", "LTE", "LT", "BETWEEN"].includes(l.operator) &&
            l.valueFrom !== "" &&
            Number.isFinite(Number(l.valueFrom)) &&
            (l.operator !== "BETWEEN" ||
              (l.valueTo !== "" &&
                Number.isFinite(Number(l.valueTo)) &&
                Number(l.valueTo) >= Number(l.valueFrom))),
          "VALIDATION",
          `Điều kiện mức của ${c.name} không hợp lệ.`,
        );
    }
    if (c.valueType === "ACCUMULATIVE_ENUM") c.maxPoints = null;
    if (c.refCriterionId)
      requireValue(
        c.valueType === "NUMBER_THRESHOLD" &&
          c.refCriterionId !== c.id &&
          set.criteria.some(
            (s) =>
              s.id === c.refCriterionId &&
              s.valueType === "NUMBER_THRESHOLD" &&
              !s.refCriterionId,
          ),
        "VALIDATION",
        "Tham chiếu phải đến tiêu chí ngưỡng số độc lập trong cùng bộ.",
      );
  }
}
export const create = defineService("criteria.create", {
  permission: "criteria.create",
  resolve: (db, p, ctx) => ({
    facultyId:
      p.facultyId ?? assignmentChain(db, ctx.actor?.roleAssignment)?.facultyId,
    majorId:
      p.majorId ?? assignmentChain(db, ctx.actor?.roleAssignment)?.majorId,
    classId:
      ctx.actor?.roleAssignment.scopeType === "CLASS"
        ? ctx.actor.roleAssignment.scopeId
        : null,
  }),
  handler(db, ctx, p) {
    const chain = assignmentChain(db, ctx.actor.roleAssignment),
      id = nextId(db, "cs");
    const row = {
      id,
      rootId: id,
      version: 1,
      facultyId: p.facultyId ?? chain.facultyId,
      majorId: p.majorId ?? chain.majorId ?? null,
      createdBy: ctx.actor.user.id,
      name: p.name ?? "Bộ tiêu chí mới",
      description: p.description ?? "",
      status: "DRAFT",
      criteria: structuredClone(p.criteria ?? []),
      publishedBy: null,
      publishedAt: null,
      updatedAt: ctx.now,
    };
    requireValue(
      db.faculties.some((f) => f.id === row.facultyId),
      "VALIDATION",
      "Vui lòng chọn khoa.",
    );
    if (row.majorId)
      requireValue(
        db.majors.some(
          (m) => m.id === row.majorId && m.facultyId === row.facultyId,
        ),
        "VALIDATION",
        "Ngành phải thuộc khoa được chọn.",
      );
    if (ctx.actor.roleAssignment.role !== "ADMIN")
      requireValue(
        row.facultyId === chain.facultyId &&
          (!["HEAD", "LECTURER"].includes(ctx.actor.roleAssignment.role) ||
            row.majorId === chain.majorId),
        "FORBIDDEN",
        "Không thể tạo bộ tiêu chí ngoài phạm vi khoa/ngành của bạn.",
      );
    db.criteriaSets.push(row);
    audit(db, ctx, {
      action: "CRITERIA_SET_CREATED",
      entity: "criteriaSet",
      entityId: id,
      before: null,
      after: row,
    });
    return { result: row };
  },
});
function mutate(name) {
  return defineService(`criteria.${name}`, {
    permission: "criteria.update",
    resolve: resource,
    handler(db, ctx, p) {
      const set = find(db, "criteriaSets", p.id),
        before = structuredClone(set);
      if (name === "update") {
        requireValue(
          set.status === "DRAFT",
          "INVALID_STATE",
          "Bộ đã ban hành chỉ được tạo phiên bản mới.",
        );
        for (const key of ["name", "description", "criteria"])
          if (p[key] !== undefined) set[key] = structuredClone(p[key]);
      }
      if (name === "publish") {
        requireValue(
          set.status === "DRAFT",
          "INVALID_STATE",
          "Chỉ ban hành bộ nháp.",
        );
        validate(set);
        Object.assign(set, {
          status: "PUBLISHED",
          publishedBy: ctx.actor.user.id,
          publishedAt: ctx.now,
        });
      }
      if (name === "archive") {
        requireValue(
          set.status !== "ARCHIVED",
          "INVALID_STATE",
          "Bộ đã được lưu trữ.",
        );
        set.status = "ARCHIVED";
      }
      if (name === "delete") {
        requireValue(
          set.status === "DRAFT" &&
            !db.rounds.some((r) => r.criteriaSetId === set.id),
          "CONFLICT",
          "Chỉ xóa bộ nháp chưa được ĐXT tham chiếu; bộ khác cần lưu trữ.",
        );
        db.criteriaSets = db.criteriaSets.filter((s) => s.id !== set.id);
      }
      let result = set;
      if (name === "newVersion") {
        const version =
          Math.max(
            ...db.criteriaSets
              .filter((s) => s.rootId === set.rootId)
              .map((s) => s.version),
          ) + 1;
        result = {
          ...structuredClone(set),
          id: nextId(db, "cs"),
          version,
          status: "DRAFT",
          createdBy: ctx.actor.user.id,
          publishedBy: null,
          publishedAt: null,
          updatedAt: ctx.now,
        };
        db.criteriaSets.push(result);
      }
      set.updatedAt = ctx.now;
      audit(db, ctx, {
        action: `CRITERIA_SET_${name.toUpperCase()}`,
        entity: "criteriaSet",
        entityId: result.id,
        before,
        after: name === "delete" ? null : result,
      });
      return { result };
    },
  });
}
export const update = mutate("update"),
  publish = mutate("publish"),
  archive = mutate("archive"),
  deleteSet = mutate("delete"),
  newVersion = mutate("newVersion");
export const previewScore = defineService("criteria.previewScore", {
  permission: "criteria.view",
  resolve: resource,
  readOnly: true,
  handler(db, ctx, p) {
    return {
      result: scoreApplication(find(db, "criteriaSets", p.setId), p.items),
    };
  },
});

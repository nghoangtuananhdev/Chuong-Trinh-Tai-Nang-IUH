import { fail } from "./errors.js";
import { timestamp } from "./time.js";
import { resolveScopeChain, roleCovers, assignmentChain } from "./scope.js";
import { ROLE_SCOPE } from "./constants.js";

export const PERMISSION_MATRIX = {
  "catalog.manage": { ADMIN: "*" }, // Khoa/Ngành
  "catalog.view": { ADMIN: "*", TRAINING: "*", DEAN: "*", HEAD: "*" },
  "program.manage": { ADMIN: "*", TRAINING: "*", DEAN: "*" }, // Chuyên ngành CN/KSTN
  "program.view": { ADMIN: "*", TRAINING: "*", DEAN: "*", HEAD: "*" },
  "class.manage": { ADMIN: "*", DEAN: "*", HEAD: "*" }, // tạo/sửa/xóa/kết thúc lớp
  "class.updateOwn": { LECTURER: "*" }, // D-22
  "class.view": {
    ADMIN: "*",
    TRAINING: "*",
    DEAN: "*",
    HEAD: "*",
    LECTURER: "*",
  },
  "lecturer.manage": { ADMIN: "*", DEAN: "*", HEAD: "*" }, // tạo/sửa/khóa
  "lecturer.view": { ADMIN: "*", TRAINING: "*", DEAN: "*", HEAD: "*" },
  "lecturer.resetPassword": { ADMIN: "*", TRAINING: "*", DEAN: "*", HEAD: "*" },
  "role.assign": { ADMIN: "*", TRAINING: "*", DEAN: "*", HEAD: "*" }, // + canAssignRole (BR-14)
  "student.manage": { ADMIN: "*" }, // khóa/mở khóa
  "student.view": {
    ADMIN: "*",
    TRAINING: "*",
    DEAN: "*",
    HEAD: "*",
    LECTURER: "*",
  },
  "student.resetPassword": {
    ADMIN: "*",
    TRAINING: "*",
    DEAN: "*",
    HEAD: "*",
    LECTURER: "*",
  }, // C11: LECTURER = lớp
  "criteria.view": {
    ADMIN: "*",
    TRAINING: "*",
    DEAN: "*",
    HEAD: "FACULTY",
    LECTURER: "FACULTY",
  }, // dùng chung khoa
  "criteria.create": { ADMIN: "*", DEAN: "*", HEAD: "*", LECTURER: "*" },
  "criteria.update": { ADMIN: "*", DEAN: "*", HEAD: "*", LECTURER: "OWNER" }, // C12; publish/archive/delete dùng chung quyền này (D-10)
  "round.manage": { ADMIN: "*", DEAN: "*", HEAD: "*" },
  "round.editTimeline": { ADMIN: "*", DEAN: "*", HEAD: "*", LECTURER: "*" },
  "round.transitionManual": { ADMIN: "*", DEAN: "*" },
  "round.view": {
    ADMIN: "*",
    TRAINING: "*",
    DEAN: "*",
    HEAD: "*",
    LECTURER: "*",
  },
  "application.submit": { STUDENT: "*" }, // + classifyFlow
  "application.view": {
    ADMIN: "*",
    TRAINING: "*",
    DEAN: "*",
    HEAD: "*",
    LECTURER: "*",
    STUDENT: "*",
  },
  "application.review": { HEAD: "*", LECTURER: "*" },
  "list.close": { HEAD: "*", LECTURER: "*" },
  "list.approve.HEAD": { HEAD: "*" },
  "list.approve.DEAN": { DEAN: "*" },
  "list.publish": { TRAINING: "*" },
  "report.view": {
    ADMIN: "*",
    TRAINING: "*",
    DEAN: "*",
    HEAD: "*",
    LECTURER: "*",
  },
  "audit.view": { ADMIN: "*", TRAINING: "*" },
  "config.manage": { ADMIN: "*" },
  "email.view": { ADMIN: "*" },
  "email.resend": { ADMIN: "*", TRAINING: "*" },
};

export function isRoleEffective(assignment, now) {
  return Boolean(
    assignment &&
      !assignment.revokedAt &&
      (!assignment.validFrom ||
        timestamp(assignment.validFrom) <= timestamp(now)) &&
      (!assignment.validTo || timestamp(assignment.validTo) >= timestamp(now)),
  );
}
// ctx contains db, now and the single active role of the authenticated session.
export function can(ctx, permission, resource) {
  const actor = ctx.actor,
    db = ctx.db;
  if (
    !actor?.user ||
    actor.user.status !== "ACTIVE" ||
    !isRoleEffective(actor.roleAssignment, ctx.now)
  )
    return false;
  const assignment = actor.roleAssignment;
  if (assignment.userId !== actor.user.id) return false;
  if (actor.user.mustChangePassword) return false;
  const rule = PERMISSION_MATRIX[permission]?.[assignment.role];
  if (!rule) return false;
  // Omitting resource only checks menu eligibility; mutating services must resolve a resource.
  if (resource == null) return true;
  const chain = resource.type
    ? resolveScopeChain(db, resource.type, resource.entity ?? resource.id)
    : resource;
  if (!chain) return false;
  if (rule === "FACULTY")
    return (
      chain.facultyId != null &&
      chain.facultyId === assignmentChain(db, assignment)?.facultyId
    );
  if (rule === "OWNER")
    return (
      chain.createdBy === actor.user.id &&
      chain.facultyId === assignmentChain(db, assignment)?.facultyId
    );
  if (
    permission === "criteria.update" &&
    assignment.role === "HEAD" &&
    !chain.majorId
  )
    return false;
  return roleCovers(assignment, chain);
}
export function assertCan(ctx, permission, resource) {
  if (!can(ctx, permission, resource))
    fail(
      "FORBIDDEN",
      "Bạn không có quyền thực hiện thao tác này trong phạm vi hiện tại.",
    );
}
// BR-14: vai trò mà mỗi vai trò được phép gán (dùng chung cho service và form gán quyền).
export const ASSIGNABLE_ROLES = {
  ADMIN: ["ADMIN", "TRAINING", "DEAN", "HEAD", "LECTURER", "STUDENT"],
  TRAINING: ["TRAINING", "DEAN", "HEAD", "LECTURER", "STUDENT"],
  DEAN: ["DEAN", "HEAD", "LECTURER"],
  HEAD: ["HEAD", "LECTURER"],
};
export function canAssignRole(ctx, targetRole, targetScope) {
  if (
    !can(ctx, "role.assign") ||
    ROLE_SCOPE[targetRole] !== targetScope?.scopeType
  )
    return false;
  const actorRole = ctx.actor.roleAssignment;
  if (!ASSIGNABLE_ROLES[actorRole.role]?.includes(targetRole)) return false;
  if (targetScope.scopeType === "SCHOOL")
    return !targetScope.scopeId && actorRole.scopeType === "SCHOOL";
  if (targetScope.scopeType === "SELF")
    return !targetScope.scopeId && actorRole.scopeType === "SCHOOL";
  const chain = assignmentChain(ctx.db, targetScope);
  return Boolean(chain?.facultyId && roleCovers(actorRole, chain));
}

import { canAssignRole } from "../../domain/permissions.js";
import { timestamp } from "../../domain/time.js";
import { roleCovers, assignmentChain } from "../../domain/scope.js";
import { defineService, find, requireValue, nextId, audit } from "./_kernel.js";
export const assign = defineService("roles.assign", {
  permission: "role.assign",
  handler(db, ctx, p) {
    const user = find(db, "users", p.userId);
    requireValue(
      user.kind === "STAFF",
      "VALIDATION",
      "Chỉ gán vai trò cán bộ tại trang phân quyền.",
    );
    requireValue(
      canAssignRole(ctx, p.role, p),
      "FORBIDDEN",
      "Không thể gán quyền vượt phạm vi của bạn.",
    );
    const targetChain = assignmentChain(db, p),
      profile = db.lecturerProfiles.find((l) => l.userId === user.id);
    requireValue(
      !targetChain.facultyId || profile?.facultyId === targetChain.facultyId,
      "VALIDATION",
      "Tài khoản phải thuộc cùng khoa của phạm vi được gán.",
    );
    const validFrom = p.validFrom || ctx.now;
    timestamp(validFrom);
    if (p.validTo)
      requireValue(
        timestamp(p.validTo) >= timestamp(validFrom),
        "VALIDATION",
        "Ngày hết hiệu lực phải sau ngày bắt đầu.",
      );
    const row = {
      id: nextId(db, "role"),
      userId: p.userId,
      role: p.role,
      scopeType: p.scopeType,
      scopeId: p.scopeId ?? null,
      validFrom,
      validTo: p.validTo || null,
      grantedBy: ctx.actor.user.id,
      revokedAt: null,
    };
    db.userRoles.push(row);
    audit(db, ctx, {
      action: "ROLE_ASSIGNED",
      entity: "roleAssignment",
      entityId: row.id,
      before: null,
      after: row,
    });
    return { result: row };
  },
});
export const revoke = defineService("roles.revoke", {
  permission: "role.assign",
  handler(db, ctx, p) {
    const row = find(db, "userRoles", p.id);
    requireValue(
      canAssignRole(ctx, row.role, row),
      "FORBIDDEN",
      "Không thể thu hồi quyền ngoài phạm vi của bạn.",
    );
    requireValue(!row.revokedAt, "INVALID_STATE", "Vai trò đã được thu hồi.");
    const before = structuredClone(row);
    row.revokedAt = ctx.now;
    audit(db, ctx, {
      action: "ROLE_REVOKED",
      entity: "roleAssignment",
      entityId: row.id,
      before,
      after: row,
      reason: p.reason ?? "",
    });
    return { result: row };
  },
});

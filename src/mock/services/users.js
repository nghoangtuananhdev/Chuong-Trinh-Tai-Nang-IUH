import {
  defineService,
  find,
  requireValue,
  nextId,
  audit,
  queueEmail,
  notify,
  secret,
} from "./_kernel.js";
const resource = (db, p) => ({ type: "user", id: p.userId });
export const resetPassword = defineService("users.resetPassword", {
  permission: (db, p) =>
    find(db, "users", p.userId).kind === "STUDENT"
      ? "student.resetPassword"
      : "lecturer.resetPassword",
  resolve: resource,
  handler(db, ctx, p) {
    const user = find(db, "users", p.userId),
      before = { mustChangePassword: user.mustChangePassword };
    const password = `A${secret(db, ctx, "pw")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(-8)}7`;
    user.passwordHash = `plain:${password}`;
    user.mustChangePassword = true;
    user.failedLoginCount = 0;
    user.lockedUntil = null;
    queueEmail(db, ctx, {
      to: user.email,
      template: "PASSWORD_TEMP",
      vars: { password },
      relatedEntity: user.id,
    });
    notify(db, ctx, [user.id], {
      type: "PASSWORD_RESET",
      title: "Mật khẩu đã được đặt lại",
      body: "Vui lòng kiểm tra email và đổi mật khẩu khi đăng nhập.",
      link: "/app/doi-mat-khau",
    });
    audit(db, ctx, {
      action: "PASSWORD_RESET",
      entity: "user",
      entityId: user.id,
      before,
      after: { mustChangePassword: true },
    });
    return { result: { temporaryPassword: password } };
  },
});
function lock(locked) {
  return defineService(locked ? "users.lock" : "users.unlock", {
    permission: (db, p) =>
      find(db, "users", p.userId).kind === "STUDENT"
        ? "student.manage"
        : "lecturer.manage",
    resolve: resource,
    handler(db, ctx, p) {
      const u = find(db, "users", p.userId);
      requireValue(
        p.reason?.trim(),
        "VALIDATION",
        "Vui lòng ghi lý do khóa/mở khóa tài khoản.",
      );
      const before = { status: u.status };
      u.status = locked ? "LOCKED" : "ACTIVE";
      audit(db, ctx, {
        action: locked ? "ACCOUNT_LOCKED" : "ACCOUNT_UNLOCKED",
        entity: "user",
        entityId: u.id,
        before,
        after: { status: u.status },
        reason: p.reason,
      });
      return { result: { status: u.status } };
    },
  });
}
export const lockUser = lock(true),
  unlockUser = lock(false);
export const createLecturer = defineService("lecturers.create", {
  permission: "lecturer.manage",
  resolve: (db, p) => ({ type: "class", id: p.classId }),
  handler(db, ctx, p) {
    const cls = find(db, "classes", p.classId),
      program = find(db, "programs", cls.programId),
      major = find(db, "majors", program.majorId);
    requireValue(
      p.lecturerCode?.trim() && p.fullName?.trim() && p.email?.includes("@"),
      "VALIDATION",
      "Vui lòng nhập đầy đủ mã GV, họ tên và email.",
    );
    requireValue(
      !db.users.some(
        (u) =>
          u.username.toLowerCase() === p.lecturerCode.toLowerCase() ||
          u.email.toLowerCase() === p.email.toLowerCase(),
      ),
      "CONFLICT",
      "Mã GV hoặc email đã có tài khoản.",
    );
    const id = nextId(db, "usr"),
      password = `A${secret(db, ctx, "pw")
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(-8)}7`;
    db.users.push({
      id,
      kind: "STAFF",
      username: p.lecturerCode,
      fullName: p.fullName,
      email: p.email,
      phone: p.phone ?? "",
      passwordHash: `plain:${password}`,
      status: "ACTIVE",
      mustChangePassword: true,
      failedLoginCount: 0,
      lockedUntil: null,
      createdAt: ctx.now,
    });
    db.lecturerProfiles.push({
      userId: id,
      lecturerCode: p.lecturerCode,
      facultyId: major.facultyId,
      title: p.title ?? "ThS.",
    });
    db.userRoles.push({
      id: nextId(db, "role"),
      userId: id,
      role: "LECTURER",
      scopeType: "CLASS",
      scopeId: cls.id,
      validFrom: ctx.now,
      validTo: null,
      revokedAt: null,
      grantedBy: ctx.actor.user.id,
    });
    queueEmail(db, ctx, {
      to: p.email,
      template: "PASSWORD_TEMP",
      vars: { password },
      relatedEntity: id,
    });
    audit(db, ctx, {
      action: "LECTURER_CREATED",
      entity: "user",
      entityId: id,
      after: {
        username: p.lecturerCode,
        fullName: p.fullName,
        scopeId: cls.id,
      },
    });
    return { result: { userId: id, temporaryPassword: password } };
  },
});
export const updateLecturer = defineService("lecturers.update", {
  permission: "lecturer.manage",
  resolve: resource,
  handler(db, ctx, p) {
    const user = find(db, "users", p.userId);
    requireValue(
      user.kind === "STAFF",
      "VALIDATION",
      "Đối tượng phải là tài khoản giảng viên.",
    );
    requireValue(
      (p.fullName ?? user.fullName)?.trim() &&
        (p.email ?? user.email)?.includes("@"),
      "VALIDATION",
      "Vui lòng nhập họ tên và email hợp lệ.",
    );
    requireValue(
      !db.users.some(
        (u) =>
          u.id !== user.id &&
          u.email.toLowerCase() === (p.email ?? user.email).toLowerCase(),
      ),
      "CONFLICT",
      "Email đã được tài khoản khác sử dụng.",
    );
    const before = {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
    };
    for (const key of ["fullName", "email", "phone"])
      if (p[key] !== undefined) user[key] = p[key];
    audit(db, ctx, {
      action: "LECTURER_UPDATED",
      entity: "user",
      entityId: user.id,
      before,
      after: { fullName: user.fullName, email: user.email, phone: user.phone },
    });
    return { result: { userId: user.id } };
  },
});

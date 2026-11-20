import {
  normalizeCohort,
  normalizeStudentRow,
  planStudentImport,
} from "../../domain/student-import.js";
import {
  defineService,
  find,
  requireValue,
  nextId,
  audit,
} from "./_kernel.js";
const resolve = (db, p) => ({ type: "major", id: p.majorId });
const MAX_ROWS = 2000;
/** Danh sách sinh viên được phép đăng ký, do CNN nhập theo khóa (A-22). */
export const importList = defineService("directory.import", {
  permission: "student.import",
  resolve,
  handler(db, ctx, p) {
    find(db, "majors", p.majorId);
    const defaultCohort = normalizeCohort(p.cohort);
    requireValue(defaultCohort, "VALIDATION", "Vui lòng chọn khóa hợp lệ (ví dụ K22).", {
      field: "cohort",
    });
    requireValue(
      Array.isArray(p.rows) && p.rows.length > 0 && p.rows.length <= MAX_ROWS,
      "VALIDATION",
      `Danh sách cần từ 1 đến ${MAX_ROWS} dòng.`,
    );
    // Không tin kết quả xem trước từ client: chuẩn hóa và lập kế hoạch lại.
    const rows = p.rows.map((r, i) =>
      normalizeStudentRow({ ...r, line: r.line ?? i + 2 }, { defaultCohort }),
    );
    const plan = planStudentImport(db, p.majorId, rows);
    const batchId = nextId(db, "batch");
    const stamp = {
      importedBy: ctx.actor.user.id,
      importedAt: ctx.now,
      batchId,
    };
    let created = 0,
      updated = 0;
    for (const item of plan) {
      const row = item.row;
      if (item.action === "CREATE") {
        db.schoolDirectory.push({
          studentCode: row.studentCode,
          email: row.email,
          fullName: row.fullName,
          dob: row.dob,
          homeClass:
            row.homeClass ||
            `D${row.studentCode.slice(0, 2)}-${p.majorId.slice(4).toUpperCase()}`,
          majorId: p.majorId,
          cohort: row.cohort,
          ...stamp,
        });
        created++;
      } else if (item.action === "UPDATE") {
        const entries = db.schoolDirectory.filter(
          (s) => s.studentCode === row.studentCode,
        );
        for (const [index, entry] of entries.entries()) {
          Object.assign(entry, {
            fullName: row.fullName,
            cohort: row.cohort,
            ...(row.dob ? { dob: row.dob } : {}),
            ...(row.homeClass ? { homeClass: row.homeClass } : {}),
            ...stamp,
          });
          if (index === 0 && !item.registered) entry.email = row.email;
        }
        const profile = db.studentProfiles.find(
          (s) => s.studentCode === row.studentCode,
        );
        if (profile) {
          profile.cohort = row.cohort;
          if (row.homeClass) profile.homeClass = row.homeClass;
        }
        updated++;
      }
    }
    const errors = plan
      .filter((i) => i.action === "ERROR")
      .map((i) => ({
        line: i.line,
        studentCode: i.row.studentCode,
        reason: i.reason,
      }));
    audit(db, ctx, {
      action: "STUDENT_LIST_IMPORTED",
      entity: "major",
      entityId: p.majorId,
      after: {
        batchId,
        cohort: defaultCohort,
        created,
        updated,
        skipped: errors.length,
      },
    });
    return {
      result: { batchId, created, updated, skipped: errors.length, errors },
    };
  },
});
export const remove = defineService("directory.remove", {
  permission: "student.import",
  resolve,
  handler(db, ctx, p) {
    const entries = db.schoolDirectory.filter(
      (s) => s.studentCode === p.studentCode && s.majorId === p.majorId,
    );
    requireValue(entries.length, "NOT_FOUND", "Không tìm thấy sinh viên trong danh sách.");
    requireValue(
      !db.studentProfiles.some((s) => s.studentCode === p.studentCode),
      "INVALID_STATE",
      "Sinh viên đã có tài khoản nên không thể xóa khỏi danh sách.",
    );
    db.schoolDirectory = db.schoolDirectory.filter(
      (s) => !entries.includes(s),
    );
    audit(db, ctx, {
      action: "STUDENT_LIST_ENTRY_REMOVED",
      entity: "major",
      entityId: p.majorId,
      after: { studentCode: p.studentCode },
    });
    return { result: true };
  },
});

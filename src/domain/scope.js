const collection = {
  faculty: "faculties",
  major: "majors",
  program: "programs",
  class: "classes",
  round: "rounds",
  application: "applications",
  membership: "memberships",
  criteriaSet: "criteriaSets",
  user: "users",
};
export function resolveScopeChain(db, type, entityOrId) {
  const entity =
    typeof entityOrId === "string"
      ? db[collection[type]]?.find((e) => e.id === entityOrId)
      : entityOrId;
  if (!entity) return null;
  switch (type) {
    case "faculty":
      return { facultyId: entity.id };
    case "major":
      return { facultyId: entity.facultyId, majorId: entity.id };
    case "program":
      return { ...resolveScopeChain(db, "major", entity.majorId) };
    case "class":
      return {
        ...resolveScopeChain(db, "program", entity.programId),
        classId: entity.id,
      };
    case "round":
      return { ...resolveScopeChain(db, "class", entity.classId) };
    case "application":
      return {
        ...resolveScopeChain(db, "round", entity.roundId),
        studentUserId: entity.studentUserId,
      };
    case "membership":
      return {
        ...resolveScopeChain(db, "class", entity.classId),
        studentUserId: entity.studentUserId,
      };
    case "criteriaSet":
      return {
        facultyId: entity.facultyId,
        majorId: entity.majorId,
        createdBy: entity.createdBy,
      };
    case "user": {
      const student = db.studentProfiles.find((p) => p.userId === entity.id);
      if (student)
        return {
          ...resolveScopeChain(db, "major", student.majorId),
          studentUserId: entity.id,
          classIds: [
            ...new Set(
              db.memberships
                .filter((m) => m.studentUserId === entity.id)
                .map((m) => m.classId),
            ),
          ],
        };
      const lecturer = db.lecturerProfiles.find((p) => p.userId === entity.id);
      return {
        facultyId: lecturer?.facultyId,
        majorIds: [
          ...new Set(
            db.userRoles
              .filter((r) => r.userId === entity.id && !r.revokedAt)
              .flatMap((r) => {
                if (r.scopeType === "MAJOR") return [r.scopeId];
                if (r.scopeType === "CLASS")
                  return [
                    resolveScopeChain(db, "class", r.scopeId)?.majorId,
                  ].filter(Boolean);
                return [];
              }),
          ),
        ],
      };
    }
    default:
      return null;
  }
}
export const roleCovers = (assignment, chain) => {
  if (!assignment || !chain) return false;
  switch (assignment.scopeType) {
    case "SCHOOL":
      return true;
    case "FACULTY":
      return chain.facultyId === assignment.scopeId;
    case "MAJOR":
      return (
        chain.majorId === assignment.scopeId ||
        Boolean(chain.majorIds?.includes(assignment.scopeId))
      );
    case "CLASS":
      return (
        chain.classId === assignment.scopeId ||
        Boolean(chain.classIds?.includes(assignment.scopeId))
      );
    case "SELF":
      return chain.studentUserId === assignment.userId;
    default:
      return false;
  }
};
export function assignmentChain(db, assignment) {
  const type = { FACULTY: "faculty", MAJOR: "major", CLASS: "class" }[
    assignment?.scopeType
  ];
  return type
    ? resolveScopeChain(db, type, assignment.scopeId)
    : assignment?.scopeType === "SELF"
      ? { studentUserId: assignment.userId }
      : {};
}

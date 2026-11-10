export const studentProfile = (db, userId) =>
  db.studentProfiles.find((p) => p.userId === userId);
export const studyYear = (db, round) =>
  Number(round.academicYear.slice(0, 4)) -
  db.classes.find((c) => c.id === round.classId)?.startYear +
  1;
export const isFirstRound = (db, round) =>
  !db.rounds.some(
    (r) =>
      r.id !== round.id &&
      r.classId === round.classId &&
      r.status !== "draft" &&
      (r.academicYear < round.academicYear ||
        (r.academicYear === round.academicYear &&
          (r.intakeStart ?? r.createdAt) <
            (round.intakeStart ?? round.createdAt))),
  );
export const latestMemberships = (db, userId) => {
  const rows = db.memberships.filter(
    (m) => !userId || m.studentUserId === userId,
  );
  return rows.filter(
    (m) =>
      !rows.some(
        (other) =>
          other.classId === m.classId &&
          other.studentUserId === m.studentUserId &&
          other.studyYear > m.studyYear,
      ),
  );
};
export const activeMembership = (db, userId, classId, year) =>
  year == null
    ? latestMemberships(db, userId).find(
        (m) => m.classId === classId && m.status === "ACTIVE",
      )
    : db.memberships.find(
        (m) =>
          m.studentUserId === userId &&
          m.classId === classId &&
          m.studyYear === year &&
          m.status === "ACTIVE",
      );
export function classView(db, cls) {
  const program = db.programs.find((p) => p.id === cls.programId);
  const major = db.majors.find((m) => m.id === program?.majorId);
  const faculty = db.faculties.find((f) => f.id === major?.facultyId);
  const rounds = db.rounds.filter((r) => r.classId === cls.id);
  const maxYear = Math.max(
    0,
    ...db.memberships
      .filter((m) => m.classId === cls.id)
      .map((m) => m.studyYear),
  );
  return {
    ...cls,
    program,
    major,
    faculty,
    status: cls.endedAt
      ? "ENDED"
      : rounds.some((r) => r.status === "published")
        ? "ACTIVE"
        : rounds.some((r) => r.status !== "draft")
          ? "RECRUITING"
          : "NOT_OPEN",
    size: db.memberships.filter(
      (m) =>
        m.classId === cls.id &&
        m.studyYear === maxYear &&
        m.status === "ACTIVE",
    ).length,
  };
}
export function roundView(db, round) {
  const cls = db.classes.find((c) => c.id === round.classId);
  const view = cls ? classView(db, cls) : {};
  const first = isFirstRound(db, round);
  const year = studyYear(db, round);
  return {
    ...round,
    class: view,
    program: view.program,
    major: view.major,
    faculty: view.faculty,
    studyYear: year,
    isFirstRound: first,
    typeLabel: first
      ? "Xét tuyển đầu vào"
      : `Duy trì & xét tuyển bổ sung – năm ${year}`,
  };
}
export const applicationView = (db, application) => ({
  ...application,
  round: roundView(
    db,
    db.rounds.find((r) => r.id === application.roundId),
  ),
  requests: db.reviewRequests.filter((r) => r.applicationId === application.id),
});
export const latestList = (db, roundId) =>
  db.admissionLists
    .filter((l) => l.roundId === roundId)
    .sort((a, b) => b.version - a.version)[0];
export const conflictsForRound = (db, round) =>
  new Set(
    latestMemberships(db)
      .filter((m) => {
        const cls = db.classes.find((c) => c.id === m.classId);
        return (
          m.status === "ACTIVE" &&
          m.classId !== round.classId &&
          cls?.startYear + m.studyYear - 1 ===
            Number(round.academicYear.slice(0, 4))
        );
      })
      .map((m) => m.studentUserId),
  );
export function nextRoundMilestone(db, roundId) {
  const round = db.rounds.find((r) => r.id === roundId);
  if (!round) return null;
  const dates = [
    round.intakeStart,
    round.intakeEnd,
    round.reviewStart,
    round.reviewEnd,
    round.approvalDue,
    ...db.reviewRequests
      .filter(
        (req) =>
          !req.resolvedAt &&
          db.applications.some(
            (a) => a.id === req.applicationId && a.roundId === roundId,
          ),
      )
      .map((req) => req.dueAt),
  ];
  return (
    dates
      .filter((t) => t && Date.parse(t) > Date.parse(db.clock.now))
      .sort((a, b) => Date.parse(a) - Date.parse(b))[0] ?? null
  );
}
export const maintenanceRounds = (db, userId) =>
  db.rounds.filter(
    (r) =>
      (r.status === "open" &&
        activeMembership(db, userId, r.classId, studyYear(db, r) - 1)) ||
      db.applications.some(
        (a) =>
          a.roundId === r.id &&
          a.studentUserId === userId &&
          a.flow === "C" &&
          a.status === "needs_update",
      ),
  );

export function scopeLabel(db, assignment) {
  const row =
    assignment.scopeType === "CLASS"
      ? db.classes.find((c) => c.id === assignment.scopeId)
      : assignment.scopeType === "MAJOR"
        ? db.majors.find((m) => m.id === assignment.scopeId)
        : assignment.scopeType === "FACULTY"
          ? db.faculties.find((f) => f.id === assignment.scopeId)
          : null;
  return (
    row?.name ??
    row?.code ??
    (assignment.scopeType === "SELF" ? "Bản thân" : "Toàn trường")
  );
}

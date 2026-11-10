import {
  studentProfile,
  activeMembership,
  studyYear,
  isFirstRound,
} from "./selectors.js";

export function classifyFlow(db, studentUserId, round) {
  const profile = studentProfile(db, studentUserId);
  if (!profile)
    return {
      flow: null,
      allowed: false,
      reason: "Vui lòng đăng ký tài khoản sinh viên trước khi nộp hồ sơ.",
    };
  if (profile.isKSTN) {
    if (
      activeMembership(
        db,
        studentUserId,
        round.classId,
        studyYear(db, round) - 1,
      ) &&
      !isFirstRound(db, round)
    )
      return { flow: "C", allowed: true };
    return {
      flow: null,
      allowed: false,
      reason:
        "Sinh viên đang học lớp CN/KSTN chỉ cập nhật hồ sơ tích lũy cho lớp của mình.",
    };
  }
  const hasHistory =
    db.applications.some(
      (a) =>
        a.studentUserId === studentUserId &&
        !["draft", "cancelled"].includes(a.status),
    ) || db.memberships.some((m) => m.studentUserId === studentUserId);
  return { flow: hasHistory ? "B" : "A", allowed: true };
}
export function inheritApplication(db, studentUserId, round, snapshot) {
  const flow = classifyFlow(db, studentUserId, round);
  const previous = db.applications
    .filter(
      (a) =>
        a.studentUserId === studentUserId &&
        a.roundId !== round.id &&
        !["draft", "cancelled"].includes(a.status) &&
        (flow.flow !== "C" ||
          db.rounds.find((r) => r.id === a.roundId)?.classId === round.classId),
    )
    .sort((a, b) =>
      String(b.submittedAt).localeCompare(String(a.submittedAt)),
    )[0];
  const previousRound = db.rounds.find((r) => r.id === previous?.roundId);
  return {
    previousApplicationId: previous?.id ?? null,
    items: (snapshot?.criteria ?? []).map((c) => {
      const oldId = previousRound?.criteriaSnapshot?.criteria.find(
        (old) => old.name === c.name,
      )?.id;
      const old = previous?.items.find((i) => i.criterionId === oldId);
      return {
        criterionId: c.id,
        declaredValue: old?.declaredValue ?? "",
        declaredCount: old?.declaredCount ?? "",
        declaredEntries: (old?.declaredEntries ?? []).map((e) => ({
          ...e,
          evidence: [],
          verifyStatus: "UNVERIFIED",
          verifyNote: "",
        })),
        evidence: [],
        verifyStatus: "UNVERIFIED",
        verifiedValue: null,
        verifyNote: "",
      };
    }),
  };
}

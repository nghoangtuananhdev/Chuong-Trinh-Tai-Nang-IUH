import { scoreApplication } from "./scoring.js";
import { requireValue } from "./errors.js";
export function applicationTieKey(snapshot, app) {
  const score = scoreApplication(snapshot, app.items, "official");
  return [
    score.total,
    ...snapshot.criteria
      .filter((c) => c.tieBreakOrder != null)
      .sort((a, b) => a.tieBreakOrder - b.tieBreakOrder)
      .map((c) => {
        const row = score.rows.find((r) => r.criterionId === c.id);
        return c.valueType === "ACCUMULATIVE_ENUM"
          ? row.points
          : row.met
            ? (row.value ?? 0)
            : 0;
      }),
  ];
}
export function compareTieKeys(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const difference = (b[i] ?? 0) - (a[i] ?? 0);
    if (difference) return difference;
  }
  return 0;
}
export function buildAdmissionList({
  round,
  snapshot,
  applications,
  isFirstRound,
  activeMemberIds = new Set(),
  conflicts = new Set(),
}) {
  requireValue(
    Number.isInteger(round.quota) && round.quota > 0,
    "VALIDATION",
    "Chỉ tiêu phải là số nguyên dương.",
  );
  const maintain = !isFirstRound && round.rankingMode === "MAINTAIN_THEN_FILL";
  const warnings = [];
  const rows = applications
    .filter(
      (a) =>
        a.roundId === round.id &&
        a.status === "approved" &&
        scoreApplication(snapshot, a.items, "official").eligible,
    )
    .map((a) => ({
      applicationId: a.id,
      studentUserId: a.studentUserId,
      studentCode: a.studentCode,
      name: a.applicantName,
      flow: a.flow,
      group:
        a.flow === "C" || activeMemberIds.has(a.studentUserId)
          ? "RETAINED"
          : "NEW",
      officialScore: scoreApplication(snapshot, a.items, "official").total,
      tieKey: applicationTieKey(snapshot, a),
      proposed: false,
      tieGroup: null,
      note: conflicts.has(a.studentUserId) ? "Đã trúng tuyển lớp khác" : "",
    }));
  const retained = rows.filter((r) => r.group === "RETAINED");
  if (maintain && retained.length > round.quota)
    warnings.push("SV cũ vượt chỉ tiêu");
  let tieIndex = 0;
  function allocate(group, slots) {
    group.sort((a, b) => compareTieKeys(a.tieKey, b.tieKey));
    group.forEach((r, i) => {
      r.rank = i + 1;
      r.proposed = i < slots;
    });
    if (
      slots > 0 &&
      slots < group.length &&
      compareTieKeys(group[slots - 1].tieKey, group[slots].tieKey) === 0
    ) {
      const key = group[slots].tieKey;
      const ties = group.filter((r) => compareTieKeys(r.tieKey, key) === 0);
      const before = group.findIndex(
        (r) => compareTieKeys(r.tieKey, key) === 0,
      );
      const id = `T${++tieIndex}`;
      ties.forEach((r) => {
        r.tieGroup = id;
        r.proposed = null;
      });
      warnings.push(
        `Có ${ties.length} hồ sơ đồng hạng tranh ${slots - before} suất cuối – cấp CNN cần quyết định`,
      );
    }
    return group;
  }
  const retainedCount = maintain ? Math.min(retained.length, round.quota) : 0;
  const slotsForNew = maintain
    ? Math.max(0, round.quota - retainedCount)
    : round.quota;
  const ranked = maintain
    ? [
        ...allocate(retained, round.quota),
        ...allocate(
          rows.filter((r) => r.group === "NEW"),
          slotsForNew,
        ),
      ]
    : allocate(rows, round.quota);
  ranked.forEach((r, i) => {
    r.rank = i + 1;
  });
  return {
    quota: round.quota,
    rankingMode: round.rankingMode,
    isFirstRound,
    retainedCount,
    slotsForNew,
    warnings,
    rows: ranked,
  };
}
export function validateTieResolution(payload, selectedApplicationIds = []) {
  const ties = payload.rows.filter((r) => r.tieGroup);
  const ids = new Set(selectedApplicationIds);
  requireValue(
    ids.size === selectedApplicationIds.length &&
      selectedApplicationIds.every((id) =>
        ties.some((r) => r.applicationId === id),
      ),
    "VALIDATION",
    "Chỉ chọn các hồ sơ trong nhóm đồng hạng, mỗi hồ sơ một lần.",
  );
  const available =
    Math.min(payload.quota, payload.rows.length) -
    payload.rows.filter((r) => r.proposed === true).length;
  requireValue(
    ids.size === available,
    "VALIDATION",
    `Vui lòng chọn đúng ${available} hồ sơ trong nhóm đồng hạng.`,
  );
  return true;
}

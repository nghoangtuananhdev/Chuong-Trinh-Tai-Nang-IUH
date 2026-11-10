// The snapshot is the only source of scoring rules; no student or class-specific rules.
export const numericValue = (value) => {
  if (
    (typeof value !== "string" && typeof value !== "number") ||
    String(value).trim() === ""
  )
    return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};
export function matchesLevel(value, level) {
  const v = numericValue(value),
    from = numericValue(level.valueFrom),
    to = numericValue(level.valueTo);
  if (v === null || from === null) return false;
  switch (level.operator) {
    case "GTE":
      return v >= from;
    case "GT":
      return v > from;
    case "EQ":
      return v === from;
    case "LTE":
      return v <= from;
    case "LT":
      return v < from;
    case "BETWEEN":
      return to !== null && from <= v && v <= to;
    default:
      return false;
  }
}
export function scoreApplication(snapshot, items = [], options = "self") {
  const mode = typeof options === "string" ? options : options.mode;
  const official = mode === "official";
  const criteria = snapshot?.criteria ?? [];
  const byId = new Map(items.map((item) => [item.criterionId, item]));
  const rows = criteria.map((criterion) => {
    const item = byId.get(criterion.id) ?? {};
    // Published sets forbid reference chains. Missing/cyclic references fail closed.
    const sourceCriterion = criterion.refCriterionId
      ? criteria.find((c) => c.id === criterion.refCriterionId)
      : criterion;
    const source = criterion.refCriterionId
      ? (byId.get(criterion.refCriterionId) ?? {})
      : item;
    const verifyStatus = item.verifyStatus ?? "UNVERIFIED";
    let value,
      points = 0,
      met = false,
      matchedLevel = null;
    if (criterion.valueType === "ACCUMULATIVE_ENUM") {
      const entries = (item.declaredEntries ?? []).filter(
        (entry) =>
          entry.levelId && (!official || entry.verifyStatus === "VALID"),
      );
      const valid = entries
        .map((entry) =>
          criterion.levels.find((level) => level.id === entry.levelId),
        )
        .filter(Boolean);
      value = valid.length;
      points = valid.reduce((sum, level) => sum + level.points, 0);
      met = valid.length > 0;
    } else {
      const raw =
        sourceCriterion?.valueType === "COUNT"
          ? source.declaredCount
          : source.declaredValue;
      value = numericValue(
        official && source.verifiedValue != null ? source.verifiedValue : raw,
      );
      matchedLevel =
        (criterion.levels ?? [])
          .filter((level) => matchesLevel(value, level))
          .sort((a, b) => b.points - a.points)[0] ?? null;
      met =
        Boolean(matchedLevel) &&
        Boolean(sourceCriterion) &&
        !sourceCriterion?.refCriterionId;
      if (met) {
        points =
          matchedLevel.points *
          (criterion.valueType === "COUNT" && criterion.countMode === "PER_ITEM"
            ? value
            : 1);
        if (criterion.maxPoints != null)
          points = Math.min(points, criterion.maxPoints);
      }
    }
    // A reference cannot rehabilitate an invalid source value.
    if (
      official &&
      criterion.valueType !== "ACCUMULATIVE_ENUM" &&
      (verifyStatus === "INVALID" || source.verifyStatus === "INVALID")
    ) {
      met = false;
      points = 0;
    }
    return {
      criterionId: criterion.id,
      name: criterion.name,
      kind: criterion.kind,
      valueType: criterion.valueType,
      value,
      matchedLevel,
      points,
      met,
      verifyStatus,
    };
  });
  const required = rows.filter((row) => row.kind === "REQUIRED");
  const requiredTotal = required.reduce((sum, row) => sum + row.points, 0);
  const priorityTotal = rows
    .filter((row) => row.kind === "PRIORITY")
    .reduce((sum, row) => sum + row.points, 0);
  const failedRequired = required
    .filter((row) => !row.met)
    .map((row) => row.criterionId);
  return {
    rows,
    eligible: failedRequired.length === 0,
    total: requiredTotal + priorityTotal,
    requiredTotal,
    priorityTotal,
    failedRequired,
  };
}

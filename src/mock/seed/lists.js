import { buildAdmissionList } from "../../domain/ranking.js";
import { isFirstRound } from "../../domain/selectors.js";
export function seedLists(db) {
  for (const round of db.rounds.filter((r) =>
    ["approving", "published"].includes(r.status),
  )) {
    const applications = db.applications
      .filter(
        (a) =>
          a.roundId === round.id &&
          ["approved", "confirmed", "not_admitted"].includes(a.status),
      )
      .map((a) => ({ ...a, status: "approved" }));
    const payload = buildAdmissionList({
      round,
      snapshot: round.criteriaSnapshot,
      applications,
      isFirstRound: isFirstRound(db, round),
    });
    // Historical snapshots reflect published decisions, even if seed example scores tie.
    if (round.status === "published")
      for (const row of payload.rows) {
        row.proposed =
          db.applications.find((a) => a.id === row.applicationId).status ===
          "confirmed";
        row.tieGroup = null;
      }
    const latestVersion = round.id === "DXT-2026-04" ? 2 : 1;
    for (let version = 1; version <= latestVersion; version++) {
      const id = `seed_list_${db.admissionLists.length + 1}`,
        returned = version < latestVersion;
      const list = {
        id,
        roundId: round.id,
        version,
        createdBy: round.lecturerId,
        createdAt: round.reviewEnd,
        status: returned
          ? "RETURNED"
          : round.status === "published"
            ? "PUBLISHED"
            : "PENDING",
        payload: structuredClone(payload),
        tieResolution: null,
      };
      db.admissionLists.push(list);
      const levels = returned
        ? ["HEAD", "DEAN"]
        : round.status === "published" ||
            round.approvalSubstatus === "waiting_training"
          ? [
              "HEAD",
              "DEAN",
              ...(round.status === "published" ? ["TRAINING"] : []),
            ]
          : round.approvalSubstatus === "waiting_dean"
            ? ["HEAD"]
            : [];
      for (const level of levels) {
        const marketing = round.classId.includes("mkt");
        const decidedBy =
          level === "TRAINING"
            ? "usr_gv900"
            : level === "DEAN"
              ? marketing
                ? "usr_gv010"
                : "usr_gv004"
              : marketing
                ? "usr_gv007"
                : round.classId.includes("httt")
                  ? "usr_gv002"
                  : "usr_gv005";
        db.approvalSteps.push({
          id: `seed_step_${db.approvalSteps.length + 1}`,
          listId: id,
          level,
          decision: returned && level === "DEAN" ? "RETURNED" : "APPROVED",
          comment:
            returned && level === "DEAN"
              ? "Cần rà soát minh chứng NCKH của 2 SV"
              : "Đã kiểm tra danh sách minh họa",
          attachment: null,
          decidedBy,
          decidedAt: round.reviewEnd,
        });
      }
    }
  }
}

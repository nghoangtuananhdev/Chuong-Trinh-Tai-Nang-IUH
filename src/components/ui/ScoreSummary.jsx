export function ScoreSummary({ score }) {
  return (
    <section
      className="space-y-3 rounded-card border border-ink-200 bg-white p-5"
      aria-live="polite"
    >
      <h3 className="text-title-3">Điểm dự kiến</h3>
      <p className="text-title-1">{score.total}</p>
      <p className="text-body-sm">
        BB đạt {score.rows.filter((r) => r.kind === "REQUIRED" && r.met).length}
        /{score.rows.filter((r) => r.kind === "REQUIRED").length}
      </p>
      {score.rows.map((r) => (
        <p key={r.criterionId} className="text-body-sm">
          {r.name}: {r.points} điểm · {r.met ? "Đạt" : "Chưa đạt"}
        </p>
      ))}
      <p className="text-caption text-ink-500">
        Điểm chính thức do giảng viên xác minh có thể khác.
      </p>
    </section>
  );
}

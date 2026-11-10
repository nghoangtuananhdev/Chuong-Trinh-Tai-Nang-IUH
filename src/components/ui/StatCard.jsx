export function StatCard({ label, value, children }) {
  return (
    <section className="rounded-card border border-ink-200 bg-white p-4">
      <h3 className="text-body-sm text-ink-600">{label}</h3>
      <p className="mt-2 text-title-1 tabular-nums">{value}</p>
      {children && <div className="mt-3 text-body-sm">{children}</div>}
    </section>
  );
}

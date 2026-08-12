export function StatTile({ label, value, sublabel }: { label: string; value: string; sublabel?: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
      <p className="text-xs font-medium text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--text-primary)]">{value}</p>
      {sublabel && <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{sublabel}</p>}
    </div>
  );
}

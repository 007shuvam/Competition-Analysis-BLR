import { statusLabel } from "@/lib/format";

const DOT_VAR: Record<string, string> = {
  NEW_LAUNCH: "var(--status-new-launch)",
  UNDER_CONSTRUCTION: "var(--status-under-construction)",
  READY_TO_MOVE: "var(--status-ready)",
  RESALE: "var(--status-resale)",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: DOT_VAR[status] ?? "var(--text-muted)" }}
        aria-hidden
      />
      {statusLabel(status)}
    </span>
  );
}

export function TypeBadge({ type, label }: { type: string; label: string }) {
  return (
    <span
      key={type}
      className="inline-flex items-center rounded-full border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]"
    >
      {label}
    </span>
  );
}

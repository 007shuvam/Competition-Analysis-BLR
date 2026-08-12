"use client";

import { useState, useTransition } from "react";
import clsx from "clsx";

interface Adapter {
  key: string;
  label: string;
  sourceName: string;
  notes: string;
  status: "ready" | "needs_configuration";
}

interface Run {
  id: string;
  sourceName: string;
  status: string;
  itemsFound: number;
  itemsUpserted: number;
  errorMessage: string | null;
  startedAt: string;
  finishedAt: string | null;
}

export function ScraperAdminPanel({ initialAdapters, initialRuns }: { initialAdapters: Adapter[]; initialRuns: Run[] }) {
  const [runs, setRuns] = useState(initialRuns);
  const [isPending, startTransition] = useTransition();
  const [runningKey, setRunningKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function refreshRuns() {
    const res = await fetch("/api/scrape/runs");
    const data = await res.json();
    setRuns(data.runs);
  }

  function triggerRun(key: string) {
    setRunningKey(key);
    setMessage(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/scrape/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adapterKey: key }),
        });
        const data = await res.json();
        if (!res.ok) {
          setMessage(`Run failed: ${data.error ?? "unknown error"}`);
        } else {
          setMessage(`${data.status === "success" ? "Success" : "Completed"} — ${data.itemsUpserted}/${data.itemsFound} listings upserted.`);
        }
        await refreshRuns();
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Run failed");
      } finally {
        setRunningKey(null);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Registered Adapters</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {initialAdapters.map((a) => (
            <div key={a.key} className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
              <div className="mb-1 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">{a.label}</h3>
                <span
                  className={clsx(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    a.status === "ready"
                      ? "bg-[var(--surface-2)] text-[var(--text-secondary)]"
                      : "border border-dashed border-[var(--border)] text-[var(--text-muted)]"
                  )}
                >
                  {a.status === "ready" ? "Ready" : "Needs configuration"}
                </span>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-[var(--text-muted)]">{a.notes}</p>
              <button
                onClick={() => triggerRun(a.key)}
                disabled={isPending}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                style={{ background: "var(--series-1)" }}
              >
                {runningKey === a.key && isPending ? "Running…" : "Run Now"}
              </button>
            </div>
          ))}
        </div>
        {message && <p className="mt-3 text-sm text-[var(--text-secondary)]">{message}</p>}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Recent Runs</h2>
        <div className="overflow-hidden rounded-xl border border-[var(--border)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-2)] text-xs text-[var(--text-muted)]">
              <tr>
                <th className="px-3 py-2 font-medium">Source</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Found</th>
                <th className="px-3 py-2 font-medium">Upserted</th>
                <th className="px-3 py-2 font-medium">Started</th>
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-[var(--text-muted)]">
                    No scrape runs yet.
                  </td>
                </tr>
              )}
              {runs.map((r) => (
                <tr key={r.id} className="border-t border-[var(--border)]">
                  <td className="px-3 py-2 text-[var(--text-primary)]">{r.sourceName}</td>
                  <td className="px-3 py-2">
                    <span
                      className={clsx(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        r.status === "success" && "text-[var(--status-ready)]",
                        r.status === "failed" && "text-[var(--status-under-construction)]",
                        r.status === "running" && "text-[var(--text-muted)]"
                      )}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-[var(--text-secondary)]">{r.itemsFound}</td>
                  <td className="px-3 py-2 text-[var(--text-secondary)]">{r.itemsUpserted}</td>
                  <td className="px-3 py-2 text-[var(--text-muted)]">{new Date(r.startedAt).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

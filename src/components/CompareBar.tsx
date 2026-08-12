"use client";

import Link from "next/link";
import { useCompare } from "@/lib/compare-context";

export function CompareBar() {
  const { slugs, clear } = useCompare();

  if (slugs.length === 0) return null;

  const href = `/compare?${slugs.map((s) => `slug=${encodeURIComponent(s)}`).join("&")}`;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="flex items-center gap-4 rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-4 py-2 shadow-lg">
        <span className="text-sm text-[var(--text-secondary)]">
          {slugs.length} project{slugs.length > 1 ? "s" : ""} selected
        </span>
        <Link
          href={href}
          className="rounded-full px-3 py-1.5 text-sm font-medium text-white"
          style={{ background: "var(--series-1)" }}
        >
          Compare
        </Link>
        <button
          onClick={clear}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

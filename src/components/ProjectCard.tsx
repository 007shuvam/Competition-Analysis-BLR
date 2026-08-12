"use client";

import Link from "next/link";
import { useCompare } from "@/lib/compare-context";
import { StatusBadge } from "@/components/StatusBadge";
import { formatPriceRange, formatPricePerSqft, typeLabel } from "@/lib/format";

export interface ProjectCardData {
  slug: string;
  name: string;
  type: string;
  status: string;
  developer: { name: string } | null;
  locality: { name: string; zone: string };
  configurations: string[];
  minPriceLakh: number | null;
  maxPriceLakh: number | null;
  pricePerSqft: number | null;
}

export function ProjectCard({ project }: { project: ProjectCardData }) {
  const { toggle, isSelected, atLimit } = useCompare();
  const selected = isSelected(project.slug);

  return (
    <div className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 transition-shadow hover:shadow-md">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <Link href={`/projects/${project.slug}`} className="text-base font-semibold text-[var(--text-primary)] hover:underline">
            {project.name}
          </Link>
          <p className="text-sm text-[var(--text-secondary)]">{project.developer?.name ?? "Independent"}</p>
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <input
            type="checkbox"
            checked={selected}
            disabled={!selected && atLimit}
            onChange={() => toggle(project.slug)}
            className="h-3.5 w-3.5 accent-[var(--series-1)]"
          />
          Compare
        </label>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        <StatusBadge status={project.status} />
        <span className="inline-flex items-center rounded-full border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
          {typeLabel(project.type)}
        </span>
        <span className="inline-flex items-center rounded-full border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
          {project.locality.name}
        </span>
      </div>

      {project.configurations.length > 0 && (
        <p className="mb-3 text-xs text-[var(--text-muted)]">{project.configurations.join(" · ")}</p>
      )}

      <div className="mt-auto flex items-end justify-between pt-2">
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {formatPriceRange(project.minPriceLakh, project.maxPriceLakh)}
          </p>
          <p className="text-xs text-[var(--text-muted)]">{formatPricePerSqft(project.pricePerSqft)}</p>
        </div>
        <Link
          href={`/projects/${project.slug}`}
          className="text-sm font-medium"
          style={{ color: "var(--series-1)" }}
        >
          View details →
        </Link>
      </div>
    </div>
  );
}

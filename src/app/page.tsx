import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { serializeProject } from "@/lib/serialize";
import { parseProjectFilters, buildProjectWhere, buildProjectOrderBy, type SearchParamsInput } from "@/lib/project-query";
import { getFilterOptions } from "@/lib/filter-options";
import { FilterBar } from "@/components/FilterBar";
import { ProjectCard } from "@/components/ProjectCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  const resolvedParams = await searchParams;
  const filters = parseProjectFilters(resolvedParams);
  const where = buildProjectWhere(filters);
  const orderBy = buildProjectOrderBy(filters.sort);

  const [total, projects, options] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      include: { developer: true, locality: true },
      orderBy,
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    getFilterOptions(),
  ]);

  const results = projects.map(serializeProject);
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Active Developments in Bangalore</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {total} project{total === 1 ? "" : "s"} across {Object.keys(options.localitiesByZone).length} zones —
          filter by geography and development type to scope out the competition.
        </p>
      </div>

      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--surface-1)]" />}>
        <FilterBar options={options} />
      </Suspense>

      {results.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-12 text-center text-sm text-[var(--text-muted)]">
          No projects match these filters. Try widening your search or resetting filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams(
              Object.entries(resolvedParams).flatMap(([k, v]) =>
                v == null ? [] : Array.isArray(v) ? v.map((vv) => [k, vv] as [string, string]) : [[k, v] as [string, string]]
              )
            );
            params.set("page", String(p));
            return (
              <Link
                key={p}
                href={`/?${params.toString()}`}
                className={
                  p === filters.page
                    ? "rounded-md px-3 py-1.5 font-medium text-white"
                    : "rounded-md border border-[var(--border)] px-3 py-1.5 text-[var(--text-secondary)]"
                }
                style={p === filters.page ? { background: "var(--series-1)" } : undefined}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

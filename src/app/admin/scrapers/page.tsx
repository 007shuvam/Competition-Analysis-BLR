import { prisma } from "@/lib/db";
import { listAdapters } from "@/lib/scrapers/registry";
import { ScraperAdminPanel } from "@/components/ScraperAdminPanel";

export const dynamic = "force-dynamic";

export default async function ScraperAdminPage() {
  const adapters = listAdapters().map((a) => ({
    key: a.key,
    label: a.label,
    sourceName: a.sourceName,
    notes: a.notes,
    status: a.status,
  }));

  const runs = await prisma.scrapeRun.findMany({
    include: { source: true },
    orderBy: { startedAt: "desc" },
    take: 25,
  });

  const serializedRuns = runs.map((r) => ({
    id: r.id,
    sourceName: r.source.name,
    status: r.status,
    itemsFound: r.itemsFound,
    itemsUpserted: r.itemsUpserted,
    errorMessage: r.errorMessage,
    startedAt: r.startedAt.toISOString(),
    finishedAt: r.finishedAt ? r.finishedAt.toISOString() : null,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Data Sources</h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)]">
          Manage the pluggable scraper framework. Each adapter normalizes listings into the shared Project schema.
          Adapters marked &quot;Needs configuration&quot; run against bundled sample fixtures until pointed at a real,
          ToS-reviewed endpoint — see the README for how to wire one up.
        </p>
      </div>
      <ScraperAdminPanel initialAdapters={adapters} initialRuns={serializedRuns} />
    </div>
  );
}

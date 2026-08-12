import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { serializeProject } from "@/lib/serialize";
import { StatusBadge } from "@/components/StatusBadge";
import { ProjectCard } from "@/components/ProjectCard";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import {
  formatPriceRange,
  formatPricePerSqft,
  formatArea,
  formatDate,
  typeLabel,
} from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      developer: true,
      locality: true,
      priceHistory: { orderBy: { recordedAt: "asc" } },
      listings: { include: { source: true }, orderBy: { scrapedAt: "desc" } },
    },
  });

  if (!project) notFound();

  const similar = await prisma.project.findMany({
    where: { localityId: project.localityId, type: project.type, slug: { not: project.slug } },
    include: { developer: true, locality: true },
    take: 3,
  });

  const serialized = serializeProject(project);
  const trend = project.priceHistory.map((p) => ({
    month: p.recordedAt.toLocaleDateString("en-IN", { year: "2-digit", month: "short" }),
    avgPricePerSqft: p.pricePerSqft,
  }));

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          ← Back to listings
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{project.name}</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {serialized.developer?.name ?? "Independent developer"} · {project.locality.name}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <StatusBadge status={project.status} />
            <span className="inline-flex items-center rounded-full border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
              {typeLabel(project.type)}
            </span>
            {serialized.configurations.map((c) => (
              <span key={c} className="inline-flex items-center rounded-full border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
                {c}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-right">
          <p className="text-xl font-semibold text-[var(--text-primary)]">
            {formatPriceRange(project.minPriceLakh, project.maxPriceLakh)}
          </p>
          <p className="text-sm text-[var(--text-muted)]">{formatPricePerSqft(project.pricePerSqft)}</p>
        </div>
      </div>

      {project.description && <p className="max-w-3xl text-sm leading-relaxed text-[var(--text-secondary)]">{project.description}</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Detail label="Unit Area" value={formatArea(project.minAreaSqft, project.maxAreaSqft)} />
        <Detail label="Total Units" value={project.totalUnits ? String(project.totalUnits) : "—"} />
        <Detail label="Possession" value={formatDate(project.possessionDate)} />
        <Detail label="RERA ID" value={project.reraId ?? "—"} />
      </div>

      {serialized.amenities.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">Amenities</h2>
          <div className="flex flex-wrap gap-1.5">
            {serialized.amenities.map((a) => (
              <span key={a} className="inline-flex items-center rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text-secondary)]">
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {trend.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
          <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Price/sqft History</h2>
          <TrendLineChart data={trend} />
        </div>
      )}

      {project.listings.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">Source Listings</h2>
          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--surface-2)] text-xs text-[var(--text-muted)]">
                <tr>
                  <th className="px-3 py-2 font-medium">Source</th>
                  <th className="px-3 py-2 font-medium">Title</th>
                  <th className="px-3 py-2 font-medium">Price</th>
                  <th className="px-3 py-2 font-medium">Scraped</th>
                </tr>
              </thead>
              <tbody>
                {project.listings.map((l) => (
                  <tr key={l.id} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-secondary)]">{l.source.name}</td>
                    <td className="px-3 py-2 text-[var(--text-primary)]">
                      <a href={l.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {l.rawTitle}
                      </a>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-secondary)]">{l.rawPriceText ?? "—"}</td>
                    <td className="px-3 py-2 text-[var(--text-muted)]">{formatDate(l.scrapedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {similar.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Similar Projects Nearby</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((p) => (
              <ProjectCard key={p.slug} project={serializeProject(p)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-3">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

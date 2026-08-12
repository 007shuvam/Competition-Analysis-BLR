import Link from "next/link";
import { prisma } from "@/lib/db";
import { serializeProject } from "@/lib/serialize";
import { StatusBadge } from "@/components/StatusBadge";
import { formatPriceRange, formatPricePerSqft, formatArea, formatDate, typeLabel } from "@/lib/format";
import type { SearchParamsInput } from "@/lib/project-query";

export const dynamic = "force-dynamic";

export default async function ComparePage({ searchParams }: { searchParams: Promise<SearchParamsInput> }) {
  const resolved = await searchParams;
  const raw = resolved.slug;
  const slugs = raw ? (Array.isArray(raw) ? raw : [raw]) : [];

  const projects = slugs.length
    ? await prisma.project.findMany({
        where: { slug: { in: slugs } },
        include: { developer: true, locality: true },
      })
    : [];

  const ordered = slugs.map((s) => projects.find((p) => p.slug === s)).filter(Boolean) as typeof projects;
  const serialized = ordered.map(serializeProject);

  if (serialized.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--border)] p-16 text-center">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">Nothing to compare yet</h1>
        <p className="max-w-md text-sm text-[var(--text-secondary)]">
          Select up to 4 projects from the listings page using the &quot;Compare&quot; checkbox on each card.
        </p>
        <Link href="/" className="mt-2 rounded-md px-4 py-2 text-sm font-medium text-white" style={{ background: "var(--series-1)" }}>
          Browse Listings
        </Link>
      </div>
    );
  }

  const rows: { label: string; render: (p: (typeof serialized)[number]) => React.ReactNode }[] = [
    { label: "Developer", render: (p) => p.developer?.name ?? "Independent" },
    { label: "Locality", render: (p) => `${p.locality.name} (${p.locality.zone})` },
    { label: "Type", render: (p) => typeLabel(p.type) },
    { label: "Status", render: (p) => <StatusBadge status={p.status} /> },
    { label: "Configurations", render: (p) => p.configurations.join(", ") || "—" },
    { label: "Price Range", render: (p) => formatPriceRange(p.minPriceLakh, p.maxPriceLakh) },
    { label: "Price / sqft", render: (p) => formatPricePerSqft(p.pricePerSqft) },
    { label: "Unit Area", render: (p) => formatArea(p.minAreaSqft, p.maxAreaSqft) },
    { label: "Total Units", render: (p) => (p.totalUnits ? String(p.totalUnits) : "—") },
    { label: "Possession", render: (p) => formatDate(p.possessionDate) },
    { label: "RERA ID", render: (p) => p.reraId ?? "—" },
    { label: "Amenities", render: (p) => p.amenities.join(", ") || "—" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Compare Projects</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Side-by-side comparison of {serialized.length} projects.</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-[var(--surface-2)]">
              <th className="w-40 px-3 py-3 text-xs font-medium text-[var(--text-muted)]">Attribute</th>
              {serialized.map((p) => (
                <th key={p.slug} className="px-3 py-3">
                  <Link href={`/projects/${p.slug}`} className="font-semibold text-[var(--text-primary)] hover:underline">
                    {p.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-[var(--border)]">
                <td className="px-3 py-3 text-xs font-medium text-[var(--text-muted)]">{row.label}</td>
                {serialized.map((p) => (
                  <td key={p.slug} className="px-3 py-3 text-[var(--text-secondary)]">
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma";

export interface AnalyticsFilters {
  zones?: string[];
  types?: string[];
}

export async function getAnalytics(filters: AnalyticsFilters = {}) {
  const where: Prisma.ProjectWhereInput = {};
  if (filters.zones?.length) where.locality = { zone: { in: filters.zones as Prisma.EnumZoneFilter["in"] } };
  if (filters.types?.length) where.type = { in: filters.types as Prisma.EnumDevelopmentTypeFilter["in"] };

  const projects = await prisma.project.findMany({
    where,
    include: { developer: true, locality: true },
  });

  const byLocality = new Map<string, { zone: string; sum: number; count: number }>();
  for (const p of projects) {
    if (!p.pricePerSqft) continue;
    const key = p.locality.name;
    const entry = byLocality.get(key) ?? { zone: p.locality.zone, sum: 0, count: 0 };
    entry.sum += p.pricePerSqft;
    entry.count += 1;
    byLocality.set(key, entry);
  }
  const pricePerSqftByLocality = [...byLocality.entries()]
    .map(([locality, v]) => ({
      locality,
      zone: v.zone,
      avgPricePerSqft: Math.round(v.sum / v.count),
      projectCount: v.count,
    }))
    .sort((a, b) => b.avgPricePerSqft - a.avgPricePerSqft);

  const byType = new Map<string, number>();
  for (const p of projects) byType.set(p.type, (byType.get(p.type) ?? 0) + 1);
  const supplyByType = [...byType.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  const byStatus = new Map<string, number>();
  for (const p of projects) byStatus.set(p.status, (byStatus.get(p.status) ?? 0) + 1);
  const supplyByStatus = [...byStatus.entries()].map(([status, count]) => ({ status, count }));

  const byDeveloper = new Map<string, { count: number; priceSum: number; priceCount: number; tier: string | null }>();
  for (const p of projects) {
    const key = p.developer?.name ?? "Unknown / Independent";
    const entry = byDeveloper.get(key) ?? { count: 0, priceSum: 0, priceCount: 0, tier: p.developer?.tier ?? null };
    entry.count += 1;
    if (p.pricePerSqft) {
      entry.priceSum += p.pricePerSqft;
      entry.priceCount += 1;
    }
    byDeveloper.set(key, entry);
  }
  const developerShare = [...byDeveloper.entries()]
    .map(([developer, v]) => ({
      developer,
      tier: v.tier,
      projectCount: v.count,
      avgPricePerSqft: v.priceCount ? Math.round(v.priceSum / v.priceCount) : null,
    }))
    .sort((a, b) => b.projectCount - a.projectCount)
    .slice(0, 10);

  const snapshotWhere: Prisma.PriceSnapshotWhereInput = projects.length
    ? { projectId: { in: projects.map((p) => p.id) } }
    : { id: "__none__" };
  const snapshots = await prisma.priceSnapshot.findMany({ where: snapshotWhere, orderBy: { recordedAt: "asc" } });
  const byMonth = new Map<string, { sum: number; count: number }>();
  for (const s of snapshots) {
    const key = `${s.recordedAt.getFullYear()}-${String(s.recordedAt.getMonth() + 1).padStart(2, "0")}`;
    const entry = byMonth.get(key) ?? { sum: 0, count: 0 };
    entry.sum += s.pricePerSqft;
    entry.count += 1;
    byMonth.set(key, entry);
  }
  const priceTrend = [...byMonth.entries()]
    .map(([month, v]) => ({ month, avgPricePerSqft: Math.round(v.sum / v.count) }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const pricedProjects = projects.filter((p) => p.pricePerSqft);
  const summary = {
    totalProjects: projects.length,
    avgPricePerSqft: pricedProjects.length
      ? Math.round(pricedProjects.reduce((s, p) => s + (p.pricePerSqft ?? 0), 0) / pricedProjects.length)
      : 0,
    newLaunches: projects.filter((p) => p.status === "NEW_LAUNCH").length,
    localityCount: byLocality.size,
    developerCount: byDeveloper.size,
  };

  return { summary, pricePerSqftByLocality, supplyByType, supplyByStatus, developerShare, priceTrend };
}

export type AnalyticsData = Awaited<ReturnType<typeof getAnalytics>>;

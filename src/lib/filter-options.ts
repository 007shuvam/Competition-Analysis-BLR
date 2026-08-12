import { prisma } from "@/lib/db";
import { typeLabel, statusLabel } from "@/lib/format";

export async function getFilterOptions() {
  const [localities, developers, typeCounts, statusCounts] = await Promise.all([
    prisma.locality.findMany({ orderBy: { name: "asc" } }),
    prisma.developer.findMany({ orderBy: { name: "asc" } }),
    prisma.project.groupBy({ by: ["type"], _count: { _all: true } }),
    prisma.project.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const localitiesByZone = localities.reduce<Record<string, { id: string; name: string }[]>>((acc, l) => {
    (acc[l.zone] ??= []).push({ id: l.id, name: l.name });
    return acc;
  }, {});

  return {
    localitiesByZone,
    developers: developers.map((d) => ({ id: d.id, name: d.name, tier: d.tier })),
    types: typeCounts.map((t) => ({ value: t.type, label: typeLabel(t.type), count: t._count._all })),
    statuses: statusCounts.map((s) => ({ value: s.status, label: statusLabel(s.status), count: s._count._all })),
    configurations: ["1BHK", "2BHK", "3BHK", "4BHK", "5BHK", "Villa", "Plots", "Office", "Retail"],
  };
}

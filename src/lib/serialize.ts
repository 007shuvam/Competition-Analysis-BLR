import type { Project, Developer, Locality } from "@/generated/prisma";

export type ProjectWithRelations = Project & {
  developer: Developer | null;
  locality: Locality;
};

export function serializeProject(p: ProjectWithRelations) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    type: p.type,
    status: p.status,
    developer: p.developer ? { id: p.developer.id, name: p.developer.name, tier: p.developer.tier } : null,
    locality: { id: p.locality.id, name: p.locality.name, zone: p.locality.zone },
    configurations: safeParseArray(p.configurations),
    amenities: safeParseArray(p.amenities),
    minPriceLakh: p.minPriceLakh,
    maxPriceLakh: p.maxPriceLakh,
    pricePerSqft: p.pricePerSqft,
    minAreaSqft: p.minAreaSqft,
    maxAreaSqft: p.maxAreaSqft,
    totalUnits: p.totalUnits,
    possessionDate: p.possessionDate,
    reraId: p.reraId,
    description: p.description,
    heroImageUrl: p.heroImageUrl,
    latitude: p.latitude,
    longitude: p.longitude,
    updatedAt: p.updatedAt,
  };
}

function safeParseArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

import type { Prisma } from "@/generated/prisma";

export type SearchParamsInput = Record<string, string | string[] | undefined>;

function getAll(params: SearchParamsInput, key: string): string[] {
  const v = params[key];
  if (!v) return [];
  return Array.isArray(v) ? v.filter(Boolean) : [v].filter(Boolean);
}

function getOne(params: SearchParamsInput, key: string): string | undefined {
  const v = params[key];
  return Array.isArray(v) ? v[0] : v;
}

export interface ParsedProjectFilters {
  localityIds: string[];
  zones: string[];
  types: string[];
  statuses: string[];
  developerIds: string[];
  configuration?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  sort: string;
  page: number;
  pageSize: number;
}

export function parseProjectFilters(params: SearchParamsInput): ParsedProjectFilters {
  return {
    localityIds: getAll(params, "locality"),
    zones: getAll(params, "zone"),
    types: getAll(params, "type"),
    statuses: getAll(params, "status"),
    developerIds: getAll(params, "developer"),
    configuration: getOne(params, "configuration") || undefined,
    search: getOne(params, "q")?.trim() || undefined,
    minPrice: getOne(params, "minPrice") || undefined,
    maxPrice: getOne(params, "maxPrice") || undefined,
    sort: getOne(params, "sort") ?? "updatedAt",
    page: Math.max(1, parseInt(getOne(params, "page") ?? "1", 10) || 1),
    pageSize: Math.min(100, Math.max(1, parseInt(getOne(params, "pageSize") ?? "24", 10) || 24)),
  };
}

export function buildProjectWhere(f: ParsedProjectFilters): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = {};
  if (f.localityIds.length) where.localityId = { in: f.localityIds };
  if (f.zones.length) where.locality = { zone: { in: f.zones as Prisma.EnumZoneFilter["in"] } };
  if (f.types.length) where.type = { in: f.types as Prisma.EnumDevelopmentTypeFilter["in"] };
  if (f.statuses.length) where.status = { in: f.statuses as Prisma.EnumProjectStatusFilter["in"] };
  if (f.developerIds.length) where.developerId = { in: f.developerIds };
  if (f.configuration) where.configurations = { contains: f.configuration };
  if (f.search) {
    where.OR = [
      { name: { contains: f.search } },
      { developer: { name: { contains: f.search } } },
      { locality: { name: { contains: f.search } } },
    ];
  }
  if (f.minPrice) where.maxPriceLakh = { gte: parseFloat(f.minPrice) };
  if (f.maxPrice) where.minPriceLakh = { lte: parseFloat(f.maxPrice) };
  return where;
}

export function buildProjectOrderBy(sort: string): Prisma.ProjectOrderByWithRelationInput {
  switch (sort) {
    case "priceAsc":
      return { minPriceLakh: "asc" };
    case "priceDesc":
      return { maxPriceLakh: "desc" };
    case "pricePerSqft":
      return { pricePerSqft: "asc" };
    case "name":
      return { name: "asc" };
    default:
      return { updatedAt: "desc" };
  }
}

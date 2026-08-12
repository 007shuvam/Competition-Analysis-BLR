import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeProject } from "@/lib/serialize";
import { parseProjectFilters, buildProjectWhere, buildProjectOrderBy } from "@/lib/project-query";

export async function GET(req: NextRequest) {
  const searchParams = Object.fromEntries(
    [...new Set(req.nextUrl.searchParams.keys())].map((key) => [
      key,
      req.nextUrl.searchParams.getAll(key).length > 1
        ? req.nextUrl.searchParams.getAll(key)
        : (req.nextUrl.searchParams.get(key) ?? undefined),
    ])
  );

  const filters = parseProjectFilters(searchParams);
  const where = buildProjectWhere(filters);
  const orderBy = buildProjectOrderBy(filters.sort);

  const [total, projects] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      include: { developer: true, locality: true },
      orderBy,
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
  ]);

  return NextResponse.json({
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
    results: projects.map(serializeProject),
  });
}

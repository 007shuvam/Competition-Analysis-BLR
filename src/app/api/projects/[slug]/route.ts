import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeProject } from "@/lib/serialize";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
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

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const similar = await prisma.project.findMany({
    where: {
      localityId: project.localityId,
      type: project.type,
      slug: { not: project.slug },
    },
    include: { developer: true, locality: true },
    take: 4,
  });

  return NextResponse.json({
    ...serializeProject(project),
    priceHistory: project.priceHistory.map((p) => ({ pricePerSqft: p.pricePerSqft, recordedAt: p.recordedAt })),
    listings: project.listings.map((l) => ({
      id: l.id,
      sourceName: l.source.name,
      sourceUrl: l.sourceUrl,
      rawTitle: l.rawTitle,
      rawPriceText: l.rawPriceText,
      scrapedAt: l.scrapedAt,
    })),
    similarProjects: similar.map(serializeProject),
  });
}

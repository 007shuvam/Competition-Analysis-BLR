import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const runs = await prisma.scrapeRun.findMany({
    include: { source: true },
    orderBy: { startedAt: "desc" },
    take: 25,
  });

  return NextResponse.json({
    runs: runs.map((r) => ({
      id: r.id,
      sourceName: r.source.name,
      status: r.status,
      itemsFound: r.itemsFound,
      itemsUpserted: r.itemsUpserted,
      errorMessage: r.errorMessage,
      startedAt: r.startedAt,
      finishedAt: r.finishedAt,
    })),
  });
}

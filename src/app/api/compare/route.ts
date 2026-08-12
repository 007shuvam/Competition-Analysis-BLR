import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeProject } from "@/lib/serialize";

export async function GET(req: NextRequest) {
  const slugs = req.nextUrl.searchParams.getAll("slug").filter(Boolean);
  if (slugs.length === 0) return NextResponse.json({ results: [] });

  const projects = await prisma.project.findMany({
    where: { slug: { in: slugs } },
    include: { developer: true, locality: true },
  });

  return NextResponse.json({ results: projects.map(serializeProject) });
}

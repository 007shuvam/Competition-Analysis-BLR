import { prisma } from "@/lib/db";
import { getAdapter } from "./registry";
import { slugify } from "./normalize";
import type { RawListingRecord } from "./types";

export interface RunResult {
  scrapeRunId: string;
  status: "success" | "partial" | "failed";
  itemsFound: number;
  itemsUpserted: number;
  errorMessage?: string;
}

async function upsertRecord(record: RawListingRecord, sourceId: string) {
  const locality = await prisma.locality.upsert({
    where: { name: record.localityName },
    update: {},
    create: { name: record.localityName, zone: record.zone ?? "EAST" },
  });

  const developer = record.developerName
    ? await prisma.developer.upsert({
        where: { name: record.developerName },
        update: {},
        create: { name: record.developerName },
      })
    : null;

  const slug = slugify(`${record.title}-${record.localityName}`);

  const project = await prisma.project.upsert({
    where: { slug },
    update: {
      status: record.status ?? "UNDER_CONSTRUCTION",
      minPriceLakh: record.minPriceLakh,
      maxPriceLakh: record.maxPriceLakh,
      pricePerSqft: record.pricePerSqft,
      minAreaSqft: record.minAreaSqft,
      maxAreaSqft: record.maxAreaSqft,
      possessionDate: record.possessionDate ? new Date(record.possessionDate) : undefined,
      reraId: record.reraId,
      amenities: record.amenities ? JSON.stringify(record.amenities) : undefined,
      description: record.description,
    },
    create: {
      name: record.title,
      slug,
      localityId: locality.id,
      developerId: developer?.id,
      type: record.type,
      status: record.status ?? "UNDER_CONSTRUCTION",
      configurations: JSON.stringify(record.configurations ?? []),
      minPriceLakh: record.minPriceLakh,
      maxPriceLakh: record.maxPriceLakh,
      pricePerSqft: record.pricePerSqft,
      minAreaSqft: record.minAreaSqft,
      maxAreaSqft: record.maxAreaSqft,
      possessionDate: record.possessionDate ? new Date(record.possessionDate) : undefined,
      reraId: record.reraId,
      amenities: JSON.stringify(record.amenities ?? []),
    },
  });

  await prisma.listing.create({
    data: {
      projectId: project.id,
      sourceId,
      sourceUrl: record.sourceUrl,
      rawTitle: record.title,
      rawPriceText: record.priceText,
      raw: record.raw ? JSON.stringify(record.raw) : undefined,
    },
  });

  if (record.pricePerSqft) {
    await prisma.priceSnapshot.create({
      data: { projectId: project.id, pricePerSqft: record.pricePerSqft },
    });
  }

  return project;
}

export async function runScraper(adapterKey: string): Promise<RunResult> {
  const adapter = getAdapter(adapterKey);
  if (!adapter) throw new Error(`Unknown adapter: ${adapterKey}`);

  const source = await prisma.source.upsert({
    where: { name: adapter.sourceName },
    update: { adapterKey: adapter.key },
    create: { name: adapter.sourceName, adapterKey: adapter.key },
  });

  const scrapeRun = await prisma.scrapeRun.create({
    data: { sourceId: source.id, status: "running" },
  });

  try {
    const records = await adapter.fetchListings();
    let upserted = 0;
    for (const record of records) {
      await upsertRecord(record, source.id);
      upserted += 1;
    }

    const status = upserted === records.length ? "success" : "partial";
    await prisma.scrapeRun.update({
      where: { id: scrapeRun.id },
      data: { status, itemsFound: records.length, itemsUpserted: upserted, finishedAt: new Date() },
    });

    return { scrapeRunId: scrapeRun.id, status, itemsFound: records.length, itemsUpserted: upserted };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    await prisma.scrapeRun.update({
      where: { id: scrapeRun.id },
      data: { status: "failed", errorMessage, finishedAt: new Date() },
    });
    return { scrapeRunId: scrapeRun.id, status: "failed", itemsFound: 0, itemsUpserted: 0, errorMessage };
  }
}

// Seeds a realistic-scale illustrative dataset of Bangalore real-estate
// developments so the portal is usable out of the box. This is sample data
// for demonstrating the schema/UI — not a live feed. Replace/augment it by
// running scrapers (see src/lib/scrapers) or by re-seeding from a real
// export once you have one.

import { PrismaClient, Zone, DevelopmentType, ProjectStatus } from "../src/generated/prisma";

const prisma = new PrismaClient();

const LOCALITIES: { name: string; zone: Zone }[] = [
  { name: "Whitefield", zone: Zone.EAST },
  { name: "Sarjapur Road", zone: Zone.EAST },
  { name: "Marathahalli", zone: Zone.EAST },
  { name: "Panathur", zone: Zone.EAST },
  { name: "Budigere Cross", zone: Zone.EAST },
  { name: "Hoskote", zone: Zone.EAST },
  { name: "Hebbal", zone: Zone.NORTH },
  { name: "Yelahanka", zone: Zone.NORTH },
  { name: "Devanahalli", zone: Zone.NORTH },
  { name: "Thanisandra", zone: Zone.NORTH },
  { name: "Electronic City", zone: Zone.SOUTH },
  { name: "JP Nagar", zone: Zone.SOUTH },
  { name: "Bannerghatta Road", zone: Zone.SOUTH },
  { name: "Kanakapura Road", zone: Zone.SOUTH },
  { name: "Rajajinagar", zone: Zone.WEST },
  { name: "Yeshwanthpur", zone: Zone.WEST },
  { name: "Indiranagar", zone: Zone.CENTRAL },
  { name: "Koramangala", zone: Zone.CENTRAL },
  { name: "HSR Layout", zone: Zone.CENTRAL },
];

const DEVELOPERS: { name: string; tier: string }[] = [
  { name: "Prestige Group", tier: "Tier 1" },
  { name: "Sobha Limited", tier: "Tier 1" },
  { name: "Brigade Group", tier: "Tier 1" },
  { name: "Godrej Properties", tier: "Tier 1" },
  { name: "Puravankara", tier: "Tier 1" },
  { name: "Shriram Properties", tier: "Tier 2" },
  { name: "Salarpuria Sattva", tier: "Tier 2" },
  { name: "Century Real Estate", tier: "Tier 2" },
  { name: "Assetz Property", tier: "Tier 2" },
  { name: "Mahindra Lifespaces", tier: "Tier 2" },
  { name: "Provident Housing", tier: "Tier 3" },
  { name: "Vaishnavi Group", tier: "Tier 3" },
];

const PROJECT_WORDS = [
  "Cityscape", "Meadows", "Greenwoods", "Skyline", "Horizon", "Orchid", "Palm Grove",
  "Serenity", "Elysian", "Parkview", "Willow", "Crest", "Estate", "Gardenia", "Enclave",
  "Vista", "Sunrise", "Pinewood", "Lakefront", "Zenith", "Terraces", "Radiance", "Oakwood",
  "Meridian", "Belvedere", "Springfield", "Woodscapes", "Nest", "Aura", "Emerald",
];

const CONFIG_SETS: Record<DevelopmentType, string[][]> = {
  [DevelopmentType.APARTMENT]: [["1BHK", "2BHK"], ["2BHK", "3BHK"], ["2BHK", "3BHK", "4BHK"], ["3BHK", "4BHK"]],
  [DevelopmentType.VILLA]: [["3BHK Villa", "4BHK Villa"], ["4BHK Villa", "5BHK Villa"]],
  [DevelopmentType.PLOTTED]: [["Residential Plots"]],
  [DevelopmentType.COMMERCIAL]: [["Office Space"], ["Retail Space", "Office Space"]],
  [DevelopmentType.MIXED_USE]: [["Retail", "2BHK", "3BHK"]],
  [DevelopmentType.ROW_HOUSE]: [["3BHK Row House"], ["4BHK Row House"]],
};

const AMENITY_POOL = [
  "Clubhouse", "Swimming Pool", "Gym", "Kids Play Area", "Landscaped Gardens",
  "Multipurpose Hall", "Jogging Track", "Sports Court", "24x7 Security", "Power Backup",
  "Rainwater Harvesting", "EV Charging", "Amphitheatre", "Yoga Deck",
];

const TYPES = Object.values(DevelopmentType);
const STATUSES = Object.values(ProjectStatus);

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function pickMany<T>(arr: T[], count: number, seed: number): T[] {
  const shuffled = [...arr].sort((a, b) => ((seed * 31 + arr.indexOf(a)) % 7) - ((seed * 17 + arr.indexOf(b)) % 7));
  return shuffled.slice(0, count);
}

function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("Seeding localities...");
  const localityRows = await Promise.all(
    LOCALITIES.map((l) => prisma.locality.upsert({ where: { name: l.name }, update: {}, create: l }))
  );

  console.log("Seeding developers...");
  const developerRows = await Promise.all(
    DEVELOPERS.map((d) => prisma.developer.upsert({ where: { name: d.name }, update: {}, create: d }))
  );

  console.log("Seeding manual-entry source...");
  const manualSource = await prisma.source.upsert({
    where: { name: "Manual Seed" },
    update: {},
    create: { name: "Manual Seed", adapterKey: "manual" },
  });

  console.log("Seeding projects...");
  let seed = 0;
  const usedSlugs = new Set<string>();
  let created = 0;

  for (let i = 0; i < 55; i++) {
    seed += 7;
    const locality = pick(localityRows, seed);
    const developer = pick(developerRows, seed + 3);
    const type = pick(TYPES, seed + 5);
    const status = pick(STATUSES, seed + 11);
    const word1 = pick(PROJECT_WORDS, seed + 13);
    const word2 = pick(PROJECT_WORDS, seed + 19);
    const developerShort = developer.name.split(" ")[0];
    let name = `${developerShort} ${word1}`;
    let slug = slugify(`${name}-${locality.name}`);
    if (usedSlugs.has(slug)) {
      name = `${developerShort} ${word1} ${word2}`;
      slug = slugify(`${name}-${locality.name}`);
    }
    if (usedSlugs.has(slug)) continue;
    usedSlugs.add(slug);

    const basePsf = 5200 + (seed % 11) * 550; // spread roughly 5200-11000
    const areaMin = 550 + (seed % 9) * 120;
    const areaMax = areaMin + 400 + (seed % 6) * 250;
    const minPriceLakh = Math.round(((areaMin * basePsf) / 100000) * 10) / 10;
    const maxPriceLakh = Math.round(((areaMax * basePsf) / 100000) * 10) / 10;
    const configs = pick(CONFIG_SETS[type], seed + 23);
    const amenities = pickMany(AMENITY_POOL, 4 + (seed % 4), seed + 29);
    const unitsTotal = 80 + (seed % 12) * 40;

    const possessionMonthsOut =
      status === ProjectStatus.READY_TO_MOVE
        ? -(seed % 24) - 1
        : status === ProjectStatus.NEW_LAUNCH
          ? 30 + (seed % 24)
          : 6 + (seed % 24);
    const possessionDate = new Date();
    possessionDate.setMonth(possessionDate.getMonth() + possessionMonthsOut);

    const reraId = `PRM/KA/RERA/1251/${300 + i}/PR/${String(1 + (i % 12)).padStart(2, "0")}0${String(20 + (i % 5))}/${String(2000 + i * 3).padStart(6, "0")}`;

    const project = await prisma.project.create({
      data: {
        name,
        slug,
        developerId: developer.id,
        localityId: locality.id,
        type,
        status,
        configurations: JSON.stringify(configs),
        minPriceLakh,
        maxPriceLakh,
        pricePerSqft: basePsf,
        minAreaSqft: areaMin,
        maxAreaSqft: areaMax,
        totalUnits: unitsTotal,
        possessionDate,
        reraId,
        amenities: JSON.stringify(amenities),
        description: `${name} is a ${type.toLowerCase().replace("_", " ")} development by ${developer.name} in ${locality.name}, offering ${configs.join(", ")} configurations.`,
      },
    });

    await prisma.listing.create({
      data: {
        projectId: project.id,
        sourceId: manualSource.id,
        sourceUrl: `https://example-listings.test/projects/${slug}`,
        rawTitle: name,
        rawPriceText: `₹${minPriceLakh}L - ₹${maxPriceLakh}L`,
      },
    });

    // A couple of historical price points so trend charts have something to show.
    for (const monthsAgo of [6, 3]) {
      const drift = 1 - (monthsAgo / 100) * (1 + (seed % 3));
      await prisma.priceSnapshot.create({
        data: {
          projectId: project.id,
          pricePerSqft: Math.round(basePsf * drift),
          recordedAt: new Date(Date.now() - monthsAgo * 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
    await prisma.priceSnapshot.create({ data: { projectId: project.id, pricePerSqft: basePsf } });

    created += 1;
  }

  console.log(`Seeded ${localityRows.length} localities, ${developerRows.length} developers, ${created} projects.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

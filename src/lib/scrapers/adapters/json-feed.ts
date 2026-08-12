import { readFile } from "node:fs/promises";
import path from "node:path";
import type { RawListingRecord, ScraperAdapter } from "../types";
import { normalizeType, normalizeStatus, normalizeZone, parsePriceRangeToLakh } from "../normalize";

// Generic adapter for any source that exposes a JSON array of listings —
// this is the shape most licensed real-estate data feeds and internal
// exports come in (e.g. a CRM export, a data-vendor API, PropStack-style
// partner feeds). Point ADAPTER_JSON_FEED_URL at a real endpoint; without
// it, this falls back to the bundled fixture so the pipeline is runnable
// out of the box.

interface FeedRecord {
  url: string;
  project_name: string;
  builder?: string;
  locality: string;
  zone?: string;
  category: string;
  stage?: string;
  unit_types?: string[];
  price_range?: string;
  rate_per_sqft?: number;
  carpet_area_min?: number;
  carpet_area_max?: number;
  possession?: string | null;
  rera_no?: string;
  amenities?: string[];
}

async function loadFeed(): Promise<FeedRecord[]> {
  const feedUrl = process.env.ADAPTER_JSON_FEED_URL;
  if (feedUrl) {
    const res = await fetch(feedUrl, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`json-feed adapter: fetch failed with ${res.status}`);
    return res.json();
  }
  const fixturePath = path.join(process.cwd(), "src/lib/scrapers/fixtures/sample-feed.json");
  const raw = await readFile(fixturePath, "utf-8");
  return JSON.parse(raw);
}

export const jsonFeedAdapter: ScraperAdapter = {
  key: "json-feed",
  label: "Generic JSON Feed",
  sourceName: "JSON Data Feed",
  notes:
    "Reads a JSON array of listings from ADAPTER_JSON_FEED_URL. Falls back to a bundled sample feed when unset, so the pipeline is testable immediately. Suited to licensed data-vendor feeds and CRM exports.",
  status: process.env.ADAPTER_JSON_FEED_URL ? "ready" : "needs_configuration",
  async fetchListings(): Promise<RawListingRecord[]> {
    const records = await loadFeed();
    return records.map((r) => {
      const { minPriceLakh, maxPriceLakh } = parsePriceRangeToLakh(r.price_range);
      return {
        sourceUrl: r.url,
        title: r.project_name,
        developerName: r.builder,
        localityName: r.locality,
        zone: normalizeZone(r.locality, r.zone),
        type: normalizeType(r.category),
        status: normalizeStatus(r.stage),
        configurations: r.unit_types,
        priceText: r.price_range,
        minPriceLakh,
        maxPriceLakh,
        pricePerSqft: r.rate_per_sqft,
        minAreaSqft: r.carpet_area_min,
        maxAreaSqft: r.carpet_area_max,
        possessionDate: r.possession ?? undefined,
        reraId: r.rera_no,
        amenities: r.amenities,
        raw: r,
      };
    });
  },
};

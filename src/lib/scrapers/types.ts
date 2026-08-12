// Shared types for the pluggable scraper framework.
//
// A "source" is anywhere project/listing data can come from — a scraped
// website, a licensed data feed, a government registry, or a manual
// CSV/JSON drop. Every adapter normalizes whatever it finds into
// RawListingRecord[]; the runner (see runner.ts) then upserts those into
// Developer / Locality / Project / Listing rows and logs a ScrapeRun.

export type DevelopmentTypeKey =
  | "APARTMENT"
  | "VILLA"
  | "PLOTTED"
  | "COMMERCIAL"
  | "MIXED_USE"
  | "ROW_HOUSE";

export type ProjectStatusKey =
  | "NEW_LAUNCH"
  | "UNDER_CONSTRUCTION"
  | "READY_TO_MOVE"
  | "RESALE";

export type ZoneKey = "NORTH" | "SOUTH" | "EAST" | "WEST" | "CENTRAL";

export interface RawListingRecord {
  /** Canonical URL this record was observed at (used for de-duplication / audit). */
  sourceUrl: string;
  title: string;
  developerName?: string;
  localityName: string;
  zone?: ZoneKey;
  type: DevelopmentTypeKey;
  status?: ProjectStatusKey;
  configurations?: string[];
  priceText?: string;
  minPriceLakh?: number;
  maxPriceLakh?: number;
  pricePerSqft?: number;
  minAreaSqft?: number;
  maxAreaSqft?: number;
  possessionDate?: string; // ISO date string
  reraId?: string;
  amenities?: string[];
  description?: string;
  /** The untouched record as returned by the source, kept for audit/debugging. */
  raw?: unknown;
}

export interface ScraperAdapter {
  /** Stable key, matches Source.adapterKey in the DB. */
  key: string;
  /** Human-readable label shown in the admin UI. */
  label: string;
  /** Display name for the Source row, e.g. "RERA Karnataka". */
  sourceName: string;
  /** Short note on data legality/provenance shown in the admin UI. */
  notes: string;
  /** Whether this adapter is safe to run as-is (fixture/public-data backed) or needs configuration first. */
  status: "ready" | "needs_configuration";
  fetchListings(): Promise<RawListingRecord[]>;
}

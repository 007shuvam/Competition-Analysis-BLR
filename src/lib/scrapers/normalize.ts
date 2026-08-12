import type { DevelopmentTypeKey, ProjectStatusKey, ZoneKey } from "./types";

export function normalizeType(value: string): DevelopmentTypeKey {
  const v = value.trim().toLowerCase();
  if (v.includes("villa")) return "VILLA";
  if (v.includes("plot") || v.includes("land")) return "PLOTTED";
  if (v.includes("commercial") || v.includes("office") || v.includes("retail"))
    return "COMMERCIAL";
  if (v.includes("mixed")) return "MIXED_USE";
  if (v.includes("row")) return "ROW_HOUSE";
  return "APARTMENT";
}

export function normalizeStatus(value: string | null | undefined): ProjectStatusKey {
  const v = (value ?? "").trim().toLowerCase();
  if (v.includes("new") || v.includes("launch")) return "NEW_LAUNCH";
  if (v.includes("ready")) return "READY_TO_MOVE";
  if (v.includes("resale") || v.includes("resell")) return "RESALE";
  return "UNDER_CONSTRUCTION";
}

export function normalizeZone(localityName: string, hint?: string): ZoneKey {
  if (hint) return hint.toUpperCase() as ZoneKey;
  const north = ["hebbal", "yelahanka", "devanahalli", "jakkur", "thanisandra", "hennur"];
  const south = ["jp nagar", "banashankari", "bannerghatta", "jayanagar", "kanakapura", "electronic city"];
  const east = ["whitefield", "sarjapur", "marathahalli", "panathur", "budigere", "kr puram", "hoskote"];
  const west = ["rajajinagar", "malleshwaram", "vijayanagar", "yeshwanthpur", "tumkur road"];
  const central = ["indiranagar", "koramangala", "mg road", "domlur", "ulsoor", "shivajinagar"];
  const l = localityName.toLowerCase();
  if (north.some((x) => l.includes(x))) return "NORTH";
  if (south.some((x) => l.includes(x))) return "SOUTH";
  if (east.some((x) => l.includes(x))) return "EAST";
  if (west.some((x) => l.includes(x))) return "WEST";
  if (central.some((x) => l.includes(x))) return "CENTRAL";
  return "EAST";
}

/** Parses strings like "₹85 L - ₹1.4 Cr" into { minLakh, maxLakh }. */
export function parsePriceRangeToLakh(text: string | undefined): {
  minPriceLakh?: number;
  maxPriceLakh?: number;
} {
  if (!text) return {};
  const toLakh = (num: number, unit: string) => (unit.toLowerCase().startsWith("cr") ? num * 100 : num);
  const matches = [...text.matchAll(/₹?\s*([\d.]+)\s*(cr|l|lakh|lac)/gi)];
  if (matches.length === 0) return {};
  const values = matches.map((m) => toLakh(parseFloat(m[1]), m[2]));
  if (values.length === 1) return { minPriceLakh: values[0], maxPriceLakh: values[0] };
  return { minPriceLakh: Math.min(...values), maxPriceLakh: Math.max(...values) };
}

export function parseRatePerSqft(text: string | undefined): number | undefined {
  if (!text) return undefined;
  const match = text.replace(/,/g, "").match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : undefined;
}

export function parseAreaRange(text: string | undefined): {
  minAreaSqft?: number;
  maxAreaSqft?: number;
} {
  if (!text) return {};
  const nums = [...text.matchAll(/([\d,.]+)/g)].map((m) => parseFloat(m[1].replace(/,/g, "")));
  if (nums.length === 0) return {};
  if (nums.length === 1) return { minAreaSqft: nums[0], maxAreaSqft: nums[0] };
  return { minAreaSqft: Math.min(...nums), maxAreaSqft: Math.max(...nums) };
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

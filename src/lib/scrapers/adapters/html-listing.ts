import { readFile } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import type { RawListingRecord, ScraperAdapter } from "../types";
import {
  normalizeType,
  normalizeStatus,
  normalizeZone,
  parsePriceRangeToLakh,
  parseRatePerSqft,
  parseAreaRange,
} from "../normalize";

// Template adapter for sites that only render listing cards as HTML
// (no JSON API). Uses cheerio to parse markup server-side.
//
// IMPORTANT: before pointing ADAPTER_HTML_URL at a real commercial site
// (99acres, MagicBricks, Housing.com, NoBroker, etc.), check that site's
// terms of service and robots.txt — most explicitly prohibit automated
// scraping, and many offer official data-partner/API programs instead.
// This adapter defaults to a bundled local fixture so the parsing logic
// is runnable and testable without touching any real site.

async function loadHtml(): Promise<string> {
  const url = process.env.ADAPTER_HTML_URL;
  if (url) {
    const res = await fetch(url, { headers: { "User-Agent": "CompetitionAnalysisBLR/1.0" } });
    if (!res.ok) throw new Error(`html-listing adapter: fetch failed with ${res.status}`);
    return res.text();
  }
  const fixturePath = path.join(process.cwd(), "src/lib/scrapers/fixtures/sample-listings.html");
  return readFile(fixturePath, "utf-8");
}

export const htmlListingAdapter: ScraperAdapter = {
  key: "html-listing",
  label: "Generic HTML Listing Page",
  sourceName: "HTML Listing Page",
  notes:
    "Parses listing cards from HTML via cheerio. Defaults to a bundled fixture. To target a real page, set ADAPTER_HTML_URL and adjust the CSS selectors below to match that page's markup — review the target site's ToS/robots.txt first.",
  status: process.env.ADAPTER_HTML_URL ? "ready" : "needs_configuration",
  async fetchListings(): Promise<RawListingRecord[]> {
    const html = await loadHtml();
    const $ = cheerio.load(html);
    const records: RawListingRecord[] = [];

    $(".listing-card").each((_, el) => {
      const card = $(el);
      const sourceUrl = card.attr("data-url") ?? "";
      const localityName = card.find(".listing-locality").text().trim();
      const { minPriceLakh, maxPriceLakh } = parsePriceRangeToLakh(
        card.find(".listing-price").text().trim()
      );
      const { minAreaSqft, maxAreaSqft } = parseAreaRange(card.find(".listing-area").text().trim());

      records.push({
        sourceUrl,
        title: card.find(".listing-title").text().trim(),
        developerName: card.find(".listing-developer").text().trim() || undefined,
        localityName,
        zone: normalizeZone(localityName),
        type: normalizeType(card.find(".listing-type").text().trim()),
        status: normalizeStatus(card.find(".listing-status").text().trim()),
        configurations: card
          .find(".listing-configs")
          .text()
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        priceText: card.find(".listing-price").text().trim(),
        minPriceLakh,
        maxPriceLakh,
        pricePerSqft: parseRatePerSqft(card.find(".listing-rate").text().trim()),
        minAreaSqft,
        maxAreaSqft,
        reraId: card.find(".listing-rera").text().trim() || undefined,
      });
    });

    return records;
  },
};

import type { RawListingRecord, ScraperAdapter } from "../types";

// Template adapter for Karnataka RERA (rera.karnataka.gov.in) — a public
// government registry of legally registered projects. This is the single
// best "authoritative" source for a competition-analysis tool: every
// project sold in Karnataka must be RERA-registered, and the registry
// exposes project name, developer, locality, status and possession date.
//
// This adapter is intentionally left unimplemented: this environment's
// network egress is blocked to that domain, so the endpoint shape below
// could not be verified against the live site and hardcoding guessed
// selectors would be worse than admitting that. Before wiring this up:
//   1. Visit https://rera.karnataka.gov.in and find the public project
//      search page (usually under "Projects" or "Search Project").
//   2. Check whether it exposes a JSON API (inspect Network tab) — if so,
//      prefer the json-feed adapter pointed at that endpoint instead of
//      HTML scraping.
//   3. Confirm the site's terms of use permit automated access; government
//      open-data portals often do, but confirm rather than assume.
//   4. Replace the body of fetchListings() below with real fetch + parse
//      logic, following the same pattern as html-listing.ts / json-feed.ts.

export const reraKarnatakaAdapter: ScraperAdapter = {
  key: "rera-karnataka",
  label: "RERA Karnataka (template — not yet wired up)",
  sourceName: "RERA Karnataka",
  notes:
    "Public government registry of RERA-registered projects — the most authoritative source available, but this environment could not reach rera.karnataka.gov.in to verify the real page structure. Implement fetchListings() following the html-listing.ts / json-feed.ts pattern once you've confirmed the endpoint.",
  status: "needs_configuration",
  async fetchListings(): Promise<RawListingRecord[]> {
    throw new Error(
      "rera-karnataka adapter is a template only — implement fetchListings() against a verified endpoint before running it."
    );
  },
};

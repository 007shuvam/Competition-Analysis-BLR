# BLR Competition Analysis Portal

An interactive portal for tracking real-estate developments (new launches,
under-construction, ready-to-move, and resale) across Bangalore, built for
competition analysis: filter by geography and development type, compare
projects side-by-side, and read market analytics (price/sqft by locality,
supply by type/status, developer positioning, price trends).

## Stack

- **Next.js (App Router) + TypeScript + Tailwind CSS 4**
- **Prisma + SQLite** for the data layer (swap the datasource for Postgres/MySQL later without touching the schema shape)
- **Recharts** for analytics charts
- A **pluggable scraper framework** (`src/lib/scrapers`) for bringing in listing data

## Getting started

```bash
npm install
npm run db:push     # create the SQLite schema
npm run db:seed      # load the illustrative sample dataset
npm run dev           # http://localhost:3000
```

`npm run db:studio` opens Prisma Studio if you want to browse/edit the raw data.

## What's here

- **Listings dashboard** (`/`) — dropdown filters for zone, locality, development
  type, status, configuration, developer, plus search, price range and sort.
  Filter state lives in the URL, so filtered views are shareable/bookmarkable.
- **Project detail** (`/projects/[slug]`) — full spec, amenities, price/sqft
  history chart, source listings with provenance, and similar nearby projects.
- **Compare** (`/compare`) — select up to 4 projects from the dashboard and get
  a side-by-side attribute table.
- **Analytics** (`/analytics`) — avg price/sqft by locality, supply by
  development type and by status, top developers by active project count, and
  a blended price/sqft trend line.
- **Data Sources** (`/admin/scrapers`) — lists registered scraper adapters and
  lets you trigger a run on demand; shows a log of recent scrape runs.

## Data model

See `prisma/schema.prisma`. The core idea: a **Project** is the normalized,
de-duplicated development (what the UI shows); a **Listing** is one raw
observation of that project from a specific **Source** (what a scraper
produces), kept for provenance/audit. **PriceSnapshot** rows accumulate over
time so trend charts have something to plot as scrapes/imports repeat.

## The scraper framework — how it actually works, and its limits

`src/lib/scrapers/types.ts` defines a small `ScraperAdapter` interface:
given nothing, return `RawListingRecord[]`. `runner.ts` takes whatever an
adapter returns and upserts it into `Developer` / `Locality` / `Project` /
`Listing`, logging a `ScrapeRun` either way. Adding a new source means
implementing one adapter and registering it in `registry.ts` — the DB layer,
API routes, and UI don't change.

Three adapters ship out of the box:

| Adapter | Status | What it does |
|---|---|---|
| `json-feed` | ready (fixture-backed) | Parses a JSON array of listings. Point `ADAPTER_JSON_FEED_URL` at a real endpoint (a licensed data-vendor feed, a CRM export, an open-data API) to go live; without it, reads the bundled `fixtures/sample-feed.json`. |
| `html-listing` | ready (fixture-backed) | Uses `cheerio` to parse listing cards out of HTML. Point `ADAPTER_HTML_URL` at a real page and adjust the CSS selectors in `adapters/html-listing.ts` to match its markup. |
| `rera-karnataka` | template only | Karnataka RERA is the most authoritative source available — every legally sold project must be registered there — but this repo was built in a sandboxed environment with no network access to `rera.karnataka.gov.in`, so the real page/API structure could not be verified. The adapter is a documented stub; see the comments in `adapters/rera-karnataka.ts` for what to check before wiring it up. |

**Before pointing any adapter at a real commercial site** (99acres,
MagicBricks, Housing.com, NoBroker, etc.), check that site's Terms of Service
and `robots.txt`. Most of these explicitly prohibit automated scraping and
instead offer official data-partner/API programs — that's the sanctioned path
for "comb the internet" at production scale, not unauthenticated scraping.
Government registries (like RERA) and licensed data vendors are the safer,
durable data sources for a tool like this.

Run an adapter from the CLI:

```bash
npm run scrape -- json-feed
npm run scrape -- html-listing
```

...or from the **Data Sources** admin page, which calls the same
`POST /api/scrape/run` route.

### What this means for "v1"

This repo ships with a realistic **illustrative seed dataset** (55 projects
across 19 Bangalore localities and 12 developers — see `prisma/seed.ts`) so
the portal is fully usable immediately. It is not live inventory. Treat it as
a schema/UI demonstration and replace/augment it by:

1. Wiring `json-feed` or `html-listing` up to a real, ToS-reviewed source, or
2. Implementing the `rera-karnataka` adapter once you've confirmed its
   endpoint shape, or
3. Writing a new adapter for a licensed data feed you have access to.

## API routes

- `GET /api/projects` — filtered/paginated list (`locality`, `zone`, `type`,
  `status`, `developer`, `configuration`, `q`, `minPrice`, `maxPrice`, `sort`,
  `page`, `pageSize` — all repeatable/optional query params)
- `GET /api/projects/[slug]` — full detail + price history + listings + similar projects
- `GET /api/compare?slug=a&slug=b` — projects by slug, for the compare view
- `GET /api/filters` — dropdown option data (localities by zone, developers, types, statuses)
- `GET /api/analytics` — aggregated market analytics, optionally scoped by `zone`/`type`
- `GET /api/scrape/adapters` — registered adapters and their status
- `POST /api/scrape/run` — `{ "adapterKey": "json-feed" }` → triggers a run
- `GET /api/scrape/runs` — recent scrape run log

## Notes on the sample data

Developer and locality names in the seed data (Prestige, Sobha, Brigade,
Godrej, etc.) are real, well-known Bangalore developers, used the way any
property portal would reference them — but the specific seeded project names,
prices, and RERA IDs are synthetic/illustrative, not scraped from live
inventory. Don't treat seed-data figures as real market prices.

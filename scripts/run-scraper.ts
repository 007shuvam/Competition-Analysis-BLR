// CLI entry point: npm run scrape -- <adapter-key>
// Also usable via the admin UI, which calls the same runScraper() through
// the /api/scrape/run route.
import { runScraper } from "../src/lib/scrapers/runner";
import { listAdapters } from "../src/lib/scrapers/registry";

async function main() {
  const key = process.argv[2];
  if (!key) {
    console.log("Usage: npm run scrape -- <adapter-key>\n");
    console.log("Available adapters:");
    for (const a of listAdapters()) {
      console.log(`  ${a.key}${" ".repeat(Math.max(1, 20 - a.key.length))}${a.status}  ${a.label}`);
    }
    process.exit(1);
  }

  const result = await runScraper(key);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.status === "failed" ? 1 : 0);
}

main();

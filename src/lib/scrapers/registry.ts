import type { ScraperAdapter } from "./types";
import { jsonFeedAdapter } from "./adapters/json-feed";
import { htmlListingAdapter } from "./adapters/html-listing";
import { reraKarnatakaAdapter } from "./adapters/rera-karnataka";

// Add new adapters here — each one just needs to implement ScraperAdapter
// (see types.ts) and be registered in this list.
const adapters: ScraperAdapter[] = [jsonFeedAdapter, htmlListingAdapter, reraKarnatakaAdapter];

export function listAdapters(): ScraperAdapter[] {
  return adapters;
}

export function getAdapter(key: string): ScraperAdapter | undefined {
  return adapters.find((a) => a.key === key);
}

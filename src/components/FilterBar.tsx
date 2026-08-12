"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

export interface FilterOptions {
  localitiesByZone: Record<string, { id: string; name: string }[]>;
  developers: { id: string; name: string; tier: string | null }[];
  types: { value: string; label: string; count: number }[];
  statuses: { value: string; label: string; count: number }[];
  configurations: string[];
}

const ZONES = ["NORTH", "SOUTH", "EAST", "WEST", "CENTRAL"];
const ZONE_LABELS: Record<string, string> = {
  NORTH: "North Bangalore",
  SOUTH: "South Bangalore",
  EAST: "East Bangalore",
  WEST: "West Bangalore",
  CENTRAL: "Central Bangalore",
};

function selectClass() {
  return "w-full rounded-md border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--series-1)]";
}

export function FilterBar({ options }: { options: FilterOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  const zone = searchParams.get("zone") ?? "";
  const locality = searchParams.get("locality") ?? "";

  const localityOptions = useMemo(() => {
    if (zone && options.localitiesByZone[zone]) return options.localitiesByZone[zone];
    return Object.values(options.localitiesByZone).flat();
  }, [zone, options.localitiesByZone]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key === "zone") params.delete("locality");
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function submitSearch() {
    updateParam("q", search.trim());
  }

  function reset() {
    startTransition(() => router.push(pathname));
    setSearch("");
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Zone</label>
          <select className={selectClass()} value={zone} onChange={(e) => updateParam("zone", e.target.value)}>
            <option value="">All Zones</option>
            {ZONES.map((z) => (
              <option key={z} value={z}>
                {ZONE_LABELS[z]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Locality</label>
          <select className={selectClass()} value={locality} onChange={(e) => updateParam("locality", e.target.value)}>
            <option value="">All Localities</option>
            {localityOptions.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Development Type</label>
          <select
            className={selectClass()}
            value={searchParams.get("type") ?? ""}
            onChange={(e) => updateParam("type", e.target.value)}
          >
            <option value="">All Types</option>
            {options.types.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label} ({t.count})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Status</label>
          <select
            className={selectClass()}
            value={searchParams.get("status") ?? ""}
            onChange={(e) => updateParam("status", e.target.value)}
          >
            <option value="">All Statuses</option>
            {options.statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label} ({s.count})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Configuration</label>
          <select
            className={selectClass()}
            value={searchParams.get("configuration") ?? ""}
            onChange={(e) => updateParam("configuration", e.target.value)}
          >
            <option value="">Any Configuration</option>
            {options.configurations.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Developer</label>
          <select
            className={selectClass()}
            value={searchParams.get("developer") ?? ""}
            onChange={(e) => updateParam("developer", e.target.value)}
          >
            <option value="">All Developers</option>
            {options.developers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Search</label>
          <input
            className={selectClass()}
            placeholder="Project, developer or locality…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitSearch()}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Min price (₹L)</label>
          <input
            type="number"
            className={`${selectClass()} w-28`}
            value={searchParams.get("minPrice") ?? ""}
            onChange={(e) => updateParam("minPrice", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Max price (₹L)</label>
          <input
            type="number"
            className={`${selectClass()} w-28`}
            value={searchParams.get("maxPrice") ?? ""}
            onChange={(e) => updateParam("maxPrice", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Sort by</label>
          <select
            className={selectClass()}
            value={searchParams.get("sort") ?? "updatedAt"}
            onChange={(e) => updateParam("sort", e.target.value)}
          >
            <option value="updatedAt">Recently Updated</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="pricePerSqft">Price per sqft</option>
            <option value="name">Name</option>
          </select>
        </div>
        <button
          onClick={submitSearch}
          className="rounded-md px-4 py-2 text-sm font-medium text-white"
          style={{ background: "var(--series-1)" }}
        >
          Apply
        </button>
        <button onClick={reset} className="rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)]">
          Reset
        </button>
      </div>
    </div>
  );
}

import { getAnalytics } from "@/lib/analytics";
import { StatTile } from "@/components/StatTile";
import { RankedBarChart } from "@/components/charts/RankedBarChart";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { typeLabel, statusLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const data = await getAnalytics();

  const localityBars = data.pricePerSqftByLocality.map((d) => ({
    label: d.locality,
    value: d.avgPricePerSqft,
    sublabel: `${d.projectCount} project${d.projectCount > 1 ? "s" : ""}`,
  }));

  const typeBars = data.supplyByType.map((d) => ({ label: typeLabel(d.type), value: d.count }));
  const statusBars = data.supplyByStatus.map((d) => ({ label: statusLabel(d.status), value: d.count }));
  const developerBars = data.developerShare.map((d) => ({
    label: d.developer,
    value: d.projectCount,
    sublabel: d.avgPricePerSqft ? `avg ₹${d.avgPricePerSqft.toLocaleString("en-IN")}/sqft` : undefined,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Market Analytics</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Competitive positioning across Bangalore&apos;s active development pipeline.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile label="Tracked Projects" value={String(data.summary.totalProjects)} />
        <StatTile label="Avg. Price / sqft" value={`₹${data.summary.avgPricePerSqft.toLocaleString("en-IN")}`} />
        <StatTile label="New Launches" value={String(data.summary.newLaunches)} />
        <StatTile label="Localities Covered" value={String(data.summary.localityCount)} />
        <StatTile label="Developers Tracked" value={String(data.summary.developerCount)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Average Price/sqft by Locality" description="Ranked highest to lowest, current active listings.">
          <RankedBarChart data={localityBars} format="rupee" />
        </ChartCard>

        <div className="flex flex-col gap-4">
          <ChartCard title="Supply by Development Type">
            <RankedBarChart data={typeBars} height={typeBars.length * 40} />
          </ChartCard>
          <ChartCard title="Pipeline by Status">
            <RankedBarChart data={statusBars} height={statusBars.length * 40} />
          </ChartCard>
        </div>
      </div>

      <ChartCard title="Top Developers by Active Project Count" description="Top 10 by number of tracked projects.">
        <RankedBarChart data={developerBars} />
      </ChartCard>

      <ChartCard title="Average Price/sqft Trend" description="Blended across all tracked projects with recorded price history.">
        <TrendLineChart data={data.priceTrend} />
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
      <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
      {description && <p className="mb-3 mt-0.5 text-xs text-[var(--text-muted)]">{description}</p>}
      <div className={description ? "" : "mt-3"}>{children}</div>
    </div>
  );
}

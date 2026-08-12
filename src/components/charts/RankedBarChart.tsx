"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";

export interface RankedBarDatum {
  label: string;
  value: number;
  sublabel?: string;
}

// A plain enum instead of a formatter function: Server Components can't pass
// closures as props to Client Components across the RSC boundary, so the
// formatting choice is expressed as data and resolved locally.
export type RankedBarValueFormat = "count" | "rupee";

function formatValue(n: number, format: RankedBarValueFormat): string {
  return format === "rupee" ? `₹${n.toLocaleString("en-IN")}` : n.toLocaleString("en-IN");
}

function ChartTooltip({
  active,
  payload,
  format,
}: {
  active?: boolean;
  payload?: { payload: RankedBarDatum }[];
  format: RankedBarValueFormat;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-[var(--text-primary)]">{d.label}</p>
      <p className="text-[var(--text-secondary)]">{formatValue(d.value, format)}</p>
      {d.sublabel && <p className="text-[var(--text-muted)]">{d.sublabel}</p>}
    </div>
  );
}

export function RankedBarChart({
  data,
  format = "count",
  height,
}: {
  data: RankedBarDatum[];
  format?: RankedBarValueFormat;
  height?: number;
}) {
  const rowHeight = 34;
  const chartHeight = height ?? Math.max(120, data.length * rowHeight);

  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-[var(--text-muted)]">No data for the current filters.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 4 }} barCategoryGap={8}>
        <CartesianGrid horizontal={false} stroke="var(--grid-line)" />
        <XAxis type="number" tick={{ fill: "var(--text-muted)", fontSize: 11 }} stroke="var(--axis-line)" tickLine={false} />
        <YAxis
          type="category"
          dataKey="label"
          width={140}
          tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
          stroke="var(--axis-line)"
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<ChartTooltip format={format} />} cursor={{ fill: "var(--surface-2)" }} />
        <Bar dataKey="value" fill="var(--series-1)" radius={[0, 4, 4, 0]} maxBarSize={20}>
          <LabelList
            dataKey="value"
            position="right"
            formatter={(v: unknown) => (typeof v === "number" ? formatValue(v, format) : String(v ?? ""))}
            style={{ fill: "var(--text-secondary)", fontSize: 11 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

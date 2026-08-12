"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export interface TrendDatum {
  month: string;
  avgPricePerSqft: number;
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-[var(--text-primary)]">{label}</p>
      <p className="text-[var(--text-secondary)]">₹{payload[0].value.toLocaleString("en-IN")}/sqft avg</p>
    </div>
  );
}

export function TrendLineChart({ data }: { data: TrendDatum[] }) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-[var(--text-muted)]">Not enough price history yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 4 }}>
        <CartesianGrid vertical={false} stroke="var(--grid-line)" />
        <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} stroke="var(--axis-line)" tickLine={false} />
        <YAxis
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          stroke="var(--axis-line)"
          tickLine={false}
          axisLine={false}
          width={56}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--axis-line)", strokeDasharray: "3 3" }} />
        <Line
          type="monotone"
          dataKey="avgPricePerSqft"
          stroke="var(--series-1)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--series-1)" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

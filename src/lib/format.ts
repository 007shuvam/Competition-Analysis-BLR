export function formatLakh(value: number | null | undefined): string {
  if (value == null) return "—";
  if (value >= 100) return `₹${(value / 100).toFixed(2).replace(/\.00$/, "")} Cr`;
  return `₹${value.toFixed(0)} L`;
}

export function formatPriceRange(min: number | null | undefined, max: number | null | undefined): string {
  if (min == null && max == null) return "Price on request";
  if (min != null && max != null && min !== max) return `${formatLakh(min)} – ${formatLakh(max)}`;
  return formatLakh(min ?? max);
}

export function formatPricePerSqft(value: number | null | undefined): string {
  if (value == null) return "—";
  return `₹${Math.round(value).toLocaleString("en-IN")}/sqft`;
}

export function formatArea(min: number | null | undefined, max: number | null | undefined): string {
  if (min == null && max == null) return "—";
  if (min != null && max != null && min !== max) {
    return `${min.toLocaleString("en-IN")} – ${max.toLocaleString("en-IN")} sqft`;
  }
  return `${(min ?? max)?.toLocaleString("en-IN")} sqft`;
}

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: "Apartment",
  VILLA: "Villa",
  PLOTTED: "Plotted / Land",
  COMMERCIAL: "Commercial",
  MIXED_USE: "Mixed Use",
  ROW_HOUSE: "Row House",
};

const STATUS_LABELS: Record<string, string> = {
  NEW_LAUNCH: "New Launch",
  UNDER_CONSTRUCTION: "Under Construction",
  READY_TO_MOVE: "Ready to Move",
  RESALE: "Resale",
};

export function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("en-IN", { year: "numeric", month: "short" });
}

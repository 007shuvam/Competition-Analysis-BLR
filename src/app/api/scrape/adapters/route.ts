import { NextResponse } from "next/server";
import { listAdapters } from "@/lib/scrapers/registry";

export async function GET() {
  const adapters = listAdapters().map((a) => ({
    key: a.key,
    label: a.label,
    sourceName: a.sourceName,
    notes: a.notes,
    status: a.status,
  }));
  return NextResponse.json({ adapters });
}

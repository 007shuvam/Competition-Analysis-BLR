import { NextRequest, NextResponse } from "next/server";
import { runScraper } from "@/lib/scrapers/runner";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const adapterKey = body.adapterKey as string | undefined;
  if (!adapterKey) {
    return NextResponse.json({ error: "adapterKey is required" }, { status: 400 });
  }

  try {
    const result = await runScraper(adapterKey);
    return NextResponse.json(result, { status: result.status === "failed" ? 502 : 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

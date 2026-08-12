import { NextRequest, NextResponse } from "next/server";
import { getAnalytics } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  const zones = req.nextUrl.searchParams.getAll("zone").filter(Boolean);
  const types = req.nextUrl.searchParams.getAll("type").filter(Boolean);
  const data = await getAnalytics({ zones, types });
  return NextResponse.json(data);
}

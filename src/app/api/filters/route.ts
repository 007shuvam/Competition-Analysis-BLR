import { NextResponse } from "next/server";
import { getFilterOptions } from "@/lib/filter-options";

export async function GET() {
  const options = await getFilterOptions();
  return NextResponse.json(options);
}

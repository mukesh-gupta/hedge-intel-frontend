import { NextRequest, NextResponse } from "next/server";
import { backendFetch, BackendError } from "@/lib/backend";
import type { MarketDataResponse } from "@/lib/types";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") ?? "indices";
  const history = req.nextUrl.searchParams.get("history") ?? "true";

  try {
    const data = await backendFetch<MarketDataResponse>(
      `/api/market-data?category=${encodeURIComponent(category)}&history=${encodeURIComponent(history)}`,
      { revalidateSeconds: 20 }
    );
    return NextResponse.json(data);
  } catch (err) {
    const status = err instanceof BackendError ? err.status : 502;
    return NextResponse.json({ error: "Failed to reach backend" }, { status });
  }
}

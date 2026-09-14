import { NextRequest, NextResponse } from "next/server";
import { backendFetch, BackendError } from "@/lib/backend";
import type { SectorsResponse } from "@/lib/types";

export async function GET(req: NextRequest) {
  const timeframe = req.nextUrl.searchParams.get("timeframe") ?? "1D";

  try {
    const data = await backendFetch<SectorsResponse>(
      `/api/sectors?timeframe=${encodeURIComponent(timeframe)}`,
      { revalidateSeconds: 30 }
    );
    return NextResponse.json(data);
  } catch (err) {
    const status = err instanceof BackendError ? err.status : 502;
    return NextResponse.json({ error: "Failed to reach backend" }, { status });
  }
}

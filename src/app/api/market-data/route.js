import { NextResponse } from "next/server";
import { backendFetch, BackendError } from "@/lib/backend";
import { cachedJson } from "@/lib/route-response";

/** @import { NextRequest } from "next/server" */

/** @param {NextRequest} req */
export async function GET(req) {
  const category = req.nextUrl.searchParams.get("category") ?? "indices";
  const history = req.nextUrl.searchParams.get("history") ?? "true";

  try {
    const data = await backendFetch(
      `/api/market-data?category=${encodeURIComponent(category)}&history=${encodeURIComponent(history)}`,
      { revalidateSeconds: 30 }
    );
    return cachedJson(data, 30);
  } catch (err) {
    const status = err instanceof BackendError ? err.status : 502;
    return NextResponse.json({ error: "Failed to reach backend" }, { status });
  }
}

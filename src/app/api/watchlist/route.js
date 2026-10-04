import { NextResponse } from "next/server";
import { backendFetch, BackendError } from "@/lib/backend";

/** @import { NextRequest } from "next/server" */

export async function GET() {
  try {
    // No caching: this list is mutated by the same app (add/remove), so a
    // refetch right after a write must never see a stale cached response.
    const data = await backendFetch("/api/watchlist");
    return NextResponse.json(data);
  } catch (err) {
    const status = err instanceof BackendError ? err.status : 502;
    return NextResponse.json({ error: "Failed to reach backend" }, { status });
  }
}

/** @param {NextRequest} req */
export async function POST(req) {
  try {
    const body = await req.json();
    const data = await backendFetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return NextResponse.json(data);
  } catch (err) {
    const status = err instanceof BackendError ? err.status : 502;
    return NextResponse.json({ error: "Failed to reach backend" }, { status });
  }
}

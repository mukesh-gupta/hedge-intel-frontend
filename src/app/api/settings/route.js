import { NextResponse } from "next/server";
import { backendFetch, BackendError } from "@/lib/backend";

/** @import { NextRequest } from "next/server" */

export async function GET() {
  try {
    // No caching: settings are mutated by the same app (PATCH), so a refetch
    // right after a write must never see a stale cached response.
    const data = await backendFetch("/api/settings");
    return NextResponse.json(data);
  } catch (err) {
    const status = err instanceof BackendError ? err.status : 502;
    return NextResponse.json({ error: "Failed to reach backend" }, { status });
  }
}

/** @param {NextRequest} req */
export async function PATCH(req) {
  try {
    const body = await req.json();
    const data = await backendFetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return NextResponse.json(data);
  } catch (err) {
    const status = err instanceof BackendError ? err.status : 502;
    return NextResponse.json({ error: "Failed to reach backend" }, { status });
  }
}

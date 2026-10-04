import { NextResponse } from "next/server";
import { backendFetch, BackendError } from "@/lib/backend";

/** @import { NextRequest } from "next/server" */

/** @param {NextRequest} req */
export async function GET(req) {
  const days = req.nextUrl.searchParams.get("days") ?? "7";
  try {
    const data = await backendFetch(`/api/scorecard?days=${encodeURIComponent(days)}`, {
      revalidateSeconds: 60,
    });
    return NextResponse.json(data);
  } catch (err) {
    const status = err instanceof BackendError ? err.status : 502;
    return NextResponse.json({ error: "Failed to reach backend" }, { status });
  }
}

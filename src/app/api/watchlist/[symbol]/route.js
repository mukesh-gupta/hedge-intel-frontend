import { NextResponse } from "next/server";
import { backendFetch, BackendError } from "@/lib/backend";

/**
 * @param {Request} _req
 * @param {{ params: Promise<{ symbol: string }> }} context
 */
export async function DELETE(_req, { params }) {
  const { symbol } = await params;
  try {
    const data = await backendFetch(`/api/watchlist/${encodeURIComponent(symbol)}`, {
      method: "DELETE",
    });
    return NextResponse.json(data);
  } catch (err) {
    const status = err instanceof BackendError ? err.status : 502;
    return NextResponse.json({ error: "Failed to reach backend" }, { status });
  }
}

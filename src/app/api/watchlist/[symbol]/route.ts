import { NextResponse } from "next/server";
import { backendFetch, BackendError } from "@/lib/backend";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  try {
    const data = await backendFetch<unknown>(`/api/watchlist/${encodeURIComponent(symbol)}`, {
      method: "DELETE",
    });
    return NextResponse.json(data);
  } catch (err) {
    const status = err instanceof BackendError ? err.status : 502;
    return NextResponse.json({ error: "Failed to reach backend" }, { status });
  }
}

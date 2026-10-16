import { NextResponse } from "next/server";
import { backendFetch, BackendError } from "@/lib/backend";
import { cachedJson } from "@/lib/route-response";

export async function GET() {
  try {
    const data = await backendFetch("/api/signals", {
      revalidateSeconds: 30,
    });
    return cachedJson(data, 30);
  } catch (err) {
    const status = err instanceof BackendError ? err.status : 502;
    return NextResponse.json({ error: "Failed to reach backend" }, { status });
  }
}

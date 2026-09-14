import { NextResponse } from "next/server";
import { backendFetch, BackendError } from "@/lib/backend";
import type { ScanResponse } from "@/lib/types";

export async function POST() {
  try {
    const data = await backendFetch<ScanResponse>("/api/scan", {
      method: "POST",
    });
    return NextResponse.json(data);
  } catch (err) {
    const status = err instanceof BackendError ? err.status : 502;
    return NextResponse.json({ error: "Failed to reach backend" }, { status });
  }
}

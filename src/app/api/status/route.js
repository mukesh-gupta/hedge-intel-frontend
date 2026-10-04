import { NextResponse } from "next/server";
import { backendFetch, BackendError } from "@/lib/backend";

export async function GET() {
  try {
    const data = await backendFetch("/api/status", {
      revalidateSeconds: 15,
    });
    return NextResponse.json(data);
  } catch (err) {
    const status = err instanceof BackendError ? err.status : 502;
    return NextResponse.json({ error: "Failed to reach backend" }, { status });
  }
}

// Plain Node runtime, not Edge: Next.js 16 flags the Edge Runtime API for
// route handlers as deprecated, and Vercel's current Node function
// execution model (Fluid Compute) handles long-lived streaming responses
// fine now, unlike the older per-invocation model this constraint used to
// come from. maxDuration bounds how long any single connection can stay
// open — EventSource on the client reconnects automatically when it does,
// so a cutoff here just means a brief reconnect, not a broken feature.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BASE_URL = process.env.HEDGE_API_BASE_URL ?? "http://127.0.0.1:8000";

export async function GET() {
  const upstream = await fetch(`${BASE_URL}/api/watchlist/stream`, {
    headers: { Accept: "text/event-stream" },
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("Failed to reach backend stream", { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

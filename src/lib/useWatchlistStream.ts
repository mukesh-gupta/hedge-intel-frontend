"use client";

import { useEffect, useState } from "react";

interface LiveTick {
  price: number;
  t: number;
}

/**
 * Connects to /api/watchlist/stream (our Edge Function proxy to the
 * backend's Finnhub-backed SSE endpoint) and keeps a live map of
 * Finnhub-symbol -> latest tick. EventSource reconnects automatically on
 * its own after a drop (standard browser behavior), so no manual retry
 * logic is needed here — only cleanup on unmount.
 */
export function useWatchlistStream() {
  const [live, setLive] = useState<Record<string, LiveTick>>({});

  useEffect(() => {
    const source = new EventSource("/api/watchlist/stream");

    source.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data) as { symbol: string; price: number; t: number };
        setLive((prev) => ({ ...prev, [update.symbol]: { price: update.price, t: update.t } }));
      } catch {
        // ignore malformed/keepalive frames
      }
    };

    return () => source.close();
  }, []);

  return live;
}

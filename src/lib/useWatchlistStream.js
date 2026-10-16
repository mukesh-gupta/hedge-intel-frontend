"use client";

import { useEffect, useState } from "react";
import { DIRECT_READS, readUrl } from "./api-base";

/**
 * @typedef {Object} LiveTick
 * @property {number} price
 * @property {number} t
 */

/**
 * Connects to the backend's Finnhub-backed SSE endpoint and keeps a live map
 * of Finnhub-symbol -> latest tick.
 *
 * Only when reads go direct (NEXT_PUBLIC_HEDGE_API_BASE_URL is set). Relaying
 * the stream through a Vercel function kept one running around the clock for
 * every open tab, which on its own exceeded the Hobby plan's monthly function
 * time; without a public backend URL the watchlist relies on its polling.
 *
 * Actively closes the connection while the tab is hidden/backgrounded and
 * reopens it on return — an open SSE connection is itself a standing HTTP
 * request, which on a free hosting tier (e.g. Render's 750 free
 * instance-hours/month) would keep the backend "in use" and prevent it from
 * ever spinning down for as long as any tab is left open in the background.
 * Merely ignoring incoming messages while hidden wouldn't fix that — the
 * connection itself has to close.
 */
export function useWatchlistStream() {
  const [live, setLive] = useState(/** @type {Record<string, LiveTick>} */ ({}));

  useEffect(() => {
    if (!DIRECT_READS) return undefined;

    /** @type {EventSource | null} */
    let source = null;

    function connect() {
      source = new EventSource(readUrl("/api/watchlist/stream"));
      source.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          setLive((prev) => ({ ...prev, [update.symbol]: { price: update.price, t: update.t } }));
        } catch {
          // ignore malformed/keepalive frames
        }
      };
    }

    function disconnect() {
      source?.close();
      source = null;
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        if (!source) connect();
      } else {
        disconnect();
      }
    }

    if (document.visibilityState === "visible") connect();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      disconnect();
    };
  }, []);

  return live;
}

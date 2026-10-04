"use client";

import { useEffect, useState } from "react";

/**
 * @typedef {Object} LiveTick
 * @property {number} price
 * @property {number} t
 */

/**
 * Connects to /api/watchlist/stream (proxying the backend's Finnhub-backed
 * SSE endpoint) and keeps a live map of Finnhub-symbol -> latest tick.
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
    /** @type {EventSource | null} */
    let source = null;

    function connect() {
      source = new EventSource("/api/watchlist/stream");
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

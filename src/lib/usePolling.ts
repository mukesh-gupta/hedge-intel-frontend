"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getLiveStreamEnabled, subscribeLiveStream } from "./liveStreamStore";

interface PollingState<T> {
  data: T;
  error: string | null;
  loading: boolean;
  lastUpdated: Date | null;
}

/**
 * Polls a same-origin API route (our Next.js proxy, never the backend
 * directly) on an interval, starting from server-fetched initialData so the
 * first paint already has real data. Also exposes `refetch` for deliberate
 * user actions (e.g. right after a mutation) that shouldn't wait for the
 * next tick — and ignores the "live stream" pause toggle, since a manual
 * refresh is an explicit request, not scheduled polling.
 *
 * Pass `fetchImmediately: false` when the caller already has fresh
 * server-rendered data (via SSR) — skips the redundant duplicate request
 * that would otherwise fire the instant the component hydrates, and just
 * relies on the next scheduled interval tick to refresh it.
 */
export function usePolling<T>(
  url: string,
  intervalMs: number,
  initialData: T,
  { fetchImmediately = true }: { fetchImmediately?: boolean } = {}
) {
  const [state, setState] = useState<PollingState<T>>({
    data: initialData,
    error: null,
    loading: false,
    lastUpdated: null,
  });
  const inFlight = useRef(false);
  const liveEnabled = useRef(getLiveStreamEnabled());
  const urlRef = useRef(url);
  urlRef.current = url;

  useEffect(() => subscribeLiveStream((enabled) => (liveEnabled.current = enabled)), []);

  const fetchNow = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await fetch(urlRef.current, { cache: "no-store" });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data: T = await res.json();
      setState({ data, error: null, loading: false, lastUpdated: new Date() });
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "Unknown error",
        loading: false,
      }));
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    if (fetchImmediately) fetchNow();
    const id = setInterval(() => {
      if (liveEnabled.current) fetchNow();
    }, intervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, intervalMs, fetchImmediately]);

  return { ...state, refetch: fetchNow };
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useSignals } from "./SignalsProvider";
import { signalId } from "./signal-style";
import type { Signal } from "./types";

const STORAGE_KEY = "hedge-intel:last-seen-signal-id";

/**
 * Real notifications, not a decorative badge: reads the same shared
 * /api/signals data every other screen uses (via SignalsProvider) and
 * treats anything newer than the last id the user acknowledged as "unread".
 * trade_history is inserted newest-first by the backend, so "newer" just
 * means "appears before the last-seen id".
 */
export function useNotifications() {
  const { signals } = useSignals();
  const [lastSeenId, setLastSeenId] = useState<string | null | undefined>(undefined);

  // Read the persisted marker once, client-only.
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLastSeenId(localStorage.getItem(STORAGE_KEY));
    } catch {
      setLastSeenId(null);
    }
  }, []);

  const unread: Signal[] = useMemo(() => {
    if (lastSeenId === undefined) return []; // marker not loaded yet
    if (lastSeenId === null) return []; // first-ever visit: nothing "unread" yet
    const idx = signals.findIndex((s) => signalId(s) === lastSeenId);
    if (idx === -1) return []; // marker rolled off history — treat as caught up
    return signals.slice(0, idx);
  }, [signals, lastSeenId]);

  // First-ever visit: silently mark the current newest as the baseline so we
  // don't retroactively call all of existing history "new".
  useEffect(() => {
    if (lastSeenId === null && signals.length > 0) {
      const newestId = signalId(signals[0]);
      try {
        localStorage.setItem(STORAGE_KEY, newestId);
      } catch {
        // ignore
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLastSeenId(newestId);
    }
  }, [lastSeenId, signals]);

  function markAllRead() {
    if (signals.length === 0) return;
    const newestId = signalId(signals[0]);
    try {
      localStorage.setItem(STORAGE_KEY, newestId);
    } catch {
      // ignore
    }
    setLastSeenId(newestId);
  }

  return { signals, unread, unreadCount: unread.length, markAllRead };
}

"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "hedge-intel:starred-signals";

/** Client-only starring, persisted to localStorage. Per-device, not synced to a
 * backend — there is no starring concept in the API today. */
export function useStarred() {
  const [starred, setStarred] = useState<Set<string>>(new Set());

  // One-time hydration from browser-only storage after mount; SSR has no
  // access to localStorage, so this can't be a lazy useState initializer.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setStarred(new Set(JSON.parse(raw)));
    } catch {
      // ignore — starring is a convenience feature, not critical state
    }
  }, []);

  const toggle = useCallback((id: string) => {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return { starred, toggle };
}

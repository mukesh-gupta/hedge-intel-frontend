"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False on the server and during hydration, true from then on. For output that
 * depends on the browser (locale, timezone): rendering it only once this is true
 * keeps the server HTML and the hydration render identical, so React never sees
 * mismatched text. useSyncExternalStore does the switch in one re-render right
 * after hydration, without an effect and a state update per component.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}

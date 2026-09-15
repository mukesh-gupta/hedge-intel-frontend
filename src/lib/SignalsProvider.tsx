"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { usePolling } from "./usePolling";
import type { SignalsResponse, Signal } from "./types";

interface SignalsContextValue {
  signals: Signal[];
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

const SignalsContext = createContext<SignalsContextValue | null>(null);

/**
 * Single shared poll of /api/signals for the entire app. Every screen that
 * needs signals (Home, Signals list, Signal Details, Chat, Logs, the
 * notification bell) reads from this one instance instead of running its
 * own independent poll — otherwise different screens can legitimately show
 * different snapshots of the same data depending on when each one's own
 * timer last fired, which is exactly the "notification shows new news but
 * the dashboard still shows the old one" bug this fixes.
 */
export function SignalsProvider({
  initialData,
  children,
}: {
  initialData: SignalsResponse;
  children: ReactNode;
}) {
  const { data, refetch, lastUpdated } = usePolling<SignalsResponse>(
    "/api/signals",
    20_000,
    initialData,
    { fetchImmediately: initialData.signals.length === 0 }
  );

  const value = useMemo<SignalsContextValue>(
    () => ({ signals: data.signals ?? [], refetch, lastUpdated }),
    [data, refetch, lastUpdated]
  );

  return <SignalsContext.Provider value={value}>{children}</SignalsContext.Provider>;
}

export function useSignals(): SignalsContextValue {
  const ctx = useContext(SignalsContext);
  if (!ctx) throw new Error("useSignals() must be used within <SignalsProvider>");
  return ctx;
}

"use client";

import { usePolling } from "@/lib/usePolling";

/** @import { StatusResponse } from "@/lib/types" */

/** @type {Record<keyof StatusResponse, string>} */
const LABELS = {
  news_feed: "News Feed",
  market_data: "Market Data",
  ai_engine: "AI Engine",
  data_pipeline: "Data Pipeline",
};

/** @param {{ initialData: StatusResponse }} props */
export default function StatusDots({ initialData }) {
  const { data, error } = usePolling("/api/status", 15_000, initialData, {
    fetchImmediately: false,
  });

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-surface px-4 py-3">
      {/** @type {(keyof StatusResponse)[]} */ (Object.keys(LABELS)).map((key) => {
        const ok = data[key];
        return (
          <div key={key} className="flex items-center gap-2 text-sm">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                ok ? "bg-bullish shadow-[0_0_6px_var(--bullish)]" : "bg-bearish"
              }`}
            />

            <span className="text-muted">{LABELS[key]}</span>
          </div>
        );
      })}
      {error && <span className="text-xs text-bearish">connection issue</span>}
    </div>
  );
}

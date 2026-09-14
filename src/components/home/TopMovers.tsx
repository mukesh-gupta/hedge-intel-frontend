"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import { usePolling } from "@/lib/usePolling";
import type { WatchlistResponse } from "@/lib/types";

function parseChange(changePercent: string): number {
  return parseFloat(changePercent.replace("%", "")) || 0;
}

/** Real data from /api/watchlist — sorted by change% since the backend has no
 * dedicated "top movers" endpoint. Limited to whatever symbols are on the
 * shared watchlist, not the full market. */
export default function TopMovers({ initialData }: { initialData: WatchlistResponse }) {
  const { data } = usePolling<WatchlistResponse>("/api/watchlist", 20_000, initialData, {
    fetchImmediately: initialData.watchlist.length === 0,
  });

  const gainers = [...data.watchlist]
    .sort((a, b) => parseChange(b.change_percent) - parseChange(a.change_percent))
    .slice(0, 5);

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted">Top Movers (Watchlist)</h2>
        <Link href="/watchlist" className="text-xs text-accent">
          View All
        </Link>
      </div>
      {gainers.length === 0 ? (
        <p className="text-sm text-muted">Your watchlist is empty.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {gainers.map((t) => {
            const negative = parseChange(t.change_percent) < 0;
            return (
              <div key={t.symbol} className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{t.label}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-muted">
                    {t.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`flex items-center gap-1 text-xs font-semibold ${
                      negative ? "text-bearish" : "text-bullish"
                    }`}
                  >
                    {negative ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                    {t.change_percent}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

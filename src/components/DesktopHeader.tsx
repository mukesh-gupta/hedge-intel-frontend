"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { usePolling } from "@/lib/usePolling";
import type { TickerBarResponse } from "@/lib/types";
import LiveClock from "@/components/ui/LiveClock";
import NotificationBell from "@/components/NotificationBell";

function isNegative(changePercent: string) {
  return changePercent.trim().startsWith("-");
}

export default function DesktopHeader({ initialTicker }: { initialTicker: TickerBarResponse }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { data: ticker } = usePolling<TickerBarResponse>(
    "/api/ticker-bar",
    20_000,
    initialTicker,
    { fetchImmediately: initialTicker.ticker_bar.length === 0 }
  );

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/signals?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="sticky top-0 z-20 hidden items-center gap-6 border-b border-border bg-background/95 px-6 py-3 backdrop-blur lg:flex">
      <form onSubmit={onSearch} className="w-72">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5">
          <Search size={15} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search signals by headline, sector, or ticker…"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
          />
        </div>
      </form>

      <div className="flex flex-1 items-center gap-5 overflow-x-auto">
        {ticker.ticker_bar.map((row) => {
          const negative = isNegative(row.data.change_percent);
          return (
            <div key={row.symbol} className="flex shrink-0 items-baseline gap-1.5 text-xs">
              <span className="font-semibold text-muted">{row.label}</span>
              <span className="font-mono text-foreground">
                {row.data.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
              <span
                className={`flex items-center gap-0.5 font-semibold ${
                  negative ? "text-bearish" : "text-bullish"
                }`}
              >
                {negative ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
                {row.data.change_percent}
              </span>
            </div>
          );
        })}
      </div>

      <LiveClock className="shrink-0 text-xs text-muted" />
      <NotificationBell className="shrink-0" />
    </header>
  );
}

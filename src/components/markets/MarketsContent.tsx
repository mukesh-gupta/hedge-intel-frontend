"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { usePolling } from "@/lib/usePolling";
import { hasTickerData, type TickerBarResponse, type MarketDataResponse, type SectorsResponse } from "@/lib/types";
import { MARKET_TABS, MARKET_DATA_CATEGORY, type MarketCategory } from "@/lib/market-categories";
import Sparkline from "@/components/ui/Sparkline";

function isNegative(changePercent: string | number) {
  return String(changePercent).trim().startsWith("-");
}

const SECTOR_TIMEFRAMES = ["1D", "1W", "1M", "1Y"] as const;

function CategoryPanel({
  category,
  initialData,
}: {
  category: Exclude<MarketCategory, "Crypto" | "Sectors">;
  initialData: MarketDataResponse;
}) {
  const dataCategory = MARKET_DATA_CATEGORY[category];
  const { data, loading, error } = usePolling<MarketDataResponse>(
    `/api/market-data?category=${dataCategory}&history=true`,
    20_000,
    initialData,
    { fetchImmediately: initialData.assets.length === 0 }
  );

  if (error && data.assets.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">Couldn&apos;t reach the backend for this category.</p>;
  }
  if (loading && data.assets.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">Loading…</p>;
  }
  if (data.assets.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">No data for this category.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {data.assets.map((row) => {
        const negative = isNegative(row.change_percent);
        return (
          <div
            key={row.symbol}
            className="flex items-center justify-between rounded-lg border border-border bg-surface p-3"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">{row.label}</p>
              <p className="text-[11px] text-muted">
                RSI {row.rsi.toFixed(1)} · as of {row.as_of}
              </p>
            </div>
            {row.history && <Sparkline data={row.history} positive={!negative} />}
            <div className="text-right">
              <p className="font-mono text-sm font-semibold text-foreground">
                {row.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              <p
                className={`flex items-center justify-end gap-1 text-xs font-semibold ${
                  negative ? "text-bearish" : "text-bullish"
                }`}
              >
                {negative ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                {row.change_percent}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CryptoPanel({ initialTicker }: { initialTicker: TickerBarResponse }) {
  const { data } = usePolling<TickerBarResponse>("/api/ticker-bar", 20_000, initialTicker, {
    fetchImmediately: initialTicker.ticker_bar.length === 0,
  });
  const rows = data.ticker_bar.filter((t) => t.symbol === "BTC-USD").filter(hasTickerData);

  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">No crypto data available.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => {
        const negative = isNegative(row.data.change_percent);
        return (
          <div
            key={row.symbol}
            className="flex items-center justify-between rounded-lg border border-border bg-surface p-3"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">{row.label}</p>
              <p className="text-[11px] text-muted">
                RSI {row.data.rsi.toFixed(1)} · as of {row.data.as_of}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-semibold text-foreground">
                {row.data.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              <p
                className={`flex items-center justify-end gap-1 text-xs font-semibold ${
                  negative ? "text-bearish" : "text-bullish"
                }`}
              >
                {negative ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                {row.data.change_percent}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SectorsPanel({ initialSectorsData }: { initialSectorsData: SectorsResponse | null }) {
  const [timeframe, setTimeframe] = useState<(typeof SECTOR_TIMEFRAMES)[number]>("1D");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {SECTOR_TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition ${
              timeframe === tf
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted"
            }`}
          >
            {tf}
          </button>
        ))}
      </div>
      <SectorsList
        key={timeframe}
        timeframe={timeframe}
        initialData={timeframe === "1D" ? initialSectorsData : null}
      />
    </div>
  );
}

function SectorsList({
  timeframe,
  initialData,
}: {
  timeframe: string;
  initialData: SectorsResponse | null;
}) {
  const seed = initialData ?? { timeframe, sectors: [] };
  const { data, loading } = usePolling<SectorsResponse>(
    `/api/sectors?timeframe=${timeframe}`,
    30_000,
    seed,
    { fetchImmediately: seed.sectors.length === 0 }
  );

  if (loading && data.sectors.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">Loading…</p>;
  }
  if (data.sectors.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">No sector data available.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {data.sectors.map((s) => {
        const negative = s.change_percent < 0;
        return (
          <div key={s.sector} className="rounded-lg border border-border bg-surface p-3">
            <p className="text-xs font-semibold text-foreground">{s.sector}</p>
            <p className={`mt-1 text-sm font-bold ${negative ? "text-bearish" : "text-bullish"}`}>
              {negative ? "" : "+"}
              {s.change_percent.toFixed(2)}%
            </p>
            <p className="mt-1 text-[11px] text-muted">
              {s.signal_count} signal{s.signal_count === 1 ? "" : "s"}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default function MarketsContent({
  initialTicker,
  initialTab,
  initialCategoryData,
  initialSectorsData,
}: {
  initialTicker: TickerBarResponse;
  initialTab?: string;
  initialCategoryData: MarketDataResponse | null;
  initialSectorsData: SectorsResponse | null;
}) {
  const resolvedInitialTab = MARKET_TABS.includes(initialTab as MarketCategory)
    ? (initialTab as MarketCategory)
    : "Indices";
  const [tab, setTab] = useState<MarketCategory>(resolvedInitialTab);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 py-4 lg:max-w-4xl">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {MARKET_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              tab === t
                ? "border-accent bg-accent text-background"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Sectors" ? (
        <SectorsPanel initialSectorsData={initialSectorsData} />
      ) : tab === "Crypto" ? (
        <CryptoPanel initialTicker={initialTicker} />
      ) : (
        <CategoryPanel
          key={tab}
          category={tab}
          initialData={
            tab === resolvedInitialTab && initialCategoryData
              ? initialCategoryData
              : { category: MARKET_DATA_CATEGORY[tab], assets: [] }
          }
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { usePolling } from "@/lib/usePolling";
import { hasTickerData } from "@/lib/types";
import { MARKET_TABS, MARKET_DATA_CATEGORY, resolveMarketTab } from "@/lib/market-categories";
import Sparkline from "@/components/ui/Sparkline";
import { formatNumber } from "@/lib/format";

/** @import { TickerBarResponse, MarketDataResponse, SectorsResponse } from "@/lib/types" */
/** @import { MarketCategory } from "@/lib/market-categories" */

/** @param {string | number} changePercent */
function isNegative(changePercent) {
  return String(changePercent).trim().startsWith("-");
}

const SECTOR_TIMEFRAMES = ["1D", "1W", "1M", "1Y"];

/**
 * @param {Object} props
 * @param {Exclude<MarketCategory, "Crypto" | "Sectors">} props.category
 * @param {MarketDataResponse} props.initialData
 */
function CategoryPanel({ category, initialData }) {
  const dataCategory = MARKET_DATA_CATEGORY[category];
  const { data, loading, error } = usePolling(
    `/api/market-data?category=${dataCategory}&history=true`,
    20_000,
    initialData,
    { fetchImmediately: initialData.assets.length === 0 }
  );

  if (error && data.assets.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        Couldn&apos;t reach the backend for this category.
      </p>
    );
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
                {formatNumber(row.price)}
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

/** @param {{ initialTicker: TickerBarResponse }} props */
function CryptoPanel({ initialTicker }) {
  const { data } = usePolling("/api/ticker-bar", 20_000, initialTicker, {
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
                {formatNumber(row.data.price)}
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

/** @param {{ initialSectorsData: SectorsResponse | null }} props */
function SectorsPanel({ initialSectorsData }) {
  const [timeframe, setTimeframe] = useState("1D");

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

/** @param {{ timeframe: string; initialData: SectorsResponse | null; }} props */
function SectorsList({ timeframe, initialData }) {
  const seed = initialData ?? { timeframe, sectors: [] };
  const { data, loading } = usePolling(`/api/sectors?timeframe=${timeframe}`, 30_000, seed, {
    fetchImmediately: seed.sectors.length === 0,
  });

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

/**
 * @param {Object} props
 * @param {TickerBarResponse} props.initialTicker
 * @param {string} [props.initialTab]
 * @param {MarketDataResponse | null} props.initialCategoryData
 * @param {SectorsResponse | null} props.initialSectorsData
 */
export default function MarketsContent({
  initialTicker,
  initialTab,
  initialCategoryData,
  initialSectorsData,
}) {
  const resolvedInitialTab = resolveMarketTab(initialTab);
  const [tab, setTab] = useState(resolvedInitialTab);

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

"use client";

import Link from "next/link";
import { ChevronRight, ExternalLink, Star, TrendingUp, TrendingDown } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import { usePolling } from "@/lib/usePolling";
import { useSignals } from "@/lib/SignalsProvider";
import type {
  Signal,
  SignalsResponse,
  MarketDataResponse,
  MarketRegimeResponse,
  SectorsResponse,
  WatchlistResponse,
} from "@/lib/types";
import { sentimentStyle, signalId } from "@/lib/signal-style";
import { aggregateSentiment } from "@/lib/sentiment-aggregate";
import { useStarred } from "@/lib/useStarred";
import { TickerChip } from "@/components/ui/Badge";
import Sparkline from "@/components/ui/Sparkline";
import LiveClock from "@/components/ui/LiveClock";
import TopMovers from "./TopMovers";
import AIFeedPreview from "./AIFeedPreview";

function isNegative(changePercent: string) {
  return changePercent.trim().startsWith("-");
}

function IndexRow({
  initialIndices,
  initialForex,
}: {
  initialIndices: MarketDataResponse;
  initialForex: MarketDataResponse;
}) {
  const { data: indices } = usePolling<MarketDataResponse>(
    "/api/market-data?category=indices&history=true",
    20_000,
    initialIndices,
    { fetchImmediately: false }
  );
  const { data: forex } = usePolling<MarketDataResponse>(
    "/api/market-data?category=forex&history=true",
    20_000,
    initialForex,
    { fetchImmediately: false }
  );

  const rows = [
    ...indices.assets.filter((a) => ["^GSPC", "^IXIC", "^DJI"].includes(a.symbol)),
    ...forex.assets.filter((a) => a.symbol === "DX-Y.NYB"),
  ];

  if (rows.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto lg:hidden">
      {rows.map((row) => {
        const negative = isNegative(row.change_percent);
        return (
          <div
            key={row.symbol}
            className="flex flex-1 flex-col gap-1 rounded-lg border border-border bg-surface p-3"
          >
            <span className="text-xs font-semibold text-muted">{row.label}</span>
            <span className="font-mono text-sm font-semibold text-foreground">
              {row.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
            <div className="flex items-center justify-between gap-1">
              <span
                className={`flex items-center gap-1 text-xs font-semibold ${
                  negative ? "text-bearish" : "text-bullish"
                }`}
              >
                {negative ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                {row.change_percent}
              </span>
              {row.history && (
                <Sparkline data={row.history} width={40} height={16} positive={!negative} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LatestSignalCard({ signal }: { signal: Signal }) {
  const { starred, toggle } = useStarred();
  const style = sentimentStyle(signal.Sentiment);
  const id = signalId(signal);
  const isStarred = starred.has(id);
  const primaryAssets = signal["Buy Tickers"]
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const hedgeAssets = signal["Sell Tickers"]
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className={`rounded-xl border ${style.border} bg-surface p-4 lg:col-span-2`}>
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold ${style.border} ${style.bg} ${style.text}`}
        >
          <Star size={12} /> {style.label}
        </span>
        <span className="text-xs text-muted">{signal.Timestamp}</span>
      </div>

      <h2 className="mt-2 text-base font-semibold text-foreground">{signal.Headline}</h2>
      <p className="mt-1 line-clamp-2 text-sm text-muted">{signal["Execution Blueprint"]}</p>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs">
        <div>
          <p className="mb-1 text-muted">Target Sector</p>
          <TickerChip symbol={signal.Sector} />
        </div>
        {primaryAssets.length > 0 && (
          <div>
            <p className="mb-1 text-muted">Primary Assets</p>
            <div className="flex flex-wrap gap-1">
              {primaryAssets.map((t) => (
                <TickerChip key={t} symbol={t} />
              ))}
            </div>
          </div>
        )}
        {hedgeAssets.length > 0 && (
          <div>
            <p className="mb-1 text-muted">Hedge / Short</p>
            <div className="flex flex-wrap gap-1">
              {hedgeAssets.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-md border border-bearish/40 bg-bearish/10 px-2 py-0.5 text-[11px] font-semibold font-mono text-bearish"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Link
          href={`/signals/${id}`}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-accent/40 bg-accent/10 py-2 text-sm font-semibold text-accent transition hover:bg-accent/20"
        >
          View Details <ChevronRight size={16} />
        </Link>
        <button
          onClick={() => toggle(id)}
          aria-label="Star signal"
          className={`rounded-lg border border-border p-2.5 ${
            isStarred ? "text-neutral" : "text-muted hover:text-foreground"
          }`}
        >
          <Star size={16} fill={isStarred ? "currentColor" : "none"} />
        </button>
        <a
          href={signal["Article Link"]}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-border p-2.5 text-muted hover:text-foreground"
          aria-label="Open source"
        >
          <ExternalLink size={16} />
        </a>
      </div>
    </div>
  );
}

function MarketRegimeCard({ initialRegime }: { initialRegime: MarketRegimeResponse | null }) {
  const { data: regime } = usePolling<MarketRegimeResponse | null>(
    "/api/market-regime",
    20_000,
    initialRegime,
    { fetchImmediately: initialRegime === null }
  );
  if (!regime) return null;

  const color =
    regime.regime === "Risk-On"
      ? "text-bullish"
      : regime.regime === "Risk-Off"
        ? "text-bearish"
        : "text-neutral";

  return (
    <Link
      href="/markets"
      className="flex items-center justify-between rounded-xl border border-border bg-surface p-4"
    >
      <div>
        <p className="text-xs font-semibold text-muted">Market Regime</p>
        <p className={`mt-0.5 text-base font-bold ${color}`}>{regime.regime}</p>
        <p className="mt-0.5 text-[11px] text-muted">
          {regime.bullish} bullish vs {regime.bearish} bearish signals (score {regime.score})
        </p>
      </div>
      <ChevronRight size={18} className="text-muted" />
    </Link>
  );
}

function SectorHeatmap({ initialSectors }: { initialSectors: SectorsResponse }) {
  const { data } = usePolling<SectorsResponse>(
    "/api/sectors?timeframe=1D",
    30_000,
    initialSectors,
    { fetchImmediately: initialSectors.sectors.length === 0 }
  );
  const tiles = data.sectors.slice(0, 6);
  if (tiles.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted">Sector Heatmap (1D)</h2>
        <Link href="/markets?tab=Sectors" className="text-xs text-accent">
          View All
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {tiles.map((s) => {
          const negative = s.change_percent < 0;
          return (
            <div
              key={s.sector}
              className={`rounded-lg border p-2.5 ${
                negative ? "border-bearish/30 bg-bearish/10" : "border-bullish/30 bg-bullish/10"
              }`}
            >
              <p className="truncate text-[11px] font-semibold text-foreground">{s.sector}</p>
              <p className={`mt-0.5 text-sm font-bold ${negative ? "text-bearish" : "text-bullish"}`}>
                {negative ? "" : "+"}
                {s.change_percent.toFixed(2)}%
              </p>
              <p className="text-[10px] text-muted">
                {s.signal_count} signal{s.signal_count === 1 ? "" : "s"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SentimentOverviewCard({ signals }: { signals: SignalsResponse["signals"] }) {
  const overview = aggregateSentiment(signals);
  if (!overview) return null;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="mb-3 text-xs font-semibold text-muted">
        Sentiment Overview <span className="text-muted/70">({overview.total} signals)</span>
      </p>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-lg font-bold text-bullish">{overview.bullishPct}%</p>
          <p className="text-[11px] text-muted">Bullish</p>
        </div>
        <div>
          <p className="text-lg font-bold text-bearish">{overview.bearishPct}%</p>
          <p className="text-[11px] text-muted">Bearish</p>
        </div>
        <div>
          <p className="text-lg font-bold text-neutral">{overview.neutralPct}%</p>
          <p className="text-[11px] text-muted">Neutral</p>
        </div>
      </div>
      <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="bg-bullish" style={{ width: `${overview.bullishPct}%` }} />
        <div className="bg-bearish" style={{ width: `${overview.bearishPct}%` }} />
        <div className="bg-neutral" style={{ width: `${overview.neutralPct}%` }} />
      </div>
    </div>
  );
}

function RecentSignalsCard({ signals }: { signals: Signal[] }) {
  if (signals.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted">Live Signal Feed</h2>
        <Link href="/signals" className="text-xs text-accent">
          View All
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {signals.map((s, i) => {
          const style = sentimentStyle(s.Sentiment);
          return (
            <Link
              key={`${signalId(s)}-${i}`}
              href={`/signals/${signalId(s)}`}
              className="flex items-start gap-2"
            >
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{s.Headline}</p>
                <p className="text-[11px] text-muted">
                  {s.Timestamp} · {s.Sector}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function HomeContent({
  initialIndices,
  initialForex,
  initialRegime,
  initialSectors,
  initialWatchlist,
}: {
  initialIndices: MarketDataResponse;
  initialForex: MarketDataResponse;
  initialRegime: MarketRegimeResponse | null;
  initialSectors: SectorsResponse;
  initialWatchlist: WatchlistResponse;
}) {
  const { signals } = useSignals();

  const topSignal = signals[0];
  const recentSignals = signals.slice(0, 4);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-4 lg:max-w-7xl lg:gap-5 lg:px-8">
      <div className="flex items-center justify-between lg:hidden">
        <div>
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-foreground">GLOBAL MACRO </span>
            <span className="text-accent">TERMINAL</span>
          </h1>
          <p className="text-xs text-muted">AI-Powered Market Intelligence</p>
        </div>
        <NotificationBell />
      </div>

      <div className="flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-bullish" />
        <span className="text-xs font-semibold text-bullish">LIVE</span>
        <LiveClock className="text-xs text-muted" />
      </div>

      <IndexRow initialIndices={initialIndices} initialForex={initialForex} />

      {topSignal ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <LatestSignalCard signal={topSignal} />
          <MarketRegimeCard initialRegime={initialRegime} />
          <SectorHeatmap initialSectors={initialSectors} />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
          No signals generated yet — trigger a scan from the More tab.
        </div>
      )}

      <SentimentOverviewCard signals={signals} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TopMovers initialData={initialWatchlist} />
        <RecentSignalsCard signals={recentSignals} />
        <AIFeedPreview signals={signals} />
      </div>
    </div>
  );
}

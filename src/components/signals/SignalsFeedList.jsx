"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { useSignals } from "@/lib/SignalsProvider";
import {
  sentimentStyle,
  signalId,
  impactStyle,
  isQuickSignal,
  signalTickers,
} from "@/lib/signal-style";
import { useStarred } from "@/lib/useStarred";
import {
  useSignalFilters,
  matchesFilters,
  DEFAULT_FILTERS,
  SENTIMENT_FILTERS,
  IMPACT_FILTERS,
  ANALYSIS_FILTERS,
  REGION_ORDER,
} from "@/lib/useSignalFilters";
import Badge, { TickerChip } from "@/components/ui/Badge";
import LocalTime from "@/components/ui/LocalTime";

/** @import { ReactNode } from "react" */

// The feed holds up to 2,000 signals; rendering every card at once makes the page
// sluggish, so it grows a page at a time.
const PAGE_SIZE = 100;

/** @param {{ label?: string; children: ReactNode }} props */
function FilterRow({ label, children }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {label && (
        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-muted">
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

/** @param {{ active: boolean; onClick: () => void; children: ReactNode; }} props */
function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-accent bg-accent text-background"
          : "border-border text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

/** @param {{ initialQuery?: string }} props */
export default function SignalsFeedList({ initialQuery = "" }) {
  const { signals: allSignals } = useSignals();
  const { filters, update } = useSignalFilters();
  const [limit, setLimit] = useState(PAGE_SIZE);
  const { starred, toggle } = useStarred();
  const query = initialQuery.trim().toLowerCase();

  /** @param {Parameters<typeof update>[0]} patch */
  function setFilter(patch) {
    update(patch);
    setLimit(PAGE_SIZE);
  }

  const regions = useMemo(() => {
    const present = new Set(allSignals.map((s) => s.Region).filter(Boolean));
    return REGION_ORDER.filter((r) => present.has(r));
  }, [allSignals]);

  const signals = useMemo(() => {
    let all = allSignals.filter((s) => matchesFilters(s, filters));
    if (query) {
      all = all.filter((s) =>
        [s.Headline, s.Sector, s["Buy Tickers"], s["Sell Tickers"], s.Tickers ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    }
    return all;
  }, [allSignals, filters, query]);

  const filtersChanged = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 py-4 lg:max-w-4xl">
      {query && (
        <p className="text-xs text-muted">
          Showing results for <span className="font-semibold text-foreground">“{query}”</span>
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <FilterRow>
          {SENTIMENT_FILTERS.map((f) => (
            <FilterChip
              key={f}
              active={filters.sentiment === f}
              onClick={() => setFilter({ sentiment: f })}
            >
              {f}
            </FilterChip>
          ))}
        </FilterRow>
        <FilterRow label="Impact">
          {IMPACT_FILTERS.map((min) => (
            <FilterChip
              key={min}
              active={filters.minImpact === min}
              onClick={() => setFilter({ minImpact: min })}
            >
              {min === 0 ? "Any" : `${min}+`}
            </FilterChip>
          ))}
          <span className="ml-2 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Type
          </span>
          {ANALYSIS_FILTERS.map((a) => (
            <FilterChip
              key={a}
              active={filters.analysis === a}
              onClick={() => setFilter({ analysis: a })}
            >
              {a}
            </FilterChip>
          ))}
        </FilterRow>
        {regions.length > 0 && (
          <FilterRow label="Market">
            {["All", ...regions].map((r) => (
              <FilterChip
                key={r}
                active={filters.region === r}
                onClick={() => setFilter({ region: r })}
              >
                {r}
              </FilterChip>
            ))}
          </FilterRow>
        )}
      </div>

      <p className="flex items-center justify-between text-xs text-muted">
        <span>
          {signals.length} of {allSignals.length} signals
        </span>
        {filtersChanged && (
          <button
            onClick={() => setFilter(DEFAULT_FILTERS)}
            className="text-accent hover:underline"
          >
            Reset filters
          </button>
        )}
      </p>

      {signals.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">No signals match these filters yet.</p>
      ) : (
        signals.slice(0, limit).map((s, i) => {
          const style = sentimentStyle(s.Sentiment);
          const id = signalId(s);
          const isStarred = starred.has(id);
          const tickers = signalTickers(s);

          return (
            <div key={`${id}-${i}`} className="rounded-xl border border-border bg-surface p-3.5">
              <div className="flex items-start justify-between gap-2">
                <LocalTime timestamp={s.Timestamp} className="text-xs text-muted" />
                <button
                  onClick={() => toggle(id)}
                  aria-label="Star signal"
                  className={isStarred ? "text-neutral" : "text-muted hover:text-foreground"}
                >
                  <Star size={16} fill={isStarred ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold ${style.border} ${style.bg} ${style.text}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                  {style.label}
                </span>
                {s.Impact != null && (
                  <Badge className={impactStyle(s.Impact)}>Impact {s.Impact}</Badge>
                )}
                {s.Region && <Badge className="border-border text-muted">{s.Region}</Badge>}
                {isQuickSignal(s) && (
                  <Badge className="border-dashed border-border text-muted">Quick</Badge>
                )}
              </div>

              <Link href={`/signals/${id}`}>
                <h3 className="mt-1.5 text-sm font-semibold text-foreground hover:underline">
                  {s.Headline}
                </h3>
              </Link>

              <div className="mt-2 flex flex-wrap gap-1.5">
                <TickerChip symbol={s.Sector} />
                {tickers.slice(0, 3).map((t) => (
                  <TickerChip key={t} symbol={t} />
                ))}
              </div>
            </div>
          );
        })
      )}

      {signals.length > limit && (
        <button
          onClick={() => setLimit((n) => n + PAGE_SIZE)}
          className="rounded-lg border border-border py-2 text-sm font-semibold text-muted transition hover:text-foreground"
        >
          Show more ({signals.length - limit} remaining)
        </button>
      )}
    </div>
  );
}

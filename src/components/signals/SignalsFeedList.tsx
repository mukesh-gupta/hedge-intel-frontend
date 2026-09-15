"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { useSignals } from "@/lib/SignalsProvider";
import { sentimentStyle, signalId, formatSignalTime } from "@/lib/signal-style";
import { useStarred } from "@/lib/useStarred";
import { TickerChip } from "@/components/ui/Badge";

const FILTERS = ["All", "Bullish", "Bearish", "Strong"] as const;

export default function SignalsFeedList({ initialQuery = "" }: { initialQuery?: string }) {
  const { signals: allSignals } = useSignals();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const { starred, toggle } = useStarred();
  const query = initialQuery.trim().toLowerCase();

  const signals = useMemo(() => {
    let all = allSignals;
    if (filter === "Strong") all = all.filter((s) => s.Sentiment.toUpperCase().includes("STRONG"));
    else if (filter !== "All")
      all = all.filter((s) => s.Sentiment.toUpperCase().includes(filter.toUpperCase()));

    if (query) {
      all = all.filter((s) =>
        [s.Headline, s.Sector, s["Buy Tickers"], s["Sell Tickers"]]
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    }
    return all;
  }, [allSignals, filter, query]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 py-4 lg:max-w-4xl">
      {query && (
        <p className="text-xs text-muted">
          Showing results for <span className="font-semibold text-foreground">“{query}”</span>
        </p>
      )}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              filter === f
                ? "border-accent bg-accent text-background"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {signals.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">No signals match this filter yet.</p>
      ) : (
        signals.map((s, i) => {
          const style = sentimentStyle(s.Sentiment);
          const id = signalId(s);
          const isStarred = starred.has(id);
          const tickers = [
            ...s["Buy Tickers"].split(",").map((t) => t.trim()),
            ...s["Sell Tickers"].split(",").map((t) => t.trim()),
          ].filter(Boolean);

          return (
            <div
              key={`${id}-${i}`}
              className="rounded-xl border border-border bg-surface p-3.5"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs text-muted">{formatSignalTime(s.Timestamp)}</span>
                <button
                  onClick={() => toggle(id)}
                  aria-label="Star signal"
                  className={isStarred ? "text-neutral" : "text-muted hover:text-foreground"}
                >
                  <Star size={16} fill={isStarred ? "currentColor" : "none"} />
                </button>
              </div>

              <span
                className={`mt-1.5 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold ${style.border} ${style.bg} ${style.text}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                {style.label}
              </span>

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
    </div>
  );
}

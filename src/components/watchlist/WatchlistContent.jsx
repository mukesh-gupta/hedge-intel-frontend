"use client";

import { useState } from "react";
import { Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { usePolling } from "@/lib/usePolling";
import { useWatchlistStream } from "@/lib/useWatchlistStream";
import { toFinnhubSymbol, liveChangePercent } from "@/lib/finnhub-symbol";
import { formatNumber } from "@/lib/format";

/** @import { WatchlistResponse } from "@/lib/types" */

/** @param {string} changePercent */
function isNegative(changePercent) {
  return changePercent.trim().startsWith("-");
}

/** @param {{ initialData: WatchlistResponse }} props */
export default function WatchlistContent({ initialData }) {
  const { data, error, refetch } = usePolling("/api/watchlist", 15_000, initialData, {
    fetchImmediately: initialData.watchlist.length === 0,
  });
  const live = useWatchlistStream();
  const [symbol, setSymbol] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [removing, setRemoving] = useState(/** @type {string | null} */ (null));
  const [formError, setFormError] = useState(/** @type {string | null} */ (null));

  /** @param {React.FormEvent} e */
  async function addSymbol(e) {
    e.preventDefault();
    const trimmed = symbol.trim().toUpperCase();
    if (!trimmed) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: trimmed, label: trimmed }),
      });
      if (!res.ok) throw new Error(`Failed to add ${trimmed} (${res.status})`);
      setSymbol("");
      await refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add symbol");
    } finally {
      setSubmitting(false);
    }
  }

  /** @param {string} sym */
  async function removeSymbol(sym) {
    setRemoving(sym);
    try {
      await fetch(`/api/watchlist/${encodeURIComponent(sym)}`, { method: "DELETE" });
      await refetch();
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-4 lg:max-w-3xl">
      <form onSubmit={addSymbol} className="flex gap-2">
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Add ticker (e.g. TSM)"
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
        />

        <button
          type="submit"
          disabled={submitting || !symbol.trim()}
          className="flex items-center gap-1 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm font-semibold text-accent transition hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={16} />
          Add
        </button>
      </form>
      {formError && <p className="text-xs text-bearish">{formError}</p>}
      {error && data.watchlist.length === 0 && (
        <p className="text-xs text-bearish">Couldn&apos;t reach the backend.</p>
      )}

      {data.watchlist.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          Your watchlist is empty — add a ticker above.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {data.watchlist.map((t) => {
            const finnhubSymbol = toFinnhubSymbol(t.symbol);
            const tick = finnhubSymbol ? live[finnhubSymbol] : undefined;
            const price = tick?.price ?? t.price;
            const changePercent = tick
              ? liveChangePercent(t.price, t.change_percent, tick.price)
              : t.change_percent;
            const negative = isNegative(changePercent);

            return (
              <div
                key={t.symbol}
                className="flex items-center justify-between rounded-lg border border-border bg-surface p-3"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-foreground">{t.label}</p>
                    {tick && (
                      <span
                        className="h-1.5 w-1.5 animate-pulse rounded-full bg-bullish"
                        title="Live"
                      />
                    )}
                  </div>
                  {t.rsi !== undefined && (
                    <p className="text-[11px] text-muted">RSI {t.rsi.toFixed(1)}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold text-foreground">
                      {formatNumber(price)}
                    </p>
                    <p
                      className={`flex items-center justify-end gap-1 text-xs font-semibold ${
                        negative ? "text-bearish" : "text-bullish"
                      }`}
                    >
                      {negative ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                      {changePercent}
                    </p>
                  </div>
                  <button
                    onClick={() => removeSymbol(t.symbol)}
                    disabled={removing === t.symbol}
                    aria-label={`Remove ${t.symbol}`}
                    className="text-muted hover:text-bearish disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import type { Signal } from "./types";

export interface SentimentOverview {
  bullishPct: number;
  bearishPct: number;
  neutralPct: number;
  total: number;
}

/** Aggregated directly from real Signal.Sentiment values — no fabricated numbers. */
export function aggregateSentiment(signals: Signal[]): SentimentOverview | null {
  if (signals.length === 0) return null;

  let bullish = 0;
  let bearish = 0;
  for (const s of signals) {
    const sentiment = s.Sentiment.toUpperCase();
    if (sentiment.includes("BULLISH")) bullish += 1;
    else if (sentiment.includes("BEARISH")) bearish += 1;
  }
  const total = signals.length;
  const neutral = total - bullish - bearish;

  return {
    bullishPct: Math.round((bullish / total) * 100),
    bearishPct: Math.round((bearish / total) * 100),
    neutralPct: Math.round((neutral / total) * 100),
    total,
  };
}


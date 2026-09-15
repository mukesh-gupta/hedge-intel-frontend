// Mirrors backend/realtime.py's SYMBOL_MAP exactly. Needed here so the
// frontend can look up a watchlist entry's live price by the Finnhub symbol
// the backend actually subscribes to and broadcasts under.
const SYMBOL_MAP: Record<string, string> = {
  "GC=F": "OANDA:XAU_USD",
  "SI=F": "OANDA:XAG_USD",
  "BTC-USD": "BINANCE:BTCUSDT",
};

const UNMAPPABLE_SUFFIXES = ["=F", ".NYB"];

export function toFinnhubSymbol(watchlistSymbol: string): string | null {
  if (watchlistSymbol in SYMBOL_MAP) return SYMBOL_MAP[watchlistSymbol];
  if (watchlistSymbol.startsWith("^")) return null;
  if (UNMAPPABLE_SUFFIXES.some((suffix) => watchlistSymbol.endsWith(suffix))) return null;
  return watchlistSymbol;
}

/** Backs out an implied previous close from the last REST snapshot's
 * price + change%, then recomputes change% against a live tick price.
 * Approximate (the REST baseline itself isn't tick-precise), but far closer
 * to real-time than only overriding price and leaving a stale change%. */
export function liveChangePercent(
  basePrice: number,
  baseChangePercent: string,
  livePrice: number
): string {
  const baseChange = parseFloat(baseChangePercent.replace("%", ""));
  if (!Number.isFinite(baseChange) || basePrice === 0) return baseChangePercent;
  const prevClose = basePrice / (1 + baseChange / 100);
  if (!Number.isFinite(prevClose) || prevClose === 0) return baseChangePercent;
  return `${(((livePrice - prevClose) / prevClose) * 100).toFixed(2)}%`;
}

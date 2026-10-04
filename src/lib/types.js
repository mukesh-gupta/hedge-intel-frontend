/**
 * Shapes of the backend API responses, written as JSDoc types. Only hasTickerData runs;
 * the typedefs document the data and give editor autocomplete where a file opts in, e.g.
 * `@param {import("@/lib/types").Signal} signal`.
 */

/**
 * @typedef {{
 *   news_feed: boolean,
 *   market_data: boolean,
 *   ai_engine: boolean,
 *   data_pipeline: boolean,
 * }} StatusResponse
 */

/**
 * `data` is null when the underlying price fetch for this symbol failed (e.g. a
 * transient yfinance error) — always guard.
 *
 * @typedef {{
 *   symbol: string,
 *   label: string,
 *   data: { price: number, change_percent: string, rsi: number, as_of: string } | null,
 * }} TickerEntry
 */

/** @typedef {TickerEntry & { data: NonNullable<TickerEntry["data"]> }} TickerEntryWithData */

/**
 * @param {TickerEntry} entry
 * @returns {entry is TickerEntryWithData}
 */
export function hasTickerData(entry) {
  return entry.data !== null;
}

/** @typedef {{ ticker_bar: TickerEntry[] }} TickerBarResponse */

/** @typedef {{ source: string, message: string, time: string }} UsageError */

/**
 * @typedef {{
 *   groq_tokens_today: number,
 *   openrouter_tokens_today: number,
 *   gemini_tokens_today: number,
 *   av_calls_today: number,
 *   headlines_queued: number,
 *   ai_cooldown_remaining: number,
 *   last_error: UsageError | null,
 * }} UsageResponse
 */

/**
 * One signal from GET /api/signals.
 *
 * Impact, Analysis, Region, Tickers and Summary come from the backend's triage pipeline;
 * always guard for them being absent.
 * - Impact: AI triage score, 1-10: how much the headline is likely to move a price.
 * - Analysis: "Deep" = full AI analysis with price data. "Quick" = built from the triage
 *   score alone: direction and tickers, but no strategy, summary or price data.
 * - Region: market mainly affected: Global, India, Commodities, Forex or Crypto.
 * - Tickers: quick signals only — all validated tickers, including when direction is mixed.
 * - Summary: deep signals only — one-sentence plain-language explanation.
 * - Timestamp: when the article was published (UTC ISO 8601).
 * - "Processed At": when the backend generated the signal (UTC ISO 8601).
 *
 * @typedef {{
 *   Timestamp: string,
 *   Headline: string,
 *   Sentiment: string,
 *   Sector: string,
 *   "Buy Tickers": string,
 *   "Sell Tickers": string,
 *   "Execution Blueprint": string,
 *   "Grounded Data": string,
 *   "Ripple Effects (AI-inferred, unverified)": string,
 *   Category: string,
 *   "Key Takeaways": string[],
 *   Source: string,
 *   "Article Link": string,
 *   Impact?: number | null,
 *   Analysis?: "Quick" | "Deep",
 *   Region?: string | null,
 *   Tickers?: string,
 *   Summary?: string | null,
 *   "Processed At"?: string,
 * }} Signal
 */

/** @typedef {{ signals: Signal[] }} SignalsResponse */

/** @typedef {{ new_headlines_found: number }} ScanResponse */

/**
 * @typedef {{
 *   symbol: string,
 *   label: string,
 *   price: number,
 *   change_percent: string,
 *   rsi: number,
 *   as_of: string,
 *   history?: number[],
 * }} MarketAsset
 */

/** @typedef {{ category: string, assets: MarketAsset[] }} MarketDataResponse */

/** @typedef {{ regime: string, bullish: number, bearish: number, score: number }} MarketRegimeResponse */

/**
 * @typedef {{
 *   sector: string,
 *   symbol: string,
 *   change_percent: number,
 *   signal_count: number,
 * }} SectorPerformance
 */

/** @typedef {{ timeframe: string, sectors: SectorPerformance[] }} SectorsResponse */

/**
 * @typedef {{
 *   symbol: string,
 *   label: string,
 *   price: number,
 *   change_percent: string,
 *   rsi?: number,
 *   as_of?: string,
 * }} WatchlistEntry
 */

/** @typedef {{ watchlist: WatchlistEntry[] }} WatchlistResponse */

/** @typedef {{ active: boolean, refresh_interval_seconds: number }} SettingsResponse */

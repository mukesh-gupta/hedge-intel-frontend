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
 * One price check on a signal's call. "right" / "wrong": the ticker moved with / against
 * the call by at least the scorecard's minimum move. "flat": it moved less than that.
 * "closed": the market did not trade in that time, so the call was not scored.
 *
 * @typedef {{
 *   outcome: "right" | "wrong" | "flat" | "closed",
 *   change_percent?: number,
 *   price?: number,
 *   checked_at: number,
 * }} OutcomeResult
 */

/**
 * Result tracking for one signal: the ticker and direction being checked, the price when
 * the signal was published, and each check once it has happened (null until then).
 *
 * @typedef {{
 *   ticker: string,
 *   direction: "UP" | "DOWN",
 *   entry_price: number,
 *   "1h": OutcomeResult | null,
 *   "1d": OutcomeResult | null,
 * }} SignalOutcome
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
 * - Outcome: result tracking; null when the signal makes no call that can be checked
 *   (neutral, or no ticker), absent on signals from before tracking existed.
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
 *   Outcome?: SignalOutcome | null,
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

/**
 * accuracy = right / (right + wrong) as a percentage; null when nothing has been decided.
 *
 * @typedef {{
 *   right: number,
 *   wrong: number,
 *   flat: number,
 *   closed: number,
 *   accuracy: number | null,
 * }} ScorecardTally
 */

/** @typedef {ScorecardTally & { value: string }} ScorecardRow */

/**
 * @typedef {{
 *   overall: ScorecardTally,
 *   by_impact: ScorecardRow[],
 *   by_analysis: ScorecardRow[],
 *   by_region: ScorecardRow[],
 *   by_direction: ScorecardRow[],
 *   by_source: ScorecardRow[],
 * }} ScorecardHorizon
 */

/**
 * @typedef {OutcomeResult & {
 *   id: string,
 *   headline: string,
 *   ticker: string,
 *   direction: "UP" | "DOWN",
 *   entry_price: number,
 *   impact: number | null,
 *   analysis: string,
 *   region: string | null,
 *   source: string | null,
 *   day: string,
 *   horizon: "1h" | "1d",
 * }} ScoredResult
 */

/**
 * GET /api/scorecard: how often signals' calls came true. `since` is the first day with
 * data in the window; `pending` is how many signals still have a check to come.
 *
 * @typedef {{
 *   days: number,
 *   since: string | null,
 *   min_move_percent: number,
 *   pending: number,
 *   horizons: { "1h": ScorecardHorizon, "1d": ScorecardHorizon },
 *   recent: ScoredResult[],
 * }} ScorecardResponse
 */

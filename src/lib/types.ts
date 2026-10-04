export interface StatusResponse {
  news_feed: boolean;
  market_data: boolean;
  ai_engine: boolean;
  data_pipeline: boolean;
}

export interface TickerEntry {
  symbol: string;
  label: string;
  // The backend can return null here when the underlying price fetch for
  // this symbol failed (e.g. a transient yfinance error) — always guard.
  data: {
    price: number;
    change_percent: string;
    rsi: number;
    as_of: string;
  } | null;
}

export type TickerEntryWithData = TickerEntry & { data: NonNullable<TickerEntry["data"]> };

export function hasTickerData(entry: TickerEntry): entry is TickerEntryWithData {
  return entry.data !== null;
}

export interface TickerBarResponse {
  ticker_bar: TickerEntry[];
}

export interface UsageError {
  source: string;
  message: string;
  time: string;
}

export interface UsageResponse {
  groq_tokens_today: number;
  openrouter_tokens_today: number;
  gemini_tokens_today: number;
  av_calls_today: number;
  headlines_queued: number;
  ai_cooldown_remaining: number;
  last_error: UsageError | null;
}

export interface Signal {
  Timestamp: string;
  Headline: string;
  Sentiment: string;
  Sector: string;
  "Buy Tickers": string;
  "Sell Tickers": string;
  "Execution Blueprint": string;
  "Grounded Data": string;
  "Ripple Effects (AI-inferred, unverified)": string;
  Category: string;
  "Key Takeaways": string[];
  Source: string;
  "Article Link": string;
  // Everything below was added by the backend's triage pipeline. Signals still
  // in history from before it (up to 7 days) have none of these — always guard.
  /** AI triage score, 1-10: how much the headline is likely to move a price. */
  Impact?: number | null;
  /** "Deep" = full AI analysis with price data. "Quick" = built from the triage
   * score alone: direction and tickers, but no strategy, summary or price data. */
  Analysis?: "Quick" | "Deep";
  /** Market mainly affected: Global, India, Commodities, Forex or Crypto. */
  Region?: string | null;
  /** Quick signals only: all validated tickers, including when direction is mixed. */
  Tickers?: string;
  /** Deep signals only: one-sentence plain-language explanation. */
  Summary?: string | null;
}

export interface SignalsResponse {
  signals: Signal[];
}

export interface ScanResponse {
  new_headlines_found: number;
}

export interface MarketAsset {
  symbol: string;
  label: string;
  price: number;
  change_percent: string;
  rsi: number;
  as_of: string;
  history?: number[];
}

export interface MarketDataResponse {
  category: string;
  assets: MarketAsset[];
}

export interface MarketRegimeResponse {
  regime: string;
  bullish: number;
  bearish: number;
  score: number;
}

export interface SectorPerformance {
  sector: string;
  symbol: string;
  change_percent: number;
  signal_count: number;
}

export interface SectorsResponse {
  timeframe: string;
  sectors: SectorPerformance[];
}

export interface WatchlistEntry {
  symbol: string;
  label: string;
  price: number;
  change_percent: string;
  rsi?: number;
  as_of?: string;
}

export interface WatchlistResponse {
  watchlist: WatchlistEntry[];
}

export interface SettingsResponse {
  active: boolean;
  refresh_interval_seconds: number;
}

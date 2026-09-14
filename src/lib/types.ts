export interface StatusResponse {
  news_feed: boolean;
  market_data: boolean;
  ai_engine: boolean;
  data_pipeline: boolean;
}

export interface TickerEntry {
  symbol: string;
  label: string;
  data: {
    price: number;
    change_percent: string;
    rsi: number;
    as_of: string;
  };
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

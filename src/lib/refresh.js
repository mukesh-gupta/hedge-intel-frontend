/**
 * How often each screen re-polls, in milliseconds — one place to tune.
 *
 * Every tick is a request against the backend (and, when reads are not going direct,
 * a Vercel function invocation), so these are deliberately no faster than the data
 * behind them changes: the backend itself refreshes quotes on a 20–30 s cycle and
 * signals on the scan schedule. Polling pauses while the tab is hidden (see
 * usePolling), and the watchlist's live prices come from the stream, not from here.
 */
export const REFRESH_MS = {
  ticker: 30_000,
  markets: 30_000, // indices, forex, market-data categories
  regime: 60_000,
  sectors: 120_000,
  signals: 30_000,
  watchlist: 30_000,
  status: 60_000,
  usage: 60_000,
  settings: 60_000,
  scorecard: 300_000,
  speed: 300_000,
};

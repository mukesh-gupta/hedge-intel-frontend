/** @import { ScorecardResponse, ScorecardHorizon, OutcomeResult, SpeedResponse } from "./types" */

/** @type {ScorecardHorizon} */
const EMPTY_HORIZON = {
  overall: { right: 0, wrong: 0, flat: 0, closed: 0, accuracy: null },
  by_impact: [],
  by_analysis: [],
  by_region: [],
  by_direction: [],
  by_source: [],
};

/**
 * What the scorecard looks like before any result exists, or when the backend can't be
 * reached.
 *
 * @param {number} [days]
 * @returns {ScorecardResponse}
 */
export function emptyScorecard(days = 7) {
  return {
    days,
    since: null,
    min_move_percent: 0.1,
    pending: 0,
    horizons: { "1h": EMPTY_HORIZON, "1d": EMPTY_HORIZON },
    recent: [],
  };
}

/** @type {Record<OutcomeResult["outcome"], { label: string, symbol: string, className: string }>} */
const OUTCOME_STYLE = {
  right: { label: "Right", symbol: "✓", className: "border-bullish/40 bg-bullish/10 text-bullish" },
  wrong: { label: "Wrong", symbol: "✗", className: "border-bearish/40 bg-bearish/10 text-bearish" },
  flat: { label: "Flat", symbol: "–", className: "border-border bg-surface-2 text-muted" },
  closed: { label: "Market closed", symbol: "·", className: "border-dashed border-border text-muted" },
};

/** @param {OutcomeResult["outcome"]} outcome */
export function outcomeStyle(outcome) {
  return OUTCOME_STYLE[outcome];
}

/**
 * "+0.82%" / "-1.40%". Fixed formatting (not locale-dependent), so it renders the same on
 * the server and in the browser.
 *
 * @param {number} percent
 */
export function formatChange(percent) {
  return `${percent > 0 ? "+" : ""}${percent.toFixed(2)}%`;
}

/**
 * Text color for an accuracy figure: clearly better than a coin flip, clearly worse, or
 * too close to call.
 *
 * @param {number | null} accuracy
 */
export function accuracyTone(accuracy) {
  if (accuracy === null) return "text-muted";
  if (accuracy >= 55) return "text-bullish";
  if (accuracy <= 45) return "text-bearish";
  return "text-neutral";
}

/**
 * What the speed panel shows before any signal has been timed.
 *
 * @returns {SpeedResponse}
 */
export function emptySpeed() {
  const none = { count: 0, median: null, p90: null };
  return {
    signals: 0,
    backfill_excluded: 0,
    overall: { publish_to_seen: none, seen_to_signal: none, publish_to_signal: none },
    by_feed: [],
    by_analysis: [],
    by_lane: [],
  };
}

/**
 * "45s", "3m 20s", "1h 5m".
 *
 * @param {number | null} seconds
 */
export function formatDuration(seconds) {
  if (seconds === null) return "—";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return seconds % 60 ? `${minutes}m ${seconds % 60}s` : `${minutes}m`;
  return minutes % 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${Math.floor(minutes / 60)}h`;
}

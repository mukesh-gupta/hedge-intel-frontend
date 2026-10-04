/** @import { Signal } from "./types" */

/**
 * @typedef {Object} SentimentStyle
 * @property {string} label
 * @property {string} text
 * @property {string} bg
 * @property {string} border
 * @property {string} dot
 */

/** Mirrors backend/pipeline.py's sentiment_confidence() exactly — same deterministic
 * mapping from sentiment string, just computed client-side since the API doesn't
 *
 * @param {string} sentiment
 * @returns {number}
 * expose it yet. Not a model-reported confidence score. */
export function sentimentConfidence(sentiment) {
  const s = sentiment.toUpperCase();
  if (s.includes("STRONG")) return 91;
  if (s.includes("WEAK")) return 58;
  if (s.includes("BULLISH") || s.includes("BEARISH")) return 76;
  return 0;
}

/**
 * @param {string} sentiment
 * @returns {SentimentStyle}
 */
export function sentimentStyle(sentiment) {
  const s = sentiment.toUpperCase();
  if (s.includes("BULLISH")) {
    return {
      label: sentiment.replaceAll("_", " "),
      text: "text-bullish",
      bg: "bg-bullish/10",
      border: "border-bullish/40",
      dot: "bg-bullish",
    };
  }
  if (s.includes("BEARISH")) {
    return {
      label: sentiment.replaceAll("_", " "),
      text: "text-bearish",
      bg: "bg-bearish/10",
      border: "border-bearish/40",
      dot: "bg-bearish",
    };
  }
  return {
    label: sentiment.replaceAll("_", " ") || "NEUTRAL",
    text: "text-neutral",
    bg: "bg-neutral/10",
    border: "border-neutral/40",
    dot: "bg-neutral",
  };
}

/** A quick signal carries only the triage result (direction, tickers, impact) — no
 * strategy, summary or price data. Signals from before the triage pipeline have no
 *
 * @param {Signal} signal
 * @returns {boolean}
 * Analysis field and were all fully analyzed, so they count as deep. */
export function isQuickSignal(signal) {
  return signal.Analysis === "Quick";
}

/** Impact badge colors. Deliberately the accent hue, not green/red: those already
 *
 * @param {number} impact
 * @returns {string}
 * mean bullish/bearish, and impact says how big the news is, not which way. */
export function impactStyle(impact) {
  if (impact >= 8) return "border-accent bg-accent text-background";
  if (impact >= 7) return "border-accent/50 bg-accent/10 text-accent";
  return "border-border bg-surface-2 text-muted";
}

/** Every ticker a signal names, buy side first. Quick signals with a mixed direction
 *
 * @param {Signal} signal
 * @returns {string[]}
 * have neither buy nor sell tickers, only the plain Tickers list. */
export function signalTickers(signal) {
  /** @param {string} [value] */
  const split = (value) =>
    (value ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  const directional = [...split(signal["Buy Tickers"]), ...split(signal["Sell Tickers"])];
  return directional.length > 0 ? directional : split(signal.Tickers);
}

/**
 * Mirrors backend/pipeline.py's CATEGORY_STYLE table.
 *
 * @type {Record<string, { icon: string; className: string }>}
 */
export const CATEGORY_STYLE = {
  Signal: { icon: "✨", className: "text-violet-400 border-violet-400/40 bg-violet-400/10" },
  "Market News": { icon: "🌐", className: "text-accent border-accent/40 bg-accent/10" },
  Analysis: { icon: "📄", className: "text-bullish border-bullish/40 bg-bullish/10" },
  Alert: { icon: "🚨", className: "text-bearish border-bearish/40 bg-bearish/10" },
  "Trade Idea": { icon: "💼", className: "text-amber-400 border-amber-400/40 bg-amber-400/10" },
  "Macro View": { icon: "⚡", className: "text-neutral border-neutral/40 bg-neutral/10" },
};

/** @param {string} category */
export function categoryStyle(category) {
  return (
    CATEGORY_STYLE[category] ?? {
      icon: "📊",
      className: "text-muted border-border bg-surface-2",
    }
  );
}

/** Stable-enough id for client-side routing: signals have no backend id, so we
 *
 * @param {Signal} signal
 * @returns {string}
 * derive one from timestamp+headline (unique in practice within one day's history). */
export function signalId(signal) {
  return encodeURIComponent(`${signal.Timestamp}__${signal.Headline}`);
}

/**
 * @param {Signal[]} signals
 * @param {string} id
 * @returns {Signal | undefined}
 */
export function findSignalById(signals, id) {
  return signals.find((s) => signalId(s) === id);
}

/** Signal.Timestamp is now the article's real RSS publish time as UTC ISO
 * 8601 (e.g. "2026-09-15T11:28:39Z"), not a pre-formatted local-time string
 * — so it can be rendered in whichever timezone the viewer's browser is in,
 * rather than baked into a fixed server-side format. Falls back to the raw
 * string for older signals still in history from before this format
 * changed (those used a plain "07:34:00 AM"-style string, not parseable as
 * a real date).
 *
 * Render these through <LocalTime>, not directly: the output depends on the
 * browser's locale and timezone, so calling them during server rendering
 *
 * @param {string} timestamp
 * @returns {string}
 * produces different text and a hydration error. */
export function formatSignalTime(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/**
 * @param {string} timestamp
 * @returns {string}
 */
export function formatSignalDateTime(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

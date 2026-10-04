import type { Signal } from "./types";

/** Mirrors backend/pipeline.py's sentiment_confidence() exactly — same deterministic
 * mapping from sentiment string, just computed client-side since the API doesn't
 * expose it yet. Not a model-reported confidence score. */
export function sentimentConfidence(sentiment: string): number {
  const s = sentiment.toUpperCase();
  if (s.includes("STRONG")) return 91;
  if (s.includes("WEAK")) return 58;
  if (s.includes("BULLISH") || s.includes("BEARISH")) return 76;
  return 0;
}

export interface SentimentStyle {
  label: string;
  text: string;
  bg: string;
  border: string;
  dot: string;
}

export function sentimentStyle(sentiment: string): SentimentStyle {
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
 * Analysis field and were all fully analyzed, so they count as deep. */
export function isQuickSignal(signal: Signal): boolean {
  return signal.Analysis === "Quick";
}

/** Impact badge colors. Deliberately the accent hue, not green/red: those already
 * mean bullish/bearish, and impact says how big the news is, not which way. */
export function impactStyle(impact: number): string {
  if (impact >= 8) return "border-accent bg-accent text-background";
  if (impact >= 7) return "border-accent/50 bg-accent/10 text-accent";
  return "border-border bg-surface-2 text-muted";
}

/** Every ticker a signal names, buy side first. Quick signals with a mixed direction
 * have neither buy nor sell tickers, only the plain Tickers list. */
export function signalTickers(signal: Signal): string[] {
  const split = (value?: string) =>
    (value ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  const directional = [...split(signal["Buy Tickers"]), ...split(signal["Sell Tickers"])];
  return directional.length > 0 ? directional : split(signal.Tickers);
}

/** Mirrors backend/pipeline.py's CATEGORY_STYLE table. */
export const CATEGORY_STYLE: Record<string, { icon: string; className: string }> = {
  Signal: { icon: "✨", className: "text-violet-400 border-violet-400/40 bg-violet-400/10" },
  "Market News": { icon: "🌐", className: "text-accent border-accent/40 bg-accent/10" },
  Analysis: { icon: "📄", className: "text-bullish border-bullish/40 bg-bullish/10" },
  Alert: { icon: "🚨", className: "text-bearish border-bearish/40 bg-bearish/10" },
  "Trade Idea": { icon: "💼", className: "text-amber-400 border-amber-400/40 bg-amber-400/10" },
  "Macro View": { icon: "⚡", className: "text-neutral border-neutral/40 bg-neutral/10" },
};

export function categoryStyle(category: string) {
  return (
    CATEGORY_STYLE[category] ?? {
      icon: "📊",
      className: "text-muted border-border bg-surface-2",
    }
  );
}

/** Stable-enough id for client-side routing: signals have no backend id, so we
 * derive one from timestamp+headline (unique in practice within one day's history). */
export function signalId(signal: Signal): string {
  return encodeURIComponent(`${signal.Timestamp}__${signal.Headline}`);
}

export function findSignalById(signals: Signal[], id: string): Signal | undefined {
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
 * produces different text and a hydration error. */
export function formatSignalTime(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function formatSignalDateTime(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

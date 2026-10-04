"use client";

import { useCallback, useEffect, useState } from "react";
import { isQuickSignal } from "./signal-style";

/** @import { Signal } from "./types" */

/**
 * @typedef {Object} SignalFilters
 * @property {(typeof SENTIMENT_FILTERS)[number]} sentiment
 * @property {(typeof IMPACT_FILTERS)[number]} minImpact
 * @property {(typeof ANALYSIS_FILTERS)[number]} analysis
 * @property {string} region - "All" or one region name.
 */

const STORAGE_KEY = "hedge-intel:signal-filters";

export const SENTIMENT_FILTERS = /** @type {const} */ (["All", "Bullish", "Bearish", "Strong"]);
/** Minimum triage impact score; 0 = no minimum. */
export const IMPACT_FILTERS = /** @type {const} */ ([0, 6, 7, 8]);
export const ANALYSIS_FILTERS = /** @type {const} */ (["All", "Deep", "Quick"]);
/** Display order for the region chips; only regions present in the data are shown. */
export const REGION_ORDER = ["Global", "India", "Commodities", "Forex", "Crypto"];

/** @type {SignalFilters} */
export const DEFAULT_FILTERS = {
  sentiment: "All",
  minImpact: 0,
  analysis: "All",
  // "All" or one region name.
  region: "All",
};

/**
 * @param {unknown} raw
 * @returns {SignalFilters}
 */
function sanitize(raw) {
  const value = /** @type {Partial<SignalFilters>} */ (raw ?? {});
  /**
   * @template T
   * @param {readonly T[]} allowed
   * @param {unknown} candidate
   * @param {T} fallback
   * @returns {T}
   */
  const pick = (allowed, candidate, fallback) =>
    allowed.includes(/** @type {T} */ (candidate)) ? /** @type {T} */ (candidate) : fallback;
  return {
    sentiment: pick(SENTIMENT_FILTERS, value.sentiment, DEFAULT_FILTERS.sentiment),
    minImpact: pick(IMPACT_FILTERS, value.minImpact, DEFAULT_FILTERS.minImpact),
    analysis: pick(ANALYSIS_FILTERS, value.analysis, DEFAULT_FILTERS.analysis),
    region: typeof value.region === "string" ? value.region : DEFAULT_FILTERS.region,
  };
}

/** The signal feed's filters, remembered per device in localStorage — with several
 * hundred signals a day, a chosen minimum impact should survive a reload. */
export function useSignalFilters() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // One-time hydration from browser-only storage after mount; SSR has no
  // access to localStorage, so this can't be a lazy useState initializer.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setFilters(sanitize(JSON.parse(raw)));
    } catch {
      // ignore — filters are a convenience, not critical state
    }
  }, []);

  const update = useCallback((/** @type {Partial<SignalFilters>} */ patch) => {
    setFilters((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return { filters, update };
}

/** Signals from before the triage pipeline have no Impact or Region, so a minimum
 *
 * @param {Signal} signal
 * @param {SignalFilters} filters
 * @returns {boolean}
 * impact or a specific region leaves them out; they still show under the defaults. */
export function matchesFilters(signal, filters) {
  const sentiment = signal.Sentiment.toUpperCase();
  if (filters.sentiment === "Strong" && !sentiment.includes("STRONG")) return false;
  if (
    filters.sentiment !== "All" &&
    filters.sentiment !== "Strong" &&
    !sentiment.includes(filters.sentiment.toUpperCase())
  )
    return false;
  if (filters.minImpact > 0 && (signal.Impact ?? 0) < filters.minImpact) return false;
  if (filters.analysis === "Quick" && !isQuickSignal(signal)) return false;
  if (filters.analysis === "Deep" && isQuickSignal(signal)) return false;
  if (filters.region !== "All" && signal.Region !== filters.region) return false;
  return true;
}

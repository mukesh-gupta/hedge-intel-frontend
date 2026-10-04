"use client";

import { useState } from "react";
import { usePolling } from "@/lib/usePolling";
import { emptyScorecard, outcomeStyle, formatChange, accuracyTone } from "@/lib/scorecard";

/** @import { ScorecardResponse, ScorecardTally, ScorecardRow, ScoredResult } from "@/lib/types" */

const WINDOWS = [
  { days: 1, label: "Today" },
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
];

const HORIZONS = /** @type {const} */ ([
  { key: "1h", label: "After 1 hour" },
  { key: "1d", label: "After 1 day" },
]);

/** @param {ScorecardTally} tally */
function decided(tally) {
  return tally.right + tally.wrong + tally.flat;
}

// "3 right, 0 wrong = 100%" says very little. Below this many right-or-wrong results a
// row's percentage is shown greyed out instead of in green or red.
const MIN_SAMPLE = 10;

/** @param {ScorecardTally} tally */
function tooFew(tally) {
  return tally.right + tally.wrong < MIN_SAMPLE;
}

/**
 * @param {Object} props
 * @param {boolean} props.active
 * @param {() => void} props.onClick
 * @param {React.ReactNode} props.children
 */
function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-accent bg-accent text-background"
          : "border-border text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

/** Right / wrong / flat as one proportional bar.
 *
 * @param {{ tally: ScorecardTally }} props
 */
function SplitBar({ tally }) {
  const total = decided(tally);
  if (total === 0) return <div className="h-2 w-full rounded-full bg-surface-2" />;
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-2">
      <div className="bg-bullish" style={{ width: `${(tally.right / total) * 100}%` }} />
      <div className="bg-bearish" style={{ width: `${(tally.wrong / total) * 100}%` }} />
    </div>
  );
}

/** @param {{ label: string, tally: ScorecardTally }} props */
function HorizonCard({ label, tally }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-muted">{label}</h2>
      <p
        className={`mt-1 text-3xl font-bold ${tooFew(tally) ? "text-muted" : accuracyTone(tally.accuracy)}`}
      >
        {tally.accuracy === null ? "—" : `${tally.accuracy}%`}
      </p>
      <p className="mb-3 text-xs text-muted">
        {tally.accuracy === null ? "No scored calls yet" : "of calls that moved went the predicted way"}
      </p>
      <SplitBar tally={tally} />
      <p className="mt-2 text-xs text-muted">
        <span className="font-semibold text-bullish">{tally.right} right</span> ·{" "}
        <span className="font-semibold text-bearish">{tally.wrong} wrong</span> · {tally.flat} flat
        {tally.closed > 0 && ` · ${tally.closed} market closed`}
      </p>
    </div>
  );
}

/**
 * @param {Object} props
 * @param {string} props.title
 * @param {ScorecardRow[]} props.rows
 * @param {(value: string) => string} [props.format]
 */
function Breakdown({ title, rows, format = (value) => value }) {
  const shown = rows.filter((row) => decided(row) > 0);
  if (shown.length === 0) return null;
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold text-muted">{title}</h3>
      <div className="flex flex-col gap-2.5">
        {shown.map((row) => (
          <div key={row.value}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
              <span className="truncate font-medium text-foreground">{format(row.value)}</span>
              <span className="shrink-0 text-muted">
                {row.right} right · {row.wrong} wrong
                <span
                  title={tooFew(row) ? "Too few results to read much into" : undefined}
                  className={`ml-2 font-bold ${tooFew(row) ? "text-muted" : accuracyTone(row.accuracy)}`}
                >
                  {row.accuracy === null ? "—" : `${row.accuracy}%`}
                </span>
              </span>
            </div>
            <SplitBar tally={row} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** @param {{ results: ScoredResult[] }} props */
function RecentResults({ results }) {
  if (results.length === 0) return null;
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold text-muted">Latest results</h3>
      <div className="flex flex-col gap-3">
        {results.map((result) => {
          const style = outcomeStyle(result.outcome);
          return (
            <div key={`${result.id}-${result.horizon}`} className="flex items-start gap-2.5">
              <span
                className={`mt-0.5 inline-flex w-24 shrink-0 items-center justify-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-bold ${style.className}`}
              >
                {style.symbol} {style.label}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">{result.headline}</p>
                <p className="text-[11px] text-muted">
                  <span className="font-mono text-foreground/90">{result.ticker}</span> expected{" "}
                  {result.direction === "UP" ? "up" : "down"}
                  {result.change_percent !== undefined && `, moved ${formatChange(result.change_percent)}`}{" "}
                  after {result.horizon === "1h" ? "1 hour" : "1 day"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * @param {Object} props
 * @param {number} props.days
 * @param {ScorecardResponse} props.initialData
 * @param {boolean} props.fetchImmediately
 */
function ScorecardPanel({ days, initialData, fetchImmediately }) {
  const { data, error } = usePolling(`/api/scorecard?days=${days}`, 60_000, initialData, {
    fetchImmediately,
  });
  const [breakdownHorizon, setBreakdownHorizon] = useState(
    /** @type {"1h" | "1d"} */ ("1h")
  );
  const detail = data.horizons[breakdownHorizon];
  const anyResults = HORIZONS.some(({ key }) => decided(data.horizons[key].overall) > 0);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {HORIZONS.map(({ key, label }) => (
          <HorizonCard key={key} label={label} tally={data.horizons[key].overall} />
        ))}
      </div>

      <p className="text-xs text-muted">
        Each signal with a direction and a ticker is checked against the real price. A call is{" "}
        <span className="text-bullish">right</span> when its first ticker moved at least{" "}
        {data.min_move_percent}% the predicted way, <span className="text-bearish">wrong</span>{" "}
        when it moved that much the other way, and flat in between. {data.pending} signal
        {data.pending === 1 ? " is" : "s are"} still waiting for a check.
        {error && " Could not refresh just now; showing the last result."}
      </p>

      {!anyResults ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
          No results in this period yet. The first ones arrive an hour after a signal is published.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Breakdown
            </span>
            {HORIZONS.map(({ key, label }) => (
              <Chip key={key} active={breakdownHorizon === key} onClick={() => setBreakdownHorizon(key)}>
                {label}
              </Chip>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Breakdown title="By impact score" rows={detail.by_impact} format={(v) => `Impact ${v}`} />
            <Breakdown
              title="By analysis type"
              rows={detail.by_analysis}
              format={(v) => (v === "Deep" ? "Deep analysis" : "Quick signal")}
            />
            <Breakdown title="By market" rows={detail.by_region} />
            <Breakdown
              title="By direction"
              rows={detail.by_direction}
              format={(v) => (v === "UP" ? "Bullish calls" : "Bearish calls")}
            />
            <Breakdown title="By source (10 most active)" rows={detail.by_source} />
          </div>
          <RecentResults results={data.recent} />
        </>
      )}
    </>
  );
}

/** @param {{ initialData: ScorecardResponse }} props */
export default function ScorecardContent({ initialData }) {
  const [days, setDays] = useState(initialData.days);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-4 lg:max-w-4xl">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {WINDOWS.map((w) => (
          <Chip key={w.days} active={days === w.days} onClick={() => setDays(w.days)}>
            {w.label}
          </Chip>
        ))}
      </div>
      {/* Remounted per period: each has its own poll, seeded with the server-rendered data
          for the initial period and fetched straight away for the others. */}
      <ScorecardPanel
        key={days}
        days={days}
        initialData={days === initialData.days ? initialData : emptyScorecard(days)}
        fetchImmediately={days !== initialData.days}
      />
    </div>
  );
}

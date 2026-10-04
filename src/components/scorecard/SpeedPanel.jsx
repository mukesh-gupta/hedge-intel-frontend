"use client";

import { usePolling } from "@/lib/usePolling";
import { formatDuration } from "@/lib/scorecard";

/** @import { SpeedResponse, DelaySummary } from "@/lib/types" */

// Below this many signals a feed's median says little, so it is shown greyed out.
const MIN_SAMPLE = 5;

/**
 * Colour for a source delay: quick, slow, or in between.
 *
 * @param {DelaySummary} delay
 */
function delayTone(delay) {
  if (delay.median === null || delay.count < MIN_SAMPLE) return "text-muted";
  if (delay.median <= 120) return "text-bullish";
  if (delay.median >= 600) return "text-bearish";
  return "text-neutral";
}

/**
 * @param {Object} props
 * @param {string} props.label
 * @param {string} props.hint
 * @param {DelaySummary} props.delay
 */
function DelayTile({ label, hint, delay }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 p-3">
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className="mt-0.5 text-2xl font-bold text-foreground">{formatDuration(delay.median)}</p>
      <p className="text-[11px] text-muted">
        {delay.median === null ? hint : `${hint} · 9 in 10 within ${formatDuration(delay.p90)}`}
      </p>
    </div>
  );
}

/** @param {{ initialData: SpeedResponse }} props */
export default function SpeedPanel({ initialData }) {
  const { data } = usePolling("/api/speed", 60_000, initialData, { fetchImmediately: false });
  const { overall } = data;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 pb-6 lg:max-w-4xl">
      <div className="rounded-xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-muted">Speed today</h2>
        <p className="mb-3 mt-1 text-xs text-muted">
          Typical (median) time from an article being published to its signal, across{" "}
          {overall.publish_to_signal.count} of today&apos;s signals.
          {data.backfill_excluded > 0 &&
            ` ${data.backfill_excluded} more were already in a feed when the backend restarted and are left out of the source figures.`}
        </p>

        {data.signals === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
            No timed signals yet today.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <DelayTile
                label="Source delay"
                hint="published → in a feed"
                delay={overall.publish_to_seen}
              />
              <DelayTile label="Bot delay" hint="in a feed → signal" delay={overall.seen_to_signal} />
              <DelayTile label="Total" hint="published → signal" delay={overall.publish_to_signal} />
            </div>

            <p className="mt-3 text-xs text-muted">
              Bot delay by route:{" "}
              {[...data.by_lane, ...data.by_analysis.map((row) => ({ ...row, lane: row.analysis }))].map(
                (row, i) => (
                  <span key={row.lane}>
                    {i > 0 && " · "}
                    {row.lane}{" "}
                    <span className="font-semibold text-foreground">
                      {formatDuration(row.seen_to_signal.median)}
                    </span>
                  </span>
                )
              )}
            </p>

            {data.by_feed.length > 0 && (
              <div className="mt-4">
                <div className="mb-1.5 flex items-baseline justify-between text-[11px] font-semibold uppercase tracking-wide text-muted">
                  <span>Source delay by feed</span>
                  <span>typical · 9 in 10</span>
                </div>
                <div className="flex flex-col divide-y divide-border">
                  {data.by_feed.map((row) => (
                    <div
                      key={row.feed}
                      className="flex items-baseline justify-between gap-3 py-1.5 text-xs"
                    >
                      <span className="min-w-0 truncate text-foreground">
                        {row.feed}{" "}
                        <span className="text-muted">
                          · {row.publish_to_seen.count} signal{row.publish_to_seen.count === 1 ? "" : "s"}
                        </span>
                      </span>
                      <span className="shrink-0 font-mono">
                        <span className={`font-bold ${delayTone(row.publish_to_seen)}`}>
                          {formatDuration(row.publish_to_seen.median)}
                        </span>
                        <span className="text-muted"> · {formatDuration(row.publish_to_seen.p90)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

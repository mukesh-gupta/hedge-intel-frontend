import { outcomeStyle, formatChange } from "@/lib/scorecard";

/** @import { SignalOutcome } from "@/lib/types" */

const HORIZONS = /** @type {const} */ ([
  { key: "1h", short: "1h", long: "1 hour" },
  { key: "1d", short: "1d", long: "1 day" },
]);

/**
 * One chip per price check that has already happened ("1h +0.82% ✓"). Renders nothing
 * until the first check, so the feed isn't filled with "pending" chips.
 *
 * @param {{ outcome: SignalOutcome | null | undefined }} props
 */
export default function OutcomeChips({ outcome }) {
  if (!outcome) return null;
  return HORIZONS.map(({ key, short }) => {
    const result = outcome[key];
    if (!result) return null;
    const style = outcomeStyle(result.outcome);
    return (
      <span
        key={key}
        title={`${outcome.ticker} after ${short}: ${style.label.toLowerCase()}`}
        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${style.className}`}
      >
        {short}{" "}
        {result.change_percent !== undefined ? formatChange(result.change_percent) : "closed"}{" "}
        {style.symbol}
      </span>
    );
  });
}

/**
 * The detail page's fuller version: what is being checked, and each check's result or
 * that it is still to come.
 *
 * @param {{ outcome: SignalOutcome }} props
 */
export function OutcomeDetail({ outcome }) {
  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold text-foreground">
        Result <span className="font-normal text-muted">(checked against the real price)</span>
      </h2>
      <div className="rounded-lg border border-border bg-surface p-3 text-sm">
        <p className="text-foreground/90">
          <span className="font-mono">{outcome.ticker}</span> was expected to{" "}
          {outcome.direction === "UP" ? "rise" : "fall"} from{" "}
          <span className="font-mono">{outcome.entry_price}</span>.
        </p>
        <ul className="mt-2 space-y-1.5">
          {HORIZONS.map(({ key, long }) => {
            const result = outcome[key];
            const style = result ? outcomeStyle(result.outcome) : null;
            return (
              <li key={key} className="flex items-center justify-between gap-3 text-xs">
                <span className="text-muted">After {long}</span>
                {result && style ? (
                  <span
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-semibold ${style.className}`}
                  >
                    {result.change_percent !== undefined && formatChange(result.change_percent)}{" "}
                    {style.symbol} {style.label}
                  </span>
                ) : (
                  <span className="text-muted">Not checked yet</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

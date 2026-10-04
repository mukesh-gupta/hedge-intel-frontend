"use client";

import { Star, Share2 } from "lucide-react";
import { useSignals } from "@/lib/SignalsProvider";
import {
  sentimentStyle,
  sentimentConfidence,
  findSignalById,
  impactStyle,
  isQuickSignal,
  signalTickers,
} from "@/lib/signal-style";
import { useStarred } from "@/lib/useStarred";
import { TickerChip } from "@/components/ui/Badge";
import LocalTime from "@/components/ui/LocalTime";
import ScreenHeader from "@/components/ScreenHeader";

// Same size as the sentiment chip beside it (one step larger than the feed's badges).
const DETAIL_CHIP = "inline-flex w-fit items-center rounded-md border px-2 py-1 text-xs font-semibold";

export default function SignalDetailContent({ id }: { id: string }) {
  const { signals } = useSignals();
  const { starred, toggle } = useStarred();
  const signal = findSignalById(signals, id);

  if (!signal) {
    return (
      <>
        <ScreenHeader title="Signal Details" back="/signals" />
        <p className="px-4 py-8 text-center text-sm text-muted">
          This signal is no longer in the live feed (it may have rolled off history).
        </p>
      </>
    );
  }

  const style = sentimentStyle(signal.Sentiment);
  const confidence = sentimentConfidence(signal.Sentiment);
  const isStarred = starred.has(id);
  const affectedAssets = signalTickers(signal);
  // Quick signals come from the triage score alone, so the sections that only a full
  // analysis fills in (price data, confidence, strategy, ripple effects) are left out
  // rather than shown with placeholder text.
  const quick = isQuickSignal(signal);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: signal!.Headline, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
    }
  }

  return (
    <>
      <ScreenHeader
        title="Signal Details"
        eyebrow={
          <>
            <LocalTime timestamp={signal.Timestamp} withDate /> · {signal.Sector}
          </>
        }
        back="/signals"
        right={
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggle(id)}
              className={isStarred ? "text-neutral" : "text-muted hover:text-foreground"}
              aria-label="Star signal"
            >
              <Star size={18} fill={isStarred ? "currentColor" : "none"} />
            </button>
            <button onClick={share} className="text-muted hover:text-foreground" aria-label="Share">
              <Share2 size={18} />
            </button>
          </div>
        }
      />

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-4 lg:max-w-3xl">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex w-fit items-center gap-1 rounded-md border px-2 py-1 text-xs font-bold ${style.border} ${style.bg} ${style.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
            {style.label}
          </span>
          {signal.Impact != null && (
            <span className={`${DETAIL_CHIP} ${impactStyle(signal.Impact)}`}>
              Impact {signal.Impact}/10
            </span>
          )}
          {signal.Region && (
            <span className={`${DETAIL_CHIP} border-border text-muted`}>{signal.Region}</span>
          )}
          {signal.Analysis && (
            <span
              className={`${DETAIL_CHIP} border-border text-muted ${quick ? "border-dashed" : ""}`}
            >
              {quick ? "Quick signal" : "Deep analysis"}
            </span>
          )}
        </div>

        <h1 className="text-xl font-bold text-foreground">{signal.Headline}</h1>

        {signal.Summary && <p className="text-sm text-foreground/90">{signal.Summary}</p>}

        {quick ? (
          <p className="rounded-lg border border-dashed border-border bg-surface-2 px-3 py-2 text-xs text-muted">
            Quick signal: the AI scored this headline&apos;s market impact and likely direction,
            but it did not get a full analysis. There is no strategy, price data or ripple
            effects for it — open the article below for the details.
          </p>
        ) : (
          <p className="rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-xs text-accent">
            {signal["Grounded Data"]}
          </p>
        )}

        {signal["Key Takeaways"]?.length > 0 && (
          <div>
            <h2 className="mb-2 text-sm font-semibold text-foreground">Key Takeaways</h2>
            <ul className="space-y-1.5">
              {signal["Key Takeaways"].map((point, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {affectedAssets.length > 0 && (
          <div>
            <h2 className="mb-2 text-sm font-semibold text-foreground">
              Affected Assets{" "}
              <span className="font-normal text-muted">
                {quick ? "(AI-suggested)" : "(Buy / Hedge)"}
              </span>
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {affectedAssets.map((t) => (
                <TickerChip key={t} symbol={t} />
              ))}
            </div>
          </div>
        )}

        {!quick && (
          <>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Confidence</h2>
                <span className="text-sm font-bold text-foreground">{confidence}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${confidence}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-muted">
                Derived from sentiment strength ({signal.Sentiment.replaceAll("_", " ")}), not a
                model-reported score.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-sm font-semibold text-foreground">Execution Strategy</h2>
              <p className="rounded-lg border border-border bg-surface p-3 text-sm text-foreground/90">
                {signal["Execution Blueprint"]}
              </p>
            </div>

            {signal["Ripple Effects (AI-inferred, unverified)"] && (
              <div>
                <h2 className="mb-1 text-sm font-semibold text-foreground">
                  Ripple Effects{" "}
                  <span className="font-normal text-muted">(AI-inferred, unverified)</span>
                </h2>
                <p className="text-sm text-muted">
                  {signal["Ripple Effects (AI-inferred, unverified)"]}
                </p>
              </div>
            )}
          </>
        )}

        <a
          href={signal["Article Link"]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-xs text-accent hover:underline"
        >
          Source: {signal.Source} ↗
        </a>
      </div>
    </>
  );
}

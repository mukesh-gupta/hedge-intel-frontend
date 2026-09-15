"use client";

import Link from "next/link";
import { useSignals } from "@/lib/SignalsProvider";
import { sentimentStyle, signalId, formatSignalDateTime } from "@/lib/signal-style";

export default function HistoricalLogs() {
  const { signals } = useSignals();

  if (signals.length === 0) {
    return <p className="px-4 py-8 text-center text-sm text-muted">No signal history yet.</p>;
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-4 lg:max-w-3xl">
      <p className="mb-3 text-[11px] text-muted">
        Shows each signal&apos;s real article publish time, in your local timezone. History is
        retained up to a fixed number of most-recent signals, not an unlimited archive.
      </p>
      <div className="relative flex flex-col gap-4 border-l border-border pl-4">
        {signals.map((s, i) => {
          const style = sentimentStyle(s.Sentiment);
          return (
            <Link
              key={`${signalId(s)}-${i}`}
              href={`/signals/${signalId(s)}`}
              className="relative block"
            >
              <span
                className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ${style.dot}`}
              />
              <p className="text-xs text-muted">{formatSignalDateTime(s.Timestamp)}</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{s.Headline}</p>
              <span
                className={`mt-1 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${style.border} ${style.bg} ${style.text}`}
              >
                {style.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

import Link from "next/link";
import { categoryStyle, signalId } from "@/lib/signal-style";
import LocalTime from "@/components/ui/LocalTime";

/** @import { Signal } from "@/lib/types" */

/** @param {{ signals: Signal[] }} props */
export default function AIFeedPreview({ signals }) {
  const items = signals.slice(0, 4);

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted">AI Intelligence Feed</h2>
        <Link href="/chat" className="text-xs text-accent">
          View All
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted">No AI-categorized items yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((s, i) => {
            const style = categoryStyle(s.Category || "Signal");
            return (
              <Link
                key={`${signalId(s)}-${i}`}
                href={`/signals/${signalId(s)}`}
                className="flex items-start gap-2"
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm ${style.className}`}
                >
                  {style.icon}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">{s.Headline}</p>
                  <p className="text-[11px] text-muted">
                    <LocalTime timestamp={s.Timestamp} /> · {s.Category || "Signal"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

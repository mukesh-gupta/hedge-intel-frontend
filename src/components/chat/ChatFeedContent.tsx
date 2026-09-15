"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useSignals } from "@/lib/SignalsProvider";
import { categoryStyle, signalId, formatSignalTime } from "@/lib/signal-style";

export default function ChatFeedContent() {
  const { signals } = useSignals();
  const [category, setCategory] = useState<string>("All");

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const s of signals) set.add(s.Category || "Signal");
    return ["All", ...set];
  }, [signals]);

  const items = useMemo(() => {
    if (category === "All") return signals;
    return signals.filter((s) => (s.Category || "Signal") === category);
  }, [signals, category]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 py-4 lg:max-w-3xl">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              category === c
                ? "border-accent bg-accent text-background"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">Nothing in this category yet.</p>
      ) : (
        items.map((s, i) => {
          const style = categoryStyle(s.Category || "Signal");
          return (
            <Link
              key={`${signalId(s)}-${i}`}
              href={`/signals/${signalId(s)}`}
              className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3.5"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-base ${style.className}`}
              >
                {style.icon}
              </span>
              <div className="flex-1">
                <p className="text-xs text-muted">{formatSignalTime(s.Timestamp)}</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{s.Headline}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted">
                  {s["Execution Blueprint"]}
                </p>
                <span
                  className={`mt-2 inline-block rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${style.className}`}
                >
                  {s.Category || "Signal"}
                </span>
              </div>
              <ChevronRight size={16} className="mt-1 shrink-0 text-muted" />
            </Link>
          );
        })
      )}
    </div>
  );
}

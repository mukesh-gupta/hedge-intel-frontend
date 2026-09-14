"use client";

import { usePolling } from "@/lib/usePolling";
import type { UsageResponse } from "@/lib/types";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
      <span className="font-mono text-base text-foreground">{value}</span>
    </div>
  );
}

export default function UsagePanel({ initialData }: { initialData: UsageResponse }) {
  const { data } = usePolling<UsageResponse>("/api/usage", 15_000, initialData, {
    fetchImmediately: false,
  });

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h2 className="mb-3 text-sm font-semibold text-muted">Usage & Health</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Groq tokens" value={data.groq_tokens_today.toLocaleString()} />
        <Stat label="OpenRouter tokens" value={data.openrouter_tokens_today.toLocaleString()} />
        <Stat label="Gemini tokens" value={data.gemini_tokens_today.toLocaleString()} />
        <Stat label="Alpha Vantage calls" value={data.av_calls_today} />
        <Stat label="Headlines queued" value={data.headlines_queued} />
        <Stat label="AI cooldown (s)" value={data.ai_cooldown_remaining} />
      </div>
      {data.last_error && (
        <div className="mt-4 rounded border border-bearish/40 bg-bearish/10 p-3 text-xs">
          <p className="font-semibold text-bearish">
            Last error &middot; {data.last_error.source} &middot; {data.last_error.time}
          </p>
          <p className="mt-1 break-words text-muted">{data.last_error.message}</p>
        </div>
      )}
    </div>
  );
}

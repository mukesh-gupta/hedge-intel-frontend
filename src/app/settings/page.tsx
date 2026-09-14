import { backendFetch } from "@/lib/backend";
import type { StatusResponse, UsageResponse, SettingsResponse } from "@/lib/types";
import ScreenHeader from "@/components/ScreenHeader";
import SettingsContent from "@/components/settings/SettingsContent";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export default async function SettingsPage() {
  const [status, usage, settings] = await Promise.all([
    safe<StatusResponse>(
      () => backendFetch<StatusResponse>("/api/status", { revalidateSeconds: 15 }),
      { news_feed: false, market_data: false, ai_engine: false, data_pipeline: false }
    ),
    safe<UsageResponse>(
      () => backendFetch<UsageResponse>("/api/usage", { revalidateSeconds: 15 }),
      {
        groq_tokens_today: 0,
        openrouter_tokens_today: 0,
        gemini_tokens_today: 0,
        av_calls_today: 0,
        headlines_queued: 0,
        ai_cooldown_remaining: 0,
        last_error: null,
      }
    ),
    safe<SettingsResponse>(
      () => backendFetch<SettingsResponse>("/api/settings", { revalidateSeconds: 10 }),
      { active: true, refresh_interval_seconds: 30 }
    ),
  ]);

  return (
    <>
      <ScreenHeader title="Settings" back="/more" />
      <SettingsContent initialStatus={status} initialUsage={usage} initialSettings={settings} />
    </>
  );
}

import { backendFetch } from "@/lib/backend";
import ScreenHeader from "@/components/ScreenHeader";
import SettingsContent from "@/components/settings/SettingsContent";

/**
 * @template T
 * @param {() => Promise<T>} fn
 * @param {T} fallback
 * @returns {Promise<T>}
 */
async function safe(fn, fallback) {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export default async function SettingsPage() {
  const [status, usage, settings] = await Promise.all([
    safe(() => backendFetch("/api/status", { revalidateSeconds: 15 }), {
      news_feed: false,
      market_data: false,
      ai_engine: false,
      data_pipeline: false,
    }),
    safe(() => backendFetch("/api/usage", { revalidateSeconds: 15 }), {
      groq_tokens_today: 0,
      openrouter_tokens_today: 0,
      gemini_tokens_today: 0,
      av_calls_today: 0,
      headlines_queued: 0,
      ai_cooldown_remaining: 0,
      last_error: null,
    }),
    safe(() => backendFetch("/api/settings", { revalidateSeconds: 10 }), {
      active: true,
      refresh_interval_seconds: 30,
    }),
  ]);

  return (
    <>
      <ScreenHeader title="Settings" back="/more" />
      <SettingsContent initialStatus={status} initialUsage={usage} initialSettings={settings} />
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { getLiveStreamEnabled, setLiveStreamEnabled } from "@/lib/liveStreamStore";
import { getTheme, applyTheme } from "@/lib/themeStore";
import { usePolling } from "@/lib/usePolling";
import Switch from "@/components/ui/Switch";
import StatusDots from "@/components/StatusDots";
import UsagePanel from "@/components/UsagePanel";

/** @import { Theme } from "@/lib/themeStore" */
/** @import { StatusResponse, UsageResponse, SettingsResponse } from "@/lib/types" */

/**
 * @param {Object} props
 * @param {StatusResponse} props.initialStatus
 * @param {UsageResponse} props.initialUsage
 * @param {SettingsResponse} props.initialSettings
 */
export default function SettingsContent({ initialStatus, initialUsage, initialSettings }) {
  const [liveEnabled, setLiveEnabledState] = useState(true);
  const [theme, setThemeState] = useState(/** @type {Theme} */ ("dark"));
  const { data: settings, refetch: refetchSettings } = usePolling(
    "/api/settings",
    15_000,
    initialSettings,
    { fetchImmediately: false }
  );
  const [intervalDraft, setIntervalDraft] = useState(settings.refresh_interval_seconds);
  const [savingActive, setSavingActive] = useState(false);
  const debounceRef = useRef(/** @type {ReturnType<typeof setTimeout> | null} */ (null));

  // Read persisted values only after mount to avoid SSR/client mismatch.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLiveEnabledState(getLiveStreamEnabled());
    setThemeState(getTheme());
  }, []);

  useEffect(() => {
    // Re-sync the local slider draft when the polled value changes from
    // elsewhere (another client, or our own patch's refetch) — the draft
    // must stay independently editable while the user is dragging.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIntervalDraft(settings.refresh_interval_seconds);
  }, [settings.refresh_interval_seconds]);

  /** @param {Partial<SettingsResponse>} body */
  async function patchSettings(body) {
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await refetchSettings();
  }

  /** @param {boolean} v */
  async function toggleActive(v) {
    setSavingActive(true);
    try {
      await patchSettings({ active: v });
    } finally {
      setSavingActive(false);
    }
  }

  /** @param {number} seconds */
  function onIntervalChange(seconds) {
    setIntervalDraft(seconds);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      patchSettings({ refresh_interval_seconds: seconds });
    }, 500);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-4 lg:max-w-3xl">
      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted">Engine Controls</h2>
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-3">
          <div>
            <p className="text-sm font-medium text-foreground">Backend Scanner Active</p>
            <p className="text-[11px] text-muted">
              Pauses/resumes the RSS scan pipeline for everyone using this backend.
            </p>
          </div>
          <Switch
            checked={settings.active}
            onChange={toggleActive}
            label="Backend Scanner Active"
          />
        </div>

        <div className="mt-2 rounded-lg border border-border bg-surface p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Scan Interval</p>
            <span className="font-mono text-sm text-muted">{intervalDraft}s</span>
          </div>
          <input
            type="range"
            min={5}
            max={3600}
            step={5}
            value={intervalDraft}
            onChange={(e) => onIntervalChange(Number(e.target.value))}
            className="mt-2 w-full accent-accent"
          />

          <p className="mt-1 text-[11px] text-muted">
            How often the backend re-scans RSS feeds for new headlines (5–3600s).
          </p>
        </div>

        <div className="mt-2 flex items-center justify-between rounded-lg border border-border bg-surface p-3">
          <div>
            <p className="text-sm font-medium text-foreground">Live Updates (this device)</p>
            <p className="text-[11px] text-muted">Pauses this app&apos;s own polling only.</p>
          </div>
          <Switch
            checked={liveEnabled}
            onChange={(v) => {
              setLiveEnabledState(v);
              setLiveStreamEnabled(v);
            }}
            label="Live Updates (this device)"
          />
        </div>
        {savingActive && <p className="mt-1 text-[11px] text-muted">Saving…</p>}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted">API Usage (Today)</h2>
        <UsagePanel initialData={initialUsage} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted">System Status</h2>
        <StatusDots initialData={initialStatus} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted">App</h2>
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-3">
          <p className="text-sm font-medium text-foreground">Theme</p>
          <div className="flex gap-2">
            {/** @type {Theme[]} */ (["dark", "light"]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setThemeState(t);
                  applyTheme(t);
                }}
                className={`rounded-md border px-3 py-1 text-xs font-semibold capitalize transition ${
                  theme === t
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

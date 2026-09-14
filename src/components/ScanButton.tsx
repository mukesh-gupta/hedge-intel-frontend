"use client";

import { useState } from "react";

export default function ScanButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function triggerScan() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/scan", { method: "POST" });
      if (!res.ok) throw new Error(`Scan failed: ${res.status}`);
      const data = await res.json();
      const found =
        typeof data?.new_headlines_found === "number" ? data.new_headlines_found : undefined;
      setMessage(found !== undefined ? `${found} new headline(s) queued` : "Scan triggered");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={triggerScan}
        disabled={loading}
        className="rounded-md border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Scanning…" : "Trigger Manual Scan"}
      </button>
      {message && <span className="text-xs text-muted">{message}</span>}
    </div>
  );
}

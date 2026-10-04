"use client";

import { useEffect, useState } from "react";
import { Globe2 } from "lucide-react";

const SESSION_KEY = "hedge-intel:splash-shown";
const DURATION_MS = 1400;

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      // ignore
    } // First-mount reveal gated on browser-only sessionStorage; can't be a lazy
    // initializer without risking an SSR/client hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      // Marked as shown only once it has finished. In development React runs this
      // effect twice (StrictMode); marking it up front made the second run return
      // early after the first run's timer was already cancelled, so the splash
      // never went away.
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // ignore
      }
    }, DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background">
      <Globe2 size={56} className="text-accent" strokeWidth={1.5} />
      <div className="text-center">
        <h1 className="text-lg font-bold tracking-tight text-foreground">GLOBAL MACRO TERMINAL</h1>
        <p className="mt-1 text-xs text-muted">AI-Powered Market Intelligence</p>
      </div>
      <div className="h-1 w-40 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-accent"
          style={{ animation: `splash-progress ${DURATION_MS}ms linear forwards` }}
        />
      </div>
      <p className="text-xs text-muted">Loading…</p>
      <style>{`
        @keyframes splash-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}

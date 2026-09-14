"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotifications } from "@/lib/useNotifications";
import { sentimentStyle, signalId } from "@/lib/signal-style";

export default function NotificationBell({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { signals, unread, unreadCount, markAllRead } = useNotifications();

  const list = unread.length > 0 ? unread : signals.slice(0, 5);

  function toggle() {
    setOpen((o) => {
      const next = !o;
      if (next) markAllRead();
      return next;
    });
  }

  return (
    <div className={`relative ${className ?? ""}`}>
      <button
        onClick={toggle}
        aria-label="Notifications"
        className="relative text-muted hover:text-foreground"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-bearish px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            aria-label="Close notifications"
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-8 z-40 w-80 max-w-[85vw] rounded-xl border border-border bg-surface shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Notifications</p>
              <Link
                href="/signals"
                onClick={() => setOpen(false)}
                className="text-xs text-accent"
              >
                View All
              </Link>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {list.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted">No signals yet.</p>
              ) : (
                list.map((s, i) => {
                  const style = sentimentStyle(s.Sentiment);
                  return (
                    <Link
                      key={`${signalId(s)}-${i}`}
                      href={`/signals/${signalId(s)}`}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-2 border-b border-border px-4 py-3 last:border-b-0 hover:bg-surface-2"
                    >
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {s.Headline}
                        </p>
                        <p className="text-[11px] text-muted">
                          {s.Timestamp} · {s.Sector}
                        </p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

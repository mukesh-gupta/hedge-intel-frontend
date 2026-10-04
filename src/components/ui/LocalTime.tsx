"use client";

import { useHydrated } from "@/lib/useHydrated";
import { formatSignalTime, formatSignalDateTime } from "@/lib/signal-style";

/**
 * A signal's publish time in the viewer's own locale and timezone. Formatting it
 * during server rendering uses the server's locale and timezone instead (UTC in
 * production), so the text differed from the browser's and React threw a hydration
 * error on every page that lists signals. Same approach as LiveClock: the time is
 * left empty until the page is hydrated, then filled in by the browser.
 */
export default function LocalTime({
  timestamp,
  withDate = false,
  className,
}: {
  timestamp: string;
  withDate?: boolean;
  className?: string;
}) {
  const hydrated = useHydrated();
  const format = withDate ? formatSignalDateTime : formatSignalTime;
  return (
    <time dateTime={timestamp} className={className}>
      {hydrated ? format(timestamp) : null}
    </time>
  );
}

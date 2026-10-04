"use client";

import { useEffect, useState } from "react";

/**
 * Renders nothing until mounted, then shows the current time and updates it
 * every second. Rendering `new Date()` directly during render is a classic
 * hydration mismatch — the server-rendered timestamp and the client's first
 * render happen at different instants (and can even use different locale
 * defaults), so React sees mismatched text content. Returning null until the
 * post-mount effect runs keeps the server and pre-effect client render
 * identical.
 *
 * @param {{ className?: string }} props
 */
export default function LiveClock({ className }) {
  const [now, setNow] = useState(/** @type {string | null} */ (null));

  useEffect(() => {
    const update = () => setNow(new Date().toLocaleString());
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return null;
  return <span className={className}>{now}</span>;
}

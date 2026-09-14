"use client";

import { useEffect } from "react";
import { applyTheme, getTheme } from "@/lib/themeStore";

/** Applies the persisted theme on mount. A brief flash of the default dark
 * theme is possible before hydration; acceptable trade-off for keeping this
 * simple rather than injecting a blocking inline script. */
export default function ThemeInit() {
  useEffect(() => {
    applyTheme(getTheme());
  }, []);
  return null;
}

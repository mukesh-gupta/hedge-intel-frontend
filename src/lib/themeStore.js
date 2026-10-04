"use client";

/** @typedef {"dark" | "light"} Theme */

const STORAGE_KEY = "hedge-intel:theme";

/** @returns {Theme} */
export function getTheme() {
  if (typeof window === "undefined") return "dark";
  try {
    return /** @type {Theme | null} */ (localStorage.getItem(STORAGE_KEY)) || "dark";
  } catch {
    return "dark";
  }
}

/** @param {Theme} theme */
export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}

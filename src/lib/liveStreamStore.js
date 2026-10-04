"use client";

const STORAGE_KEY = "hedge-intel:live-stream-enabled";
const EVENT_NAME = "hedge-intel:live-stream-change";

/** @returns {boolean} */
export function getLiveStreamEnabled() {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === null ? true : raw === "true";
  } catch {
    return true;
  }
}

/** @param {boolean} enabled */
export function setLiveStreamEnabled(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: enabled }));
}

/**
 * @param {(enabled: boolean) => void} cb
 * @returns {() => void}
 */
export function subscribeLiveStream(cb) {
  /** @param {Event} e */
  const handler = (e) => cb(/** @type {CustomEvent<boolean>} */ (e).detail);
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}

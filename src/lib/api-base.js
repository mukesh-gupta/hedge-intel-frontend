/**
 * Where the browser reads data from.
 *
 * With NEXT_PUBLIC_HEDGE_API_BASE_URL set (the backend's public URL, inlined into the
 * bundle at build time), every poll and the live stream go straight to the backend:
 * no Vercel function runs per request, which is what kept exhausting the Hobby plan's
 * monthly allowance. Without it they fall back to the same-origin /api proxy routes.
 *
 * Writes (scan, watchlist edits, settings) always use the proxy: they carry the admin
 * token, which lives only on the server.
 */
const PUBLIC_BASE = (process.env.NEXT_PUBLIC_HEDGE_API_BASE_URL ?? "").replace(/\/+$/, "");

export const DIRECT_READS = PUBLIC_BASE !== "";

/**
 * @param {string} path a same-origin API path such as `/api/signals` (query string allowed)
 * @returns {string} the URL the browser should fetch
 */
export function readUrl(path) {
  return DIRECT_READS ? `${PUBLIC_BASE}${path}` : path;
}

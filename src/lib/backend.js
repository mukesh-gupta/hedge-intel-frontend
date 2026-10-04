const BASE_URL = process.env.HEDGE_API_BASE_URL ?? "http://127.0.0.1:8000";
// Must match the backend's ADMIN_TOKEN, which guards its write endpoints (settings,
// watchlist edits, scans). Server-only env var: never prefixed NEXT_PUBLIC_, so it
// never reaches the browser.
const ADMIN_TOKEN = process.env.HEDGE_API_ADMIN_TOKEN;

export class BackendError extends Error {
  /**
   * @param {string} message
   * @param {number} status
   */
  constructor(message, status) {
    super(message);
    /** @type {number} */
    this.status = status;
  }
}

/**
 * Server-only fetch helper. Runs on the Next.js server (route handlers /
 * server components) so the backend origin is never exposed to the browser.
 *
 * @template T
 * @param {string} path
 * @param {RequestInit & { revalidateSeconds?: number }} [init]
 * @returns {Promise<T>}
 */
export async function backendFetch(path, init = {}) {
  const { revalidateSeconds, ...rest } = init;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(ADMIN_TOKEN ? { "X-Admin-Token": ADMIN_TOKEN } : {}),
      ...(rest.headers ?? {}),
    },
    next: revalidateSeconds !== undefined ? { revalidate: revalidateSeconds } : undefined,
    cache: revalidateSeconds === undefined ? "no-store" : undefined,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new BackendError(
      `Backend request to ${path} failed with ${res.status}: ${body.slice(0, 300)}`,
      res.status
    );
  }

  const text = await res.text();
  return text ? JSON.parse(text) : /** @type {T} */ ({});
}

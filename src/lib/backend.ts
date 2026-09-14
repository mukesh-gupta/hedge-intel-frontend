const BASE_URL = process.env.HEDGE_API_BASE_URL ?? "http://127.0.0.1:8000";

export class BackendError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Server-only fetch helper. Runs on the Next.js server (route handlers /
 * server components) so the backend origin is never exposed to the browser.
 */
export async function backendFetch<T>(
  path: string,
  init: RequestInit & { revalidateSeconds?: number } = {}
): Promise<T> {
  const { revalidateSeconds, ...rest } = init;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      Accept: "application/json",
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
  return (text ? JSON.parse(text) : ({} as T)) as T;
}

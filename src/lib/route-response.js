import { NextResponse } from "next/server";

/**
 * A JSON response Vercel's edge cache may serve for `seconds` without invoking this
 * function again, and for twice as long while it refreshes a copy in the background.
 * The browser itself always revalidates (`max-age=0`), so a reader never sees anything
 * older than the edge copy.
 *
 * Only for reads this app never mutates. The watchlist and settings routes stay
 * uncached so a refetch right after a write is never stale.
 *
 * @param {unknown} data
 * @param {number} seconds
 */
export function cachedJson(data, seconds) {
  const directive = `public, max-age=0, s-maxage=${seconds}, stale-while-revalidate=${seconds * 2}`;
  return NextResponse.json(data, {
    headers: { "Cache-Control": directive, "CDN-Cache-Control": directive },
  });
}

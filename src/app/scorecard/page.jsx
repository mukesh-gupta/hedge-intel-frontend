import { backendFetch } from "@/lib/backend";
import { emptyScorecard, emptySpeed } from "@/lib/scorecard";
import ScreenHeader from "@/components/ScreenHeader";
import ScorecardContent from "@/components/scorecard/ScorecardContent";
import SpeedPanel from "@/components/scorecard/SpeedPanel";

/** @import { ScorecardResponse, SpeedResponse } from "@/lib/types" */

/**
 * The fallback is what the page shows if the backend can't be reached; the client's own
 * polling then retries.
 *
 * @template T
 * @param {string} path
 * @param {T} fallback
 * @returns {Promise<T>}
 */
async function fetchOr(path, fallback) {
  try {
    return await backendFetch(path, { revalidateSeconds: 60 });
  } catch {
    return fallback;
  }
}

export default async function ScorecardPage() {
  const [scorecard, speed] = await Promise.all([
    fetchOr("/api/scorecard?days=7", /** @type {ScorecardResponse} */ (emptyScorecard(7))),
    fetchOr("/api/speed", /** @type {SpeedResponse} */ (emptySpeed())),
  ]);

  return (
    <>
      <ScreenHeader title="Scorecard" eyebrow="Did the signals come true?" back="/more" />
      <ScorecardContent initialData={scorecard} />
      <SpeedPanel initialData={speed} />
    </>
  );
}

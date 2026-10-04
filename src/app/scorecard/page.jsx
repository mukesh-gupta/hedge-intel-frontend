import { backendFetch } from "@/lib/backend";
import { emptyScorecard } from "@/lib/scorecard";
import ScreenHeader from "@/components/ScreenHeader";
import ScorecardContent from "@/components/scorecard/ScorecardContent";

/** @import { ScorecardResponse } from "@/lib/types" */

export default async function ScorecardPage() {
  /** @type {ScorecardResponse} */
  let scorecard = emptyScorecard(7);
  try {
    scorecard = await backendFetch("/api/scorecard?days=7", { revalidateSeconds: 60 });
  } catch {
    // Backend unreachable: render the empty scorecard and let the client poll retry.
  }

  return (
    <>
      <ScreenHeader title="Scorecard" eyebrow="Did the signals come true?" back="/more" />
      <ScorecardContent initialData={scorecard} />
    </>
  );
}

import { backendFetch } from "@/lib/backend";
import ScreenHeader from "@/components/ScreenHeader";
import WatchlistContent from "@/components/watchlist/WatchlistContent";

/** @import { WatchlistResponse } from "@/lib/types" */

export default async function WatchlistPage() {
  /** @type {WatchlistResponse} */
  let watchlist = { watchlist: [] };
  try {
    watchlist = await backendFetch("/api/watchlist", { revalidateSeconds: 15 });
  } catch {
    // client-side polling will retry
  }
  return (
    <>
      <ScreenHeader title="Watchlist" back="/more" />
      <WatchlistContent initialData={watchlist} />
    </>
  );
}

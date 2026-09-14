import { backendFetch } from "@/lib/backend";
import type { WatchlistResponse } from "@/lib/types";
import ScreenHeader from "@/components/ScreenHeader";
import WatchlistContent from "@/components/watchlist/WatchlistContent";

export default async function WatchlistPage() {
  let watchlist: WatchlistResponse = { watchlist: [] };
  try {
    watchlist = await backendFetch<WatchlistResponse>("/api/watchlist", { revalidateSeconds: 15 });
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

import { backendFetch } from "@/lib/backend";
import HomeContent from "@/components/home/HomeContent";

/**
 * @template T
 * @param {() => Promise<T>} fn
 * @param {T} fallback
 * @returns {Promise<T>}
 */
async function safe(fn, fallback) {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export default async function Home() {
  // Signals come from the app-wide SignalsProvider (see layout.jsx) so every
  // screen shares one source of truth. Fetched in parallel and
  // server-rendered so every other widget has real data on first paint too.
  const [indices, forex, regime, sectors, watchlist] = await Promise.all([
    safe(
      () =>
        backendFetch("/api/market-data?category=indices&history=true", {
          revalidateSeconds: 20,
        }),
      { category: "indices", assets: [] }
    ),
    safe(
      () =>
        backendFetch("/api/market-data?category=forex&history=true", {
          revalidateSeconds: 20,
        }),
      { category: "forex", assets: [] }
    ),
    safe(() => backendFetch("/api/market-regime", { revalidateSeconds: 20 }), null),
    safe(() => backendFetch("/api/sectors?timeframe=1D", { revalidateSeconds: 30 }), {
      timeframe: "1D",
      sectors: [],
    }),
    safe(() => backendFetch("/api/watchlist", { revalidateSeconds: 20 }), { watchlist: [] }),
  ]);

  return (
    <HomeContent
      initialIndices={indices}
      initialForex={forex}
      initialRegime={regime}
      initialSectors={sectors}
      initialWatchlist={watchlist}
    />
  );
}

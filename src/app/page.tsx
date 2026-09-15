import { backendFetch } from "@/lib/backend";
import type {
  MarketDataResponse,
  MarketRegimeResponse,
  SectorsResponse,
  WatchlistResponse,
} from "@/lib/types";
import HomeContent from "@/components/home/HomeContent";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export default async function Home() {
  // Signals come from the app-wide SignalsProvider (see layout.tsx) so every
  // screen shares one source of truth. Fetched in parallel and
  // server-rendered so every other widget has real data on first paint too.
  const [indices, forex, regime, sectors, watchlist] = await Promise.all([
    safe<MarketDataResponse>(
      () =>
        backendFetch<MarketDataResponse>("/api/market-data?category=indices&history=true", {
          revalidateSeconds: 20,
        }),
      { category: "indices", assets: [] }
    ),
    safe<MarketDataResponse>(
      () =>
        backendFetch<MarketDataResponse>("/api/market-data?category=forex&history=true", {
          revalidateSeconds: 20,
        }),
      { category: "forex", assets: [] }
    ),
    safe<MarketRegimeResponse | null>(
      () => backendFetch<MarketRegimeResponse>("/api/market-regime", { revalidateSeconds: 20 }),
      null
    ),
    safe<SectorsResponse>(
      () =>
        backendFetch<SectorsResponse>("/api/sectors?timeframe=1D", { revalidateSeconds: 30 }),
      { timeframe: "1D", sectors: [] }
    ),
    safe<WatchlistResponse>(
      () => backendFetch<WatchlistResponse>("/api/watchlist", { revalidateSeconds: 20 }),
      { watchlist: [] }
    ),
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

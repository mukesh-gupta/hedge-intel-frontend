import { backendFetch } from "@/lib/backend";
import type {
  SignalsResponse,
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
  // Fetched in parallel and server-rendered so every widget has real data on
  // first paint instead of fetching client-side after hydration.
  const [signals, indices, forex, regime, sectors, watchlist] = await Promise.all([
    safe<SignalsResponse>(
      () => backendFetch<SignalsResponse>("/api/signals", { revalidateSeconds: 30 }),
      { signals: [] }
    ),
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
      initialSignals={signals}
      initialIndices={indices}
      initialForex={forex}
      initialRegime={regime}
      initialSectors={sectors}
      initialWatchlist={watchlist}
    />
  );
}

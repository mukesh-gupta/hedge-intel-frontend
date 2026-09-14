import { backendFetch } from "@/lib/backend";
import type { TickerBarResponse, MarketDataResponse, SectorsResponse } from "@/lib/types";
import { MARKET_TABS, MARKET_DATA_CATEGORY, type MarketCategory } from "@/lib/market-categories";
import ScreenHeader from "@/components/ScreenHeader";
import MarketsContent from "@/components/markets/MarketsContent";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export default async function MarketsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const resolvedTab: MarketCategory = MARKET_TABS.includes(tab as MarketCategory)
    ? (tab as MarketCategory)
    : "Indices";

  // Only the initially-selected tab is server-rendered — other tabs are
  // fetched on demand when the user actually switches to them.
  const [ticker, initialCategoryData, initialSectorsData] = await Promise.all([
    safe<TickerBarResponse>(
      () => backendFetch<TickerBarResponse>("/api/ticker-bar", { revalidateSeconds: 20 }),
      { ticker_bar: [] }
    ),
    resolvedTab in MARKET_DATA_CATEGORY
      ? safe<MarketDataResponse>(
          () =>
            backendFetch<MarketDataResponse>(
              `/api/market-data?category=${MARKET_DATA_CATEGORY[resolvedTab]}&history=true`,
              { revalidateSeconds: 20 }
            ),
          { category: MARKET_DATA_CATEGORY[resolvedTab], assets: [] }
        )
      : Promise.resolve(null),
    resolvedTab === "Sectors"
      ? safe<SectorsResponse>(
          () =>
            backendFetch<SectorsResponse>("/api/sectors?timeframe=1D", { revalidateSeconds: 30 }),
          { timeframe: "1D", sectors: [] }
        )
      : Promise.resolve(null),
  ]);

  return (
    <>
      <ScreenHeader title="Market Data" eyebrow="Markets" />
      <MarketsContent
        initialTicker={ticker}
        initialTab={resolvedTab}
        initialCategoryData={initialCategoryData}
        initialSectorsData={initialSectorsData}
      />
    </>
  );
}

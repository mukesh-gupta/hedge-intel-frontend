import { backendFetch } from "@/lib/backend";
import { resolveMarketTab, MARKET_DATA_CATEGORY } from "@/lib/market-categories";
import ScreenHeader from "@/components/ScreenHeader";
import MarketsContent from "@/components/markets/MarketsContent";

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

/** @param {{ searchParams: Promise<{ tab?: string }>; }} props */
export default async function MarketsPage({ searchParams }) {
  const { tab } = await searchParams;
  const resolvedTab = resolveMarketTab(tab);

  // Only the initially-selected tab is server-rendered — other tabs are
  // fetched on demand when the user actually switches to them.
  const [ticker, initialCategoryData, initialSectorsData] = await Promise.all([
    safe(() => backendFetch("/api/ticker-bar", { revalidateSeconds: 20 }), { ticker_bar: [] }),
    resolvedTab in MARKET_DATA_CATEGORY
      ? safe(
          () =>
            backendFetch(
              `/api/market-data?category=${MARKET_DATA_CATEGORY[resolvedTab]}&history=true`,
              { revalidateSeconds: 20 }
            ),
          { category: MARKET_DATA_CATEGORY[resolvedTab], assets: [] }
        )
      : Promise.resolve(null),
    resolvedTab === "Sectors"
      ? safe(() => backendFetch("/api/sectors?timeframe=1D", { revalidateSeconds: 30 }), {
          timeframe: "1D",
          sectors: [],
        })
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

export type MarketDataCategory = "indices" | "commodities" | "forex" | "bonds";

export type MarketCategory = "Indices" | "Commodities" | "Forex" | "Bonds" | "Crypto" | "Sectors";

export const MARKET_TABS: MarketCategory[] = [
  "Indices",
  "Commodities",
  "Forex",
  "Bonds",
  "Crypto",
  "Sectors",
];

export const MARKET_DATA_CATEGORY: Record<string, MarketDataCategory> = {
  Indices: "indices",
  Commodities: "commodities",
  Forex: "forex",
  Bonds: "bonds",
};

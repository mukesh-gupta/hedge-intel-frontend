/** @typedef {"indices" | "commodities" | "forex" | "bonds"} MarketDataCategory */

/** @typedef {"Indices" | "Commodities" | "Forex" | "Bonds" | "Crypto" | "Sectors"} MarketCategory */

/** @type {MarketCategory[]} */
export const MARKET_TABS = ["Indices", "Commodities", "Forex", "Bonds", "Crypto", "Sectors"];

/**
 * @param {string | undefined} tab a tab name from the URL
 * @returns {MarketCategory} that tab if it is a real one, otherwise "Indices"
 */
export function resolveMarketTab(tab) {
  return MARKET_TABS.find((t) => t === tab) ?? "Indices";
}

/** @type {Record<string, MarketDataCategory>} */
export const MARKET_DATA_CATEGORY = {
  Indices: "indices",
  Commodities: "commodities",
  Forex: "forex",
  Bonds: "bonds",
};

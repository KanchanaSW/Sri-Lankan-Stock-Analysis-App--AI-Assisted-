// Convex service layer for real-time data
// This provides hooks for components to use Convex data

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { StockWithScores, MarketOverview, SectorData, FilterOptions, StockData, OHLCData, StockScores } from "./types";
import { calculateStockScores } from "./scoring";
import { generateAIExplanation } from "./explanations";
import { Doc, Id } from "../convex/_generated/dataModel";

// Type for Convex stock with OHLC data
type ConvexStock = Doc<"stocks"> & {
  historicalData: Doc<"ohlcData">[];
  aiExplanation?: {
    summary: string;
    longTermAnalysis: string;
    shortTermAnalysis: string;
    riskLevel: 'Low' | 'Medium' | 'High';
    riskReasoning: string;
    keyStrengths: string[];
    keyConcerns: string[];
    generatedAt: number;
  };
  scores?: StockScores;
};

/**
 * Transform Convex stock data to app StockData format
 */
function transformConvexStock(stock: ConvexStock, index: number): StockData {
  return {
    id: (index + 1).toString(), // Use index-based ID for backward compatibility
    symbol: stock.symbol,
    name: stock.name,
    sector: stock.sector,
    marketCap: stock.marketCap,
    currentPrice: stock.currentPrice,
    priceChange: stock.priceChange,
    weekHigh52: stock.weekHigh52,
    weekLow52: stock.weekLow52,
    historicalData: stock.historicalData.map((ohlc): OHLCData => ({
      date: ohlc.date,
      open: ohlc.open,
      high: ohlc.high,
      low: ohlc.low,
      close: ohlc.close,
      volume: ohlc.volume,
    })),
  };
}

/**
 * Process stock data to add scores and explanations
 * Uses stored AI explanation if available, otherwise falls back to template
 */
function processStockData(stock: StockData, convexStock?: ConvexStock): StockWithScores {
  // Use stored scores if available, otherwise calculate locally (fallback)
  const scores = convexStock?.scores
    ? (convexStock.scores as unknown as StockScores) // Direct cast from JSON store
    : calculateStockScores(stock);

  // Use stored AI explanation if available, otherwise generate from template
  const explanation = convexStock?.aiExplanation
    ? convexStock.aiExplanation
    : generateAIExplanation(scores);

  return {
    ...stock,
    scores,
    explanation,
  };
}

/**
 * Hook to get all stocks with scores
 */
export function useAllStocks(): {
  stocks: StockWithScores[];
  isLoading: boolean;
} {
  const stocksData = useQuery(api.stocks.getAllStocks);

  if (stocksData === undefined) {
    return { stocks: [], isLoading: true };
  }

  // Sort by creation time to maintain consistent order
  const sortedStocks = [...stocksData].sort(
    (a, b) => (a._creationTime ?? 0) - (b._creationTime ?? 0)
  );

  const stocks = sortedStocks.map((stock, index) => {
    const convexStock = stock as ConvexStock;
    return processStockData(transformConvexStock(convexStock, index), convexStock);
  });

  return { stocks, isLoading: false };
}

/**
 * Hook to get a single stock by legacy ID
 */
export function useStockById(legacyId: string): {
  stock: StockWithScores | null;
  isLoading: boolean;
} {
  const stockData = useQuery(api.stocks.getStockByLegacyId, { legacyId });

  if (stockData === undefined) {
    return { stock: null, isLoading: true };
  }

  if (stockData === null) {
    return { stock: null, isLoading: false };
  }

  const index = parseInt(legacyId, 10) - 1;
  const convexStock = stockData as ConvexStock;
  const stock = processStockData(transformConvexStock(convexStock, index), convexStock);

  return { stock, isLoading: false };
}

/**
 * Hook to get market overview
 */
export function useMarketOverview(): {
  overview: MarketOverview | null;
  isLoading: boolean;
} {
  const data = useQuery(api.queries.getMarketOverview);

  if (data === undefined) {
    return { overview: null, isLoading: true };
  }

  if (data === null) {
    return { overview: null, isLoading: false };
  }

  return {
    overview: {
      totalStocks: data.totalStocks,
      marketsUp: data.marketsUp,
      marketsDown: data.marketsDown,
      totalVolume: data.totalVolume,
      lastUpdated: data.lastUpdated,
    },
    isLoading: false,
  };
}

/**
 * Hook to get all sectors
 */
export function useSectors(): {
  sectors: SectorData[];
  isLoading: boolean;
} {
  const data = useQuery(api.queries.getSectors);

  if (data === undefined) {
    return { sectors: [], isLoading: true };
  }

  const sectors = data.map((sector): SectorData => ({
    name: sector.name,
    averagePerformance: sector.averagePerformance,
    stockCount: sector.stockCount,
    trending: sector.trending,
  }));

  return { sectors, isLoading: false };
}

/**
 * Hook to check if database is seeded
 */
export function useIsSeeded(): boolean | undefined {
  return useQuery(api.queries.isSeeded);
}

/**
 * Hook to get available sectors
 */
export function useAvailableSectors(): string[] {
  const data = useQuery(api.stocks.getAvailableSectors);
  return data ?? ["All"];
}

/**
 * Filter stocks based on criteria (client-side filtering)
 */
export function filterStocksClient(
  stocks: StockWithScores[],
  options: FilterOptions
): StockWithScores[] {
  let filtered = [...stocks];

  // Filter by sector
  if (options.sector && options.sector !== "All") {
    filtered = filtered.filter((stock) => stock.sector === options.sector);
  }

  // Filter by investment type
  if (options.investmentType !== "all") {
    filtered = filtered.filter((stock) => {
      if (options.investmentType === "very-long-term") {
        return stock.scores.veryLongTermScore >= 70;
      }
      if (options.investmentType === "long-term") {
        return stock.scores.longTermScore >= 70;
      }
      if (options.investmentType === "short-term") {
        return stock.scores.shortTermScore >= 70;
      }
      return true;
    });
  }

  // Filter by market cap range
  if (options.minMarketCap !== undefined) {
    filtered = filtered.filter((stock) => stock.marketCap >= options.minMarketCap!);
  }
  if (options.maxMarketCap !== undefined) {
    filtered = filtered.filter((stock) => stock.marketCap <= options.maxMarketCap!);
  }

  // Sort
  filtered = sortStocksClient(filtered, options.sortBy);

  return filtered;
}

/**
 * Sort stocks by specified option (client-side)
 */
export function sortStocksClient(
  stocks: StockWithScores[],
  sortBy: string
): StockWithScores[] {
  const sorted = [...stocks];

  switch (sortBy) {
    case "very-long-term":
      return sorted.sort((a, b) => b.scores.veryLongTermScore - a.scores.veryLongTermScore);

    case "long-term":
      return sorted.sort((a, b) => b.scores.longTermScore - a.scores.longTermScore);

    case "short-term":
      return sorted.sort((a, b) => b.scores.shortTermScore - a.scores.shortTermScore);

    case "price":
      return sorted.sort((a, b) => b.currentPrice - a.currentPrice);

    case "change":
      return sorted.sort((a, b) => b.priceChange - a.priceChange);

    default:
      return sorted;
  }
}

/**
 * Get top N stocks by long-term score (client-side)
 */
export function getTopLongTermStocksClient(
  stocks: StockWithScores[],
  limit: number = 5
): StockWithScores[] {
  return [...stocks]
    .sort((a, b) => b.scores.longTermScore - a.scores.longTermScore)
    .slice(0, limit);
}

/**
 * Get top N stocks by short-term score (client-side)
 */
export function getTopShortTermStocksClient(
  stocks: StockWithScores[],
  limit: number = 5
): StockWithScores[] {
  return [...stocks]
    .sort((a, b) => b.scores.shortTermScore - a.scores.shortTermScore)
    .slice(0, limit);
}

/**
 * Get top N stocks by very-long-term score (client-side)
 */
export function getTopVeryLongTermStocksClient(
  stocks: StockWithScores[],
  limit: number = 5
): StockWithScores[] {
  return [...stocks]
    .sort((a, b) => b.scores.veryLongTermScore - a.scores.veryLongTermScore)
    .slice(0, limit);
}

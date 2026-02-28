import { query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// Type for stock with historical data
export type StockWithHistory = Doc<"stocks"> & {
  historicalData: Doc<"ohlcData">[];
};

/**
 * Get all stocks with their historical OHLC data
 */
export const getAllStocks = query({
  args: {},
  handler: async (ctx): Promise<StockWithHistory[]> => {
    const stocks = await ctx.db.query("stocks").collect();

    // Fetch historical data for each stock
    const stocksWithHistory = await Promise.all(
      stocks.map(async (stock) => {
        const historicalData = await ctx.db
          .query("ohlcData")
          .withIndex("by_stock", (q) => q.eq("stockId", stock._id))
          .collect();

        // Sort by date ascending
        historicalData.sort((a, b) => a.date.localeCompare(b.date));

        return {
          ...stock,
          historicalData,
        };
      })
    );

    return stocksWithHistory;
  },
});

/**
 * Get a single stock by its Convex ID
 */
export const getStockById = query({
  args: { id: v.id("stocks") },
  handler: async (ctx, args): Promise<StockWithHistory | null> => {
    const stock = await ctx.db.get(args.id);

    if (!stock) {
      return null;
    }

    const historicalData = await ctx.db
      .query("ohlcData")
      .withIndex("by_stock", (q) => q.eq("stockId", stock._id))
      .collect();

    // Sort by date ascending
    historicalData.sort((a, b) => a.date.localeCompare(b.date));

    return {
      ...stock,
      historicalData,
    };
  },
});

/**
 * Get a stock by its legacy string ID (for backward compatibility)
 * This searches stocks by matching the order they were inserted
 */
export const getStockByLegacyId = query({
  args: { legacyId: v.string() },
  handler: async (ctx, args): Promise<StockWithHistory | null> => {
    // Get all stocks and find by legacy ID pattern
    // The legacy ID was a simple numeric string like "1", "2", etc.
    const stocks = await ctx.db.query("stocks").collect();

    // Sort by creation time to maintain order
    stocks.sort((a, b) => (a._creationTime ?? 0) - (b._creationTime ?? 0));

    // Find by legacy index (1-based)
    const legacyIndex = parseInt(args.legacyId, 10);
    if (isNaN(legacyIndex) || legacyIndex < 1 || legacyIndex > stocks.length) {
      return null;
    }

    const stock = stocks[legacyIndex - 1];
    if (!stock) {
      return null;
    }

    const historicalData = await ctx.db
      .query("ohlcData")
      .withIndex("by_stock", (q) => q.eq("stockId", stock._id))
      .collect();

    // Sort by date ascending
    historicalData.sort((a, b) => a.date.localeCompare(b.date));

    return {
      ...stock,
      historicalData,
    };
  },
});

/**
 * Get a stock by symbol
 */
export const getStockBySymbol = query({
  args: { symbol: v.string() },
  handler: async (ctx, args): Promise<StockWithHistory | null> => {
    const stock = await ctx.db
      .query("stocks")
      .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
      .first();

    if (!stock) {
      return null;
    }

    const historicalData = await ctx.db
      .query("ohlcData")
      .withIndex("by_stock", (q) => q.eq("stockId", stock._id))
      .collect();

    // Sort by date ascending
    historicalData.sort((a, b) => a.date.localeCompare(b.date));

    return {
      ...stock,
      historicalData,
    };
  },
});

/**
 * Get stocks by sector
 */
export const getStocksBySector = query({
  args: { sector: v.string() },
  handler: async (ctx, args): Promise<StockWithHistory[]> => {
    const stocks = await ctx.db
      .query("stocks")
      .withIndex("by_sector", (q) => q.eq("sector", args.sector))
      .collect();

    // Fetch historical data for each stock
    const stocksWithHistory = await Promise.all(
      stocks.map(async (stock) => {
        const historicalData = await ctx.db
          .query("ohlcData")
          .withIndex("by_stock", (q) => q.eq("stockId", stock._id))
          .collect();

        // Sort by date ascending
        historicalData.sort((a, b) => a.date.localeCompare(b.date));

        return {
          ...stock,
          historicalData,
        };
      })
    );

    return stocksWithHistory;
  },
});

/**
 * Get all available sectors from stocks
 */
export const getAvailableSectors = query({
  args: {},
  handler: async (ctx): Promise<string[]> => {
    const stocks = await ctx.db.query("stocks").collect();
    const sectors = new Set(stocks.map((stock) => stock.sector));
    return ["All", ...Array.from(sectors).sort()];
  },
});

/**
 * Get all stocks without historical data for efficient filtering
 */
export const getBasicStocks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("stocks").collect();
  },
});

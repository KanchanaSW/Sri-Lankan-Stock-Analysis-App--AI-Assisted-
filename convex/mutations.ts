import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Helper function to generate realistic OHLC data based on current price
function generateHistoricalData(
  basePrice: number,
  days: number = 90,
  volatility: number = 0.02,
  trend: number = 0.0002
): Array<{
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}> {
  const data: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }> = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Start price lower so trend leads to current price
  let currentPrice = basePrice * 0.9;

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue;
    }

    // Use a seeded random for reproducibility
    const seedRandom = () => {
      const x = Math.sin(i * 12.9898 + basePrice * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };

    // Add trend and random walk
    const trendChange = trend * currentPrice;
    const randomChange = (seedRandom() - 0.5) * volatility * currentPrice;
    currentPrice = currentPrice + trendChange + randomChange;

    // Generate OHLC
    const dailyVolatility = volatility * currentPrice * 0.5;
    const open = currentPrice + (seedRandom() - 0.5) * dailyVolatility;
    const close = currentPrice + (seedRandom() - 0.5) * dailyVolatility;
    const high = Math.max(open, close) + seedRandom() * dailyVolatility * 0.5;
    const low = Math.min(open, close) - seedRandom() * dailyVolatility * 0.5;
    const volume = Math.floor(
      (500000 + seedRandom() * 1000000) * (1 + seedRandom() * 0.5)
    );

    data.push({
      date: date.toISOString().split("T")[0],
      open: Math.max(0.01, open),
      high: Math.max(0.01, high),
      low: Math.max(0.01, low),
      close: Math.max(0.01, close),
      volume,
    });
  }

  return data;
}

/**
 * Update a stock's current price and price change
 */
export const updateStockPrice = mutation({
  args: {
    stockId: v.id("stocks"),
    currentPrice: v.number(),
    priceChange: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.stockId, {
      currentPrice: args.currentPrice,
      priceChange: args.priceChange,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update a stock's full data
 */
export const updateStock = mutation({
  args: {
    stockId: v.id("stocks"),
    symbol: v.optional(v.string()),
    name: v.optional(v.string()),
    sector: v.optional(v.string()),
    marketCap: v.optional(v.number()),
    currentPrice: v.optional(v.number()),
    priceChange: v.optional(v.number()),
    weekHigh52: v.optional(v.number()),
    weekLow52: v.optional(v.number()),
    scores: v.optional(v.any()), // Using any for flexibility in updates
  },
  handler: async (ctx, args) => {
    const { stockId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(stockId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Add a new OHLC data entry for a stock
 */
export const addOHLCData = mutation({
  args: {
    stockId: v.id("stocks"),
    date: v.string(),
    open: v.number(),
    high: v.number(),
    low: v.number(),
    close: v.number(),
    volume: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if data for this date already exists
    const existing = await ctx.db
      .query("ohlcData")
      .withIndex("by_stock_date", (q) =>
        q.eq("stockId", args.stockId).eq("date", args.date)
      )
      .first();

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        open: args.open,
        high: args.high,
        low: args.low,
        close: args.close,
        volume: args.volume,
      });
    } else {
      // Insert new record
      await ctx.db.insert("ohlcData", args);
    }
  },
});

/**
 * Update sector data
 */
export const updateSectorData = mutation({
  args: {
    name: v.string(),
    averagePerformance: v.optional(v.number()),
    stockCount: v.optional(v.number()),
    trending: v.optional(v.union(v.literal("up"), v.literal("down"), v.literal("stable"))),
  },
  handler: async (ctx, args) => {
    const sector = await ctx.db
      .query("sectors")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (sector) {
      const { name, ...updates } = args;
      const filteredUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
      );
      await ctx.db.patch(sector._id, filteredUpdates);
    }
  },
});

/**
 * Update market overview
 */
export const updateMarketOverview = mutation({
  args: {
    totalStocks: v.optional(v.number()),
    marketsUp: v.optional(v.number()),
    marketsDown: v.optional(v.number()),
    totalVolume: v.optional(v.string()),
    lastUpdated: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const overview = await ctx.db.query("marketOverview").first();

    const filteredUpdates = Object.fromEntries(
      Object.entries(args).filter(([_, v]) => v !== undefined)
    );

    if (overview) {
      await ctx.db.patch(overview._id, filteredUpdates);
    } else {
      // Create if doesn't exist
      await ctx.db.insert("marketOverview", {
        totalStocks: args.totalStocks ?? 0,
        marketsUp: args.marketsUp ?? 0,
        marketsDown: args.marketsDown ?? 0,
        totalVolume: args.totalVolume ?? "Rs. 0",
        lastUpdated: args.lastUpdated ?? new Date().toISOString().split('T')[0],
      });
    }
  },
});

/**
 * Create a new stock
 */
export const createStock = mutation({
  args: {
    symbol: v.string(),
    name: v.string(),
    sector: v.string(),
    marketCap: v.number(),
    currentPrice: v.number(),
    priceChange: v.number(),
    weekHigh52: v.number(),
    weekLow52: v.number(),
  },
  handler: async (ctx, args): Promise<Id<"stocks">> => {
    const now = Date.now();
    return await ctx.db.insert("stocks", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Batch update multiple stocks at once (for scraper efficiency)
 */
export const batchUpdateStocks = mutation({
  args: {
    updates: v.array(
      v.object({
        stockId: v.id("stocks"),
        currentPrice: v.optional(v.number()),
        priceChange: v.optional(v.number()),
        weekHigh52: v.optional(v.number()),
        weekLow52: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    for (const update of args.updates) {
      const { stockId, ...fields } = update;
      const filteredFields = Object.fromEntries(
        Object.entries(fields).filter(([_, v]) => v !== undefined)
      );

      await ctx.db.patch(stockId, {
        ...filteredFields,
        updatedAt: now,
      });
    }

    return { updated: args.updates.length };
  },
});

/**
 * Batch insert/update OHLC data (for historical data sync)
 */
export const batchAddOHLCData = mutation({
  args: {
    stockId: v.id("stocks"),
    data: v.array(
      v.object({
        date: v.string(),
        open: v.number(),
        high: v.number(),
        low: v.number(),
        close: v.number(),
        volume: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    let insertedCount = 0;
    let updatedCount = 0;

    for (const ohlc of args.data) {
      // Check if data for this date already exists
      const existing = await ctx.db
        .query("ohlcData")
        .withIndex("by_stock_date", (q) =>
          q.eq("stockId", args.stockId).eq("date", ohlc.date)
        )
        .first();

      if (existing) {
        // Update existing record
        await ctx.db.patch(existing._id, ohlc);
        updatedCount++;
      } else {
        // Insert new record
        await ctx.db.insert("ohlcData", {
          stockId: args.stockId,
          ...ohlc,
        });
        insertedCount++;
      }
    }

    return { inserted: insertedCount, updated: updatedCount };
  },
});

/**
 * Delete all data (for testing/reset purposes)
 */
export const clearAllData = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all OHLC data
    const ohlcData = await ctx.db.query("ohlcData").collect();
    for (const data of ohlcData) {
      await ctx.db.delete(data._id);
    }

    // Delete all stocks
    const stocks = await ctx.db.query("stocks").collect();
    for (const stock of stocks) {
      await ctx.db.delete(stock._id);
    }

    // Delete all sectors
    const sectors = await ctx.db.query("sectors").collect();
    for (const sector of sectors) {
      await ctx.db.delete(sector._id);
    }

    // Delete market overview
    const overviews = await ctx.db.query("marketOverview").collect();
    for (const overview of overviews) {
      await ctx.db.delete(overview._id);
    }
  },
});

/**
 * Replace all stocks with a new list (for dynamic stock discovery)
 * Atomically clears existing stocks and inserts new ones
 * Also generates synthetic historical data for charts
 */
export const replaceAllStocks = mutation({
  args: {
    stocks: v.array(
      v.object({
        symbol: v.string(),
        name: v.string(),
        sector: v.string(),
        marketCap: v.number(),
        currentPrice: v.number(),
        priceChange: v.number(),
        weekHigh52: v.number(),
        weekLow52: v.number(),
        perfY: v.optional(v.number()),
        perf5Y: v.optional(v.number()),
        aiExplanation: v.optional(v.object({
          summary: v.string(),
          veryLongTermAnalysis: v.optional(v.string()),
          longTermAnalysis: v.string(),
          shortTermAnalysis: v.string(),
          riskLevel: v.union(v.literal("Low"), v.literal("Medium"), v.literal("High")),
          riskReasoning: v.string(),
          keyStrengths: v.array(v.string()),
          keyConcerns: v.array(v.string()),
          generatedAt: v.number(),
        })),
        scores: v.optional(v.any()),
        historicalData: v.optional(v.array(
          v.object({
            date: v.string(),
            open: v.number(),
            high: v.number(),
            low: v.number(),
            close: v.number(),
            volume: v.number(),
          })
        )),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Step 1: Delete all existing stocks and their OHLC data
    const existingStocks = await ctx.db.query("stocks").collect();

    for (const stock of existingStocks) {
      // Delete all OHLC data for this stock
      const ohlcData = await ctx.db
        .query("ohlcData")
        .withIndex("by_stock", (q) => q.eq("stockId", stock._id))
        .collect();

      for (const data of ohlcData) {
        await ctx.db.delete(data._id);
      }

      // Delete the stock
      await ctx.db.delete(stock._id);
    }

    // Step 2: Insert new stocks with historical data
    const insertedIds: Id<"stocks">[] = [];

    for (const stockObj of args.stocks) {
      const { historicalData, ...stockData } = stockObj;
      const id = await ctx.db.insert("stocks", {
        ...stockData,
        createdAt: now,
        updatedAt: now,
      });
      insertedIds.push(id);

      // Insert OHLC data if provided
      if (historicalData) {
        for (const ohlc of historicalData) {
          await ctx.db.insert("ohlcData", {
            stockId: id,
            ...ohlc,
          });
        }
      }
    }

    return {
      deleted: existingStocks.length,
      inserted: insertedIds.length,
      stockIds: insertedIds
    };
  },
});

/**
 * Upsert a stock (insert or update by symbol)
 */
export const upsertStock = mutation({
  args: {
    symbol: v.string(),
    name: v.string(),
    sector: v.string(),
    marketCap: v.number(),
    currentPrice: v.number(),
    priceChange: v.number(),
    weekHigh52: v.number(),
    weekLow52: v.number(),
    perfY: v.optional(v.number()),
    perf5Y: v.optional(v.number()),
    aiExplanation: v.optional(v.object({
      summary: v.string(),
      veryLongTermAnalysis: v.optional(v.string()),
      longTermAnalysis: v.string(),
      shortTermAnalysis: v.string(),
      riskLevel: v.union(v.literal("Low"), v.literal("Medium"), v.literal("High")),
      riskReasoning: v.string(),
      keyStrengths: v.array(v.string()),
      keyConcerns: v.array(v.string()),
      generatedAt: v.number(),
    })),
    scores: v.optional(v.any()),
  },
  handler: async (ctx, args): Promise<Id<"stocks">> => {
    const now = Date.now();

    // Check if stock exists
    const existing = await ctx.db
      .query("stocks")
      .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
      .first();

    if (existing) {
      // Update existing stock
      const updateData: any = {
        name: args.name,
        sector: args.sector,
        marketCap: args.marketCap,
        currentPrice: args.currentPrice,
        priceChange: args.priceChange,
        weekHigh52: args.weekHigh52,
        weekLow52: args.weekLow52,
        perfY: args.perfY,
        perf5Y: args.perf5Y,
        updatedAt: now,
      };

      // Include aiExplanation and scores if provided
      if (args.aiExplanation) {
        updateData.aiExplanation = args.aiExplanation;
      }
      if (args.scores) {
        updateData.scores = args.scores;
      }

      await ctx.db.patch(existing._id, updateData);
      return existing._id;
    } else {
      // Insert new stock
      return await ctx.db.insert("stocks", {
        ...args,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

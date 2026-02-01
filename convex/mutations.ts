import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

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

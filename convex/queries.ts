import { query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Get all sector data
 */
export const getSectors = query({
  args: {},
  handler: async (ctx): Promise<Doc<"sectors">[]> => {
    return await ctx.db.query("sectors").collect();
  },
});

/**
 * Get a sector by name
 */
export const getSectorByName = query({
  args: { name: v.string() },
  handler: async (ctx, args): Promise<Doc<"sectors"> | null> => {
    return await ctx.db
      .query("sectors")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

/**
 * Get market overview (singleton)
 */
export const getMarketOverview = query({
  args: {},
  handler: async (ctx): Promise<Doc<"marketOverview"> | null> => {
    return await ctx.db.query("marketOverview").first();
  },
});

/**
 * Get OHLC data for a specific stock
 */
export const getOHLCDataForStock = query({
  args: { 
    stockId: v.id("stocks"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Doc<"ohlcData">[]> => {
    let query = ctx.db
      .query("ohlcData")
      .withIndex("by_stock", (q) => q.eq("stockId", args.stockId));
    
    const data = await query.collect();
    
    // Sort by date ascending
    data.sort((a, b) => a.date.localeCompare(b.date));
    
    // Apply limit if specified
    if (args.limit) {
      return data.slice(-args.limit);
    }
    
    return data;
  },
});

/**
 * Check if database has been seeded
 */
export const isSeeded = query({
  args: {},
  handler: async (ctx): Promise<boolean> => {
    const stock = await ctx.db.query("stocks").first();
    return stock !== null;
  },
});

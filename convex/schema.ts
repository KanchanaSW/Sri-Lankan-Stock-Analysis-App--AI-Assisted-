import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Stocks table - main stock information
  stocks: defineTable({
    symbol: v.string(),
    name: v.string(),
    sector: v.string(),
    marketCap: v.number(), // in millions
    currentPrice: v.number(),
    priceChange: v.number(), // percentage
    weekHigh52: v.number(),
    weekLow52: v.number(),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    perf5Y: v.optional(v.number()),
    perfY: v.optional(v.number()),
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
    scores: v.optional(v.object({
      longTermScore: v.number(),
      shortTermScore: v.number(),
      veryLongTermScore: v.number(),
      longTermFactors: v.object({
        priceVolatility: v.number(),
        trendConsistency: v.number(),
        volumeStability: v.number(),
        sectorStrength: v.number(),
        marketCapStability: v.number(),
      }),
      shortTermFactors: v.object({
        volumeChange: v.number(),
        priceMomentum: v.number(),
        breakoutDetection: v.number(),
        trendAcceleration: v.number(),
      }),
      veryLongTermFactors: v.object({
        fiveYearPerformance: v.number(),
        oneYearPerformance: v.number(),
        priceToHigh52: v.number(),
        marketCapSize: v.number(),
        downsideVolatility: v.number(),
      }),
    })),
  })
    .index("by_symbol", ["symbol"])
    .index("by_sector", ["sector"]),

  // OHLC data table - historical price/volume data
  ohlcData: defineTable({
    stockId: v.id("stocks"),
    date: v.string(), // ISO date string
    open: v.number(),
    high: v.number(),
    low: v.number(),
    close: v.number(),
    volume: v.number(),
  })
    .index("by_stock", ["stockId"])
    .index("by_stock_date", ["stockId", "date"]),

  // Sectors table - sector performance data
  sectors: defineTable({
    name: v.string(),
    averagePerformance: v.number(), // percentage
    stockCount: v.number(),
    trending: v.union(v.literal("up"), v.literal("down"), v.literal("stable")),
  })
    .index("by_name", ["name"]),

  // Market overview table - singleton for market statistics
  marketOverview: defineTable({
    totalStocks: v.number(),
    marketsUp: v.number(),
    marketsDown: v.number(),
    totalVolume: v.string(),
    lastUpdated: v.string(),
  }),
});

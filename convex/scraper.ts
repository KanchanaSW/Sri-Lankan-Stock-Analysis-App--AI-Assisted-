import { action, internalQuery } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";
import { createActionCacheClient } from "../lib/cacheOrchestration";
import { runScrapePipeline } from "../lib/scrapePipeline";
import { AIExplanation } from "../lib/types";

/**
 * Internal query to fetch existing stocks for preservation
 */
export const getExistingStocks = internalQuery({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("stocks").collect();
    }
});

/**
 * Scraper action to fetch, analyze and display top picks
 * Can target different investment tiers for AI analysis
 */
export const runScrape = action({
    args: {
        tier: v.optional(v.union(v.literal("long-term"), v.literal("very-long-term"))),
    },
    handler: async (ctx, args) => {
        const targetTier = args.tier ?? "long-term";
        console.log(`🚀 Starting Stock Analysis Scraper (${targetTier})`);

        const existingStocks = await ctx.runQuery(internal.scraper.getExistingStocks);
        const existingAiMap = new Map<string, AIExplanation>();
        existingStocks.forEach((s) => {
            if (s.aiExplanation) existingAiMap.set(s.symbol, s.aiExplanation);
        });

        const cacheClient = createActionCacheClient(ctx, api);
        const { finalStocks, marketOverview } = await runScrapePipeline({
            cacheClient,
            tier: targetTier,
            existingAiMap,
            groqApiKey: process.env.GROQ_API_KEY,
            useDetailedPrices: false,
        });

        console.log("💾 Updating database...");
        const updateResult = await ctx.runMutation(api.mutations.replaceAllStocks, {
            stocks: finalStocks as never,
        });

        await ctx.runMutation(api.mutations.updateMarketOverview, marketOverview);

        console.log(`✨ ${targetTier === "very-long-term" ? "Weekly" : "Daily"} update completed: ${updateResult.inserted} stocks updated`);
        return { success: true, updated: updateResult.inserted };
    },
});

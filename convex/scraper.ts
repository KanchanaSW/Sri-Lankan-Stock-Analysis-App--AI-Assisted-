import { action, internalQuery } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";
import { calculateStockScores, generateHistoricalData } from "../lib/scoring";
import { batchGenerateExplanations } from "../lib/grokService";
import { StockData, AIExplanation } from "../lib/types";

// TradingView interfaces
interface TradingViewQuote {
    s: string;  // Symbol
    d: (number | string | null)[];  // Data array
}

interface TradingViewResponse {
    data: TradingViewQuote[];
}

interface DiscoveredStock {
    symbol: string;
    tradingView: string;
    name: string;
    sector: string;
    marketCap: number;
    currentPrice: number;
    priceChange: number;
    volume: number;
    perfY?: number;
    perf5Y?: number;
}

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

        // 0. Fetch existing stocks to preserve AI analysis
        const existingStocks = await ctx.runQuery(internal.scraper.getExistingStocks);
        const existingAiMap = new Map<string, any>();
        existingStocks.forEach((s: any) => {
            if (s.aiExplanation) existingAiMap.set(s.symbol, s.aiExplanation);
        });

        // 1. Discover Stocks from TradingView
        const discoveredStocks = await discoverActiveStocks();
        if (discoveredStocks.length === 0) {
            throw new Error("No stocks discovered from TradingView");
        }
        console.log(`✅ Discovered ${discoveredStocks.length} stocks`);

        // 2. Process Data & Compute Scores
        console.log("📊 Computing scores and generating historical data...");
        const stocksWithComputedData = discoveredStocks.map((stock, index) => {
            const priceChange = stock.priceChange;
            const currentPrice = stock.currentPrice;

            const volatility = Math.min(0.05, Math.max(0.01, Math.abs(priceChange) / 100 + 0.015));
            const trend = priceChange >= 0 ? 0.0003 : -0.0001;
            const historicalData = generateHistoricalData(currentPrice, 90, volatility, trend);

            const stockData: StockData = {
                id: index.toString(),
                symbol: stock.symbol,
                name: stock.name,
                sector: stock.sector,
                marketCap: stock.marketCap,
                currentPrice,
                priceChange,
                weekHigh52: currentPrice * 1.1,
                weekLow52: currentPrice * 0.9,
                perfY: stock.perfY,
                perf5Y: stock.perf5Y,
                historicalData,
            };

            const scores = calculateStockScores(stockData);
            return { stockData, scores };
        });

        // 3. Identify Top 5 for AI Analysis based on requested tier
        const top5ForAi = [...stocksWithComputedData]
            .sort((a, b) => {
                if (targetTier === "very-long-term") {
                    return b.scores.veryLongTermScore - a.scores.veryLongTermScore;
                }
                return b.scores.longTermScore - a.scores.longTermScore;
            })
            .slice(0, 5);

        console.log(`🎯 Identified Top 5 ${targetTier === "very-long-term" ? "Very Long-Term" : "Long-Term"} Picks: ${top5ForAi.map(s => s.stockData.symbol).join(", ")}`);

        // 4. Generate AI Explanations via Groq
        const groqApiKey = process.env.GROQ_API_KEY;
        const newAiExplanations = await batchGenerateExplanations(
            top5ForAi.map(d => ({ stock: d.stockData, scores: d.scores })),
            groqApiKey
        );

        // 5. Prepare Final Stock Objects
        const finalStocks = stocksWithComputedData.map(({ stockData, scores }) => {
            // Check for new AI analysis
            let aiExplanation = newAiExplanations.get(stockData.symbol);

            // If no new analysis, try to preserve existing analysis
            if (!aiExplanation) {
                aiExplanation = existingAiMap.get(stockData.symbol);
            }

            return {
                symbol: stockData.symbol,
                name: stockData.name,
                sector: stockData.sector,
                marketCap: stockData.marketCap,
                currentPrice: stockData.currentPrice,
                priceChange: stockData.priceChange,
                weekHigh52: stockData.weekHigh52,
                weekLow52: stockData.weekLow52,
                perfY: stockData.perfY,
                perf5Y: stockData.perf5Y,
                historicalData: stockData.historicalData,
                scores,
                aiExplanation: aiExplanation || undefined,
            };
        });

        // 6. Atomically update database via mutation
        console.log("💾 Updating database...");
        const updateResult = await ctx.runMutation(api.mutations.replaceAllStocks, {
            stocks: finalStocks as any
        });

        // 7. Update Market Overview
        const up = finalStocks.filter(s => s.priceChange > 0).length;
        const down = finalStocks.filter(s => s.priceChange < 0).length;
        await ctx.runMutation(api.mutations.updateMarketOverview, {
            totalStocks: finalStocks.length,
            marketsUp: up,
            marketsDown: down,
            totalVolume: "Rs. " + (finalStocks.reduce((sum, s) => sum + (s.currentPrice * 10000), 0) / 1_000_000).toFixed(1) + "M",
            lastUpdated: new Date().toLocaleDateString("en-LK"),
        });

        console.log(`✨ ${targetTier === "very-long-term" ? "Weekly" : "Daily"} update completed: ${updateResult.inserted} stocks updated`);
        return { success: true, updated: updateResult.inserted };
    },
});

/**
 * Discover profitable stocks from TradingView's Sri Lanka scanner
 */
async function discoverActiveStocks(): Promise<DiscoveredStock[]> {
    const discovered: DiscoveredStock[] = [];
    const url = "https://scanner.tradingview.com/srilanka/scan";

    const payload = {
        filter: [
            { left: "volume", operation: "greater", right: 0 },
            { left: "type", operation: "in_range", right: ["stock", "dr"] }
        ],
        options: { lang: "en" },
        markets: ["srilanka"],
        symbols: { query: { types: [] }, tickers: [] },
        columns: [
            "name", "close", "change", "net_income", "volume", "sector",
            "market_cap_basic", "price_52_week_high", "price_52_week_low",
            "Perf.Y", "Perf.5Y"
        ],
        sort: { sortBy: "net_income", sortOrder: "desc" },
        range: [0, 50]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) return discovered;

        const data: TradingViewResponse = await response.json();
        for (const quote of data.data) {
            const fullSymbol = quote.s.split(":")[1];
            if (!fullSymbol) continue;

            const [name, close, change, netIncome, volume, sector, marketCap, high52, low52, perfY, perf5Y] = quote.d;
            if (typeof close === "number" && close > 0 && typeof name === "string") {
                const localSymbol = fullSymbol.replace(".N0000", "");
                discovered.push({
                    symbol: localSymbol,
                    tradingView: fullSymbol,
                    name: name || `${localSymbol} Stock`,
                    sector: typeof sector === "string" ? sector : "Unknown",
                    marketCap: typeof marketCap === "number" ? marketCap / 1_000_000 : 0,
                    currentPrice: close,
                    priceChange: typeof change === "number" ? change : 0,
                    volume: typeof volume === "number" ? volume : 0,
                    perfY: typeof perfY === "number" ? perfY : undefined,
                    perf5Y: typeof perf5Y === "number" ? perf5Y : undefined,
                });
            }
        }
    } catch (error) {
        console.error("Error discovering stocks:", error);
    }
    return discovered;
}

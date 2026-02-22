import { config } from "dotenv";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { calculateStockScores, generateHistoricalData } from "../lib/scoring";
import { batchGenerateExplanations } from "../lib/grokService";
import { StockData, StockScores, AIExplanation } from "../lib/types";

// Load environment variables from .env.local
config({ path: ".env.local" });

// Initialize Convex client
const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ Error: CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable is required");
  console.error("   Set it in your .env.local file or pass it as an environment variable");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// ============================================================================
// TradingView Data Scraper for Colombo Stock Exchange (CSE)
// ============================================================================

interface TradingViewQuote {
  s: string;  // Symbol
  d: (number | string | null)[];  // Data array
}

interface TradingViewResponse {
  data: TradingViewQuote[];
}

interface StockPriceData {
  price: number;
  change: number;
  changePercent: number;
  compare_abs?: number;
  high52Week: number;
  low52Week: number;
  volume: number;
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
 * Discovers stocks with highest net income from TradingView's scan API
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
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
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

/**
 * Fetches detailed price data
 */
async function fetchTradingViewData(symbols: string[]): Promise<Map<string, StockPriceData>> {
  const results = new Map<string, StockPriceData>();
  const url = "https://scanner.tradingview.com/srilanka/scan";

  const payload = {
    symbols: { tickers: symbols.map(s => `CSELK:${s}`), query: { types: [] } },
    columns: ["close", "change", "change_abs", "high", "low", "volume", "price_52_week_high", "price_52_week_low"]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return results;

    const data: TradingViewResponse = await response.json();
    for (const quote of data.data) {
      const symbol = quote.s.split(":")[1];
      const [close, change, changeAbs, high, low, volume, high52, low52] = quote.d;
      if (typeof close === "number" && close > 0) {
        results.set(symbol, {
          price: close,
          change: typeof changeAbs === "number" ? changeAbs : 0,
          changePercent: typeof change === "number" ? change : 0,
          high52Week: typeof high52 === "number" ? high52 : close * 1.1,
          low52Week: typeof low52 === "number" ? low52 : close * 0.9,
          volume: typeof volume === "number" ? volume : 0,
        });
      }
    }
  } catch (error) {
    console.error("Error fetching price data:", error);
  }
  return results;
}

async function updateAllPrices() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🚀 Sri Lankan Stock Scraper - Atomic Update");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 1. Discover Stocks
  const discoveredStocks = await discoverActiveStocks();
  if (discoveredStocks.length === 0) {
    console.error("❌ No stocks discovered");
    process.exit(1);
  }
  console.log(`✅ Discovered ${discoveredStocks.length} profitable stocks`);

  // 2. Fetch Detailed Prices
  const tradingViewSymbols = discoveredStocks.map(s => s.tradingView);
  const priceData = await fetchTradingViewData(tradingViewSymbols);
  console.log(`✅ Received price data for ${priceData.size} stocks`);

  // 3. Prepare Preliminary Data & Compute Scores locally
  console.log("📊 Computing scores and generating historical data in memory...");

  const stocksWithComputedData = discoveredStocks.map((stock, index) => {
    const priceInfo = priceData.get(stock.tradingView);
    const currentPrice = priceInfo?.price ?? stock.currentPrice;
    const priceChange = priceInfo?.changePercent ?? stock.priceChange;

    // Generate OHLC data in memory
    const volatility = Math.min(0.05, Math.max(0.01, Math.abs(priceChange) / 100 + 0.015));
    const trend = priceChange >= 0 ? 0.0003 : -0.0001;
    const historicalData = generateHistoricalData(currentPrice, 90, volatility, trend);

    // Create StockData object for scoring
    const stockData: StockData = {
      id: index.toString(),
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      marketCap: stock.marketCap,
      currentPrice,
      priceChange,
      weekHigh52: priceInfo?.high52Week ?? currentPrice * 1.1,
      weekLow52: priceInfo?.low52Week ?? currentPrice * 0.9,
      perfY: stock.perfY,
      perf5Y: stock.perf5Y,
      historicalData,
    };

    const scores = calculateStockScores(stockData);
    return { stockData, scores };
  });

  // 4. Identify Top 5 Long-Term Picks
  const top5LongTerm = [...stocksWithComputedData]
    .sort((a, b) => b.scores.longTermScore - a.scores.longTermScore)
    .slice(0, 5);

  console.log(`🎯 Identified Top 5 Long-Term Picks for AI analysis`);

  // 5. Generate AI Explanations
  const aiExplanations = await batchGenerateExplanations(
    top5LongTerm.map(d => ({ stock: d.stockData, scores: d.scores })),
    process.env.GROQ_API_KEY
  );

  // 6. Build Final Objects
  console.log("📦 Building final stock objects for atomic injection...");
  const finalStocks = stocksWithComputedData.map(({ stockData, scores }) => {
    const aiExplanation = aiExplanations.get(stockData.symbol);

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

  // 7. Atomic update in Convex
  console.log("💾 Performing atomic database update (replaceAllStocks)...");
  try {
    const result = await client.mutation(api.mutations.replaceAllStocks, {
      stocks: finalStocks as any // Type cast for Flexibilty with Convex schema
    });
    console.log(`✅ Success: ${result.deleted} deleted, ${result.inserted} inserted`);

    // 8. Update Market Overview
    const up = finalStocks.filter(s => s.priceChange > 0).length;
    const down = finalStocks.filter(s => s.priceChange < 0).length;
    await client.mutation(api.mutations.updateMarketOverview, {
      totalStocks: finalStocks.length,
      marketsUp: up,
      marketsDown: down,
      totalVolume: "Rs. " + (finalStocks.reduce((sum, s) => sum + (s.currentPrice * 10000), 0) / 1_000_000).toFixed(1) + "M",
      lastUpdated: new Date().toLocaleDateString("en-LK"),
    });
    console.log("✅ Market overview updated");

  } catch (error) {
    console.error("❌ Atomic update failed:", error);
    process.exit(1);
  }

  console.log("\n✨ Scraper execution completed successfully");
  process.exit(0);
}

updateAllPrices();

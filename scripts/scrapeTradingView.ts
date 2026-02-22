import { config } from "dotenv";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { calculateStockScores } from "../lib/scoring";
import { batchGenerateExplanations } from "../lib/grokService";
import { StockData } from "../lib/types";

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
// Reference: https://www.tradingview.com/symbols/CSELK-JKH.N0000/
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
 * Returns top 50 most profitable stocks with metadata
 */
async function discoverActiveStocks(): Promise<DiscoveredStock[]> {
  const discovered: DiscoveredStock[] = [];

  // TradingView scan API endpoint for Sri Lanka
  const url = "https://scanner.tradingview.com/srilanka/scan";

  // Build the request payload to get top 50 stocks by net income
  const payload = {
    filter: [
      { left: "volume", operation: "greater", right: 0 },
      { left: "type", operation: "in_range", right: ["stock", "dr"] }
    ],
    options: { lang: "en" },
    markets: ["srilanka"],
    symbols: { query: { types: [] }, tickers: [] },
    columns: [
      "name",                    // Company name
      "close",                   // Current price
      "change",                  // Price change percentage
      "net_income",              // Net income (profitability)
      "volume",                  // Trading volume
      "sector",                  // Sector
      "market_cap_basic",        // Market cap
      "price_52_week_high",      // 52-week high
      "price_52_week_low",       // 52-week low
      "Perf.Y",                  // 1-Year Performance
      "Perf.5Y"                  // 5-Year Performance
    ],
    sort: {
      sortBy: "net_income",      // Sort by net income
      sortOrder: "desc"
    },
    range: [0, 50]  // Top 50 most profitable
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

    if (!response.ok) {
      console.error(`TradingView discovery API error: ${response.status}`);
      return discovered;
    }

    const data: TradingViewResponse = await response.json();

    for (const quote of data.data) {
      // Extract symbol from "CSELK:JKH.N0000" format
      const fullSymbol = quote.s.split(":")[1];
      if (!fullSymbol) continue;

      const [name, close, change, netIncome, volume, sector, marketCap, high52, low52, perfY, perf5Y] = quote.d;

      // Validate required fields
      if (typeof close === "number" && close > 0 && typeof name === "string") {
        // Extract local symbol (remove .N0000 suffix)
        const localSymbol = fullSymbol.replace(".N0000", "");

        discovered.push({
          symbol: localSymbol,
          tradingView: fullSymbol,
          name: name || `${localSymbol} Stock`,
          sector: typeof sector === "string" ? sector : "Unknown",
          marketCap: typeof marketCap === "number" ? marketCap / 1_000_000 : 0, // Convert to millions
          currentPrice: close,
          priceChange: typeof change === "number" ? change : 0,
          volume: typeof volume === "number" ? volume : 0,
          perfY: typeof perfY === "number" ? perfY : undefined,
          perf5Y: typeof perf5Y === "number" ? perf5Y : undefined,
        });
      }
    }
  } catch (error) {
    console.error("Error discovering stocks from TradingView:", error);
  }

  return discovered;
}

/**
 * Fetches stock data from TradingView's scan API
 * This is the same API TradingView uses internally for their screener
 */
async function fetchTradingViewData(symbols: string[]): Promise<Map<string, StockPriceData>> {
  const results = new Map<string, StockPriceData>();

  // TradingView scan API endpoint
  const url = "https://scanner.tradingview.com/srilanka/scan";

  // Build the request payload
  const payload = {
    symbols: {
      tickers: symbols.map(s => `CSELK:${s}`),
      query: { types: [] }
    },
    columns: [
      "close",           // Current price
      "change",          // Price change
      "change_abs",      // Absolute change
      "high",            // Day high
      "low",             // Day low
      "volume",          // Volume
      "price_52_week_high",  // 52-week high
      "price_52_week_low"    // 52-week low
    ]
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

    if (!response.ok) {
      console.error(`TradingView API error: ${response.status}`);
      return results;
    }

    const data: TradingViewResponse = await response.json();

    for (const quote of data.data) {
      // Extract symbol from "CSELK:JKH.N0000" format
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
    console.error("Error fetching from TradingView:", error);
  }

  return results;
}

async function updateAllPrices() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🚀 Sri Lankan Stock Scraper - TradingView");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📅 ${new Date().toLocaleString("en-LK", { timeZone: "Asia/Colombo" })}`);
  console.log(`🔗 Convex: ${CONVEX_URL?.substring(0, 40)}...`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // STEP 1: Discover stocks with highest net income from TradingView
  console.log("🔍 Discovering most profitable stocks (highest net income) from TradingView...\n");
  const discoveredStocks = await discoverActiveStocks();

  if (discoveredStocks.length === 0) {
    console.error("❌ Failed to discover any stocks from TradingView");
    process.exit(1);
  }

  console.log(`✅ Discovered ${discoveredStocks.length} most profitable stocks\n`);

  // STEP 2: Fetch detailed price data for all discovered stocks
  console.log("📡 Fetching detailed price data from TradingView...\n");
  const tradingViewSymbols = discoveredStocks.map(s => s.tradingView);
  const priceData = await fetchTradingViewData(tradingViewSymbols);

  if (priceData.size === 0) {
    console.error("❌ Failed to fetch price data from TradingView");
    process.exit(1);
  }

  console.log(`✅ Received price data for ${priceData.size} stocks\n`);

  // STEP 3: Prepare stock data for database replacement
  console.log("🗄️  Preparing stock data for database...\n");
  const stocksToInsert = discoveredStocks.map(stock => {
    const priceInfo = priceData.get(stock.tradingView);

    return {
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      marketCap: stock.marketCap,
      currentPrice: priceInfo?.price ?? stock.currentPrice,
      priceChange: priceInfo?.changePercent ?? stock.priceChange,
      weekHigh52: priceInfo?.high52Week ?? stock.currentPrice * 1.1,
      weekLow52: priceInfo?.low52Week ?? stock.currentPrice * 0.9,
      perfY: stock.perfY,
      perf5Y: stock.perf5Y,
    };
  });

  // STEP 4: Calculate scores and identify Long-Term Picks
  console.log("📊 Calculating scores for stocks...\n");

  // First, we need to insert stocks to get historical data generated
  // Then we'll update with AI explanations
  console.log("🔄 Initial database insertion...\n");
  let insertResult;
  try {
    insertResult = await client.mutation(api.mutations.replaceAllStocks, {
      stocks: stocksToInsert,
    });

    console.log(`✅ Initial insert: ${insertResult.deleted} deleted, ${insertResult.inserted} inserted\n`);
  } catch (error) {
    console.error("❌ Failed to insert stocks:", error);
    process.exit(1);
  }

  // STEP 5: Fetch stocks with historical data to calculate scores
  console.log("📈 Fetching stocks with historical data for score calculation...\n");

  let allStocks;
  try {
    allStocks = await client.query(api.stocks.getAllStocks);
  } catch (error) {
    console.error("❌ Failed to fetch stocks:", error);
    process.exit(1);
  }

  // Convert to StockData format and calculate scores
  const stocksWithScores = allStocks.map((stock: any, index: number) => {
    const stockData: StockData = {
      id: (index + 1).toString(),
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      marketCap: stock.marketCap,
      currentPrice: stock.currentPrice,
      priceChange: stock.priceChange,
      weekHigh52: stock.weekHigh52,
      weekLow52: stock.weekLow52,
      perfY: stock.perfY,
      perf5Y: stock.perf5Y,
      historicalData: stock.historicalData.map((ohlc: any) => ({
        date: ohlc.date,
        open: ohlc.open,
        high: ohlc.high,
        low: ohlc.low,
        close: ohlc.close,
        volume: ohlc.volume,
      })),
    };

    const scores = calculateStockScores(stockData);
    return { stock: stockData, scores, convexId: stock._id };
  });

  // Get Top 5 Long-Term Picks by score (same as shown on home page)
  const top5LongTermPicks = [...stocksWithScores]
    .sort((a, b) => b.scores.longTermScore - a.scores.longTermScore)
    .slice(0, 5);

  console.log(`🎯 Top 5 Long-Term Picks (for AI analysis):`);
  top5LongTermPicks.forEach(({ stock, scores }, i) => {
    console.log(`   ${i + 1}. ${stock.symbol} - Score: ${scores.longTermScore}`);
  });
  console.log('');

  if (top5LongTermPicks.length > 0) {
    // STEP 6: Generate AI explanations for Top 5 Long-Term Picks only
    const aiExplanations = await batchGenerateExplanations(
      top5LongTermPicks.map(({ stock, scores }) => ({ stock, scores })),
      process.env.GROQ_API_KEY
    );

    // STEP 7: Update stocks with AI explanations
    if (aiExplanations.size > 0) {
      console.log(`💾 Storing ${aiExplanations.size} AI explanations in database...\n`);

      for (const { stock, convexId } of top5LongTermPicks) {
        const explanation = aiExplanations.get(stock.symbol);

        if (explanation && convexId) {
          try {
            await client.mutation(api.mutations.updateStock, {
              stockId: convexId,
            });

            // Now patch with AI explanation using upsertStock
            await client.mutation(api.mutations.upsertStock, {
              symbol: stock.symbol,
              name: stock.name,
              sector: stock.sector,
              marketCap: stock.marketCap,
              currentPrice: stock.currentPrice,
              priceChange: stock.priceChange,
              weekHigh52: stock.weekHigh52,
              weekLow52: stock.weekLow52,
              perfY: stock.perfY,
              perf5Y: stock.perf5Y,
              aiExplanation: {
                ...explanation,
                generatedAt: explanation.generatedAt || Date.now(),
              },
            });

            console.log(`   ✅ Saved AI explanation for ${stock.symbol}`);
          } catch (error) {
            console.error(`   ❌ Failed to save AI explanation for ${stock.symbol}:`, error);
          }
        }
      }

      console.log(`\n✅ AI explanations stored successfully\n`);
    }
  } else {
    console.log("ℹ️  No stocks found, skipping AI generation\n");
  }

  // STEP 5: Display summary
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 Summary");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Count stocks by sector
  const sectorCounts = discoveredStocks.reduce((acc, stock) => {
    acc[stock.sector] = (acc[stock.sector] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log(`✅ Total stocks: ${discoveredStocks.length}`);
  console.log(`📈 Sectors represented: ${Object.keys(sectorCounts).length}`);

  // Show top 5 sectors
  const topSectors = Object.entries(sectorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  console.log("\n🏆 Top sectors:");
  for (const [sector, count] of topSectors) {
    console.log(`   ${sector}: ${count} stocks`);
  }

  // Show top 5 by volume
  const topByVolume = discoveredStocks
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);

  console.log("\n📊 Top 5 by trading volume:");
  for (const stock of topByVolume) {
    const changeStr = stock.priceChange >= 0
      ? `+${stock.priceChange.toFixed(2)}%`
      : `${stock.priceChange.toFixed(2)}%`;
    const changeIcon = stock.priceChange >= 0 ? "🟢" : "🔴";
    console.log(`   ${stock.symbol.padEnd(8)} Rs. ${stock.currentPrice.toFixed(2).padStart(8)} ${changeIcon} ${changeStr}`);
  }

  console.log(`\n⏱️  Completed at: ${new Date().toLocaleString("en-LK", { timeZone: "Asia/Colombo" })}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  process.exit(0);
}

updateAllPrices();

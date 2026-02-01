import { config } from "dotenv";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { CSE_STOCK_SYMBOLS } from "../lib/stockSymbols";

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
  console.log(`📊 Stocks to update: ${CSE_STOCK_SYMBOLS.length}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Fetch all stock data from TradingView in one request
  console.log("📡 Fetching data from TradingView...\n");
  const tradingViewSymbols = CSE_STOCK_SYMBOLS.map(s => s.tradingView);
  const priceData = await fetchTradingViewData(tradingViewSymbols);
  
  if (priceData.size === 0) {
    console.error("❌ Failed to fetch data from TradingView");
    process.exit(1);
  }
  
  console.log(`✅ Received data for ${priceData.size} stocks\n`);

  let successCount = 0;
  let failCount = 0;

  for (const { local, tradingView, name } of CSE_STOCK_SYMBOLS) {
    try {
      process.stdout.write(`📈 ${local.padEnd(6)} ${name.substring(0, 28).padEnd(30)}... `);

      // Get price data from TradingView response
      const quote = priceData.get(tradingView);
      
      if (!quote) {
        console.log("⚠️  No TradingView data");
        failCount++;
        continue;
      }

      // Get current stock from Convex
      const stock = await client.query(api.stocks.getStockBySymbol, {
        symbol: local,
      });

      if (!stock) {
        console.log("⚠️  Not in DB");
        failCount++;
        continue;
      }

      // Update in Convex
      await client.mutation(api.mutations.updateStock, {
        stockId: stock._id,
        currentPrice: quote.price,
        priceChange: quote.changePercent,
        weekHigh52: quote.high52Week,
        weekLow52: quote.low52Week,
      });

      const changeStr = quote.changePercent >= 0 
        ? `+${quote.changePercent.toFixed(2)}%` 
        : `${quote.changePercent.toFixed(2)}%`;
      const changeIcon = quote.changePercent >= 0 ? "🟢" : "🔴";
      console.log(`✅ Rs. ${quote.price.toFixed(2).padStart(8)} ${changeIcon} ${changeStr}`);
      successCount++;

    } catch (error) {
      console.log(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      failCount++;
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 Summary");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ Success: ${successCount}/${CSE_STOCK_SYMBOLS.length}`);
  console.log(`❌ Failed:  ${failCount}/${CSE_STOCK_SYMBOLS.length}`);
  console.log(`⏱️  Completed at: ${new Date().toLocaleString("en-LK", { timeZone: "Asia/Colombo" })}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  process.exit(failCount > 0 && successCount === 0 ? 1 : 0);
}

updateAllPrices();

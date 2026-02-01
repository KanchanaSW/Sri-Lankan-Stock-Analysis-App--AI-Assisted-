import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { CSE_STOCK_SYMBOLS } from "../lib/stockSymbols";

// Initialize Convex client
const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ Error: CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable is required");
  console.error("   Set it in your .env.local file or pass it as an environment variable");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

interface YahooFinanceQuote {
  regularMarketPrice?: number;
  chartPreviousClose?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
}

interface YahooFinanceChart {
  chart: {
    result?: Array<{
      meta: YahooFinanceQuote;
    }>;
    error?: { code: string; description: string };
  };
}

async function fetchStockPrice(yahooSymbol: string): Promise<YahooFinanceQuote | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`;
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; StockAnalyzer/1.0)" },
    });

    if (!response.ok) {
      console.warn(`  → HTTP ${response.status} for ${yahooSymbol}`);
      return null;
    }

    const data: YahooFinanceChart = await response.json();
    if (data.chart.error || !data.chart.result?.[0]) {
      console.warn(`  → No chart data for ${yahooSymbol}`);
      return null;
    }

    return data.chart.result[0].meta;
  } catch (error) {
    console.error(`  → Fetch error for ${yahooSymbol}:`, error);
    return null;
  }
}

async function updateAllPrices() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🚀 Sri Lankan Stock Scraper - Yahoo Finance");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📅 ${new Date().toLocaleString("en-LK", { timeZone: "Asia/Colombo" })}`);
  console.log(`🔗 Convex: ${CONVEX_URL?.substring(0, 40)}...`);
  console.log(`📊 Stocks to update: ${CSE_STOCK_SYMBOLS.length}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  let successCount = 0;
  let failCount = 0;

  for (const { local, yahoo, name } of CSE_STOCK_SYMBOLS) {
    try {
      process.stdout.write(`📈 ${local} (${name.substring(0, 25)}...)... `);

      // Fetch current price from Yahoo Finance
      const quote = await fetchStockPrice(yahoo);
      if (!quote || !quote.regularMarketPrice) {
        console.log("⚠️  No data");
        failCount++;
        continue;
      }

      // Get stock from Convex
      const stock = await client.query(api.stocks.getStockBySymbol, {
        symbol: local,
      });

      if (!stock) {
        console.log("⚠️  Not in DB");
        failCount++;
        continue;
      }

      // Calculate price change
      const previousClose = quote.chartPreviousClose || stock.currentPrice;
      const priceChange =
        ((quote.regularMarketPrice - previousClose) / previousClose) * 100;

      // Update in Convex
      await client.mutation(api.mutations.updateStock, {
        stockId: stock._id,
        currentPrice: quote.regularMarketPrice,
        priceChange: priceChange,
        weekHigh52: quote.fiftyTwoWeekHigh,
        weekLow52: quote.fiftyTwoWeekLow,
      });

      const changeStr = priceChange >= 0 ? `+${priceChange.toFixed(2)}%` : `${priceChange.toFixed(2)}%`;
      const changeIcon = priceChange >= 0 ? "🟢" : "🔴";
      console.log(`✅ Rs. ${quote.regularMarketPrice.toFixed(2)} ${changeIcon} ${changeStr}`);
      successCount++;

      // Rate limiting: 1 second between requests to avoid getting blocked
      await new Promise((resolve) => setTimeout(resolve, 1000));
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

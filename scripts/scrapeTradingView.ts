import { config } from "dotenv";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { createHttpCacheClient } from "../lib/cacheOrchestration";
import { runScrapePipeline } from "../lib/scrapePipeline";
import { AIExplanation } from "../lib/types";

config({ path: ".env.local" });

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ Error: CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable is required");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function updateAllPrices() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🚀 Sri Lankan Stock Scraper - Atomic Update");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const existingStocks = await client.query(api.stocks.getBasicStocks);
  const existingAiMap = new Map<string, AIExplanation>();
  for (const stock of existingStocks) {
    if (stock.aiExplanation) {
      existingAiMap.set(stock.symbol, stock.aiExplanation);
    }
  }

  const cacheClient = createHttpCacheClient(client, api);

  try {
    const { finalStocks, marketOverview } = await runScrapePipeline({
      cacheClient,
      tier: "long-term",
      existingAiMap,
      groqApiKey: process.env.GROQ_API_KEY,
      useDetailedPrices: true,
    });

    console.log("💾 Performing atomic database update (replaceAllStocks)...");
    const result = await client.mutation(api.mutations.replaceAllStocks, {
      stocks: finalStocks as never,
    });
    console.log(`✅ Success: ${result.deleted} deleted, ${result.inserted} inserted`);

    await client.mutation(api.mutations.updateMarketOverview, marketOverview);
    console.log("✅ Market overview updated");
  } catch (error) {
    console.error("❌ Scraper failed:", error);
    process.exit(1);
  }

  console.log("\n✨ Scraper execution completed successfully");
  process.exit(0);
}

updateAllPrices();

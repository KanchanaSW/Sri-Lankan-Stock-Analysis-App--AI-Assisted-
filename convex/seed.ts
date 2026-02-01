import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Helper function to generate realistic OHLC data
function generateHistoricalData(
  basePrice: number,
  days: number,
  volatility: number,
  trend: number
): Array<{
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}> {
  const data: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }> = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let currentPrice = basePrice * 0.85; // Start 15% lower for growth

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue;
    }

    // Use a seeded random for reproducibility
    const seedRandom = () => {
      const x = Math.sin(i * 12.9898 + basePrice * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };

    // Add trend and random walk
    const trendChange = trend * currentPrice;
    const randomChange = (seedRandom() - 0.5) * volatility * currentPrice;
    currentPrice = currentPrice + trendChange + randomChange;

    // Generate OHLC
    const dailyVolatility = volatility * currentPrice * 0.5;
    const open = currentPrice + (seedRandom() - 0.5) * dailyVolatility;
    const close = currentPrice + (seedRandom() - 0.5) * dailyVolatility;
    const high = Math.max(open, close) + seedRandom() * dailyVolatility * 0.5;
    const low = Math.min(open, close) - seedRandom() * dailyVolatility * 0.5;
    const volume = Math.floor(
      (500000 + seedRandom() * 1000000) * (1 + seedRandom() * 0.5)
    );

    data.push({
      date: date.toISOString().split("T")[0],
      open: Math.max(0.01, open),
      high: Math.max(0.01, high),
      low: Math.max(0.01, low),
      close: Math.max(0.01, close),
      volume,
    });
  }

  return data;
}

// Stock data to seed
const stocksData = [
  {
    symbol: "JKH",
    name: "John Keells Holdings PLC",
    sector: "Diversified",
    marketCap: 85000,
    currentPrice: 145.5,
    priceChange: 2.3,
    weekHigh52: 165.0,
    weekLow52: 115.2,
    volatility: 0.015,
    trend: 0.0003,
  },
  {
    symbol: "COMB",
    name: "Commercial Bank of Ceylon PLC",
    sector: "Banking",
    marketCap: 42000,
    currentPrice: 95.75,
    priceChange: 1.5,
    weekHigh52: 108.5,
    weekLow52: 78.0,
    volatility: 0.018,
    trend: 0.0002,
  },
  {
    symbol: "NDB",
    name: "National Development Bank PLC",
    sector: "Banking",
    marketCap: 28500,
    currentPrice: 78.25,
    priceChange: 0.8,
    weekHigh52: 88.0,
    weekLow52: 65.5,
    volatility: 0.02,
    trend: 0.0002,
  },
  {
    symbol: "DIAL",
    name: "Dialog Axiata PLC",
    sector: "Telecommunications",
    marketCap: 95000,
    currentPrice: 12.4,
    priceChange: -0.4,
    weekHigh52: 14.8,
    weekLow52: 10.2,
    volatility: 0.022,
    trend: -0.0001,
  },
  {
    symbol: "LOLC",
    name: "LOLC Holdings PLC",
    sector: "Finance",
    marketCap: 72000,
    currentPrice: 285.0,
    priceChange: 1.2,
    weekHigh52: 310.0,
    weekLow52: 245.0,
    volatility: 0.019,
    trend: 0.0002,
  },
  {
    symbol: "SAMP",
    name: "Sampath Bank PLC",
    sector: "Banking",
    marketCap: 35000,
    currentPrice: 68.5,
    priceChange: 8.5,
    weekHigh52: 72.0,
    weekLow52: 48.2,
    volatility: 0.035,
    trend: 0.0008,
  },
  {
    symbol: "CTC",
    name: "Ceylon Tobacco Company PLC",
    sector: "Manufacturing",
    marketCap: 125000,
    currentPrice: 1250.0,
    priceChange: 5.7,
    weekHigh52: 1280.0,
    weekLow52: 980.0,
    volatility: 0.03,
    trend: 0.0006,
  },
  {
    symbol: "LIOC",
    name: "Lanka IOC PLC",
    sector: "Energy",
    marketCap: 18000,
    currentPrice: 45.75,
    priceChange: 12.3,
    weekHigh52: 48.0,
    weekLow52: 28.5,
    volatility: 0.04,
    trend: 0.001,
  },
  {
    symbol: "HNB",
    name: "Hatton National Bank PLC",
    sector: "Banking",
    marketCap: 58000,
    currentPrice: 185.25,
    priceChange: 6.9,
    weekHigh52: 195.0,
    weekLow52: 145.0,
    volatility: 0.032,
    trend: 0.0007,
  },
  {
    symbol: "HEMAS",
    name: "Hemas Holdings PLC",
    sector: "Healthcare",
    marketCap: 25000,
    currentPrice: 58.0,
    priceChange: 4.2,
    weekHigh52: 62.5,
    weekLow52: 45.0,
    volatility: 0.028,
    trend: 0.0005,
  },
  {
    symbol: "NEST",
    name: "Nestle Lanka PLC",
    sector: "Consumer Goods",
    marketCap: 68000,
    currentPrice: 2850.0,
    priceChange: 1.8,
    weekHigh52: 2950.0,
    weekLow52: 2550.0,
    volatility: 0.016,
    trend: 0.0002,
  },
  {
    symbol: "TOK",
    name: "Tokyo Cement Company PLC",
    sector: "Manufacturing",
    marketCap: 22000,
    currentPrice: 42.5,
    priceChange: -1.2,
    weekHigh52: 52.0,
    weekLow52: 38.0,
    volatility: 0.025,
    trend: 0.0001,
  },
];

// Sector data
const sectorsData = [
  { name: "Banking", averagePerformance: 5.2, stockCount: 12, trending: "up" as const },
  { name: "Finance", averagePerformance: 4.8, stockCount: 15, trending: "up" as const },
  { name: "Diversified", averagePerformance: 6.1, stockCount: 8, trending: "up" as const },
  { name: "Manufacturing", averagePerformance: 3.5, stockCount: 20, trending: "stable" as const },
  { name: "Telecommunications", averagePerformance: 2.1, stockCount: 3, trending: "down" as const },
  { name: "Energy", averagePerformance: 8.3, stockCount: 6, trending: "up" as const },
  { name: "Healthcare", averagePerformance: 4.2, stockCount: 10, trending: "stable" as const },
  { name: "Consumer Goods", averagePerformance: 3.8, stockCount: 18, trending: "stable" as const },
];

// Market overview data
const marketOverviewData = {
  totalStocks: 287,
  marketsUp: 143,
  marketsDown: 121,
  totalVolume: "Rs. 1.2B",
  lastUpdated: new Date().toISOString().split("T")[0],
};

/**
 * Seed the database with initial data
 */
export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existingStock = await ctx.db.query("stocks").first();
    if (existingStock) {
      throw new Error("Database is already seeded. Clear data first if you want to reseed.");
    }

    const now = Date.now();

    // Insert sectors
    for (const sector of sectorsData) {
      await ctx.db.insert("sectors", sector);
    }

    // Insert stocks and their OHLC data
    for (const stockData of stocksData) {
      const { volatility, trend, ...stock } = stockData;
      
      // Insert stock
      const stockId = await ctx.db.insert("stocks", {
        ...stock,
        createdAt: now,
        updatedAt: now,
      });

      // Generate and insert OHLC data
      const historicalData = generateHistoricalData(
        stock.currentPrice,
        365,
        volatility,
        trend
      );

      for (const ohlc of historicalData) {
        await ctx.db.insert("ohlcData", {
          stockId,
          ...ohlc,
        });
      }
    }

    // Insert market overview
    await ctx.db.insert("marketOverview", marketOverviewData);

    return { success: true, stocksInserted: stocksData.length };
  },
});

import { CACHE_TTL } from './config';
import {
  chartDataKey,
  stockDiscoveryKey,
  stockScoreKey,
  type AnalysisTier,
} from './cacheKeys';
import {
  getOrSetCache,
  isFingerprintMatch,
  type CacheClient,
} from './cacheOrchestration';
import { invalidateAfterScrape } from './cacheInvalidation';
import { calculateStockScores, generateHistoricalData } from './scoring';
import { batchGenerateExplanations } from './grokService';
import { AIExplanation, OHLCData, StockData, StockScores } from './types';

// TradingView interfaces
interface TradingViewQuote {
  s: string;
  d: (number | string | null)[];
}

interface TradingViewResponse {
  data: TradingViewQuote[];
}

export interface DiscoveredStock {
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

export interface StockPriceData {
  price: number;
  change: number;
  changePercent: number;
  high52Week: number;
  low52Week: number;
  volume: number;
}

export interface FinalStockPayload {
  symbol: string;
  name: string;
  sector: string;
  marketCap: number;
  currentPrice: number;
  priceChange: number;
  weekHigh52: number;
  weekLow52: number;
  perfY?: number;
  perf5Y?: number;
  historicalData: OHLCData[];
  scores: StockScores;
  aiExplanation?: AIExplanation;
}

export interface ScrapePipelineResult {
  finalStocks: FinalStockPayload[];
  marketOverview: {
    totalStocks: number;
    marketsUp: number;
    marketsDown: number;
    totalVolume: string;
    lastUpdated: string;
  };
}

export interface ScrapePipelineOptions {
  cacheClient: CacheClient;
  tier: AnalysisTier;
  existingAiMap: Map<string, AIExplanation>;
  groqApiKey?: string;
  useDetailedPrices?: boolean;
}

async function fetchTradingViewDiscovery(): Promise<DiscoveredStock[]> {
  const discovered: DiscoveredStock[] = [];
  const url = 'https://scanner.tradingview.com/srilanka/scan';

  const payload = {
    filter: [
      { left: 'volume', operation: 'greater', right: 0 },
      { left: 'type', operation: 'in_range', right: ['stock', 'dr'] },
    ],
    options: { lang: 'en' },
    markets: ['srilanka'],
    symbols: { query: { types: [] }, tickers: [] },
    columns: [
      'name', 'close', 'change', 'net_income', 'volume', 'sector',
      'market_cap_basic', 'price_52_week_high', 'price_52_week_low',
      'Perf.Y', 'Perf.5Y',
    ],
    sort: { sortBy: 'net_income', sortOrder: 'desc' },
    range: [0, 50],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`TradingView discovery failed: ${response.status}`);
  }

  const data: TradingViewResponse = await response.json();
  for (const quote of data.data) {
    const fullSymbol = quote.s.split(':')[1];
    if (!fullSymbol) continue;

    const [name, close, , , volume, sector, marketCap, , , perfY, perf5Y] = quote.d;
    const change = quote.d[2];
    if (typeof close === 'number' && close > 0 && typeof name === 'string') {
      const localSymbol = fullSymbol.replace('.N0000', '');
      discovered.push({
        symbol: localSymbol,
        tradingView: fullSymbol,
        name: name || `${localSymbol} Stock`,
        sector: typeof sector === 'string' ? sector : 'Unknown',
        marketCap: typeof marketCap === 'number' ? marketCap / 1_000_000 : 0,
        currentPrice: close,
        priceChange: typeof change === 'number' ? change : 0,
        volume: typeof volume === 'number' ? volume : 0,
        perfY: typeof perfY === 'number' ? perfY : undefined,
        perf5Y: typeof perf5Y === 'number' ? perf5Y : undefined,
      });
    }
  }

  return discovered;
}

async function fetchTradingViewPrices(symbols: string[]): Promise<Map<string, StockPriceData>> {
  const results = new Map<string, StockPriceData>();
  const url = 'https://scanner.tradingview.com/srilanka/scan';

  const payload = {
    symbols: { tickers: symbols.map((s) => `CSELK:${s}`), query: { types: [] } },
    columns: ['close', 'change', 'change_abs', 'high', 'low', 'volume', 'price_52_week_high', 'price_52_week_low'],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`TradingView price fetch failed: ${response.status}`);
  }

  const data: TradingViewResponse = await response.json();
  for (const quote of data.data) {
    const symbol = quote.s.split(':')[1];
    const [close, change, changeAbs, , , volume, high52, low52] = quote.d;
    if (typeof close === 'number' && close > 0) {
      results.set(symbol, {
        price: close,
        change: typeof changeAbs === 'number' ? changeAbs : 0,
        changePercent: typeof change === 'number' ? change : 0,
        high52Week: typeof high52 === 'number' ? high52 : close * 1.1,
        low52Week: typeof low52 === 'number' ? low52 : close * 0.9,
        volume: typeof volume === 'number' ? volume : 0,
      });
    }
  }

  return results;
}

async function discoverWithCache(cacheClient: CacheClient): Promise<DiscoveredStock[]> {
  const result = await getOrSetCache(
    cacheClient,
    stockDiscoveryKey(),
    fetchTradingViewDiscovery,
    CACHE_TTL.STOCK_DISCOVERY,
    'stock_discovery',
    undefined,
    { allowStaleOnFailure: true }
  );
  return result as DiscoveredStock[];
}

async function getCachedScores(
  cacheClient: CacheClient,
  stockData: StockData,
  tier: AnalysisTier
): Promise<StockScores> {
  const fingerprint = {
    currentPrice: stockData.currentPrice,
    priceChange: stockData.priceChange,
    perfY: stockData.perfY ?? null,
    perf5Y: stockData.perf5Y ?? null,
  };

  const longKey = stockScoreKey(stockData.symbol, 'long_term');
  const cachedLong = await cacheClient.get(longKey);
  if (
    cachedLong &&
    cachedLong.status === 'hit' &&
    isFingerprintMatch(cachedLong.metadata, fingerprint)
  ) {
    return cachedLong.value as StockScores;
  }

  const scores = calculateStockScores(stockData);
  await cacheClient.set(
    longKey,
    scores,
    CACHE_TTL.STOCK_SCORE_LONG_TERM,
    'stock_score',
    fingerprint
  );
  await cacheClient.set(
    stockScoreKey(stockData.symbol, 'short_term'),
    scores,
    CACHE_TTL.STOCK_SCORE_SHORT_TERM,
    'stock_score',
    fingerprint
  );
  if (tier === 'very-long-term') {
    await cacheClient.set(
      stockScoreKey(stockData.symbol, 'very_long_term'),
      scores,
      CACHE_TTL.STOCK_SCORE_LONG_TERM,
      'stock_score',
      fingerprint
    );
  }
  return scores;
}

async function getCachedChartData(
  cacheClient: CacheClient,
  symbol: string,
  currentPrice: number,
  priceChange: number
): Promise<OHLCData[]> {
  const volatility = Math.min(0.05, Math.max(0.01, Math.abs(priceChange) / 100 + 0.015));
  const trend = priceChange >= 0 ? 0.0003 : -0.0001;
  const fingerprint = { currentPrice, volatility, trend };
  const key = chartDataKey(symbol);

  const cached = await cacheClient.get(key);
  if (
    cached &&
    (cached.status === 'hit' || cached.status === 'stale_fallback') &&
    isFingerprintMatch(cached.metadata, fingerprint)
  ) {
    return cached.value as OHLCData[];
  }

  const historicalData = generateHistoricalData(currentPrice, 90, volatility, trend);
  await cacheClient.set(key, historicalData, CACHE_TTL.CHART_DATA, 'chart_data', fingerprint);
  return historicalData;
}

export async function runScrapePipeline(
  options: ScrapePipelineOptions
): Promise<ScrapePipelineResult> {
  const { cacheClient, tier, existingAiMap, groqApiKey, useDetailedPrices = false } = options;

  const discoveredStocks = await discoverWithCache(cacheClient);
  if (discoveredStocks.length === 0) {
    throw new Error('No stocks discovered from TradingView');
  }
  console.log(`✅ Discovered ${discoveredStocks.length} stocks`);

  let priceData = new Map<string, StockPriceData>();
  if (useDetailedPrices) {
    try {
      const tradingViewSymbols = discoveredStocks.map((s) => s.tradingView);
      priceData = await fetchTradingViewPrices(tradingViewSymbols);
      console.log(`✅ Received price data for ${priceData.size} stocks`);
    } catch (error) {
      console.error('Price fetch failed, using discovery data:', error);
    }
  }

  console.log('📊 Computing scores and generating historical data...');
  const stocksWithComputedData = await Promise.all(
    discoveredStocks.map(async (stock, index) => {
      const priceInfo = useDetailedPrices ? priceData.get(stock.tradingView) : undefined;
      const currentPrice = priceInfo?.price ?? stock.currentPrice;
      const priceChange = priceInfo?.changePercent ?? stock.priceChange;
      const weekHigh52 = priceInfo?.high52Week ?? currentPrice * 1.1;
      const weekLow52 = priceInfo?.low52Week ?? currentPrice * 0.9;

      const historicalData = await getCachedChartData(
        cacheClient,
        stock.symbol,
        currentPrice,
        priceChange
      );

      const stockData: StockData = {
        id: index.toString(),
        symbol: stock.symbol,
        name: stock.name,
        sector: stock.sector,
        marketCap: stock.marketCap,
        currentPrice,
        priceChange,
        weekHigh52,
        weekLow52,
        perfY: stock.perfY,
        perf5Y: stock.perf5Y,
        historicalData,
      };

      const scores = await getCachedScores(cacheClient, stockData, tier);
      return { stockData, scores, stock };
    })
  );

  const top5ForAi = [...stocksWithComputedData]
    .sort((a, b) => {
      if (tier === 'very-long-term') {
        return b.scores.veryLongTermScore - a.scores.veryLongTermScore;
      }
      return b.scores.longTermScore - a.scores.longTermScore;
    })
    .slice(0, 5);

  console.log(
    `🎯 Identified Top 5 ${tier === 'very-long-term' ? 'Very Long-Term' : 'Long-Term'} Picks: ${top5ForAi.map((s) => s.stockData.symbol).join(', ')}`
  );

  const newAiExplanations = await batchGenerateExplanations(
    top5ForAi.map((d) => ({ stock: d.stockData, scores: d.scores })),
    groqApiKey,
    { cacheClient, tier }
  );

  const finalStocks: FinalStockPayload[] = stocksWithComputedData.map(({ stockData, scores }) => {
    let aiExplanation = newAiExplanations.get(stockData.symbol);
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

  const refreshedAt = Date.now();
  const lastUpdated = new Date(refreshedAt).toLocaleString('en-LK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const up = finalStocks.filter((s) => s.priceChange > 0).length;
  const down = finalStocks.filter((s) => s.priceChange < 0).length;
  const marketOverview = {
    totalStocks: finalStocks.length,
    marketsUp: up,
    marketsDown: down,
    totalVolume:
      'Rs. ' +
      (finalStocks.reduce((sum, s) => sum + s.currentPrice * 10000, 0) / 1_000_000).toFixed(1) +
      'M',
    lastUpdated,
  };

  await invalidateAfterScrape(cacheClient, {
    tier,
    symbols: finalStocks.map((s) => s.symbol),
    marketOverview: { ...marketOverview, refreshedAt },
    livePrices: finalStocks.map((s) => ({
      symbol: s.symbol,
      data: {
        currentPrice: s.currentPrice,
        priceChange: s.priceChange,
        weekHigh52: s.weekHigh52,
        weekLow52: s.weekLow52,
        volume: 0,
        refreshedAt,
      },
    })),
  });

  return { finalStocks, marketOverview };
}

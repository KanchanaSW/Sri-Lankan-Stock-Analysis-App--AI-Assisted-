import { CACHE_TTL } from './config';
import {
  livePriceKey,
  marketOverviewKey,
  stockDiscoveryKey,
  stockScoreKey,
  type AnalysisTier,
} from './cacheKeys';
import type { CacheClient } from './cacheOrchestration';

export interface MarketOverviewCache {
  totalStocks: number;
  marketsUp: number;
  marketsDown: number;
  totalVolume: string;
  lastUpdated: string;
  refreshedAt: number;
}

export interface LivePriceCache {
  currentPrice: number;
  priceChange: number;
  weekHigh52: number;
  weekLow52: number;
  volume: number;
  refreshedAt: number;
}

/** Invalidate and refresh caches after a successful scrape */
export async function invalidateAfterScrape(
  cacheClient: CacheClient,
  options: {
    tier: AnalysisTier;
    symbols: string[];
    marketOverview: MarketOverviewCache;
    livePrices: Array<{ symbol: string; data: LivePriceCache }>;
  }
): Promise<void> {
  const { tier, symbols, marketOverview, livePrices } = options;

  await cacheClient.delete(marketOverviewKey());
  await cacheClient.set(
    marketOverviewKey(),
    marketOverview,
    CACHE_TTL.MARKET_OVERVIEW,
    'market_overview'
  );

  for (const { symbol, data } of livePrices) {
    await cacheClient.delete(livePriceKey(symbol));
    await cacheClient.set(livePriceKey(symbol), data, CACHE_TTL.LIVE_PRICE, 'live_price');
  }

  for (const symbol of symbols) {
    await cacheClient.delete(stockScoreKey(symbol, 'short_term'));
  }

  if (tier === 'very-long-term') {
    await cacheClient.delete(stockDiscoveryKey());
    if (cacheClient.clearByType) {
      await cacheClient.clearByType('stock_score');
    }
  }
}

import { AI_PROMPT_VERSION } from './config';

export type CacheType =
  | 'live_price'
  | 'market_overview'
  | 'stock_discovery'
  | 'ai_analysis'
  | 'stock_score'
  | 'chart_data'
  | 'metadata';

export type ScoreTier = 'very_long_term' | 'long_term' | 'short_term';
export type AnalysisTier = 'very-long-term' | 'long-term' | 'short-term';

export function livePriceKey(symbol: string): string {
  return `live_price:${symbol}`;
}

export function marketOverviewKey(): string {
  return 'market_overview:cse';
}

export function stockDiscoveryKey(): string {
  return 'stock_discovery:top50:net_income';
}

export function aiAnalysisKey(
  symbol: string,
  tier: AnalysisTier,
  score: number
): string {
  const tierSlug = tier.replace(/-/g, '_');
  return `ai_analysis:${symbol}:${tierSlug}:score_${Math.round(score)}:prompt_${AI_PROMPT_VERSION}`;
}

export function stockScoreKey(symbol: string, tier: ScoreTier): string {
  return `stock_score:${symbol}:${tier}`;
}

export function chartDataKey(symbol: string): string {
  return `chart_data:${symbol}:1y:simulated`;
}

export function metadataSectorsKey(): string {
  return 'metadata:sectors';
}

export function analysisTierToScoreTier(tier: AnalysisTier): ScoreTier {
  if (tier === 'very-long-term') return 'very_long_term';
  if (tier === 'short-term') return 'short_term';
  return 'long_term';
}

export function scoreTierToTtlKey(tier: ScoreTier): 'STOCK_SCORE_LONG_TERM' | 'STOCK_SCORE_SHORT_TERM' {
  return tier === 'short_term' ? 'STOCK_SCORE_SHORT_TERM' : 'STOCK_SCORE_LONG_TERM';
}

export function analysisTierToAiTtlKey(
  tier: AnalysisTier
): 'AI_VERY_LONG_TERM' | 'AI_LONG_TERM' | 'AI_SHORT_TERM' {
  if (tier === 'very-long-term') return 'AI_VERY_LONG_TERM';
  if (tier === 'short-term') return 'AI_SHORT_TERM';
  return 'AI_LONG_TERM';
}

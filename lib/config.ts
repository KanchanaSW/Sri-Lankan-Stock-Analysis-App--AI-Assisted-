// Convex configuration

/**
 * Convex URL (required)
 */
export const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || '';

/**
 * Check if Convex is properly configured
 */
export function isConvexConfigured(): boolean {
  if (!CONVEX_URL) {
    throw new Error(
      'NEXT_PUBLIC_CONVEX_URL is not configured. Please run "npx convex dev" to set up Convex.'
    );
  }
  return true;
}

/** TTL cache durations in milliseconds */
export const CACHE_TTL = {
  LIVE_PRICE: 10 * 60 * 1000,
  MARKET_OVERVIEW: 30 * 60 * 1000,
  STOCK_DISCOVERY: 24 * 60 * 60 * 1000,
  AI_VERY_LONG_TERM: 7 * 24 * 60 * 60 * 1000,
  AI_LONG_TERM: 24 * 60 * 60 * 1000,
  AI_SHORT_TERM: 6 * 60 * 60 * 1000,
  STOCK_SCORE_LONG_TERM: 24 * 60 * 60 * 1000,
  STOCK_SCORE_SHORT_TERM: 3 * 60 * 60 * 1000,
  CHART_DATA: 24 * 60 * 60 * 1000,
  METADATA: 7 * 24 * 60 * 60 * 1000,
};

/** Bump to invalidate AI cache keys when prompts change */
export const AI_PROMPT_VERSION = 'v1';

/** Score delta that triggers AI cache key mismatch */
export const AI_SCORE_CHANGE_THRESHOLD = 5;

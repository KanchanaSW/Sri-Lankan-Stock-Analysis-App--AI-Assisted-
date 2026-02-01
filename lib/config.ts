// Feature flags and configuration

/**
 * Whether to use Convex as the data backend
 * Set to false to fallback to mock data
 */
export const USE_CONVEX = process.env.NEXT_PUBLIC_USE_CONVEX !== 'false';

/**
 * Convex URL (required when USE_CONVEX is true)
 */
export const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || '';

/**
 * Check if Convex is properly configured
 */
export function isConvexConfigured(): boolean {
  return USE_CONVEX && CONVEX_URL.length > 0;
}

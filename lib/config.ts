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

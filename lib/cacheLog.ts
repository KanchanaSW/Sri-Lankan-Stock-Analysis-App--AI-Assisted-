export type CacheLogEvent =
  | 'CACHE_HIT'
  | 'CACHE_MISS'
  | 'CACHE_EXPIRED'
  | 'CACHE_SET'
  | 'CACHE_FALLBACK_STALE'
  | 'CACHE_INVALIDATED';

export function logCacheEvent(
  event: CacheLogEvent,
  details: { key?: string; type?: string; count?: number; error?: string }
): void {
  const parts = [event];
  if (details.key) parts.push(`key=${details.key}`);
  if (details.type) parts.push(`type=${details.type}`);
  if (details.count !== undefined) parts.push(`count=${details.count}`);
  if (details.error) parts.push(`error=${details.error}`);
  console.log(parts.join(' '));
}

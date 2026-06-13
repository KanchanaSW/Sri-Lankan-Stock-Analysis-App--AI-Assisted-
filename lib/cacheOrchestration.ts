import { logCacheEvent } from './cacheLog';
import type { ConvexHttpClient } from 'convex/browser';
import type { ActionCtx } from '../convex/_generated/server';
import type { api } from '../convex/_generated/api';

export type CacheStatus = 'hit' | 'miss' | 'expired' | 'stale_fallback';

export interface CacheResult {
  value: unknown;
  status: CacheStatus;
  expiresAt: number;
  updatedAt: number;
  type: string;
  metadata?: Record<string, unknown>;
}

export interface CacheClient {
  get(key: string, opts?: { allowStale?: boolean }): Promise<CacheResult | null>;
  set(
    key: string,
    value: unknown,
    ttlMs: number,
    type: string,
    metadata?: Record<string, unknown>
  ): Promise<void>;
  delete(key: string): Promise<void>;
  clearByType?(type: string): Promise<number>;
}

/** Max age multiplier for stale fallback after expiry */
export const STALE_TTL_MULTIPLIER = 2;

export function isFingerprintMatch(
  cached: Record<string, unknown> | undefined,
  current: Record<string, unknown>
): boolean {
  if (!cached) return false;
  return Object.keys(current).every(
    (k) => JSON.stringify(cached[k]) === JSON.stringify(current[k])
  );
}

export async function getOrSetCache(
  client: CacheClient,
  key: string,
  fetcher: () => Promise<unknown>,
  ttlMs: number,
  type: string,
  metadata?: Record<string, unknown>,
  opts?: { allowStaleOnFailure?: boolean; fingerprint?: Record<string, unknown> }
): Promise<unknown> {
  const cached = await client.get(key);

  if (cached?.status === 'hit') {
    if (!opts?.fingerprint || isFingerprintMatch(cached.metadata, opts.fingerprint)) {
      return cached.value;
    }
  }

  try {
    const fresh = await fetcher();
    const isEmpty =
      fresh === null ||
      fresh === undefined ||
      (Array.isArray(fresh) && fresh.length === 0);

    if (isEmpty) {
      throw new Error(`Fetcher returned empty for ${key}`);
    }

    await client.set(key, fresh, ttlMs, type, metadata ?? opts?.fingerprint);
    return fresh;
  } catch (error) {
    if (opts?.allowStaleOnFailure) {
      const stale = await client.get(key, { allowStale: true });
      if (stale) {
        logCacheEvent('CACHE_FALLBACK_STALE', { key, type });
        return stale.value;
      }
    }
    throw error;
  }
}
export function createActionCacheClient(
  ctx: ActionCtx,
  apiRef: typeof api
): CacheClient {
  return {
    get: async (key, opts) => {
      const result = await ctx.runQuery(apiRef.cache.getCache, {
        key,
        allowStale: opts?.allowStale,
      });
      return result as CacheResult | null;
    },
    set: async (key, value, ttlMs, type, metadata) => {
      await ctx.runMutation(apiRef.cache.setCache, {
        key,
        value,
        ttlMs,
        type,
        metadata,
      });
    },
    delete: async (key) => {
      await ctx.runMutation(apiRef.cache.deleteCache, { key });
    },
    clearByType: async (type) => {
      const result = await ctx.runMutation(apiRef.cache.clearCacheByType, { type });
      return result.deleted;
    },
  };
}

/** Cache client for ConvexHttpClient (legacy script) */
export function createHttpCacheClient(client: ConvexHttpClient, apiRef: typeof api): CacheClient {
  return {
    get: async (key, opts) => {
      const result = await client.query(apiRef.cache.getCache, {
        key,
        allowStale: opts?.allowStale,
      });
      return result as CacheResult | null;
    },
    set: async (key, value, ttlMs, type, metadata) => {
      await client.mutation(apiRef.cache.setCache, {
        key,
        value,
        ttlMs,
        type,
        metadata,
      });
    },
    delete: async (key) => {
      await client.mutation(apiRef.cache.deleteCache, { key });
    },
    clearByType: async (type) => {
      const result = await client.mutation(apiRef.cache.clearCacheByType, { type });
      return result.deleted;
    },
  };
}

import { query, mutation, internalMutation } from './_generated/server';
import { v } from 'convex/values';
import { logCacheEvent } from '../lib/cacheLog';

function resolveCacheStatus(
  expiresAt: number,
  now: number,
  allowStale: boolean,
  createdAt: number
): 'hit' | 'expired' | 'stale_fallback' {
  if (expiresAt >= now) {
    return 'hit';
  }

  if (allowStale) {
    const ttl = expiresAt - createdAt;
    if (now <= expiresAt + ttl) {
      return 'stale_fallback';
    }
  }

  return 'expired';
}

export const getCache = query({
  args: {
    key: v.string(),
    allowStale: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const entry = await ctx.db
      .query('cacheEntries')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first();

    if (!entry) {
      logCacheEvent('CACHE_MISS', { key: args.key });
      return null;
    }

    const allowStale = args.allowStale ?? false;
    const status = resolveCacheStatus(entry.expiresAt, now, allowStale, entry.createdAt);

    if (status === 'hit') {
      logCacheEvent('CACHE_HIT', { key: args.key, type: entry.type });
      return {
        value: entry.value,
        status: 'hit' as const,
        expiresAt: entry.expiresAt,
        updatedAt: entry.updatedAt,
        type: entry.type,
        metadata: entry.metadata,
      };
    }

    if (status === 'stale_fallback') {
      logCacheEvent('CACHE_FALLBACK_STALE', { key: args.key, type: entry.type });
      return {
        value: entry.value,
        status: 'stale_fallback' as const,
        expiresAt: entry.expiresAt,
        updatedAt: entry.updatedAt,
        type: entry.type,
        metadata: entry.metadata,
      };
    }

    logCacheEvent('CACHE_EXPIRED', { key: args.key, type: entry.type });
    return null;
  },
});

export const setCache = mutation({
  args: {
    key: v.string(),
    value: v.any(),
    ttlMs: v.number(),
    type: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + args.ttlMs;
    const existing = await ctx.db
      .query('cacheEntries')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        type: args.type,
        expiresAt,
        updatedAt: now,
        metadata: args.metadata,
      });
    } else {
      await ctx.db.insert('cacheEntries', {
        key: args.key,
        value: args.value,
        type: args.type,
        expiresAt,
        createdAt: now,
        updatedAt: now,
        metadata: args.metadata,
      });
    }

    logCacheEvent('CACHE_SET', { key: args.key, type: args.type });
  },
});

export const deleteCache = mutation({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('cacheEntries')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      logCacheEvent('CACHE_INVALIDATED', { key: args.key, type: existing.type });
    }
  },
});

export const clearCacheByType = mutation({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query('cacheEntries')
      .withIndex('by_type', (q) => q.eq('type', args.type))
      .collect();

    for (const entry of entries) {
      await ctx.db.delete(entry._id);
      logCacheEvent('CACHE_INVALIDATED', { key: entry.key, type: entry.type });
    }

    return { deleted: entries.length };
  },
});

export const clearExpiredCache = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query('cacheEntries')
      .withIndex('by_expiresAt')
      .filter((q) => q.lt(q.field('expiresAt'), now))
      .collect();

    for (const entry of expired) {
      await ctx.db.delete(entry._id);
    }

    logCacheEvent('CACHE_INVALIDATED', { type: 'expired', count: expired.length });
    return { deleted: expired.length };
  },
});

/** Internal alias for cron jobs */
export const clearExpiredCacheInternal = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query('cacheEntries')
      .withIndex('by_expiresAt')
      .filter((q) => q.lt(q.field('expiresAt'), now))
      .collect();

    for (const entry of expired) {
      await ctx.db.delete(entry._id);
    }

    return { deleted: expired.length };
  },
});

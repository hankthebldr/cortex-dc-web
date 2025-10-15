/**
 * Redis Cache Service
 * High-performance caching layer for database queries and analytics
 * Optimized for dynamic cloud applications with automatic cache invalidation
 */

import { createClient, RedisClientType } from 'redis';

// ============================================================================
// INTERFACES
// ============================================================================

export interface CacheOptions {
  ttl?: number; // Time to live in seconds (default: 300 = 5 minutes)
  prefix?: string; // Cache key prefix for namespacing
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
}

// ============================================================================
// REDIS CACHE SERVICE
// ============================================================================

export class RedisCacheService {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;
  private stats = {
    hits: 0,
    misses: 0,
  };

  /**
   * Initialize Redis connection
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('Max Redis reconnection attempts reached');
              return new Error('Max reconnection attempts reached');
            }
            return Math.min(retries * 100, 3000);
          },
        },
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      this.client.on('connect', () => {
        console.log('[RedisCacheService] Connected to Redis');
      });

      this.client.on('reconnecting', () => {
        console.log('[RedisCacheService] Reconnecting to Redis...');
      });

      await this.client.connect();
      this.isConnected = true;
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      // Don't throw - gracefully degrade without cache
      this.isConnected = false;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  /**
   * Check if Redis is connected
   */
  isReady(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isReady()) {
      return null;
    }

    try {
      const value = await this.client!.get(key);

      if (value) {
        this.stats.hits++;
        return JSON.parse(value as string) as T;
      } else {
        this.stats.misses++;
        return null;
      }
    } catch (error) {
      console.error('Redis GET error:', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Set value in cache with optional TTL
   */
  async set(key: string, value: any, options?: CacheOptions): Promise<void> {
    if (!this.isReady()) {
      return;
    }

    try {
      const serialized = JSON.stringify(value);
      const ttl = options?.ttl || 300; // Default 5 minutes

      await this.client!.setEx(key, ttl, serialized);
    } catch (error) {
      console.error('Redis SET error:', error);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    if (!this.isReady()) {
      return;
    }

    try {
      await this.client!.del(key);
    } catch (error) {
      console.error('Redis DELETE error:', error);
    }
  }

  /**
   * Delete all keys matching a pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    if (!this.isReady()) {
      return;
    }

    try {
      const keys = await this.client!.keys(pattern);

      if (keys.length > 0) {
        await this.client!.del(keys);
      }
    } catch (error) {
      console.error('Redis DELETE PATTERN error:', error);
    }
  }

  /**
   * Get or set pattern - returns cached value or computes and caches result
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    // Cache miss - fetch data
    const data = await fetchFn();

    // Store in cache for next time
    await this.set(key, data, options);

    return data;
  }

  /**
   * Invalidate cache by pattern (e.g., "user:*", "analytics:*")
   */
  async invalidate(pattern: string): Promise<void> {
    await this.deletePattern(pattern);
  }

  /**
   * Clear all cache
   */
  async flush(): Promise<void> {
    if (!this.isReady()) {
      return;
    }

    try {
      await this.client!.flushDb();
    } catch (error) {
      console.error('Redis FLUSH error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;

    let size = 0;
    if (this.isReady()) {
      try {
        const info = await this.client!.info('memory');
        const match = info.match(/used_memory:(\d+)/);
        size = match ? parseInt(match[1], 10) : 0;
      } catch (error) {
        console.error('Error getting cache stats:', error);
      }
    }

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      size,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  /**
   * Utility: Generate cache key with prefix
   */
  generateKey(prefix: string, ...parts: string[]): string {
    return `${prefix}:${parts.join(':')}`;
  }
}

// ============================================================================
// CACHE KEY PATTERNS
// ============================================================================

export const CacheKeys = {
  // User data
  user: (userId: string) => `user:${userId}`,
  userByEmail: (email: string) => `user:email:${email}`,
  userList: (filters: string) => `users:list:${filters}`,

  // Analytics
  loginAnalytics: (startDate: string, endDate: string) =>
    `analytics:login:${startDate}:${endDate}`,
  userActivity: (userId: string) => `analytics:activity:${userId}`,
  adminAnalytics: (period: string) => `analytics:admin:${period}`,
  recentActivity: (limit: number) => `analytics:recent:${limit}`,

  // POVs and TRRs
  pov: (povId: string) => `pov:${povId}`,
  povList: (filters: string) => `povs:list:${filters}`,
  trr: (trrId: string) => `trr:${trrId}`,
  trrList: (filters: string) => `trrs:list:${filters}`,

  // Sessions
  session: (sessionId: string) => `session:${sessionId}`,
  userSessions: (userId: string) => `sessions:user:${userId}`,
  activeSessions: () => 'sessions:active',
};

// ============================================================================
// CACHE INVALIDATION PATTERNS
// ============================================================================

export const CacheInvalidationPatterns = {
  // Invalidate all user-related caches
  user: (userId: string) => [`user:${userId}*`, `analytics:activity:${userId}*`],

  // Invalidate all analytics caches
  analytics: () => ['analytics:*'],

  // Invalidate POV-related caches
  pov: (povId: string) => [`pov:${povId}*`, 'povs:list:*'],

  // Invalidate TRR-related caches
  trr: (trrId: string) => [`trr:${trrId}*`, 'trrs:list:*'],

  // Invalidate session caches
  sessions: (userId: string) => [`sessions:user:${userId}*`, 'sessions:active*'],
};

// Export singleton instance
let redisCacheInstance: RedisCacheService | null = null;

export function getRedisCacheService(): RedisCacheService {
  if (!redisCacheInstance) {
    redisCacheInstance = new RedisCacheService();
  }
  return redisCacheInstance;
}

export const redisCacheService = getRedisCacheService();
export default redisCacheService;

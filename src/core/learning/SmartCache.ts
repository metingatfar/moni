export interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

export class SmartCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private hits = 0;
  private misses = 0;

  // TTL durations in milliseconds
  public static TTL = {
    chat: 60 * 1000,          // 1 minute
    agent_routing: 5 * 60 * 1000, // 5 minutes
    diagnostics: 10 * 1000,   // 10 seconds
    workflow: 60 * 60 * 1000  // 1 hour
  };

  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) {
      this.misses++;
      return null;
    }

    if (Date.now() > item.expiresAt) {
      // Evict expired item
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return item.value;
  }

  public set<T>(key: string, value: T, ttlMs: number): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs
    });
  }

  public getHitRate(): number {
    const total = this.hits + this.misses;
    if (total === 0) return 0;
    return Math.round((this.hits / total) * 100);
  }

  public clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }
}

export const smartCache = new SmartCache();

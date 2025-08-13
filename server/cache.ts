/**
 * Simple in-memory cache with TTL support for performance optimization
 */
interface CacheItem<T> {
  data: T;
  expires: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  set<T>(key: string, data: T, ttlMs: number = 300000): void { // Default 5 minutes
    const expires = Date.now() + ttlMs;
    this.cache.set(key, { data, expires });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Destroy cache and cleanup
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

// Global cache instance
export const cache = new MemoryCache();

/**
 * Cache wrapper function for easy use with async functions
 */
export async function withCache<T>(
  key: string, 
  fn: () => Promise<T>, 
  ttlMs: number = 300000 // 5 minutes default
): Promise<T> {
  // Try to get from cache first
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // If not in cache, execute function and cache result
  const result = await fn();
  cache.set(key, result, ttlMs);
  return result;
}

/**
 * Invalidate cache entries by pattern
 */
export function invalidateCache(pattern: string): number {
  let deletedCount = 0;
  const stats = cache.getStats();
  
  for (const key of stats.keys) {
    if (key.includes(pattern)) {
      cache.delete(key);
      deletedCount++;
    }
  }
  
  return deletedCount;
}

/**
 * Cache invalidation for specific entities
 */
export const CacheKeys = {
  dashboard: (companyId: number) => `dashboard-${companyId}`,
  invoices: (companyId: number) => `invoices-${companyId}`,
  customers: (companyId: number) => `customers-${companyId}`,
  expenses: (companyId: number) => `expenses-${companyId}`,
  bankAccounts: (companyId: number) => `bank-accounts-${companyId}`,
  permissions: (userId: number, companyId: number) => `permissions-${userId}-${companyId}`,
  reports: (companyId: number, type: string) => `reports-${companyId}-${type}`
};

/**
 * Invalidate related caches when data changes
 */
export function invalidateEntityCache(companyId: number, entity: keyof typeof CacheKeys) {
  if (entity === 'permissions') {
    return invalidateCache(`permissions-`);
  }
  
  const pattern = entity === 'dashboard' ? 
    `dashboard-${companyId}` : 
    `${entity}-${companyId}`;
    
  return invalidateCache(pattern);
}
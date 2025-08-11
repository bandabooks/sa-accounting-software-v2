// Simple in-memory cache for performance optimization
interface CacheEntry {
  value: any;
  expiresAt: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, value: any, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { value, expiresAt });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }

  clear(): void {
    this.cache.clear();
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
export const cache = new SimpleCache();

// Cleanup expired entries every 10 minutes
setInterval(() => {
  cache.cleanup();
}, 10 * 60 * 1000);

// Cache wrapper function
export async function withCache<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = cache.get(key);
  if (cached !== null) {
    return cached;
  }
  
  const result = await fetchFunction();
  cache.set(key, result, ttl);
  return result;
}
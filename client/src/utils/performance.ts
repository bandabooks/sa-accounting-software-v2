// Performance optimization utilities

/**
 * Debounce function to limit execution frequency
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit execution to once per interval
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Batch multiple updates into a single render
 */
export function batchUpdates<T>(
  updates: T[],
  callback: (batch: T[]) => void,
  delay: number = 50
): void {
  let batch: T[] = [];
  let timeout: NodeJS.Timeout | null = null;
  
  const flush = () => {
    if (batch.length > 0) {
      callback(batch);
      batch = [];
    }
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  updates.forEach((update) => {
    batch.push(update);
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(flush, delay);
  });
}

/**
 * Lazy load images with intersection observer
 */
export function lazyLoadImage(
  imgElement: HTMLImageElement,
  src: string,
  placeholder?: string
): void {
  if (placeholder) {
    imgElement.src = placeholder;
  }
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          imgElement.src = src;
          observer.unobserve(imgElement);
        }
      });
    },
    {
      rootMargin: '50px',
    }
  );
  
  observer.observe(imgElement);
}

/**
 * Memoize expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyResolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = keyResolver ? keyResolver(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // Limit cache size to prevent memory leaks
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  }) as T;
}

/**
 * Performance monitoring decorator
 */
export function measurePerformance(name: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      
      try {
        const result = await originalMethod.apply(this, args);
        const end = performance.now();
        
        console.log(`[Performance] ${name}.${propertyKey}: ${(end - start).toFixed(2)}ms`);
        
        return result;
      } catch (error) {
        const end = performance.now();
        console.error(`[Performance] ${name}.${propertyKey} failed after ${(end - start).toFixed(2)}ms`);
        throw error;
      }
    };
    
    return descriptor;
  };
}

/**
 * Request idle callback polyfill
 */
export const requestIdleCallback =
  typeof window !== 'undefined' && window.requestIdleCallback
    ? window.requestIdleCallback
    : (callback: IdleRequestCallback) => {
        const start = Date.now();
        return setTimeout(() => {
          callback({
            didTimeout: false,
            timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
          } as IdleDeadline);
        }, 1);
      };

/**
 * Cancel idle callback polyfill
 */
export const cancelIdleCallback =
  typeof window !== 'undefined' && window.cancelIdleCallback
    ? window.cancelIdleCallback
    : clearTimeout;

/**
 * Chunk large arrays for processing
 */
export async function* chunkArray<T>(
  array: T[],
  chunkSize: number
): AsyncGenerator<T[], void, unknown> {
  for (let i = 0; i < array.length; i += chunkSize) {
    yield array.slice(i, i + chunkSize);
    // Allow browser to breathe between chunks
    await new Promise((resolve) => requestIdleCallback(resolve));
  }
}

/**
 * Optimize large list rendering with windowing
 */
export function createVirtualScroller<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 3
) {
  return {
    getTotalHeight: () => items.length * itemHeight,
    getVisibleRange: (scrollTop: number) => {
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const endIndex = Math.min(
        items.length - 1,
        Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
      );
      return { startIndex, endIndex };
    },
    getOffsetY: (startIndex: number) => startIndex * itemHeight,
    getVisibleItems: (scrollTop: number) => {
      const { startIndex, endIndex } = this.getVisibleRange(scrollTop);
      return items.slice(startIndex, endIndex + 1);
    },
  };
}
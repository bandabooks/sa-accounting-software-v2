import { useRef, useState, useEffect, useCallback } from 'react';

interface UseVirtualListOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  getScrollElement?: () => HTMLElement | null;
}

export function useVirtualList<T>(
  items: T[],
  {
    itemHeight,
    containerHeight,
    overscan = 3,
    getScrollElement,
  }: UseVirtualListOptions
) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const scrollElement = getScrollElement ? getScrollElement() : window;
    
    const handleScroll = () => {
      const top = scrollElement === window
        ? window.pageYOffset || document.documentElement.scrollTop
        : (scrollElement as HTMLElement).scrollTop;
      setScrollTop(top);
    };

    if (scrollElement) {
      if (scrollElement === window) {
        window.addEventListener('scroll', handleScroll, { passive: true });
      } else {
        (scrollElement as HTMLElement).addEventListener('scroll', handleScroll, { passive: true });
      }
    }

    return () => {
      if (scrollElement) {
        if (scrollElement === window) {
          window.removeEventListener('scroll', handleScroll);
        } else {
          (scrollElement as HTMLElement).removeEventListener('scroll', handleScroll);
        }
      }
    };
  }, [getScrollElement]);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const virtualItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    virtualItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
  };
}
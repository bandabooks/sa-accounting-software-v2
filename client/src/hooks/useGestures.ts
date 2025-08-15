import { useGesture } from '@use-gesture/react';
import { useSpring } from 'react-spring';
import { useState, useRef } from 'react';

interface GestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onDrag?: (offset: [number, number]) => void;
  onPullToRefresh?: () => void;
  enableSwipe?: boolean;
  enablePinch?: boolean;
  enableDrag?: boolean;
  enablePullToRefresh?: boolean;
  swipeThreshold?: number;
  dragBounds?: { left?: number; right?: number; top?: number; bottom?: number };
}

export const useGestures = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onDrag,
  onPullToRefresh,
  enableSwipe = true,
  enablePinch = false,
  enableDrag = false,
  enablePullToRefresh = false,
  swipeThreshold = 100,
  dragBounds = {}
}: GestureConfig) => {
  const [{ x, y, scale }, api] = useSpring(() => ({ x: 0, y: 0, scale: 1 }));
  const [isPulling, setIsPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const containerRef = useRef<HTMLElement>(null);

  const bind = useGesture({
    onDrag: ({ offset: [ox, oy], velocity: [vx, vy], direction: [dx, dy], cancel, last }) => {
      if (enableDrag && onDrag) {
        onDrag([ox, oy]);
      }

      // Pull to refresh logic
      if (enablePullToRefresh && containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        
        if (scrollTop <= 0 && dy > 0) {
          const pullDistance = Math.max(0, oy);
          const maxPull = 120;
          const progress = Math.min(pullDistance / maxPull, 1);
          
          setPullProgress(progress);
          setIsPulling(true);
          
          if (progress >= 1 && !last) {
            cancel();
            if (onPullToRefresh) {
              onPullToRefresh();
            }
          }
          
          api.start({ y: Math.min(pullDistance * 0.5, maxPull * 0.5) });
          return;
        }
      }

      // Apply drag bounds
      const boundedX = Math.max(
        dragBounds.left ?? -Infinity,
        Math.min(dragBounds.right ?? Infinity, ox)
      );
      const boundedY = Math.max(
        dragBounds.top ?? -Infinity,
        Math.min(dragBounds.bottom ?? Infinity, oy)
      );

      api.start({ x: boundedX, y: boundedY });

      if (last) {
        setIsPulling(false);
        setPullProgress(0);
        
        // Handle swipe gestures
        if (enableSwipe) {
          const absVx = Math.abs(vx);
          const absVy = Math.abs(vy);
          
          if (absVx > 0.2 || Math.abs(ox) > swipeThreshold) {
            if (dx > 0 && onSwipeRight) {
              onSwipeRight();
            } else if (dx < 0 && onSwipeLeft) {
              onSwipeLeft();
            }
          }
          
          if (absVy > 0.2 || Math.abs(oy) > swipeThreshold) {
            if (dy > 0 && onSwipeDown) {
              onSwipeDown();
            } else if (dy < 0 && onSwipeUp) {
              onSwipeUp();
            }
          }
        }
        
        // Reset position
        api.start({ x: 0, y: 0 });
      }
    },
    
    onPinch: ({ offset: [scale], last }) => {
      if (!enablePinch) return;
      
      api.start({ scale });
      
      if (onPinch) {
        onPinch(scale);
      }
      
      if (last) {
        api.start({ scale: 1 });
      }
    }
  }, {
    drag: {
      from: () => [x.get(), y.get()],
      bounds: dragBounds,
      rubberband: true,
      filterTaps: true
    },
    pinch: {
      scaleBounds: { min: 0.5, max: 2 },
      rubberband: true
    }
  });

  const resetGestures = () => {
    api.start({ x: 0, y: 0, scale: 1 });
    setIsPulling(false);
    setPullProgress(0);
  };

  return {
    bind,
    springs: { x, y, scale },
    isPulling,
    pullProgress,
    containerRef,
    resetGestures
  };
};

export default useGestures;
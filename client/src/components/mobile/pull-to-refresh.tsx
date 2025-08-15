import React, { useRef } from 'react';
import { animated } from 'react-spring';
import { RefreshCw, ChevronDown } from 'lucide-react';
import useGestures from '@/hooks/useGestures';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  disabled?: boolean;
  refreshThreshold?: number;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  disabled = false,
  refreshThreshold = 100
}) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { bind, springs, isPulling, pullProgress, resetGestures } = useGestures({
    enablePullToRefresh: !disabled,
    onPullToRefresh: async () => {
      if (disabled || isRefreshing) return;
      
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
        resetGestures();
      }
    },
    containerRef
  });

  const pullIndicatorOpacity = pullProgress;
  const pullIndicatorRotation = pullProgress * 180;
  const pullIndicatorScale = 0.8 + (pullProgress * 0.2);

  return (
    <animated.div
      ref={containerRef}
      {...bind()}
      className="relative h-full overflow-auto touch-action-pan-y"
      style={{
        transform: springs.y.to(y => `translateY(${y}px)`)
      }}
    >
      {/* Pull to refresh indicator */}
      <animated.div
        className="pull-to-refresh"
        style={{
          opacity: pullIndicatorOpacity,
          transform: `translateY(${isPulling ? 0 : -60}px)`
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <animated.div
            style={{
              transform: `rotate(${pullIndicatorRotation}deg) scale(${pullIndicatorScale})`,
            }}
            className="text-primary"
          >
            {isRefreshing ? (
              <RefreshCw className="h-6 w-6 animate-spin" />
            ) : (
              <ChevronDown className="h-6 w-6" />
            )}
          </animated.div>
          <span className="text-sm font-medium">
            {isRefreshing
              ? 'Refreshing...'
              : pullProgress >= 1
                ? 'Release to refresh'
                : 'Pull to refresh'
            }
          </span>
        </div>
      </animated.div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Loading overlay */}
      {isRefreshing && (
        <div className="absolute top-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-4 flex justify-center">
          <div className="flex items-center gap-2 text-primary">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Refreshing...</span>
          </div>
        </div>
      )}
    </animated.div>
  );
};

export default PullToRefresh;
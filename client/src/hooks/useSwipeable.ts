import { useSwipeable as useReactSwipeable } from 'react-swipeable';

interface SwipeableConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  delta?: number;
  preventScrollOnSwipe?: boolean;
  trackTouch?: boolean;
  trackMouse?: boolean;
  rotationAngle?: number;
}

export const useSwipeable = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  delta = 50,
  preventScrollOnSwipe = false,
  trackTouch = true,
  trackMouse = false,
  rotationAngle = 0
}: SwipeableConfig) => {
  return useReactSwipeable({
    onSwipedLeft: onSwipeLeft,
    onSwipedRight: onSwipeRight,
    onSwipedUp: onSwipeUp,
    onSwipedDown: onSwipeDown,
    onTap: onTap,
    delta,
    preventScrollOnSwipe,
    trackTouch,
    trackMouse,
    rotationAngle,
    swipeDuration: 500,
    touchEventOptions: { passive: false }
  });
};

export default useSwipeable;
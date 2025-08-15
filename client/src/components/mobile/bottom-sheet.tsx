import React, { useEffect } from 'react';
import { animated } from 'react-spring';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useGestures from '@/hooks/useGestures';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: number[];
  initialSnap?: number;
  showHandle?: boolean;
  closeOnBackdrop?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [0.5, 0.9],
  initialSnap = 0,
  showHandle = true,
  closeOnBackdrop = true
}) => {
  const [currentSnap, setCurrentSnap] = React.useState(snapPoints[initialSnap]);
  
  const { bind, springs } = useGestures({
    onSwipeDown: () => {
      const currentIndex = snapPoints.indexOf(currentSnap);
      if (currentIndex > 0) {
        setCurrentSnap(snapPoints[currentIndex - 1]);
      } else {
        onClose();
      }
    },
    onSwipeUp: () => {
      const currentIndex = snapPoints.indexOf(currentSnap);
      if (currentIndex < snapPoints.length - 1) {
        setCurrentSnap(snapPoints[currentIndex + 1]);
      }
    },
    enableSwipe: true,
    enableDrag: true,
    swipeThreshold: 50,
    dragBounds: { 
      top: -(window.innerHeight * Math.max(...snapPoints)), 
      bottom: 0 
    }
  });

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Bottom sheet */}
      <animated.div
        {...bind()}
        style={{
          transform: springs.y.to(y => 
            `translateY(${isOpen ? Math.max(y, -(window.innerHeight * currentSnap)) : window.innerHeight}px)`
          )
        }}
        className="bottom-sheet"
      >
        {/* Handle */}
        {showHandle && (
          <div className="bottom-sheet-handle" />
        )}

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="mobile-tap-area"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Snap indicators */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-1">
          {snapPoints.map((point, index) => (
            <button
              key={index}
              onClick={() => setCurrentSnap(point)}
              className={`w-2 h-8 rounded-full transition-all ${
                currentSnap === point 
                  ? 'bg-primary' 
                  : 'bg-gray-300'
              }`}
              aria-label={`Snap to ${Math.round(point * 100)}%`}
            />
          ))}
        </div>
      </animated.div>
    </>
  );
};

export default BottomSheet;
import React from 'react';
import { animated } from 'react-spring';
import { X, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useGestures from '@/hooks/useGestures';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
  children
}) => {
  const { bind, springs } = useGestures({
    onSwipeLeft: onClose,
    enableSwipe: true,
    swipeThreshold: 50,
    dragBounds: { left: -280, right: 0 }
  });

  return (
    <>
      {/* Overlay */}
      <div 
        className={`mobile-nav-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <animated.div
        {...bind()}
        style={{
          transform: springs.x.to(x => `translateX(${isOpen ? Math.max(x, -280) : -280}px)`)
        }}
        className="mobile-sidebar"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="mobile-tap-area"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {children}
        </div>
        
        {/* Gesture hint */}
        <div className="p-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Swipe left or tap outside to close
          </p>
        </div>
      </animated.div>
    </>
  );
};

export default MobileSidebar;
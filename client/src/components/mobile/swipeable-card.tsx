import React, { useState } from 'react';
import { animated } from 'react-spring';
import { Trash2, Edit, Archive, More } from 'lucide-react';
import useGestures from '@/hooks/useGestures';

interface SwipeAction {
  icon: React.ReactNode;
  label: string;
  action: () => void;
  color?: 'red' | 'blue' | 'green' | 'gray';
}

interface SwipeableCardProps {
  children: React.ReactNode;
  actions?: SwipeAction[];
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  actions = [],
  onSwipeLeft,
  onSwipeRight,
  className = ''
}) => {
  const [showActions, setShowActions] = useState(false);
  const [swiping, setSwiping] = useState(false);

  const { bind, springs } = useGestures({
    onSwipeLeft: () => {
      if (actions.length > 0) {
        setShowActions(true);
      } else if (onSwipeLeft) {
        onSwipeLeft();
      }
    },
    onSwipeRight: () => {
      if (showActions) {
        setShowActions(false);
      } else if (onSwipeRight) {
        onSwipeRight();
      }
    },
    enableSwipe: true,
    enableDrag: true,
    swipeThreshold: 60,
    dragBounds: { left: -120, right: 0 }
  });

  const getActionColor = (color: string = 'red') => {
    switch (color) {
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'gray': return 'bg-gray-500';
      default: return 'bg-red-500';
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Main card content */}
      <animated.div
        {...bind()}
        style={{
          transform: springs.x.to(x => `translateX(${x}px)`)
        }}
        className={`swipeable-card ${swiping ? 'swiping' : ''} bg-white relative z-10`}
      >
        {children}
      </animated.div>

      {/* Swipe actions */}
      {actions.length > 0 && (
        <div 
          className={`absolute top-0 right-0 bottom-0 flex transition-all duration-200 ${
            showActions ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                action.action();
                setShowActions(false);
              }}
              className={`
                ${getActionColor(action.color)} 
                text-white min-w-[60px] flex flex-col items-center justify-center 
                mobile-tap-area text-xs font-medium transition-all hover:brightness-110
              `}
              title={action.label}
            >
              {action.icon}
              <span className="mt-1 text-[10px]">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Tap overlay to close actions */}
      {showActions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
};

// Pre-configured common swipe actions
export const commonSwipeActions = {
  delete: (onDelete: () => void): SwipeAction => ({
    icon: <Trash2 className="h-4 w-4" />,
    label: 'Delete',
    action: onDelete,
    color: 'red'
  }),
  
  edit: (onEdit: () => void): SwipeAction => ({
    icon: <Edit className="h-4 w-4" />,
    label: 'Edit',
    action: onEdit,
    color: 'blue'
  }),
  
  archive: (onArchive: () => void): SwipeAction => ({
    icon: <Archive className="h-4 w-4" />,
    label: 'Archive',
    action: onArchive,
    color: 'gray'
  }),
  
  more: (onMore: () => void): SwipeAction => ({
    icon: <More className="h-4 w-4" />,
    label: 'More',
    action: onMore,
    color: 'gray'
  })
};

export default SwipeableCard;
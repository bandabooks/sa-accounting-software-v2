import { useEffect } from 'react';
import { useCollaborationIndicators } from '@/hooks/useCollaborationIndicators';

type ActivityType = 'VIEWING_SHIFT' | 'COUNTING_DRAWER' | 'PROCESSING_SALE' | 'CLOSING_SHIFT' | 'TAKING_BREAK' | 'CASH_DROP' | 'FLOAT_ADJUSTMENT' | 'SWITCH_CASHIER';

interface ActivityTrackerProps {
  children: React.ReactNode;
  activity: ActivityType;
  location?: string;
}

export function ActivityTracker({ children, activity, location }: ActivityTrackerProps) {
  const { updateActivity } = useCollaborationIndicators();

  useEffect(() => {
    updateActivity(activity, location);
  }, [activity, location, updateActivity]);

  return <>{children}</>;
}
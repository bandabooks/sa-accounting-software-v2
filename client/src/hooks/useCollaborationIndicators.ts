import { useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

export interface CollaborationUser {
  id: string;
  name: string;
  avatar?: string;
  activity: string;
  location: string;
  lastSeen: Date;
  color: string;
}

export interface CollaborationState {
  activeUsers: CollaborationUser[];
  currentActivity: string;
  shiftLocked: boolean;
  lockOwner?: string;
}

const ACTIVITY_TYPES = {
  VIEWING_SHIFT: 'Viewing shift details',
  COUNTING_DRAWER: 'Counting cash drawer',
  PROCESSING_SALE: 'Processing sale',
  CLOSING_SHIFT: 'Closing shift',
  TAKING_BREAK: 'Taking break',
  CASH_DROP: 'Performing cash drop',
  FLOAT_ADJUSTMENT: 'Adjusting float',
  SWITCH_CASHIER: 'Switching cashier'
} as const;

const USER_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald  
  '#8B5CF6', // violet
  '#F59E0B', // amber
  '#EF4444', // red
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#EC4899'  // pink
];

export function useCollaborationIndicators() {
  const { user } = useAuth();
  const [collaborationState, setCollaborationState] = useState<CollaborationState>({
    activeUsers: [],
    currentActivity: 'Viewing shift details',
    shiftLocked: false
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout>();
  const userColorRef = useRef<string>(USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]);

  // Connect to WebSocket for real-time collaboration
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/collaboration`;
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('Collaboration WebSocket connected');
      
      // Send initial presence with delay to ensure connection is ready
      if (user?.id) {
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            try {
              wsRef.current.send(JSON.stringify({
                type: 'join',
                userId: user.id.toString(),
                name: user.name || user.username,
                color: userColorRef.current,
                activity: ACTIVITY_TYPES.VIEWING_SHIFT,
                location: 'shift-management'
              }));
            } catch (error) {
              console.warn('Failed to send initial presence:', error);
            }
          }
        }, 100);
      }

      // Start heartbeat
      heartbeatRef.current = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'heartbeat',
            userId: user.id
          }));
        }
      }, 30000); // Send heartbeat every 30 seconds
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'user_joined':
          case 'user_activity':
          case 'users_update':
            if (message.users && Array.isArray(message.users)) {
              setCollaborationState(prev => ({
                ...prev,
                activeUsers: message.users.map((u: any) => ({
                  ...u,
                  lastSeen: new Date(u.lastSeen)
                }))
              }));
            }
            break;
            
          case 'shift_locked':
            setCollaborationState(prev => ({
              ...prev,
              shiftLocked: true,
              lockOwner: message.lockOwner
            }));
            break;
            
          case 'shift_unlocked':
            setCollaborationState(prev => ({
              ...prev,
              shiftLocked: false,
              lockOwner: undefined
            }));
            break;
            
          case 'user_left':
            setCollaborationState(prev => ({
              ...prev,
              activeUsers: prev.activeUsers.filter(u => u.id !== message.userId)
            }));
            break;
        }
      } catch (error) {
        console.error('Error parsing collaboration message:', error);
      }
    };

    wsRef.current.onclose = () => {
      console.log('Collaboration WebSocket disconnected');
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('Collaboration WebSocket error:', error);
    };

    // Cleanup on unmount
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      if (wsRef.current && user?.id) {
        try {
          if (wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'leave',
              userId: user.id.toString()
            }));
          }
        } catch (error) {
          console.warn('Failed to send leave message:', error);
        } finally {
          wsRef.current.close();
        }
      }
    };
  }, [user]);

  // Update user activity
  const updateActivity = (activity: keyof typeof ACTIVITY_TYPES, location?: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && user?.id) {
      try {
        wsRef.current.send(JSON.stringify({
          type: 'activity_update',
          userId: user.id.toString(),
          activity: ACTIVITY_TYPES[activity],
          location: location || 'shift-management',
          timestamp: new Date().toISOString()
        }));
        
        setCollaborationState(prev => ({
          ...prev,
          currentActivity: ACTIVITY_TYPES[activity]
        }));
      } catch (error) {
        console.warn('Failed to send activity update:', error);
      }
    }
  };

  // Request shift lock for critical operations
  const requestShiftLock = (operation: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && user?.id) {
      try {
        wsRef.current.send(JSON.stringify({
          type: 'request_lock',
          userId: user.id.toString(),
          operation,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        console.warn('Failed to request shift lock:', error);
      }
    }
  };

  // Release shift lock
  const releaseShiftLock = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN && user?.id) {
      try {
        wsRef.current.send(JSON.stringify({
          type: 'release_lock',
          userId: user.id.toString(),
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        console.warn('Failed to release shift lock:', error);
      }
    }
  };

  return {
    collaborationState,
    updateActivity,
    requestShiftLock,
    releaseShiftLock,
    ACTIVITY_TYPES
  };
}
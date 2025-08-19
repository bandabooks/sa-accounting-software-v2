import { useEffect, useCallback } from 'react';

export function useUserActivity() {
  const sendHeartbeat = useCallback(async () => {
    try {
      await fetch('/api/user-activity/heartbeat', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Failed to send activity heartbeat:', error);
    }
  }, []);

  useEffect(() => {
    // Send initial heartbeat
    sendHeartbeat();

    // Send heartbeat every 2 minutes
    const heartbeatInterval = setInterval(sendHeartbeat, 2 * 60 * 1000);

    // Track user interactions
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    let lastActivity = Date.now();

    const handleActivity = () => {
      const now = Date.now();
      // Only send heartbeat if it's been more than 30 seconds since last activity
      if (now - lastActivity > 30 * 1000) {
        sendHeartbeat();
        lastActivity = now;
      }
    };

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup
    return () => {
      clearInterval(heartbeatInterval);
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [sendHeartbeat]);
}
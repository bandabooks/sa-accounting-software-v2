import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  activity: string;
  location: string;
  lastSeen: Date;
  ws: WebSocket;
}

interface ShiftLock {
  userId: string;
  operation: string;
  lockedAt: Date;
}

class CollaborationManager {
  private users = new Map<string, CollaborationUser>();
  private shiftLock: ShiftLock | null = null;
  private wss: WebSocketServer | null = null;

  initialize(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws/collaboration',
      verifyClient: (info: any) => {
        // Add any authentication checks here if needed
        return true;
      }
    });

    this.wss.on('connection', (ws, request) => {
      console.log('New collaboration connection established');

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error parsing collaboration message:', error);
        }
      });

      ws.on('close', () => {
        // Find and remove the user
        for (const [userId, user] of Array.from(this.users.entries())) {
          if (user.ws === ws) {
            this.users.delete(userId);
            this.broadcastUserLeft(userId);
            
            // Release lock if this user owned it
            if (this.shiftLock && this.shiftLock.userId === userId) {
              this.shiftLock = null;
              this.broadcastShiftUnlocked();
            }
            break;
          }
        }
      });

      ws.on('error', (error) => {
        console.error('Collaboration WebSocket error:', error);
      });
    });

    // Clean up inactive users every minute
    setInterval(() => {
      this.cleanupInactiveUsers();
    }, 60000);

    console.log('Collaboration WebSocket server initialized');
  }

  private handleMessage(ws: WebSocket, message: any) {
    switch (message.type) {
      case 'join':
        this.handleUserJoin(ws, message);
        break;
      case 'activity_update':
        this.handleActivityUpdate(message);
        break;
      case 'heartbeat':
        this.handleHeartbeat(message);
        break;
      case 'request_lock':
        this.handleLockRequest(message);
        break;
      case 'release_lock':
        this.handleLockRelease(message);
        break;
      case 'leave':
        this.handleUserLeave(message);
        break;
    }
  }

  private handleUserJoin(ws: WebSocket, message: any) {
    const user: CollaborationUser = {
      id: message.userId,
      name: message.name,
      color: message.color,
      activity: message.activity,
      location: message.location,
      lastSeen: new Date(),
      ws
    };

    this.users.set(message.userId, user);
    
    // Send current state to new user
    this.sendToUser(message.userId, {
      type: 'users_update',
      users: this.getActiveUsers()
    });

    if (this.shiftLock) {
      this.sendToUser(message.userId, {
        type: 'shift_locked',
        lockOwner: this.users.get(this.shiftLock.userId)?.name || 'Unknown',
        operation: this.shiftLock.operation
      });
    }

    // Broadcast to other users
    this.broadcastToOthers(message.userId, {
      type: 'user_joined',
      user: this.getUserInfo(user),
      users: this.getActiveUsers()
    });

    console.log(`User ${message.name} joined collaboration session`);
  }

  private handleActivityUpdate(message: any) {
    const user = this.users.get(message.userId);
    if (user) {
      user.activity = message.activity;
      user.location = message.location;
      user.lastSeen = new Date();

      this.broadcastToAll({
        type: 'user_activity',
        userId: message.userId,
        activity: message.activity,
        location: message.location,
        users: this.getActiveUsers()
      });
    }
  }

  private handleHeartbeat(message: any) {
    const user = this.users.get(message.userId);
    if (user) {
      user.lastSeen = new Date();
    }
  }

  private handleLockRequest(message: any) {
    // Only allow lock if no current lock exists
    if (!this.shiftLock) {
      this.shiftLock = {
        userId: message.userId,
        operation: message.operation,
        lockedAt: new Date()
      };

      const userName = this.users.get(message.userId)?.name || 'Unknown';
      
      this.broadcastToAll({
        type: 'shift_locked',
        lockOwner: userName,
        operation: message.operation,
        lockedBy: message.userId
      });

      console.log(`Shift locked by ${userName} for ${message.operation}`);
    } else {
      // Send lock denied to requesting user
      this.sendToUser(message.userId, {
        type: 'lock_denied',
        currentLockOwner: this.users.get(this.shiftLock.userId)?.name || 'Unknown',
        currentOperation: this.shiftLock.operation
      });
    }
  }

  private handleLockRelease(message: any) {
    if (this.shiftLock && this.shiftLock.userId === message.userId) {
      this.shiftLock = null;
      this.broadcastShiftUnlocked();
      
      const userName = this.users.get(message.userId)?.name || 'Unknown';
      console.log(`Shift lock released by ${userName}`);
    }
  }

  private handleUserLeave(message: any) {
    this.users.delete(message.userId);
    this.broadcastUserLeft(message.userId);
    
    // Release lock if this user owned it
    if (this.shiftLock && this.shiftLock.userId === message.userId) {
      this.shiftLock = null;
      this.broadcastShiftUnlocked();
    }
  }

  private broadcastUserLeft(userId: string) {
    this.broadcastToAll({
      type: 'user_left',
      userId,
      users: this.getActiveUsers()
    });
  }

  private broadcastShiftUnlocked() {
    this.broadcastToAll({
      type: 'shift_unlocked'
    });
  }

  private cleanupInactiveUsers() {
    const now = new Date();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [userId, user] of Array.from(this.users.entries())) {
      const timeSinceLastSeen = now.getTime() - user.lastSeen.getTime();
      
      if (timeSinceLastSeen > inactiveThreshold) {
        this.users.delete(userId);
        this.broadcastUserLeft(userId);
        
        // Release lock if this user owned it
        if (this.shiftLock && this.shiftLock.userId === userId) {
          this.shiftLock = null;
          this.broadcastShiftUnlocked();
        }
        
        console.log(`Removed inactive user: ${user.name}`);
      }
    }
  }

  private getActiveUsers() {
    return Array.from(this.users.values()).map(user => this.getUserInfo(user));
  }

  private getUserInfo(user: CollaborationUser) {
    return {
      id: user.id,
      name: user.name,
      color: user.color,
      activity: user.activity,
      location: user.location,
      lastSeen: user.lastSeen
    };
  }

  private sendToUser(userId: string, message: any) {
    const user = this.users.get(userId);
    if (user && user.ws.readyState === WebSocket.OPEN) {
      user.ws.send(JSON.stringify(message));
    }
  }

  private broadcastToAll(message: any) {
    for (const user of Array.from(this.users.values())) {
      if (user.ws.readyState === WebSocket.OPEN) {
        user.ws.send(JSON.stringify(message));
      }
    }
  }

  private broadcastToOthers(excludeUserId: string, message: any) {
    for (const [userId, user] of Array.from(this.users.entries())) {
      if (userId !== excludeUserId && user.ws.readyState === WebSocket.OPEN) {
        user.ws.send(JSON.stringify(message));
      }
    }
  }

  // Public methods for external use
  getActiveUserCount(): number {
    return this.users.size;
  }

  isShiftLocked(): boolean {
    return this.shiftLock !== null;
  }

  getShiftLockInfo() {
    if (!this.shiftLock) return null;
    
    return {
      userId: this.shiftLock.userId,
      userName: this.users.get(this.shiftLock.userId)?.name || 'Unknown',
      operation: this.shiftLock.operation,
      lockedAt: this.shiftLock.lockedAt
    };
  }
}

export const collaborationManager = new CollaborationManager();
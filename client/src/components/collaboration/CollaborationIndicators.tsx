import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, Eye, Lock, Clock, AlertTriangle, 
  ChevronDown, ChevronUp, Activity 
} from 'lucide-react';
import { CollaborationUser } from '@/hooks/useCollaborationIndicators';

type ActivityType = 'VIEWING_SHIFT' | 'COUNTING_DRAWER' | 'PROCESSING_SALE' | 'CLOSING_SHIFT' | 'TAKING_BREAK' | 'CASH_DROP' | 'FLOAT_ADJUSTMENT' | 'SWITCH_CASHIER';

interface CollaborationIndicatorsProps {
  activeUsers: CollaborationUser[];
  shiftLocked: boolean;
  lockOwner?: string;
  currentActivity: string;
  onActivityUpdate: (activity: ActivityType, location?: string) => void;
}

export function CollaborationIndicators({ 
  activeUsers, 
  shiftLocked, 
  lockOwner, 
  currentActivity,
  onActivityUpdate 
}: CollaborationIndicatorsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  if (activeUsers.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-sm">
                {activeUsers.length} user{activeUsers.length !== 1 ? 's' : ''} active
              </span>
            </div>
            
            {shiftLocked && (
              <Badge variant="destructive" className="flex items-center space-x-1">
                <Lock className="h-3 w-3" />
                <span>Shift Locked</span>
              </Badge>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-3">
            {/* Active Users List */}
            <div className="flex flex-wrap gap-2">
              {activeUsers.map((user) => (
                <TooltipProvider key={user.id}>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center space-x-2 bg-gray-50 rounded-full px-3 py-1 border">
                        <div className="relative">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback 
                              className="text-xs text-white"
                              style={{ backgroundColor: user.color }}
                            >
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          {/* Activity pulse indicator */}
                          <div 
                            className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white animate-pulse"
                            style={{ backgroundColor: user.color }}
                          />
                        </div>
                        <span className="text-xs font-medium">{user.name}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.activity}</p>
                        <p className="text-xs text-gray-500">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {getTimeAgo(user.lastSeen)}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>

            {/* Current Activities */}
            <div className="border-t pt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Activity className="h-4 w-4 mr-1" />
                Current Activities
              </h4>
              <div className="space-y-1">
                {activeUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: user.color }}
                      />
                      <span className="text-gray-700">{user.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {user.activity}
                      </Badge>
                      <span className="text-xs text-gray-500">{user.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shift Lock Warning */}
            {shiftLocked && lockOwner && (
              <div className="border-t pt-3">
                <div className="flex items-center space-x-2 text-amber-700 bg-amber-50 p-2 rounded">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">
                    <strong>{lockOwner}</strong> is performing a critical operation. 
                    Shift modifications are temporarily locked.
                  </span>
                </div>
              </div>
            )}

            {/* Quick Activity Status */}
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Your current activity:</span>
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{currentActivity || 'Viewing shift details'}</span>
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
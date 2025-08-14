import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Settings,
  X
} from 'lucide-react';
import { AIClient, type AIHealthStatus } from '@/lib/aiClient';

export function AIHealthBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  // Query AI health status
  const { data: healthStatus, error, isLoading } = useQuery({
    queryKey: ['ai-health'],
    queryFn: () => AIClient.getHealthStatus(),
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 2,
    staleTime: 25000 // Consider data stale after 25 seconds
  });

  // Check if banner should be shown
  useEffect(() => {
    const dismissed = localStorage.getItem('ai-health-banner-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const oneHourAgo = Date.now() - (60 * 60 * 1000); // 1 hour
      
      if (dismissedTime > oneHourAgo) {
        setIsDismissed(true);
        setIsVisible(false);
      }
    }
  }, []);

  // Don't show banner if loading, dismissed, or AI is healthy
  if (isLoading || isDismissed || !isVisible) {
    return null;
  }

  // Don't show if AI is healthy (unless there's an error)
  if (healthStatus?.status === 'healthy' && !error) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem('ai-health-banner-dismissed', Date.now().toString());
    setIsDismissed(true);
    setIsVisible(false);
  };

  const getStatusDetails = () => {
    if (error) {
      return {
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
        title: 'AI Assistant Unavailable',
        message: 'Unable to connect to AI services. Some features may be limited.',
        badge: 'Down'
      };
    }

    if (!healthStatus) {
      return {
        icon: Clock,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800',
        title: 'AI Assistant Loading',
        message: 'Checking AI assistant status...',
        badge: 'Checking'
      };
    }

    switch (healthStatus.status) {
      case 'degraded':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
          title: 'AI Assistant Degraded',
          message: `Response time: ${healthStatus.responseTime ? AIClient.formatResponseTime(healthStatus.responseTime) : 'Unknown'}. Some delays expected.`,
          badge: 'Degraded'
        };
      case 'down':
        return {
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
          title: 'AI Assistant Down',
          message: 'AI services are currently unavailable. Please try again later.',
          badge: 'Down'
        };
      default:
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
          title: 'AI Assistant Healthy',
          message: `Response time: ${healthStatus.responseTime ? AIClient.formatResponseTime(healthStatus.responseTime) : 'Unknown'}`,
          badge: 'Healthy'
        };
    }
  };

  const statusDetails = getStatusDetails();
  const StatusIcon = statusDetails.icon;

  return (
    <Alert className={`mb-4 ${statusDetails.bgColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <StatusIcon className={`h-4 w-4 ${statusDetails.color}`} />
          <div className="flex items-center space-x-2">
            <Brain className="h-4 w-4 text-blue-600" />
            <span className="font-medium">{statusDetails.title}</span>
            <Badge 
              variant="outline" 
              className={`${statusDetails.color} border-current`}
            >
              {statusDetails.badge}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <AlertDescription className="text-sm text-muted-foreground m-0">
            {statusDetails.message}
          </AlertDescription>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => window.location.href = '/ai-monitor'}
            >
              <Settings className="h-3 w-3 mr-1" />
              Monitor
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleDismiss}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
      
      {healthStatus && (
        <div className="mt-2 flex items-center space-x-4 text-xs text-muted-foreground">
          <span>Model: {healthStatus.modelInfo.model}</span>
          <span>Features: {Object.values(healthStatus.features).filter(Boolean).length}/4 active</span>
          {healthStatus.rateLimits && (
            <span>Limits: {healthStatus.rateLimits.requestsPerMinute}/min</span>
          )}
        </div>
      )}
    </Alert>
  );
}
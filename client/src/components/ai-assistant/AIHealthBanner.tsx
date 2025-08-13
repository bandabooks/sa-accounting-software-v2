import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Activity,
  Settings,
  RefreshCw,
  TrendingUp,
  Clock
} from 'lucide-react';

interface AIHealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  message: string;
  timestamp: string;
  features: {
    basicChat: boolean;
    imageAnalysis: boolean;
    documentAnalysis: boolean;
    codeGeneration: boolean;
  };
  modelInfo: {
    model: string;
    maxTokens: number;
    contextWindow: number;
  };
  rateLimits: {
    requestsPerMinute: number;
    tokensPerMinute: number;
    remainingRequests?: number;
    remainingTokens?: number;
  };
}

interface AIMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  errorRate: number;
  uptime: number;
  features: string[];
  lastError?: {
    message: string;
    timestamp: string;
  };
}

export function AIHealthBanner() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Fetch AI health status
  const { data: healthStatus, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ['/api/ai/health'],
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000,
  });

  // Fetch AI metrics
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery<AIMetrics>({
    queryKey: ['/api/ai/metrics'],
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000,
  });

  const handleRefresh = () => {
    refetchHealth();
    refetchMetrics();
    setLastRefresh(Date.now());
  };

  // Don't render if AI is healthy and banner is collapsed
  if (!healthStatus && !healthLoading) return null;
  
  const health = healthStatus as AIHealthStatus;
  const isHealthy = health?.status === 'healthy';
  const isDegraded = health?.status === 'degraded';
  const isDown = health?.status === 'down';

  // Only show banner if there are issues or user wants to see details
  if (isHealthy && !isExpanded) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-950 dark:border-green-800"
              >
                <Brain className="h-4 w-4 text-green-600 dark:text-green-400" />
                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400 ml-1" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>AI Assistant is healthy</p>
              <p className="text-xs text-muted-foreground">
                Response time: {health?.responseTime.toFixed(0)}ms
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  const getStatusIcon = () => {
    if (healthLoading) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (isHealthy) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (isDegraded) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusColor = () => {
    if (isHealthy) return 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
    if (isDegraded) return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800';
    return 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
  };

  const getSuccessRate = () => {
    if (!metrics || metrics.totalRequests === 0) return 100;
    return ((metrics.successfulRequests / metrics.totalRequests) * 100);
  };

  return (
    <Alert className={`m-4 ${getStatusColor()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium">AI Assistant Status</span>
              <Badge variant={isHealthy ? 'default' : isDegraded ? 'secondary' : 'destructive'}>
                {health?.status || 'Unknown'}
              </Badge>
              {health?.responseTime && (
                <Badge variant="outline" className="text-xs">
                  {health.responseTime.toFixed(0)}ms
                </Badge>
              )}
            </div>
            
            <AlertDescription className="mt-1">
              {health?.message || 'Checking AI assistant status...'}
              {metrics?.lastError && (
                <div className="text-xs text-red-600 mt-1">
                  Last error: {metrics.lastError.message}
                </div>
              )}
            </AlertDescription>

            {isExpanded && health && (
              <div className="mt-3 space-y-3">
                {/* Feature Status */}
                <div>
                  <div className="text-sm font-medium mb-2">Available Features</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(health.features).map(([feature, available]) => (
                      <Badge 
                        key={feature} 
                        variant={available ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        {available ? ' ✓' : ' ✗'}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Performance Metrics */}
                {metrics && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Performance</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <div className="text-muted-foreground">Success Rate</div>
                        <div className="flex items-center space-x-2">
                          <Progress value={getSuccessRate()} className="h-2 flex-1" />
                          <span className="font-medium">{getSuccessRate().toFixed(1)}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Avg Response</div>
                        <div className="font-medium">{metrics.averageResponseTime.toFixed(0)}ms</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Requests</div>
                        <div className="font-medium">{metrics.totalRequests.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Uptime</div>
                        <div className="font-medium">
                          {metrics.uptime > 0 ? `${(metrics.uptime / 3600).toFixed(1)}h` : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Model Information */}
                <div>
                  <div className="text-sm font-medium mb-1">Model Info</div>
                  <div className="text-xs text-muted-foreground">
                    {health.modelInfo.model} • {health.modelInfo.maxTokens.toLocaleString()} max tokens
                  </div>
                </div>

                {/* Rate Limits */}
                {health.rateLimits && (
                  <div>
                    <div className="text-sm font-medium mb-1">Rate Limits</div>
                    <div className="text-xs text-muted-foreground">
                      {health.rateLimits.requestsPerMinute.toLocaleString()} req/min • {' '}
                      {health.rateLimits.tokensPerMinute.toLocaleString()} tokens/min
                      {health.rateLimits.remainingRequests && (
                        <span className="ml-2">
                          ({health.rateLimits.remainingRequests} remaining)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh status</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Less' : 'More'}
          </Button>

          {!isHealthy && (
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/settings'}>
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {health?.timestamp && (
        <div className="text-xs text-muted-foreground mt-2 flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>Last checked: {new Date(health.timestamp).toLocaleTimeString()}</span>
        </div>
      )}
    </Alert>
  );
}
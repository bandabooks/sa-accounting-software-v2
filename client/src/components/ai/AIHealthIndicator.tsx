import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, CheckCircle, Loader2, XCircle } from 'lucide-react';

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
}

export function AIHealthIndicator() {
  const { data: health, isLoading, error } = useQuery<AIHealthStatus>({
    queryKey: ['/api/ai/health'],
    refetchInterval: 60000, // Check every minute
    retry: false,
  });

  if (isLoading) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              AI Checking
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Checking AI assistant status...</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (error || !health) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="destructive" className="gap-1">
              <XCircle className="h-3 w-3" />
              AI Offline
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold">AI Assistant Unavailable</p>
              <p className="text-xs">Check API configuration</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const getStatusIcon = () => {
    switch (health.status) {
      case 'healthy':
        return <CheckCircle className="h-3 w-3" />;
      case 'degraded':
        return <AlertCircle className="h-3 w-3" />;
      case 'down':
        return <XCircle className="h-3 w-3" />;
    }
  };

  const getStatusVariant = () => {
    switch (health.status) {
      case 'healthy':
        return 'default' as const;
      case 'degraded':
        return 'secondary' as const;
      case 'down':
        return 'destructive' as const;
    }
  };

  const getStatusText = () => {
    switch (health.status) {
      case 'healthy':
        return 'AI Online';
      case 'degraded':
        return 'AI Degraded';
      case 'down':
        return 'AI Offline';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={getStatusVariant()} className="gap-1">
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-2 max-w-xs">
            <div className="font-semibold">{health.message}</div>
            <div className="text-xs space-y-1">
              <p>Model: {health.modelInfo.model}</p>
              <p>Response: {health.responseTime}ms</p>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(health.features).map(([feature, enabled]) => (
                  <Badge 
                    key={feature} 
                    variant={enabled ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
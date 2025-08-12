import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, XCircle, Sparkles, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

interface AIHealthStatus {
  status: 'healthy' | 'degraded' | 'error';
  message: string;
  anthropicConnected: boolean;
  apiKeyConfigured: boolean;
  remainingQuota: number | null;
  lastChecked: string;
  error?: string;
}

export function AIHealthBanner() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: healthStatus, isLoading, error, refetch } = useQuery<AIHealthStatus>({
    queryKey: ['/api/ai/health'],
    refetchInterval: 60000, // Check every minute
    retry: 1,
    enabled: isAuthenticated, // Only run query if user is authenticated
  });

  // Auto-expand if there's an error
  useEffect(() => {
    if (healthStatus?.status === 'error' || healthStatus?.status === 'degraded') {
      setIsExpanded(true);
      setIsDismissed(false);
    }
  }, [healthStatus?.status]);

  // Don't show if loading, not authenticated, or dismissed
  if (isLoading || authLoading || !isAuthenticated || isDismissed) return null;

  // Don't show banner if everything is healthy
  if (healthStatus?.status === 'healthy' && !isExpanded) return null;

  const getStatusIcon = () => {
    switch (healthStatus?.status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  const getAlertVariant = () => {
    switch (healthStatus?.status) {
      case 'healthy':
        return 'default';
      case 'degraded':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const handleRetry = async () => {
    await refetch();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Alert variant={getAlertVariant()} className="shadow-lg">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 mt-0.5 text-primary" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <h4 className="text-sm font-semibold">AI Assistant Status</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDismissed(true)}
                className="h-6 px-2"
              >
                ×
              </Button>
            </div>
            
            <AlertDescription className="text-sm">
              {healthStatus?.message || 'Checking AI assistant connection...'}
            </AlertDescription>

            {isExpanded && healthStatus && (
              <div className="mt-3 pt-3 border-t space-y-2">
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Anthropic API:</span>
                    <span className={healthStatus.anthropicConnected ? 'text-green-600' : 'text-red-600'}>
                      {healthStatus.anthropicConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">API Key:</span>
                    <span className={healthStatus.apiKeyConfigured ? 'text-green-600' : 'text-red-600'}>
                      {healthStatus.apiKeyConfigured ? 'Configured' : 'Missing'}
                    </span>
                  </div>

                  {healthStatus.remainingQuota !== null && healthStatus.remainingQuota !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Remaining Quota:</span>
                      <span>{healthStatus.remainingQuota.toLocaleString()} requests</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Checked:</span>
                    <span>{new Date(healthStatus.lastChecked).toLocaleTimeString()}</span>
                  </div>
                </div>

                {healthStatus.error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription className="text-xs">
                      {healthStatus.error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRetry}
                    className="text-xs"
                  >
                    <Loader2 className="h-3 w-3 mr-1" />
                    Retry Check
                  </Button>
                  
                  {!healthStatus.apiKeyConfigured && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => window.location.href = '/enterprise-settings?tab=ai'}
                      className="text-xs"
                    >
                      Configure API Key
                    </Button>
                  )}
                </div>
              </div>
            )}

            {!isExpanded && healthStatus?.status !== 'healthy' && (
              <Button
                size="sm"
                variant="link"
                onClick={() => setIsExpanded(true)}
                className="mt-2 p-0 h-auto text-xs"
              >
                Show Details →
              </Button>
            )}
          </div>
        </div>
      </Alert>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Activity, 
  Play,
  Square,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  FileText,
  Image,
  Code,
  MessageSquare
} from 'lucide-react';
import { AIClient, type AIMetrics, type SystemStatus, type FunctionTestResult } from '@/lib/aiClient';

export function AISystemMonitor() {
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, FunctionTestResult>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query system status
  const { data: systemStatus, isLoading: statusLoading, error: statusError } = useQuery({
    queryKey: ['ai-system-status'],
    queryFn: () => AIClient.getSystemStatus(),
    refetchInterval: 60000, // Refetch every minute
    retry: 2
  });

  // Query metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['ai-metrics'],
    queryFn: () => AIClient.getMetrics(),
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 2
  });

  // Mutations for monitoring controls
  const startMonitoringMutation = useMutation({
    mutationFn: (intervalMinutes: number) => AIClient.startMonitoring(intervalMinutes),
    onSuccess: () => {
      toast({
        title: 'Monitoring Started',
        description: 'AI health monitoring is now active.'
      });
      queryClient.invalidateQueries({ queryKey: ['ai-system-status'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Start Monitoring',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  });

  const stopMonitoringMutation = useMutation({
    mutationFn: () => AIClient.stopMonitoring(),
    onSuccess: () => {
      toast({
        title: 'Monitoring Stopped',
        description: 'AI health monitoring has been disabled.'
      });
      queryClient.invalidateQueries({ queryKey: ['ai-system-status'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Stop Monitoring',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  });

  const resetMetricsMutation = useMutation({
    mutationFn: () => AIClient.resetMetrics(),
    onSuccess: () => {
      toast({
        title: 'Metrics Reset',
        description: 'AI performance metrics have been reset.'
      });
      queryClient.invalidateQueries({ queryKey: ['ai-metrics'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Reset Metrics',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  });

  // Test AI functions
  const testFunction = async (functionName: string, testPayload: any) => {
    setActiveTest(functionName);
    
    try {
      const result = await AIClient.testFunction(functionName, testPayload);
      setTestResults(prev => ({ ...prev, [functionName]: result }));
      
      toast({
        title: result.success ? 'Test Passed' : 'Test Failed',
        description: `${functionName} test completed in ${AIClient.formatResponseTime(result.responseTime)}`,
        variant: result.success ? 'default' : 'destructive'
      });
    } catch (error) {
      const errorResult: FunctionTestResult = {
        functionName,
        success: false,
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      setTestResults(prev => ({ ...prev, [functionName]: errorResult }));
      
      toast({
        title: 'Test Error',
        description: `Failed to test ${functionName}`,
        variant: 'destructive'
      });
    } finally {
      setActiveTest(null);
    }
  };

  // Test configurations
  const testConfigs = [
    {
      name: 'basicChat',
      icon: MessageSquare,
      label: 'Basic Chat',
      description: 'Test general AI conversation',
      payload: { message: 'Hello, this is a test message. Please respond briefly.' }
    },
    {
      name: 'documentAnalysis',
      icon: FileText,
      label: 'Document Analysis',
      description: 'Test document processing capabilities',
      payload: { 
        text: 'Invoice #12345\nDate: 2025-08-13\nAmount: R1,500.00\nVAT: R195.65',
        type: 'invoice'
      }
    },
    {
      name: 'imageAnalysis',
      icon: Image,
      label: 'Image Analysis',
      description: 'Test image processing (placeholder)',
      payload: { imageType: 'receipt', description: 'Test image analysis capability' }
    },
    {
      name: 'codeGeneration',
      icon: Code,
      label: 'Code Generation',
      description: 'Test code generation capabilities',
      payload: { 
        request: 'Generate a simple TypeScript function that calculates VAT',
        language: 'typescript'
      }
    }
  ];

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-3">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          <span>Loading AI system status...</span>
        </div>
      </div>
    );
  }

  if (statusError) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load AI system status. Please check your connection and try again.
        </AlertDescription>
      </Alert>
    );
  }

  const successRate = metrics ? AIClient.calculateSuccessRate(metrics) : 0;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="testing">Function Testing</TabsTrigger>
          <TabsTrigger value="controls">Monitoring Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Configuration</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemStatus?.configured ? 'Ready' : 'Pending'}
                </div>
                <Badge 
                  variant={systemStatus?.configured ? 'default' : 'secondary'}
                  className="mt-1"
                >
                  {systemStatus?.configured ? 'Configured' : 'Setup Required'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Status</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemStatus?.healthy ? 'Healthy' : 'Issues'}
                </div>
                <Badge 
                  variant={systemStatus?.healthy ? 'default' : 'destructive'}
                  className="mt-1"
                >
                  {systemStatus?.healthy ? 'Operational' : 'Degraded'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
                <Progress value={successRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monitoring</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemStatus?.monitoring ? 'Active' : 'Inactive'}
                </div>
                <Badge 
                  variant={systemStatus?.monitoring ? 'default' : 'secondary'}
                  className="mt-1"
                >
                  {systemStatus?.monitoring ? 'Running' : 'Stopped'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Metrics Details */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>
                    AI assistant performance over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Requests</span>
                    <span className="font-medium">{metrics.totalRequests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Successful</span>
                    <span className="font-medium text-green-600">{metrics.successfulRequests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed</span>
                    <span className="font-medium text-red-600">{metrics.failedRequests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Response Time</span>
                    <span className="font-medium">
                      {AIClient.formatResponseTime(metrics.averageResponseTime)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uptime</span>
                    <span className="font-medium">
                      {AIClient.formatUptime(metrics.uptime)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feature Status</CardTitle>
                  <CardDescription>
                    Current status of AI capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {systemStatus?.features && Object.entries(systemStatus.features).map(([feature, available]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span>{AIClient.formatFeatureName(feature)}</span>
                      <Badge 
                        variant={available ? 'default' : 'secondary'}
                        className={available ? 'bg-green-100 text-green-800' : ''}
                      >
                        {available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Function Testing</CardTitle>
              <CardDescription>
                Test individual AI capabilities to verify functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testConfigs.map((config) => {
                  const result = testResults[config.name];
                  const isActive = activeTest === config.name;
                  const Icon = config.icon;

                  return (
                    <Card key={config.name} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{config.label}</span>
                        </div>
                        {result && (
                          <Badge 
                            variant={result.success ? 'default' : 'destructive'}
                            className={result.success ? 'bg-green-100 text-green-800' : ''}
                          >
                            {result.success ? 'Pass' : 'Fail'}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {config.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Button
                          size="sm"
                          onClick={() => testFunction(config.name, config.payload)}
                          disabled={isActive}
                          className="flex items-center space-x-1"
                        >
                          {isActive ? (
                            <>
                              <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full" />
                              <span>Testing...</span>
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3" />
                              <span>Test</span>
                            </>
                          )}
                        </Button>
                        
                        {result && (
                          <span className="text-xs text-muted-foreground">
                            {AIClient.formatResponseTime(result.responseTime)}
                          </span>
                        )}
                      </div>
                      
                      {result?.error && (
                        <Alert className="mt-3 bg-red-50 border-red-200">
                          <AlertTriangle className="h-3 w-3" />
                          <AlertDescription className="text-xs">
                            {result.error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="controls" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monitoring Controls</CardTitle>
                <CardDescription>
                  Start or stop automated health monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Health Monitoring</p>
                    <p className="text-sm text-muted-foreground">
                      {systemStatus?.monitoring ? 'Currently running' : 'Currently stopped'}
                    </p>
                  </div>
                  <Badge variant={systemStatus?.monitoring ? 'default' : 'secondary'}>
                    {systemStatus?.monitoring ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => startMonitoringMutation.mutate(5)}
                    disabled={systemStatus?.monitoring || startMonitoringMutation.isPending}
                    className="flex items-center space-x-1"
                  >
                    <Play className="h-3 w-3" />
                    <span>Start</span>
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => stopMonitoringMutation.mutate()}
                    disabled={!systemStatus?.monitoring || stopMonitoringMutation.isPending}
                    className="flex items-center space-x-1"
                  >
                    <Square className="h-3 w-3" />
                    <span>Stop</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metrics Management</CardTitle>
                <CardDescription>
                  Reset performance metrics and counters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Performance Data</p>
                    <p className="text-sm text-muted-foreground">
                      {metrics?.totalRequests || 0} total requests recorded
                    </p>
                  </div>
                  <Badge variant="outline">
                    {AIClient.formatUptime(metrics?.uptime || 0)} uptime
                  </Badge>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => resetMetricsMutation.mutate()}
                  disabled={resetMetricsMutation.isPending}
                  className="flex items-center space-x-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset Metrics</span>
                </Button>
              </CardContent>
            </Card>
          </div>

          {systemStatus?.lastCheck && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Last health check: {new Date(systemStatus.lastCheck).toLocaleString()}
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
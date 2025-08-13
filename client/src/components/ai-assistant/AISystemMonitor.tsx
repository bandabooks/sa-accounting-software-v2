import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Eye,
  Clock,
  Zap
} from 'lucide-react';

interface SystemStatus {
  configured: boolean;
  healthy: boolean;
  monitoring: boolean;
  lastCheck: string;
  features: {
    basicChat: boolean;
    imageAnalysis: boolean;
    documentAnalysis: boolean;
    codeGeneration: boolean;
  };
  metrics: {
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
  };
}

interface FunctionTest {
  functionName: string;
  displayName: string;
  description: string;
  testPayload: any;
}

const FUNCTION_TESTS: FunctionTest[] = [
  {
    functionName: 'transaction_matching',
    displayName: 'Transaction Matching',
    description: 'AI-powered transaction categorization and account matching',
    testPayload: {
      description: 'PURCHASE - OFFICE DEPOT',
      amount: 125.50,
      type: 'expense'
    }
  },
  {
    functionName: 'vat_guidance',
    displayName: 'VAT Guidance',
    description: 'South African VAT compliance and guidance',
    testPayload: {
      transactionType: 'consulting_service',
      amount: 1000,
      customerType: 'business'
    }
  },
  {
    functionName: 'invoice_analysis',
    displayName: 'Invoice Analysis',
    description: 'Invoice risk assessment and payment predictions',
    testPayload: {
      invoiceAmount: 2500,
      daysOverdue: 15,
      customerHistory: 'good'
    }
  },
  {
    functionName: 'financial_insights',
    displayName: 'Financial Insights',
    description: 'Business intelligence and financial recommendations',
    testPayload: {
      revenue: 50000,
      expenses: 35000,
      period: 'Q1'
    }
  }
];

export function AISystemMonitor() {
  const [testingFunction, setTestingFunction] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch system status
  const { data: systemStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery<SystemStatus>({
    queryKey: ['/api/ai/system-status'],
    refetchInterval: 30000,
  });

  // Test AI function
  const testFunction = useMutation({
    mutationFn: async ({ functionName, testPayload }: { functionName: string; testPayload: any }) => {
      const response = await fetch('/api/ai/test-function', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ functionName, testPayload }),
      });
      
      if (!response.ok) {
        throw new Error(`Test failed: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/system-status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai/metrics'] });
    }
  });

  // Toggle monitoring
  const toggleMonitoring = useMutation({
    mutationFn: async (action: 'start' | 'stop') => {
      const response = await fetch(`/api/ai/monitoring/${action}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} monitoring`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      refetchStatus();
    }
  });

  const handleTestFunction = async (functionTest: FunctionTest) => {
    setTestingFunction(functionTest.functionName);
    try {
      await testFunction.mutateAsync({
        functionName: functionTest.functionName,
        testPayload: functionTest.testPayload
      });
    } finally {
      setTestingFunction(null);
    }
  };

  const getStatusIcon = (status?: boolean) => {
    if (status === undefined) return <RefreshCw className="h-4 w-4 animate-spin" />;
    return status ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getSuccessRate = () => {
    if (!systemStatus?.metrics || systemStatus.metrics.totalRequests === 0) return 100;
    return ((systemStatus.metrics.successfulRequests / systemStatus.metrics.totalRequests) * 100);
  };

  if (statusLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI System Monitor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading AI system status...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>AI System Monitor</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchStatus()}
                disabled={statusLoading}
              >
                <RefreshCw className={`h-4 w-4 ${statusLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant={systemStatus?.monitoring ? 'destructive' : 'default'}
                size="sm"
                onClick={() => toggleMonitoring.mutate(systemStatus?.monitoring ? 'stop' : 'start')}
                disabled={toggleMonitoring.isPending}
              >
                {systemStatus?.monitoring ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Stop Monitoring
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Start Monitoring
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Monitor and test AI assistant functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Configuration</p>
                    <p className="font-medium">
                      {systemStatus?.configured ? 'Configured' : 'Not Configured'}
                    </p>
                  </div>
                  {getStatusIcon(systemStatus?.configured)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Health Status</p>
                    <p className="font-medium">
                      {systemStatus?.healthy ? 'Healthy' : 'Unhealthy'}
                    </p>
                  </div>
                  {getStatusIcon(systemStatus?.healthy)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Monitoring</p>
                    <p className="font-medium">
                      {systemStatus?.monitoring ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  {getStatusIcon(systemStatus?.monitoring)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="font-medium">{getSuccessRate().toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="features" className="space-y-4">
        <TabsList>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="testing">Function Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Feature Availability</CardTitle>
              <CardDescription>
                Current status of AI features and capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {systemStatus?.features && Object.entries(systemStatus.features).map(([feature, available]) => (
                  <div key={feature} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {feature.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getFeatureDescription(feature)}
                      </p>
                    </div>
                    <Badge variant={available ? 'default' : 'secondary'}>
                      {available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Real-time performance and usage statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {systemStatus?.metrics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Activity className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">Total Requests</p>
                            <p className="text-2xl font-bold">{systemStatus.metrics.totalRequests.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">Avg Response Time</p>
                            <p className="text-2xl font-bold">{systemStatus.metrics.averageResponseTime.toFixed(0)}ms</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Zap className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">Uptime</p>
                            <p className="text-2xl font-bold">
                              {systemStatus.metrics.uptime > 0 ? 
                                `${(systemStatus.metrics.uptime / 3600).toFixed(1)}h` : 
                                'N/A'
                              }
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">Success Rate</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Successful Requests</span>
                        <span>{systemStatus.metrics.successfulRequests.toLocaleString()}</span>
                      </div>
                      <Progress value={getSuccessRate()} className="h-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Error Rate: {systemStatus.metrics.errorRate.toFixed(2)}%</span>
                        <span>{getSuccessRate().toFixed(1)}% Success</span>
                      </div>
                    </div>
                  </div>

                  {systemStatus.metrics.lastError && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Last Error:</strong> {systemStatus.metrics.lastError.message}
                        <br />
                        <span className="text-sm text-muted-foreground">
                          {new Date(systemStatus.metrics.lastError.timestamp).toLocaleString()}
                        </span>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing">
          <Card>
            <CardHeader>
              <CardTitle>Function Testing</CardTitle>
              <CardDescription>
                Test individual AI functions to verify they're working correctly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FUNCTION_TESTS.map((functionTest) => (
                  <Card key={functionTest.functionName}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{functionTest.displayName}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {functionTest.description}
                          </p>
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">Test Payload:</p>
                            <code className="text-xs bg-muted p-1 rounded">
                              {JSON.stringify(functionTest.testPayload)}
                            </code>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleTestFunction(functionTest)}
                          disabled={testingFunction === functionTest.functionName || testFunction.isPending}
                        >
                          {testingFunction === functionTest.functionName ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            'Test'
                          )}
                        </Button>
                      </div>
                      
                      {testFunction.data && testFunction.data.functionName === functionTest.functionName && (
                        <div className="mt-3 p-2 bg-muted rounded text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className={testFunction.data.success ? 'text-green-600' : 'text-red-600'}>
                              {testFunction.data.success ? '✓ Success' : '✗ Failed'}
                            </span>
                            <span>{testFunction.data.responseTime}ms</span>
                          </div>
                          {testFunction.data.error && (
                            <p className="text-red-600">{testFunction.data.error}</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getFeatureDescription(feature: string): string {
  const descriptions: Record<string, string> = {
    basicChat: 'General AI conversation and assistance',
    imageAnalysis: 'Image content analysis and description',
    documentAnalysis: 'Document parsing and information extraction',
    codeGeneration: 'Code generation and programming assistance'
  };
  
  return descriptions[feature] || 'AI feature functionality';
}
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Bell,
  Settings,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Zap,
  Brain,
  Target,
  DollarSign,
  FileText,
  BarChart3,
  Lightbulb,
  Users,
  Loader2,
  Play,
  Pause,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatDistanceToNow, format } from 'date-fns';

interface MonitoringAlert {
  id: number;
  companyId: number;
  bankAccountId?: number;
  transactionId?: number;
  ruleId?: number;
  alertId: string;
  title: string;
  description?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  alertType: string;
  triggeredBy?: string;
  acknowledged: boolean;
  acknowledgedBy?: number;
  acknowledgedAt?: string;
  resolved: boolean;
  resolvedBy?: number;
  resolvedAt?: string;
  notes?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface MonitoringRule {
  id: number;
  companyId: number;
  ruleId: string;
  name: string;
  description?: string;
  type: string;
  enabled: boolean;
  priority: number;
  conditions: Record<string, any>;
  actionConfig: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface SystemHealthMetric {
  id: number;
  companyId?: number;
  metricType: string;
  metricName: string;
  value: string;
  unit?: string;
  threshold?: string;
  status: string;
  tags: Record<string, any>;
  timestamp?: string;
  recordedAt?: string;
}

interface LiveMonitoringStatus {
  isActive: boolean;
  connectedAccounts: number;
  lastSyncTime: string | null;
  alertsToday: number;
  systemHealth: string;
}

export default function MonitoringDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isLiveMonitoring, setIsLiveMonitoring] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Monitoring dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['/api/monitoring/dashboard'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Live monitoring status
  const { data: liveStatus, isLoading: statusLoading } = useQuery<LiveMonitoringStatus>({
    queryKey: ['/api/monitoring/status'],
    refetchInterval: 15000 // Refresh every 15 seconds
  });

  // Active alerts
  const { data: activeAlerts = [], isLoading: alertsLoading } = useQuery<MonitoringAlert[]>({
    queryKey: ['/api/monitoring/alerts/active'],
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  // Unacknowledged alerts
  const { data: unacknowledgedAlerts = [], isLoading: unackLoading } = useQuery<MonitoringAlert[]>({
    queryKey: ['/api/monitoring/alerts/unacknowledged'],
    refetchInterval: 5000 // Refresh every 5 seconds for urgent alerts
  });

  // Monitoring rules
  const { data: rules = [], isLoading: rulesLoading } = useQuery<MonitoringRule[]>({
    queryKey: ['/api/monitoring/rules'],
    refetchInterval: 60000 // Refresh every minute
  });

  // System health metrics
  const { data: healthMetrics = [], isLoading: healthLoading } = useQuery<SystemHealthMetric[]>({
    queryKey: ['/api/monitoring/health'],
    refetchInterval: 20000 // Refresh every 20 seconds
  });

  // Start/Stop monitoring mutation
  const startMonitoringMutation = useMutation({
    mutationFn: (config?: any) => apiRequest('/api/monitoring/start', {
      method: 'POST',
      body: JSON.stringify({ config })
    }),
    onSuccess: () => {
      setIsLiveMonitoring(true);
      toast({
        title: "Monitoring Started",
        description: "Real-time transaction monitoring is now active",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/monitoring/status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Start Monitoring",
        description: error.message || "Could not start monitoring service",
        variant: "destructive"
      });
    }
  });

  // Acknowledge alert mutation
  const acknowledgeAlertMutation = useMutation({
    mutationFn: ({ alertId, notes }: { alertId: number, notes?: string }) => 
      apiRequest(`/api/monitoring/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        body: JSON.stringify({ notes })
      }),
    onSuccess: () => {
      toast({
        title: "Alert Acknowledged",
        description: "The alert has been acknowledged",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/monitoring/alerts'] });
    }
  });

  // Resolve alert mutation
  const resolveAlertMutation = useMutation({
    mutationFn: ({ alertId, notes }: { alertId: number, notes?: string }) => 
      apiRequest(`/api/monitoring/alerts/${alertId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ notes })
      }),
    onSuccess: () => {
      toast({
        title: "Alert Resolved",
        description: "The alert has been resolved",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/monitoring/alerts'] });
    }
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <Bell className="h-5 w-5 text-blue-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'error': return 'bg-red-50 text-red-700 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHealthStatus = (status: string) => {
    switch (status) {
      case 'critical': return { color: 'text-red-500', bg: 'bg-red-100', text: 'Critical' };
      case 'warning': return { color: 'text-yellow-500', bg: 'bg-yellow-100', text: 'Warning' };
      case 'healthy': 
      case 'normal': return { color: 'text-green-500', bg: 'bg-green-100', text: 'Healthy' };
      default: return { color: 'text-gray-500', bg: 'bg-gray-100', text: 'Unknown' };
    }
  };

  useEffect(() => {
    if (liveStatus?.isActive) {
      setIsLiveMonitoring(true);
    }
  }, [liveStatus?.isActive]);

  const isLoading = dashboardLoading || statusLoading || alertsLoading || rulesLoading || healthLoading;

  return (
    <div className="min-h-screen bg-gray-50" data-testid="monitoring-dashboard">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-3" data-testid="text-dashboard-title">Real-time Transaction Monitoring</h1>
                <p className="text-blue-100 text-lg font-medium">AI-powered monitoring for South African business banking</p>
              </div>
              <div className="hidden sm:flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm opacity-80">System Status</div>
                  <div className={`text-lg font-bold ${liveStatus?.systemHealth === 'healthy' ? 'text-green-200' : 
                    liveStatus?.systemHealth === 'warning' ? 'text-yellow-200' : 'text-red-200'}`} 
                    data-testid="text-system-status">
                    {liveStatus?.systemHealth === 'healthy' ? '🟢 Healthy' : 
                     liveStatus?.systemHealth === 'warning' ? '🟡 Warning' : '🔴 Critical'}
                  </div>
                </div>
                <Shield className="h-12 w-12 text-white opacity-80" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Live Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold" data-testid="text-connected-accounts">
                  {statusLoading ? '...' : liveStatus?.connectedAccounts || 0}
                </span>
                <Badge variant={liveStatus?.isActive ? "default" : "secondary"} data-testid="badge-monitoring-status">
                  {liveStatus?.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">Connected Accounts</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-red-600" data-testid="text-active-alerts">
                  {alertsLoading ? '...' : activeAlerts.length}
                </span>
                <Badge variant="destructive" data-testid="badge-critical-alerts">
                  {activeAlerts.filter(a => a.severity === 'critical').length} Critical
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">Require Attention</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Unacknowledged
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-yellow-600" data-testid="text-unacknowledged-alerts">
                  {unackLoading ? '...' : unacknowledgedAlerts.length}
                </span>
                <Badge variant="outline" data-testid="badge-unack-alerts">New</Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">Need Review</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Monitoring Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600" data-testid="text-active-rules">
                  {rulesLoading ? '...' : rules.filter(r => r.enabled).length}
                </span>
                <Badge variant="outline" data-testid="badge-total-rules">
                  {rules.length} Total
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">Active Rules</p>
            </CardContent>
          </Card>
        </div>

        {/* Monitoring Control */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Monitoring Control
            </CardTitle>
            <CardDescription>
              Start or stop real-time transaction monitoring with SA banking optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  Status: {isLiveMonitoring ? 
                    <span className="text-green-600" data-testid="text-monitoring-active">🟢 Active</span> : 
                    <span className="text-red-600" data-testid="text-monitoring-inactive">🔴 Inactive</span>
                  }
                </p>
                <p className="text-sm text-gray-600">
                  Last sync: {liveStatus?.lastSyncTime ? 
                    formatDistanceToNow(new Date(liveStatus.lastSyncTime)) + ' ago' : 
                    'Never'}
                </p>
              </div>
              <Button 
                onClick={() => startMonitoringMutation.mutate()}
                disabled={startMonitoringMutation.isPending || isLiveMonitoring}
                data-testid="button-start-monitoring"
              >
                {startMonitoringMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : isLiveMonitoring ? (
                  <Pause className="h-4 w-4 mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isLiveMonitoring ? 'Active' : 'Start Monitoring'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 bg-white shadow-sm border">
            <TabsTrigger value="overview" className="flex items-center gap-2" data-testid="tab-overview">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2" data-testid="tab-alerts">
              <AlertTriangle className="h-4 w-4" />
              Alerts ({activeAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2" data-testid="tab-rules">
              <Target className="h-4 w-4" />
              Rules ({rules.length})
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-2" data-testid="tab-health">
              <Activity className="h-4 w-4" />
              System Health
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-6">
              {/* Recent Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Recent Alerts
                  </CardTitle>
                  <CardDescription>Latest monitoring alerts and notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  {alertsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading alerts...</span>
                    </div>
                  ) : activeAlerts.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-gray-600">No active alerts</p>
                    </div>
                  ) : (
                    <div className="space-y-4" data-testid="alerts-list">
                      {activeAlerts.slice(0, 5).map((alert) => (
                        <div key={alert.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg" data-testid={`alert-item-${alert.id}`}>
                          {getSeverityIcon(alert.severity)}
                          <div className="flex-1">
                            <h4 className="font-medium" data-testid={`alert-title-${alert.id}`}>{alert.title}</h4>
                            <p className="text-sm text-gray-600" data-testid={`alert-description-${alert.id}`}>{alert.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={getSeverityColor(alert.severity)} data-testid={`alert-severity-${alert.id}`}>
                                {alert.severity}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(alert.createdAt))} ago
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!alert.acknowledged && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => acknowledgeAlertMutation.mutate({ alertId: alert.id })}
                                disabled={acknowledgeAlertMutation.isPending}
                                data-testid={`button-acknowledge-${alert.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            {!alert.resolved && (
                              <Button 
                                size="sm"
                                onClick={() => resolveAlertMutation.mutate({ alertId: alert.id })}
                                disabled={resolveAlertMutation.isPending}
                                data-testid={`button-resolve-${alert.id}`}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* System Health Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Health
                  </CardTitle>
                  <CardDescription>Real-time monitoring system performance</CardDescription>
                </CardHeader>
                <CardContent>
                  {healthLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading health metrics...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="health-metrics">
                      {healthMetrics.slice(0, 6).map((metric, index) => {
                        const health = getHealthStatus(metric.status);
                        return (
                          <div key={metric.id || index} className="p-4 bg-gray-50 rounded-lg" data-testid={`health-metric-${index}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium" data-testid={`metric-name-${index}`}>{metric.metricName}</span>
                              <Badge className={health.bg + ' ' + health.color} data-testid={`metric-status-${index}`}>
                                {health.text}
                              </Badge>
                            </div>
                            <div className="text-lg font-bold" data-testid={`metric-value-${index}`}>
                              {metric.value} {metric.unit}
                            </div>
                            <div className="text-xs text-gray-500">
                              {metric.timestamp ? formatDistanceToNow(new Date(metric.timestamp)) + ' ago' : 'Unknown'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>Alert Management</CardTitle>
                <CardDescription>Manage and respond to monitoring alerts</CardDescription>
              </CardHeader>
              <CardContent>
                {alertsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading alerts...</span>
                  </div>
                ) : activeAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">No active alerts</p>
                  </div>
                ) : (
                  <div className="space-y-4" data-testid="alerts-management">
                    {activeAlerts.map((alert) => (
                      <Card key={alert.id} className={`border-l-4 ${alert.severity === 'critical' ? 'border-l-red-500' : 
                        alert.severity === 'error' ? 'border-l-red-400' :
                        alert.severity === 'warning' ? 'border-l-yellow-500' : 'border-l-blue-500'}`}
                        data-testid={`alert-card-${alert.id}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              {getSeverityIcon(alert.severity)}
                              <div>
                                <CardTitle className="text-lg" data-testid={`alert-card-title-${alert.id}`}>{alert.title}</CardTitle>
                                <CardDescription data-testid={`alert-card-description-${alert.id}`}>
                                  {alert.description}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getSeverityColor(alert.severity)} data-testid={`alert-card-severity-${alert.id}`}>
                                {alert.severity}
                              </Badge>
                              {alert.acknowledged && (
                                <Badge variant="outline" data-testid={`alert-card-acknowledged-${alert.id}`}>
                                  Acknowledged
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatDistanceToNow(new Date(alert.createdAt))} ago</span>
                              </div>
                              {alert.alertType && (
                                <div className="flex items-center gap-1">
                                  <FileText className="h-4 w-4" />
                                  <span className="capitalize">{alert.alertType}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              {!alert.acknowledged && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => acknowledgeAlertMutation.mutate({ alertId: alert.id })}
                                  disabled={acknowledgeAlertMutation.isPending}
                                  data-testid={`button-acknowledge-card-${alert.id}`}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Acknowledge
                                </Button>
                              )}
                              {!alert.resolved && (
                                <Button 
                                  size="sm"
                                  onClick={() => resolveAlertMutation.mutate({ alertId: alert.id })}
                                  disabled={resolveAlertMutation.isPending}
                                  data-testid={`button-resolve-card-${alert.id}`}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Resolve
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules">
            <Card>
              <CardHeader>
                <CardTitle>Monitoring Rules</CardTitle>
                <CardDescription>Configure automated monitoring rules and thresholds</CardDescription>
              </CardHeader>
              <CardContent>
                {rulesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading rules...</span>
                  </div>
                ) : rules.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No monitoring rules configured</p>
                  </div>
                ) : (
                  <div className="space-y-4" data-testid="rules-list">
                    {rules.map((rule) => (
                      <Card key={rule.id} className="border" data-testid={`rule-card-${rule.id}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg" data-testid={`rule-name-${rule.id}`}>{rule.name}</CardTitle>
                              <CardDescription data-testid={`rule-description-${rule.id}`}>
                                {rule.description}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={rule.enabled ? "default" : "secondary"} data-testid={`rule-status-${rule.id}`}>
                                {rule.enabled ? 'Enabled' : 'Disabled'}
                              </Badge>
                              <Badge variant="outline" data-testid={`rule-type-${rule.id}`}>
                                {rule.type}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                <span>Priority: {rule.priority}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>Updated {formatDistanceToNow(new Date(rule.updatedAt))} ago</span>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" data-testid={`button-edit-rule-${rule.id}`}>
                                <Settings className="h-4 w-4 mr-1" />
                                Configure
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="health">
            <Card>
              <CardHeader>
                <CardTitle>System Health Monitoring</CardTitle>
                <CardDescription>Real-time performance metrics and system status</CardDescription>
              </CardHeader>
              <CardContent>
                {healthLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading health metrics...</span>
                  </div>
                ) : healthMetrics.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No health metrics available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="health-metrics-grid">
                    {healthMetrics.map((metric, index) => {
                      const health = getHealthStatus(metric.status);
                      return (
                        <Card key={metric.id || index} className="border" data-testid={`health-card-${index}`}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm" data-testid={`health-card-name-${index}`}>{metric.metricName}</CardTitle>
                              <Badge className={health.bg + ' ' + health.color} data-testid={`health-card-status-${index}`}>
                                {health.text}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold mb-2" data-testid={`health-card-value-${index}`}>
                              {metric.value} {metric.unit}
                            </div>
                            {metric.threshold && (
                              <div className="text-sm text-gray-600 mb-2">
                                Threshold: {metric.threshold} {metric.unit}
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              {metric.timestamp ? `Updated ${formatDistanceToNow(new Date(metric.timestamp))} ago` : 'No update time'}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Type: {metric.metricType}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
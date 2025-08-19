import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Bell, 
  Calendar, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  FileText,
  Building,
  CreditCard,
  Users,
  TrendingUp,
  Eye,
  EyeOff
} from "lucide-react";
import { dashboardApi } from "@/lib/api";

interface Alert {
  id: number;
  title: string;
  description: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'system' | 'compliance' | 'business' | 'sars';
  priority: 'high' | 'medium' | 'low';
  time: string;
  dueDate?: string;
  status: 'active' | 'resolved' | 'dismissed';
  actionRequired: boolean;
}

export default function AlertsPage() {
  const [selectedTab, setSelectedTab] = useState('all');
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved' | 'dismissed'>('all');

  // Fetch real alerts data from API
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/alerts"],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sars': return <FileText className="h-4 w-4" />;
      case 'system': return <Building className="h-4 w-4" />;
      case 'business': return <TrendingUp className="h-4 w-4" />;
      case 'compliance': return <Calendar className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const filteredAlerts = alerts.filter((alert: Alert) => {
    if (selectedTab !== 'all' && alert.category !== selectedTab) return false;
    if (filter !== 'all' && alert.status !== filter) return false;
    return true;
  });

  const alertCounts = {
    all: alerts.length,
    active: alerts.filter((a: Alert) => a.status === 'active').length,
    critical: alerts.filter((a: Alert) => a.type === 'critical').length,
    sars: alerts.filter((a: Alert) => a.category === 'sars').length,
    business: alerts.filter((a: Alert) => a.category === 'business').length,
    system: alerts.filter((a: Alert) => a.category === 'system').length,
  };

  const handleDismissAlert = (alertId: number) => {
    // In real implementation, this would call an API
    console.log(`Dismissing alert ${alertId}`);
  };

  const handleResolveAlert = (alertId: number) => {
    // In real implementation, this would call an API
    console.log(`Resolving alert ${alertId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-3">System Alerts</h1>
                <p className="text-orange-100 text-lg font-medium">Monitor critical notifications, SARS deadlines, and system status</p>
              </div>
              <div className="hidden sm:block">
                <AlertTriangle className="h-12 w-12 text-white opacity-80" />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-red-500 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-3">
              <XCircle className="h-8 w-8 opacity-80" />
              <span className="text-4xl font-black">{alertCounts.critical}</span>
            </div>
            <div className="text-sm opacity-90 font-bold">Critical Alerts</div>
            <div className="text-sm opacity-75 font-bold">Require immediate action</div>
          </div>

          <div className="bg-yellow-500 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-3">
              <FileText className="h-8 w-8 opacity-80" />
              <span className="text-4xl font-black">{alertCounts.sars}</span>
            </div>
            <div className="text-sm opacity-90 font-bold">SARS Deadlines</div>
            <div className="text-sm opacity-75 font-bold">Tax compliance alerts</div>
          </div>

          <div className="bg-blue-500 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="h-8 w-8 opacity-80" />
              <span className="text-4xl font-black">{alertCounts.business}</span>
            </div>
            <div className="text-sm opacity-90 font-bold">Business Alerts</div>
            <div className="text-sm opacity-75 font-bold">Operational notifications</div>
          </div>

          <div className="bg-purple-500 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-3">
              <Building className="h-8 w-8 opacity-80" />
              <span className="text-4xl font-black">{alertCounts.system}</span>
            </div>
            <div className="text-sm opacity-90 font-bold">System Alerts</div>
            <div className="text-sm opacity-75 font-bold">Technical notifications</div>
          </div>
        </div>

        {/* Filters and Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full sm:w-auto">
                <TabsList className="grid grid-cols-5 bg-gray-50 h-12">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    All ({alertCounts.all})
                  </TabsTrigger>
                  <TabsTrigger value="sars" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    SARS ({alertCounts.sars})
                  </TabsTrigger>
                  <TabsTrigger value="business" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Business ({alertCounts.business})
                  </TabsTrigger>
                  <TabsTrigger value="system" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    System ({alertCounts.system})
                  </TabsTrigger>
                  <TabsTrigger value="compliance" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Compliance
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex gap-2">
                <Button 
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button 
                  variant={filter === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('active')}
                >
                  Active
                </Button>
                <Button 
                  variant={filter === 'resolved' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('resolved')}
                >
                  Resolved
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {alertsLoading && (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading alerts...</p>
          </div>
        )}

        {/* Alerts List */}
        <div className="space-y-4">
          {!alertsLoading && filteredAlerts.map((alert: Alert) => (
            <Card key={alert.id} className={`border-l-4 ${alert.type === 'critical' ? 'border-l-red-500' : 
              alert.type === 'warning' ? 'border-l-yellow-500' : 
              alert.type === 'success' ? 'border-l-green-500' : 'border-l-blue-500'} hover:shadow-md transition-shadow`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <CardTitle className="text-lg font-semibold">{alert.title}</CardTitle>
                      <CardDescription className="text-sm text-gray-600 mt-1">
                        {alert.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getAlertColor(alert.type)}>
                      {alert.type}
                    </Badge>
                    {alert.actionRequired && (
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        Action Required
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      {getCategoryIcon(alert.category)}
                      <span className="capitalize">{alert.category}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{alert.time}</span>
                    </div>
                    {alert.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {new Date(alert.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {alert.status === 'active' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDismissAlert(alert.id)}
                        >
                          <EyeOff className="h-4 w-4 mr-1" />
                          Dismiss
                        </Button>
                        {alert.actionRequired && (
                          <Button 
                            size="sm"
                            onClick={() => handleResolveAlert(alert.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!alertsLoading && filteredAlerts.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No alerts found</h3>
            <p className="text-gray-600">All alerts have been resolved or dismissed.</p>
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Building, 
  FileText, 
  Package, 
  HardDrive, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Calendar,
  ArrowUp,
  ArrowDown,
  Activity,
  Target,
  Lightbulb,
  BarChart3
} from "lucide-react";

interface UsageMetric {
  id: string;
  name: string;
  current: number;
  limit: number;
  unit: string;
  percentage: number;
  trend: "up" | "down" | "stable";
  trendPercentage: number;
  category: string;
  icon: any;
  status: "healthy" | "warning" | "critical";
  prediction: {
    willExceedIn: number; // days
    projectedUsage: number;
    confidence: number;
  };
}

interface UsageDashboardProps {
  companyId?: number;
  planId?: number;
  timeRange?: "7d" | "30d" | "90d";
}

export default function SubscriptionUsageDashboard({ 
  companyId, 
  planId, 
  timeRange = "30d" 
}: UsageDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch usage data with predictive analytics
  const { data: usageData, isLoading } = useQuery({
    queryKey: ["/api/subscription/usage-analytics", companyId, planId, selectedTimeRange],
    enabled: !!companyId || !!planId
  });

  // Mock data for demonstration (replace with real API data)
  const mockUsageMetrics: UsageMetric[] = [
    {
      id: "users",
      name: "Active Users",
      current: 8,
      limit: 10,
      unit: "users",
      percentage: 80,
      trend: "up",
      trendPercentage: 15,
      category: "access",
      icon: Users,
      status: "warning",
      prediction: {
        willExceedIn: 45,
        projectedUsage: 12,
        confidence: 85
      }
    },
    {
      id: "companies",
      name: "Companies",
      current: 2,
      limit: 5,
      unit: "companies",
      percentage: 40,
      trend: "stable",
      trendPercentage: 0,
      category: "access",
      icon: Building,
      status: "healthy",
      prediction: {
        willExceedIn: 180,
        projectedUsage: 3,
        confidence: 60
      }
    },
    {
      id: "invoices",
      name: "Monthly Invoices",
      current: 127,
      limit: 250,
      unit: "invoices",
      percentage: 51,
      trend: "up",
      trendPercentage: 23,
      category: "transactions",
      icon: FileText,
      status: "healthy",
      prediction: {
        willExceedIn: 90,
        projectedUsage: 280,
        confidence: 92
      }
    },
    {
      id: "storage",
      name: "Storage Used",
      current: 3.2,
      limit: 5.0,
      unit: "GB",
      percentage: 64,
      trend: "up",
      trendPercentage: 8,
      category: "storage",
      icon: HardDrive,
      status: "warning",
      prediction: {
        willExceedIn: 60,
        projectedUsage: 5.8,
        confidence: 78
      }
    },
    {
      id: "apiCalls",
      name: "API Calls",
      current: 4250,
      limit: 10000,
      unit: "calls",
      percentage: 43,
      trend: "up",
      trendPercentage: 12,
      category: "integration",
      icon: Zap,
      status: "healthy",
      prediction: {
        willExceedIn: 120,
        projectedUsage: 6800,
        confidence: 71
      }
    }
  ];

  const categories = [
    { id: "all", name: "All Categories", icon: BarChart3 },
    { id: "access", name: "Access & Users", icon: Users },
    { id: "transactions", name: "Transactions", icon: FileText },
    { id: "storage", name: "Storage", icon: HardDrive },
    { id: "integration", name: "Integration", icon: Zap }
  ];

  const filteredMetrics = selectedCategory === "all" 
    ? mockUsageMetrics 
    : mockUsageMetrics.filter(metric => metric.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "text-green-600 bg-green-50";
      case "warning": return "text-yellow-600 bg-yellow-50";
      case "critical": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <ArrowUp className="h-3 w-3 text-red-500" />;
      case "down": return <ArrowDown className="h-3 w-3 text-green-500" />;
      default: return <Activity className="h-3 w-3 text-gray-500" />;
    }
  };

  const criticalMetrics = filteredMetrics.filter(m => m.status === "critical").length;
  const warningMetrics = filteredMetrics.filter(m => m.status === "warning").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Subscription Usage Analytics</h2>
          <p className="text-muted-foreground">
            Monitor usage patterns and get predictive insights for capacity planning
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center space-x-2">
                    <category.icon className="h-4 w-4" />
                    <span>{category.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedTimeRange} onValueChange={(value: string) => setSelectedTimeRange(value as "7d" | "30d" | "90d")}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Healthy Metrics</p>
                <p className="text-2xl font-bold">{filteredMetrics.filter(m => m.status === "healthy").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Warning Metrics</p>
                <p className="text-2xl font-bold">{warningMetrics}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Metrics</p>
                <p className="text-2xl font-bold">{criticalMetrics}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {criticalMetrics > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertTitle className="text-red-700">Critical Usage Alerts</AlertTitle>
          <AlertDescription className="text-red-600">
            {criticalMetrics} metrics are in critical state. Immediate action required to prevent service disruption.
          </AlertDescription>
        </Alert>
      )}

      {/* Usage Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMetrics.map((metric) => (
          <Card key={metric.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <metric.icon className="h-5 w-5 text-gray-600" />
                  <CardTitle className="text-lg">{metric.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(metric.status)}>
                    {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                  </Badge>
                  {getTrendIcon(metric.trend)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Usage */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Current Usage</span>
                  <span className="text-sm font-medium">
                    {metric.current} / {metric.limit === -1 ? "∞" : metric.limit} {metric.unit}
                  </span>
                </div>
                <Progress 
                  value={metric.percentage} 
                  className="h-2"
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-muted-foreground">{metric.percentage}% used</span>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(metric.trend)}
                    <span className="text-xs text-muted-foreground">
                      {metric.trendPercentage}% vs last period
                    </span>
                  </div>
                </div>
              </div>

              {/* Predictive Insights */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-1 text-blue-500" />
                  Predictive Insights
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Will exceed limit in:</span>
                    <span className="font-medium">{metric.prediction.willExceedIn} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Projected usage:</span>
                    <span className="font-medium">{metric.prediction.projectedUsage} {metric.unit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Confidence level:</span>
                    <Badge variant="outline" className="text-xs">
                      {metric.prediction.confidence}%
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {metric.status !== "healthy" && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Target className="h-4 w-4 mr-1 text-blue-500" />
                    Recommendations
                  </h4>
                  <div className="text-sm text-blue-700">
                    {metric.status === "critical" && (
                      <p>• Consider upgrading your plan immediately to avoid service interruption</p>
                    )}
                    {metric.status === "warning" && (
                      <p>• Plan for capacity increase within the next {Math.floor(metric.prediction.willExceedIn / 7)} weeks</p>
                    )}
                    <p>• Monitor usage patterns to optimize resource allocation</p>
                    <p>• Set up automated alerts for 80% and 90% thresholds</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary & Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Usage Summary & Recommendations</span>
          </CardTitle>
          <CardDescription>
            Based on your current usage patterns and growth trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Key Insights</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Your user growth is accelerating - consider upgrading within 45 days</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span>API usage is well within limits with steady growth pattern</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Storage usage increasing faster than expected - monitor closely</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Recommended Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Plan Review Meeting
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Set Up Usage Alerts
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Upgrade Options
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
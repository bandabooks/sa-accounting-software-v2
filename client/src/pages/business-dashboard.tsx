import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Download, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BusinessMetric {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  trend: 'up' | 'down' | 'stable';
  period: string;
}

export default function BusinessDashboard() {
  const [timeRange, setTimeRange] = useState("30");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Fetch business metrics
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 300000, // 5 minutes
  });

  // Sample chart data
  const cashFlowData = [
    {month: "Week 1", net: 10000},
    {month: "Week 2", net: 12000},
    {month: "Week 3", net: 11000},
    {month: "Week 4", net: 13000}
  ];

  const revenueExpenseData = [
    {month: "Week 1", revenue: 6000, expenses: 4000},
    {month: "Week 2", revenue: 6200, expenses: 3800},
    {month: "Week 3", revenue: 6100, expenses: 4200},
    {month: "Week 4", revenue: 6300, expenses: 3900}
  ];

  const businessMetrics: BusinessMetric[] = [
    {
      title: "Bank Balance",
      value: Math.round((dashboardStats as any)?.bankBalance || 245800),
      change: 5.2,
      changeType: 'increase',
      trend: 'up',
      period: "vs last month"
    },
    {
      title: "Total Receivables",
      value: `R ${((dashboardStats as any)?.outstandingInvoices || '464,915.00')}`,
      change: 15.4,
      changeType: 'increase',
      trend: 'up',
      period: "vs last month"
    },
    {
      title: "Total Payables",
      value: Math.round((dashboardStats as any)?.totalPayables || 125000),
      change: -8.3,
      changeType: 'decrease',
      trend: 'down',
      period: "vs last month"
    },
    {
      title: "Monthly Revenue",
      value: `R ${((dashboardStats as any)?.totalRevenue || '147,428.00')}`,
      change: 8.2,
      changeType: 'increase', 
      trend: 'up',
      period: "vs last month"
    },
    {
      title: "Active Projects",
      value: 0,
      change: 15.0,
      changeType: 'increase',
      trend: 'up',
      period: "vs last month"
    },
    {
      title: "Profit Margin",
      value: dashboardStats?.profitMargin ? `${dashboardStats.profitMargin}%` : "0%",
      change: 2.1,
      changeType: 'increase',
      trend: 'up',
      period: "vs last month"
    }
  ];

  const handleRefresh = () => {
    setLastRefresh(new Date());
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50" data-testid="business-dashboard">
      {/* Header with Global Controls */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Financial performance and operational insights
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Time Range Selector */}
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 z-50" data-testid="time-range-selector">
                <SelectValue placeholder="Last 30..." />
              </SelectTrigger>
              <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg">
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh Button */}
            <Button variant="outline" size="sm" onClick={handleRefresh} data-testid="button-refresh">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            {/* Export Button */}
            <Button variant="outline" size="sm" data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Last Update Indicator */}
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full" data-testid="status-indicator"></div>
          <span data-testid="text-last-updated">Last updated: {lastRefresh.toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* KPI Strip - 6 Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4" data-testid="kpi-grid">
          {businessMetrics.map((metric, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" data-testid={`kpi-card-${index}`}
                  onClick={() => {
                    if (metric.title.includes('Revenue')) setLocation('/invoices');
                    else if (metric.title.includes('Bank')) setLocation('/banking');
                    else if (metric.title.includes('Receivables')) setLocation('/invoices');
                    else if (metric.title.includes('Projects')) setLocation('/projects');
                    else if (metric.title.includes('Profit')) setLocation('/reports/financial');
                    else if (metric.title.includes('Payables')) setLocation('/suppliers');
                  }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      {metric.title}
                    </p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-xl font-medium text-gray-900">
                        {typeof metric.value === 'string' ? metric.value : metric.value.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {metric.trend === 'up' ? (
                        <ArrowUpRight className="h-3 w-3 text-green-600" />
                      ) : metric.trend === 'down' ? (
                        <ArrowDownRight className="h-3 w-3 text-red-600" />
                      ) : null}
                      <span className={`text-xs font-medium ${
                        metric.changeType === 'increase' ? 'text-green-600' : 
                        metric.changeType === 'decrease' ? 'text-red-600' : 
                        'text-gray-600'
                      }`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                      <span className="text-xs text-gray-500">{metric.period}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="charts-section">
          {/* Cash Flow Chart */}
          <Card data-testid="chart-cashflow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Cash Flow Trend</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {timeRange === "7" ? "7 days" : timeRange === "30" ? "30 days" : timeRange === "90" ? "90 days" : "1 year"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `R${(value/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => [`R${Number(value).toLocaleString()}`, 'Net Cash Flow']} />
                    <Bar dataKey="net" fill="#22c55e" name="Net Cash Flow" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Revenue vs Expenses Chart */}
          <Card data-testid="chart-revenue-expenses">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Revenue vs Expenses</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {timeRange === "7" ? "7 days" : timeRange === "30" ? "30 days" : timeRange === "90" ? "90 days" : "1 year"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueExpenseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `R${(value/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value, name) => [`R${Number(value).toLocaleString()}`, name]} />
                    <Bar dataKey="revenue" fill="#22c55e" name="Revenue" />
                    <Bar dataKey="expenses" fill="#f59e0b" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
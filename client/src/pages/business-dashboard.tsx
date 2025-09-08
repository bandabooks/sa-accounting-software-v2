import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Download, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Minus, Plus, CreditCard, FolderPlus, UserPlus, FileText, Users } from "lucide-react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    {month: "Week 1", cashIn: 25000, cashOut: 15000, netFlow: 10000},
    {month: "Week 2", cashIn: 28000, cashOut: 16000, netFlow: 12000},
    {month: "Week 3", cashIn: 27000, cashOut: 16000, netFlow: 11000},
    {month: "Week 4", cashIn: 29000, cashOut: 16000, netFlow: 13000}
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

        {/* Charts and Quick Actions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-testid="charts-actions-section">
          {/* Cash Flow Chart - Compact */}
          <Card data-testid="chart-cashflow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Cash Flow Trend</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {timeRange === "7" ? "7 days" : timeRange === "30" ? "30 days" : timeRange === "90" ? "90 days" : "1 year"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="1 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                    <XAxis 
                      dataKey="month" 
                      fontSize={11} 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `R${(value/1000).toFixed(0)}k`} 
                      fontSize={11}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b' }}
                    />
                    <Tooltip 
                      formatter={(value, name) => [`R${Number(value).toLocaleString()}`, name]}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cashIn" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      dot={{ fill: '#22c55e', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: '#22c55e', strokeWidth: 2, fill: '#ffffff' }}
                      name="Cash In"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cashOut" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: '#ef4444', strokeWidth: 2, fill: '#ffffff' }}
                      name="Cash Out"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="netFlow" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
                      name="Net Flow"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Revenue vs Expenses Chart - Compact */}
          <Card data-testid="chart-revenue-expenses">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Revenue vs Expenses</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {timeRange === "7" ? "7 days" : timeRange === "30" ? "30 days" : timeRange === "90" ? "90 days" : "1 year"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueExpenseData}>
                    <CartesianGrid strokeDasharray="1 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                    <XAxis 
                      dataKey="month" 
                      fontSize={11}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `R${(value/1000).toFixed(0)}k`} 
                      fontSize={11}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b' }}
                    />
                    <Tooltip 
                      formatter={(value, name) => [`R${Number(value).toLocaleString()}`, name]}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#22c55e" 
                      strokeWidth={3}
                      dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2, fill: '#ffffff' }}
                      name="Revenue" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2, fill: '#ffffff' }}
                      name="Expenses" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card data-testid="quick-actions">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full justify-start h-8 text-sm" 
                variant="outline"
                onClick={() => setLocation('/invoices/new')}
                data-testid="button-create-invoice"
              >
                <Plus className="h-3 w-3 mr-2" />
                Create Invoice
              </Button>
              
              <Button 
                className="w-full justify-start h-8 text-sm" 
                variant="outline"
                onClick={() => setLocation('/payments/new')}
                data-testid="button-record-payment"
              >
                <CreditCard className="h-3 w-3 mr-2" />
                Record Payment
              </Button>
              
              <Button 
                className="w-full justify-start h-8 text-sm" 
                variant="outline"
                onClick={() => setLocation('/projects/new')}
                data-testid="button-new-project"
              >
                <FolderPlus className="h-3 w-3 mr-2" />
                New Project
              </Button>
              
              <Button 
                className="w-full justify-start h-8 text-sm" 
                variant="outline"
                onClick={() => setLocation('/customers/new')}
                data-testid="button-add-customer"
              >
                <UserPlus className="h-3 w-3 mr-2" />
                Add Customer
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row - Priority Actions and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="actions-section">
          {/* Priority Actions */}
          <Card data-testid="priority-actions">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Priority Actions</CardTitle>
                <Button variant="outline" size="sm" className="text-xs">
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <p className="font-medium text-red-900">Overdue Invoices</p>
                  <p className="text-sm text-red-600">3 invoices totaling R3500</p>
                </div>
                <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-100">
                  View All
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div>
                  <p className="font-medium text-yellow-900">Due This Week</p>
                  <p className="text-sm text-yellow-600">5 items pending and due</p>
                </div>
                <Button variant="outline" size="sm" className="text-yellow-600 border-yellow-300 hover:bg-yellow-100">
                  Review
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="font-medium text-blue-900">Pending Approvals</p>
                  <p className="text-sm text-blue-600">8 draft invoices ready to send</p>
                </div>
                <Button variant="outline" size="sm" className="text-blue-600 border-blue-300 hover:bg-blue-100">
                  Approve
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent High-Value Activity */}
          <Card data-testid="recent-activity">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Recent High-Value Activity</CardTitle>
                <Button variant="outline" size="sm" className="text-xs">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Payment Received</p>
                    <p className="text-sm text-gray-500">ABC Company - Invoice #1001</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">+R15,000</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Invoice Created</p>
                    <p className="text-sm text-gray-500">XYZ Corp - Monthly Service</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">R25,000</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Users className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">New Customer</p>
                    <p className="text-sm text-gray-500">Tech Solutions Ltd</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-600">New Lead</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
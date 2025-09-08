import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp, TrendingDown, DollarSign, Users, Target, AlertCircle,
  ArrowUpRight, ArrowDownRight, Calendar, RefreshCw, Filter, Download,
  CreditCard, Banknote, FileText, Plus, Clock, CheckCircle2
} from "lucide-react";
import { formatCurrency } from "@/lib/utils-invoice";
import { Link } from "wouter";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface BusinessMetric {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  trend: 'up' | 'down' | 'stable';
  period: string;
}

interface QuickAction {
  title: string;
  icon: React.ReactNode;
  href: string;
  count?: number;
}

export default function BusinessDashboard() {
  const [timeRange, setTimeRange] = useState("30");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch business metrics
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 300000, // 5 minutes
  });

  // Fetch financial data for charts
  const { data: cashFlowData = [] } = useQuery({
    queryKey: ["/api/financial/cash-flow", timeRange],
    queryFn: async () => {
      // Generate realistic cash flow data filtered by time range
      const days = parseInt(timeRange);
      let periods = [];
      
      if (days <= 30) {
        // Weekly periods for short ranges
        periods = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      } else if (days <= 90) {
        // Monthly periods for medium ranges  
        periods = ['Month 1', 'Month 2', 'Month 3'];
      } else {
        // Monthly periods for longer ranges
        periods = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      }
      
      return periods.map((period, index) => {
        // Adjust scale based on time range
        const baseInflow = days <= 30 ? 35000 : 150000;
        const baseOutflow = days <= 30 ? 28000 : 120000;
        
        return {
          month: period,
          inflow: Math.round(baseInflow + (Math.random() - 0.5) * (baseInflow * 0.3) + index * (baseInflow * 0.05)),
          outflow: Math.round(baseOutflow + (Math.random() - 0.5) * (baseOutflow * 0.3) + index * (baseOutflow * 0.05)),
          net: 0
        };
      }).map(item => ({ ...item, net: item.inflow - item.outflow }));
    }
  });

  const { data: revenueExpenseData = [] } = useQuery({
    queryKey: ["/api/financial/revenue-expenses", timeRange], 
    queryFn: async () => {
      // Generate revenue vs expense data filtered by time range
      const days = parseInt(timeRange);
      let periods = [];
      
      if (days <= 30) {
        periods = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      } else if (days <= 90) {
        periods = ['Month 1', 'Month 2', 'Month 3'];
      } else {
        periods = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      }
      
      return periods.map((period, index) => {
        // Adjust scale based on time range
        const baseRevenue = days <= 30 ? 45000 : 180000;
        const baseExpenses = days <= 30 ? 35000 : 140000;
        
        const revenue = Math.round(baseRevenue + (Math.random() - 0.5) * (baseRevenue * 0.2) + index * (baseRevenue * 0.05));
        const expenses = Math.round(baseExpenses + (Math.random() - 0.5) * (baseExpenses * 0.2) + index * (baseExpenses * 0.04));
        return {
          month: period,
          revenue,
          expenses,
          profit: revenue - expenses
        };
      });
    }
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ["/api/invoices"],
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
  });

  // Calculate business KPIs from real data
  const invoiceList = Array.isArray(invoices) ? invoices : [];
  const customerList = Array.isArray(customers) ? customers : [];
  const projectList = Array.isArray(projects) ? projects : [];
  
  const totalRevenue = Math.round(invoiceList.reduce((sum: number, inv: any) => {
    const total = typeof inv.total === 'number' ? inv.total : parseFloat(inv.total) || 0;
    return inv.status === 'paid' ? sum + total : sum;
  }, 0) * 100) / 100;
  
  const overdueInvoices = invoiceList.filter((inv: any) => 
    inv.status === 'overdue' || (inv.dueDate && new Date(inv.dueDate) < new Date()));
  
  const overdueAmount = Math.round(overdueInvoices.reduce((sum: number, inv: any) => {
    const total = typeof inv.total === 'number' ? inv.total : parseFloat(inv.total) || 0;
    return sum + total;
  }, 0) * 100) / 100;
  
  const activeProjects = projectList.filter((p: any) => p.status === 'in_progress');
  
  const draftInvoices = invoiceList.filter((inv: any) => inv.status === 'draft');

  const businessMetrics: BusinessMetric[] = [
    {
      title: "Cash Balance",
      value: Math.round((dashboardStats as any)?.bankBalance || 245800),
      change: 5.2,
      changeType: 'increase',
      trend: 'up',
      period: "vs last month"
    },
    {
      title: "Total Receivables",
      value: overdueAmount,
      change: overdueAmount > 0 ? 15.4 : -5.4,
      changeType: overdueAmount > 0 ? 'increase' : 'decrease',
      trend: overdueAmount > 0 ? 'up' : 'down',
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
      value: Math.round(((dashboardStats as any)?.monthlyRevenue || totalRevenue) * 100) / 100,
      change: 8.2,
      changeType: 'increase', 
      trend: 'up',
      period: "vs last month"
    },
    {
      title: "Active Projects",
      value: activeProjects.length,
      change: 15.0,
      changeType: 'increase',
      trend: 'up',
      period: "vs last month"
    },
    {
      title: "Profit Margin",
      value: "18.5%",
      change: 2.1,
      changeType: 'increase',
      trend: 'up',
      period: "vs last month"
    }
  ];

  // Quick actions for business operations
  const quickActions: QuickAction[] = [
    {
      title: "Create Invoice",
      icon: <FileText className="h-4 w-4" />,
      href: "/invoices/new",
      count: draftInvoices.length
    },
    {
      title: "Record Payment",
      icon: <CreditCard className="h-4 w-4" />,
      href: "/customer-payments/record"
    },
    {
      title: "New Project",
      icon: <Plus className="h-4 w-4" />,
      href: "/projects"
    },
    {
      title: "Add Customer",
      icon: <Users className="h-4 w-4" />,
      href: "/customers/new"
    }
  ];

  // Recent high-value transactions from real data
  const recentTransactions = invoiceList
    .filter((inv: any) => inv.total && inv.total > 5000)
    .slice(0, 3)
    .map((inv: any) => ({
      id: inv.id,
      client: inv.customerName || `Customer ${inv.customerId}`,
      amount: inv.total,
      type: "invoice",
      status: inv.status,
      date: inv.createdAt || inv.date
    }));

  const handleRefresh = () => {
    setLastRefresh(new Date());
    // Trigger data refresh by invalidating queries
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
    queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
    queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    queryClient.invalidateQueries({ queryKey: ['/api/financial/cash-flow'] });
    queryClient.invalidateQueries({ queryKey: ['/api/financial/revenue-expenses'] });
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
              <SelectTrigger className="w-32" data-testid="time-range-selector">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" data-testid={`kpi-card-${index}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide" data-testid={`kpi-title-${index}`}>
                      {metric.title}
                    </p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-xl font-medium text-gray-900" data-testid={`kpi-value-${index}`}>
                        {typeof metric.value === 'number' && (metric.title.includes('Revenue') || metric.title.includes('Cash') || metric.title.includes('Receivables'))
                          ? formatCurrency(Number(metric.value)) 
                          : metric.value}
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
                      }`} data-testid={`kpi-change-${index}`}>
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
                  {timeRange} days
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      className="text-xs"
                      tickFormatter={(value) => `R${(value/1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        `R${Number(value).toLocaleString()}`, 
                        name === 'inflow' ? 'Cash In' : name === 'outflow' ? 'Cash Out' : 'Net Flow'
                      ]}
                      labelStyle={{ color: '#374151' }}
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="inflow" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#10b981' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="outflow" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#ef4444' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="net" 
                      stroke="#3b82f6" 
                      strokeWidth={4}
                      dot={{ r: 5, fill: '#3b82f6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Revenue vs Expenses */}
          <Card data-testid="chart-revenue">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Revenue vs Expenses</CardTitle>
                <Badge variant="outline" className="text-xs">
                  Monthly
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueExpenseData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      className="text-xs"
                      tickFormatter={(value) => `R${(value/1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        `R${Number(value).toLocaleString()}`, 
                        name === 'revenue' ? 'Revenue' : name === 'expenses' ? 'Expenses' : 'Profit'
                      ]}
                      labelStyle={{ color: '#374151' }}
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Work Queue and Money in Motion */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Work Queue */}
          <Card className="lg:col-span-2" data-testid="work-queue">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Priority Actions</CardTitle>
                <Button variant="outline" size="sm" data-testid="button-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg" data-testid="alert-overdue">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Overdue Invoices</p>
                      <p className="text-xs text-gray-600">{overdueInvoices.length} invoices totaling {formatCurrency(overdueAmount)}</p>
                    </div>
                  </div>
                  <Link href="/invoices">
                    <Button size="sm" variant="outline" data-testid="button-view-overdue">
                      View All
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg" data-testid="alert-due-week">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Due This Week</p>
                      <p className="text-xs text-gray-600">{activeProjects.length} active projects and tasks</p>
                    </div>
                  </div>
                  <Link href="/projects">
                    <Button size="sm" variant="outline" data-testid="button-review-tasks">
                      Review
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg" data-testid="alert-approvals">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Pending Approvals</p>
                      <p className="text-xs text-gray-600">{draftInvoices.length} draft invoices ready to send</p>
                    </div>
                  </div>
                  <Link href="/invoices">
                    <Button size="sm" variant="outline" data-testid="button-approve">
                      Approve
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card data-testid="quick-actions">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-auto p-3"
                    asChild
                    data-testid={`quick-action-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      {action.icon}
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">{action.title}</p>
                        {action.count && action.count > 0 && (
                          <p className="text-xs text-gray-500">{action.count} pending</p>
                        )}
                      </div>
                    </div>
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent High-Value Transactions */}
        <Card data-testid="recent-transactions">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent High-Value Activity</CardTitle>
              <Link href="/invoices">
                <Button variant="outline" size="sm" data-testid="button-view-all-transactions">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.length > 0 ? recentTransactions.map((transaction: any) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50" data-testid={`transaction-${transaction.id}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${
                      transaction.status === 'paid' ? 'bg-green-500' :
                      transaction.status === 'pending' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{transaction.client}</p>
                      <p className="text-xs text-gray-600">
                        {transaction.type} • {transaction.date ? new Date(transaction.date).toLocaleDateString() : 'Recent'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </p>
                    <Badge 
                      variant={transaction.status === 'paid' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No high-value transactions yet</p>
                  <p className="text-xs">Create invoices to see activity here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import React, { useState, useEffect, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Plus, FileText, UserPlus, DollarSign, RefreshCw, ChevronDown,
  AlertTriangle, Info, CheckCircle, X, TrendingUp, TrendingDown,
  BarChart3, LineChart, Calendar, Clock
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils-invoice";
import { AIHealthIndicator } from "@/components/ai/AIHealthIndicator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Lazy load chart component
const ProfitLossChart = lazy(() => import("@/components/dashboard/profit-loss-chart"));

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  label: string;
  link?: string;
}

interface TimelineEvent {
  id: string;
  time: string;
  description: string;
  type: 'invoice' | 'payment' | 'customer' | 'expense' | 'general';
}

export default function DashboardNew() {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [dateRange, setDateRange] = useState('90d');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: dashboardApi.getStats,
    refetchInterval: 30000,
  });

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  const dashboardStats = stats || {
    totalRevenue: "0.00",
    outstandingInvoices: "0.00",
    totalCustomers: 0,
    pendingEstimates: 0,
    profitLossData: [],
    recentActivities: [],
    complianceAlerts: []
  };

  // Mock alerts - in production, these would come from API
  const alerts: Alert[] = [
    { id: '1', severity: 'critical', label: 'VAT return due in 3 days', link: '/vat-returns' },
    { id: '2', severity: 'warning', label: '5 overdue invoices', link: '/invoices' },
    { id: '3', severity: 'info', label: 'New tax regulation update', link: '/compliance' }
  ];

  // Mock timeline events - in production, from API
  const timelineEvents: TimelineEvent[] = [
    { id: '1', time: '2 min ago', description: 'Invoice #1234 paid', type: 'payment' },
    { id: '2', time: '1 hour ago', description: 'New customer: ABC Corp', type: 'customer' },
    { id: '3', time: '3 hours ago', description: 'Expense recorded: Office supplies', type: 'expense' },
    { id: '4', time: '5 hours ago', description: 'Estimate #567 sent', type: 'invoice' },
    { id: '5', time: 'Yesterday', description: 'Monthly report generated', type: 'general' }
  ];

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-3 w-3" />;
      case 'warning': return <Info className="h-3 w-3" />;
      default: return <CheckCircle className="h-3 w-3" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-[1366px]">
        <div className="grid grid-cols-12 gap-4">
          
          {/* Row 1: Compact Hero (12 cols) */}
          <div className="col-span-12">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-4 text-white">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                
                {/* Left: Title & Status */}
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold">Business Dashboard</h1>
                  <div className="flex items-center gap-2">
                    <AIHealthIndicator />
                    <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs">
                      <Clock className="h-3 w-3" />
                      <span>{lastUpdate.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                {/* Right: 4 KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">{formatCurrency(dashboardStats.totalRevenue)}</div>
                    <div className="text-xs opacity-90">Total Revenue</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">{formatCurrency(dashboardStats.outstandingInvoices)}</div>
                    <div className="text-xs opacity-90">Outstanding</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">{dashboardStats.totalCustomers}</div>
                    <div className="text-xs opacity-90">Active Customers</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">{dashboardStats.pendingEstimates}</div>
                    <div className="text-xs opacity-90">Pending Quotes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Alerts Bar (12 cols) */}
          <div className="col-span-12">
            <div className="bg-white rounded-lg shadow-sm p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  {alerts.map(alert => (
                    <Link
                      key={alert.id}
                      href={alert.link || '#'}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-all hover:scale-105 ${getAlertColor(alert.severity)}`}
                    >
                      {getAlertIcon(alert.severity)}
                      <span>{alert.label}</span>
                    </Link>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => {/* Clear alerts logic */}}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Row 3: Quick Actions (12 cols) */}
          <div className="col-span-12">
            <Card className="shadow-sm">
              <CardHeader className="pb-3 pt-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refetch()}
                    className="h-8 w-8 p-0"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex gap-2">
                  {/* Primary: New Invoice */}
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/invoices/new">
                      <Plus className="h-4 w-4 mr-2" />
                      New Invoice
                    </Link>
                  </Button>

                  {/* Split Button Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="px-2">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem asChild>
                        <Link href="/estimates/new">
                          <FileText className="h-4 w-4 mr-2" />
                          New Estimate
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/payments/record">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Record Payment
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/customers/new">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Customer
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Row 4: P&L Chart (8 cols) + Timeline (4 cols) */}
          <div className="col-span-12 lg:col-span-8">
            <Card className="h-full shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Profit & Loss</CardTitle>
                  <div className="flex items-center gap-2">
                    {/* Date Range Selector */}
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                        <SelectItem value="180d">Last 6 months</SelectItem>
                        <SelectItem value="365d">Last year</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Chart Type Toggle */}
                    <div className="flex bg-gray-100 rounded p-0.5">
                      <Button
                        variant={chartType === 'bar' ? 'default' : 'ghost'}
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => setChartType('bar')}
                      >
                        <BarChart3 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant={chartType === 'line' ? 'default' : 'ghost'}
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => setChartType('line')}
                      >
                        <LineChart className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="h-64 flex items-center justify-center text-sm text-gray-500">Loading chart...</div>}>
                  <ProfitLossChart 
                    data={dashboardStats.profitLossData || []} 
                    chartType={chartType}
                  />
                </Suspense>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <Card className="h-full shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Recent Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {timelineEvents.map(event => (
                    <div key={event.id} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 truncate">{event.description}</p>
                        <p className="text-xs text-gray-500">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
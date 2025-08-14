import React, { useState, useEffect, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Plus, FileText, UserPlus, DollarSign, RefreshCw, ChevronDown,
  AlertTriangle, Info, CheckCircle, X, TrendingUp, TrendingDown,
  BarChart3, LineChart, Calendar, Clock, Receipt, ShoppingCart,
  Package, CreditCard, Building2, UserCheck, ChevronRight,
  FileCheck, Send, Eye, Download, Edit, ArrowUpRight, ArrowDownRight,
  Activity, Bell, Target, Briefcase, Users, Wallet
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dashboardApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils-invoice";
import { AIHealthIndicator } from "@/components/ai/AIHealthIndicator";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Lazy load chart component
const ProfitLossChart = lazy(() => import("@/components/dashboard/profit-loss-chart"));

interface BusinessActivity {
  id: string;
  type: 'payment' | 'invoice' | 'customer' | 'expense' | 'quote' | 'vat';
  title: string;
  description: string;
  amount?: string;
  time: string;
  status: 'success' | 'pending' | 'warning' | 'info';
  icon?: React.ReactNode;
}

export default function DashboardProfessional() {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [dateRange, setDateRange] = useState('6months');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedActivityType, setSelectedActivityType] = useState<string>('all');

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

  // Professional business activities with more detail
  const businessActivities: BusinessActivity[] = [
    { 
      id: '1', 
      type: 'payment', 
      title: 'Payment Received',
      description: 'Invoice #1234 paid by ABC Corp',
      amount: 'R 347.00',
      time: '2 min ago',
      status: 'success',
      icon: <CreditCard className="h-4 w-4" />
    },
    { 
      id: '2', 
      type: 'invoice', 
      title: 'New Invoice Created',
      description: 'Invoice #1235 for XYZ Ltd',
      amount: 'R 8,125.00',
      time: '1 hour ago',
      status: 'pending',
      icon: <FileText className="h-4 w-4" />
    },
    { 
      id: '3', 
      type: 'customer', 
      title: 'New Customer Registration',
      description: 'ABC Corp added to system',
      time: '2 hours ago',
      status: 'info',
      icon: <UserPlus className="h-4 w-4" />
    },
    { 
      id: '4', 
      type: 'expense', 
      title: 'Expense Recorded',
      description: 'Office supplies from Makro',
      amount: 'R 3,889.00',
      time: '3 hours ago',
      status: 'warning',
      icon: <Receipt className="h-4 w-4" />
    },
    { 
      id: '5', 
      type: 'vat', 
      title: 'VAT Return Due',
      description: 'Monthly VAT return due in 3 days',
      time: '1 day ago',
      status: 'warning',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    { 
      id: '6', 
      type: 'quote', 
      title: 'Quote Accepted',
      description: 'Estimate #567 accepted by client',
      amount: 'R 12,500.00',
      time: '1 day ago',
      status: 'success',
      icon: <FileCheck className="h-4 w-4" />
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'info': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getActivityBadgeColor = (type: string) => {
    switch (type) {
      case 'payment': return 'bg-green-100 text-green-700';
      case 'invoice': return 'bg-blue-100 text-blue-700';
      case 'customer': return 'bg-purple-100 text-purple-700';
      case 'expense': return 'bg-red-100 text-red-700';
      case 'vat': return 'bg-amber-100 text-amber-700';
      case 'quote': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto p-6 max-w-[1400px]">
        
        {/* Professional Header Section */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              
              {/* Left: Welcome & Status */}
              <div>
                <h1 className="text-2xl font-bold mb-2">Good Morning!</h1>
                <p className="text-blue-100">Here's your business performance overview</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm">
                    <Activity className="h-4 w-4" />
                    <span>Real-time Data</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Updated {lastUpdate.toLocaleTimeString()}</span>
                  </div>
                  <AIHealthIndicator />
                </div>
              </div>

              {/* Right: Quick Actions */}
              <div className="flex items-center gap-3">
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="bg-white/20 backdrop-blur hover:bg-white/30 text-white border-white/30"
                  onClick={() => refetch()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-white text-blue-600 hover:bg-blue-50">
                      <Plus className="h-4 w-4 mr-2" />
                      Quick Create
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/invoice-create">
                        <FileText className="h-4 w-4 mr-2" />
                        New Invoice
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/estimate-create">
                        <FileCheck className="h-4 w-4 mr-2" />
                        New Estimate
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/customer-create">
                        <UserPlus className="h-4 w-4 mr-2" />
                        New Customer
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/purchase-order-create">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Purchase Order
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/expenses">
                        <Receipt className="h-4 w-4 mr-2" />
                        Record Expense
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(dashboardStats.totalRevenue)}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="h-4 w-4 text-green-300" />
                      <span className="text-green-300 text-sm">+17.5%</span>
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-white/30" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Outstanding</p>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(dashboardStats.outstandingInvoices)}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <AlertTriangle className="h-4 w-4 text-amber-300" />
                      <span className="text-amber-300 text-sm">Needs attention</span>
                    </div>
                  </div>
                  <Wallet className="h-8 w-8 text-white/30" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Active Customers</p>
                    <p className="text-2xl font-bold mt-1">{dashboardStats.totalCustomers}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Users className="h-4 w-4 text-blue-300" />
                      <span className="text-blue-300 text-sm">Growing</span>
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-white/30" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Pending Quotes</p>
                    <p className="text-2xl font-bold mt-1">{dashboardStats.pendingEstimates}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Target className="h-4 w-4 text-purple-300" />
                      <span className="text-purple-300 text-sm">In Progress</span>
                    </div>
                  </div>
                  <FileText className="h-8 w-8 text-white/30" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Bar */}
        {dashboardStats.complianceAlerts?.length > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-amber-600" />
                <span className="font-medium text-amber-900">Important Alerts</span>
              </div>
              <div className="flex items-center gap-2">
                {dashboardStats.complianceAlerts.slice(0, 3).map((alert: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                    {alert}
                  </Badge>
                ))}
                <Link href="/compliance">
                  <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-900">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Column - Charts & Analytics */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* Profit & Loss Chart */}
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profit & Loss Overview</CardTitle>
                    <CardDescription>Income vs Expenses comparison</CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                        <SelectItem value="6months">6 Months</SelectItem>
                        <SelectItem value="12months">12 Months</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <Button
                        variant={chartType === 'bar' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setChartType('bar')}
                        className="h-8 px-3"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={chartType === 'line' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setChartType('line')}
                        className="h-8 px-3"
                      >
                        <LineChart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="h-80 flex items-center justify-center">Loading chart...</div>}>
                  <ProfitLossChart 
                    data={dashboardStats.profitLossData} 
                    chartType={chartType}
                  />
                </Suspense>
              </CardContent>
            </Card>

            {/* Quick Actions Grid */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/invoice-create">
                    <div className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer group">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <FileText className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium">New Invoice</span>
                    </div>
                  </Link>
                  <Link href="/payments">
                    <div className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors cursor-pointer group">
                      <div className="h-10 w-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mb-2 group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium">Record Payment</span>
                    </div>
                  </Link>
                  <Link href="/customer-create">
                    <div className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-colors cursor-pointer group">
                      <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-2 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <UserPlus className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium">Add Customer</span>
                    </div>
                  </Link>
                  <Link href="/reports">
                    <div className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors cursor-pointer group">
                      <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium">View Reports</span>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Trends */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly performance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">This Month</span>
                      <span className="text-sm text-gray-500">R 120,000 / R 150,000</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Last Month</span>
                      <span className="text-sm text-gray-500">R 95,000 / R 100,000</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Year to Date</span>
                      <span className="text-sm text-gray-500">R 890,000 / R 1,200,000</span>
                    </div>
                    <Progress value={74} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Activities & Insights */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* Recent Business Activities */}
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Activities</CardTitle>
                  <Link href="/audit-logs">
                    <Button variant="ghost" size="sm">
                      View All
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
                <CardDescription>Latest business updates</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {businessActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className={cn(
                          "p-3 rounded-lg border transition-all hover:shadow-md",
                          getStatusColor(activity.status)
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                            getActivityBadgeColor(activity.type)
                          )}>
                            {activity.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-sm truncate">{activity.title}</p>
                              {activity.amount && (
                                <span className="font-semibold text-sm flex-shrink-0">
                                  {activity.amount}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-500">{activity.time}</span>
                              <Badge className={cn("text-xs", getActivityBadgeColor(activity.type))}>
                                {activity.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Business Insights */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Business Insights</CardTitle>
                <CardDescription>Key metrics and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Revenue Growth</span>
                    </div>
                    <p className="text-xs text-green-700">Revenue up 17.5% compared to last month</p>
                  </div>
                  
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-900">Attention Required</span>
                    </div>
                    <p className="text-xs text-amber-700">5 invoices overdue by more than 30 days</p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Goal Progress</span>
                    </div>
                    <p className="text-xs text-blue-700">74% of annual revenue target achieved</p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">Customer Growth</span>
                    </div>
                    <p className="text-xs text-purple-700">3 new customers added this week</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
                <CardDescription>Don't forget these important items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                    <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">VAT Return Submission</p>
                      <p className="text-xs text-gray-500">Due in 3 days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                    <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Follow up on Quote #567</p>
                      <p className="text-xs text-gray-500">Expires in 5 days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Monthly Financial Report</p>
                      <p className="text-xs text-gray-500">Generate by month end</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Backup System Data</p>
                      <p className="text-xs text-gray-500">Weekly backup scheduled</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
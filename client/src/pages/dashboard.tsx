import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Plus, FileText, UserPlus, TrendingUp, Users, DollarSign, AlertTriangle,
  BarChart3, PieChart, Activity, Bell, Settings, ChevronRight, RefreshCw,
  Target, Award, Calendar, Clock, Zap, Star, ArrowUpRight, ArrowDownRight,
  Building, ShoppingCart, CreditCard, Wallet, Eye, Filter, Download
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import EnhancedStatsGrid from "@/components/dashboard/enhanced-stats-grid";
import ProfitLossChart from "@/components/dashboard/profit-loss-chart";
import RecentActivities from "@/components/dashboard/recent-activities";
import ComplianceAlerts from "@/components/dashboard/compliance-alerts";
import ActionShortcuts from "@/components/dashboard/action-shortcuts";
import BankComplianceCard from "@/components/dashboard/bank-compliance-card";
import RecentInvoices from "@/components/dashboard/recent-invoices";
import { dashboardApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils-invoice";
import { TooltipWizard } from "@/components/onboarding/TooltipWizard";
import { useOnboardingWizard } from "@/hooks/useOnboardingWizard";

interface DashboardWidget {
  id: string;
  title: string;
  component: React.ReactNode;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
}

export default function Dashboard() {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New invoice payment received", type: "success", time: "2 min ago", priority: "high" },
    { id: 2, title: "Monthly VAT return due in 3 days", type: "warning", time: "1 hour ago", priority: "medium" },
    { id: 3, title: "New customer registration", type: "info", time: "2 hours ago", priority: "low" }
  ]);

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: dashboardApi.getStats,
    refetchInterval: 30000, // Real-time updates every 30 seconds
  });

  const {
    isWizardVisible,
    onboardingSteps,
    completeOnboarding,
    skipOnboarding,
  } = useOnboardingWizard();

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-gradient-to-r from-blue-200 to-purple-200 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-white/60 rounded-xl shadow-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Return basic dashboard even if stats is null/undefined to prevent loading loop
  const dashboardStats = stats || {
    totalRevenue: "0.00",
    outstandingInvoices: "0.00", 
    totalCustomers: 0,
    pendingEstimates: 0,
    recentInvoices: [],
    revenueByMonth: [],
    receivablesAging: null,
    payablesAging: null,
    cashFlowSummary: null,
    bankBalances: [],
    profitLossData: [],
    recentActivities: [],
    complianceAlerts: []
  };

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getRevenueGrowth = () => {
    const currentRevenue = parseFloat(dashboardStats.totalRevenue);
    const lastMonthRevenue = currentRevenue * 0.85; // Simulated growth
    const growth = ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    return growth.toFixed(1);
  };

  const priorityNotifications = notifications.filter(n => n.priority === 'high');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="container mx-auto px-4 py-6 space-y-6">
        
        {/* Stunning Gradient Hero Section */}
        <div className="relative overflow-hidden">
          {/* Animated Background Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-2xl"></div>
          
          {/* Hero Content - Reduced by 45% */}
          <div className="relative p-4 lg:p-6 text-white">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              
              {/* Welcome Section - Compact */}
              <div className="space-y-3 flex-1">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
                      <Activity className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-blue-100 text-sm font-medium">Business Dashboard</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                    {getCurrentGreeting()}!
                  </h1>
                  <p className="text-blue-100 text-sm">
                    Here's your business performance overview
                  </p>
                </div>

                {/* Live Status Indicators - Compact */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium">Real-time Data</span>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs font-medium">Updated {lastUpdate.toLocaleTimeString()}</span>
                  </div>
                  {priorityNotifications.length > 0 && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-orange-500/80 to-red-500/80 backdrop-blur-sm rounded-full border border-white/30">
                      <Bell className="h-3 w-3 animate-bounce" />
                      <span className="text-xs font-medium">{priorityNotifications.length} Alert{priorityNotifications.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Compact Revenue Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:min-w-[300px]">
                <div className="text-center p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                  <div className="text-xl font-bold text-white mb-1">
                    {formatCurrency(dashboardStats.totalRevenue)}
                  </div>
                  <div className="text-blue-100 text-xs font-medium mb-1">Total Revenue</div>
                  <div className="flex items-center justify-center gap-1 text-green-300">
                    <ArrowUpRight className="h-3 w-3" />
                    <span className="text-xs font-medium">+{getRevenueGrowth()}%</span>
                  </div>
                </div>
                
                <div className="text-center p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                  <div className="text-xl font-bold text-white mb-1">
                    {dashboardStats.totalCustomers}
                  </div>
                  <div className="text-blue-100 text-xs font-medium mb-1">Active Customers</div>
                  <div className="flex items-center justify-center gap-1 text-blue-300">
                    <Users className="h-3 w-3" />
                    <span className="text-xs font-medium">Growing</span>
                  </div>
                </div>
                
                <div className="text-center p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                  <div className="text-xl font-bold text-white mb-1">
                    {dashboardStats.pendingEstimates}
                  </div>
                  <div className="text-blue-100 text-xs font-medium mb-1">Pending Quotes</div>
                  <div className="flex items-center justify-center gap-1 text-yellow-300">
                    <Target className="h-3 w-3" />
                    <span className="text-xs font-medium">In Progress</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Distinguishable Quick Action Bar with Bulk Entry */}
            <div className="mt-4 flex flex-wrap gap-3">
              {/* Primary Action - New Invoice (Green) */}
              <Button asChild className="bg-gradient-to-r from-green-500/30 to-emerald-600/30 hover:from-green-500/40 hover:to-emerald-600/40 backdrop-blur-sm text-white border border-green-400/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold">
                <Link href="/invoices/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Invoice
                </Link>
              </Button>
              
              {/* Secondary Action - New Estimate (Blue) */}
              <Button asChild className="bg-gradient-to-r from-blue-500/30 to-indigo-600/30 hover:from-blue-500/40 hover:to-indigo-600/40 backdrop-blur-sm text-white border border-blue-400/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Link href="/estimates/new">
                  <FileText className="h-4 w-4 mr-2" />
                  New Estimate
                </Link>
              </Button>
              
              {/* Tertiary Action - Add Customer (Purple) */}
              <Button asChild className="bg-gradient-to-r from-purple-500/30 to-violet-600/30 hover:from-purple-500/40 hover:to-violet-600/40 backdrop-blur-sm text-white border border-purple-400/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Link href="/customers/new">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Customer
                </Link>
              </Button>
              
              {/* NEW: Bulk Data Entry Shortcut (Orange) */}
              <Button asChild className="bg-gradient-to-r from-orange-500/30 to-amber-600/30 hover:from-orange-500/40 hover:to-amber-600/40 backdrop-blur-sm text-white border border-orange-400/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium">
                <Link href="/bulk-capture-enhanced">
                  <Zap className="h-4 w-4 mr-2" />
                  Bulk Entry
                </Link>
              </Button>
              
              {/* Utility Action - Refresh (White/Transparent) */}
              <Button 
                onClick={() => refetch()}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>

        {/* Smart Priority Notifications */}
        {notifications.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Priority Notifications</h2>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {notifications.map((notification) => (
                <Card key={notification.id} className={`relative overflow-hidden border-0 shadow-xl transition-all duration-300 hover:shadow-2xl transform hover:scale-[1.02] ${
                  notification.priority === 'high' ? 'bg-gradient-to-br from-red-500/10 to-orange-500/10' :
                  notification.priority === 'medium' ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10' :
                  'bg-gradient-to-br from-blue-500/10 to-indigo-500/10'
                }`}>
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    notification.priority === 'high' ? 'bg-gradient-to-r from-red-500 to-orange-600' :
                    notification.priority === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                    'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}></div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          notification.priority === 'high' ? 'bg-red-100 text-red-600' :
                          notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {notification.type === 'success' ? <Award className="h-4 w-4" /> :
                           notification.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> :
                           <Bell className="h-4 w-4" />}
                        </div>
                        <div>
                          <CardTitle className="text-sm font-semibold text-gray-800">{notification.title}</CardTitle>
                          <p className="text-xs text-gray-600 mt-1">{notification.time}</p>
                        </div>
                      </div>
                      <Badge variant={notification.priority === 'high' ? 'destructive' : notification.priority === 'medium' ? 'default' : 'secondary'} className="text-xs">
                        {notification.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Performance Metrics Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Business Performance</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Revenue Card */}
            <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white transform hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-100">Total Revenue</CardTitle>
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-white mb-2">
                  {formatCurrency(dashboardStats.totalRevenue)}
                </div>
                <div className="flex items-center text-sm text-green-100">
                  <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full">
                    <TrendingUp className="h-3 w-3" />
                    <span>+{getRevenueGrowth()}% from last month</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Outstanding Invoices Card */}
            <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 text-white transform hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-100">Outstanding</CardTitle>
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-white mb-2">
                  {formatCurrency(dashboardStats.outstandingInvoices)}
                </div>
                <div className="flex items-center text-sm text-orange-100">
                  <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full">
                    <Clock className="h-3 w-3" />
                    <span>Needs attention</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customers Card */}
            <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white transform hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-100">Active Customers</CardTitle>
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-white mb-2">{dashboardStats.totalCustomers}</div>
                <div className="flex items-center text-sm text-blue-100">
                  <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full">
                    <Star className="h-3 w-3" />
                    <span>Growing steadily</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estimates Card */}
            <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white transform hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-100">Pending Estimates</CardTitle>
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-white mb-2">{dashboardStats.pendingEstimates}</div>
                <div className="flex items-center text-sm text-purple-100">
                  <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full">
                    <Target className="h-3 w-3" />
                    <span>Awaiting response</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modular Widget System */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard Widgets</h2>
            <Button 
              onClick={() => setIsCustomizing(!isCustomizing)}
              variant={isCustomizing ? "default" : "outline"}
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              {isCustomizing ? "Done Customizing" : "Customize Layout"}
            </Button>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="finance">Finance</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Enhanced Chart Widget */}
                <div className="xl:col-span-2">
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-800">Revenue Trends</CardTitle>
                          <CardDescription>Monthly performance overview</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ProfitLossChart data={dashboardStats.profitLossData || []} />
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activities Widget */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800">Recent Activities</CardTitle>
                    <CardDescription>Latest business updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentActivities activities={dashboardStats.recentActivities || []} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sales" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800">Recent Invoices</CardTitle>
                    <CardDescription>Latest billing activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentInvoices invoices={dashboardStats.recentInvoices || []} />
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800">Sales Performance</CardTitle>
                    <CardDescription>Key sales metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Monthly Target</span>
                        <span className="font-medium text-gray-900">R50,000</span>
                      </div>
                      <Progress value={75} className="h-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Conversion Rate</span>
                        <span className="font-medium text-green-600">73%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Average Deal Size</span>
                        <span className="font-medium text-gray-900">R2,150</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="finance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800">Cash Flow</CardTitle>
                    <CardDescription>Financial health overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Inflow (This Month)</span>
                        <span className="font-medium text-green-600">+R45,230</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Outflow (This Month)</span>
                        <span className="font-medium text-red-600">-R32,150</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm font-medium text-gray-800">Net Cash Flow</span>
                        <span className="font-bold text-green-600">+R13,080</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800">Bank Accounts</CardTitle>
                    <CardDescription>Account balances overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Building className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">Business Current</div>
                            <div className="text-sm text-gray-600">****1234</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-800">R25,430</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Wallet className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">Savings Account</div>
                            <div className="text-sm text-gray-600">****5678</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-800">R12,750</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold text-gray-800">Financial Reports</CardTitle>
                        <CardDescription>P&L, Balance Sheet, Cash Flow</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                      <Link href="/financial-reports">
                        View Reports
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <PieChart className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold text-gray-800">Sales Analytics</CardTitle>
                        <CardDescription>Customer insights & trends</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                      <Link href="/business-reports">
                        View Analytics
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-indigo-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Target className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold text-gray-800">Performance KPIs</CardTitle>
                        <CardDescription>Key business metrics</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                      <Link href="/general-reports">
                        View KPIs
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Compliance & Alerts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Compliance Alerts</CardTitle>
              <CardDescription>Important compliance notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <ComplianceAlerts alerts={dashboardStats.complianceAlerts || []} />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Quick Actions</CardTitle>
              <CardDescription>Frequently used operations</CardDescription>
            </CardHeader>
            <CardContent>
              <ActionShortcuts />
            </CardContent>
          </Card>
        </div>

        {/* Onboarding Tooltip Wizard */}
        <TooltipWizard
          steps={onboardingSteps}
          isVisible={isWizardVisible}
          onComplete={completeOnboarding}
          onSkip={skipOnboarding}
        />
      </div>
    </div>
  );
}
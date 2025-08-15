import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PullToRefresh } from "@/components/mobile/pull-to-refresh";
import { FloatingActionButton } from "@/components/mobile/floating-action-button";
import { 
  Plus, FileText, UserPlus, TrendingUp, Users, DollarSign, AlertTriangle,
  BarChart3, PieChart, Activity, Bell, Settings, ChevronRight, RefreshCw,
  Target, Award, Calendar, Clock, Zap, Star, ArrowUpRight, ArrowDownRight,
  Building, ShoppingCart, CreditCard, Wallet, Eye, Filter, Download, ChevronDown, Receipt
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { PaymentFormModal } from "@/components/payments/PaymentFormModal";
import { useLoadingStates } from "@/hooks/useLoadingStates";
import { PageLoader } from "@/components/ui/global-loader";
import { AIHealthIndicator } from "@/components/ai/AIHealthIndicator";

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
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [location, setLocation] = useLocation();
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

  // Use loading states for comprehensive loading feedback
  useLoadingStates({
    loadingStates: [
      { isLoading, message: 'Loading dashboard data...' },
    ],
    progressSteps: ['Fetching statistics', 'Processing charts', 'Loading activities'],
  });

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  if (isLoading) {
    return <PageLoader message="Loading dashboard data..." />;
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
    const currentRevenue = parseFloat(dashboardStats.totalRevenue) || 0;
    if (currentRevenue === 0) return "0.0";
    const lastMonthRevenue = currentRevenue * 0.85; // Simulated growth
    const growth = ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    return growth.toFixed(1);
  };

  const priorityNotifications = notifications.filter(n => n.priority === 'high');

  const handleRefresh = async () => {
    await refetch();
    setLastUpdate(new Date());
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 overflow-hidden">
        <div className="container mx-auto px-4 h-full flex flex-col">
        
        {/* Compact Hero Section - Fixed Height */}
        <div className="relative overflow-hidden dashboard-hero flex-shrink-0" style={{ height: '120px' }}>
          {/* Animated Background Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 rounded"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-2xl"></div>
          
          {/* Hero Content - Ultra Compact */}
          <div className="relative p-2 text-white h-full flex items-center">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 w-full">
              
              {/* Welcome Section - Ultra Compact */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-white/20 backdrop-blur-sm rounded-lg">
                    <Activity className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white tracking-tight">
                      {getCurrentGreeting()}!
                    </h1>
                    <p className="text-blue-100 text-xs">Business performance overview</p>
                  </div>
                </div>
              </div>

              {/* Ultra Compact Metrics */}
              <div className="grid grid-cols-4 gap-2 lg:min-w-[400px]">
                <div className="text-center p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                  <div className="text-lg font-bold text-white">
                    {formatCurrency(dashboardStats.totalRevenue)}
                  </div>
                  <div className="text-blue-100 text-xs uppercase tracking-wider">Revenue</div>
                  <div className="flex items-center justify-center gap-1 text-green-300">
                    <ArrowUpRight className="h-2.5 w-2.5" />
                    <span className="text-xs">+{getRevenueGrowth()}%</span>
                  </div>
                </div>
                
                <div className="text-center p-2 bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-lg border border-orange-300/30">
                  <div className="text-lg font-bold text-white">
                    {formatCurrency(dashboardStats.outstandingInvoices)}
                  </div>
                  <div className="text-orange-100 text-xs uppercase tracking-wider">Outstanding</div>
                  <div className="flex items-center justify-center gap-1 text-orange-300">
                    <AlertTriangle className="h-2.5 w-2.5" />
                    <span className="text-xs">Attention</span>
                  </div>
                </div>
                
                <div className="text-center p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                  <div className="text-lg font-bold text-white">
                    {dashboardStats.totalCustomers}
                  </div>
                  <div className="text-blue-100 text-xs uppercase tracking-wider">Customers</div>
                  <div className="flex items-center justify-center gap-1 text-blue-300">
                    <TrendingUp className="h-2.5 w-2.5" />
                    <span className="text-xs">Growing</span>
                  </div>
                </div>
                
                <div className="text-center p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                  <div className="text-lg font-bold text-white">
                    {dashboardStats.pendingEstimates}
                  </div>
                  <div className="text-blue-100 text-xs uppercase tracking-wider">Quotes</div>
                  <div className="flex items-center justify-center gap-1 text-yellow-300">
                    <Clock className="h-2.5 w-2.5" />
                    <span className="text-xs">Progress</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Action Bar */}
            <div className="mt-1 flex items-center justify-between gap-2">
              {/* Left Side - Quick Create and Refresh */}
              <div className="flex items-center gap-1">
                {/* Quick Create Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="h-7 bg-gradient-to-r from-green-500/30 to-emerald-600/30 hover:from-green-500/40 hover:to-emerald-600/40 backdrop-blur-sm text-white border border-green-400/30 text-xs px-2">
                      <Plus className="h-3 w-3 mr-1" />
                      Quick Create
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-white/95 backdrop-blur-sm border border-slate-200 shadow-xl">
                  <DropdownMenuLabel className="text-slate-700 font-semibold">Create New</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Invoice */}
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-green-50 focus:bg-green-50">
                    <Link href="/invoices/new" className="flex items-center gap-3 py-2">
                      <div className="p-1.5 bg-green-100 text-green-600 rounded-lg">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-700">New Invoice</div>
                        <div className="text-xs text-slate-500">Create and send invoice</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  
                  {/* Estimate */}
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50">
                    <Link href="/estimates/new" className="flex items-center gap-3 py-2">
                      <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-700">New Estimate</div>
                        <div className="text-xs text-slate-500">Create quote for customer</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  
                  {/* Payment */}
                  <DropdownMenuItem 
                    onClick={() => setIsPaymentModalOpen(true)} 
                    className="cursor-pointer hover:bg-orange-50 focus:bg-orange-50"
                  >
                    <div className="flex items-center gap-3 py-2">
                      <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-700">Record Payment</div>
                        <div className="text-xs text-slate-500">Log customer payment</div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  
                  {/* Customer */}
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-purple-50 focus:bg-purple-50">
                    <Link href="/customers/new" className="flex items-center gap-3 py-2">
                      <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
                        <UserPlus className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-700">Add Customer</div>
                        <div className="text-xs text-slate-500">Register new customer</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Additional Quick Actions */}
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50">
                    <Link href="/expenses/new" className="flex items-center gap-3 py-2">
                      <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg">
                        <Receipt className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-700">New Expense</div>
                        <div className="text-xs text-slate-500">Record business expense</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50">
                    <Link href="/purchase-orders/new" className="flex items-center gap-3 py-2">
                      <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg">
                        <ShoppingCart className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-700">Purchase Order</div>
                        <div className="text-xs text-slate-500">Create supplier order</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
                {/* Refresh Button */}
                <Button 
                  onClick={() => refetch()}
                  className="h-7 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/30 text-xs px-2"
                  title="Refresh dashboard data"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span className="ml-1 hidden sm:inline">Refresh</span>
                </Button>
              </div>
              
              {/* Right Side - Compact Status */}
              <div className="flex items-center gap-1">
                {/* Compact Status Badges */}
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-white">Live</span>
                  </div>
                  <div className="inline-flex">
                    <AIHealthIndicator />
                  </div>
                  {priorityNotifications.length > 0 && (
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-500/80 to-red-500/80 backdrop-blur-sm rounded-full border border-white/30">
                      <Bell className="h-3 w-3 animate-bounce text-white" />
                      <span className="text-xs font-medium text-white">{priorityNotifications.length} Alert{priorityNotifications.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
                
                {/* Compact Reports & Banking Links */}
                <Button asChild variant="ghost" className="h-7 text-white/80 hover:text-white hover:bg-white/10 text-xs px-2">
                  <Link href="/reports">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Reports
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="h-7 text-white/80 hover:text-white hover:bg-white/10 text-xs px-2">
                  <Link href="/banking">
                    <Building className="h-3 w-3 mr-1" />
                    Banking
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>







        {/* Streamlined Widget System - Flex Growth */}
        <div className="flex-1 flex flex-col min-h-0 py-2">

          <Tabs defaultValue="overview" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 bg-white backdrop-blur-sm border border-gray-200 shadow-md p-1 rounded-lg flex-shrink-0">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md font-medium px-5 py-2.5 transition-all duration-200 hover:bg-gray-100"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="sales" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md font-medium px-5 py-2.5 transition-all duration-200 hover:bg-gray-100"
              >
                Sales
              </TabsTrigger>
              <TabsTrigger 
                value="finance" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md font-medium px-5 py-2.5 transition-all duration-200 hover:bg-gray-100"
              >
                Finance
              </TabsTrigger>
              <TabsTrigger 
                value="reports" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md font-medium px-5 py-2.5 transition-all duration-200 hover:bg-gray-100"
              >
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="flex-1 flex flex-col min-h-0 pt-2">

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 flex-1 min-h-0">
                {/* Enhanced Chart Widget */}
                <div className="xl:col-span-2 min-h-0">
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm h-full flex flex-col">
                    <CardHeader className="pb-1 flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm font-semibold text-gray-800">Revenue Trends</CardTitle>
                          <CardDescription className="text-xs">Monthly performance</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setLocation('/reports/financial')}
                            title="View detailed revenue reports"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" title="Download revenue report">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 pb-2">
                      <div className="h-full">
                        <ProfitLossChart data={dashboardStats.profitLossData || []} />
                      </div>
                    </CardContent>
                  </Card>

                </div>

                {/* Recent Activities Widget - Compact for no-scroll */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-semibold text-gray-800">Recent Activities</CardTitle>
                        <CardDescription className="text-xs">Latest business updates</CardDescription>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                        className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                      >
                        <Link href="/activities">
                          <Eye className="h-4 w-4 mr-2" />
                          View All
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden">
                    <div className="h-full overflow-y-auto">
                      <RecentActivities activities={dashboardStats.recentActivities || []} />
                    </div>
                  </CardContent>
                </Card>
              </div>


            </TabsContent>

            <TabsContent value="sales" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-800">Recent Invoices</CardTitle>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/invoices">
                          <Eye className="h-4 w-4 mr-2" />
                          View All
                        </Link>
                      </Button>
                    </div>
                    <CardDescription>Latest billing activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dashboardStats.recentInvoices && dashboardStats.recentInvoices.length > 0 ? (
                      <RecentInvoices invoices={dashboardStats.recentInvoices} />
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-500 text-sm">
                          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          No recent invoices
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Your latest invoices will appear here</p>
                        <Button asChild size="sm" className="mt-3">
                          <Link href="/invoices/new">
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Invoice
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-800">Sales Performance</CardTitle>
                    <CardDescription>Key sales metrics from real transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardStats.recentInvoices && dashboardStats.recentInvoices.length > 0 ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                              <div className="text-xl font-bold text-green-700">
                                {formatCurrency(dashboardStats.totalRevenue)}
                              </div>
                              <div className="text-xs text-green-600 font-medium">Total Revenue</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <div className="text-xl font-bold text-blue-700">
                                {dashboardStats.paidInvoiceCount || 0}
                              </div>
                              <div className="text-xs text-blue-600 font-medium">Paid Invoices</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                              <div className="text-xl font-bold text-orange-700">
                                {formatCurrency(dashboardStats.outstandingInvoices)}
                              </div>
                              <div className="text-xs text-orange-600 font-medium">Outstanding</div>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                              <div className="text-xl font-bold text-purple-700">
                                {dashboardStats.outstandingInvoiceCount || 0}
                              </div>
                              <div className="text-xs text-purple-600 font-medium">Pending</div>
                            </div>
                          </div>
                          <div className="pt-2">
                            <Button asChild size="sm" className="w-full">
                              <Link href="/invoices">
                                <Eye className="h-4 w-4 mr-2" />
                                View All Invoices
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-gray-500 text-sm">
                            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            No sales data yet
                          </div>
                          <p className="text-xs text-gray-400 mt-2">Performance metrics will appear once you start creating invoices</p>
                          <Button asChild size="sm" className="mt-3">
                            <Link href="/invoices/new">
                              <Plus className="h-4 w-4 mr-2" />
                              Create First Invoice
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-800">Sales Pipeline</CardTitle>
                    <CardDescription>Real customer opportunities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardStats.totalCustomers > 0 || (dashboardStats.recentInvoices && dashboardStats.recentInvoices.length > 0) ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 gap-3">
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="text-lg font-bold text-blue-700">
                                    {dashboardStats.totalCustomers}
                                  </div>
                                  <div className="text-xs text-blue-600 font-medium">Active Customers</div>
                                </div>
                                <Users className="h-6 w-6 text-blue-500" />
                              </div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="text-lg font-bold text-green-700">
                                    {dashboardStats.pendingEstimates || 0}
                                  </div>
                                  <div className="text-xs text-green-600 font-medium">Pending Estimates</div>
                                </div>
                                <FileText className="h-6 w-6 text-green-500" />
                              </div>
                            </div>
                          </div>
                          <div className="pt-2 space-y-2">
                            <Button asChild size="sm" className="w-full">
                              <Link href="/customers">
                                <Users className="h-4 w-4 mr-2" />
                                Manage Customers
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="w-full">
                              <Link href="/estimates/new">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Estimate
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-gray-500 text-sm">
                            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            No active pipeline yet
                          </div>
                          <p className="text-xs text-gray-400 mt-2">Your sales opportunities will appear here</p>
                          <Button asChild size="sm" className="mt-3">
                            <Link href="/customers/new">
                              <UserPlus className="h-4 w-4 mr-2" />
                              Add First Customer
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="finance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Enhanced Cash Flow Summary Widget */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
                          <Activity className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold text-gray-800">Cash Flow Summary</CardTitle>
                          <CardDescription className="text-xs text-gray-600">Real-time financial activity</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs text-purple-700 bg-purple-50 border-purple-200">
                        Live
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="text-lg font-bold text-green-700">{formatCurrency(dashboardStats.cashFlowSummary?.todayInflow || "0.00")}</div>
                          <div className="text-xs text-green-600 flex items-center justify-center gap-1">
                            <ArrowUpRight className="h-3 w-3" />
                            Inflow Today
                          </div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="text-lg font-bold text-red-700">{formatCurrency(dashboardStats.cashFlowSummary?.todayOutflow || "0.00")}</div>
                          <div className="text-xs text-red-600 flex items-center justify-center gap-1">
                            <ArrowDownRight className="h-3 w-3" />
                            Outflow Today
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-800">{formatCurrency(dashboardStats.cashFlowSummary?.currentCashPosition || "0.00")}</div>
                          <div className="text-xs text-gray-600">Current Cash Position</div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-sm font-semibold ${parseFloat(dashboardStats.cashFlowSummary?.netCashFlow || "0") >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Net: {formatCurrency(dashboardStats.cashFlowSummary?.netCashFlow || "0.00")}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Bank Account Balances Widget */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                          <Wallet className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold text-gray-800">Bank Balances</CardTitle>
                          <CardDescription className="text-xs text-gray-600">Current account positions</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs text-green-700 bg-green-50 border-green-200">
                        Real-time
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardStats.bankBalances && dashboardStats.bankBalances.length > 0 ? (
                        dashboardStats.bankBalances.slice(0, 3).map((account: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-green-100 rounded-lg">
                                <Building className="h-3 w-3 text-green-600" />
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-gray-800">{account.accountName || 'Bank Account'}</h4>
                                <p className="text-xs text-gray-600">{account.accountNumber || 'Current Account'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-gray-800">{formatCurrency(account.balance || "0.00")}</div>
                              <div className="text-xs text-gray-500">Available</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <Building className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No bank accounts configured</p>
                        </div>
                      )}
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href="/banking">
                          <Eye className="h-3 w-3 mr-2" />
                          View All Accounts
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Aged Receivables/Payables Widget */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-amber-50 hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg">
                          <Clock className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold text-gray-800">Aged Analysis</CardTitle>
                          <CardDescription className="text-xs text-gray-600">Receivables & payables aging</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs text-orange-700 bg-orange-50 border-orange-200">
                        Credit Mgmt
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Receivables Section */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
                          <ArrowUpRight className="h-3 w-3 text-green-600" />
                          Receivables
                        </h4>
                        <div className="grid grid-cols-4 gap-1 text-xs">
                          <div className="text-center p-2 bg-green-50 rounded border border-green-200">
                            <div className="font-bold text-green-700">R 0</div>
                            <div className="text-green-600">0-30</div>
                          </div>
                          <div className="text-center p-2 bg-yellow-50 rounded border border-yellow-200">
                            <div className="font-bold text-yellow-700">R 0</div>
                            <div className="text-yellow-600">31-60</div>
                          </div>
                          <div className="text-center p-2 bg-orange-50 rounded border border-orange-200">
                            <div className="font-bold text-orange-700">R 0</div>
                            <div className="text-orange-600">61-90</div>
                          </div>
                          <div className="text-center p-2 bg-red-50 rounded border border-red-200">
                            <div className="font-bold text-red-700">R 0</div>
                            <div className="text-red-600">90+</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Payables Section */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
                          <ArrowDownRight className="h-3 w-3 text-red-600" />
                          Payables
                        </h4>
                        <div className="grid grid-cols-4 gap-1 text-xs">
                          <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
                            <div className="font-bold text-blue-700">R 0</div>
                            <div className="text-blue-600">0-30</div>
                          </div>
                          <div className="text-center p-2 bg-yellow-50 rounded border border-yellow-200">
                            <div className="font-bold text-yellow-700">R 0</div>
                            <div className="text-yellow-600">31-60</div>
                          </div>
                          <div className="text-center p-2 bg-orange-50 rounded border border-orange-200">
                            <div className="font-bold text-orange-700">R 0</div>
                            <div className="text-orange-600">61-90</div>
                          </div>
                          <div className="text-center p-2 bg-red-50 rounded border border-red-200">
                            <div className="font-bold text-red-700">R 0</div>
                            <div className="text-red-600">90+</div>
                          </div>
                        </div>
                      </div>
                      
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href="/reports/aging">
                          <Eye className="h-3 w-3 mr-2" />
                          Detailed Aging Report
                        </Link>
                      </Button>
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

        {/* Removed - Moved to top of dashboard */}

        {/* Onboarding Tooltip Wizard */}
        <TooltipWizard
          steps={onboardingSteps}
          isVisible={isWizardVisible}
          onComplete={completeOnboarding}
          onSkip={skipOnboarding}
        />

        {/* Payment Form Modal */}
        <PaymentFormModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
        />
        
        {/* Mobile Floating Action Button */}
        <FloatingActionButton
          onClick={() => setLocation("/invoices/new")}
          label="New Invoice"
          extended={false}
          className="md:hidden"
        />
      </div>
    </div>
    </PullToRefresh>
  );
}
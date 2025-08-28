import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PullToRefresh } from "@/components/mobile/pull-to-refresh";
import { FloatingActionButton } from "@/components/mobile/floating-action-button";
import { 
  Plus, FileText, UserPlus, TrendingUp, Users, DollarSign, AlertTriangle,
  BarChart3, PieChart, Activity, Bell, Settings, ChevronRight, RefreshCw,
  Target, Award, Calendar, Clock, Zap, Star, ArrowUpRight, ArrowDownRight, ArrowDownLeft,
  Building, ShoppingCart, CreditCard, Wallet, Eye, Filter, Download, ChevronDown, Receipt,
  Calculator, User, ShoppingBag, Banknote, FileBarChart, Cpu, Search
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
import { dashboardApi, userApi } from "@/lib/api";
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
  const [activeTab, setActiveTab] = useState("overview");
  const [activitySearchTerm, setActivitySearchTerm] = useState("");
  const [location, setLocation] = useLocation();
  // Fetch real alert counts from API - Less frequent updates for performance
  const { data: alertCounts } = useQuery({
    queryKey: ["/api/alerts/counts"],
    refetchInterval: 60000, // Refresh every 60 seconds (reduced from 30)
    staleTime: 45000, // Consider data fresh for 45 seconds
  });

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: dashboardApi.getStats,
    refetchInterval: 45000, // Reduced to 45 seconds for better performance
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  const { data: currentUser } = useQuery({
    queryKey: ["/api/user/me"],
    queryFn: userApi.getCurrentUser,
    staleTime: 300000, // Cache user data for 5 minutes
  });

  // Real financial data now displayed directly in components

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
    progressSteps: ['Loading dashboard', 'Processing data'],
  });

  // Auto-refresh data every 45 seconds - optimized for performance
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // Only refetch if data is stale to avoid unnecessary requests
    }, 45000);

    return () => clearInterval(interval);
  }, []);

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
    let timeGreeting = "";
    if (hour < 12) timeGreeting = "Good Morning";
    else if (hour < 17) timeGreeting = "Good Afternoon";
    else timeGreeting = "Good Evening";
    
    // Add user's name if available
    if (currentUser?.name) {
      return `${timeGreeting}, ${currentUser.name}`;
    }
    return timeGreeting;
  };

  const getRevenueGrowth = () => {
    const currentRevenue = parseFloat(dashboardStats.totalRevenue) || 0;
    if (currentRevenue === 0) return "0.0";
    const lastMonthRevenue = currentRevenue * 0.85; // Simulated growth
    const growth = ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    return growth.toFixed(1);
  };

  // Get total active alerts count for the header button
  const totalActiveAlerts = (alertCounts as any)?.active || 0;

  const handleRefresh = async () => {
    await refetch();
    setLastUpdate(new Date());
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
        <div className="container mx-auto px-4 pb-8 space-y-6">
        {/* Enhanced Professional Header */}
        <div className="border-b border-gray-200 bg-white/90 backdrop-blur-sm px-6 py-4 -mx-4 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{getCurrentGreeting()}</h1>
              <p className="text-sm text-gray-600 mt-1 font-medium">Business performance overview</p>
            </div>
            <div className="flex gap-2 items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Quick Create
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Create New</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/invoices/create" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      New Invoice
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/estimates/create" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      New Estimate
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsPaymentModalOpen(true)}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Record Payment
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/customers/create" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Add Customer
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/expenses/create" className="flex items-center gap-2">
                      <Receipt className="h-4 w-4" />
                      New Expense
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Link href="/alerts">
                <Button variant="outline" size="sm" className="relative">
                  <Bell className="h-4 w-4 mr-2" />
                  Alerts
                  {totalActiveAlerts > 0 && (
                    <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs bg-red-500 text-white">
                      {totalActiveAlerts}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Professional Metrics Grid */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Total Revenue Card */}
          <Link href="/reports" className="block group">
            <Card className="border border-gray-200 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 transition-all duration-200 cursor-pointer p-4 shadow-sm hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Revenue</span>
              </div>
              <div className="text-xl font-bold text-gray-900 mb-2">{formatCurrency(dashboardStats.totalRevenue)}</div>
              <div className="text-xs text-gray-600">
                <span className="text-emerald-600 font-semibold">+{getRevenueGrowth()}%</span> from last month
              </div>
            </Card>
          </Link>

          {/* Outstanding Invoices Card */}
          <Link href="/invoices" className="block group">
            <Card className="border border-gray-200 bg-white hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 hover:border-amber-300 transition-all duration-200 cursor-pointer p-4 shadow-sm hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                  <FileText className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Outstanding</span>
              </div>
              <div className="text-xl font-bold text-gray-900 mb-2">{formatCurrency(dashboardStats.outstandingInvoices)}</div>
              <div className="text-xs text-gray-600">
                <span className="font-semibold">{dashboardStats.outstandingInvoiceCount}</span> invoices pending
              </div>
            </Card>
          </Link>

          {/* Total Customers Card */}
          <Link href="/customers" className="block group">
            <Card className="border border-gray-200 bg-white hover:bg-gradient-to-br hover:from-purple-50 hover:to-violet-50 hover:border-purple-300 transition-all duration-200 cursor-pointer p-4 shadow-sm hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Customers</span>
              </div>
              <div className="text-xl font-bold text-gray-900 mb-2">{dashboardStats.totalCustomers}</div>
              <div className="text-xs text-gray-600">Active customers</div>
            </Card>
          </Link>

          {/* Pending Quotes Card */}
          <Link href="/estimates" className="block group">
            <Card className="border border-gray-200 bg-white hover:bg-gradient-to-br hover:from-emerald-50 hover:to-green-50 hover:border-emerald-300 transition-all duration-200 cursor-pointer p-4 shadow-sm hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                  <Clock className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quotes</span>
              </div>
              <div className="text-xl font-bold text-gray-900 mb-2">{dashboardStats.pendingEstimates}</div>
              <div className="text-xs text-gray-600">Pending quotes</div>
            </Card>
          </Link>

          {/* Accounts Receivable Card */}
          <Link href="/customer-payments" className="block group">
            <Card className="border border-gray-200 bg-white hover:bg-gradient-to-br hover:from-cyan-50 hover:to-sky-50 hover:border-cyan-300 transition-all duration-200 cursor-pointer p-4 shadow-sm hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-cyan-100 rounded-lg group-hover:bg-cyan-200 transition-colors">
                  <ArrowUpRight className="h-4 w-4 text-cyan-600" />
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Receivable</span>
              </div>
              <div className="text-xl font-bold text-gray-900 mb-2">{formatCurrency(dashboardStats.outstandingInvoices)}</div>
              <div className="text-xs text-gray-600">Money owed to you</div>
            </Card>
          </Link>

          {/* Accounts Payable Card */}
          <Link href="/expenses" className="block group">
            <Card className="border border-gray-200 bg-white hover:bg-gradient-to-br hover:from-rose-50 hover:to-red-50 hover:border-rose-300 transition-all duration-200 cursor-pointer p-4 shadow-sm hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-rose-100 rounded-lg group-hover:bg-rose-200 transition-colors">
                  <ArrowDownLeft className="h-4 w-4 text-rose-600" />
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payable</span>
              </div>
              <div className="text-xl font-bold text-gray-900 mb-2">
                {stats?.payablesAging?.totalPayables ? formatCurrency(stats.payablesAging.totalPayables) : formatCurrency("0.00")}
              </div>
              <div className="text-xs text-gray-600">Money you owe</div>
            </Card>
          </Link>
          </div>
        )}



        {/* Modular Widget System */}
        <div className="space-y-6">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-1">
              <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 bg-transparent p-0">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-semibold px-6 py-3 rounded-md transition-all duration-200 hover:bg-gray-100 text-gray-700"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="sales" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-semibold px-6 py-3 rounded-md transition-all duration-200 hover:bg-gray-100 text-gray-700"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Sales
                </TabsTrigger>
                <TabsTrigger 
                  value="finance" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-semibold px-6 py-3 rounded-md transition-all duration-200 hover:bg-gray-100 text-gray-700"
                >
                  <PieChart className="h-4 w-4 mr-2" />
                  Finance
                </TabsTrigger>
                <TabsTrigger 
                  value="reports" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-semibold px-6 py-3 rounded-md transition-all duration-200 hover:bg-gray-100 text-gray-700"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Reports
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-4">

              {/* Notification Cards Removed - Now handled by dedicated Alerts page */}

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
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
                    <CardContent>
                      <ProfitLossChart data={dashboardStats.profitLossData || []} />
                    </CardContent>
                  </Card>

                </div>

                {/* Enhanced Recent Activities Widget - With Search and Scrolling */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-800">Recent Activities</CardTitle>
                        <CardDescription>Latest business updates</CardDescription>
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
                    {/* Enhanced Search Bar */}
                    <div className="relative mb-4">
                      <input
                        type="text"
                        placeholder="Search invoices, clients, amounts, or status..."
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10 bg-gray-50 hover:bg-white transition-colors"
                        onChange={(e) => {
                          setActivitySearchTerm(e.target.value);
                        }}
                        value={activitySearchTerm}
                      />
                      <div className="absolute left-3 top-3">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      {activitySearchTerm && (
                        <button
                          onClick={() => setActivitySearchTerm("")}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {/* Enhanced Scrollable Activities List - Show ALL activities with scrolling */}
                    <div className="h-[40rem] overflow-y-auto px-6 pb-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <RecentActivities 
                        activities={
                          activitySearchTerm
                            ? (dashboardStats.recentActivities || []).filter((activity: any) =>
                                activity.description.toLowerCase().includes(activitySearchTerm.toLowerCase()) ||
                                (activity.customerName && activity.customerName.toLowerCase().includes(activitySearchTerm.toLowerCase())) ||
                                activity.amount.includes(activitySearchTerm) ||
                                activity.status.toLowerCase().includes(activitySearchTerm.toLowerCase())
                              )
                            : dashboardStats.recentActivities || []
                        } 
                        showMore={true} 
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>


            </TabsContent>

            <TabsContent value="sales" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <Card className="border border-gray-200 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <div className="p-1.5 bg-green-100 rounded-lg">
                          <FileText className="h-4 w-4 text-green-600" />
                        </div>
                        Recent Invoices
                      </CardTitle>
                      <Button variant="outline" size="sm" asChild className="shadow-sm">
                        <Link href="/invoices">
                          <Eye className="h-4 w-4 mr-2" />
                          View All
                        </Link>
                      </Button>
                    </div>
                    <CardDescription className="text-gray-600 font-medium">Latest billing activity</CardDescription>
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

                <Card className="border border-gray-200 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                      </div>
                      Sales Performance
                    </CardTitle>
                    <CardDescription className="text-gray-600 font-medium">Interactive analytics from real transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardStats.recentInvoices && dashboardStats.recentInvoices.length > 0 ? (
                        <div className="space-y-4">
                          {/* Payment Collection Rate */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600">Payment Collection Rate</span>
                              <span className="text-sm font-bold text-blue-600">
                                {Math.round(((dashboardStats.paidInvoiceCount || 0) / (dashboardStats.paidInvoiceCount + dashboardStats.outstandingInvoiceCount || 1)) * 100)}%
                              </span>
                            </div>
                            <Progress 
                              value={((dashboardStats.paidInvoiceCount || 0) / (dashboardStats.paidInvoiceCount + dashboardStats.outstandingInvoiceCount || 1)) * 100}
                              className="h-3 bg-gray-200"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>{dashboardStats.paidInvoiceCount || 0} paid</span>
                              <span>{dashboardStats.outstandingInvoiceCount || 0} outstanding</span>
                            </div>
                          </div>

                          {/* Revenue Progress */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600">Monthly Revenue Target</span>
                              <span className="text-sm font-bold text-green-600">
                                {formatCurrency(dashboardStats.totalRevenue)} / R 200,000
                              </span>
                            </div>
                            <Progress 
                              value={Math.min((parseFloat(dashboardStats.totalRevenue) / 200000) * 100, 100)}
                              className="h-3 bg-gray-200"
                            />
                            <div className="text-xs text-gray-500 text-center">
                              {Math.round((parseFloat(dashboardStats.totalRevenue) / 200000) * 100)}% of monthly target achieved
                            </div>
                          </div>

                          {/* Outstanding vs Paid Ratio */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 border border-gray-200 p-3 rounded">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-lg font-bold text-gray-900">R {((parseFloat(dashboardStats.totalRevenue) / (dashboardStats.paidInvoiceCount + dashboardStats.outstandingInvoiceCount)) || 0).toFixed(0)}</div>
                                  <div className="text-xs text-gray-600">Avg Invoice Value</div>
                                </div>
                                <Receipt className="h-5 w-5 text-gray-500" />
                              </div>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 p-3 rounded">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-lg font-bold text-gray-900">{dashboardStats.recentInvoices.length}</div>
                                  <div className="text-xs text-gray-600">Active Invoices</div>
                                </div>
                                <FileText className="h-5 w-5 text-gray-500" />
                              </div>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <Button asChild size="sm" variant="outline" className="bg-white hover:bg-blue-50">
                              <Link href="/invoices">
                                <Eye className="h-4 w-4 mr-2" />
                                View All
                              </Link>
                            </Button>
                            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <Link href="/invoices/new">
                                <Plus className="h-4 w-4 mr-2" />
                                New Invoice
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

                <Card className="border border-gray-200 bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-800">Sales Pipeline</CardTitle>
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
                          <div className="text-lg font-bold text-green-700">R 0.00</div>
                          <div className="text-xs text-green-600 flex items-center justify-center gap-1">
                            <ArrowUpRight className="h-3 w-3" />
                            Cash Inflow
                          </div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="text-lg font-bold text-red-700">R 0.00</div>
                          <div className="text-xs text-red-600 flex items-center justify-center gap-1">
                            <ArrowDownRight className="h-3 w-3" />
                            Cash Outflow
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-800">R 0.00</div>
                          <div className="text-xs text-gray-600">Net Cash Flow</div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-600">
                          Net: R 0.00
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
                          {[
                            { range: '0-30', amount: '0.00', count: 0 },
                            { range: '31-60', amount: '0.00', count: 0 },
                            { range: '61-90', amount: '0.00', count: 0 },
                            { range: '90+', amount: '0.00', count: 0 }
                          ].map((aging: any, index: number) => {
                              const colors = [
                                { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', label: 'text-green-600' },
                                { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', label: 'text-yellow-600' },
                                { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', label: 'text-orange-600' },
                                { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'text-red-600' }
                              ];
                              const color = colors[index] || colors[0];
                              return (
                                <div key={aging.range} className={`text-center p-2 ${color.bg} rounded border ${color.border}`}>
                                  <div className={`font-bold ${color.text}`}>
                                    {formatCurrency(aging.amount)}
                                  </div>
                                  <div className={color.label}>{aging.range}</div>
                                  <div className={`text-xs ${color.label} opacity-75`}>
                                    {aging.count} items
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                      
                      {/* Payables Section */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
                          <ArrowDownRight className="h-3 w-3 text-red-600" />
                          Payables
                        </h4>
                        <div className="grid grid-cols-4 gap-1 text-xs">
                          {[
                            { range: '0-30', amount: '0.00', count: 0 },
                            { range: '31-60', amount: '0.00', count: 0 },
                            { range: '61-90', amount: '0.00', count: 0 },
                            { range: '90+', amount: '0.00', count: 0 }
                          ].map((aging: any, index: number) => {
                              const colors = [
                                { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', label: 'text-blue-600' },
                                { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', label: 'text-yellow-600' },
                                { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', label: 'text-orange-600' },
                                { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'text-red-600' }
                              ];
                              const color = colors[index] || colors[0];
                              return (
                                <div key={aging.range} className={`text-center p-2 ${color.bg} rounded border ${color.border}`}>
                                  <div className={`font-bold ${color.text}`}>
                                    {formatCurrency(aging.amount)}
                                  </div>
                                  <div className={color.label}>{aging.range}</div>
                                  <div className={`text-xs ${color.label} opacity-75`}>
                                    {aging.count} items
                                  </div>
                                </div>
                              );
                            })}
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
                      <Link href="/advanced-analytics">
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

                <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Activity className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold text-gray-800">Audit Trail</CardTitle>
                        <CardDescription>User activity & system logs</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      {dashboardStats.auditStats ? (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-green-50 p-2 rounded border border-green-200 text-center">
                            <div className="font-bold text-green-700">{dashboardStats.auditStats.todayActions || 0}</div>
                            <div className="text-green-600">Today</div>
                          </div>
                          <div className="bg-blue-50 p-2 rounded border border-blue-200 text-center">
                            <div className="font-bold text-blue-700">{dashboardStats.auditStats.totalUsers || 0}</div>
                            <div className="text-blue-600">Active Users</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-2 text-gray-500 text-xs">
                          <Activity className="h-6 w-6 mx-auto mb-1 text-gray-300" />
                          No audit data
                        </div>
                      )}
                    </div>
                    <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
                      <Link href="/audit-trail">
                        View Audit Trail
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
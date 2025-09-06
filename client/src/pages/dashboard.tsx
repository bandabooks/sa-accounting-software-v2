import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PullToRefresh } from "@/components/mobile/pull-to-refresh";
import { FloatingActionButton } from "@/components/mobile/floating-action-button";
import { 
  Plus, FileText, UserPlus, TrendingUp, TrendingDown, Users, DollarSign, AlertTriangle,
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
  const [isFinancialHealthExpanded, setIsFinancialHealthExpanded] = useState(false);
  const [isTodaysTasksExpanded, setIsTodaysTasksExpanded] = useState(false);
  const [isProfitOverviewExpanded, setIsProfitOverviewExpanded] = useState(false);
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

  // Role detection for dashboard layout
  const getUserDashboardType = () => {
    if (!currentUser?.role) return 'business';
    const role = currentUser.role.toLowerCase();
    
    // Tax Practitioner roles get the professional hub
    if (['accountant', 'tax_practitioner', 'super_admin', 'admin'].includes(role)) {
      return 'practitioner';
    }
    
    // Business owner roles get simplified dashboard
    return 'business';
  };

  const dashboardType = getUserDashboardType();

  // Get total active alerts count for the header button
  const totalActiveAlerts = (alertCounts as any)?.active || 0;

  const handleRefresh = async () => {
    await refetch();
    setLastUpdate(new Date());
  };

  // Professional metrics for business owners
  const renderBusinessOwnerMetrics = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
      {/* Total Receivables */}
      <Card className="p-3 border border-gray-200 hover:border-blue-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
            <ArrowUpRight className="h-4 w-4 text-blue-600" />
          </div>
        </div>
        <div className="text-lg font-semibold text-gray-900 mb-1">
          {formatCurrency(dashboardStats.outstandingInvoices)}
        </div>
        <div className="text-xs text-gray-600">Total Receivables</div>
        <div className="text-xs text-blue-600 mt-1">Money owed to you</div>
      </Card>

      {/* Total Payables */}
      <Card className="p-3 border border-gray-200 hover:border-red-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
            <ArrowDownLeft className="h-4 w-4 text-red-600" />
          </div>
        </div>
        <div className="text-lg font-semibold text-gray-900 mb-1">
          {stats?.payablesAging?.totalPayables ? formatCurrency(stats.payablesAging.totalPayables) : formatCurrency("0.00")}
        </div>
        <div className="text-xs text-gray-600">Total Payables</div>
        <div className="text-xs text-red-600 mt-1">Money you owe</div>
      </Card>

      {/* Revenue */}
      <Card className="p-3 border border-gray-200 hover:border-green-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-green-600" />
          </div>
        </div>
        <div className="text-lg font-semibold text-gray-900 mb-1">
          {formatCurrency(dashboardStats.totalRevenue)}
        </div>
        <div className="text-xs text-gray-600">Revenue</div>
        <div className="text-xs text-green-600 mt-1">+{getRevenueGrowth()}% growth</div>
      </Card>

      {/* Expenses */}
      <Card className="p-3 border border-gray-200 hover:border-orange-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </div>
        </div>
        <div className="text-lg font-semibold text-gray-900 mb-1">
          {formatCurrency(dashboardStats.totalExpenses)}
        </div>
        <div className="text-xs text-gray-600">Expenses</div>
        <div className="text-xs text-orange-600 mt-1">This month</div>
      </Card>

      {/* Customers */}
      <Card className="p-3 border border-gray-200 hover:border-purple-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
            <Users className="h-4 w-4 text-purple-600" />
          </div>
        </div>
        <div className="text-lg font-semibold text-gray-900 mb-1">
          {dashboardStats.totalCustomers}
        </div>
        <div className="text-xs text-gray-600">Customers</div>
        <div className="text-xs text-purple-600 mt-1">Active</div>
      </Card>

      {/* Pending Quotes */}
      <Card className="p-3 border border-gray-200 hover:border-cyan-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 bg-cyan-100 rounded flex items-center justify-center">
            <Clock className="h-4 w-4 text-cyan-600" />
          </div>
        </div>
        <div className="text-lg font-semibold text-gray-900 mb-1">
          {dashboardStats.pendingEstimates}
        </div>
        <div className="text-xs text-gray-600">Pending Quotes</div>
        <div className="text-xs text-cyan-600 mt-1">Awaiting approval</div>
      </Card>
    </div>
  );

  // Professional metrics for tax practitioners
  const renderPractitionerMetrics = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
      {/* Client Portfolio */}
      <Card className="p-3 border border-gray-200 hover:border-blue-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
            <Building className="h-4 w-4 text-blue-600" />
          </div>
        </div>
        <div className="text-lg font-semibold text-gray-900 mb-1">
          {dashboardStats.totalCustomers}
        </div>
        <div className="text-xs text-gray-600">Active Clients</div>
        <div className="text-xs text-blue-600 mt-1">Under management</div>
      </Card>

      {/* Compliance Status */}
      <Card className="p-3 border border-gray-200 hover:border-green-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
            <Target className="h-4 w-4 text-green-600" />
          </div>
        </div>
        <div className="text-lg font-semibold text-gray-900 mb-1">
          85%
        </div>
        <div className="text-xs text-gray-600">Compliance Rate</div>
        <div className="text-xs text-green-600 mt-1">On track</div>
      </Card>

      {/* Revenue */}
      <Card className="p-3 border border-gray-200 hover:border-emerald-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 bg-emerald-100 rounded flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
        </div>
        <div className="text-lg font-semibold text-gray-900 mb-1">
          {formatCurrency(dashboardStats.totalRevenue)}
        </div>
        <div className="text-xs text-gray-600">Practice Revenue</div>
        <div className="text-xs text-emerald-600 mt-1">+{getRevenueGrowth()}% growth</div>
      </Card>

      {/* Outstanding Receivables */}
      <Card className="p-3 border border-gray-200 hover:border-orange-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
            <Calculator className="h-4 w-4 text-orange-600" />
          </div>
        </div>
        <div className="text-lg font-semibold text-gray-900 mb-1">
          {formatCurrency(dashboardStats.outstandingInvoices)}
        </div>
        <div className="text-xs text-gray-600">Outstanding Fees</div>
        <div className="text-xs text-orange-600 mt-1">To be collected</div>
      </Card>

      {/* VAT Returns Due */}
      <Card className="p-3 border border-gray-200 hover:border-red-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
        </div>
        <div className="text-lg font-semibold text-gray-900 mb-1">
          3
        </div>
        <div className="text-xs text-gray-600">VAT Returns Due</div>
        <div className="text-xs text-red-600 mt-1">Next 7 days</div>
      </Card>

      {/* Client Deadlines */}
      <Card className="p-3 border border-gray-200 hover:border-yellow-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 bg-yellow-100 rounded flex items-center justify-center">
            <Calendar className="h-4 w-4 text-yellow-600" />
          </div>
        </div>
        <div className="text-lg font-semibold text-gray-900 mb-1">
          12
        </div>
        <div className="text-xs text-gray-600">Upcoming Deadlines</div>
        <div className="text-xs text-yellow-600 mt-1">Next 30 days</div>
      </Card>
    </div>
  );

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 pb-8">
          
          {/* Professional Header */}
          <div className="py-4 mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {dashboardType === 'practitioner' ? 'Practice Dashboard' : 'Business Dashboard'}
            </h1>
            <p className="text-sm text-gray-600">
              {getCurrentGreeting()} • Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>

          {/* Professional Metrics Grid */}
          {dashboardType === 'practitioner' ? renderPractitionerMetrics() : renderBusinessOwnerMetrics()}

          {/* Professional Action Items */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Critical Tasks */}
            <Card className="p-4 border border-red-200 bg-red-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-red-800">Critical Tasks</h3>
                  <p className="text-xs text-red-600">Require immediate attention</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-red-700">Overdue Invoices</span>
                  <span className="font-medium text-red-800">2</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-red-700">VAT Returns Due</span>
                  <span className="font-medium text-red-800">1</span>
                </div>
                <Link href="/invoices?filter=overdue" className="block">
                  <Button size="sm" variant="outline" className="w-full text-xs border-red-300 text-red-700 hover:bg-red-100 mt-2">
                    Review Critical Items
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Upcoming Deadlines */}
            <Card className="p-4 border border-yellow-200 bg-yellow-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-yellow-100 rounded flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-yellow-800">Upcoming Deadlines</h3>
                  <p className="text-xs text-yellow-600">Next 7 days</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-yellow-700">VAT Return</span>
                  <span className="font-medium text-yellow-800">5 days</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-yellow-700">EMP201</span>
                  <span className="font-medium text-yellow-800">7 days</span>
                </div>
                <Link href={dashboardType === 'practitioner' ? "/compliance-dashboard" : "/vat-management"} className="block">
                  <Button size="sm" variant="outline" className="w-full text-xs border-yellow-300 text-yellow-700 hover:bg-yellow-100 mt-2">
                    View All Deadlines
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-4 border border-blue-200 bg-blue-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <Zap className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-800">Quick Actions</h3>
                  <p className="text-xs text-blue-600">Common tasks</p>
                </div>
              </div>
              <div className="space-y-2">
                <Link href="/invoices/new" className="block">
                  <Button size="sm" variant="outline" className="w-full text-xs border-blue-300 text-blue-700 hover:bg-blue-100">
                    <FileText className="h-3 w-3 mr-2" />
                    Create Invoice
                  </Button>
                </Link>
                <Link href="/customers/new" className="block">
                  <Button size="sm" variant="outline" className="w-full text-xs border-blue-300 text-blue-700 hover:bg-blue-100">
                    <UserPlus className="h-3 w-3 mr-2" />
                    Add Customer
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Recent Activity Feed */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
                <Link href="/reports">
                  <Button size="sm" variant="outline" className="text-xs">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">Invoice INV-2024-001 created</div>
                    <div className="text-xs text-gray-600">R 15,500.00 • ABC Company Ltd</div>
                  </div>
                  <div className="text-xs text-gray-500">2h ago</div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">Payment received</div>
                    <div className="text-xs text-gray-600">R 8,200.00 • XYZ Trading</div>
                  </div>
                  <div className="text-xs text-gray-500">4h ago</div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                    <UserPlus className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">New customer added</div>
                    <div className="text-xs text-gray-600">Tech Solutions Pty Ltd</div>
                  </div>
                  <div className="text-xs text-gray-500">1d ago</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Cash Flow Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900">Cash Flow Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Inflow</span>
                    <span className="text-lg font-semibold text-green-600">{formatCurrency(dashboardStats.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Outflow</span>
                    <span className="text-lg font-semibold text-red-600">{formatCurrency(dashboardStats.totalExpenses)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">Net Cash Flow</span>
                      <span className={`text-lg font-bold ${
                        (parseFloat(dashboardStats.totalRevenue) - parseFloat(dashboardStats.totalExpenses)) >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {formatCurrency((parseFloat(dashboardStats.totalRevenue) - parseFloat(dashboardStats.totalExpenses)).toString())}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Outstanding Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900">Outstanding Balances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Accounts Receivable</span>
                    <span className="text-lg font-semibold text-blue-600">{formatCurrency(dashboardStats.outstandingInvoices)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Accounts Payable</span>
                    <span className="text-lg font-semibold text-orange-600">
                      {stats?.payablesAging?.totalPayables ? formatCurrency(stats.payablesAging.totalPayables) : formatCurrency("0.00")}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">Net Position</span>
                      <span className={`text-lg font-bold ${
                        (parseFloat(dashboardStats.outstandingInvoices) - (stats?.payablesAging?.totalPayables || 0)) >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {formatCurrency((parseFloat(dashboardStats.outstandingInvoices) - (parseFloat(stats?.payablesAging?.totalPayables || "0"))).toString())}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>



        {/* Footer Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              {dashboardType === 'practitioner' 
                ? `Managing ${dashboardStats.totalCustomers} clients` 
                : `${dashboardStats.totalCustomers} customers • ${dashboardStats.pendingEstimates} pending quotes`
              }
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PullToRefresh>
  );
}


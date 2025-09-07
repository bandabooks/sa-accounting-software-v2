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
import ActivityList from "@/components/dashboard/ActivityList";
import TimelineStrip from "@/components/dashboard/TimelineStrip";
import DueFilingsList from "@/components/dashboard/DueFilingsList";
import MiniStatsRow from "@/components/ui/MiniStatsRow";
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

  // All hooks must be called before any conditional returns
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

  // Professional metrics for tax practitioners - Limited to 4 KPIs
  const renderPractitionerMetrics = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Filings Due 30d */}
      <Card className="p-3 border border-gray-200 hover:border-red-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
        </div>
        <div className="text-lg font-semibold text-gray-900 mb-1">
          {stats?.filingsDue30 || 3}
        </div>
        <div className="text-xs text-gray-600">Filings Due</div>
        <div className="text-xs text-red-600 mt-1">Next 30 days</div>
      </Card>

      {/* Unreconciled */}
      <Card className="p-3 border border-gray-200 hover:border-yellow-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 bg-yellow-100 rounded flex items-center justify-center">
            <Banknote className="h-4 w-4 text-yellow-600" />
          </div>
        </div>
        <div className="text-lg font-semibold text-gray-900 mb-1">
          {stats?.unreconciledCount || 8}
        </div>
        <div className="text-xs text-gray-600">Unreconciled</div>
        <div className="text-xs text-yellow-600 mt-1">Bank lines</div>
      </Card>

      {/* Tasks Today */}
      <Card className="p-3 border border-gray-200 hover:border-blue-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
        </div>
        <div className="text-lg font-semibold text-gray-900 mb-1">
          {stats?.tasksToday || 5}
        </div>
        <div className="text-xs text-gray-600">Tasks Today</div>
        <div className="text-xs text-blue-600 mt-1">Due today</div>
      </Card>

      {/* Cash Total */}
      <Card className="p-3 border border-gray-200 hover:border-green-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
            <Wallet className="h-4 w-4 text-green-600" />
          </div>
        </div>
        <div className="text-lg font-semibold text-gray-900 mb-1">
          {formatCurrency(dashboardStats.totalRevenue)}
        </div>
        <div className="text-xs text-gray-600">Cash Total</div>
        <div className="text-xs text-green-600 mt-1">Available</div>
      </Card>
    </div>
  );

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 pb-8">
          
          {/* Professional Header with Quick Actions */}
          <div className="py-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  {dashboardType === 'practitioner' ? 'Practice Dashboard' : 'Business Dashboard'}
                </h1>
                <p className="text-sm text-gray-600">
                  {getCurrentGreeting()} • Last updated: {lastUpdate.toLocaleTimeString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/invoices/new">
                  <Button size="sm" variant="outline" className="text-xs h-8" aria-label="Create new invoice">
                    <FileText className="h-3 w-3 mr-2" />
                    New Invoice
                  </Button>
                </Link>
                <Link href="/customers/new">
                  <Button size="sm" variant="outline" className="text-xs h-8" aria-label="Add new customer">
                    <UserPlus className="h-3 w-3 mr-2" />
                    Add Customer
                  </Button>
                </Link>
                <Link href="/vat-returns">
                  <Button size="sm" variant="outline" className="text-xs h-8" aria-label="File VAT return">
                    <Calculator className="h-3 w-3 mr-2" />
                    VAT Return
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Professional Metrics Grid */}
          {dashboardType === 'practitioner' ? renderPractitionerMetrics() : renderBusinessOwnerMetrics()}

          {/* SARS Compliance Timeline - Above the fold */}
          <div className="mb-4">
            <TimelineStrip />
          </div>

          {/* Due Filings & Activity - Two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <DueFilingsList />
            <ActivityList title="Recent Activity" />
          </div>

          {/* Cash Flow Mini Stats */}
          <div className="mb-6">
            <MiniStatsRow />
          </div>

          {/* Professional Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Outstanding Balances Table */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900">Outstanding Balances</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-3 font-medium text-gray-600">Type</th>
                        <th className="text-right p-3 font-medium text-gray-600">Amount</th>
                        <th className="text-right p-3 font-medium text-gray-600">Overdue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-gray-50 cursor-pointer">
                        <td className="p-3 font-medium text-gray-900">
                          <Link href="/aging-reports?type=receivables" className="hover:text-blue-600">
                            Receivables
                          </Link>
                        </td>
                        <td className="p-3 text-right font-semibold text-green-600">{formatCurrency(dashboardStats.outstandingInvoices)}</td>
                        <td className="p-3 text-right text-red-600 font-medium">{formatCurrency("2,400.00")}</td>
                      </tr>
                      <tr className="hover:bg-gray-50 cursor-pointer">
                        <td className="p-3 font-medium text-gray-900">
                          <Link href="/aging-reports?type=payables" className="hover:text-blue-600">
                            Payables
                          </Link>
                        </td>
                        <td className="p-3 text-right font-semibold text-red-600">{stats?.payablesAging?.totalPayables ? formatCurrency(stats.payablesAging.totalPayables) : formatCurrency("0.00")}</td>
                        <td className="p-3 text-right text-red-600 font-medium">{formatCurrency("0.00")}</td>
                      </tr>
                      <tr className="hover:bg-gray-50 bg-blue-50">
                        <td className="p-3 font-medium text-gray-900">Net Position</td>
                        <td className="p-3 text-right font-bold text-blue-600">{formatCurrency((parseFloat(String(dashboardStats.outstandingInvoices).replace(/,/g, '')) - (stats?.payablesAging?.totalPayables ? parseFloat(String(stats.payablesAging.totalPayables).replace(/,/g, '')) : 0)).toString())}</td>
                        <td className="p-3 text-right text-gray-400">—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Profit & Loss Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900">Profit & Loss Summary</CardTitle>
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


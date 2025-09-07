import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PullToRefresh } from "@/components/mobile/pull-to-refresh";
import { FloatingActionButton } from "@/components/mobile/floating-action-button";
import { 
  Plus, FileText, UserPlus, TrendingUp, TrendingDown, Users, DollarSign, AlertTriangle,
  BarChart3, PieChart, Activity, Bell, Settings, ChevronRight, RefreshCw,
  Target, Award, Calendar, Clock, Zap, Star, ArrowUpRight, ArrowDownRight, ArrowDownLeft,
  Building, ShoppingCart, CreditCard, Wallet, Eye, Filter, Download, ChevronDown, Receipt,
  Calculator, User, ShoppingBag, Banknote, FileBarChart, Cpu, Search, Shield,
  Archive, ClipboardList, BookOpen, Package, Users2
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

export default function ComplianceDashboard() {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [activitySearchTerm, setActivitySearchTerm] = useState("");
  const [location, setLocation] = useLocation();
  
  // Fetch real alert counts from API
  const { data: alertCounts } = useQuery({
    queryKey: ["/api/alerts/counts"],
    refetchInterval: 60000,
    staleTime: 45000,
  });

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: dashboardApi.getStats,
    refetchInterval: 45000,
    staleTime: 30000,
  });

  const { data: currentUser } = useQuery({
    queryKey: ["/api/user/me"],
    queryFn: userApi.getCurrentUser,
    staleTime: 300000,
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
      { isLoading, message: 'Loading compliance dashboard...' },
    ],
    progressSteps: ['Loading compliance data', 'Processing stats'],
  });

  // Auto-refresh data every 45 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <PageLoader message="Loading compliance dashboard..." />;
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
    totalExpenses: "0.00",
    monthlyGrowth: 0,
    cashflowTrend: [],
    bankBalance: "0.00",
    invoicesDue: 0,
    paymentsToday: 0,
    activeProjects: 0,
    profitMargin: 0,
    expenses: [],
    topSellingProducts: [],
    recentActivities: [],
    upcomingTasks: [],
    complianceAlerts: [],
    performanceMetrics: [],
    cashFlow: { inflow: 0, outflow: 0 },
    salesFunnel: { leads: 0, prospects: 0, customers: 0 },
    inventory: { totalValue: "0.00", lowStockItems: 0 },
    customerMetrics: { newCustomers: 0, returningCustomers: 0 },
    arTotal: 0,
    apTotal: 0,
    netCashFlow: 0,
    filingsThisMonth: 0,
    tasksDueToday: 0,
    unReconciledTransactions: 0,
    upcomingDeadlines: []
  };

  const formatAsRands = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value || 0;
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numValue);
  };

  // Calculate key SARS compliance metrics
  const filingsThisMonth = dashboardStats.filingsThisMonth || 0;
  const tasksDueToday = dashboardStats.tasksDueToday || 0;
  const unReconciledTransactions = dashboardStats.unReconciledTransactions || 0;
  const netCashFlow = dashboardStats.netCashFlow || (dashboardStats.arTotal - dashboardStats.apTotal);

  // Total clients (from customer count)
  const totalClients = dashboardStats.totalCustomers || 0;
  
  // Onboarding progress (placeholder - can be enhanced with real data)
  const onboardingProgress = 0;
  
  // Pending compliance tasks (aggregate from various sources)
  const pendingTasks = dashboardStats.upcomingTasks?.length || 0;
  
  // Urgent compliance alerts
  const urgentTasks = dashboardStats.complianceAlerts?.length || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Practice Management</h1>
          <p className="text-muted-foreground">Centralized South African compliance tracking for SARS, CIPC, and Labour requirements</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsPaymentModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Client
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Primary KPI Cards - Client Management Focus */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="bg-blue-50 border-blue-200 hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => setLocation('/customers')} data-testid="card-total-clients">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Clients</p>
                <p className="text-3xl font-bold text-blue-900">{totalClients}</p>
                <p className="text-xs text-blue-600 mt-1">Active</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200 hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => setLocation('/client-onboarding')} data-testid="card-onboarding">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Onboarding</p>
                <p className="text-3xl font-bold text-green-900">{onboardingProgress}</p>
                <p className="text-xs text-green-600 mt-1">In progress</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200 hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => setLocation('/tasks')} data-testid="card-pending-tasks">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Pending Tasks</p>
                <p className="text-3xl font-bold text-orange-900">{pendingTasks}</p>
                <p className="text-xs text-orange-600 mt-1">Overdue</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200 hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => setLocation('/urgent-tasks')} data-testid="card-urgent-tasks">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Urgent Tasks</p>
                <p className="text-3xl font-bold text-red-900">{urgentTasks}</p>
                <p className="text-xs text-red-600 mt-1">Requires attention</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SARS Compliance Timeline */}
      <TimelineStrip />

      {/* Compliance Modules Grid + Quick Actions Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Compliance Modules - 3/4 width */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Compliance Modules</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* SARS Compliance */}
            <Card className="bg-green-50 border-green-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setLocation('/sars-integration')} data-testid="module-sars-compliance">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileBarChart className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-green-900 mb-2">SARS Compliance</h3>
                <p className="text-sm text-green-600 mb-3">Tax, VAT, PAYE, eFiling</p>
                <Badge className="bg-green-600 hover:bg-green-700 text-white">Active</Badge>
              </CardContent>
            </Card>

            {/* CIPC Compliance */}
            <Card className="bg-blue-50 border-blue-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setLocation('/cipc-compliance')} data-testid="module-cipc-compliance">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Building className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">CIPC Compliance</h3>
                <p className="text-sm text-blue-600 mb-3">Annual Returns, Changes</p>
                <Badge className="bg-blue-600 hover:bg-blue-700 text-white">Active</Badge>
              </CardContent>
            </Card>

            {/* Labour Compliance */}
            <Card className="bg-purple-50 border-purple-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setLocation('/labour-compliance')} data-testid="module-labour-compliance">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users2 className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-purple-900 mb-2">Labour Compliance</h3>
                <p className="text-sm text-purple-600 mb-3">UIF, SDL, COIDA</p>
                <Badge className="bg-purple-600 hover:bg-purple-700 text-white">Active</Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions Sidebar - 1/4 width */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" 
                      onClick={() => setLocation('/customers')} data-testid="action-manage-clients">
                <Users className="w-4 h-4 mr-2" />
                Manage Clients
              </Button>
              <Button variant="outline" className="w-full justify-start" 
                      onClick={() => setLocation('/calendar')} data-testid="action-view-calendar">
                <Calendar className="w-4 h-4 mr-2" />
                View Calendar
              </Button>
              <Button variant="outline" className="w-full justify-start" 
                      onClick={() => setLocation('/document-library')} data-testid="action-document-library">
                <Archive className="w-4 h-4 mr-2" />
                Document Library
              </Button>
              <Button variant="outline" className="w-full justify-start" 
                      onClick={() => setLocation('/reports')} data-testid="action-compliance-reports">
                <BarChart3 className="w-4 h-4 mr-2" />
                Compliance Reports
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {dashboardStats.upcomingTasks && dashboardStats.upcomingTasks.length > 0 ? (
                <div className="space-y-2">
                  {dashboardStats.upcomingTasks.slice(0, 3).map((task: any, index: number) => (
                    <div key={index} className="text-sm p-2 border rounded">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-muted-foreground">{task.dueDate}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Due Filings Section */}
      <DueFilingsList />

      {/* Financial Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Outstanding Balances */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => setLocation('/receivables')} data-testid="card-outstanding-balances">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Outstanding Balances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Accounts Receivable</span>
                <span className="font-semibold text-green-600">{formatAsRands(dashboardStats.arTotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Accounts Payable</span>
                <span className="font-semibold text-red-600">{formatAsRands(dashboardStats.apTotal)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Net Position</span>
                  <span className={`font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAsRands(netCashFlow)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profit & Loss Summary */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => setLocation('/financial/profit-loss')} data-testid="card-profit-loss">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Profit & Loss Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Revenue</span>
                <span className="font-semibold text-green-600">{formatAsRands(dashboardStats.totalRevenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Expenses</span>
                <span className="font-semibold text-red-600">{formatAsRands(dashboardStats.totalExpenses)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Net Profit</span>
                  <span className={`font-bold ${(parseFloat(dashboardStats.totalRevenue) - parseFloat(dashboardStats.totalExpenses)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAsRands(parseFloat(dashboardStats.totalRevenue) - parseFloat(dashboardStats.totalExpenses))}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              <CardTitle>Recent Tasks</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={() => setLocation('/tasks')} data-testid="button-view-all-tasks">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Sample tasks - can be enhanced with real data */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">VAT201 Return - Think Mybiz Accountants</h4>
                <p className="text-sm text-muted-foreground">General</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Todo</Badge>
                <span className="text-sm text-muted-foreground">Due Feb 23</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Annual Financial Statements - John Smith</h4>
                <p className="text-sm text-muted-foreground">General</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-600 hover:bg-green-700">In progress</Badge>
                <span className="text-sm text-muted-foreground">Due Mar 31</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Feed */}
      <ActivityList 
        activities={dashboardStats.recentActivities} 
        searchTerm={activitySearchTerm}
        onSearchChange={setActivitySearchTerm}
      />

      {/* Floating Action Button for Mobile */}
      <FloatingActionButton 
        onClick={() => setIsPaymentModalOpen(true)}
        icon={<Plus className="w-6 h-6" />}
        label="Add Task"
      />

      {/* Payment Form Modal */}
      <PaymentFormModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />

      {/* Onboarding Wizard */}
      {isWizardVisible && (
        <TooltipWizard
          steps={onboardingSteps}
          onComplete={completeOnboarding}
          onSkip={skipOnboarding}
        />
      )}

      {/* AI Health Indicator */}
      <AIHealthIndicator />
    </div>
  );
}
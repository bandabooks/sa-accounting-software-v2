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
      <div className="dashboard-container">
        
        {/* Priority Compliance Alerts - Always Visible */}
        {dashboardStats.complianceAlerts && dashboardStats.complianceAlerts.length > 0 && (
          <div className="compliance-alerts">
            {dashboardStats.complianceAlerts.slice(0, 2).map((alert: any, index: number) => (
              <div key={index} className={`compliance-alert ${alert.priority === 'urgent' ? 'compliance-alert-urgent' : ''}`}>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium text-red-900">{alert.title}</p>
                    <p className="text-sm text-red-700">{alert.description}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                  Action Required
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Optimized Hero Section - Reduced Height */}
        <div className="dashboard-hero brand-gradient-primary">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-3xl"></div>
          
          <div className="dashboard-hero-content">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
              
              {/* Compact Welcome Section */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-blue-100 text-sm font-medium">Business Dashboard</span>
                  <div className="last-updated ml-auto">
                    <Clock className="h-3 w-3" />
                    <span>Updated {lastUpdate.toLocaleTimeString()}</span>
                  </div>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                  {getCurrentGreeting()}!
                </h1>
                <p className="text-blue-100 text-sm">Business performance overview</p>
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
              <h2 className="text-2xl font-bold text-gray-800">Recent Activities</h2>
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

        {/* Enhanced Stats Grid - Clickable Enterprise Cards */}
        <div className="dashboard-grid dashboard-grid-sm">
          
          {/* Total Revenue Card - Clickable */}
          <Link href="/financial-reports">
            <Card className="stats-card brand-gradient-primary text-white clickable-stat a11y-focus group" role="button" tabIndex={0} aria-label="View revenue details">
              <div className="enterprise-card-content">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold mb-1 stat-value">
                      {formatCurrency(dashboardStats.totalRevenue)}
                    </div>
                    <p className="text-white/80 text-sm font-medium">Total Revenue</p>
                    <div className="flex items-center gap-1 text-green-300 mt-2">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-xs">+{getRevenueGrowth()}%</span>
                    </div>
                  </div>
                  <div className="stat-icon p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          {/* Outstanding Invoices Card - Clickable */}
          <Link href="/invoices?filter=outstanding">
            <Card className="stats-card brand-gradient-accent text-white clickable-stat a11y-focus group" role="button" tabIndex={0} aria-label="View outstanding invoices">
              <div className="enterprise-card-content">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold mb-1 stat-value">
                      {formatCurrency(dashboardStats.outstandingInvoices)}
                    </div>
                    <p className="text-white/80 text-sm font-medium">Outstanding</p>
                    <div className="flex items-center gap-1 text-yellow-200 mt-2">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">Pending</span>
                    </div>
                  </div>
                  <div className="stat-icon p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          {/* Total Customers Card - Clickable */}
          <Link href="/customers">
            <Card className="stats-card brand-gradient-secondary text-white clickable-stat a11y-focus group" role="button" tabIndex={0} aria-label="View all customers">
              <div className="enterprise-card-content">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold mb-1 stat-value">
                      {dashboardStats.totalCustomers}
                    </div>
                    <p className="text-white/80 text-sm font-medium">Active Customers</p>
                    <div className="flex items-center gap-1 text-blue-200 mt-2">
                      <Users className="h-3 w-3" />
                      <span className="text-xs">Growing</span>
                    </div>
                  </div>
                  <div className="stat-icon p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          {/* Pending Estimates Card - Clickable */}
          <Link href="/estimates?filter=pending">
            <Card className="stats-card bg-gradient-to-br from-purple-600 to-violet-700 text-white clickable-stat a11y-focus group" role="button" tabIndex={0} aria-label="View pending estimates">
              <div className="enterprise-card-content">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold mb-1 stat-value">
                      {dashboardStats.pendingEstimates}
                    </div>
                    <p className="text-white/80 text-sm font-medium">Pending Quotes</p>
                    <div className="flex items-center gap-1 text-purple-200 mt-2">
                      <Target className="h-3 w-3" />
                      <span className="text-xs">In Progress</span>
                    </div>
                  </div>
                  <div className="stat-icon p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Recent Activities - Enhanced */}
        {dashboardStats.recentActivities && dashboardStats.recentActivities.length > 0 && (
          <Card className="activity-card enterprise-card">
            <div className="enterprise-card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Recent Activities</h3>
                <Button variant="outline" size="sm" asChild className="a11y-focus">
                  <Link href="/activities">
                    <Activity className="h-4 w-4 mr-2" />
                    View All
                  </Link>
                </Button>
              </div>
            </div>
            <div className="enterprise-card-content space-y-3">
              {dashboardStats.recentActivities.slice(0, 5).map((activity: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Performance Analytics - Dual Column */}
        <div className="dashboard-grid dashboard-grid-md">
          
          {/* Financial Trends Card */}
          <Card className="large-card enterprise-card widget-customizable">
            <div className="enterprise-card-header">
              <h3 className="text-lg font-semibold text-gray-800">Financial Trends</h3>
              <p className="text-sm text-gray-600">Monthly performance overview</p>
            </div>
            <div className="enterprise-card-content">
              {dashboardStats.profitLossData && dashboardStats.profitLossData.length > 0 ? (
                <div className="space-y-4">
                  {dashboardStats.profitLossData.slice(0, 3).map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.month}</p>
                        <p className="text-sm text-gray-600">{formatCurrency(item.revenue)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{item.profit > 0 ? '+' : ''}{formatCurrency(item.profit)}</p>
                        <p className="text-xs text-gray-500">Profit</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" asChild className="w-full a11y-focus">
                    <Link href="/financial-reports">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Full Report
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  <ChartLine className="h-8 w-8 mr-2" />
                  <span>No financial data available</span>
                </div>
              )}
            </div>
          </Card>

          {/* Bank Balances Card */}
          <Card className="large-card enterprise-card widget-customizable">
            <div className="enterprise-card-header">
              <h3 className="text-lg font-semibold text-gray-800">Bank Balances</h3>
              <p className="text-sm text-gray-600">Current account balances</p>
            </div>
            <div className="enterprise-card-content">
              {dashboardStats.bankBalances && dashboardStats.bankBalances.length > 0 ? (
                <div className="space-y-3">
                  {dashboardStats.bankBalances.map((account: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{account.name}</p>
                          <p className="text-xs text-gray-500">{account.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{formatCurrency(account.balance)}</p>
                        <div className="status-indicator status-active inline-block"></div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" asChild className="w-full a11y-focus">
                    <Link href="/banking">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Manage Accounts
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  <CreditCard className="h-8 w-8 mr-2" />
                  <span>No bank accounts configured</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Widget Customization Footer */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-800">Dashboard Customization</h4>
              <p className="text-sm text-gray-600">Personalize your dashboard layout and widgets</p>
            </div>
            <Button 
              onClick={() => setIsCustomizing(!isCustomizing)}
              variant={isCustomizing ? "default" : "outline"}
              size="sm"
              className="a11y-focus"
            >
              <Settings className="h-4 w-4 mr-2" />
              {isCustomizing ? "Save Layout" : "Customize"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 

import { useQuery } from "@tanstack/react-query";
import { Plus, FileText, UserPlus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
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

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: dashboardApi.getStats
  });

  const {
    isWizardVisible,
    onboardingSteps,
    completeOnboarding,
    skipOnboarding,
  } = useOnboardingWizard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Loading your business overview...</p>
        </div>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
              </div>
            ))}
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

  return (
    <div className="space-y-4 sm:space-y-6 mobile-safe-area">
      {/* Mobile-Optimized Dashboard Header */}
      <div data-onboarding="dashboard-header" className="mobile-header sm:bg-none sm:p-0 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white sm:text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-blue-100 sm:text-gray-600 dark:text-gray-400 text-sm sm:text-base">Welcome to your business overview</p>
      </div>

      {/* Mobile-Optimized Quick Actions */}
      <div data-onboarding="quick-actions" className="mobile-grid sm:flex sm:flex-wrap gap-3 sm:gap-4 px-4 sm:px-0">
        <Button asChild className="mobile-btn mobile-btn-primary sm:w-auto bg-primary hover:bg-blue-800 min-h-[52px] sm:min-h-[40px]">
          <Link href="/invoices/new">
            <Plus size={18} className="mr-2" />
            New Invoice
          </Link>
        </Button>
        <Button asChild variant="secondary" className="mobile-btn sm:w-auto bg-secondary text-white hover:bg-teal-800 min-h-[52px] sm:min-h-[40px]">
          <Link href="/estimates/new">
            <FileText size={18} className="mr-2" />
            New Estimate
          </Link>
        </Button>
        <Button asChild variant="outline" className="mobile-btn sm:w-auto min-h-[52px] sm:min-h-[40px]">
          <Link href="/customers/new">
            <UserPlus size={18} className="mr-2" />
            Add Customer
          </Link>
        </Button>
      </div>

      {/* Mobile-Optimized Stats Grid */}
      <div data-onboarding="dashboard-stats" className="px-4 sm:px-0">
        <EnhancedStatsGrid stats={dashboardStats} />
      </div>

      {/* Mobile-Optimized Profit/Loss Chart */}
      <div className="mobile-card sm:m-0 sm:p-0 sm:bg-transparent sm:shadow-none">
        <ProfitLossChart data={dashboardStats.profitLossData || []} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-0">
        {/* Recent Activities */}
        <div className="xl:col-span-2 mobile-card sm:m-0 sm:p-0 sm:bg-transparent sm:shadow-none">
          <RecentActivities activities={dashboardStats.recentActivities || []} />
        </div>

        {/* Action Shortcuts */}
        <div className="mobile-card sm:m-0 sm:p-0 sm:bg-transparent sm:shadow-none">
          <ActionShortcuts />
        </div>
      </div>



      {/* Mobile-Optimized Compliance Alerts */}
      <div className="mobile-card sm:m-0 sm:p-0 sm:bg-transparent sm:shadow-none">
        <ComplianceAlerts alerts={dashboardStats.complianceAlerts || []} />
      </div>

      {/* Mobile-Optimized Recent Invoices and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-0">
        <div className="mobile-card sm:m-0 sm:p-0 sm:bg-transparent sm:shadow-none">
          <RecentInvoices invoices={dashboardStats.recentInvoices} />
        </div>
        
        {/* Mobile-Optimized Quick Stats Summary */}
        <div className="mobile-stat-card sm:bg-white sm:dark:bg-gray-800 sm:rounded-lg sm:border sm:border-gray-200 sm:dark:border-gray-700 sm:shadow-sm sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Business Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue Target</span>
              <span className="font-medium text-gray-900 dark:text-white">R50,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Customers</span>
              <span className="font-medium text-gray-900 dark:text-white">{dashboardStats.totalCustomers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</span>
              <span className="font-medium text-green-600 dark:text-green-400">73%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Average Invoice Value</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {dashboardStats.recentInvoices.length > 0 
                  ? formatCurrency((parseFloat(dashboardStats.totalRevenue) / dashboardStats.recentInvoices.length).toString())
                  : "R0.00"
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Tooltip Wizard */}
      <TooltipWizard
        steps={onboardingSteps}
        isVisible={isWizardVisible}
        onComplete={completeOnboarding}
        onSkip={skipOnboarding}
      />
    </div>
  );
}

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
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div data-onboarding="dashboard-header" className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome to your business overview</p>
      </div>

      {/* Quick Actions */}
      <div data-onboarding="quick-actions" className="flex flex-wrap gap-4">
        <Button asChild className="bg-primary hover:bg-blue-800">
          <Link href="/invoices/new">
            <Plus size={16} className="mr-2" />
            New Invoice
          </Link>
        </Button>
        <Button asChild variant="secondary" className="bg-secondary text-white hover:bg-teal-800">
          <Link href="/estimates/new">
            <FileText size={16} className="mr-2" />
            New Estimate
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/customers/new">
            <UserPlus size={16} className="mr-2" />
            Add Customer
          </Link>
        </Button>
      </div>

      {/* Enhanced Stats Grid */}
      <div data-onboarding="dashboard-stats">
        <EnhancedStatsGrid stats={dashboardStats} />
      </div>

      {/* Profit/Loss Chart */}
      <ProfitLossChart data={dashboardStats.profitLossData || []} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="xl:col-span-2">
          <RecentActivities activities={dashboardStats.recentActivities || []} />
        </div>

        {/* Action Shortcuts */}
        <div>
          <ActionShortcuts />
        </div>
      </div>

      {/* Bank Accounts / Compliance Alerts Card */}
      <BankComplianceCard 
        bankBalances={dashboardStats.bankBalances || []}
        complianceAlerts={dashboardStats.complianceAlerts || []}
      />

      {/* Compliance Alerts */}
      <ComplianceAlerts alerts={dashboardStats.complianceAlerts || []} />

      {/* Legacy Recent Invoices (keeping for compatibility) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentInvoices invoices={dashboardStats.recentInvoices} />
        
        {/* Quick Stats Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
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

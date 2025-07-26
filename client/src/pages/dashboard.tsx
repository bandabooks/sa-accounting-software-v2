import { useQuery } from "@tanstack/react-query";
import { Plus, FileText, UserPlus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import StatsGrid from "@/components/dashboard/stats-grid";
import RecentInvoices from "@/components/dashboard/recent-invoices";
import ActivityFeed from "@/components/dashboard/activity-feed";
import { dashboardApi } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
    revenueByMonth: []
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

      {/* Stats Grid */}
      <div data-onboarding="dashboard-stats">
        <StatsGrid stats={dashboardStats} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <RecentInvoices invoices={dashboardStats.recentInvoices} />

        {/* Chart Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
            <p className="text-sm text-gray-500">Monthly revenue for the past 6 months</p>
          </div>
          <div className="p-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardStats.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `R${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value.toString()), "Revenue"]}
                    labelFormatter={(label) => `${label} 2025`}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    stroke="#3b82f6"
                    strokeWidth={0}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <ActivityFeed />

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

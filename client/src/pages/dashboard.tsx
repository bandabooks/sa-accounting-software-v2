import { useQuery } from "@tanstack/react-query";
import { Plus, FileText, UserPlus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import StatsGrid from "@/components/dashboard/stats-grid";
import RecentInvoices from "@/components/dashboard/recent-invoices";
import ActivityFeed from "@/components/dashboard/activity-feed";
import { dashboardApi } from "@/lib/api";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: dashboardApi.getStats
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-28"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div>Error loading dashboard data</div>;
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
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
      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <RecentInvoices invoices={stats.recentInvoices} />

        {/* Chart Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
            <p className="text-sm text-gray-500">Monthly revenue for the past 6 months</p>
          </div>
          <div className="p-6">
            <div className="h-64 bg-gradient-to-t from-primary/10 to-primary/5 rounded-lg flex items-end justify-between px-4 pb-4 space-x-2">
              {stats.revenueByMonth.map((month, index) => {
                const height = (month.revenue / Math.max(...stats.revenueByMonth.map(m => m.revenue))) * 180;
                return (
                  <div key={month.month} className="bg-primary/20 w-8 rounded-t flex items-end justify-center" style={{ height: `${height + 20}px` }}>
                    <div className="bg-primary w-6 rounded-t" style={{ height: `${height}px` }}></div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-4 text-xs text-gray-500">
              {stats.revenueByMonth.map(month => (
                <span key={month.month}>{month.month}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <ActivityFeed />
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Eye, Edit, Trash2, FileText, Send, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { invoicesApi } from "@/lib/api";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils-invoice";
import { useState } from "react";
import { MiniDashboard } from "@/components/MiniDashboard";
import { DashboardCard } from "@/components/DashboardCard";
import { apiRequest } from "@/lib/queryClient";

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  const { data: invoices, isLoading } = useQuery({
    queryKey: ["/api/invoices"],
    queryFn: invoicesApi.getAll
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/invoices/stats"],
    queryFn: () => apiRequest("/api/invoices/stats", "GET").then(res => res.json())
  });

  const filteredInvoices = invoices?.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 mobile-safe-area">
      {/* Mobile-Optimized Mini Dashboard */}
      {stats && (
        <div className="mobile-card sm:m-0 sm:p-0 sm:bg-transparent sm:shadow-none">
          <MiniDashboard title="Invoices Overview">
            <DashboardCard
              title="Total Invoices"
              value={stats.total}
              icon={FileText}
              color="blue"
              onClick={() => setStatusFilter("")}
            />
            <DashboardCard
              title="Draft"
              value={stats.draft}
              icon={Edit}
              color="gray"
              onClick={() => setStatusFilter("draft")}
            />
            <DashboardCard
              title="Sent"
              value={stats.sent}
              icon={Send}
              color="blue"
              onClick={() => setStatusFilter("sent")}
            />
            <DashboardCard
              title="Paid"
              value={stats.paid}
              icon={CheckCircle}
              color="green"
              onClick={() => setStatusFilter("paid")}
            />
            <DashboardCard
              title="Overdue"
              value={stats.overdue}
              icon={AlertCircle}
              color="red"
              onClick={() => setStatusFilter("overdue")}
            />
          </MiniDashboard>
        </div>
      )}

      {/* Mobile-Optimized Header Actions */}
      <div className="mobile-form sm:m-0 sm:p-0 sm:bg-transparent sm:shadow-none">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1 max-w-2xl">
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mobile-form input sm:max-w-md"
            />
            {statusFilter && (
              <Button
                variant="outline"
                onClick={() => setStatusFilter("")}
                className="mobile-btn sm:w-auto whitespace-nowrap"
              >
                Clear Filter
              </Button>
            )}
          </div>
          <Button asChild className="mobile-btn mobile-btn-primary sm:w-auto bg-primary hover:bg-blue-800">
            <Link href="/invoices/new">
              <Plus size={18} className="mr-2" />
              New Invoice
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile-Optimized Invoices Table */}
      <div className="mobile-table-container sm:bg-white sm:rounded-lg sm:border sm:border-gray-200 sm:shadow-sm">
        <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
          <table className="mobile-table w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                  Issue Date
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                  Due Date
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 touch-manipulation">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {invoice.invoiceNumber}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{invoice.customer.name}</div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{invoice.customer.email}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white hidden sm:table-cell">
                    {formatDate(invoice.issueDate)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white hidden sm:table-cell">
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(invoice.total)}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button asChild variant="ghost" size="sm" className="min-w-[44px] min-h-[44px] p-2">
                      <Link href={`/invoices/${invoice.id}`}>
                        <Eye size={18} />
                        <span className="sr-only">View invoice {invoice.invoiceNumber}</span>
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredInvoices.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              {searchTerm ? "No invoices found matching your search." : "No invoices yet."}
            </div>
            {!searchTerm && (
              <Button asChild className="mobile-btn mobile-btn-primary sm:w-auto mt-4">
                <Link href="/invoices/new">Create your first invoice</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

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
    <div className="space-y-6">
      {/* Mini Dashboard */}
      {stats && (
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
      )}

      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4 flex-1 max-w-2xl">
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          {statusFilter && (
            <Button
              variant="outline"
              onClick={() => setStatusFilter("")}
              className="whitespace-nowrap"
            >
              Clear Filter
            </Button>
          )}
        </div>
        <Button asChild className="bg-primary hover:bg-blue-800">
          <Link href="/invoices/new">
            <Plus size={16} className="mr-2" />
            New Invoice
          </Link>
        </Button>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{invoice.customer.name}</div>
                    <div className="text-sm text-gray-500">{invoice.customer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(invoice.issueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(invoice.total)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/invoices/${invoice.id}`}>
                        <Eye size={16} />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm ? "No invoices found matching your search." : "No invoices yet."}
            </div>
            {!searchTerm && (
              <Button asChild className="mt-4">
                <Link href="/invoices/new">Create your first invoice</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

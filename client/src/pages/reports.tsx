import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, TrendingDown, DollarSign, FileText, Users, Receipt } from "lucide-react";
import { dashboardApi, invoicesApi, customersApi } from "@/lib/api";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils-invoice";
import { useState } from "react";
import { useLoadingStates } from "@/hooks/useLoadingStates";
import { PageLoader } from "@/components/ui/global-loader";

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("6months");
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: dashboardApi.getStats
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["/api/invoices"],
    queryFn: invoicesApi.getAll
  });

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: customersApi.getAll
  });

  const isLoading = statsLoading || invoicesLoading || customersLoading;

  // Calculate additional metrics
  const totalInvoices = invoices?.length || 0;
  const paidInvoices = invoices?.filter(inv => inv.status === "paid").length || 0;
  const pendingInvoices = invoices?.filter(inv => inv.status === "sent").length || 0;
  const overdueInvoices = invoices?.filter(inv => inv.status === "overdue").length || 0;
  
  const totalCustomers = customers?.length || 0;
  const activeCustomers = customers?.filter(customer => 
    invoices?.some(inv => inv.customerId === customer.id)
  ).length || 0;

  const paymentRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;

  // Use loading states for comprehensive loading feedback
  useLoadingStates({
    loadingStates: [
      { isLoading: statsLoading, message: 'Loading statistics...' },
      { isLoading: invoicesLoading, message: 'Loading invoices...' },
      { isLoading: customersLoading, message: 'Loading customers...' },
    ],
    progressSteps: ['Fetching dashboard stats', 'Loading invoice data', 'Processing customer information'],
  });

  if (isLoading) {
    return <PageLoader message="Loading reports..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600">Comprehensive overview of your business performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || "0")}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              12.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {paidInvoices} of {totalInvoices} invoices paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {totalCustomers} total customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.outstandingInvoices || "0")}</div>
            <p className="text-xs text-muted-foreground">
              {pendingInvoices + overdueInvoices} pending invoices
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <p className="text-sm text-gray-500">Monthly revenue over time</p>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-t from-primary/10 to-primary/5 rounded-lg flex items-end justify-between px-4 pb-4 space-x-2">
              {stats?.revenueByMonth?.map((month: any, index: number) => {
                const height = (month.revenue / Math.max(...stats.revenueByMonth.map((m: any) => m.revenue))) * 180;
                return (
                  <div key={month.month} className="bg-primary/20 w-8 rounded-t flex items-end justify-center" style={{ height: `${height + 20}px` }}>
                    <div className="bg-primary w-6 rounded-t" style={{ height: `${height}px` }}></div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-4 text-xs text-gray-500">
              {stats?.revenueByMonth?.map((month: any) => (
                <span key={month.month}>{month.month}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status Overview</CardTitle>
            <p className="text-sm text-gray-500">Current status of all invoices</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Paid</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{paidInvoices}</div>
                  <div className="text-xs text-gray-500">{totalInvoices > 0 ? ((paidInvoices / totalInvoices) * 100).toFixed(1) : 0}%</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Sent</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{pendingInvoices}</div>
                  <div className="text-xs text-gray-500">{totalInvoices > 0 ? ((pendingInvoices / totalInvoices) * 100).toFixed(1) : 0}%</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Overdue</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{overdueInvoices}</div>
                  <div className="text-xs text-gray-500">{totalInvoices > 0 ? ((overdueInvoices / totalInvoices) * 100).toFixed(1) : 0}%</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm">Draft</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{invoices?.filter(inv => inv.status === "draft").length || 0}</div>
                  <div className="text-xs text-gray-500">{totalInvoices > 0 ? (((invoices?.filter(inv => inv.status === "draft").length || 0) / totalInvoices) * 100).toFixed(1) : 0}%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Date</th>
                  <th className="text-left py-3">Invoice</th>
                  <th className="text-left py-3">Customer</th>
                  <th className="text-left py-3">Amount</th>
                  <th className="text-left py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices?.slice(0, 10).map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 text-sm">{formatDate(invoice.issueDate)}</td>
                    <td className="py-3 text-sm font-medium">{invoice.invoiceNumber}</td>
                    <td className="py-3 text-sm">{invoice.customer.name}</td>
                    <td className="py-3 text-sm font-medium">{formatCurrency(invoice.total)}</td>
                    <td className="py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* VAT Summary */}
      <Card>
        <CardHeader>
          <CardTitle>VAT Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.vatDue || "0")}
              </div>
              <div className="text-sm text-gray-500">VAT Due</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  invoices?.reduce((sum, inv) => sum + parseFloat(inv.vatAmount), 0) || 0
                )}
              </div>
              <div className="text-sm text-gray-500">Total VAT Collected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">15%</div>
              <div className="text-sm text-gray-500">Standard VAT Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

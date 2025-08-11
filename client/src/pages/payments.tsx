import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Receipt, Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils-invoice";
import { useLoadingStates } from "@/hooks/useLoadingStates";
import { PageLoader } from "@/components/ui/global-loader";

export default function Payments() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["/api/payments"]
  });

  const filteredPayments = payments.filter(payment => 
    payment.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPayments = payments.reduce((sum, payment) => sum + parseFloat(payment.amount || '0'), 0);

  // Use loading states for comprehensive loading feedback
  useLoadingStates({
    loadingStates: [
      { isLoading, message: 'Loading payments...' },
    ],
    progressSteps: ['Fetching payments', 'Calculating totals', 'Processing data'],
  });

  if (isLoading) {
    return <PageLoader message="Loading payments..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
          <p className="text-gray-500 dark:text-gray-400">Track and manage all customer payments</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/payments/new">
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPayments.toString())}</div>
            <p className="text-xs text-muted-foreground">{payments.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                payments
                  .filter(p => new Date(p.paymentDate).getMonth() === new Date().getMonth())
                  .reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0)
                  .toString()
              )}
            </div>
            <p className="text-xs text-muted-foreground">Current month payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                payments
                  .filter(p => new Date(p.paymentDate).toDateString() === new Date().toDateString())
                  .reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0)
                  .toString()
              )}
            </div>
            <p className="text-xs text-muted-foreground">Today's payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 transform -translate-y-1/2" />
          <Input
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No payments found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm ? "No payments match your search criteria" : "Start by recording your first payment"}
              </p>
              <Button asChild>
                <Link href="/payments/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Record Payment
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Invoice</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Method</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Reference</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/invoices/${payment.invoiceId}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                          {payment.invoiceNumber || `INV-${payment.invoiceId}`}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {payment.customerName || 'N/A'}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="capitalize">
                          {payment.paymentMethod?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {payment.reference || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={payment.status === 'completed' ? 'default' : 'secondary'}
                          className={payment.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                        >
                          {payment.status || 'completed'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, CreditCard, DollarSign, CheckCircle, Clock, Users, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function CustomerPaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/customer-payments"],
  });

  const { data: paymentStats = {}, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/customer-payments/stats"],
  });

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(Number(amount));
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      processing: "bg-blue-100 text-blue-800",
    };
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodColors = {
      cash: "bg-green-100 text-green-800",
      card: "bg-blue-100 text-blue-800",
      bank_transfer: "bg-purple-100 text-purple-800",
      cheque: "bg-orange-100 text-orange-800",
      eft: "bg-indigo-100 text-indigo-800",
    };
    return methodColors[method as keyof typeof methodColors] || "bg-gray-100 text-gray-800";
  };

  if (isLoading || statsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Payments</h1>
          <p className="text-gray-600">Record and track all customer payments and receipts</p>
        </div>
        <Link href="/customer-payments/record">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Record Payment
          </Button>
        </Link>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Received</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(paymentStats.totalReceived || 0)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatCurrency(paymentStats.thisMonth || 0)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(paymentStats.outstanding || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {paymentStats.outstandingInvoices || 0} unpaid invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentStats.paymentsToday || 0}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(paymentStats.amountToday || 0)} received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(paymentStats.averagePayment || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Payments</CardTitle>
          <CardDescription>
            A list of all customer payments with their status and details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No payments recorded</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by recording your first customer payment
              </p>
              <div className="mt-6">
                <Link href="/customer-payments/record">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Payment ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Invoice</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Payment Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Method</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Reference</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments
                    .filter(payment => {
                      const matchesSearch = searchTerm === "" || 
                        payment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        payment.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        payment.reference?.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
                      return matchesSearch && matchesStatus;
                    })
                    .map((payment, index) => (
                      <tr key={payment.id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-gray-900">#{payment.id}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {payment.customerName || 'Unknown Customer'}
                            </span>
                            {payment.customerEmail && (
                              <span className="text-xs text-gray-500">{payment.customerEmail}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-900">
                            {payment.invoiceNumber || `Invoice #${payment.invoiceId}`}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-semibold text-green-600">
                            {formatCurrency(payment.amount)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-900">
                            {new Date(payment.paymentDate).toLocaleDateString('en-ZA')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getPaymentMethodBadge(payment.paymentMethod)}>
                            {payment.paymentMethod?.replace('_', ' ').toUpperCase() || 'BANK TRANSFER'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusBadge(payment.status)}>
                            {payment.status?.toUpperCase() || 'COMPLETED'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">
                            {payment.reference || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Receipt className="mr-2 h-4 w-4" />
                                Print Receipt
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Payment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
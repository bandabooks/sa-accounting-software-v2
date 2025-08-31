import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, CreditCard, DollarSign, CheckCircle, Clock, Users, Receipt, RefreshCw, FileText, Download, AlertTriangle, Undo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function CustomerPaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [deletingPayment, setDeletingPayment] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    amount: "",
    paymentMethod: "",
    status: "",
    reference: "",
    notes: ""
  });
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

  // Payment management mutations
  const updatePaymentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest(`/api/payments/${id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customer-payments/stats"] });
      setEditingPayment(null);
      toast({
        title: "Success",
        description: "Payment updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update payment",
        variant: "destructive",
      });
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/payments/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customer-payments/stats"] });
      setDeletingPayment(null);
      toast({
        title: "Success",
        description: "Payment deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete payment",
        variant: "destructive",
      });
    },
  });

  const handleEditPayment = (payment: any) => {
    setEditingPayment(payment);
    setEditForm({
      amount: payment.amount,
      paymentMethod: payment.paymentMethod || 'bank_transfer',
      status: payment.status || 'completed',
      reference: payment.reference || '',
      notes: payment.notes || ''
    });
  };

  const handleUpdatePayment = () => {
    updatePaymentMutation.mutate({
      id: editingPayment.id,
      data: editForm
    });
  };

  const handleDeletePayment = () => {
    if (deletingPayment) {
      deletePaymentMutation.mutate(deletingPayment.id);
    }
  };

  const printReceipt = (payment: any) => {
    // Generate formal business payment receipt with full company details
    const currentDate = new Date().toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const currentTime = new Date().toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Payment Receipt for Invoice ${payment.invoiceNumber}</title>
            <style>
              @media print {
                body { margin: 0; padding: 15mm; }
                .no-print { display: none; }
              }
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 210mm;
                margin: 0 auto;
                padding: 20px;
                background: white;
                line-height: 1.5;
                color: #333;
              }
              .header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #e5e7eb;
              }
              .company-info {
                flex: 1;
              }
              .customer-info {
                flex: 1;
                text-align: right;
              }
              .company-name {
                font-size: 20px;
                font-weight: bold;
                color: #1f2937;
                margin-bottom: 8px;
              }
              .company-details, .customer-details {
                font-size: 14px;
                line-height: 1.6;
                color: #6b7280;
              }
              .document-title {
                text-align: center;
                font-size: 28px;
                font-weight: bold;
                color: #1f2937;
                margin: 30px 0;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .payment-summary {
                display: flex;
                justify-content: space-between;
                margin: 30px 0;
                gap: 40px;
              }
              .payment-details {
                flex: 1;
              }
              .payment-amount {
                flex: 1;
                text-align: right;
              }
              .detail-group {
                margin-bottom: 20px;
              }
              .detail-label {
                font-weight: 600;
                color: #374151;
                margin-bottom: 5px;
              }
              .detail-value {
                color: #1f2937;
                font-size: 16px;
              }
              .amount-highlight {
                background: #f0f9ff;
                border: 2px solid #0ea5e9;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
              }
              .amount-label {
                font-size: 16px;
                color: #374151;
                margin-bottom: 10px;
              }
              .amount-value {
                font-size: 32px;
                font-weight: bold;
                color: #0ea5e9;
              }
              .invoice-table {
                width: 100%;
                border-collapse: collapse;
                margin: 30px 0;
                background: white;
              }
              .invoice-table th {
                background: #f8fafc;
                padding: 12px;
                text-align: left;
                font-weight: 600;
                color: #374151;
                border-bottom: 2px solid #e5e7eb;
              }
              .invoice-table td {
                padding: 12px;
                border-bottom: 1px solid #f1f5f9;
              }
              .invoice-table .amount {
                text-align: right;
                font-weight: 500;
              }
              .footer {
                margin-top: 50px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                font-size: 14px;
                color: #6b7280;
              }
              .thank-you {
                font-size: 18px;
                font-weight: 600;
                color: #059669;
                margin-bottom: 15px;
              }
              .terms {
                margin-top: 20px;
                font-size: 12px;
                color: #9ca3af;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-info">
                <div class="company-name">Think Mybiz Accountants</div>
                <div class="company-details">
                  No 48 Rabe Street<br>
                  Mokopane Limpopo<br>
                  South Africa 0600<br>
                  <br>
                  <strong>VAT Number:</strong> 4010320630<br>
                  <strong>Phone:</strong> 0662105631<br>
                  <strong>Email:</strong> accounts@thinkmybiz.io<br>
                  <strong>Tax Number:</strong> 9074469272<br>
                  <strong>Company Reg No:</strong> 2021/819201/07
                </div>
              </div>
              <div class="customer-info">
                <div class="customer-details">
                  <strong>${payment.customerName || 'Valued Customer'}</strong><br>
                  ${payment.customerAddress || ''}<br>
                  ${payment.customerCity || ''}<br>
                  ${payment.customerPostal || ''}<br>
                  <br>
                  ${payment.customerVatNumber ? `<strong>VAT Number:</strong> ${payment.customerVatNumber}<br>` : ''}
                  ${payment.customerTaxNumber ? `<strong>Tax No:</strong> ${payment.customerTaxNumber}<br>` : ''}
                </div>
              </div>
            </div>
            
            <div class="document-title">Payment Receipt</div>
            
            <div class="payment-summary">
              <div class="payment-details">
                <div class="detail-group">
                  <div class="detail-label">Payment Date:</div>
                  <div class="detail-value">${new Date(payment.paymentDate).toLocaleDateString('en-ZA', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                </div>
                <div class="detail-group">
                  <div class="detail-label">Payment Mode:</div>
                  <div class="detail-value">${(payment.paymentMethod || 'Bank Transfer').replace('_', ' ')}</div>
                </div>
                ${payment.reference ? `
                <div class="detail-group">
                  <div class="detail-label">Reference:</div>
                  <div class="detail-value">${payment.reference}</div>
                </div>
                ` : ''}
              </div>
              <div class="payment-amount">
                <div class="amount-highlight">
                  <div class="amount-label">Total Amount</div>
                  <div class="amount-value">${formatCurrency(payment.amount)}</div>
                </div>
              </div>
            </div>
            
            <table class="invoice-table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Invoice Date</th>
                  <th class="amount">Invoice Amount</th>
                  <th class="amount">Payment Amount</th>
                  <th class="amount">Amount Due</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${payment.invoiceNumber || 'INV-' + payment.id.toString().padStart(6, '0')}</td>
                  <td>${payment.invoiceDate ? new Date(payment.invoiceDate).toLocaleDateString('en-ZA', { day: '2-digit', month: '2-digit', year: 'numeric' }) : new Date(payment.paymentDate).toLocaleDateString('en-ZA', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                  <td class="amount">${formatCurrency(payment.invoiceAmount || payment.amount)}</td>
                  <td class="amount">${formatCurrency(payment.amount)}</td>
                  <td class="amount" style="color: ${(payment.invoiceAmount || payment.amount) - payment.amount > 0 ? '#dc2626' : '#059669'};">
                    ${formatCurrency(Math.max(0, (payment.invoiceAmount || payment.amount) - payment.amount))}
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div class="footer">
              <div class="thank-you">Thank you for your payment!</div>
              <div><strong>This serves as your official payment receipt.</strong></div>
              <div>Please retain this receipt for your records and tax purposes.</div>
              
              <div class="terms">
                Receipt generated on ${currentDate} at ${currentTime}<br>
                This document was generated electronically and is valid without signature.<br>
                Powered by Taxnify Business Management Platform
              </div>
            </div>
            
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 800);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
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
          <p className="text-gray-600">Record and track all customer payments with comprehensive management tools</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/credit-notes">
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Credit Notes
            </Button>
          </Link>
          <Link href="/customer-payment-record">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Record Payment
            </Button>
          </Link>
        </div>
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
                              <DropdownMenuItem onClick={() => console.log('View payment details:', payment)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => printReceipt(payment)}>
                                <Receipt className="mr-2 h-4 w-4" />
                                Print Receipt
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEditPayment(payment)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Payment
                              </DropdownMenuItem>
                              <Link href={`/credit-notes/create?invoiceId=${payment.invoiceId}`}>
                                <DropdownMenuItem>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Create Credit Note
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => setDeletingPayment(payment)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Payment
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

      {/* Edit Payment Modal */}
      <Dialog open={!!editingPayment} onOpenChange={() => setEditingPayment(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Payment #{editingPayment?.id}</DialogTitle>
            <DialogDescription>
              Update payment details for {editingPayment?.customerName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={editForm.amount}
                onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={editForm.paymentMethod} onValueChange={(value) => setEditForm({...editForm, paymentMethod: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="eft">EFT</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm({...editForm, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reference">Reference</Label>
              <Input
                id="reference"
                value={editForm.reference}
                onChange={(e) => setEditForm({...editForm, reference: e.target.value})}
                placeholder="Payment reference"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                placeholder="Additional notes"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPayment(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePayment} disabled={updatePaymentMutation.isPending}>
              {updatePaymentMutation.isPending ? "Updating..." : "Update Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Payment Confirmation */}
      <AlertDialog open={!!deletingPayment} onOpenChange={() => setDeletingPayment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete payment #{deletingPayment?.id} for {formatCurrency(deletingPayment?.amount || 0)}? 
              This action cannot be undone and may affect invoice payment status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePayment}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
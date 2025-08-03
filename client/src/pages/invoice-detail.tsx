import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Mail, Edit, Download, Repeat, CreditCard, Eye, FileText, Building2, Calendar, MapPin, Phone } from "lucide-react";
import { invoicesApi } from "@/lib/api";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils-invoice";
import { useToast } from "@/hooks/use-toast";
import { useGlobalNotification } from "@/contexts/NotificationContext";
import PaymentModal from "@/components/payment/payment-modal";
import PaymentHistory from "@/components/payment/payment-history";
import PaymentStatusSummary from "@/components/payment/payment-status-summary";
import { generateInvoicePDF } from "@/components/invoice/pdf-generator";
import PDFPreviewModal from "@/components/invoice/pdf-preview-modal";
import EmailInvoice from "@/components/invoice/email-invoice";
import RecurringInvoice from "@/components/invoice/recurring-invoice";
import { useState, useRef } from "react";

// Payment Modal Wrapper that calculates remaining amount
function PaymentModalWrapper({ invoiceId, invoiceTotal, isOpen, onClose, onPaymentAdded }: {
  invoiceId: number;
  invoiceTotal: string;
  isOpen: boolean;
  onClose: () => void;
  onPaymentAdded: (paymentAmount?: string) => void;
}) {
  const queryClient = useQueryClient();
  
  const { data: payments } = useQuery<any[]>({
    queryKey: [`/api/invoices/${invoiceId}/payments`],
    queryFn: async () => {
      const response = await fetch(`/api/invoices/${invoiceId}/payments`);
      if (!response.ok) throw new Error("Failed to fetch payments");
      return response.json();
    },
  });

  const totalPaid = payments
    ?.filter(p => p.status === "completed")
    .reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;

  const remainingAmount = Math.max(0, parseFloat(invoiceTotal) - totalPaid).toFixed(2);

  // Debug logging for troubleshooting
  console.log("Payment calculation:", {
    invoiceTotal,
    totalPaid,
    remainingAmount,
    payments: payments?.map(p => ({ amount: p.amount, status: p.status }))
  });

  const handlePaymentAdded = (paymentAmount?: string) => {
    // Invalidate payment queries first
    queryClient.invalidateQueries({ queryKey: [`/api/invoices/${invoiceId}/payments`] });
    // Invalidate Chart of Accounts to update account balances
    queryClient.invalidateQueries({ queryKey: ["/api/chart-of-accounts"] });
    // Then call the parent callback
    onPaymentAdded(paymentAmount);
  };

  return (
    <PaymentModal
      isOpen={isOpen}
      onClose={onClose}
      invoiceId={invoiceId}
      invoiceTotal={invoiceTotal}
      remainingAmount={remainingAmount}
      onPaymentAdded={handlePaymentAdded}
    />
  );
}

export default function InvoiceDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { showSuccess } = useGlobalNotification();
  const queryClient = useQueryClient();
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPDFPreviewOpen, setIsPDFPreviewOpen] = useState(false);
  const paymentHistoryRef = useRef<HTMLDivElement>(null);
  
  const invoiceId = parseInt(params.id || "0");

  // Helper functions
  async function handlePrintPDF() {
    if (!invoice) return;
    
    try {
      const pdf = await generateInvoicePDF(invoice);
      pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
      showSuccess(
        "PDF Generated Successfully",
        "Invoice PDF has been downloaded to your computer."
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "PDF Generation Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  }

  function handleEmailSent() {
    showSuccess(
      "Invoice Sent Successfully",
      "Your invoice has been emailed to the customer successfully."
    );
  }

  function handleRecurringSetup() {
    showSuccess(
      "Recurring Invoice Setup Complete",
      "Invoice will now be generated automatically based on your schedule."
    );
  }

  function handlePaymentAdded(paymentAmount?: string) {
    queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
    queryClient.invalidateQueries({ queryKey: ["/api/invoices", invoiceId] });
    queryClient.invalidateQueries({ queryKey: [`/api/invoices/${invoiceId}/payments`] });
    
    showSuccess(
      "Payment Recorded Successfully!",
      paymentAmount ? 
        `Payment of ${formatCurrency(paymentAmount)} has been processed and added to the invoice.` :
        "Your payment has been successfully recorded and applied to this invoice."
    );
    
    setTimeout(() => {
      paymentHistoryRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }, 500);
  }

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["/api/invoices", invoiceId],
    queryFn: () => invoicesApi.getById(invoiceId),
    enabled: invoiceId > 0
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => invoicesApi.updateStatus(invoiceId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["/api/chart-of-accounts"] });
      toast({
        title: "Status updated",
        description: "Invoice status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update invoice status.",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">Invoice not found</div>
        <Button onClick={() => setLocation("/invoices")}>
          Back to Invoices
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Professional Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white">
                <FileText className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Invoice {invoice.invoiceNumber}
                </h1>
                <div className="flex items-center mt-2 space-x-4">
                  <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Created {formatDate(invoice.createdAt!)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={invoice.status}
                onValueChange={(value) => updateStatusMutation.mutate(value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline"
                onClick={() => setIsPDFPreviewOpen(true)}
                className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300"
              >
                <Eye size={16} className="mr-2" />
                Preview
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setIsEmailModalOpen(true)}
                className="border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300"
              >
                <Mail size={16} className="mr-2" />
                Send
              </Button>
              
              <Button 
                variant="outline"
                onClick={handlePrintPDF}
                className="border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300"
              >
                <Download size={16} className="mr-2" />
                PDF
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setIsRecurringModalOpen(true)}
                className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300"
              >
                <Repeat size={16} className="mr-2" />
                Recurring
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setLocation(`/invoices/create?edit=${invoice.id}`)}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                <Edit size={16} className="mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Invoice Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Customer & Invoice Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b">
                  <CardTitle className="flex items-center text-gray-900 dark:text-white">
                    <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                    Bill To
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="font-bold text-lg text-gray-900 dark:text-white">{invoice.customer.name}</div>
                    {invoice.customer.email && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-blue-500" />
                        {invoice.customer.email}
                      </div>
                    )}
                    {invoice.customer.phone && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-green-500" />
                        {invoice.customer.phone}
                      </div>
                    )}
                    {invoice.customer.address && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 text-red-500" />
                        <div>
                          {invoice.customer.address}
                          {invoice.customer.city && `, ${invoice.customer.city}`}
                          {invoice.customer.postalCode && ` ${invoice.customer.postalCode}`}
                        </div>
                      </div>
                    )}
                    {invoice.customer.vatNumber && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        <strong>VAT Number:</strong> {invoice.customer.vatNumber}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b">
                  <CardTitle className="flex items-center text-gray-900 dark:text-white">
                    <FileText className="h-5 w-5 mr-2 text-purple-600" />
                    Invoice Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Invoice Number:</span>
                      <span className="font-bold text-gray-900 dark:text-white">{invoice.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Issue Date:</span>
                      <span className="text-gray-900 dark:text-white">{formatDate(invoice.issueDate)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Due Date:</span>
                      <span className="text-gray-900 dark:text-white">{formatDate(invoice.dueDate)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Status:</span>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Items Table */}
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b">
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <CreditCard className="h-5 w-5 mr-2 text-green-600" />
                  Invoice Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700/50">
                        <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Description</th>
                        <th className="text-right py-4 px-4 font-semibold text-gray-900 dark:text-white">Qty</th>
                        <th className="text-right py-4 px-4 font-semibold text-gray-900 dark:text-white">Unit Price</th>
                        <th className="text-right py-4 px-4 font-semibold text-gray-900 dark:text-white">VAT %</th>
                        <th className="text-right py-4 px-6 font-semibold text-gray-900 dark:text-white">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item, index) => (
                        <tr 
                          key={item.id} 
                          className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${
                            index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-700/20'
                          }`}
                        >
                          <td className="py-4 px-6 text-gray-900 dark:text-white">{item.description}</td>
                          <td className="text-right py-4 px-4 text-gray-700 dark:text-gray-300">{item.quantity}</td>
                          <td className="text-right py-4 px-4 text-gray-700 dark:text-gray-300">{formatCurrency(item.unitPrice)}</td>
                          <td className="text-right py-4 px-4 text-gray-700 dark:text-gray-300">{item.vatRate}%</td>
                          <td className="text-right py-4 px-6 font-bold text-gray-900 dark:text-white">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Totals Section */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-gray-600 p-6 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex justify-end">
                    <div className="w-80 space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-500">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">Subtotal:</span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(invoice.subtotal)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-500">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">VAT:</span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(invoice.vatAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-gradient-to-r from-blue-600 to-indigo-600 -mx-6 px-6 rounded-lg">
                        <span className="text-white font-bold text-lg">Total:</span>
                        <span className="text-white font-bold text-xl">{formatCurrency(invoice.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {invoice.notes && (
              <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-b">
                  <CardTitle className="flex items-center text-gray-900 dark:text-white">
                    <FileText className="h-5 w-5 mr-2 text-amber-600" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                <p className="text-gray-700">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary and Payment */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT:</span>
                  <span>{formatCurrency(invoice.vatAmount)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(invoice.total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status Summary */}
          <PaymentStatusSummary invoiceId={invoiceId} invoiceTotal={invoice.total} />

          {/* Payment History */}
          <div ref={paymentHistoryRef}>
            <PaymentHistory invoiceId={invoiceId} />
          </div>

          {/* Record Payment Button */}
          {invoice.status !== "paid" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Record Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Click the button below to record a payment for this invoice.
                </p>
                <Button 
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg font-semibold"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Record Payment
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </div>

      {/* Modals */}
      <PDFPreviewModal 
        invoice={invoice}
        isOpen={isPDFPreviewOpen}
        onClose={() => setIsPDFPreviewOpen(false)}
        onSendEmail={() => setIsEmailModalOpen(true)}
      />

      <EmailInvoice 
        invoice={invoice}
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSent={handleEmailSent}
      />
      
      <RecurringInvoice 
        invoice={invoice}
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        onSetup={handleRecurringSetup}
      />

      <PaymentModalWrapper
        invoiceId={invoiceId}
        invoiceTotal={invoice.total}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentAdded={handlePaymentAdded}
      />
    </div>
  );
}

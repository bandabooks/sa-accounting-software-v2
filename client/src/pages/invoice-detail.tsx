import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Mail, Edit, Download, Repeat, CreditCard, Eye, FileText, Building2, Calendar, MapPin, Phone, ArrowLeft } from "lucide-react";
import { invoicesApi } from "@/lib/api";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils-invoice";
import { format } from "date-fns";
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
function PaymentModalWrapper({ invoiceId, invoiceTotal, invoiceNumber, isOpen, onClose, onPaymentAdded }: {
  invoiceId: number;
  invoiceTotal: string;
  invoiceNumber?: string;
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
      invoiceNumber={invoiceNumber}
    />
  );
}

function InvoiceDetail() {
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

  function getStatusTextColor(status: string) {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'sent': return 'text-blue-600';
      case 'overdue': return 'text-red-600';
      case 'draft': return 'text-gray-600';
      default: return 'text-gray-600';
    }
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
      {/* Fixed Professional Header - Always Visible */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/invoices")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </Button>
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Invoice {invoice.invoiceNumber}
                </h1>
                <div className="flex items-center mt-1 space-x-3">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Created {formatDate(invoice.createdAt!)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={invoice.status}
                onValueChange={(value) => updateStatusMutation.mutate(value)}
              >
                <SelectTrigger className="w-32 h-8 text-sm">
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
                size="sm"
                onClick={() => setIsPDFPreviewOpen(true)}
                className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300"
              >
                <Eye size={14} className="mr-1" />
                Preview
              </Button>
              
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setIsEmailModalOpen(true)}
                className="border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300"
              >
                <Mail size={14} className="mr-1" />
                Send
              </Button>
              
              <Button 
                variant="outline"
                size="sm"
                onClick={handlePrintPDF}
                className="border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300"
              >
                <Download size={14} className="mr-1" />
                PDF
              </Button>
              
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setLocation(`/invoices/create?edit=${invoice.id}`)}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                <Edit size={14} className="mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with proper top margin for fixed header */}
      <div className="pt-24 min-h-screen">
        <div className="flex gap-8 px-6">
          {/* Invoice Document - Left Side */}
          <div className="flex-1 max-w-4xl">
            {/* Professional Invoice Document */}
            <div className="bg-white rounded-2xl shadow-lg p-8 font-sans border border-gray-200">
              
              {/* Sticky Invoice Header */}
              <div className="sticky top-20 bg-white z-40 -mx-8 px-8 py-4 border-b border-gray-200 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white mr-3">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-blue-700">Think Mybiz Accounting</h2>
                        <p className="text-xs text-gray-500">Professional Invoice Management</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      <div>info@thinkmybiz.com | +27 12 345 6789</div>
                      <div>PO Box 1234, Midrand, 1685</div>
                      <div>VAT #: 4455667788 | Reg: 2019/123456/07</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <h3 className="text-2xl font-bold tracking-wide text-gray-800">TAX INVOICE</h3>
                    <div className="mt-2 text-sm space-y-1">
                      <div>Invoice #: <span className="font-semibold">{invoice.invoiceNumber}</span></div>
                      <div>Date: <span>{formatDate(invoice.createdAt!)} at {format(new Date(invoice.createdAt!), 'HH:mm')}</span></div>
                      <div>Due: <span>{formatDate(invoice.dueDate!)}</span></div>
                      <div>Status: <span className={`font-medium ${getStatusTextColor(invoice.status)}`}>
                        {invoice.status.toUpperCase()}
                      </span></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Addresses Section */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="font-semibold mb-2 text-gray-700 border-b border-gray-200 pb-1">Bill To:</div>
                  <div className="space-y-1">
                    <div className="font-bold text-lg">{invoice.customer.name}</div>
                    {invoice.customer.email && (
                      <div className="text-sm">{invoice.customer.email}</div>
                    )}
                    {invoice.customer.phone && (
                      <div className="text-sm">{invoice.customer.phone}</div>
                    )}
                    {invoice.customer.address && (
                      <div className="text-sm">
                        {invoice.customer.address}
                        {invoice.customer.city && `, ${invoice.customer.city}`}
                        {invoice.customer.postalCode && `, ${invoice.customer.postalCode}`}
                      </div>
                    )}
                    {invoice.customer.vatNumber && (
                      <div className="text-xs text-gray-500 mt-2">VAT #: {invoice.customer.vatNumber}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="font-semibold mb-2 text-gray-700 border-b border-gray-200 pb-1">From:</div>
                  <div className="space-y-1">
                    <div className="font-bold">Think Mybiz Accounting</div>
                    <div className="text-sm">info@thinkmybiz.com</div>
                    <div className="text-sm">+27 12 345 6789</div>
                    <div className="text-sm">PO Box 1234, Midrand, 1685</div>
                    <div className="text-xs text-gray-500 mt-2">VAT #: 4455667788</div>
                  </div>
                </div>
              </div>
              
              {/* Items Table */}
              <div className="mb-6">
                <table className="w-full text-sm border-t border-b border-gray-200">
                  <thead>
                    <tr className="bg-blue-700 text-white">
                      <th className="py-3 px-3 font-semibold text-left">#</th>
                      <th className="py-3 px-3 font-semibold text-left">Description</th>
                      <th className="py-3 px-3 font-semibold text-center">Qty</th>
                      <th className="py-3 px-3 font-semibold text-right">Unit Price</th>
                      <th className="py-3 px-3 font-semibold text-center">VAT Rate</th>
                      <th className="py-3 px-3 font-semibold text-right">Line VAT</th>
                      <th className="py-3 px-3 font-semibold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(invoice as any).items?.map((item: any, index: number) => (
                      <tr key={index} className="hover:bg-blue-50 border-b border-gray-100">
                        <td className="py-3 px-3 text-gray-600">{index + 1}</td>
                        <td className="py-3 px-3">
                          <div className="font-medium">{item.description}</div>
                          {item.notes && (
                            <div className="text-xs text-gray-500 mt-1">{item.notes}</div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">{item.quantity}</td>
                        <td className="py-3 px-3 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-3 px-3 text-center">{item.vatRate}%</td>
                        <td className="py-3 px-3 text-right">{formatCurrency((() => {
                          // Calculate Line VAT using the same logic as PDF generator
                          const quantity = parseFloat(item.quantity?.toString() || "1");
                          const unitPrice = parseFloat(item.unitPrice?.toString() || "0");
                          const lineAmount = quantity * unitPrice;
                          const vatRate = parseFloat(item.vatRate?.toString() || "15");
                          
                          // For VAT-inclusive: VAT = amount ÷ (1 + rate/100) × (rate/100)
                          let lineVatAmount = 0;
                          if (vatRate > 0) {
                            lineVatAmount = lineAmount / (1 + vatRate / 100) * (vatRate / 100);
                          }
                          return lineVatAmount;
                        })())}</td>
                        <td className="py-3 px-3 text-right font-medium">{formatCurrency((() => {
                          // Calculate Total using the same logic as PDF generator
                          const quantity = parseFloat(item.quantity?.toString() || "1");
                          const unitPrice = parseFloat(item.unitPrice?.toString() || "0");
                          const lineAmount = quantity * unitPrice;
                          // For VAT-inclusive, the lineAmount IS the total (R10,000.00)
                          return lineAmount;
                        })())}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Summary Section */}
              <div className="flex justify-end mb-8">
                <div className="w-full max-w-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between py-1">
                      <span>Subtotal:</span>
                      <span className="font-semibold">{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>VAT (15%):</span>
                      <span className="font-semibold">{formatCurrency(invoice.vatAmount)}</span>
                    </div>
                    <div className="flex justify-between py-3 border-t border-gray-300 mt-3">
                      <span className="font-bold text-lg">TOTAL:</span>
                      <span className="font-bold text-xl text-blue-700">{formatCurrency(invoice.total)}</span>
                    </div>
                    
                    {/* Payment Status */}
                    <PaymentStatusSummary invoiceId={invoiceId} invoiceTotal={invoice.total} />
                  </div>
                </div>
              </div>
              
              {/* Payment Instructions */}
              <div className="mt-8 p-4 bg-gray-100 rounded-lg border text-sm">
                <div className="font-bold text-gray-700 mb-2">Payment Details:</div>
                <div className="space-y-1">
                  <div>Bank: ABSA Bank | Account: 123456789 | Branch: 632005</div>
                  <div>Reference: <span className="font-semibold">{invoice.invoiceNumber}</span></div>
                  <div className="text-xs text-gray-600 mt-2">
                    Please use the invoice number as your payment reference for quick allocation.
                  </div>
                </div>
              </div>
              
              {/* Notes Section */}
              {invoice.notes && (
                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="font-semibold text-gray-700 mb-2">Additional Notes:</div>
                  <div className="text-sm text-gray-700">{invoice.notes}</div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-8 text-xs text-gray-400 border-t pt-4 space-y-2">
                <div>
                  Thank you for your business! For queries, contact info@thinkmybiz.com or call +27 12 345 6789.
                </div>
                <div>
                  Company Reg: 2019/123456/07 | VAT: 4455667788 | Tax Clearance: Valid
                </div>
                <div>
                  This is a computer-generated document. No signature required.
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Payment Section - Right Side */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-28 space-y-6">
              {/* Record Payment Section */}
              <Card className="shadow-lg border-l-4 border-l-green-500">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <CreditCard className="w-5 h-5" />
                    Record Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="mb-4">
                      <div className="text-2xl font-bold text-gray-800">{formatCurrency(invoice.total)}</div>
                      <div className="text-sm text-gray-600">Invoice Total</div>
                    </div>
                    <Button 
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white h-10 font-semibold"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Record Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Payment History Section */}
              <div ref={paymentHistoryRef} className="bg-white rounded-lg shadow-lg border">
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Payment History
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <PaymentHistory invoiceId={invoiceId} />
                </div>
              </div>
            </div>
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
        invoiceNumber={invoice.invoiceNumber}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentAdded={handlePaymentAdded}
      />
    </div>
  );
}

export default InvoiceDetail;

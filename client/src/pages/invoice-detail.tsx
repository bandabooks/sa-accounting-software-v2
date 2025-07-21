import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Mail, Edit, Download, Repeat, CreditCard } from "lucide-react";
import { invoicesApi } from "@/lib/api";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils-invoice";
import { useToast } from "@/hooks/use-toast";
import { useGlobalNotification } from "@/contexts/NotificationContext";
import PaymentModal from "@/components/payment/payment-modal";
import PaymentHistory from "@/components/payment/payment-history";
import PaymentStatusSummary from "@/components/payment/payment-status-summary";
import { generateInvoicePDF } from "@/components/invoice/pdf-generator";
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
  const paymentHistoryRef = useRef<HTMLDivElement>(null);
  
  const invoiceId = parseInt(params.id || "0");

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
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Invoice {invoice.invoiceNumber}</h1>
          <div className="flex items-center mt-2 space-x-4">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </span>
            <span className="text-sm text-gray-500">
              Created on {formatDate(invoice.createdAt!)}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
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
            onClick={() => setIsEmailModalOpen(true)}
          >
            <Mail size={16} className="mr-2" />
            Send
          </Button>
          <Button 
            variant="outline"
            onClick={handlePrintPDF}
          >
            <Download size={16} className="mr-2" />
            PDF
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsRecurringModalOpen(true)}
          >
            <Repeat size={16} className="mr-2" />
            Recurring
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Invoice Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bill To</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-semibold">{invoice.customer.name}</div>
                  {invoice.customer.email && (
                    <div className="text-sm text-gray-600">{invoice.customer.email}</div>
                  )}
                  {invoice.customer.phone && (
                    <div className="text-sm text-gray-600">{invoice.customer.phone}</div>
                  )}
                  {invoice.customer.address && (
                    <div className="text-sm text-gray-600">
                      {invoice.customer.address}
                      {invoice.customer.city && `, ${invoice.customer.city}`}
                      {invoice.customer.postalCode && ` ${invoice.customer.postalCode}`}
                    </div>
                  )}
                  {invoice.customer.vatNumber && (
                    <div className="text-sm text-gray-600">
                      VAT: {invoice.customer.vatNumber}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invoice Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice Number:</span>
                    <span className="font-medium">{invoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Issue Date:</span>
                    <span>{formatDate(invoice.issueDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span>{formatDate(invoice.dueDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">Description</th>
                      <th className="text-right py-3">Qty</th>
                      <th className="text-right py-3">Unit Price</th>
                      <th className="text-right py-3">VAT %</th>
                      <th className="text-right py-3">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3">{item.description}</td>
                        <td className="text-right py-3">{item.quantity}</td>
                        <td className="text-right py-3">{formatCurrency(item.unitPrice)}</td>
                        <td className="text-right py-3">{item.vatRate}%</td>
                        <td className="text-right py-3 font-medium">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
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

      {/* Enhanced Invoice Management Features */}
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

      {/* Payment Modal */}
      <PaymentModalWrapper
        invoiceId={invoiceId}
        invoiceTotal={invoice.total}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentAdded={(paymentAmount?: string) => {
          queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
          queryClient.invalidateQueries({ queryKey: ["/api/invoices", invoiceId] });
          queryClient.invalidateQueries({ queryKey: [`/api/invoices/${invoiceId}/payments`] });
          
          // Show global success notification
          showSuccess(
            "Payment Recorded Successfully!",
            paymentAmount ? 
              `Payment of ${formatCurrency(paymentAmount)} has been processed and added to the invoice.` :
              "Your payment has been successfully recorded and applied to this invoice."
          );
          
          // Scroll to payment history after notification shows
          setTimeout(() => {
            paymentHistoryRef.current?.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
          }, 500);
        }}
      />


    </div>
  );

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
}

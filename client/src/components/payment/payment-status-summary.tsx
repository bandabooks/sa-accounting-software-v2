import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getStatusColor, getStatusDisplayName } from "@/lib/utils-invoice";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface Payment {
  id: number;
  amount: string;
  paymentMethod: string;
  paymentDate: string;
  status: string;
}

interface PaymentStatusSummaryProps {
  invoiceId: number;
  invoiceTotal: string;
}

export default function PaymentStatusSummary({ invoiceId, invoiceTotal }: PaymentStatusSummaryProps) {
  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: [`/api/invoices/${invoiceId}/payments`],
    queryFn: async () => {
      const response = await fetch(`/api/invoices/${invoiceId}/payments`);
      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }
      return response.json();
    },
  });

  const { data: invoice } = useQuery<{ status: string }>({
    queryKey: [`/api/invoices/${invoiceId}`],
  });

  if (isLoading || !payments || !invoice) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPaid = payments
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const totalInvoiceAmount = parseFloat(invoiceTotal);
  const outstandingAmount = Math.max(0, totalInvoiceAmount - totalPaid);
  const isFullyPaid = totalPaid >= totalInvoiceAmount;
  const isPartiallyPaid = totalPaid > 0 && totalPaid < totalInvoiceAmount;

  const getStatusIcon = () => {
    if (isFullyPaid) {
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    } else if (isPartiallyPaid) {
      return <Clock className="w-5 h-5 text-orange-600" />;
    } else {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusMessage = () => {
    if (isFullyPaid) {
      return "Invoice is fully paid";
    } else if (isPartiallyPaid) {
      return "Invoice is partially paid";
    } else {
      return "No payments received";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Payment Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(invoice.status)}>
              {getStatusDisplayName(invoice.status)}
            </Badge>
            <span className="text-sm text-gray-600">{getStatusMessage()}</span>
          </div>

          {/* Payment Breakdown */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Invoice Total:</span>
              <span className="font-semibold">{formatCurrency(totalInvoiceAmount)}</span>
            </div>
            
            {totalPaid > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Amount Paid:</span>
                <span className="font-semibold text-green-700">
                  {formatCurrency(totalPaid.toFixed(2))}
                </span>
              </div>
            )}
            
            {outstandingAmount > 0 && (
              <div className="flex justify-between items-center border-t pt-3">
                <span className="text-sm font-medium">Outstanding Balance:</span>
                <span className="font-bold text-red-700 text-lg">
                  {formatCurrency(outstandingAmount.toFixed(2))}
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {totalPaid > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Payment Progress</span>
                <span>{Math.round((totalPaid / totalInvoiceAmount) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    isFullyPaid ? 'bg-green-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min(100, (totalPaid / totalInvoiceAmount) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
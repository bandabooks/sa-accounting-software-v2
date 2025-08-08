import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils-invoice";
import { CreditCard, Banknote, Receipt, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Payment {
  id: number;
  amount: string;
  paymentMethod: string;
  paymentDate: string;
  reference?: string;
  notes?: string;
  status: string;
}

interface PaymentHistoryProps {
  invoiceId: number;
}

export default function PaymentHistory({ invoiceId }: PaymentHistoryProps) {
  const { data: payments, isLoading, refetch } = useQuery<Payment[]>({
    queryKey: [`/api/invoices/${invoiceId}/payments`],
    queryFn: async () => {
      const response = await fetch(`/api/invoices/${invoiceId}/payments`);
      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }
      return response.json();
    },
  });

  const handleDeletePayment = async (paymentId: number) => {
    if (!confirm("Are you sure you want to delete this payment?")) return;
    
    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete payment");
      }
      
      refetch();
    } catch (error) {
      console.error("Error deleting payment:", error);
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <Banknote className="w-4 h-4" />;
      case "card":
        return <CreditCard className="w-4 h-4" />;
      default:
        return <Receipt className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            No payments recorded yet
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalPaid = payments
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Payment History</span>
          <Badge variant="outline" className="text-sm">
            Total Paid: {formatCurrency(totalPaid.toFixed(2))}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getPaymentIcon(payment.paymentMethod)}
                <div>
                  <div className="font-semibold">
                    {formatCurrency(payment.amount)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {payment.paymentMethod.toUpperCase()}
                    {payment.reference && ` • Ref: ${payment.reference}`}
                  </div>
                  {payment.notes && (
                    <div className="text-xs text-gray-500 mt-1">
                      {payment.notes}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <Badge className={getStatusColor(payment.status)}>
                    {payment.status}
                  </Badge>
                  <div className="text-xs text-gray-500 mt-1">
                    {format(new Date(payment.paymentDate), "dd MMM yyyy")}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePayment(payment.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
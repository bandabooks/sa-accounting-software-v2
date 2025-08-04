import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Mail, Edit, FileText } from "lucide-react";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils-invoice";
import { SuccessModal } from "@/components/ui/success-modal";
import { useSuccessModal } from "@/hooks/useSuccessModal";
import { useToast } from "@/hooks/use-toast";

export default function EstimateDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const successModal = useSuccessModal();
  const queryClient = useQueryClient();
  
  const estimateId = parseInt(params.id || "0");

  const { data: estimate, isLoading } = useQuery({
    queryKey: ["/api/estimates", estimateId],
    queryFn: async () => {
      const response = await fetch(`/api/estimates/${estimateId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) throw new Error("Failed to fetch estimate");
      return response.json();
    },
    enabled: estimateId > 0
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await fetch(`/api/estimates/${estimateId}/status`, {
        method: "PUT",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/estimates", estimateId] });
      successModal.showSuccess({
        title: "Status Updated Successfully",
        description: "The estimate status has been updated and saved successfully.",
        confirmText: "Continue"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update estimate status.",
        variant: "destructive",
      });
    }
  });

  const convertToInvoiceMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/estimates/${estimateId}/convert-to-invoice`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to convert to invoice");
      return response.json();
    },
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      successModal.showSuccess({
        title: "Estimate Converted Successfully",
        description: "Your estimate has been converted to an invoice and is now ready for billing.",
        confirmText: "View Invoice",
        onConfirm: () => setLocation(`/invoices/${invoice.id}`)
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to convert estimate to invoice.",
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

  if (!estimate) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Estimate not found</h2>
        <Button onClick={() => setLocation("/estimates")}>
          Back to Estimates
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{estimate.estimateNumber}</h1>
          <p className="text-gray-600">
            Estimate for {estimate.customer.name} • {formatDate(estimate.issueDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={estimate.status}
            onValueChange={(value) => updateStatusMutation.mutate(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Mail size={16} className="mr-2" />
            Send
          </Button>
          <Button variant="outline">
            <Printer size={16} className="mr-2" />
            Print
          </Button>
          <Button 
            variant="outline" 
            onClick={() => convertToInvoiceMutation.mutate()}
            disabled={convertToInvoiceMutation.isPending}
          >
            <FileText size={16} className="mr-2" />
            Convert to Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estimate Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Estimate Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bill To</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-semibold">{estimate.customer.name}</div>
                  {estimate.customer.email && (
                    <div className="text-sm text-gray-600">{estimate.customer.email}</div>
                  )}
                  {estimate.customer.phone && (
                    <div className="text-sm text-gray-600">{estimate.customer.phone}</div>
                  )}
                  {estimate.customer.address && (
                    <div className="text-sm text-gray-600">
                      {estimate.customer.address}
                      {estimate.customer.city && `, ${estimate.customer.city}`}
                      {estimate.customer.postalCode && ` ${estimate.customer.postalCode}`}
                    </div>
                  )}
                  {estimate.customer.vatNumber && (
                    <div className="text-sm text-gray-600">
                      VAT: {estimate.customer.vatNumber}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estimate Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimate Number:</span>
                    <span className="font-medium">{estimate.estimateNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Issue Date:</span>
                    <span>{formatDate(estimate.issueDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expiry Date:</span>
                    <span>{formatDate(estimate.expiryDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(estimate.status)}`}>
                      {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
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
                    {estimate.items.map((item: any) => (
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
          {estimate.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{estimate.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(estimate.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT:</span>
                  <span>{formatCurrency(estimate.vatAmount)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(estimate.total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={successModal.hideSuccess}
        title={successModal.modalOptions.title}
        description={successModal.modalOptions.description}
        confirmText={successModal.modalOptions.confirmText}
      />
    </div>
  );
}
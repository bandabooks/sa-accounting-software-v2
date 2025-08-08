import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  FileText, 
  Mail, 
  Download, 
  Edit, 
  Copy, 
  MoreVertical, 
  Eye,
  Printer,
  User,
  Calendar,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSuccessModal } from "@/hooks/use-success-modal";
import { SuccessModal } from "@/components/ui/success-modal";
import PDFPreviewModal from "@/components/estimate/pdf-preview-modal";
import EmailEstimate from "@/components/estimate/email-estimate";
import { apiRequest } from "@/lib/queryClient";

export default function EstimateDetail() {
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const successModal = useSuccessModal();
  const [isPDFPreviewOpen, setIsPDFPreviewOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Fetch estimate data
  const { data: estimate, isLoading } = useQuery({
    queryKey: ["/api/estimates", id],
    enabled: !!id,
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      return apiRequest(`/api/estimates/${id}/status`, "PATCH", { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estimates", id] });
      toast({ 
        title: "Status Updated", 
        description: "Estimate status has been updated successfully." 
      });
    },
  });

  // Convert to invoice mutation
  const convertToInvoiceMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/estimates/${id}/convert-to-invoice`, "POST");
    },
    onSuccess: (data: any) => {
      console.log("Convert to invoice response:", data);
      console.log("Data keys:", Object.keys(data));
      console.log("Full response structure:", JSON.stringify(data, null, 2));
      
      // Try different possible response structures
      const invoiceId = data?.id || data?.data?.id || data?.invoice?.id;
      console.log("Invoice ID:", invoiceId);
      
      if (!invoiceId) {
        console.error("No invoice ID found in response:", data);
        toast({
          title: "Error",
          description: "Invoice created but unable to navigate. Please check the invoices list.",
          variant: "destructive",
        });
        return;
      }
      
      successModal.showSuccess(
        "Converted to Invoice Successfully!",
        `Estimate ${(estimate as any)?.estimateNumber} has been converted to Invoice ${data.invoiceNumber || 'successfully'}.`,
        "View Invoice",
        () => {
          console.log("Navigating to:", `/invoices/${invoiceId}`);
          setLocation(`/invoices/${invoiceId}`);
        }
      );
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to convert estimate to invoice.",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `R ${numAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy');
  };

  const sendEstimate = async () => {
    setIsEmailModalOpen(true);
  };

  const handleEmailSent = () => {
    successModal.showSuccess(
      "Estimate Sent Successfully!",
      `Estimate ${(estimate as any)?.estimateNumber} has been sent via email.`
    );
  };

  const downloadPDF = async () => {
    try {
      const response = await fetch(`/api/estimates/${id}/pdf`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `estimate-${(estimate as any)?.estimateNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download PDF.",
        variant: "destructive",
      });
    }
  };

  const duplicateEstimate = async () => {
    try {
      const response = await apiRequest(`/api/estimates/${id}/duplicate`, "POST") as any;
      successModal.showSuccess(
        "Estimate Duplicated Successfully!",
        `A copy of estimate ${(estimate as any)?.estimateNumber} has been created as ${response.estimateNumber}.`,
        "View New Estimate",
        () => setLocation(`/estimates/${response.id}`)
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate estimate.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <div className="max-w-7xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-white rounded-lg shadow-sm"></div>
            <div className="h-96 bg-white rounded-lg shadow-sm"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Estimate not found
          </h2>
          <Button onClick={() => setLocation("/estimates")} className="bg-emerald-600 hover:bg-emerald-700">
            Back to Estimates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Professional Header with Emerald Theme */}
      <div className="bg-white dark:bg-gray-800 border-b border-emerald-200 dark:border-gray-700 px-6 py-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/estimates')}
                className="hover:bg-emerald-100 dark:hover:bg-gray-700 text-emerald-700 dark:text-emerald-400"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Estimates
              </Button>
              <Separator orientation="vertical" className="h-8 bg-emerald-200" />
              
              {/* Enhanced Title Section */}
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      Estimate {(estimate as any)?.estimateNumber}
                    </h1>
                    <Badge 
                      variant="outline" 
                      className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium px-3 py-1"
                    >
                      {(estimate as any)?.status?.charAt(0).toUpperCase() + (estimate as any)?.status?.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-1 font-medium">
                    Estimate for {(estimate as any)?.customer?.name} • {formatDate((estimate as any)?.issueDate)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Enhanced Action Buttons */}
            <div className="flex items-center space-x-3">
              <Select
                value={(estimate as any).status}
                onValueChange={(value) => updateStatusMutation.mutate(value)}
              >
                <SelectTrigger className="w-36 border-emerald-200 text-emerald-700">
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
              
              <Button
                onClick={() => setIsPDFPreviewOpen(true)}
                variant="outline"
                size="sm"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={sendEstimate}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
                size="sm"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send
              </Button>
              <Button
                onClick={downloadPDF}
                variant="outline"
                size="sm"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 shadow-xl border-emerald-100">
                  <DropdownMenuItem onClick={() => setLocation(`/estimates/edit/${id}`)}>
                    <Edit className="h-4 w-4 mr-3 text-emerald-600" />
                    Edit Estimate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={duplicateEstimate}>
                    <Copy className="h-4 w-4 mr-3 text-emerald-600" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => convertToInvoiceMutation.mutate()}
                    disabled={convertToInvoiceMutation.isPending}
                  >
                    <FileText className="h-4 w-4 mr-3 text-emerald-600" />
                    Convert to Invoice
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Printer className="h-4 w-4 mr-3 text-emerald-600" />
                    Print Estimate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Document Layout */}
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-emerald-100 dark:border-gray-700 overflow-hidden">
          
          {/* Document Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-6">
            <div className="flex justify-between items-start text-white">
              <div>
                <h2 className="text-3xl font-bold mb-2">ESTIMATE</h2>
                <p className="text-emerald-100">Professional Estimate Management</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium">Estimate #: {(estimate as any)?.estimateNumber}</p>
                <p className="text-emerald-100">Date: {formatDate((estimate as any)?.issueDate || (estimate as any)?.createdAt)}</p>
                <p className="text-emerald-100">Due: {formatDate((estimate as any)?.expiryDate)}</p>
                <div className="mt-2">
                  <Badge 
                    variant="outline" 
                    className="bg-white/20 text-white border-white/30 font-medium"
                  >
                    Status: {((estimate as any)?.status || 'draft').charAt(0).toUpperCase() + ((estimate as any)?.status || 'draft').slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To and From */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Bill To */}
              <Card className="border-emerald-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200">
                  <CardTitle className="flex items-center text-emerald-700">
                    <User className="h-5 w-5 mr-2" />
                    Bill To:
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="font-bold text-lg text-gray-900 dark:text-white">
                      {(estimate as any)?.customer?.name}
                    </div>
                    {(estimate as any)?.customer?.email && (
                      <div className="text-gray-600 dark:text-gray-400">
                        {(estimate as any)?.customer?.email}
                      </div>
                    )}
                    {(estimate as any)?.customer?.phone && (
                      <div className="text-gray-600 dark:text-gray-400">
                        {(estimate as any)?.customer?.phone}
                      </div>
                    )}
                    {(estimate as any)?.customer?.address && (
                      <div className="text-gray-600 dark:text-gray-400">
                        {(estimate as any)?.customer?.address}
                        {(estimate as any)?.customer?.city && `, ${(estimate as any)?.customer?.city}`}
                        {(estimate as any)?.customer?.postalCode && ` ${(estimate as any)?.customer?.postalCode}`}
                      </div>
                    )}
                    {(estimate as any)?.customer?.vatNumber && (
                      <div className="text-gray-600 dark:text-gray-400 font-medium">
                        VAT: {(estimate as any)?.customer?.vatNumber}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* From */}
              <Card className="border-emerald-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200">
                  <CardTitle className="flex items-center text-emerald-700">
                    <DollarSign className="h-5 w-5 mr-2" />
                    From: Think Mybiz Accounting
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="font-bold text-lg text-gray-900 dark:text-white">
                      Think Mybiz Accounting
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      info@thinkmybiz.com
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      +27 12 345 6789
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      PO Box 1234, Midrand, 1685
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 font-medium">
                      VAT #: 4455667788
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Items Table */}
            <Card className="border-emerald-200 shadow-lg mb-8">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200">
                <CardTitle className="text-emerald-700">Items</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-emerald-500 text-white">
                      <tr>
                        <th className="text-left px-6 py-4 font-medium">#</th>
                        <th className="text-left px-6 py-4 font-medium">Description</th>
                        <th className="text-center px-6 py-4 font-medium">Qty</th>
                        <th className="text-right px-6 py-4 font-medium">Unit Price</th>
                        <th className="text-center px-6 py-4 font-medium">VAT Rate</th>
                        <th className="text-right px-6 py-4 font-medium">Line VAT</th>
                        <th className="text-right px-6 py-4 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {((estimate as any)?.items || []).map((item: any, index: number) => (
                        <tr key={item.id} className="border-b border-gray-200 hover:bg-emerald-50">
                          <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                            {item.description}
                          </td>
                          <td className="px-6 py-4 text-center text-gray-600">
                            {parseFloat(item.quantity).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-600">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="px-6 py-4 text-center text-gray-600">
                            {parseFloat(item.vatRate).toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 text-right text-gray-600">
                            {formatCurrency(item.vatAmount || 0)}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <div className="flex justify-end">
              <Card className="w-full max-w-md border-emerald-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200">
                  <CardTitle className="text-emerald-700">Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span className="font-medium">{formatCurrency(estimate.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>VAT (15%):</span>
                      <span className="font-medium">{formatCurrency(estimate.vatAmount)}</span>
                    </div>
                    <Separator className="bg-emerald-200" />
                    <div className="flex justify-between text-xl font-bold text-emerald-700">
                      <span>TOTAL:</span>
                      <span>{formatCurrency(estimate.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notes */}
            {estimate.notes && (
              <Card className="border-emerald-200 shadow-lg mt-8">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200">
                  <CardTitle className="text-emerald-700">Notes</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {estimate.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={successModal.hideSuccess}
        title={successModal.modalOptions.title}
        description={successModal.modalOptions.description}
        confirmText={successModal.modalOptions.confirmText}
        onConfirm={successModal.modalOptions.onConfirm}
      />
      
      {estimate && (
        <PDFPreviewModal
          estimate={estimate}
          isOpen={isPDFPreviewOpen}
          onClose={() => setIsPDFPreviewOpen(false)}
          onSendEmail={sendEstimate}
        />
      )}

      {estimate && (
        <EmailEstimate
          estimate={estimate}
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          onSent={handleEmailSent}
        />
      )}
    </div>
  );
}
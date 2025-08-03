import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { generateInvoicePDF } from "@/components/invoice/pdf-generator";
import { Download, Printer, Mail, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PDFPreviewModalProps {
  invoice: any;
  isOpen: boolean;
  onClose: () => void;
  onSendEmail?: () => void;
}

export default function PDFPreviewModal({ 
  invoice, 
  isOpen, 
  onClose, 
  onSendEmail 
}: PDFPreviewModalProps) {
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && invoice) {
      generatePreview();
    }
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [isOpen, invoice]);

  const generatePreview = async () => {
    setIsGenerating(true);
    try {
      const pdf = await generateInvoicePDF(invoice);
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error("Error generating PDF preview:", error);
      toast({
        title: "Preview Error",
        description: "Failed to generate PDF preview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!invoice) return;
    
    try {
      const pdf = await generateInvoicePDF(invoice);
      pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
      toast({
        title: "Download Complete",
        description: "Invoice PDF has been downloaded to your computer.",
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Download Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handlePrint = async () => {
    if (!pdfUrl) return;
    
    try {
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      console.error("Error printing PDF:", error);
      toast({
        title: "Print Failed",
        description: "Please try downloading the PDF instead.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span>Invoice Preview - {invoice?.invoiceNumber}</span>
            <div className="flex space-x-2">
              {onSendEmail && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onSendEmail();
                    onClose();
                  }}
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  <Mail size={16} className="mr-2" />
                  Send Email
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                disabled={!pdfUrl || isGenerating}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Printer size={16} className="mr-2" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={isGenerating}
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Download size={16} className="mr-2" />
                Download
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden">
          {isGenerating ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Generating PDF preview...</p>
              </div>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="Invoice PDF Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <p>Failed to load PDF preview</p>
                <Button 
                  variant="outline" 
                  onClick={generatePreview}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
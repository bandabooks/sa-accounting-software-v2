import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateEstimatePDF, EstimateWithCustomer } from "./pdf-generator";
import { Download, Mail, Loader2, Eye } from "lucide-react";

interface PDFPreviewModalProps {
  estimate: EstimateWithCustomer;
  isOpen: boolean;
  onClose: () => void;
  onSendEmail?: () => void;
}

export default function PDFPreviewModal({ 
  estimate, 
  isOpen, 
  onClose, 
  onSendEmail 
}: PDFPreviewModalProps) {
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && estimate) {
      generatePreview();
    }
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [isOpen, estimate]);

  const generatePreview = async () => {
    setIsGenerating(true);
    try {
      const pdf = await generateEstimatePDF(estimate);
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
    try {
      const pdf = await generateEstimatePDF(estimate);
      pdf.save(`estimate-${estimate.estimateNumber}.pdf`);
      toast({
        title: "Download Started",
        description: `Estimate ${estimate.estimateNumber} is being downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download Error", 
        description: "Failed to download PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-emerald-600" />
            <span>Estimate Preview - {estimate.estimateNumber}</span>
          </DialogTitle>
          <DialogDescription>
            Professional PDF preview of your estimate document
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col">
          {isGenerating ? (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Generating PDF preview...</p>
              </div>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="flex-1 w-full border rounded-lg"
              title="Estimate PDF Preview"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">Failed to load PDF preview</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between pt-4 border-t">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={isGenerating}
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            
            <Button
              variant="outline" 
              onClick={handlePrint}
              disabled={isGenerating || !pdfUrl}
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              Print
            </Button>
            
            {onSendEmail && (
              <Button
                onClick={onSendEmail}
                disabled={isGenerating}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            )}
          </div>
          
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
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
  estimate: any; // Accept any estimate data structure like invoice system
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
      // Clean up previous URL
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl("");
      }

      // Transform estimate data to match the PDF generator interface
      const transformedEstimate: EstimateWithCustomer = {
        id: estimate.id,
        estimateNumber: estimate.estimateNumber,
        issueDate: estimate.issueDate || estimate.createdAt,
        expiryDate: estimate.expiryDate,
        status: estimate.status,
        subtotal: parseFloat(estimate.subtotal || '0'),
        vatAmount: parseFloat(estimate.vatAmount || '0'),
        total: parseFloat(estimate.total || '0'),
        notes: estimate.notes,
        terms: estimate.terms,
        customer: {
          id: estimate.customer?.id || 0,
          name: estimate.customer?.name || 'Unknown Customer',
          email: estimate.customer?.email,
          phone: estimate.customer?.phone,
          address: estimate.customer?.address,
        },
        items: estimate.items?.map((item: any) => ({
          id: item.id,
          description: item.description || 'No description',
          quantity: parseFloat(item.quantity || '1'),
          unitPrice: parseFloat(item.unitPrice || '0'),
          vatType: item.vatType || 'standard',
          lineTotal: parseFloat(item.lineTotal || '0'),
        })) || []
      };

      console.log("Generating PDF with data:", transformedEstimate);
      const pdf = await generateEstimatePDF(transformedEstimate);
      
      if (pdf) {
        // Try data URL approach which is more compatible with browsers
        const pdfDataUri = pdf.output('datauristring');
        console.log("PDF data URI created, length:", pdfDataUri.length);
        
        if (pdfDataUri && pdfDataUri.length > 100) { // Ensure it's a valid PDF
          setPdfUrl(pdfDataUri);
        } else {
          // Fallback to blob URL
          const blob = pdf.output('blob');
          console.log("PDF blob created:", blob.size, "bytes");
          
          if (blob && blob.size > 0) {
            const url = URL.createObjectURL(blob);
            console.log("Blob URL created:", url);
            setPdfUrl(url);
          } else {
            throw new Error("PDF generation failed - no valid output");
          }
        }
      } else {
        throw new Error("PDF generation returned null");
      }
    } catch (error) {
      console.error("Error generating PDF preview:", error);
      toast({
        title: "Preview Error",
        description: "Failed to generate PDF preview. Please try again.",
        variant: "destructive",
      });
      setPdfUrl(""); // Ensure URL is cleared on error
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    try {
      // Transform estimate data to match the PDF generator interface
      const transformedEstimate: EstimateWithCustomer = {
        id: estimate.id,
        estimateNumber: estimate.estimateNumber,
        issueDate: estimate.issueDate || estimate.createdAt,
        expiryDate: estimate.expiryDate,
        status: estimate.status,
        subtotal: parseFloat(estimate.subtotal || '0'),
        vatAmount: parseFloat(estimate.vatAmount || '0'),
        total: parseFloat(estimate.total || '0'),
        notes: estimate.notes,
        terms: estimate.terms,
        customer: {
          id: estimate.customer?.id || 0,
          name: estimate.customer?.name || 'Unknown Customer',
          email: estimate.customer?.email,
          phone: estimate.customer?.phone,
          address: estimate.customer?.address,
        },
        items: estimate.items?.map((item: any) => ({
          id: item.id,
          description: item.description || 'No description',
          quantity: parseFloat(item.quantity || '1'),
          unitPrice: parseFloat(item.unitPrice || '0'),
          vatType: item.vatType || 'standard',
          lineTotal: parseFloat(item.lineTotal || '0'),
        })) || []
      };

      const pdf = await generateEstimatePDF(transformedEstimate);
      pdf.save(`estimate-${estimate.estimateNumber}.pdf`);
      toast({
        title: "Download Started",
        description: `Estimate ${estimate.estimateNumber} is being downloaded.`,
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
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
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-emerald-600" />
              <span>Estimate Preview - {estimate?.estimateNumber}</span>
            </div>
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
            <div className="flex-1 relative">
              <object
                data={pdfUrl}
                type="application/pdf"
                className="w-full h-full border rounded-lg"
                onLoad={() => console.log("PDF object loaded successfully")}
              >
                <embed
                  src={pdfUrl}
                  type="application/pdf"
                  className="w-full h-full border rounded-lg"
                />
                <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      PDF preview not available in this browser
                    </p>
                    <Button 
                      onClick={handleDownload}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download to View
                    </Button>
                  </div>
                </div>
              </object>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">Failed to load PDF preview</p>
                <Button 
                  variant="outline" 
                  onClick={generatePreview}
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  Try Again
                </Button>
              </div>
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
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Send, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { InvoiceWithCustomer } from "@shared/schema";

// Helper functions
const formatCurrency = (amount: string | number) => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR'
  }).format(value);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-ZA');
};

interface EmailInvoiceProps {
  invoice: InvoiceWithCustomer;
  isOpen: boolean;
  onClose: () => void;
  onSent: () => void;
}

export default function EmailInvoice({ invoice, isOpen, onClose, onSent }: EmailInvoiceProps) {
  const [formData, setFormData] = useState({
    to: invoice.customer.email || "",
    subject: `Invoice ${invoice.invoiceNumber} from Think Mybiz Accounting`,
    message: `Dear ${invoice.customer.name},

Please find attached your invoice ${invoice.invoiceNumber} for ${formatCurrency(invoice.total)}.

Invoice Details:
- Invoice Number: ${invoice.invoiceNumber}
- Issue Date: ${formatDate(invoice.issueDate.toString())}
- Due Date: ${formatDate(invoice.dueDate.toString())}
- Amount: ${formatCurrency(invoice.total)}

Thank you for your business!

Best regards,
Think Mybiz Accounting Team`
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiRequest("POST", "/api/invoices/send-email", {
        invoiceId: invoice.id,
        to: formData.to,
        subject: formData.subject,
        message: formData.message
      });

      toast({
        title: "Invoice sent successfully",
        description: `Invoice ${invoice.invoiceNumber} has been emailed to ${formData.to}`,
      });

      onSent();
      onClose();
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Failed to send invoice",
        description: "Please check your email configuration and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Invoice {invoice.invoiceNumber}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                type="email"
                value={formData.to || ""}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={10}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Invoice
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, X, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface EmailEstimateProps {
  estimate: any;
  isOpen: boolean;
  onClose: () => void;
  onSent: () => void;
}

const formatCurrency = (amount: string | number) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `R ${numAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '/');
};

export default function EmailEstimate({ estimate, isOpen, onClose, onSent }: EmailEstimateProps) {
  const [formData, setFormData] = useState({
    to: estimate?.customer?.email || "",
    subject: `Estimate ${estimate?.estimateNumber} from Think Mybiz Accounting`,
    message: `Dear ${estimate?.customer?.name},

Please find attached your estimate ${estimate?.estimateNumber} for ${formatCurrency(estimate?.total || 0)}.

Estimate Details:
- Estimate Number: ${estimate?.estimateNumber}
- Issue Date: ${formatDate(estimate?.issueDate || estimate?.createdAt)}
- Expiry Date: ${formatDate(estimate?.expiryDate)}
- Amount: ${formatCurrency(estimate?.total || 0)}

This estimate is valid until ${formatDate(estimate?.expiryDate)}. Please contact us if you have any questions.

Thank you for considering our services!

Best regards,
Think Mybiz Accounting Team`
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiRequest("/api/estimates/send-email", "POST", {
        estimateId: estimate.id,
        to: formData.to,
        subject: formData.subject,
        message: formData.message
      });

      toast({
        title: "Estimate sent successfully",
        description: `Estimate ${estimate.estimateNumber} has been emailed to ${formData.to}`,
      });

      onSent();
      onClose();
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Failed to send estimate",
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
              <Mail className="w-5 h-5 text-emerald-600" />
              Email Estimate {estimate?.estimateNumber}
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
                className="focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                className="focus:ring-emerald-500 focus:border-emerald-500"
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
                className="focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Estimate
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
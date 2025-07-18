import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar, Repeat, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { InvoiceWithCustomer } from "@shared/schema";

interface RecurringInvoiceProps {
  invoice: InvoiceWithCustomer;
  isOpen: boolean;
  onClose: () => void;
  onSetup: () => void;
}

export default function RecurringInvoice({ invoice, isOpen, onClose, onSetup }: RecurringInvoiceProps) {
  const [formData, setFormData] = useState({
    frequency: "monthly", // monthly, weekly, quarterly, yearly
    intervalCount: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    isActive: true,
    nextInvoiceDate: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiRequest("POST", "/api/invoices/setup-recurring", {
        invoiceId: invoice.id,
        ...formData
      });

      toast({
        title: "Recurring invoice setup complete",
        description: `Invoice ${invoice.invoiceNumber} will now be generated ${formData.frequency}`,
      });

      onSetup();
      onClose();
    } catch (error) {
      console.error("Error setting up recurring invoice:", error);
      toast({
        title: "Failed to setup recurring invoice",
        description: "Please try again later.",
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
              <Repeat className="w-5 h-5" />
              Setup Recurring Invoice
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Invoice Template</h3>
              <p className="text-sm text-blue-800">
                {invoice.invoiceNumber} - {invoice.customer.name} - R {invoice.total}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="intervalCount">Every</Label>
                <Input
                  id="intervalCount"
                  type="number"
                  min="1"
                  max="12"
                  value={formData.intervalCount}
                  onChange={(e) => setFormData({ ...formData, intervalCount: parseInt(e.target.value) })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.frequency === 'monthly' && 'months'}
                  {formData.frequency === 'weekly' && 'weeks'}
                  {formData.frequency === 'quarterly' && 'quarters'}
                  {formData.frequency === 'yearly' && 'years'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Preview</h4>
              <p className="text-sm text-gray-600">
                Next invoice will be generated on {new Date(formData.startDate).toLocaleDateString()} 
                and then every {formData.intervalCount} {formData.frequency.slice(0, -2)}
                {formData.intervalCount > 1 ? 's' : ''} thereafter.
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Setup Recurring Invoice
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
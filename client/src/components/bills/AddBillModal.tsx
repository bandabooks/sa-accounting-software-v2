import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Calculator } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AddBillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingBill?: any;
}

export default function AddBillModal({ open, onOpenChange, editingBill }: AddBillModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    companyId: (user as any)?.companyId || 0,
    supplierId: 0,
    supplierInvoiceNumber: "",
    billDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    description: "",
    subtotal: "0.00",
    vatAmount: "0.00",
    total: "0.00",
    paymentTerms: 30,
    notes: "",
    createdBy: user?.id || 0,
  });

  const [netAmount, setNetAmount] = useState("0.00");
  const [grossAmount, setGrossAmount] = useState("0.00");

  // Fetch suppliers
  const { data: suppliers } = useQuery({
    queryKey: ['/api/suppliers'],
    enabled: open,
  });

  // Calculate VAT and totals
  useEffect(() => {
    const subtotal = parseFloat(formData.subtotal) || 0;
    const vatRate = 15; // Standard SA VAT rate
    const vatAmount = subtotal * (vatRate / 100);
    const total = subtotal + vatAmount;

    setFormData(prev => ({
      ...prev,
      vatAmount: vatAmount.toFixed(2),
      total: total.toFixed(2)
    }));
    setNetAmount(subtotal.toFixed(2));
    setGrossAmount(total.toFixed(2));
  }, [formData.subtotal]);

  // Create bill mutation
  const createBillMutation = useMutation({
    mutationFn: (billData: any) => apiRequest('/api/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(billData),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bills'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bills/metrics'] });
      toast({
        title: "Success",
        description: "Bill created successfully",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Bill creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create bill",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      companyId: (user as any)?.companyId || 0,
      supplierId: 0,
      supplierInvoiceNumber: "",
      billDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: "",
      subtotal: "0.00",
      vatAmount: "0.00",
      total: "0.00",
      paymentTerms: 30,
      notes: "",
      createdBy: user?.id || 0,
    });
    setNetAmount("0.00");
    setGrossAmount("0.00");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.supplierId) {
      toast({
        title: "Error",
        description: "Please select a supplier",
        variant: "destructive",
      });
      return;
    }

    if (!formData.supplierInvoiceNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter the supplier's invoice number",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(formData.subtotal) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid subtotal amount",
        variant: "destructive",
      });
      return;
    }

    createBillMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Calculate due date when payment terms change
  useEffect(() => {
    if (formData.billDate && formData.paymentTerms) {
      const billDate = new Date(formData.billDate);
      const dueDate = new Date(billDate.getTime() + formData.paymentTerms * 24 * 60 * 60 * 1000);
      setFormData(prev => ({
        ...prev,
        dueDate: dueDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.billDate, formData.paymentTerms]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {editingBill ? 'Edit Bill' : 'Add New Bill'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Supplier & Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>Supplier & Invoice Details</CardTitle>
              <CardDescription>Enter the supplier information and their invoice details</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier *</Label>
                <Select value={formData.supplierId.toString()} onValueChange={(value) => handleInputChange('supplierId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers?.map((supplier: any) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierInvoiceNumber">Supplier Invoice Number *</Label>
                <Input
                  id="supplierInvoiceNumber"
                  value={formData.supplierInvoiceNumber}
                  onChange={(e) => handleInputChange('supplierInvoiceNumber', e.target.value)}
                  placeholder="Enter supplier's invoice number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billDate">Bill Date *</Label>
                <Input
                  id="billDate"
                  type="date"
                  value={formData.billDate}
                  onChange={(e) => handleInputChange('billDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Payment Terms (Days)</Label>
                <Select value={formData.paymentTerms.toString()} onValueChange={(value) => handleInputChange('paymentTerms', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Immediate</SelectItem>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="14">14 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="60">60 Days</SelectItem>
                    <SelectItem value="90">90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bill Details */}
          <Card>
            <CardHeader>
              <CardTitle>Bill Details</CardTitle>
              <CardDescription>Enter the bill description and amounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter bill description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subtotal">Subtotal (Excl. VAT) *</Label>
                  <Input
                    id="subtotal"
                    type="number"
                    step="0.01"
                    value={formData.subtotal}
                    onChange={(e) => handleInputChange('subtotal', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vatAmount">VAT Amount (15%)</Label>
                  <Input
                    id="vatAmount"
                    type="number"
                    step="0.01"
                    value={formData.vatAmount}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total">Total Amount</Label>
                  <Input
                    id="total"
                    type="number"
                    step="0.01"
                    value={formData.total}
                    readOnly
                    className="bg-gray-50 font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes about this bill..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Bill Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Net Amount</p>
                  <p className="text-lg font-semibold">R {netAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">VAT (15%)</p>
                  <p className="text-lg font-semibold">R {formData.vatAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-xl font-bold text-blue-600">R {grossAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-semibold text-orange-600">Pending Approval</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createBillMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createBillMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {createBillMutation.isPending ? 'Creating...' : (editingBill ? 'Update Bill' : 'Create Bill')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Calculator, AlertTriangle, CheckCircle } from "lucide-react";
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
    immediateConsumption: false,
    createdBy: user?.id || 0,
    lineItems: [] as any[],
  });

  const [lineItems, setLineItems] = useState([{
    id: 1,
    description: "",
    quantity: 1,
    unitPrice: "0.00",
    lineTotal: "0.00",
    glAccountId: 0,
    vatCodeId: null,
    vatRate: 0,
    vatAmount: "0.00",
    isInventoryItem: false,
    productId: null,
  }]);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Fetch suppliers
  const { data: suppliers } = useQuery({
    queryKey: ['/api/suppliers'],
    enabled: open,
  });

  // Fetch GL accounts (filtered for bill line items)
  const { data: glAccounts } = useQuery({
    queryKey: ['/api/chart-of-accounts'],
    enabled: open,
  });

  // Fetch VAT codes
  const { data: vatCodes } = useQuery({
    queryKey: ['/api/vat-types'],
    enabled: open,
  });

  // Validate GL account selection
  const validateGLAccountMutation = useMutation({
    mutationFn: (glAccountId: number) => apiRequest('/api/bills/validate-gl-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ glAccountId }),
    }),
  });

  // Calculate totals from line items
  useEffect(() => {
    const lineSubtotal = lineItems.reduce((sum, item) => sum + parseFloat(item.lineTotal || '0'), 0);
    const lineVATTotal = lineItems.reduce((sum, item) => sum + parseFloat(item.vatAmount || '0'), 0);
    const total = lineSubtotal + lineVATTotal;

    setFormData(prev => ({
      ...prev,
      subtotal: lineSubtotal.toFixed(2),
      vatAmount: lineVATTotal.toFixed(2),
      total: total.toFixed(2),
      lineItems: lineItems
    }));
  }, [lineItems]);

  // Add new line item
  const addLineItem = () => {
    const newItem = {
      id: Math.max(...lineItems.map(item => item.id), 0) + 1,
      description: "",
      quantity: 1,
      unitPrice: "0.00",
      lineTotal: "0.00",
      glAccountId: 0,
      vatCodeId: null,
      vatRate: 0,
      vatAmount: "0.00",
      isInventoryItem: false,
      productId: null,
    };
    setLineItems([...lineItems, newItem]);
  };

  // Remove line item
  const removeLineItem = (id: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  // Update line item
  const updateLineItem = (id: number, field: string, value: any) => {
    setLineItems(items => 
      items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate line total when quantity or unit price changes
          if (field === 'quantity' || field === 'unitPrice') {
            const quantity = parseFloat(field === 'quantity' ? value : updatedItem.quantity);
            const unitPrice = parseFloat(field === 'unitPrice' ? value : updatedItem.unitPrice);
            updatedItem.lineTotal = (quantity * unitPrice).toFixed(2);
          }

          // Recalculate VAT when line total or VAT code changes
          if (field === 'lineTotal' || field === 'vatCodeId') {
            const lineTotal = parseFloat(updatedItem.lineTotal || '0');
            const vatCode = vatCodes?.find((vat: any) => vat.id === updatedItem.vatCodeId);
            if (vatCode) {
              const vatRate = parseFloat(vatCode.rate || '0');
              updatedItem.vatRate = vatRate;
              updatedItem.vatAmount = (lineTotal * (vatRate / 100)).toFixed(2);
            } else {
              updatedItem.vatRate = 0;
              updatedItem.vatAmount = "0.00";
            }
          }

          // Validate GL account when changed
          if (field === 'glAccountId' && value) {
            validateGLAccountMutation.mutate(value, {
              onSuccess: (result) => {
                if (!result.isValid) {
                  toast({
                    title: "Invalid GL Account",
                    description: result.error,
                    variant: "destructive",
                  });
                }
              }
            });
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

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
      
      // Handle validation errors
      if (error.status === 422 && error.errors) {
        setValidationErrors(error.errors);
        toast({
          title: "Validation Failed",
          description: `${error.errors.length} validation error(s) found`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create bill",
          variant: "destructive",
        });
      }
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
      immediateConsumption: false,
      createdBy: user?.id || 0,
      lineItems: [],
    });
    setLineItems([{
      id: 1,
      description: "",
      quantity: 1,
      unitPrice: "0.00",
      lineTotal: "0.00",
      glAccountId: 0,
      vatCodeId: null,
      vatRate: 0,
      vatAmount: "0.00",
      isInventoryItem: false,
      productId: null,
    }]);
    setValidationErrors([]);
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

    if (lineItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one line item",
        variant: "destructive",
      });
      return;
    }

    if (lineItems.some(item => !item.glAccountId || parseFloat(item.lineTotal) <= 0)) {
      toast({
        title: "Error",
        description: "All line items must have a valid GL account and amount",
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
              <CardDescription>Enter the bill description and options</CardDescription>
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

              <div className="flex items-center space-x-2">
                <Switch
                  id="immediateConsumption"
                  checked={formData.immediateConsumption}
                  onCheckedChange={(checked) => handleInputChange('immediateConsumption', checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="immediateConsumption">Immediate Consumption</Label>
                  <p className="text-sm text-gray-600">
                    Enable for inventory items that should be posted to COGS instead of inventory accounts
                  </p>
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

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Line Items *
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLineItem}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Line
                </Button>
              </CardTitle>
              <CardDescription>Add line items with GL account allocation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {validationErrors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-800">Validation Errors:</span>
                  </div>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {lineItems.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Line {index + 1}</h4>
                    {lineItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2 space-y-2">
                      <Label>Description *</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                        placeholder="Line item description"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>GL Account *</Label>
                      <Select 
                        value={item.glAccountId.toString()} 
                        onValueChange={(value) => updateLineItem(item.id, 'glAccountId', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select GL account" />
                        </SelectTrigger>
                        <SelectContent>
                          {glAccounts?.filter((account: any) => {
                            const accountType = account.accountType?.toLowerCase() || '';
                            const accountName = account.accountName?.toLowerCase() || '';
                            // Filter out disallowed account types
                            const disallowed = ['bank', 'cash', 'accounts payable', 'accounts receivable', 'vat control', 'vat input', 'vat output'];
                            return !disallowed.some(type => accountType.includes(type) || accountName.includes(type));
                          }).map((account: any) => (
                            <SelectItem key={account.id} value={account.id.toString()}>
                              {account.accountCode} - {account.accountName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>VAT Code</Label>
                      <Select 
                        value={item.vatCodeId?.toString() || ''} 
                        onValueChange={(value) => updateLineItem(item.id, 'vatCodeId', value ? parseInt(value) : null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select VAT code" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No VAT</SelectItem>
                          {vatCodes?.map((vat: any) => (
                            <SelectItem key={vat.id} value={vat.id.toString()}>
                              {vat.name} ({vat.rate}%)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        placeholder="1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(item.id, 'unitPrice', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Line Total</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.lineTotal}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>VAT Amount</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.vatAmount}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`inventory-${item.id}`}
                        checked={item.isInventoryItem}
                        onCheckedChange={(checked) => updateLineItem(item.id, 'isInventoryItem', checked)}
                      />
                      <Label htmlFor={`inventory-${item.id}`} className="text-sm">
                        Inventory Item
                      </Label>
                    </div>
                  </div>
                </div>
              ))}
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
                  <p className="text-lg font-semibold">R {formData.subtotal}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">VAT Amount</p>
                  <p className="text-lg font-semibold">R {formData.vatAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-xl font-bold text-blue-600">R {formData.total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Line Items</p>
                  <p className="text-lg font-semibold text-purple-600">{lineItems.length}</p>
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
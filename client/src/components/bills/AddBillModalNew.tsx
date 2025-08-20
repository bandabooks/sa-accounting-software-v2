import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Calculator, AlertTriangle, CheckCircle, DollarSign } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AddBillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddBillModal({ open, onOpenChange }: AddBillModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("basic-details");

  const [billData, setBillData] = useState({
    companyId: (user as any)?.companyId || 0,
    supplierId: 0,
    supplierInvoiceNumber: "",
    billDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: "",
    notes: "",
    paymentTerms: 30,
    immediateConsumption: false,
    vatCalculationMethod: "exclusive" as "inclusive" | "exclusive", // Same as invoices
    createdBy: user?.id || 0,
  });

  // Expense Allocations (GL-based entries without quantity)
  const [expenseAllocations, setExpenseAllocations] = useState([{
    id: 1,
    description: "",
    glAccountId: 0,
    vatCodeId: null,
    amount: "0.00",
    vatAmount: "0.00",
    vatRate: 0,
  }]);

  // Line Items (Product/Service catalog items with quantity)
  const [lineItems, setLineItems] = useState([{
    id: 1,
    productId: null,
    description: "",
    quantity: 1,
    unitPrice: "0.00",
    discount: "0.00",
    lineTotal: "0.00",
    vatCodeId: null,
    vatRate: 0,
    vatAmount: "0.00",
    immediateConsumption: false,
  }]);

  const [totals, setTotals] = useState({
    subtotal: "0.00",
    vatAmount: "0.00",
    total: "0.00",
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Fetch suppliers
  const { data: suppliers } = useQuery({
    queryKey: ['/api/suppliers'],
    enabled: open,
  });

  // Fetch GL accounts (filtered for expense allocations)
  const { data: glAccounts } = useQuery({
    queryKey: ['/api/chart-of-accounts'],
    enabled: open,
  });

  // Fetch VAT codes
  const { data: vatCodes } = useQuery({
    queryKey: ['/api/vat-types'],
    enabled: open,
  });

  // Fetch products/services
  const { data: products } = useQuery({
    queryKey: ['/api/products'],
    enabled: open,
  });

  // Calculate totals from both expense allocations and line items
  useEffect(() => {
    const expenseSubtotal = expenseAllocations.reduce((sum, item) => sum + parseFloat(item.amount || '0'), 0);
    const expenseVAT = expenseAllocations.reduce((sum, item) => sum + parseFloat(item.vatAmount || '0'), 0);
    
    const lineSubtotal = lineItems.reduce((sum, item) => sum + parseFloat(item.lineTotal || '0'), 0);
    const lineVAT = lineItems.reduce((sum, item) => sum + parseFloat(item.vatAmount || '0'), 0);
    
    const totalSubtotal = expenseSubtotal + lineSubtotal;
    const totalVAT = expenseVAT + lineVAT;
    const grandTotal = totalSubtotal + totalVAT;

    setTotals({
      subtotal: totalSubtotal.toFixed(2),
      vatAmount: totalVAT.toFixed(2),
      total: grandTotal.toFixed(2),
    });
  }, [expenseAllocations, lineItems]);

  // Expense Allocation Functions
  const addExpenseAllocation = () => {
    const newAllocation = {
      id: Math.max(...expenseAllocations.map(item => item.id), 0) + 1,
      description: "",
      glAccountId: 0,
      vatCodeId: null,
      amount: "0.00",
      vatAmount: "0.00",
      vatRate: 0,
    };
    setExpenseAllocations([...expenseAllocations, newAllocation]);
  };

  const removeExpenseAllocation = (id: number) => {
    if (expenseAllocations.length > 1) {
      setExpenseAllocations(expenseAllocations.filter(item => item.id !== id));
    }
  };

  const updateExpenseAllocation = (id: number, field: string, value: any) => {
    setExpenseAllocations(items => 
      items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate VAT when amount or VAT code changes (using same logic as invoices)
          if (field === 'amount' || field === 'vatCodeId') {
            const amount = parseFloat(field === 'amount' ? value : updatedItem.amount);
            const vatCode = (vatCodes as any)?.find((vat: any) => vat.id === updatedItem.vatCodeId);
            if (vatCode) {
              const vatRate = parseFloat(vatCode.rate || '0');
              updatedItem.vatRate = vatRate;
              
              if (vatRate === 0) {
                updatedItem.vatAmount = "0.00";
              } else {
                // Use the same VAT calculation logic as invoices
                let calculatedVAT = 0;
                if (billData.vatCalculationMethod === 'inclusive') {
                  // For inclusive method: VAT = amount * (rate / (100 + rate))
                  calculatedVAT = amount * (vatRate / (100 + vatRate));
                } else {
                  // For exclusive method: VAT = amount * (rate / 100)
                  calculatedVAT = amount * (vatRate / 100);
                }
                updatedItem.vatAmount = calculatedVAT.toFixed(2);
              }
            } else {
              updatedItem.vatRate = 0;
              updatedItem.vatAmount = "0.00";
            }
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  // Line Item Functions
  const addLineItem = () => {
    const newItem = {
      id: Math.max(...lineItems.map(item => item.id), 0) + 1,
      productId: null,
      description: "",
      quantity: 1,
      unitPrice: "0.00",
      discount: "0.00",
      lineTotal: "0.00",
      vatCodeId: null,
      vatRate: 0,
      vatAmount: "0.00",
      immediateConsumption: false,
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: number, field: string, value: any) => {
    setLineItems(items => 
      items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Auto-populate from product selection
          if (field === 'productId' && value) {
            const product = (products as any)?.find((p: any) => p.id === value);
            if (product) {
              updatedItem.description = product.name;
              updatedItem.unitPrice = product.price || "0.00";
              updatedItem.vatCodeId = product.vatCodeId;
            }
          }
          
          // Recalculate line total when quantity, unit price, or discount changes
          if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
            const quantity = parseFloat(field === 'quantity' ? value : updatedItem.quantity);
            const unitPrice = parseFloat(field === 'unitPrice' ? value : updatedItem.unitPrice);
            const discount = parseFloat(field === 'discount' ? value : updatedItem.discount);
            
            const lineTotal = (quantity * unitPrice) - discount;
            updatedItem.lineTotal = Math.max(0, lineTotal).toFixed(2);
          }

          // Recalculate VAT when line total or VAT code changes
          if (field === 'lineTotal' || field === 'vatCodeId' || 
              field === 'quantity' || field === 'unitPrice' || field === 'discount') {
            const lineTotal = parseFloat(updatedItem.lineTotal || '0');
            const vatCode = (vatCodes as any)?.find((vat: any) => vat.id === updatedItem.vatCodeId);
            if (vatCode) {
              const vatRate = parseFloat(vatCode.rate || '0');
              updatedItem.vatRate = vatRate;
              updatedItem.vatAmount = (lineTotal * (vatRate / 100)).toFixed(2);
            } else {
              updatedItem.vatRate = 0;
              updatedItem.vatAmount = "0.00";
            }
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  // Create bill mutation
  const createBillMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/bills', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bills'] });
      toast({
        title: "Success",
        description: "Bill created successfully",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Bill creation error:', error);
      
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

  const handleInputChange = (field: string, value: any) => {
    setBillData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    if (!billData.supplierId) {
      toast({
        title: "Error",
        description: "Please select a supplier",
        variant: "destructive",
      });
      return;
    }

    // Validate expense allocations
    const validExpenseAllocations = expenseAllocations.filter(item => 
      item.glAccountId && parseFloat(item.amount) > 0
    );

    // Validate line items
    const validLineItems = lineItems.filter(item => 
      (item.productId || item.description) && parseFloat(item.lineTotal) > 0
    );

    if (validExpenseAllocations.length === 0 && validLineItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one expense allocation or line item",
        variant: "destructive",
      });
      return;
    }

    const billPayload = {
      ...billData,
      expenseAllocations: validExpenseAllocations,
      lineItems: validLineItems,
      subtotal: totals.subtotal,
      vatAmount: totals.vatAmount,
      total: totals.total,
    };

    createBillMutation.mutate(billPayload);
  };

  const resetForm = () => {
    setBillData({
      companyId: (user as any)?.companyId || 0,
      supplierId: 0,
      supplierInvoiceNumber: "",
      billDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: "",
      notes: "",
      paymentTerms: 30,
      immediateConsumption: false,
      createdBy: user?.id || 0,
    });
    setExpenseAllocations([{
      id: 1,
      description: "",
      glAccountId: 0,
      vatCodeId: null,
      amount: "0.00",
      vatAmount: "0.00",
      vatRate: 0,
    }]);
    setLineItems([{
      id: 1,
      productId: null,
      description: "",
      quantity: 1,
      unitPrice: "0.00",
      discount: "0.00",
      lineTotal: "0.00",
      vatCodeId: null,
      vatRate: 0,
      vatAmount: "0.00",
      immediateConsumption: false,
    }]);
    setValidationErrors([]);
    setActiveTab("basic-details");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Bill</DialogTitle>
          <DialogDescription>
            Create a new bill with expense allocations and line items, following proper accounting workflows
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bill Header */}
          <Card>
            <CardHeader>
              <CardTitle>Supplier & Invoice Details</CardTitle>
              <CardDescription>Enter the supplier information and their invoice details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Select 
                    value={billData.supplierId.toString()} 
                    onValueChange={(value) => handleInputChange('supplierId', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Select Supplier</SelectItem>
                      {(suppliers as any)?.map((supplier: any) => (
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
                    value={billData.supplierInvoiceNumber}
                    onChange={(e) => handleInputChange('supplierInvoiceNumber', e.target.value)}
                    placeholder="Enter supplier's invoice number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billDate">Bill Date *</Label>
                  <Input
                    id="billDate"
                    type="date"
                    value={billData.billDate}
                    onChange={(e) => handleInputChange('billDate', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms (Days)</Label>
                  <Select 
                    value={billData.paymentTerms.toString()} 
                    onValueChange={(value) => handleInputChange('paymentTerms', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment terms" />
                    </SelectTrigger>
                    <SelectContent>
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
                    value={billData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={billData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter bill description"
                />
              </div>

              {/* VAT Calculation Method - Same as invoices */}
              <div className="space-y-2">
                <Label htmlFor="vatCalculationMethod">VAT Calculation Method</Label>
                <Select
                  value={billData.vatCalculationMethod}
                  onValueChange={(value: "inclusive" | "exclusive") => 
                    handleInputChange('vatCalculationMethod', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exclusive">Exclusive (Add VAT)</SelectItem>
                    <SelectItem value="inclusive">Inclusive (VAT included)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="immediateConsumption"
                  checked={billData.immediateConsumption}
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
                  value={billData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes about this bill..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Expense Allocations and Line Items */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic-details" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Basic Details
              </TabsTrigger>
              <TabsTrigger value="line-items" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Line Items
              </TabsTrigger>
              <TabsTrigger value="recurring-options" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Recurring Options
              </TabsTrigger>
            </TabsList>

            {/* Basic Details Tab - Expense Allocations */}
            <TabsContent value="basic-details">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Expense Allocations
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addExpenseAllocation}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Allocation
                    </Button>
                  </CardTitle>
                  <CardDescription>Allocate expenses to GL accounts (no quantity/unit price)</CardDescription>
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

                  {/* Professional table-style expense allocations */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b">
                      <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                        <div className="col-span-4">Description</div>
                        <div className="col-span-3">GL Account</div>
                        <div className="col-span-2">VAT Code</div>
                        <div className="col-span-2">Amount (Excl. VAT)</div>
                        <div className="col-span-1">Actions</div>
                      </div>
                    </div>
                    
                    {expenseAllocations.map((allocation, index) => (
                      <div key={allocation.id} className="border-b last:border-b-0">
                        <div className="px-4 py-3">
                          <div className="grid grid-cols-12 gap-4 items-center">
                            {/* Description */}
                            <div className="col-span-4">
                              <Input
                                value={allocation.description}
                                onChange={(e) => updateExpenseAllocation(allocation.id, 'description', e.target.value)}
                                placeholder="Expense description"
                                className="h-9"
                              />
                            </div>

                            {/* GL Account */}
                            <div className="col-span-3">
                              <Select 
                                value={allocation.glAccountId.toString() || '0'} 
                                onValueChange={(value) => updateExpenseAllocation(allocation.id, 'glAccountId', parseInt(value))}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Select GL account" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">Select GL Account</SelectItem>
                                  {(glAccounts as any)?.filter((account: any) => {
                                    const accountType = account.accountType?.toLowerCase() || '';
                                    const accountName = account.accountName?.toLowerCase() || '';
                                    // Filter out control accounts
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

                            {/* VAT Code */}
                            <div className="col-span-2">
                              <Select 
                                value={allocation.vatCodeId?.toString() || '0'} 
                                onValueChange={(value) => updateExpenseAllocation(allocation.id, 'vatCodeId', value === '0' ? null : parseInt(value))}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="VAT" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">No VAT</SelectItem>
                                  {(vatCodes as any)?.map((vat: any) => (
                                    <SelectItem key={vat.id} value={vat.id.toString()}>
                                      {vat.name} ({vat.rate}%)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Amount */}
                            <div className="col-span-2">
                              <div className="space-y-1">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={allocation.amount}
                                  onChange={(e) => updateExpenseAllocation(allocation.id, 'amount', e.target.value)}
                                  placeholder="0.00"
                                  className="h-9"
                                />
                                <div className="text-xs text-gray-500">VAT: R {allocation.vatAmount}</div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="col-span-1 flex justify-center">
                              {expenseAllocations.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeExpenseAllocation(allocation.id)}
                                  className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Line Items Tab - Product/Service Items */}
            <TabsContent value="line-items">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Line Items
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addLineItem}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Item
                    </Button>
                  </CardTitle>
                  <CardDescription>Add products/services with quantities and pricing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Professional table-style line items */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b">
                      <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                        <div className="col-span-3">Item/Description</div>
                        <div className="col-span-1">Qty</div>
                        <div className="col-span-2">Unit Price</div>
                        <div className="col-span-1">Disc.</div>
                        <div className="col-span-2">VAT Code</div>
                        <div className="col-span-2">Line Total</div>
                        <div className="col-span-1">Actions</div>
                      </div>
                    </div>
                    
                    {lineItems.map((item, index) => (
                      <div key={item.id} className="border-b last:border-b-0">
                        <div className="px-4 py-3">
                          <div className="grid grid-cols-12 gap-4 items-center">
                            {/* Item/Description */}
                            <div className="col-span-3 space-y-2">
                              <Select 
                                value={item.productId?.toString() || '0'} 
                                onValueChange={(value) => updateLineItem(item.id, 'productId', value === '0' ? null : parseInt(value))}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Select item" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">Manual Entry</SelectItem>
                                  {(products as any)?.map((product: any) => (
                                    <SelectItem key={product.id} value={product.id.toString()}>
                                      {product.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Input
                                value={item.description}
                                onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                                placeholder="Item description"
                                className="h-9 text-sm"
                              />
                            </div>

                            {/* Quantity */}
                            <div className="col-span-1">
                              <Input
                                type="number"
                                step="0.0001"
                                value={item.quantity}
                                onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                placeholder="1"
                                className="h-9 text-center"
                              />
                            </div>

                            {/* Unit Price */}
                            <div className="col-span-2">
                              <Input
                                type="number"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => updateLineItem(item.id, 'unitPrice', e.target.value)}
                                placeholder="0.00"
                                className="h-9"
                              />
                            </div>

                            {/* Discount */}
                            <div className="col-span-1">
                              <Input
                                type="number"
                                step="0.01"
                                value={item.discount}
                                onChange={(e) => updateLineItem(item.id, 'discount', e.target.value)}
                                placeholder="0.00"
                                className="h-9"
                              />
                            </div>

                            {/* VAT Code */}
                            <div className="col-span-2">
                              <Select 
                                value={item.vatCodeId?.toString() || '0'} 
                                onValueChange={(value) => updateLineItem(item.id, 'vatCodeId', value === '0' ? null : parseInt(value))}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="VAT" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">No VAT</SelectItem>
                                  {(vatCodes as any)?.map((vat: any) => (
                                    <SelectItem key={vat.id} value={vat.id.toString()}>
                                      {vat.name} ({vat.rate}%)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Line Total */}
                            <div className="col-span-2">
                              <div className="text-right">
                                <div className="font-medium">R {item.lineTotal}</div>
                                <div className="text-xs text-gray-500">VAT: R {item.vatAmount}</div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="col-span-1 flex justify-center">
                              {lineItems.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeLineItem(item.id)}
                                  className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Additional options row */}
                          <div className="mt-2 flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`immediate-${item.id}`}
                                checked={item.immediateConsumption}
                                onCheckedChange={(checked) => updateLineItem(item.id, 'immediateConsumption', checked)}
                              />
                              <Label htmlFor={`immediate-${item.id}`} className="text-xs text-gray-600">
                                Immediate Consumption
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recurring Options Tab */}
            <TabsContent value="recurring-options">
              <Card>
                <CardHeader>
                  <CardTitle>Recurring Options</CardTitle>
                  <CardDescription>Set up recurring bill options (future enhancement)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                    <CheckCircle className="h-12 w-12 mb-2" />
                    <p>Recurring bill options will be available in a future update</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Bill Summary */}
          <Card>
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
                  <p className="text-lg font-semibold">R {totals.subtotal}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">VAT Amount</p>
                  <p className="text-lg font-semibold">R {totals.vatAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-xl font-bold text-blue-600">R {totals.total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-semibold text-orange-600">Unpaid</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createBillMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createBillMutation.isPending ? "Creating..." : "Create Bill"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
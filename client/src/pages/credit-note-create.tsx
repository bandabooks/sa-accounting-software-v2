import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Calculator,
  CreditCard,
  Plus,
  Trash2,
  FileText,
  User,
  Calendar,
  Tag,
  AlertCircle,
  Info
} from "lucide-react";
import { formatCurrency } from "@/lib/utils-invoice";
import { useToast } from "@/hooks/use-toast";
import { useGlobalNotification } from "@/contexts/NotificationContext";
import { CustomerSelect } from "@/components/CustomerSelect";
import { ProductServiceSelect } from "@/components/ProductServiceSelect";
import { VATTypeSelect } from "@/components/ui/vat-type-select";
import { VATConditionalWrapper, VATFieldWrapper } from "@/components/vat/VATConditionalWrapper";
import { useVATStatus } from "@/hooks/useVATStatus";
import { apiRequest } from "@/lib/queryClient";
import type { Customer, Product, Invoice } from "@shared/schema";

// Credit Note Item Interface
interface CreditNoteItem {
  productId?: number;
  description: string;
  quantity: string;
  unitPrice: string;
  vatRate: string;
  vatInclusive: boolean;
  vatAmount: string;
  vatTypeId: number; // Match invoice format exactly
}

const creditNoteReasons = [
  { value: 'defective_goods', label: 'Defective Goods' },
  { value: 'incorrect_billing', label: 'Incorrect Billing' },
  { value: 'returned_goods', label: 'Returned Goods' },
  { value: 'pricing_error', label: 'Pricing Error' },
  { value: 'cancelled_service', label: 'Cancelled Service' },
  { value: 'customer_complaint', label: 'Customer Complaint' },
  { value: 'discount_adjustment', label: 'Discount Adjustment' },
  { value: 'other', label: 'Other' }
];

export default function CreditNoteCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { showSuccess } = useGlobalNotification();
  const queryClient = useQueryClient();

  // VAT Status Hook
  const { shouldShowVATFields } = useVATStatus();

  const [formData, setFormData] = useState({
    customerId: "",
    invoiceId: "",
    creditNoteNumber: `CN-${Date.now()}`,
    issueDate: new Date().toISOString().split('T')[0],
    reason: "",
    status: "draft",
    notes: "",
    globalVatType: "1", // Default to Standard Rate (15%)
    vatCalculationMethod: "inclusive" as "inclusive" | "exclusive"
  });

  const [items, setItems] = useState<CreditNoteItem[]>([
    {
      productId: undefined,
      description: "",
      quantity: "1",
      unitPrice: "0.00",
      vatRate: "15.00",
      vatInclusive: true,
      vatAmount: "0.00",
      vatTypeId: 1 // Default to Standard Rate (15%) - Match invoice format exactly
    }
  ]);

  // Load Customers
  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
  });

  // Load Customer Invoices for reference
  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
    enabled: !!formData.customerId,
  });

  // Fetch VAT types from database for dynamic calculation
  const { data: vatTypesData = [] } = useQuery({
    queryKey: ["/api/companies", 2, "vat-types"],
    retry: false,
  });
  
  // Ensure we have array of VAT types
  const vatTypes = Array.isArray(vatTypesData) ? vatTypesData : [];

  // Dynamic VAT calculation using database VAT types
  const calculateItemVAT = (item: CreditNoteItem) => {
    const quantity = parseFloat(item.quantity || "0");
    const unitPrice = parseFloat(item.unitPrice || "0");
    const lineAmount = quantity * unitPrice;
    
    if (item.vatTypeId && shouldShowVATFields && vatTypes.length > 0) {
      // Find VAT type from database
      const vatType = vatTypes.find((type: any) => type.id === item.vatTypeId);
      
      if (vatType) {
        const vatRate = parseFloat(vatType.rate);
        
        // CRITICAL: If line item is Zero-Rated, Exempt, or No VAT, return 0 regardless of global method
        if (vatRate === 0) {
          console.log(`VAT Calculation: lineAmount=R${lineAmount}, vatTypeId=${item.vatTypeId}, ${vatType.code} - ${vatType.name}, VAT=R0.00 (${vatType.code.toLowerCase()})`);
          return 0;
        }
        
        // For Standard rate items, ALWAYS respect the global VAT calculation method
        let calculatedVAT = 0;
        if (formData.vatCalculationMethod === 'inclusive') {
          // For inclusive method: VAT = lineAmount * (rate / (100 + rate))
          calculatedVAT = lineAmount * (vatRate / (100 + vatRate));
        } else {
          // For exclusive method: VAT = lineAmount * (rate / 100)
          calculatedVAT = lineAmount * (vatRate / 100);
        }
        
        console.log(`VAT Calculation: lineAmount=R${lineAmount}, ${vatType.code} - ${vatType.name}, global_method=${formData.vatCalculationMethod}, VAT=R${calculatedVAT.toFixed(2)}`);
        return calculatedVAT;
      }
    }
    
    // Fallback to traditional calculation if no VAT type ID or VAT types not loaded
    const vatRate = parseFloat(item.vatRate || "0") / 100;
    if (vatRate === 0) return 0; // Zero rate items always have zero VAT
    
    return formData.vatCalculationMethod === 'inclusive' ? 
      lineAmount * (vatRate / (1 + vatRate)) : 
      lineAmount * vatRate;
  };

  const createCreditNote = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/credit-notes', 'POST', data);
      return response;
    },
    onSuccess: (creditNote: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/credit-notes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chart-of-accounts"] });
      showSuccess(
        "Credit Note Created Successfully",
        `Credit Note ${creditNote.creditNoteNumber || formData.creditNoteNumber} has been created and is ready for review.`
      );
      setLocation(`/credit-notes`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create credit note. Please try again.",
        variant: "destructive",
      });
    }
  });

  const addItem = () => {
    setItems([...items, { 
      productId: undefined, 
      description: "", 
      quantity: "1", 
      unitPrice: "0.00", 
      vatRate: "15.00",
      vatInclusive: true, 
      vatAmount: "0.00",
      vatTypeId: 1 // Default to Standard Rate (15%) - Match invoice format exactly
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof CreditNoteItem, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    
    // Auto-calculate VAT amount when relevant fields change
    if (field === 'quantity' || field === 'unitPrice' || field === 'vatTypeId' || field === 'vatRate') {
      const calculatedVAT = calculateItemVAT(newItems[index]);
      newItems[index].vatAmount = calculatedVAT.toFixed(2);
    }
    
    setItems(newItems);
  };

  const handleProductSelect = (index: number, product: Product) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productId: product.id,
      description: product.description || product.name,
      unitPrice: product.unitPrice,
      vatRate: product.vatRate || "15",
      vatTypeId: product.vatRate === "0" ? 2 : 1 // Smart VAT type detection (2=zero_rated, 1=standard)
    };
    
    // Auto-calculate VAT amount for the updated item
    const calculatedVAT = calculateItemVAT(newItems[index]);
    newItems[index].vatAmount = calculatedVAT.toFixed(2);
    
    setItems(newItems);
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    const quantity = parseFloat(item.quantity || "0");
    const unitPrice = parseFloat(item.unitPrice || "0");
    return sum + (quantity * unitPrice);
  }, 0);

  const vatAmount = items.reduce((sum, item) => {
    return sum + parseFloat(item.vatAmount || "0");
  }, 0);

  const total = subtotal + vatAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.customerId) {
      toast({
        title: "Validation Error",
        description: "Please select a customer.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.reason) {
      toast({
        title: "Validation Error",
        description: "Please select a reason for the credit note.",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0 || items.some(item => !item.description.trim())) {
      toast({
        title: "Validation Error", 
        description: "Please add at least one item with a description.",
        variant: "destructive",
      });
      return;
    }

    const creditNoteData = {
      customerId: parseInt(formData.customerId),
      invoiceId: formData.invoiceId ? parseInt(formData.invoiceId) : null,
      creditNoteNumber: formData.creditNoteNumber,
      issueDate: formData.issueDate,
      reason: formData.reason,
      status: formData.status,
      notes: formData.notes,
      subtotal: subtotal.toFixed(2),
      vatAmount: vatAmount.toFixed(2),
      total: total.toFixed(2),
      vatCalculationMethod: formData.vatCalculationMethod,
      globalVatType: formData.globalVatType,
      items: items.map(item => ({
        description: item.description,
        quantity: parseFloat(item.quantity) || 0,
        unitPrice: parseFloat(item.unitPrice) || 0,
        vatRate: parseFloat(item.vatRate) || 0,
        vatAmount: parseFloat(item.vatAmount) || 0,
        vatInclusive: item.vatInclusive,
        vatTypeId: parseInt(item.vatTypeId)
      }))
    };

    createCreditNote.mutate(creditNoteData);
  };

  // Filter invoices by selected customer
  const customerInvoices = invoices.filter(invoice => 
    invoice.customerId === parseInt(formData.customerId)
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/credit-notes")}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Credit Notes
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Credit Note</h1>
            <p className="text-gray-600">Issue a credit note to your customer</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-red-50 text-red-700">
          <CreditCard className="h-3 w-3 mr-1" />
          Draft
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <User className="h-5 w-5 mr-2 text-red-600" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Customer</label>
                    <CustomerSelect
                      value={formData.customerId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}
                      placeholder="Select customer..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Reference Invoice (Optional)</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      value={formData.invoiceId}
                      onChange={(e) => setFormData(prev => ({ ...prev, invoiceId: e.target.value }))}
                      disabled={!formData.customerId}
                    >
                      <option value="">Select reference invoice...</option>
                      {customerInvoices.map((invoice) => (
                        <option key={invoice.id} value={invoice.id.toString()}>
                          {invoice.invoiceNumber} - {formatCurrency(invoice.total)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Credit Note Number</label>
                    <Input
                      value={formData.creditNoteNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, creditNoteNumber: e.target.value }))}
                      className="w-full"
                      placeholder="CN-001"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Issue Date</label>
                    <Input
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="draft">Draft</option>
                      <option value="issued">Issued</option>
                      <option value="applied">Applied</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Reason for Credit Note</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    required
                  >
                    <option value="">Select reason...</option>
                    {creditNoteReasons.map((reason) => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Credit Note Items */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center text-lg">
                      <Calculator className="h-5 w-5 mr-2 text-red-600" />
                      Credit Note Items
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Add items being credited to the customer</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                    className="flex items-center gap-2 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 border-red-200"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gradient-to-r from-gray-50 to-red-50">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Product Selection */}
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-gray-700">Product/Service</label>
                        <ProductServiceSelect
                          value={item.productId}
                          onValueChange={(productId) => {
                            updateItem(index, 'productId', productId);
                          }}
                          onProductSelect={(product: Product) => handleProductSelect(index, product)}
                          placeholder="Select or create product/service..."
                        />
                      </div>
                      
                      {/* Description */}
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <Input
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          className="w-full"
                        />
                      </div>

                      {/* Quantity */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Quantity</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Unit Price</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                        />
                      </div>

                      {/* VAT Type Selection */}
                      <VATFieldWrapper>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">VAT Type</label>
                          <VATTypeSelect
                            value={item.vatTypeId.toString()}
                            onValueChange={(vatTypeId) => updateItem(index, 'vatTypeId', parseInt(vatTypeId))}
                            placeholder="Select VAT type..."
                          />
                        </div>
                      </VATFieldWrapper>

                      {/* VAT Amount Display */}
                      <VATFieldWrapper>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">VAT Amount</label>
                          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-600">
                            {formatCurrency(item.vatAmount)}
                          </div>
                        </div>
                      </VATFieldWrapper>

                      {/* Line Total Display */}
                      <div className="md:col-span-2 mt-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Credit Amount:</span>
                          <span className="text-lg font-semibold text-red-700">
                            {formatCurrency(
                              (
                                parseFloat(item.quantity || "0") * 
                                parseFloat(item.unitPrice || "0") + 
                                parseFloat(item.vatAmount || "0")
                              ).toFixed(2)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* VAT Treatment */}
                <VATConditionalWrapper>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Credit Note VAT Treatment</label>
                      <VATTypeSelect
                        value={formData.globalVatType}
                        onValueChange={(vatTypeId) => setFormData(prev => ({ ...prev, globalVatType: vatTypeId }))}
                        placeholder="Select VAT treatment..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">VAT Calculation Method</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        value={formData.vatCalculationMethod}
                        onChange={(e) => setFormData(prev => ({ ...prev, vatCalculationMethod: e.target.value as "inclusive" | "exclusive" }))}
                      >
                        <option value="inclusive">VAT Inclusive</option>
                        <option value="exclusive">VAT Exclusive</option>
                      </select>
                    </div>
                  </div>
                </VATConditionalWrapper>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <Textarea
                    placeholder="Additional notes for this credit note..."
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <Calculator className="h-5 w-5 mr-2 text-red-600" />
                  Credit Note Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(subtotal.toFixed(2))}</span>
                  </div>
                  
                  <VATFieldWrapper>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">VAT Amount:</span>
                      <span className="font-medium">{formatCurrency(vatAmount.toFixed(2))}</span>
                    </div>
                  </VATFieldWrapper>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Credit:</span>
                    <span className="text-red-600">{formatCurrency(total.toFixed(2))}</span>
                  </div>
                </div>

                {/* Credit Note Info */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    This credit note will reduce the customer's outstanding balance and can be applied to future invoices.
                  </AlertDescription>
                </Alert>

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-md"
                    disabled={createCreditNote.isPending}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {createCreditNote.isPending ? "Creating..." : "Create Credit Note"}
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      Journal entry will be automatically created
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
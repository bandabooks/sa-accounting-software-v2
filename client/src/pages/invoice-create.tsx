import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Calculator, 
  FileText, 
  User, 
  Calendar, 
  DollarSign, 
  Tag,
  AlertCircle,
  Info
} from "lucide-react";
import { customersApi, invoicesApi } from "@/lib/api";
import { calculateInvoiceTotal, formatCurrency, generateInvoiceNumber } from "@/lib/utils-invoice";
import { useToast } from "@/hooks/use-toast";
import { useGlobalNotification } from "@/contexts/NotificationContext";
import { CustomerSelect } from "@/components/CustomerSelect";
import { ProductServiceSelect } from "@/components/ProductServiceSelect";
import { VATConditionalWrapper, VATFieldWrapper } from "@/components/vat/VATConditionalWrapper";
import { VATCalculator, VATSummary } from "@/components/vat/VATCalculator";
import { calculateLineItemVAT, calculateVATTotals } from "@shared/vat-utils";
import { useVATStatus } from "@/hooks/useVATStatus";
import { UNIFIED_VAT_TYPES, getVATTypeConfig, calculateVATAmount } from "@shared/vat-constants";
import type { InsertInvoice, InsertInvoiceItem, Customer, Product } from "@shared/schema";

interface InvoiceItem {
  productId?: number;
  description: string;
  quantity: string;
  unitPrice: string;
  vatRate: string;
  vatInclusive: boolean;
  vatAmount: string;
  vatType: string; // New field for VAT type selection
}

export default function InvoiceCreate() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/invoices/create");
  const { toast } = useToast();
  const { showSuccess } = useGlobalNotification();
  const queryClient = useQueryClient();
  const { shouldShowVATFields } = useVATStatus();
  
  // Get edit parameter from URL
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('edit');
  const isEditing = Boolean(editId);

  const [formData, setFormData] = useState({
    customerId: 0,
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    status: "draft" as "draft" | "sent" | "paid" | "overdue",
    subtotal: "0.00",
    vatAmount: "0.00", 
    total: "0.00",
    notes: ""
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { 
      productId: undefined, 
      description: "", 
      quantity: "1", 
      unitPrice: "0.00", 
      vatRate: "15.00", 
      vatInclusive: false, 
      vatAmount: "0.00",
      vatType: "vat_exclusive" // Default to VAT exclusive
    }
  ]);

  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: customersApi.getAll
  });

  const { data: invoices } = useQuery({
    queryKey: ["/api/invoices"],
    queryFn: invoicesApi.getAll
  });

  // Load existing invoice data when editing
  const { data: existingInvoice, isLoading: isLoadingInvoice } = useQuery({
    queryKey: ["/api/invoices", editId],
    queryFn: () => invoicesApi.getById(Number(editId)),
    enabled: Boolean(editId)
  });

  // Populate form when editing existing invoice
  useEffect(() => {
    if (existingInvoice && isEditing) {
      setFormData({
        customerId: existingInvoice.customerId,
        issueDate: new Date(existingInvoice.issueDate),
        dueDate: new Date(existingInvoice.dueDate),
        status: existingInvoice.status as "draft" | "sent" | "paid" | "overdue",
        subtotal: existingInvoice.subtotal,
        vatAmount: existingInvoice.vatAmount,
        total: existingInvoice.total,
        notes: existingInvoice.notes || ""
      });

      if (existingInvoice.items && existingInvoice.items.length > 0) {
        const invoiceItems: InvoiceItem[] = existingInvoice.items.map(item => ({
          productId: undefined, // Reset productId as the schema doesn't include it
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate,
          vatInclusive: item.vatInclusive || false,
          vatAmount: item.vatAmount
        }));
        setItems(invoiceItems);
      }
    }
  }, [existingInvoice, isEditing]);

  const createMutation = useMutation({
    mutationFn: (data: { invoice: InsertInvoice; items: Omit<InsertInvoiceItem, 'invoiceId'>[] }) => 
      invoicesApi.create(data),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chart-of-accounts"] });
      showSuccess(
        "Invoice Created Successfully",
        `Invoice ${invoice.invoiceNumber} has been created and is ready for review.`
      );
      setLocation(`/invoices/${invoice.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; invoice: Partial<InsertInvoice> }) => 
      invoicesApi.update(data.id, data.invoice),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chart-of-accounts"] });
      showSuccess(
        "Invoice Updated Successfully",
        `Invoice ${invoice.invoiceNumber} has been updated successfully.`
      );
      setLocation(`/invoices/${invoice.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update invoice. Please try again.",
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
      vatInclusive: false, 
      vatAmount: "0.00",
      vatType: "vat_exclusive"
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Enhanced VAT calculation with type support
  const calculateItemVAT = (item: InvoiceItem) => {
    const quantity = parseFloat(item.quantity || "0");
    const unitPrice = parseFloat(item.unitPrice || "0");
    const lineAmount = quantity * unitPrice;
    
    if (item.vatType && shouldShowVATFields) {
      return calculateVATAmount(lineAmount, item.vatType);
    }
    
    // Fallback to traditional calculation
    const vatRate = parseFloat(item.vatRate || "0") / 100;
    return item.vatInclusive ? 
      lineAmount * (vatRate / (1 + vatRate)) : 
      lineAmount * vatRate;
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    
    // Auto-calculate VAT amount when relevant fields change
    if (field === 'quantity' || field === 'unitPrice' || field === 'vatType' || field === 'vatRate') {
      const calculatedVAT = calculateItemVAT(newItems[index]);
      newItems[index].vatAmount = calculatedVAT.toFixed(2);
    }
    
    setItems(newItems);
    
    // Recalculate totals
    const totals = calculateInvoiceTotal(newItems);
    setFormData(prev => ({
      ...prev,
      subtotal: totals.subtotal.toFixed(2),
      vatAmount: totals.vatAmount.toFixed(2),
      total: totals.total.toFixed(2)
    }));
  };

  const handleProductSelect = (index: number, product: Product) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productId: product.id,
      description: product.description || product.name,
      unitPrice: product.unitPrice,
      vatRate: product.vatRate || "15",
      vatType: product.vatRate === "0" ? "zero_rated" : "vat_exclusive" // Smart VAT type detection
    };
    
    // Calculate VAT amount for the updated item
    const calculatedVAT = calculateItemVAT(newItems[index]);
    newItems[index].vatAmount = calculatedVAT.toFixed(2);
    
    setItems(newItems);
    
    // Recalculate totals
    const totals = calculateInvoiceTotal(newItems);
    setFormData(prev => ({
      ...prev,
      subtotal: totals.subtotal.toFixed(2),
      vatAmount: totals.vatAmount.toFixed(2),
      total: totals.total.toFixed(2)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerId) {
      toast({
        title: "Error",
        description: "Please select a customer.",
        variant: "destructive",
      });
      return;
    }

    const validItems = items.filter(item => 
      item.description.trim() && 
      parseFloat(item.quantity) > 0 && 
      parseFloat(item.unitPrice) >= 0
    );

    if (validItems.length === 0) {
      toast({
        title: "Error", 
        description: "Please add at least one valid item.",
        variant: "destructive",
      });
      return;
    }

    if (isEditing && editId) {
      // Update existing invoice
      const invoiceData: Partial<InsertInvoice> = {
        customerId: formData.customerId,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        status: formData.status,
        subtotal: formData.subtotal,
        vatAmount: formData.vatAmount,
        total: formData.total,
        notes: formData.notes
      };

      updateMutation.mutate({ id: Number(editId), invoice: invoiceData });
    } else {
      // Create new invoice
      const invoiceNumber = generateInvoiceNumber(invoices?.length || 0);
      
      const invoiceData: InsertInvoice = {
        ...formData,
        invoiceNumber
      };

      const itemsData: Omit<InsertInvoiceItem, 'invoiceId'>[] = validItems.map(item => ({
        companyId: 2, // Using default company for now
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vatRate: item.vatRate,
        vatAmount: (parseFloat(item.quantity) * parseFloat(item.unitPrice) * (parseFloat(item.vatRate) / 100)).toFixed(2),
        vatInclusive: item.vatInclusive || false,
        total: (parseFloat(item.quantity) * parseFloat(item.unitPrice) * (1 + parseFloat(item.vatRate) / 100)).toFixed(2)
      }));

      createMutation.mutate({ invoice: invoiceData, items: itemsData });
    }
  };

  const totals = calculateInvoiceTotal(items);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Professional Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation('/invoices')}
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <FileText className="h-6 w-6 mr-3 text-blue-600" />
                {isEditing ? 'Edit Invoice' : 'Create New Invoice'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Professional invoice with automatic accounting
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              INV-{String((invoices?.length || 0) + 1).padStart(4, '0')}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">
          {/* Client Information Section */}
          <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b">
              <CardTitle className="flex items-center text-gray-900 dark:text-white">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Select Client *
                    </Label>
                    <CustomerSelect
                      value={formData.customerId || undefined}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}
                      placeholder="Choose a client..."
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <Tag className="h-4 w-4 mr-2" />
                      Invoice Status
                    </Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as "paid" | "sent" | "overdue" | "draft" }))}
                    >
                      <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                            Draft
                          </div>
                        </SelectItem>
                        <SelectItem value="sent">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                            Sent
                          </div>
                        </SelectItem>
                        <SelectItem value="paid">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                            Paid
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Issue Date
                    </Label>
                    <Input
                      type="date"
                      className="focus:ring-2 focus:ring-blue-500"
                      value={formData.issueDate.toISOString().split('T')[0]}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        issueDate: new Date(e.target.value) 
                      }))}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Due Date
                    </Label>
                    <Input
                      type="date"
                      className="focus:ring-2 focus:ring-blue-500"
                      value={formData.dueDate.toISOString().split('T')[0]}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        dueDate: new Date(e.target.value) 
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Additional Notes</Label>
                <Textarea
                  placeholder="Add any additional notes or terms for this invoice..."
                  className="mt-2 min-h-[100px] focus:ring-2 focus:ring-blue-500"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Invoice Items Section */}
          <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <Calculator className="h-5 w-5 mr-2 text-green-600" />
                  Invoice Items
                </CardTitle>
                <Button 
                  type="button" 
                  onClick={addItem} 
                  variant="outline"
                  className="bg-white hover:bg-green-50 text-green-700 border-green-200 hover:border-green-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {items.map((item, index) => (
                  <div key={index} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    <div className="p-6 space-y-4">
                      {/* Item Header */}
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Item #{index + 1}
                        </h4>
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {/* Product/Service Selection */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="lg:col-span-2">
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Product/Service
                          </Label>
                          <ProductServiceSelect
                            value={item.productId}
                            onValueChange={(productId) => updateItem(index, 'productId', productId)}
                            onProductSelect={(product) => handleProductSelect(index, product)}
                            placeholder="Search and select a product/service..."
                          />
                          {!item.productId && (
                            <Input
                              className="mt-2 focus:ring-2 focus:ring-blue-500"
                              placeholder="Or enter custom description..."
                              value={item.description}
                              onChange={(e) => updateItem(index, 'description', e.target.value)}
                            />
                          )}
                        </div>
                      </div>

                      {/* Quantity, Price, and VAT Row */}
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Quantity
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            className="focus:ring-2 focus:ring-blue-500"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            Unit Price
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            className="focus:ring-2 focus:ring-blue-500"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                          />
                        </div>

                        {/* Professional VAT Type Dropdown */}
                        {shouldShowVATFields && (
                          <div className="md:col-span-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                              <Tag className="h-3 w-3 mr-1" />
                              VAT Treatment
                            </Label>
                            <Select
                              value={item.vatType}
                              onValueChange={(value) => {
                                updateItem(index, 'vatType', value);
                                const vatConfig = getVATTypeConfig(value);
                                if (vatConfig) {
                                  updateItem(index, 'vatRate', vatConfig.rate.toString());
                                  updateItem(index, 'vatInclusive', value === 'vat_inclusive');
                                }
                              }}
                            >
                              <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                                <SelectValue placeholder="Select VAT type..." />
                              </SelectTrigger>
                              <SelectContent>
                                {UNIFIED_VAT_TYPES.map((vatType) => (
                                  <SelectItem key={vatType.id} value={vatType.id}>
                                    <div className="flex items-center justify-between w-full">
                                      <div className="flex flex-col">
                                        <span className="font-medium">{vatType.name}</span>
                                        <span className="text-xs text-gray-500">{vatType.description}</span>
                                      </div>
                                      <Badge 
                                        variant="outline" 
                                        className={`ml-2 text-xs ${
                                          vatType.rate === 15 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                          vatType.rate === 0 ? 'bg-gray-50 text-gray-700 border-gray-200' :
                                          'bg-green-50 text-green-700 border-green-200'
                                        }`}
                                      >
                                        {vatType.rate}%
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div>
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            VAT Amount
                          </Label>
                          <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded border text-right font-medium text-gray-900 dark:text-white">
                            {formatCurrency(parseFloat(item.vatAmount || '0'))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Line Total
                          </Label>
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border text-right font-bold text-blue-700 dark:text-blue-300">
                            {formatCurrency(
                              parseFloat(item.quantity || "0") * 
                              parseFloat(item.unitPrice || "0") * 
                              (shouldShowVATFields ? (1 + parseFloat(item.vatRate || "0") / 100) : 1)
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {items.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Calculator className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium">No items added yet</p>
                    <p className="text-sm">Click "Add Item" to get started with your invoice</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional Invoice Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side - Additional Information */}
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-b">
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <Info className="h-5 w-5 mr-2 text-orange-600" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Invoice Number
                    </span>
                    <Badge variant="outline" className="bg-white text-blue-700 border-blue-200 font-mono">
                      INV-{String((invoices?.length || 0) + 1).padStart(4, '0')}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </span>
                    <Badge className={`${
                      formData.status === 'paid' ? 'bg-green-100 text-green-800' :
                      formData.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                      formData.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                    </Badge>
                  </div>

                  {shouldShowVATFields && (
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex items-center mb-2">
                        <AlertCircle className="h-4 w-4 text-purple-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          VAT Information
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        VAT calculations are applied automatically based on your selected VAT types. 
                        Ensure your VAT registration status is correctly configured in settings.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Right side - Invoice Summary */}
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-b">
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                  Invoice Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(parseFloat(formData.subtotal))}
                    </span>
                  </div>
                  
                  {shouldShowVATFields && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">VAT Amount</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(parseFloat(formData.vatAmount))}
                      </span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center py-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total Amount</span>
                    <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {formatCurrency(parseFloat(formData.total))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Professional Action Buttons */}
          <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setLocation('/invoices')}
                  className="border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  size="lg"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      {isEditing ? "Update Invoice" : "Create Invoice"}
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  );
}

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
import { VATTypeSelect } from "@/components/ui/vat-type-select";
import { VATConditionalWrapper, VATFieldWrapper } from "@/components/vat/VATConditionalWrapper";
import { VATCalculator, VATSummary } from "@/components/vat/VATCalculator";
import { calculateLineItemVAT, calculateVATTotals } from "@shared/vat-utils";
import { useVATStatus } from "@/hooks/useVATStatus";
import type { InsertInvoice, InsertInvoiceItem, Customer, Product } from "@shared/schema";

interface InvoiceItem {
  productId?: number;
  description: string;
  quantity: string;
  unitPrice: string;
  vatRate: string;
  vatInclusive: boolean;
  vatAmount: string;
  vatTypeId: number; // Changed to match bulk module format
}

export default function InvoiceCreate() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/invoices/create");
  const { toast } = useToast();
  const { showSuccess } = useGlobalNotification();
  const queryClient = useQueryClient();
  const { shouldShowVATFields } = useVATStatus();
  
  // Fetch VAT types for calculations
  const vatTypesQuery = useQuery({
    queryKey: ["/api/companies", 2, "vat-types"], // Using company ID 2 from system
    retry: false,
  });
  
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
    notes: "",
    globalVatType: "2" // Default to VAT Inclusive
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { 
      productId: undefined, 
      description: "", 
      quantity: "1", 
      unitPrice: "0.00", 
      vatRate: "15.00", // Initialize with 15%, will be calculated from VAT type
      vatInclusive: true, 
      vatAmount: "0.00",
      vatTypeId: 2 // Default to VAT Inclusive (15%)
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
        notes: existingInvoice.notes || "",
        globalVatType: "2" // Default to VAT Inclusive for existing invoices
      });

      if (existingInvoice.items && existingInvoice.items.length > 0) {
        const invoiceItems: InvoiceItem[] = existingInvoice.items.map(item => ({
          productId: undefined, // Reset productId as the schema doesn't include it
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate,
          vatInclusive: item.vatInclusive || false,
          vatAmount: item.vatAmount,
          vatTypeId: item.vatInclusive ? 2 : 1 // Convert to VAT type (2=inclusive, 1=exclusive)
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
      vatRate: "15.00", // Initialize with 15%, will be calculated from VAT type
      vatInclusive: true, 
      vatAmount: "0.00",
      vatTypeId: 2 // Default to VAT Inclusive (15%)
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Enhanced VAT calculation using comprehensive VAT type system with inclusive/exclusive handling
  const calculateItemVAT = (item: InvoiceItem) => {
    const quantity = parseFloat(item.quantity || "0");
    const unitPrice = parseFloat(item.unitPrice || "0");
    const lineAmount = quantity * unitPrice;
    
    if (!shouldShowVATFields || !item.vatTypeId) return 0;
    
    // Parse the vatTypeId which now contains inclusive/exclusive info
    const vatTypeString = item.vatTypeId.toString();
    
    // Extract rate and inclusivity from the VAT type selection
    let rate = 0;
    let isInclusive = false;
    
    if (vatTypeString.includes('_inc')) {
      // VAT Inclusive option selected
      isInclusive = true;
      rate = parseFloat(item.vatRate || "15"); // Use item's vatRate
    } else if (vatTypeString.includes('_exc')) {
      // VAT Exclusive option selected
      isInclusive = false;
      rate = parseFloat(item.vatRate || "15"); // Use item's vatRate
    } else if (vatTypeString.includes('_single')) {
      // Zero-rated or exempt (single option)
      rate = 0;
      isInclusive = false;
    } else {
      // Fallback to traditional calculation
      rate = parseFloat(item.vatRate || "0");
      isInclusive = item.vatInclusive;
    }
    
    // Handle different VAT calculations
    if (rate === 0) {
      return 0; // Zero-rated, Exempt, etc.
    }
    
    if (isInclusive) {
      // VAT Inclusive: VAT = Amount × (Rate ÷ (100 + Rate))
      return Number((lineAmount * (rate / (100 + rate))).toFixed(2));
    } else {
      // VAT Exclusive: VAT = Amount × (Rate ÷ 100)
      return Number((lineAmount * (rate / 100)).toFixed(2));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    
    // Auto-calculate VAT amount when relevant fields change
    if (field === 'quantity' || field === 'unitPrice' || field === 'vatTypeId' || field === 'vatRate') {
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
      vatTypeId: product.vatRate === "0" ? 3 : 2 // Smart VAT type detection (3=zero_rated, 2=vat_inclusive)
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

          {/* Invoice Items Table - Matching Screenshot Format */}
          <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
            <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b flex flex-row items-center justify-between">
              <CardTitle className="flex items-center text-gray-900 dark:text-white text-lg">
                <Calculator className="h-5 w-5 mr-2 text-purple-600" />
                Invoice Items
              </CardTitle>
              <Button 
                type="button" 
                onClick={addItem} 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {/* Professional Table Header - With VAT Column */}
              <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-2 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <div className="col-span-2">Product/Service</div>
                  <div className="col-span-3">Description</div>
                  <div className="col-span-1 text-center">Qty</div>
                  <div className="col-span-2 text-center">Unit Price</div>
                  <div className="col-span-2 text-center">VAT Type</div>
                  <div className="col-span-1 text-center">Amount</div>
                  <div className="col-span-1 text-center">Remove</div>
                </div>
              </div>

              {/* Professional Table Body - With VAT Dropdown per Line */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 px-4 py-4 items-center bg-white dark:bg-gray-900">
                    {/* Product/Service Column */}
                    <div className="col-span-2">
                      <ProductServiceSelect
                        value={item.productId}
                        onValueChange={(productId) => updateItem(index, 'productId', productId)}
                        onProductSelect={(product) => handleProductSelect(index, product)}
                        placeholder="Select..."
                      />
                    </div>

                    {/* Description Column */}
                    <div className="col-span-3">
                      <Input
                        placeholder="Enter item description..."
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Quantity Column */}
                    <div className="col-span-1">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        className="text-center border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Unit Price Column */}
                    <div className="col-span-2">
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-1">R</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                          className="border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* VAT Type Column - New Line-Level VAT Control */}
                    <div className="col-span-2">
                      <VATTypeSelect
                        value={item.vatTypeId?.toString()}
                        onValueChange={(value) => updateItem(index, 'vatTypeId', parseInt(value))}
                        placeholder="VAT Type"
                        className="w-full"
                      />
                    </div>

                    {/* Amount Column - Calculated with VAT applied */}
                    <div className="col-span-1">
                      <div className="text-right font-medium text-gray-900 dark:text-white px-2 py-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                        R{(parseFloat(item.quantity || "0") * parseFloat(item.unitPrice || "0")).toFixed(2)}
                      </div>
                    </div>

                    {/* Remove Column */}
                    <div className="col-span-1 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                        disabled={items.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {items.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No items added yet</p>
                  <p className="text-sm">Click "Add Item" to get started</p>
                </div>
              )}
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
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b flex flex-row items-center">
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <FileText className="h-5 w-5 mr-2 text-green-600" />
                  Invoice Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Line-Level VAT Summary - Shows calculated totals from individual line items */}
                  <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border">
                    <Label className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />
                      Line-Level VAT Control
                    </Label>
                    <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      <p>✓ VAT is now controlled per line item for granular control</p>
                      <p>✓ Each item can have different VAT types (Standard, Zero-rated, Exempt)</p>
                      <p>✓ Global totals are calculated from individual line VAT amounts</p>
                    </div>
                    <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border">
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">VAT Breakdown by Type:</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span>Standard (15%):</span>
                          <span className="font-mono">R {items.filter(item => item.vatTypeId === 1 || item.vatTypeId === 2)
                            .reduce((sum, item) => sum + parseFloat(item.vatAmount || "0"), 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Zero/Exempt:</span>
                          <span className="font-mono">R {items.filter(item => item.vatTypeId === 3 || item.vatTypeId === 4)
                            .reduce((sum, item) => sum + parseFloat(item.vatAmount || "0"), 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal (excl. VAT):</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        R {parseFloat(formData.subtotal).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Total VAT (from line items):
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        R {parseFloat(formData.vatAmount).toFixed(2)}
                      </span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center py-3 bg-green-50 dark:bg-green-900/20 rounded-lg px-4">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        Total (incl. VAT):
                      </span>
                      <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                        R {parseFloat(formData.total).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Create Invoice Button - Matching Screenshot */}
                  <div className="mt-6">
                    <Button 
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {createMutation.isPending || updateMutation.isPending ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <FileText className="h-5 w-5 mr-2" />
                          Create Invoice
                        </div>
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Journal entry will be automatically created
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Back to Sales Button */}
          <div className="flex justify-start mb-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation('/invoices')}
              className="bg-green-600 hover:bg-green-700 text-white border-green-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sales
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

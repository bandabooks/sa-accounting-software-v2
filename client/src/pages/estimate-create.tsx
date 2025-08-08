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
import { calculateInvoiceTotal, formatCurrency, generateInvoiceNumber } from "@/lib/utils-invoice";
import { useToast } from "@/hooks/use-toast";
import { useGlobalNotification } from "@/contexts/NotificationContext";
import { CustomerSelect } from "@/components/CustomerSelect";
import { ProductServiceSelect } from "@/components/ProductServiceSelect";
import { VATTypeSelect } from "@/components/ui/vat-type-select";
import { VATConditionalWrapper, VATFieldWrapper } from "@/components/vat/VATConditionalWrapper";
import { useVATStatus } from "@/hooks/useVATStatus";
import { apiRequest } from "@/lib/queryClient";
import { calculateVATFromType } from "@/lib/vat-service";
import type { InsertEstimate, InsertEstimateItem, Customer, Product } from "@shared/schema";

interface EstimateItem {
  productId?: number;
  description: string;
  quantity: string;
  unitPrice: string;
  vatRate: string;
  vatInclusive: boolean;
  vatAmount: string;
  vatTypeId: number; // Match invoice format
}

export default function EstimateCreate() {
  const [, setLocation] = useLocation();
  const [matchCreate] = useRoute("/estimates/create");
  const [matchEdit, paramsEdit] = useRoute("/estimates/edit/:id");
  const { toast } = useToast();
  const { showSuccess } = useGlobalNotification();
  const queryClient = useQueryClient();
  const { shouldShowVATFields } = useVATStatus();
  
  // Determine if editing based on route
  const editId = paramsEdit?.id || new URLSearchParams(window.location.search).get('edit');
  const isEditing = Boolean(editId && (matchEdit || editId));

  const [formData, setFormData] = useState({
    customerId: 0,
    issueDate: new Date(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    status: "draft" as "draft" | "sent" | "accepted" | "expired" | "viewed" | "rejected",
    subtotal: "0.00",
    vatAmount: "0.00", 
    total: "0.00",
    notes: "",
    terms: "",
    globalVatType: "1", // Default to Standard Rate (15%) - Same as invoice
    vatCalculationMethod: "inclusive" as "inclusive" | "exclusive" // VAT calculation method
  });

  const [items, setItems] = useState<EstimateItem[]>([
    {
      description: "",
      quantity: "1",
      unitPrice: "0.00",
      vatRate: "15.00",
      vatInclusive: true,
      vatAmount: "0.00",
      vatTypeId: 1 // Default to Standard Rate - Same as invoice
    }
  ]);

  // Track dynamic rows for each description field - Same as invoice
  const [descriptionRows, setDescriptionRows] = useState<number[]>([2]);

  // Helper function to calculate optimal rows based on content - Same as invoice
  const calculateRows = (text: string, minRows: number = 2, maxRows: number = 8) => {
    if (!text) return minRows;
    
    // Calculate approximate rows needed based on character count and line breaks
    const charsPerRow = 50; // Approximate characters per row
    const estimatedRows = Math.ceil(text.length / charsPerRow);
    const lineBreaks = (text.match(/\n/g) || []).length;
    const totalRows = Math.max(estimatedRows, lineBreaks + 1);
    
    return Math.min(Math.max(totalRows, minRows), maxRows);
  };

  // Fetch data same as invoice
  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
    retry: false,
  });

  const { data: estimates = [] as any[] } = useQuery({
    queryKey: ["/api/estimates"],
    retry: false,
  });

  const { data: products = [] as any[] } = useQuery({
    queryKey: ["/api/products"],
    retry: false,
  });

  const { data: activeCompany } = useQuery({
    queryKey: ["/api/companies/active"],
    retry: false,
  });

  // Fetch VAT types from database for dynamic calculation (same as invoice)
  const { data: vatTypesData = [] } = useQuery({
    queryKey: ["/api/companies", activeCompany?.id || 2, "vat-types"],
    enabled: !!activeCompany?.id,
    retry: false,
  });

  // Fetch VAT settings for calculation method
  const { data: vatSettings = {} } = useQuery({
    queryKey: [`/api/companies/${activeCompany?.id}/vat-settings`],
    enabled: !!activeCompany?.id,
    retry: false,
  });

  // Fetch estimate data when editing
  const { data: existingEstimate, isLoading: estimateLoading } = useQuery({
    queryKey: ["/api/estimates", editId],
    queryFn: () => editId ? apiRequest(`/api/estimates/${editId}`, "GET").then(res => res.json()) : null,
    enabled: !!editId,
    retry: false,
  });
  
  // Ensure we have array of VAT types
  const vatTypes = Array.isArray(vatTypesData) ? vatTypesData : [];

  // Populate form when editing
  useEffect(() => {
    if (isEditing && existingEstimate) {
      console.log('Loading existing estimate data:', existingEstimate);
      
      // Populate form data
      setFormData({
        customerId: existingEstimate.customerId || 0,
        issueDate: new Date(existingEstimate.issueDate),
        expiryDate: new Date(existingEstimate.expiryDate),
        status: existingEstimate.status || "draft",
        subtotal: existingEstimate.subtotal || "0.00",
        vatAmount: existingEstimate.vatAmount || "0.00",
        total: existingEstimate.total || "0.00",
        notes: existingEstimate.notes || "",
        terms: existingEstimate.terms || "",
        globalVatType: "1", // Set to standard rate
        vatCalculationMethod: (vatSettings as any)?.defaultVatCalculationMethod || "inclusive"
      });

      // Populate items - Note: estimate items don't store productId in database
      if (existingEstimate.items && existingEstimate.items.length > 0) {
        console.log('Populating estimate items:', existingEstimate.items);
        const formattedItems = existingEstimate.items.map((item: any) => ({
          productId: undefined, // Estimate items don't store productId in DB, only description
          description: item.description || "",
          quantity: String(item.quantity || "1"),
          unitPrice: String(item.unitPrice || "0.00"),
          vatRate: String(item.vatRate || "15.00"),
          vatInclusive: item.vatInclusive !== undefined ? item.vatInclusive : true,
          vatAmount: String(item.vatAmount || "0.00"),
          vatTypeId: item.vatTypeId || 1
        }));
        console.log('Formatted items for editing:', formattedItems);
        setItems(formattedItems);
        // Initialize description rows for existing items
        setDescriptionRows(formattedItems.map((item: any) => calculateRows(item.description || "")));
      } else {
        console.log('No items found in estimate or items array is empty');
      }
    }
  }, [isEditing, existingEstimate, vatSettings]);

  // Dynamic VAT calculation using database VAT types (same as invoice)
  const calculateItemVAT = (item: EstimateItem) => {
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

  const addItem = () => {
    setItems([...items, {
      description: "",
      quantity: "1",
      unitPrice: "0.00",
      vatRate: "15.00",
      vatInclusive: true,
      vatAmount: "0.00",
      vatTypeId: parseInt(formData.globalVatType) // Use global VAT type as default
    }]);
    // Add a new row entry for the description field
    setDescriptionRows(prev => [...prev, 2]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
      // Remove the corresponding row entry
      setDescriptionRows(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof EstimateItem, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    
    // Auto-calculate VAT amount when relevant fields change
    if (field === 'quantity' || field === 'unitPrice' || field === 'vatTypeId' || field === 'vatRate') {
      const calculatedVAT = calculateItemVAT(newItems[index]);
      newItems[index].vatAmount = calculatedVAT.toFixed(2);
    }
    
    setItems(newItems);
    
    // Recalculate totals using the global VAT calculation method with database VAT types
    const totals = calculateInvoiceTotal(newItems, formData.vatCalculationMethod, vatTypes);
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
      vatTypeId: product.vatRate === "0" ? 2 : 1 // Smart VAT type detection (2=zero_rated, 1=standard)
    };
    
    // Calculate VAT amount for the updated item
    const calculatedVAT = calculateItemVAT(newItems[index]);
    newItems[index].vatAmount = calculatedVAT.toFixed(2);
    
    setItems(newItems);
    
    // Recalculate totals using the global VAT calculation method with database VAT types
    const totals = calculateInvoiceTotal(newItems, formData.vatCalculationMethod, vatTypes);
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

    // Calculate totals using global VAT types and settings
    const vatCalculations = validItems.map(item => {
      const vatType = vatTypes.find(vt => vt.id === item.vatTypeId);
      const method = (vatSettings as any)?.defaultVatMethod || 'inclusive';
      
      if (!vatType) {
        console.warn(`VAT Type not found for ID: ${item.vatTypeId}, using zero VAT`);
        return {
          itemVat: 0,
          itemNet: parseFloat(item.unitPrice) * parseFloat(item.quantity),
          itemGross: parseFloat(item.unitPrice) * parseFloat(item.quantity)
        };
      }
      
      const lineAmount = parseFloat(item.unitPrice) * parseFloat(item.quantity);
      const calculation = calculateVATFromType(lineAmount, vatType, method === 'inclusive');
      
      console.log(`VAT Calculation: lineAmount=R${lineAmount.toFixed(2)}, ${vatType.code} - ${vatType.name}, global_method=${method}, VAT=R${calculation.vatAmount.toFixed(2)}`);
      
      return {
        itemVat: calculation.vatAmount,
        itemNet: calculation.netAmount,
        itemGross: calculation.grossAmount
      };
    });

    const totalVat = vatCalculations.reduce((sum, calc) => sum + calc.itemVat, 0);
    const totalNet = vatCalculations.reduce((sum, calc) => sum + calc.itemNet, 0);
    const totalGross = vatCalculations.reduce((sum, calc) => sum + calc.itemGross, 0);

    // Sanitize and validate payload data
    const sanitizedFormData = {
      customerId: formData.customerId,
      issueDate: formData.issueDate,
      expiryDate: formData.expiryDate,
      status: formData.status || 'draft',
      subtotal: isNaN(totalNet) ? '0.00' : totalNet.toFixed(2),
      vatAmount: isNaN(totalVat) ? '0.00' : totalVat.toFixed(2),
      total: isNaN(totalGross) ? '0.00' : totalGross.toFixed(2),
      notes: formData.notes || ''
    };

    if (isEditing && editId) {
      // Update existing estimate
      const estimateData: Partial<InsertEstimate> = {
        customerId: sanitizedFormData.customerId,
        issueDate: sanitizedFormData.issueDate,
        expiryDate: sanitizedFormData.expiryDate,
        status: sanitizedFormData.status,
        subtotal: sanitizedFormData.subtotal,
        vatAmount: sanitizedFormData.vatAmount,
        total: sanitizedFormData.total,
        notes: sanitizedFormData.notes
        // Note: estimateNumber is now optional for updates
      };

      // Format items for update with required total field
      const formattedItems = validItems.map((item, index) => {
        const vatCalc = vatCalculations[index];
        const vatType = vatTypes.find(vt => vt.id === item.vatTypeId);
        
        return {
          companyId: (activeCompany as any)?.id || 2,
          productId: item.productId || null,
          description: item.description,
          quantity: isNaN(parseFloat(item.quantity)) ? '1.00' : parseFloat(item.quantity).toFixed(2),
          unitPrice: isNaN(parseFloat(item.unitPrice)) ? '0.00' : parseFloat(item.unitPrice).toFixed(2),
          vatRate: vatType ? parseFloat(vatType.rate).toFixed(2) : '0.00',
          vatAmount: isNaN(vatCalc.itemVat) ? '0.00' : vatCalc.itemVat.toFixed(2),
          vatInclusive: item.vatInclusive || false,
          vatTypeId: item.vatTypeId || 1,
          total: isNaN(vatCalc.itemGross) ? '0.00' : vatCalc.itemGross.toFixed(2) // Required total field
        };
      });

      updateEstimate.mutate({ id: parseInt(editId), data: estimateData, items: formattedItems });
    } else {
      // Create new estimate - format data to match server schema
      const estimateData: InsertEstimate = {
        estimateNumber: "", // Auto-generated by server
        customerId: sanitizedFormData.customerId!,
        issueDate: sanitizedFormData.issueDate,
        expiryDate: sanitizedFormData.expiryDate,
        status: sanitizedFormData.status,
        subtotal: sanitizedFormData.subtotal,
        vatAmount: sanitizedFormData.vatAmount,
        total: sanitizedFormData.total,
        notes: sanitizedFormData.notes
      };

      // Format items with enhanced VAT calculations using global VAT types - EXACT INVOICE LOGIC
      const formattedItems = validItems.map((item, index) => {
        const vatCalc = vatCalculations[index];
        const vatType = vatTypes.find(vt => vt.id === item.vatTypeId);
        
        return {
          companyId: (activeCompany as any)?.id || 2, // Match invoice format
          productId: item.productId || null,
          description: item.description,
          quantity: isNaN(parseFloat(item.quantity)) ? '1.00' : parseFloat(item.quantity).toFixed(2),
          unitPrice: isNaN(parseFloat(item.unitPrice)) ? '0.00' : parseFloat(item.unitPrice).toFixed(2),
          vatRate: vatType ? parseFloat(vatType.rate).toFixed(2) : '0.00',
          vatAmount: isNaN(vatCalc.itemVat) ? '0.00' : vatCalc.itemVat.toFixed(2),
          vatInclusive: item.vatInclusive || false,
          vatTypeId: item.vatTypeId || 1,
          total: isNaN(vatCalc.itemGross) ? '0.00' : vatCalc.itemGross.toFixed(2)
        };
      });

      // Log payload for debugging
      const payload = { 
        estimate: estimateData, 
        items: formattedItems 
      };
      console.log(isEditing ? 'Estimate Update Payload:' : 'Estimate Creation Payload:', JSON.stringify(payload, null, 2));

      if (isEditing && editId) {
        updateEstimate.mutate({ id: parseInt(editId), data: payload.estimate, items: payload.items });
      } else {
        createEstimate.mutate(payload);
      }
    }
  };

  // Mutations for create and update
  const createEstimate = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/estimates', 'POST', data);
      return response;
    },
    onSuccess: (estimate) => {
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      showSuccess(
        "Estimate Created Successfully!",
        `Estimate EST-${String((estimates?.length || 0) + 1).padStart(4, '0')} has been created.`
      );
      setLocation("/estimates");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create estimate. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateEstimate = useMutation({
    mutationFn: async ({ id, data, items }: { id: number; data: any; items: any[] }) => {
      const response = await apiRequest(`/api/estimates/${id}`, 'PUT', { estimate: data, items });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/estimates", editId] });
      showSuccess(
        "Estimate Updated Successfully!",
        "Your estimate has been updated and saved."
      );
      setLocation("/estimates");
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast({
        title: "Error", 
        description: "Failed to update estimate. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Calculate VAT breakdown by type
  const vatBreakdown = items.reduce((acc, item) => {
    const vatAmount = parseFloat(item.vatAmount || "0");
    if (item.vatTypeId === 1) {
      acc.standard += vatAmount;
    } else {
      acc.zeroExempt += vatAmount;
    }
    return acc;
  }, { standard: 0, zeroExempt: 0 });

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      {/* Professional Header - Emerald Theme */}
      <header className="bg-white dark:bg-gray-800 border-b border-emerald-200 dark:border-gray-700 px-6 py-4 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation('/estimates')}
              className="hover:bg-emerald-100 dark:hover:bg-gray-700 text-emerald-700 dark:text-emerald-400"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Estimates
            </Button>
            <Separator orientation="vertical" className="h-6 bg-emerald-200" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <FileText className="h-6 w-6 mr-3 text-emerald-600" />
                {isEditing ? 'Edit Estimate' : 'Create New Estimate'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Professional estimate with automatic accounting
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              {isEditing && existingEstimate ? existingEstimate.estimateNumber : `EST-${String((estimates?.length || 0) + 1).padStart(4, '0')}`}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-6">
              
              {/* Client Information */}
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b">
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <User className="h-5 w-5 mr-2 text-emerald-600" />
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
                        <Calendar className="h-4 w-4 mr-2" />
                        Issue Date *
                      </Label>
                      <Input
                        type="date"
                        value={formData.issueDate.toISOString().split('T')[0]}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          issueDate: new Date(e.target.value)
                        }))}
                        className="border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Expiry Date *
                      </Label>
                      <Input
                        type="date"
                        value={formData.expiryDate.toISOString().split('T')[0]}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          expiryDate: new Date(e.target.value)
                        }))}
                        className="border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        <Tag className="h-4 w-4 mr-2" />
                        Status
                      </Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="declined">Declined</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* VAT Treatment Section */}
                <VATConditionalWrapper>
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <VATFieldWrapper>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            Estimate VAT Treatment
                          </Label>
                          <Select
                            value={formData.vatCalculationMethod}
                            onValueChange={(value: "inclusive" | "exclusive") =>
                              setFormData(prev => ({ ...prev, vatCalculationMethod: value }))
                            }
                          >
                            <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-blue-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="inclusive">VAT Inclusive</SelectItem>
                              <SelectItem value="exclusive">VAT Exclusive</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500 mt-1">
                            This setting applies to all line items by default
                          </p>
                        </div>
                      </div>
                    </VATFieldWrapper>
                  </div>
                </VATConditionalWrapper>
              </CardContent>
            </Card>

            {/* Estimate Items */}
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-gray-900 dark:text-white">
                    <Calculator className="h-5 w-5 mr-2 text-emerald-600" />
                    Estimate Items
                  </CardTitle>
                  <Button
                    type="button"
                    onClick={addItem}
                    variant="outline"
                    size="sm"
                    className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Items Header */}
                <div className="grid grid-cols-12 gap-2 p-4 bg-gray-50 dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 border-b">
                  <div className="col-span-2">Product/Service</div>
                  <div className="col-span-3">Description</div>
                  <div className="col-span-1">Qty</div>
                  <div className="col-span-2">Unit Price</div>
                  <div className="col-span-2">VAT Type</div>
                  <div className="col-span-1">Amount</div>
                  <div className="col-span-1 text-center">Action</div>
                </div>

                {/* Items List */}
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      
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
                        <Textarea
                          placeholder="Enter item description..."
                          value={item.description}
                          onChange={(e) => {
                            updateItem(index, 'description', e.target.value);
                            // Update the rows for this specific field based on content
                            const newRows = calculateRows(e.target.value);
                            setDescriptionRows(prev => {
                              const updated = [...prev];
                              updated[index] = newRows;
                              return updated;
                            });
                          }}
                          rows={descriptionRows[index] || 2}
                          className="border-gray-300 focus:ring-2 focus:ring-blue-500 resize-none transition-all duration-200 ease-in-out"
                        />
                      </div>

                      {/* Quantity Column */}
                      <div className="col-span-1">
                        <Input
                          type="number"
                          min="0"
                          step="1"
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

                      {/* VAT Type Column */}
                      <div className="col-span-2">
                        <VATTypeSelect
                          value={item.vatTypeId?.toString()}
                          onValueChange={(value) => updateItem(index, 'vatTypeId', parseInt(value))}
                          placeholder="VAT Type"
                          className="w-full"
                        />
                      </div>

                      {/* Amount Column */}
                      <div className="col-span-1">
                        <div className="text-right font-medium text-gray-900 dark:text-white px-2 py-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          R{(() => {
                            const quantity = parseFloat(item.quantity || "0");
                            const unitPrice = parseFloat(item.unitPrice || "0");
                            const lineAmount = quantity * unitPrice;
                            
                            // Get VAT rate from database VAT types
                            const vatType = vatTypes.find((type: any) => type.id === item.vatTypeId);
                            const vatRate = vatType ? parseFloat(vatType.rate) : 0;
                            
                            // CRITICAL: For zero-rated items, always show the line amount as-is
                            if (vatRate === 0) {
                              return lineAmount.toFixed(2);
                            }
                            
                            // For standard VAT items, respect the global VAT calculation method
                            if (formData.vatCalculationMethod === 'inclusive') {
                              // VAT Inclusive: Amount displayed remains the same (VAT is already included)
                              return lineAmount.toFixed(2);
                            } else {
                              // VAT Exclusive: Amount displayed should include VAT for display
                              const vatAmount = lineAmount * (vatRate / 100);
                              return (lineAmount + vatAmount).toFixed(2);
                            }
                          })()}
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

              {/* Additional Information and Summary Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left - Additional Information */}
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
                          Estimate Number
                        </span>
                        <Badge variant="outline" className="bg-white text-blue-700 border-blue-200 font-mono">
                          EST-{String((estimates?.length || 0) + 1).padStart(4, '0')}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Status
                        </span>
                        <Badge className={`${
                          formData.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          formData.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                          formData.status === 'declined' ? 'bg-red-100 text-red-800' :
                          formData.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Notes
                          </Label>
                          <Textarea
                            placeholder="Additional notes for this estimate..."
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            className="border-gray-300 focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Terms & Conditions
                          </Label>
                          <Textarea
                            placeholder="Terms and conditions for this estimate..."
                            value={formData.terms}
                            onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                            className="border-gray-300 focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Right - Estimate Summary */}
                <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b">
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <FileText className="h-5 w-5 mr-2 text-emerald-600" />
                  Estimate Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                
                {/* Line-Level VAT Control Info */}
                <VATConditionalWrapper>
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Line-Level VAT Control
                    </h4>
                    <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      <p>✓ VAT is now controlled per line item for granular control</p>
                      <p>✓ Each item can have different VAT types (Standard, Zero-rated, Exempt)</p>
                      <p>✓ Global totals are calculated from individual line VAT amounts</p>
                    </div>
                  </div>
                </VATConditionalWrapper>

                {/* VAT Breakdown by Type */}
                <VATConditionalWrapper>
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      VAT Breakdown by Type:
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="text-gray-600 dark:text-gray-400">Standard (15%)</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          R {vatBreakdown.standard.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="text-gray-600 dark:text-gray-400">Zero/Exempt:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          R {vatBreakdown.zeroExempt.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </VATConditionalWrapper>

                {/* Estimate Totals */}
                <div className="space-y-3 text-lg">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal (excl. VAT):</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      R {formData.subtotal}
                    </span>
                  </div>
                  
                  <VATConditionalWrapper>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Total VAT (from line items):</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        R {formData.vatAmount}
                      </span>
                    </div>
                  </VATConditionalWrapper>
                  
                  <div className="flex justify-between items-center py-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-4 border border-emerald-200 dark:border-emerald-800">
                    <span className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                      Total (incl. VAT):
                    </span>
                    <span className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                      R {formData.total}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md"
                    disabled={createEstimate.isPending || updateEstimate.isPending}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {isEditing ? 
                      (updateEstimate.isPending ? "Updating..." : "Update Estimate") :
                      (createEstimate.isPending ? "Creating..." : "Create Estimate")
                    }
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
        </form>
      </main>
    </div>
  );
}

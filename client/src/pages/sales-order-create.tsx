import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  ArrowLeft,
  Calculator,
  ShoppingCart,
  Plus,
  Trash2,
  FileText,
  User,
  Calendar,
  Tag,
  AlertCircle,
  Info,
  Send,
  Save,
  Eye,
  Download,
  Mail,
  Sparkles
} from "lucide-react";
import { customersApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils-invoice";
import { useToast } from "@/hooks/use-toast";
import { CustomerSelect } from "@/components/CustomerSelect";
import { ProductServiceSelect } from "@/components/ProductServiceSelect";
import { VATTypeSelect } from "@/components/ui/vat-type-select";
import { VATConditionalWrapper, VATFieldWrapper } from "@/components/vat/VATConditionalWrapper";
import { useVATStatus } from "@/hooks/useVATStatus";
import { apiRequest } from "@/lib/queryClient";
import type { Customer, Product } from "@shared/schema";
import SuccessNotification from "@/components/ui/success-notification";

// Sales Order Form Schema
const salesOrderSchema = z.object({
  customerId: z.number().min(1, "Please select a customer"),
  orderDate: z.string().min(1, "Order date is required"),
  expectedDate: z.string().min(1, "Expected delivery date is required"),
  status: z.enum(["draft", "confirmed", "shipped", "delivered", "cancelled"]),
  notes: z.string().optional(),
  globalVatType: z.string(),
  vatCalculationMethod: z.enum(["inclusive", "exclusive"])
});

type SalesOrderFormData = z.infer<typeof salesOrderSchema>;

// Sales Order Item Interface
interface SalesOrderItem {
  productId?: number;
  description: string;
  quantity: string;
  unitPrice: string;
  vatRate: string;
  vatInclusive: boolean;
  vatAmount: string;
  vatTypeId: number;
}

export default function SalesOrderCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { shouldShowVATFields } = useVATStatus();
  
  // Success notification state
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successNotificationData, setSuccessNotificationData] = useState({
    title: "",
    description: ""
  });

  // Professional auto-generated sales order number
  const [salesOrderNumber, setSalesOrderNumber] = useState<string>("");

  // Form setup with validation
  const form = useForm<SalesOrderFormData>({
    resolver: zodResolver(salesOrderSchema),
    defaultValues: {
      customerId: 0,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "draft",
      notes: "",
      globalVatType: "1",
      vatCalculationMethod: "inclusive"
    }
  });

  // Form data state (maintained for compatibility)
  const [formData, setFormData] = useState({
    customerId: 0,
    orderDate: new Date().toISOString().split('T')[0],
    expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "draft",
    notes: "",
    globalVatType: "1",
    vatCalculationMethod: "inclusive" as "inclusive" | "exclusive"
  });

  const [items, setItems] = useState<SalesOrderItem[]>([
    {
      productId: undefined,
      description: "",
      quantity: "1",
      unitPrice: "0.00",
      vatRate: "15.00",
      vatInclusive: true,
      vatAmount: "0.00",
      vatTypeId: 1
    }
  ]);

  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: customersApi.getAll
  });

  const { data: products } = useQuery({
    queryKey: ["/api/products"],
  });

  // Generate sales order number on component mount
  useEffect(() => {
    const generateOrderNumber = () => {
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const timestamp = Date.now().toString().slice(-4);
      return `SO-${year}${month}-${timestamp}`;
    };
    setSalesOrderNumber(generateOrderNumber());
  }, []);

  // Enhanced VAT calculations with real-time updates
  const calculateItemTotal = useCallback((item: SalesOrderItem) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const vatRate = parseFloat(item.vatRate) || 0;
    
    const lineTotal = quantity * unitPrice;
    const vatAmount = (lineTotal * vatRate) / 100;
    
    return {
      lineTotal: lineTotal.toFixed(2),
      vatAmount: vatAmount.toFixed(2),
      totalWithVat: (lineTotal + vatAmount).toFixed(2)
    };
  }, []);

  const calculateOrderTotals = useCallback(() => {
    let subtotal = 0;
    let totalVat = 0;
    
    items.forEach(item => {
      const { lineTotal, vatAmount } = calculateItemTotal(item);
      subtotal += parseFloat(lineTotal);
      totalVat += parseFloat(vatAmount);
    });
    
    return {
      subtotal: subtotal.toFixed(2),
      vatAmount: totalVat.toFixed(2),
      total: (subtotal + totalVat).toFixed(2)
    };
  }, [items, calculateItemTotal]);

  // Real-time calculation update
  useEffect(() => {
    const totals = calculateOrderTotals();
    setFormData(prev => ({
      ...prev,
      subtotal: totals.subtotal,
      vatAmount: totals.vatAmount,
      total: totals.total
    }));
  }, [items, calculateOrderTotals]);

  // Enhanced item management functions
  const addItem = useCallback(() => {
    setItems(prev => [...prev, {
      productId: undefined,
      description: "",
      quantity: "1",
      unitPrice: "0.00",
      vatRate: "15.00",
      vatInclusive: true,
      vatAmount: "0.00",
      vatTypeId: 1
    }]);
  }, []);

  const removeItem = useCallback((index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  }, [items.length]);

  const updateItem = useCallback((index: number, field: keyof SalesOrderItem, value: any) => {
    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        
        // Auto-calculate VAT when unit price or quantity changes
        if (field === 'unitPrice' || field === 'quantity' || field === 'vatRate') {
          const { vatAmount } = calculateItemTotal(updatedItem);
          updatedItem.vatAmount = vatAmount;
        }
        
        return updatedItem;
      }
      return item;
    }));
  }, [calculateItemTotal]);

  // Enhanced product selection handler
  const handleProductSelect = useCallback((index: number, product: Product) => {
    updateItem(index, 'productId', product.id);
    updateItem(index, 'description', product.name);
    updateItem(index, 'unitPrice', product.price || '0.00');
    updateItem(index, 'vatRate', '15.00');
  }, [updateItem]);

  // Professional sales order creation mutation
  const createSalesOrderMutation = useMutation({
    mutationFn: async (data: SalesOrderFormData) => {
      const totals = calculateOrderTotals();
      const orderData = {
        ...data,
        salesOrderNumber,
        subtotal: totals.subtotal,
        vatAmount: totals.vatAmount,
        total: totals.total,
        items: items.map(item => ({
          description: item.description,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          vatRate: parseFloat(item.vatRate),
          vatAmount: parseFloat(item.vatAmount),
          vatTypeId: item.vatTypeId,
          lineTotal: calculateItemTotal(item).lineTotal
        }))
      };

      return await apiRequest("/api/sales-orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales-orders"] });
      setSuccessNotificationData({
        title: "Sales Order Created Successfully!",
        description: `Sales Order ${salesOrderNumber} has been created and saved.`
      });
      setShowSuccessNotification(true);
      
      setTimeout(() => {
        setLocation("/sales-orders");
      }, 2000);
    },
    onError: (error: any) => {
      console.error("Sales order creation failed:", error);
      toast({
        title: "Error Creating Sales Order",
        description: error.message || "Failed to create sales order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    // Sync form data with latest state
    const submissionData = {
      ...data,
      customerId: formData.customerId || data.customerId
    };
    
    createSalesOrderMutation.mutate(submissionData);
  });

  const selectedCustomer = customers?.find(c => c.id === formData.customerId);
  const totals = calculateOrderTotals();
  const subtotal = parseFloat(totals.subtotal);
  const vatAmount = parseFloat(totals.vatAmount);
  const total = parseFloat(totals.total);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Professional Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/sales-orders")}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sales Orders
              </Button>
              <div className="h-8 w-px bg-gray-300" />
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-lg">
                    <ShoppingCart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create Sales Order</h1>
                    <p className="text-gray-600 mt-1">Create a new sales order for your customer</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                    {salesOrderNumber}
                  </Badge>
                  <Badge variant="outline">
                    Draft
                  </Badge>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-gray-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createSalesOrderMutation.isPending}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                {createSalesOrderMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Creating...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Sales Order
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="xl:col-span-2 space-y-6">
                {/* Customer Information */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg">
                      <User className="h-5 w-5 mr-2 text-blue-600" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Customer Selection */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Customer</Label>
                        <CustomerSelect
                          value={formData.customerId}
                          onValueChange={(customerId) => {
                            setFormData(prev => ({ ...prev, customerId }));
                            form.setValue("customerId", customerId);
                          }}
                          placeholder="Select customer..."
                        />
                        {selectedCustomer && (
                          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="text-sm">
                              <div className="font-medium text-blue-900">{selectedCustomer.name}</div>
                              {selectedCustomer.email && (
                                <div className="text-blue-700">{selectedCustomer.email}</div>
                              )}
                              {selectedCustomer.phone && (
                                <div className="text-blue-700">{selectedCustomer.phone}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Status */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Status</Label>
                        <Select 
                          value={formData.status} 
                          onValueChange={(status) => {
                            setFormData(prev => ({ ...prev, status }));
                            form.setValue("status", status as any);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Order Date */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Order Date</Label>
                        <Input
                          type="date"
                          value={formData.orderDate}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, orderDate: e.target.value }));
                            form.setValue("orderDate", e.target.value);
                          }}
                        />
                      </div>

                      {/* Expected Delivery Date */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Expected Delivery Date</Label>
                        <Input
                          type="date"
                          value={formData.expectedDate}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, expectedDate: e.target.value }));
                            form.setValue("expectedDate", e.target.value);
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sales Order Items */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center text-lg">
                        <Tag className="h-5 w-5 mr-2 text-green-600" />
                        Sales Order Items
                      </CardTitle>
                      <Button
                        type="button"
                        onClick={addItem}
                        variant="outline"
                        size="sm"
                        className="hover:bg-green-50 hover:border-green-300"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Add products and services to this sales order</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {items.map((item, index) => (
                      <div key={index} className="relative">
                        {items.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeItem(index)}
                            variant="outline"
                            size="sm"
                            className="absolute -top-2 -right-2 z-10 h-8 w-8 p-0 bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50 space-y-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="bg-white">
                              Item {index + 1}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Product/Service Selection */}
                            <div className="md:col-span-2 lg:col-span-3 space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Product/Service</Label>
                              <ProductServiceSelect
                                value={item.productId}
                                onValueChange={(product) => handleProductSelect(index, product)}
                                placeholder="Select product or service..."
                              />
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2 lg:col-span-3 space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Description</Label>
                              <Textarea
                                placeholder="Enter item description..."
                                rows={2}
                                value={item.description}
                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                              />
                            </div>

                            {/* Quantity */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Quantity</Label>
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                placeholder="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                              />
                            </div>

                            {/* Unit Price */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Unit Price</Label>
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
                                <Label className="text-sm font-medium text-gray-700">VAT Type</Label>
                                <VATTypeSelect
                                  value={item.vatTypeId.toString()}
                                  onValueChange={(vatTypeId) => updateItem(index, 'vatTypeId', parseInt(vatTypeId))}
                                  placeholder="Select VAT type..."
                                />
                              </div>
                            </VATFieldWrapper>

                            {/* Line Total Display */}
                            <div className="md:col-span-2 lg:col-span-3 mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Line Total:</span>
                                <span className="text-lg font-semibold text-green-700">
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
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Additional Information */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg">
                      <FileText className="h-5 w-5 mr-2 text-purple-600" />
                      Additional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Notes */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Notes</Label>
                      <Textarea
                        placeholder="Additional notes for this sales order..."
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, notes: e.target.value }));
                          form.setValue("notes", e.target.value);
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Summary Sidebar */}
              <div className="space-y-6">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg">
                      <Calculator className="h-5 w-5 mr-2 text-green-600" />
                      Sales Order Summary
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
                        <span>Total:</span>
                        <span className="text-green-600">{formatCurrency(total.toFixed(2))}</span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-2 pt-4 border-t border-gray-200">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview PDF
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full hover:bg-green-50"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Form>

        {/* Success Notification */}
        <SuccessNotification
          isVisible={showSuccessNotification}
          title={successNotificationData.title}
          description={successNotificationData.description}
          onClose={() => setShowSuccessNotification(false)}
        />
      </div>
    </div>
  );
}
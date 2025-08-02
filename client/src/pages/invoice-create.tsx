import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
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
import type { InsertInvoice, InsertInvoiceItem, Customer, Product } from "@shared/schema";

interface InvoiceItem {
  productId?: number;
  description: string;
  quantity: string;
  unitPrice: string;
  vatRate: string;
  vatInclusive: boolean;
  vatAmount: string;
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
    { productId: undefined, description: "", quantity: "1", unitPrice: "0.00", vatRate: "15.00", vatInclusive: false, vatAmount: "0.00" }
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
    setItems([...items, { productId: undefined, description: "", quantity: "1", unitPrice: "0.00", vatRate: "15.00", vatInclusive: false, vatAmount: "0.00" }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
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
      vatRate: product.vatRate || "15"
    };
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
    <div className="mobile-safe-area">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="mobile-form">
          <div className="mobile-form-header">
            <h2 className="text-lg sm:text-xl font-bold text-white sm:text-gray-900 dark:text-white">
              {isEditing ? 'Edit Invoice' : 'Create Invoice'}
            </h2>
            <p className="text-blue-100 sm:text-gray-600 dark:text-gray-400 text-sm">
              {isEditing ? 'Update the invoice details below' : 'Fill in the details below'}
            </p>
          </div>
          <div className="mobile-form-content space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer" className="mobile-form-label">Customer *</Label>
                <CustomerSelect
                  value={formData.customerId || undefined}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}
                  placeholder="Select a customer"
                />
              </div>

              <div>
                <Label htmlFor="status" className="mobile-form-label">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as "paid" | "sent" | "overdue" | "draft" }))}
                >
                  <SelectTrigger className="mobile-form-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="issueDate" className="mobile-form-label">Issue Date</Label>
                <Input
                  type="date"
                  className="mobile-form-input"
                  value={formData.issueDate.toISOString().split('T')[0]}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    issueDate: new Date(e.target.value) 
                  }))}
                />
            </div>

              <div>
                <Label htmlFor="dueDate" className="mobile-form-label">Due Date</Label>
                <Input
                  type="date"
                  className="mobile-form-input"
                  value={formData.dueDate.toISOString().split('T')[0]}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    dueDate: new Date(e.target.value) 
                  }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="mobile-form-label">Notes</Label>
              <Textarea
                placeholder="Additional notes..."
                className="mobile-form-input min-h-[100px]"
                value={formData.notes || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Items Section */}
        <div className="mobile-form">
          <div className="mobile-form-header">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Invoice Items</h3>
                <p className="text-blue-100 text-sm">Add products or services</p>
              </div>
              <Button 
                type="button" 
                onClick={addItem} 
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 min-h-[44px] px-4"
                size="sm"
              >
                <Plus size={16} className="mr-1" />
                Add Item
              </Button>
            </div>
          </div>
          <div className="mobile-form-content">
            <div className="space-y-6">
              {items.map((item, index) => (
                <div key={index} className="mobile-card p-4 border border-gray-200 rounded-lg">
                  {/* Mobile-optimized item form */}
                  <div className="space-y-4">
                    <div>
                      <Label className="mobile-form-label">Product/Service</Label>
                      <ProductServiceSelect
                        value={item.productId}
                        onValueChange={(productId) => updateItem(index, 'productId', productId)}
                        onProductSelect={(product) => handleProductSelect(index, product)}
                        placeholder="Select or create product/service..."
                      />
                      {!item.productId && (
                        <Input
                          className="mt-2 mobile-form-input"
                          placeholder="Or enter description manually..."
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                        />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="mobile-form-label">Quantity</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="mobile-form-input"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="mobile-form-label">Unit Price</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="mobile-form-input"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    {shouldShowVATFields && (
                      <div>
                        <Label className="mobile-form-label">VAT %</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="mobile-form-input"
                          value={item.vatRate}
                          onChange={(e) => updateItem(index, 'vatRate', e.target.value)}
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                      <div>
                        <Label className="mobile-form-label">Total</Label>
                        <div className="text-lg font-bold text-blue-600">
                          {formatCurrency(
                            parseFloat(item.quantity || "0") * 
                            parseFloat(item.unitPrice || "0") * 
                            (shouldShowVATFields ? (1 + parseFloat(item.vatRate || "0") / 100) : 1)
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="min-h-[44px] px-4"
                        onClick={() => removeItem(index)}
                        disabled={items.length <= 1}
                      >
                        <Trash2 size={16} className="mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {items.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No items added yet. Click "Add Item" to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Totals and Submit */}
        <div className="mobile-form">
          <div className="mobile-form-header">
            <h3 className="text-lg font-bold text-white">Invoice Summary</h3>
            <p className="text-blue-100 text-sm">Review and submit</p>
          </div>
          <div className="mobile-form-content space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
              </div>
              {shouldShowVATFields && (
                <div className="flex justify-between">
                  <span>VAT:</span>
                  <span className="font-medium">{formatCurrency(totals.vatAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                <span>Total:</span>
                <span className="text-blue-600">{formatCurrency(totals.total)}</span>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="mobile-btn mobile-btn-primary"
              disabled={createMutation.isPending || updateMutation.isPending || isLoadingInvoice}
            >
              {isLoadingInvoice ? "Loading..." : 
               createMutation.isPending ? "Creating..." : 
               updateMutation.isPending ? "Updating..." :
               isEditing ? "Update Invoice" : "Create Invoice"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

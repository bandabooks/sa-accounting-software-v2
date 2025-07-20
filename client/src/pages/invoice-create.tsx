import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
import { CustomerSelect } from "@/components/CustomerSelect";
import { ProductServiceSelect } from "@/components/ProductServiceSelect";
import { VatRateSelect, VatFieldWrapper } from "@/components/vat-management/vat-conditional-fields";
import { VATCalculator, VATSummary } from "@/components/vat/VATCalculator";
import { calculateLineItemVAT, calculateVATTotals } from "@shared/vat-utils";
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Omit<InsertInvoice, 'invoiceNumber'>>({
    customerId: 0,
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    status: "draft",
    subtotal: "0.00",
    vatAmount: "0.00", 
    total: "0.00",
    notes: ""
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { productId: undefined, description: "", quantity: "1", unitPrice: "0", vatRate: "15", vatInclusive: false, vatAmount: "0.00" }
  ]);

  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: customersApi.getAll
  });

  const { data: invoices } = useQuery({
    queryKey: ["/api/invoices"],
    queryFn: invoicesApi.getAll
  });

  const createMutation = useMutation({
    mutationFn: (data: { invoice: InsertInvoice; items: Omit<InsertInvoiceItem, 'invoiceId'>[] }) => 
      invoicesApi.create(data),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Invoice created",
        description: `Invoice ${invoice.invoiceNumber} has been created successfully.`,
      });
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

  const addItem = () => {
    setItems([...items, { productId: undefined, description: "", quantity: "1", unitPrice: "0", vatRate: "15" }]);
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
      unitPrice: product.price,
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

    const invoiceNumber = generateInvoiceNumber(invoices?.length || 0);
    
    const invoiceData: InsertInvoice = {
      ...formData,
      invoiceNumber
    };

    const itemsData: Omit<InsertInvoiceItem, 'invoiceId'>[] = validItems.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      vatRate: item.vatRate,
      total: (parseFloat(item.quantity) * parseFloat(item.unitPrice) * (1 + parseFloat(item.vatRate) / 100)).toFixed(2)
    }));

    createMutation.mutate({ invoice: invoiceData, items: itemsData });
  };

  const totals = calculateInvoiceTotal(items);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer">Customer *</Label>
              <CustomerSelect
                value={formData.customerId || undefined}
                onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}
                placeholder="Select a customer"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as "paid" | "sent" | "overdue" | "draft" }))}
              >
                <SelectTrigger>
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
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                type="date"
                value={formData.issueDate.toISOString().split('T')[0]}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  issueDate: new Date(e.target.value) 
                }))}
              />
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                type="date"
                value={formData.dueDate.toISOString().split('T')[0]}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  dueDate: new Date(e.target.value) 
                }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              placeholder="Additional notes..."
              value={formData.notes || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Items</CardTitle>
            <Button type="button" onClick={addItem} variant="outline" size="sm">
              <Plus size={16} className="mr-1" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-4">
                  <Label>Product/Service</Label>
                  <ProductServiceSelect
                    value={item.productId}
                    onValueChange={(productId) => updateItem(index, 'productId', productId)}
                    onProductSelect={(product) => handleProductSelect(index, product)}
                    placeholder="Select or create product/service..."
                  />
                  {!item.productId && (
                    <Input
                      className="mt-2"
                      placeholder="Or enter description manually..."
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                    />
                  )}
                </div>
                <div className="col-span-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Unit Price</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label>VAT %</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.vatRate}
                    onChange={(e) => updateItem(index, 'vatRate', e.target.value)}
                  />
                </div>
                <div className="col-span-1">
                  <Label>Total</Label>
                  <div className="text-sm font-medium py-2">
                    {formatCurrency(
                      parseFloat(item.quantity || "0") * 
                      parseFloat(item.unitPrice || "0") * 
                      (1 + parseFloat(item.vatRate || "0") / 100)
                    )}
                  </div>
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={items.length <= 1}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT:</span>
                  <span>{formatCurrency(totals.vatAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => setLocation("/invoices")}>
          Cancel
        </Button>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Creating..." : "Create Invoice"}
        </Button>
      </div>
    </form>
  );
}

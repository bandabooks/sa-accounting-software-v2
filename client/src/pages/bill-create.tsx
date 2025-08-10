import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Calendar as CalendarIcon, Plus, Trash2, Upload } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface BillItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: string;
  vatType: string;
  vatRate: string;
  amount: string;
}

interface Supplier {
  id: number;
  name: string;
  email?: string;
  paymentTerms: number;
}

export default function BillCreate() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [supplierId, setSupplierId] = useState<string>("");
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState("");
  const [billDate, setBillDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [description, setDescription] = useState("");
  const [paymentTerms, setPaymentTerms] = useState<number>(30);
  const [purchaseOrderId, setPurchaseOrderId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<BillItem[]>([
    {
      id: "1",
      description: "",
      quantity: 1,
      unitPrice: "0.00",
      vatType: "standard",
      vatRate: "15.00",
      amount: "0.00"
    }
  ]);

  // Fetch suppliers
  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers'],
    staleTime: 300000,
  });

  // Create bill mutation
  const createBillMutation = useMutation({
    mutationFn: async (billData: any) => {
      return apiRequest("/api/bills", {
        method: "POST",
        body: JSON.stringify(billData),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      toast({
        title: "Bill Created",
        description: "The bill has been created successfully.",
      });
      setLocation("/bills");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create bill. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addItem = () => {
    const newItem: BillItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: "0.00",
      vatType: "standard",
      vatRate: "15.00",
      amount: "0.00"
    };
    setItems([...items, newItem]);
  };

  const removeItem = (itemId: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== itemId));
    }
  };

  const updateItem = (itemId: string, field: keyof BillItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate amount when quantity or unitPrice changes
        if (field === 'quantity' || field === 'unitPrice') {
          const quantity = field === 'quantity' ? value : updatedItem.quantity;
          const unitPrice = field === 'unitPrice' ? value : updatedItem.unitPrice;
          updatedItem.amount = (quantity * parseFloat(unitPrice || '0')).toFixed(2);
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalVat = 0;

    items.forEach(item => {
      const itemAmount = parseFloat(item.amount || '0');
      subtotal += itemAmount;
      
      if (item.vatType === 'standard' || item.vatType === 'reduced') {
        const vatRate = parseFloat(item.vatRate || '0') / 100;
        totalVat += itemAmount * vatRate;
      }
    });

    const total = subtotal + totalVat;

    return {
      subtotal: subtotal.toFixed(2),
      vatAmount: totalVat.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierId) {
      toast({
        title: "Validation Error",
        description: "Please select a supplier.",
        variant: "destructive",
      });
      return;
    }

    if (!supplierInvoiceNumber.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter the supplier invoice number.",
        variant: "destructive",
      });
      return;
    }

    const totals = calculateTotals();
    
    const billData = {
      supplierId: parseInt(supplierId),
      supplierInvoiceNumber,
      billDate: billDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      description,
      subtotal: totals.subtotal,
      vatAmount: totals.vatAmount,
      total: totals.total,
      paymentTerms,
      purchaseOrderId: purchaseOrderId ? parseInt(purchaseOrderId) : null,
      notes,
      items: items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vatType: item.vatType,
        vatRate: item.vatRate,
        amount: item.amount
      })),
      status: "draft",
      approvalStatus: "pending"
    };

    createBillMutation.mutate(billData);
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/bills")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bills
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Bill</h1>
            <p className="text-gray-600 mt-1">Create a new supplier bill/invoice</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bill Information</CardTitle>
                <CardDescription>
                  Enter the basic details from the supplier invoice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier *</Label>
                    <Select value={supplierId} onValueChange={setSupplierId} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers?.map((supplier) => (
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
                      value={supplierInvoiceNumber}
                      onChange={(e) => setSupplierInvoiceNumber(e.target.value)}
                      placeholder="Enter supplier's invoice number"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Bill Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !billDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {billDate ? format(billDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={billDate}
                          onSelect={(date) => date && setBillDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Due Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dueDate}
                          onSelect={(date) => date && setDueDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">Payment Terms (days)</Label>
                    <Input
                      id="paymentTerms"
                      type="number"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(parseInt(e.target.value) || 0)}
                      placeholder="30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purchaseOrder">Purchase Order (Optional)</Label>
                    <Select value={purchaseOrderId} onValueChange={setPurchaseOrderId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Link to purchase order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">PO-2025-001</SelectItem>
                        <SelectItem value="2">PO-2025-002</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Bill Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of this bill..."
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Bill Items</CardTitle>
                    <CardDescription>Add line items from the supplier invoice</CardDescription>
                  </div>
                  <Button type="button" onClick={addItem} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="space-y-4 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Item {index + 1}</h4>
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-3">
                          <Label>Description *</Label>
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            placeholder="Item description"
                            required
                          />
                        </div>

                        <div>
                          <Label>Quantity *</Label>
                          <Input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                            required
                          />
                        </div>

                        <div>
                          <Label>Unit Price *</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                            placeholder="0.00"
                            required
                          />
                        </div>

                        <div>
                          <Label>VAT Type</Label>
                          <Select
                            value={item.vatType}
                            onValueChange={(value) => updateItem(item.id, 'vatType', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard (15%)</SelectItem>
                              <SelectItem value="zero">Zero-rated (0%)</SelectItem>
                              <SelectItem value="exempt">Exempt</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="md:col-span-3">
                          <div className="text-right">
                            <span className="text-sm font-medium text-gray-600">Line Total: </span>
                            <span className="text-lg font-bold">R {item.amount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional notes or comments..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Attachments</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <Button type="button" variant="outline">
                          Upload Invoice Files
                        </Button>
                        <p className="mt-2 text-sm text-gray-500">
                          PDF, images up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bill Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>R {totals.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">VAT:</span>
                    <span>R {totals.vatAmount}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>R {totals.total}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items:</span>
                    <span>{items.length}</span>
                  </div>
                  {supplierId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Supplier:</span>
                      <span>{suppliers?.find(s => s.id.toString() === supplierId)?.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Terms:</span>
                    <span>{paymentTerms} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={createBillMutation.isPending}
              >
                {createBillMutation.isPending ? "Creating..." : "Create Bill"}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setLocation("/bills")}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
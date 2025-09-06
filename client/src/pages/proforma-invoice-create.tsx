import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "wouter";
import { z } from "zod";
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Calculator,
  Calendar,
  User,
  FileText,
  DollarSign,
  Search,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

// Form schema
const proformaInvoiceItemSchema = z.object({
  productId: z.number().optional(),
  description: z.string().min(1, "Description is required"),
  quantity: z.string().min(1, "Quantity is required"),
  unitPrice: z.string().min(1, "Unit price is required"),
  vatRate: z.string().default("15"),
  vatInclusive: z.boolean().default(true),
});

const proformaInvoiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  status: z.string().default("draft"),
  notes: z.string().optional(),
  items: z.array(proformaInvoiceItemSchema).min(1, "At least one item is required"),
});

type ProformaInvoiceForm = z.infer<typeof proformaInvoiceSchema>;

type Customer = {
  id: number;
  name: string;
  email: string;
};

type Product = {
  id: number;
  name: string;
  description: string;
  unitPrice: string;
  vatRate: string;
  category?: string;
};

export default function ProformaInvoiceCreate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const { id } = useParams();
  const isEditing = !!id;
  const [openProductDropdowns, setOpenProductDropdowns] = useState<boolean[]>([]);

  const form = useForm<ProformaInvoiceForm>({
    resolver: zodResolver(proformaInvoiceSchema),
    defaultValues: {
      customerId: "",
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      status: "draft",
      notes: "",
      items: [
        {
          productId: undefined,
          description: "",
          quantity: "1",
          unitPrice: "0",
          vatRate: "15",
          vatInclusive: true,
        }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Fetch customers
  const { data: customersData = [] } = useQuery({
    queryKey: ["/api/customers"],
    retry: 1,
    onError: (error: any) => {
      console.error("Failed to fetch customers:", error);
    }
  });

  // Fetch products
  const { data: productsData = [] } = useQuery({
    queryKey: ["/api/products"],
    retry: 1,
    onError: (error: any) => {
      console.error("Failed to fetch products:", error);
    }
  });

  // Fetch existing proforma invoice if editing
  const { data: proformaInvoice } = useQuery({
    queryKey: ["/api/proforma-invoices", id],
    enabled: isEditing,
    retry: 1,
    onError: (error: any) => {
      console.error("Failed to fetch proforma invoice:", error);
    }
  });

  // Initialize product dropdown states
  useEffect(() => {
    setOpenProductDropdowns(new Array(fields.length).fill(false));
  }, [fields.length]);

  // Populate form when editing
  useEffect(() => {
    if (proformaInvoice && isEditing) {
      form.reset({
        customerId: proformaInvoice.customerId.toString(),
        issueDate: new Date(proformaInvoice.issueDate).toISOString().split('T')[0],
        expiryDate: new Date(proformaInvoice.expiryDate).toISOString().split('T')[0],
        status: proformaInvoice.status,
        notes: proformaInvoice.notes || "",
        items: proformaInvoice.items.map((item: any) => ({
          productId: item.productId,
          description: item.description,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
          vatRate: item.vatRate.toString(),
          vatInclusive: item.vatInclusive,
        }))
      });
    }
  }, [proformaInvoice, isEditing, form]);

  // Create/Update mutation
  const saveProformaMutation = useMutation({
    mutationFn: async (data: ProformaInvoiceForm) => {
      const { items, ...proformaData } = data;
      
      // Calculate totals
      const calculatedItems = items.map(item => {
        const quantity = parseFloat(item.quantity);
        const unitPrice = parseFloat(item.unitPrice);
        const vatRate = parseFloat(item.vatRate);
        
        let vatAmount = 0;
        let total = 0;
        
        if (item.vatInclusive) {
          total = quantity * unitPrice;
          vatAmount = total * (vatRate / (100 + vatRate));
        } else {
          const subtotal = quantity * unitPrice;
          vatAmount = subtotal * (vatRate / 100);
          total = subtotal + vatAmount;
        }
        
        return {
          productId: item.productId,
          description: item.description,
          quantity: quantity.toString(),
          unitPrice: unitPrice.toString(),
          vatRate: vatRate.toString(),
          vatInclusive: item.vatInclusive,
          vatAmount: vatAmount.toFixed(2),
          total: total.toFixed(2)
        };
      });
      
      const subtotal = calculatedItems.reduce((sum, item) => sum + (parseFloat(item.total) - parseFloat(item.vatAmount)), 0);
      const totalVat = calculatedItems.reduce((sum, item) => sum + parseFloat(item.vatAmount), 0);
      const grandTotal = calculatedItems.reduce((sum, item) => sum + parseFloat(item.total), 0);
      
      const payload = {
        ...proformaData,
        customerId: parseInt(proformaData.customerId),
        subtotal: subtotal.toFixed(2),
        vatAmount: totalVat.toFixed(2),
        total: grandTotal.toFixed(2),
        items: calculatedItems
      };
      
      if (isEditing) {
        return await apiRequest(`/api/proforma-invoices/${id}`, "PUT", payload);
      } else {
        return await apiRequest("/api/proforma-invoices", "POST", payload);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Proforma invoice ${isEditing ? "updated" : "created"} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/proforma-invoices"] });
      navigate("/proforma-invoices");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditing ? "update" : "create"} proforma invoice`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProformaInvoiceForm) => {
    saveProformaMutation.mutate(data);
  };

  // Handle product selection
  const handleProductSelect = (index: number, product: Product) => {
    const currentItems = form.getValues("items");
    currentItems[index] = {
      ...currentItems[index],
      productId: product.id,
      description: product.description || product.name,
      unitPrice: product.unitPrice,
      vatRate: product.vatRate || "15",
    };
    
    form.setValue("items", currentItems);
    
    // Close the dropdown
    const newOpenStates = [...openProductDropdowns];
    newOpenStates[index] = false;
    setOpenProductDropdowns(newOpenStates);
  };

  // Toggle product dropdown
  const toggleProductDropdown = (index: number, open: boolean) => {
    const newOpenStates = [...openProductDropdowns];
    newOpenStates[index] = open;
    setOpenProductDropdowns(newOpenStates);
  };

  // Calculate totals for display
  const watchedItems = form.watch("items");
  const calculatedTotals = watchedItems.reduce(
    (acc, item) => {
      const quantity = parseFloat(item.quantity || "0");
      const unitPrice = parseFloat(item.unitPrice || "0");
      const vatRate = parseFloat(item.vatRate || "0");
      
      let itemVat = 0;
      let itemTotal = 0;
      
      if (item.vatInclusive) {
        itemTotal = quantity * unitPrice;
        itemVat = itemTotal * (vatRate / (100 + vatRate));
      } else {
        const itemSubtotal = quantity * unitPrice;
        itemVat = itemSubtotal * (vatRate / 100);
        itemTotal = itemSubtotal + itemVat;
      }
      
      acc.subtotal += itemTotal - itemVat;
      acc.vat += itemVat;
      acc.total += itemTotal;
      
      return acc;
    },
    { subtotal: 0, vat: 0, total: 0 }
  );

  return (
    <div className="container mx-auto p-6" data-testid="proforma-create-page">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/proforma-invoices">
          <Button variant="outline" size="sm" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Proforma Invoices
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900" data-testid="page-title">
            {isEditing ? "Edit Proforma Invoice" : "Create Proforma Invoice"}
          </h1>
          <p className="text-gray-600">
            {isEditing ? "Update proforma invoice details" : "Create a new proforma invoice for customer approval"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Header Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Proforma Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-customer">
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customersData.map((customer: Customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="viewed">Viewed</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Date *</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        data-testid="input-issue-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date *</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        data-testid="input-expiry-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Additional notes or terms..."
                          data-testid="textarea-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Line Items
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    append({
                      productId: undefined,
                      description: "",
                      quantity: "1",
                      unitPrice: "0",
                      vatRate: "15",
                      vatInclusive: true,
                    });
                    setOpenProductDropdowns([...openProductDropdowns, false]);
                  }}
                  data-testid="button-add-item"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg space-y-4">
                    {/* Product Selection Row */}
                    <div className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-6">
                        <Label>Select Product (Optional)</Label>
                        <Popover 
                          open={openProductDropdowns[index]} 
                          onOpenChange={(open) => toggleProductDropdown(index, open)}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openProductDropdowns[index]}
                              className="w-full justify-between"
                              data-testid={`button-select-product-${index}`}
                            >
                              <span className="truncate">
                                {form.watch(`items.${index}.productId`) ? 
                                  productsData.find((p: Product) => p.id === form.watch(`items.${index}.productId`))?.name || "Select product..." :
                                  "Select product..."
                                }
                              </span>
                              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[400px] p-0">
                            <Command>
                              <CommandInput placeholder="Search products..." className="h-9" />
                              <CommandEmpty>No products found.</CommandEmpty>
                              <CommandList>
                                <CommandGroup>
                                  {productsData.map((product: Product) => (
                                    <CommandItem
                                      key={product.id}
                                      value={`${product.name} ${product.description}`}
                                      onSelect={() => handleProductSelect(index, product)}
                                      className="cursor-pointer"
                                    >
                                      <div className="flex-1">
                                        <div className="font-medium">{product.name}</div>
                                        <div className="text-sm text-gray-500">{product.description}</div>
                                        <div className="text-sm text-green-600">R {parseFloat(product.unitPrice || "0").toFixed(2)}</div>
                                      </div>
                                      <Check
                                        className={cn(
                                          "ml-auto h-4 w-4",
                                          form.watch(`items.${index}.productId`) === product.id ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="col-span-6"></div>
                    </div>

                    {/* Item Details Row */}
                    <div className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-4">
                        <Label>Description *</Label>
                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Item description"
                                  className="min-h-[60px]"
                                  data-testid={`input-description-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-2">
                        <Label>Quantity *</Label>
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  data-testid={`input-quantity-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-2">
                        <Label>Unit Price *</Label>
                        <FormField
                          control={form.control}
                          name={`items.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  data-testid={`input-unit-price-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-2">
                        <Label>VAT Rate (%)</Label>
                        <FormField
                          control={form.control}
                          name={`items.${index}.vatRate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  data-testid={`input-vat-rate-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-1">
                        <Label>VAT Incl.</Label>
                        <FormField
                          control={form.control}
                          name={`items.${index}.vatInclusive`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="w-4 h-4 mt-2"
                                  data-testid={`checkbox-vat-inclusive-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-1 flex justify-center">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              remove(index);
                              setOpenProductDropdowns(prev => prev.filter((_, i) => i !== index));
                            }}
                            data-testid={`button-remove-item-${index}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Totals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-right max-w-sm ml-auto">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span data-testid="text-subtotal">
                    R {calculatedTotals.subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>VAT:</span>
                  <span data-testid="text-vat">
                    R {calculatedTotals.vat.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span data-testid="text-total">
                    R {calculatedTotals.total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link href="/proforma-invoices">
              <Button variant="outline" data-testid="button-cancel">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={saveProformaMutation.isPending}
              data-testid="button-save"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveProformaMutation.isPending 
                ? (isEditing ? "Updating..." : "Creating...") 
                : (isEditing ? "Update" : "Create")
              } Proforma Invoice
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
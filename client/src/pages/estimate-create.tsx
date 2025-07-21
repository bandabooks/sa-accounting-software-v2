import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { insertEstimateSchema, insertEstimateItemSchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useGlobalNotification } from "@/contexts/NotificationContext";
import { formatCurrency } from "@/lib/utils-invoice";
import { VATCalculator, VATSummary } from "@/components/vat/VATCalculator";
import { calculateLineItemVAT, calculateVATTotals } from "@shared/vat-utils";

// Create form schema combining estimate and items
const estimateFormSchema = insertEstimateSchema.extend({
  items: z.array(insertEstimateItemSchema.omit({ estimateId: true })).min(1, "At least one item is required"),
});

type EstimateFormData = z.infer<typeof estimateFormSchema>;

export default function EstimateCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { showSuccess } = useGlobalNotification();
  const queryClient = useQueryClient();

  const form = useForm<EstimateFormData>({
    resolver: zodResolver(estimateFormSchema),
    defaultValues: {
      customerId: undefined,
      estimateNumber: "",
      issueDate: new Date(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "draft",
      subtotal: "0.00",
      vatAmount: "0.00",
      total: "0.00",
      notes: "",
      items: [
        {
          description: "",
          quantity: "1",
          unitPrice: "0.00",
          vatRate: "15",
          vatInclusive: false,
          vatAmount: "0.00",
          total: "0.00",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
  });

  const { data: products } = useQuery({
    queryKey: ["/api/products"],
  });

  const createEstimateMutation = useMutation({
    mutationFn: async (data: EstimateFormData) => {
      const { items, ...estimate } = data;
      const response = await fetch("/api/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estimate,
          items: items.map(item => ({
            ...item,
            quantity: item.quantity.toString(),
            vatRate: item.vatRate?.toString() || "15"
          }))
        }),
      });
      if (!response.ok) throw new Error("Failed to create estimate");
      return response.json();
    },
    onSuccess: (estimate) => {
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      showSuccess(
        "Estimate Created Successfully!",
        `Estimate ${estimate.estimateNumber} has been created and saved.`
      );
      setLocation(`/estimates/${estimate.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create estimate",
        variant: "destructive",
      });
    },
  });

  const watchedItems = form.watch("items");

  // Calculate totals
  const subtotal = watchedItems.reduce((sum, item) => {
    const quantity = parseFloat(item.quantity?.toString() || "0");
    const unitPrice = parseFloat(item.unitPrice?.toString() || "0");
    return sum + (quantity * unitPrice);
  }, 0);

  const vatAmount = watchedItems.reduce((sum, item) => {
    const quantity = parseFloat(item.quantity?.toString() || "0");
    const unitPrice = parseFloat(item.unitPrice?.toString() || "0");
    const vatRate = parseFloat(item.vatRate?.toString() || "0");
    const itemTotal = quantity * unitPrice;
    return sum + (itemTotal * vatRate / 100);
  }, 0);

  const total = subtotal + vatAmount;

  // Update form totals
  form.setValue("subtotal", subtotal.toFixed(2));
  form.setValue("vatAmount", vatAmount.toFixed(2));
  form.setValue("total", total.toFixed(2));

  const onSubmit = (data: EstimateFormData) => {
    // Update item totals
    data.items.forEach((item, index) => {
      const quantity = parseFloat(item.quantity?.toString() || "0");
      const unitPrice = parseFloat(item.unitPrice?.toString() || "0");
      const vatRate = parseFloat(item.vatRate?.toString() || "0");
      const itemSubtotal = quantity * unitPrice;
      const itemVat = itemSubtotal * vatRate / 100;
      const itemTotal = itemSubtotal + itemVat;
      
      form.setValue(`items.${index}.total`, itemTotal.toFixed(2));
      data.items[index].total = itemTotal.toFixed(2);
    });

    createEstimateMutation.mutate(data);
  };

  const addItem = () => {
    append({
      description: "",
      quantity: "1",
      unitPrice: "0.00",
      vatRate: "15",
      vatInclusive: false,
      vatAmount: "0.00",
      total: "0.00",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/estimates")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Estimates
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Estimate</h1>
          <p className="text-gray-600">Create a new estimate for your customer</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer & Estimate Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Estimate Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select customer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {customers?.map((customer: any) => (
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
                      name="estimateNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimate Number</FormLabel>
                          <FormControl>
                            <Input placeholder="EST-2025-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="issueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issue Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value} />
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
                          <FormLabel>Expiry Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional notes for this estimate..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Items */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Items</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Item {index + 1}</h4>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="md:col-span-2 lg:col-span-2">
                            <FormField
                              control={form.control}
                              name={`items.${index}.productId`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Product/Service</FormLabel>
                                  <Select
                                    onValueChange={(value) => {
                                      const productId = parseInt(value);
                                      field.onChange(productId);
                                      
                                      // Auto-fill product details
                                      const product = products?.find((p: any) => p.id === productId);
                                      if (product) {
                                        form.setValue(`items.${index}.description`, product.name);
                                        form.setValue(`items.${index}.unitPrice`, product.price || 0);
                                        form.setValue(`items.${index}.vatRate`, product.vatRate || 15);
                                      }
                                    }}
                                    value={field.value?.toString()}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select product/service" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {products?.map((product: any) => (
                                        <SelectItem key={product.id} value={product.id.toString()}>
                                          {product.name} - {formatCurrency(product.price || 0)}
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
                              name={`items.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description (Optional Override)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Custom description" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.unitPrice`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Unit Price</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.vatRate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>VAT %</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="md:col-span-2 lg:col-span-4">
                            <div className="text-sm text-gray-600">
                              Item Total: {formatCurrency(
                                (
                                  (parseFloat(watchedItems[index]?.quantity?.toString() || "0")) *
                                  (parseFloat(watchedItems[index]?.unitPrice?.toString() || "0")) *
                                  (1 + (parseFloat(watchedItems[index]?.vatRate?.toString() || "0")) / 100)
                                ).toFixed(2)
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>{formatCurrency(subtotal.toFixed(2))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">VAT:</span>
                      <span>{formatCurrency(vatAmount.toFixed(2))}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span>{formatCurrency(total.toFixed(2))}</span>
                    </div>
                  </div>
                  <div className="mt-6 space-y-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createEstimateMutation.isPending}
                    >
                      {createEstimateMutation.isPending ? "Creating..." : "Create Estimate"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setLocation("/estimates")}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
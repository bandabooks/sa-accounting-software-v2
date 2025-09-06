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
  DollarSign
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Form schema
const proformaInvoiceItemSchema = z.object({
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

export default function ProformaInvoiceCreate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const { id } = useParams();
  const isEditing = !!id;

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

  // Fetch existing proforma invoice if editing
  const { data: proformaInvoice } = useQuery({
    queryKey: ["/api/proforma-invoices", id],
    enabled: isEditing,
    retry: 1,
    onError: (error: any) => {
      console.error("Failed to fetch proforma invoice:", error);
    }
  });

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
                  onClick={() => append({
                    description: "",
                    quantity: "1",
                    unitPrice: "0",
                    vatRate: "15",
                    vatInclusive: true,
                  })}
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
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
                    <div className="col-span-4">
                      <Label>Description *</Label>
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Item description"
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
                                className="w-4 h-4"
                                data-testid={`checkbox-vat-inclusive-${index}`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-1">
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove(index)}
                          data-testid={`button-remove-item-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
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
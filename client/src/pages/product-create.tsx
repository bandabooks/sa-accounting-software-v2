import { useState } from "react";
import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Package, Wrench, Save, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useVATStatus } from "@/hooks/useVATStatus";
import { VATFieldWrapper } from "@/components/vat/VATConditionalWrapper";
import type { ProductCategory } from "@shared/schema";
import CategorySelect from "@/components/CategorySelect";
import { AccountSelect } from "@/components/AccountSelect";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  sku: z.string().optional(),
  categoryId: z.string().optional(),
  unitPrice: z.string().min(1, "Price is required"),  
  costPrice: z.string().optional(),
  vatRate: z.string().optional(),
  incomeAccountId: z.string().min(1, "Income account is required"),
  expenseAccountId: z.string().min(1, "Expense account is required for accurate reporting"),
  stockQuantity: z.number().optional(),
  minStockLevel: z.number().optional(),
  isService: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { shouldShowVATFields } = useVATStatus();

  const { data: categories = [] } = useQuery<ProductCategory[]>({
    queryKey: ["/api/product-categories"],
  });

  // Query for Chart of Accounts to set defaults
  const { data: accounts = [] } = useQuery<any[]>({
    queryKey: ["/api/chart-of-accounts"],
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      unitPrice: "0.00",
      costPrice: "0.00",
      vatRate: "15.00",
      incomeAccountId: "",
      expenseAccountId: "",
      stockQuantity: 0,
      minStockLevel: 0,
      isService: false,
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      await apiRequest("/api/products", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      setLocation("/products");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    createProductMutation.mutate(data);
  };

  const isService = form.watch("isService");

  // Set default accounts based on service type
  const setDefaultAccounts = () => {
    // Filter accounts by current company first
    const companyAccounts = accounts.filter((acc: any) => 
      activeCompany && acc.companyId === activeCompany.id
    );

    const incomeAccount = companyAccounts.find((acc: any) => 
      acc.accountType === "Revenue" && (
        isService 
          ? acc.accountName.toLowerCase().includes("service")
          : acc.accountName.toLowerCase().includes("sales") || acc.accountName.toLowerCase().includes("product")
      )
    );
    
    const expenseAccount = companyAccounts.find((acc: any) => 
      acc.accountType === "Cost of Goods Sold" && (
        isService 
          ? acc.accountName.toLowerCase().includes("service")
          : acc.accountName.toLowerCase().includes("goods") || acc.accountName.toLowerCase().includes("cogs")
      )
    );

    if (incomeAccount && !form.getValues("incomeAccountId")) {
      form.setValue("incomeAccountId", incomeAccount.id.toString());
    }
    
    if (expenseAccount && !form.getValues("expenseAccountId")) {
      form.setValue("expenseAccountId", expenseAccount.id.toString());
    }
  };

  // Get active company for filtering accounts
  const { data: activeCompany } = useQuery({
    queryKey: ["/api/companies/active"],
  });

  // Set defaults when accounts load or service type changes
  React.useEffect(() => {
    if (accounts.length > 0 && activeCompany) {
      setDefaultAccounts();
    }
  }, [accounts, isService, form, activeCompany]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          onClick={() => setLocation("/products")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Item</h1>
          <p className="text-gray-600 dark:text-gray-400">Create a new product or service</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>What are you adding?</CardTitle>
              <CardDescription>
                Choose whether you're adding a physical product or a service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="isService"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`cursor-pointer rounded-lg border p-6 text-center transition-all ${
                          !field.value
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => field.onChange(false)}
                      >
                        <Package className="mx-auto mb-3 h-8 w-8 text-blue-600" />
                        <h3 className="font-semibold">Product</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Physical items you sell with inventory tracking
                        </p>
                        {!field.value && (
                          <Badge className="mt-2" variant="default">
                            Selected
                          </Badge>
                        )}
                      </div>
                      <div
                        className={`cursor-pointer rounded-lg border p-6 text-center transition-all ${
                          field.value
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => field.onChange(true)}
                      >
                        <Wrench className="mx-auto mb-3 h-8 w-8 text-blue-600" />
                        <h3 className="font-semibold">Service</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Services you provide without physical inventory
                        </p>
                        {field.value && (
                          <Badge className="mt-2" variant="default">
                            Selected
                          </Badge>
                        )}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isService ? <Wrench className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                {isService ? "Service" : "Product"} Details
              </CardTitle>
              <CardDescription>
                Essential information about your {isService ? "service" : "product"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Name and SKU */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isService ? "Service Name" : "Product Name"} *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={`Enter ${isService ? "service" : "product"} name`} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU/Code</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Auto-generated if empty" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Unique identifier for this {isService ? "service" : "product"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Category and Description */}
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <CategorySelect
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select or create category"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={`Describe this ${isService ? "service" : "product"}...`}
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Choose the accounts for recording income and expenses from this {isService ? "service" : "product"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="incomeAccountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Income Account *</FormLabel>
                      <FormControl>
                        <AccountSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select income account"
                          accountType="revenue"
                        />
                      </FormControl>
                      <FormDescription>
                        Account where {isService ? "service" : "sales"} revenue will be recorded
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expenseAccountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expense Account *</FormLabel>
                      <FormControl>
                        <AccountSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select expense account"
                          accountType="expense"
                        />
                      </FormControl>
                      <FormDescription>
                        {isService ? "Account for service delivery costs" : "Account for cost of goods sold (COGS)"}
                      </FormDescription>     
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>
                Set the selling price{!isService ? " and cost" : ""} for this {isService ? "service" : "product"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selling Price *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="pl-8"
                            {...field} 
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isService && (
                  <FormField
                    control={form.control}
                    name="costPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost Price</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="pl-8"
                              {...field} 
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R</span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          What it costs you to buy/make this product
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <VATFieldWrapper>
                  <FormField
                    control={form.control}
                    name="vatRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VAT Rate</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              placeholder="15.00"
                              className="pr-8"
                              {...field} 
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </VATFieldWrapper>
              </div>
            </CardContent>
          </Card>

          {/* Inventory - Only for Products */}
          {!isService && (
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
                <CardDescription>
                  Track stock levels for this product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="stockQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Stock</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          How many units you currently have
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minStockLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Stock Alert</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Get alerts when stock drops below this level
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/products")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createProductMutation.isPending}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {createProductMutation.isPending ? "Creating..." : `Create ${isService ? "Service" : "Product"}`}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
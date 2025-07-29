import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CategorySelect } from "@/components/CategorySelect";
import { ArrowLeft, Save } from "lucide-react";
import type { Product, ProductCategory, VatType } from "@shared/schema";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  sku: z.string().optional(),
  unitPrice: z.string().min(0, "Price must be positive"),
  costPrice: z.string().optional(),
  categoryId: z.number().optional(),
  vatTypeId: z.number().optional(),
  isService: z.boolean().default(false),
  stockQuantity: z.number().min(0, "Stock quantity must be positive").optional(),
  minStockLevel: z.number().min(0, "Minimum stock level must be positive").optional(),
  maxStockLevel: z.number().min(0, "Maximum stock level must be positive").optional(),
  unit: z.string().optional(),
  barcode: z.string().optional(),
  isActive: z.boolean().default(true),
});

type ProductForm = z.infer<typeof productSchema>;

export default function ProductEdit() {
  const [, params] = useRoute("/products/:id/edit");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const productId = params?.id ? parseInt(params.id) : null;

  const { data: product, isLoading: productLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    enabled: !!productId,
  });

  const { data: categories = [] } = useQuery<ProductCategory[]>({
    queryKey: ["/api/product-categories"],
  });

  const { data: vatTypes = [] } = useQuery<VatType[]>({
    queryKey: ["/api/vat-types"],
  });

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      unitPrice: "0",
      costPrice: "0",
      isService: false,
      stockQuantity: 0,
      minStockLevel: 0,
      maxStockLevel: 0,
      unit: "",
      barcode: "",
      isActive: true,
    },
  });

  // Load product data into form when product is fetched
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || "",
        sku: product.sku || "",
        unitPrice: product.unitPrice || "0",
        costPrice: product.costPrice || "0",
        categoryId: product.categoryId || undefined,
        vatTypeId: product.vatTypeId || undefined,
        isService: product.isService || false,
        stockQuantity: product.stockQuantity || 0,
        minStockLevel: product.minStockLevel || 0,
        maxStockLevel: product.maxStockLevel || 0,
        unit: product.unit || "",
        barcode: product.barcode || "",
        isActive: product.isActive !== false,
      });
    }
  }, [product, form]);

  const updateProductMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      await apiRequest(`/api/products/${productId}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId] });
      toast({
        title: "Success",
        description: "Product updated successfully",
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

  const onSubmit = (data: ProductForm) => {
    // Convert only the fields that need to be numbers for backend
    const formattedData = {
      ...data,
      categoryId: data.categoryId ? parseInt(data.categoryId) : undefined,
      vatTypeId: data.vatTypeId ? parseInt(data.vatTypeId) : undefined,
    };
    updateProductMutation.mutate(formattedData);
  };

  if (!productId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Invalid Product ID</h1>
          <p className="text-gray-600 mt-2">The product ID provided is not valid.</p>
          <Button onClick={() => setLocation("/products")} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  if (productLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Product Not Found</h1>
          <p className="text-gray-600 mt-2">The product you're trying to edit could not be found.</p>
          <Button onClick={() => setLocation("/products")} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => setLocation("/products")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600 mt-1">Update product information</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Update the product information below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product/Service Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Professional consultation" {...field} />
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
                        <Input placeholder="PROF-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your product or service..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price (R) *</FormLabel>
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
                  name="costPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost Price (R)</FormLabel>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <CategorySelect
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select a category"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vatTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VAT Rate</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select VAT rate" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vatTypes.map((vatType) => (
                            <SelectItem key={vatType.id} value={vatType.id.toString()}>
                              {vatType.name} ({parseFloat(vatType.rate).toFixed(0)}%)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isService"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        This is a service
                      </FormLabel>
                      <FormDescription>
                        Services don't track inventory levels
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {!form.watch("isService") && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">Inventory Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      name="minStockLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Stock Level</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
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
                      name="maxStockLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Stock Level</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit of Measure</FormLabel>
                          <FormControl>
                            <Input placeholder="Each, kg, hours, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="barcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Barcode</FormLabel>
                          <FormControl>
                            <Input placeholder="Product barcode" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Active Product
                      </FormLabel>
                      <FormDescription>
                        Inactive products won't appear in selection lists
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setLocation("/products")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateProductMutation.isPending}
                >
                  {updateProductMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Product
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
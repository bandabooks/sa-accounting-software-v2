import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { Product, ProductCategory } from "@shared/schema";

interface ProductServiceSelectProps {
  value?: number;
  onValueChange: (value: number) => void;
  onProductSelect?: (product: Product) => void;
  placeholder?: string;
  disabled?: boolean;
}

interface QuickCreateData {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  sku: string;
  vatRate: string;
}

export function ProductServiceSelect({
  value,
  onValueChange,
  onProductSelect,
  placeholder = "Select product/service...",
  disabled = false,
}: ProductServiceSelectProps) {
  const [open, setOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [quickCreateData, setQuickCreateData] = useState<QuickCreateData>({
    name: "",
    description: "",
    price: "0.00",
    categoryId: "",
    sku: "",
    vatRate: "15.00",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/product-categories"],
  });

  const { data: vatTypes = [] } = useQuery({
    queryKey: ["/api/vat-types"],
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/products", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create product");
      }
      return response.json();
    },
    onSuccess: (newProduct: Product) => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      onValueChange(newProduct.id);
      if (onProductSelect) {
        onProductSelect(newProduct);
      }
      setQuickCreateOpen(false);
      setQuickCreateData({
        name: "",
        description: "",
        price: "0.00",
        categoryId: "",
        sku: "",
        vatRate: "15.00",
      });
      toast({
        title: "Success",
        description: "Product created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await apiRequest("POST", "/api/product-categories", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create category");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/product-categories"] });
      toast({
        title: "Success",
        description: "Category created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const selectedProduct = products.find((p: Product) => p.id === value);

  const handleQuickCreate = () => {
    if (!quickCreateData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return;
    }

    createProductMutation.mutate({
      name: quickCreateData.name.trim(),
      description: quickCreateData.description.trim() || null,
      price: quickCreateData.price,
      categoryId: quickCreateData.categoryId ? parseInt(quickCreateData.categoryId) : null,
      sku: quickCreateData.sku.trim() || null,
      vatRate: quickCreateData.vatRate,
      stockQuantity: 0,
      reorderLevel: 0,
      companyId: 2, // Fixed company ID
    });
  };

  const generateSKU = () => {
    const name = quickCreateData.name.trim();
    if (name) {
      const sku = name
        .split(' ')
        .map(word => word.substring(0, 3).toUpperCase())
        .join('') + Date.now().toString().slice(-4);
      setQuickCreateData(prev => ({ ...prev, sku }));
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedProduct ? selectedProduct.name : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search products/services..." />
            <CommandList>
              <CommandEmpty className="p-2">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    No products found.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => {
                      setQuickCreateOpen(true);
                      setOpen(false);
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Product
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setQuickCreateOpen(true);
                    setOpen(false);
                  }}
                  className="bg-muted/50 font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Product/Service
                </CommandItem>
                {products.map((product: Product) => (
                  <CommandItem
                    key={product.id}
                    onSelect={() => {
                      onValueChange(product.id);
                      if (onProductSelect) {
                        onProductSelect(product);
                      }
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === product.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{product.name}</div>
                      {product.description && (
                        <div className="text-sm text-muted-foreground">
                          {product.description}
                        </div>
                      )}
                      <div className="text-sm font-medium text-green-600">
                        {formatCurrency(product.price || 0)}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Quick Create Dialog */}
      <Dialog open={quickCreateOpen} onOpenChange={setQuickCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Product/Service</DialogTitle>
            <DialogDescription>
              Add a new product or service to your catalog.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={quickCreateData.name}
                onChange={(e) =>
                  setQuickCreateData(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder="Product or service name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={quickCreateData.description}
                onChange={(e) =>
                  setQuickCreateData(prev => ({ ...prev, description: e.target.value }))
                }
                placeholder="Product description"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price (R)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={quickCreateData.price}
                  onChange={(e) =>
                    setQuickCreateData(prev => ({ ...prev, price: e.target.value }))
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="vatRate">VAT Rate (%)</Label>
                <Select
                  value={quickCreateData.vatRate}
                  onValueChange={(value) =>
                    setQuickCreateData(prev => ({ ...prev, vatRate: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vatTypes.map((vatType: any) => (
                      <SelectItem key={vatType.id} value={vatType.rate}>
                        {vatType.name} ({vatType.rate}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU</Label>
                <div className="flex gap-2">
                  <Input
                    id="sku"
                    value={quickCreateData.sku}
                    onChange={(e) =>
                      setQuickCreateData(prev => ({ ...prev, sku: e.target.value }))
                    }
                    placeholder="Product SKU"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={generateSKU}>
                    Generate
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <div className="flex gap-2">
                  <Select
                    value={quickCreateData.categoryId}
                    onValueChange={(value) =>
                      setQuickCreateData(prev => ({ ...prev, categoryId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category: ProductCategory) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const categoryName = prompt("Enter new category name:");
                      if (categoryName) {
                        createCategoryMutation.mutate({ name: categoryName });
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleQuickCreate}
              disabled={createProductMutation.isPending}
            >
              {createProductMutation.isPending ? "Creating..." : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
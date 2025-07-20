import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { Product } from "@shared/schema";

interface ProductServiceSelectProps {
  value?: number;
  onValueChange: (value: number) => void;
  onProductSelect?: (product: Product) => void;
  placeholder?: string;
  disabled?: boolean;
}



export function ProductServiceSelect({
  value,
  onValueChange,
  onProductSelect,
  placeholder = "Select product/service...",
  disabled = false,
}: ProductServiceSelectProps) {
  const [open, setOpen] = useState(false);

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
                      // Navigate to product creation page instead of opening modal
                      window.location.href = '/products/create';
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
                    // Navigate to product creation page instead of opening modal
                    window.location.href = '/products/create';
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
    </>
  );
}
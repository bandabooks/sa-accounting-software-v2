import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const selectedProduct = products.find((p: Product) => p.id === value);

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
                {(products as Product[]).map((product: Product) => (
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
                        {formatCurrency(parseFloat(product.unitPrice || "0"))}
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
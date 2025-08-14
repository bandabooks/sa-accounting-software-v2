import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { cn } from "@/lib/utils";
import type { Customer } from "@shared/schema";

interface CustomerSelectProps {
  value?: number;
  onValueChange: (value: number) => void;
  onCustomerSelect?: (customer: Customer) => void;
  placeholder?: string;
  disabled?: boolean;
}

interface QuickCreateData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  vatNumber: string;
}

export function CustomerSelect({
  value,
  onValueChange,
  onCustomerSelect,
  placeholder = "Select customer...",
  disabled = false,
}: CustomerSelectProps) {
  const [open, setOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [quickCreateData, setQuickCreateData] = useState<QuickCreateData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    vatNumber: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["/api/customers"],
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("/api/customers", "POST", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create customer");
      }
      return response.json();
    },
    onSuccess: (newCustomer: Customer) => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      onValueChange(newCustomer.id);
      if (onCustomerSelect) {
        onCustomerSelect(newCustomer);
      }
      setQuickCreateOpen(false);
      setQuickCreateData({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        vatNumber: "",
      });
      toast({
        title: "Success",
        description: "Customer created successfully",
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

  const selectedCustomer = customers.find((c: Customer) => c.id === value);

  const handleQuickCreate = () => {
    if (!quickCreateData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Customer name is required",
        variant: "destructive",
      });
      return;
    }

    createCustomerMutation.mutate({
      name: quickCreateData.name.trim(),
      email: quickCreateData.email.trim() || null,
      phone: quickCreateData.phone.trim() || null,
      address: quickCreateData.address.trim() || null,
      city: quickCreateData.city.trim() || null,
      postalCode: quickCreateData.postalCode.trim() || null,
      vatNumber: quickCreateData.vatNumber.trim() || null,
      companyId: 2, // Fixed company ID
    });
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
            {selectedCustomer ? selectedCustomer.name : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search customers..." />
            <CommandList>
              <CommandEmpty className="p-2">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    No customers found.
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
                    Create New Customer
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
                  Create New Customer
                </CommandItem>
                {customers.map((customer: Customer) => (
                  <CommandItem
                    key={customer.id}
                    onSelect={() => {
                      onValueChange(customer.id);
                      if (onCustomerSelect) {
                        onCustomerSelect(customer);
                      }
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === customer.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{customer.name}</div>
                      {customer.email && (
                        <div className="text-sm text-muted-foreground">
                          {customer.email}
                        </div>
                      )}
                      {customer.phone && (
                        <div className="text-sm text-muted-foreground">
                          {customer.phone}
                        </div>
                      )}
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
            <DialogTitle>Create New Customer</DialogTitle>
            <DialogDescription>
              Add a new customer to your database.
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
                placeholder="Customer name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={quickCreateData.email}
                  onChange={(e) =>
                    setQuickCreateData(prev => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="customer@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={quickCreateData.phone}
                  onChange={(e) =>
                    setQuickCreateData(prev => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="+27 11 123 4567"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={quickCreateData.address}
                onChange={(e) =>
                  setQuickCreateData(prev => ({ ...prev, address: e.target.value }))
                }
                placeholder="Street address"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={quickCreateData.city}
                  onChange={(e) =>
                    setQuickCreateData(prev => ({ ...prev, city: e.target.value }))
                  }
                  placeholder="Johannesburg"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={quickCreateData.postalCode}
                  onChange={(e) =>
                    setQuickCreateData(prev => ({ ...prev, postalCode: e.target.value }))
                  }
                  placeholder="2000"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vatNumber">VAT Number</Label>
              <Input
                id="vatNumber"
                value={quickCreateData.vatNumber}
                onChange={(e) =>
                  setQuickCreateData(prev => ({ ...prev, vatNumber: e.target.value }))
                }
                placeholder="4123456789"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleQuickCreate}
              disabled={createCustomerMutation.isPending}
            >
              {createCustomerMutation.isPending ? "Creating..." : "Create Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
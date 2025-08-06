import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AddSupplierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSupplierAdded?: (supplier: any) => void;
}

export default function AddSupplierModal({ open, onOpenChange, onSupplierAdded }: AddSupplierModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    vatNumber: "",
    paymentTerms: "30",
    notes: "",
  });

  const createSupplierMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          companyId: (user as any)?.companyId,
          paymentTerms: parseInt(data.paymentTerms),
        }),
      });
      if (!response.ok) throw new Error('Failed to create supplier');
      return response.json();
    },
    onSuccess: (supplier) => {
      toast({
        title: "Success",
        description: "Supplier created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      onSupplierAdded?.(supplier);
      onOpenChange(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        vatNumber: "",
        paymentTerms: "30",
        notes: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create supplier",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Supplier name is required",
        variant: "destructive",
      });
      return;
    }
    createSupplierMutation.mutate(formData);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supplier-name">Supplier Name *</Label>
            <Input
              id="supplier-name"
              value={formData.name}
              onChange={(e) => updateFormData("name", e.target.value)}
              placeholder="Enter supplier name"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier-email">Email</Label>
              <Input
                id="supplier-email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                placeholder="supplier@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-phone">Phone</Label>
              <Input
                id="supplier-phone"
                value={formData.phone}
                onChange={(e) => updateFormData("phone", e.target.value)}
                placeholder="+27 XX XXX XXXX"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier-address">Address</Label>
            <Input
              id="supplier-address"
              value={formData.address}
              onChange={(e) => updateFormData("address", e.target.value)}
              placeholder="Street address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier-city">City</Label>
              <Input
                id="supplier-city"
                value={formData.city}
                onChange={(e) => updateFormData("city", e.target.value)}
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-postal">Postal Code</Label>
              <Input
                id="supplier-postal"
                value={formData.postalCode}
                onChange={(e) => updateFormData("postalCode", e.target.value)}
                placeholder="0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier-vat">VAT Number</Label>
              <Input
                id="supplier-vat"
                value={formData.vatNumber}
                onChange={(e) => updateFormData("vatNumber", e.target.value)}
                placeholder="4XXXXXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-terms">Payment Terms (days)</Label>
              <Input
                id="supplier-terms"
                type="number"
                value={formData.paymentTerms}
                onChange={(e) => updateFormData("paymentTerms", e.target.value)}
                placeholder="30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier-notes">Notes</Label>
            <Textarea
              id="supplier-notes"
              value={formData.notes}
              onChange={(e) => updateFormData("notes", e.target.value)}
              placeholder="Additional notes about this supplier"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createSupplierMutation.isPending}
            >
              {createSupplierMutation.isPending ? "Creating..." : "Create Supplier"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
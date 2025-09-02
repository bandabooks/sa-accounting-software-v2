import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Settings, DollarSign, Edit, Package } from "lucide-react";

interface ServicePackage {
  id: number;
  packageType: string;
  displayName: string;
  description: string;
  monthlyPrice: string;
  annualPrice?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const packageUpdateSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  description: z.string().optional(),
  monthlyPrice: z.number().min(0, "Monthly price must be positive"),
  annualPrice: z.number().optional(),
  isActive: z.boolean().default(true),
});

type PackageUpdateForm = z.infer<typeof packageUpdateSchema>;

export default function ServicePackageAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: packages, isLoading } = useQuery<ServicePackage[]>({
    queryKey: ["/api/admin/service-packages/pricing"],
  });

  const form = useForm<PackageUpdateForm>({
    resolver: zodResolver(packageUpdateSchema),
    defaultValues: {
      displayName: "",
      description: "",
      monthlyPrice: 0,
      annualPrice: undefined,
      isActive: true,
    },
  });

  const updatePackageMutation = useMutation({
    mutationFn: (data: { packageType: string } & PackageUpdateForm) =>
      apiRequest(`/api/admin/service-packages/${data.packageType}/pricing`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-packages/pricing"] });
      setIsEditDialogOpen(false);
      setEditingPackage(null);
      toast({
        title: "Package Updated",
        description: "Service package pricing has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update service package",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (pkg: ServicePackage) => {
    setEditingPackage(pkg);
    form.reset({
      displayName: pkg.displayName,
      description: pkg.description || "",
      monthlyPrice: parseFloat(pkg.monthlyPrice),
      annualPrice: pkg.annualPrice ? parseFloat(pkg.annualPrice) : undefined,
      isActive: pkg.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const onSubmit = (data: PackageUpdateForm) => {
    if (!editingPackage) return;
    
    updatePackageMutation.mutate({
      packageType: editingPackage.packageType,
      ...data,
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(parseFloat(amount));
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Package className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Package Management</h1>
          <p className="text-gray-600">Manage pricing and settings for all service packages</p>
        </div>
      </div>

      {/* Package Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {packages?.map((pkg) => (
          <Card key={pkg.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{pkg.displayName}</CardTitle>
                <Switch checked={pkg.isActive} disabled />
              </div>
              <CardDescription className="text-sm">
                {pkg.description || "No description"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Monthly</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(pkg.monthlyPrice)}
                  </span>
                </div>
                {pkg.annualPrice && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Annual</span>
                    <span className="text-lg font-semibold text-green-500">
                      {formatCurrency(pkg.annualPrice)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(pkg)}
                  className="w-full"
                  data-testid={`edit-package-${pkg.packageType}`}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Pricing
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Service Package</DialogTitle>
            <DialogDescription>
              Update pricing and settings for {editingPackage?.displayName}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-display-name" />
                    </FormControl>
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
                      <Textarea {...field} rows={2} data-testid="input-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monthlyPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Price (ZAR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-monthly-price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="annualPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Price (ZAR) - Optional</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        data-testid="input-annual-price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Active Package</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updatePackageMutation.isPending}
                  className="flex-1"
                  data-testid="button-save-package"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  {updatePackageMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
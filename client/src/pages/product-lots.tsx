import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, Edit2, Trash2, Search, Calendar, AlertTriangle, CheckCircle } from "lucide-react";

const lotFormSchema = z.object({
  productId: z.number().min(1, "Product is required"),
  lotNumber: z.string().min(1, "Lot number is required"),
  quantity: z.number().min(1, "Quantity must be greater than 0"),
  manufactureDate: z.string().min(1, "Manufacture date is required"),
  expiryDate: z.string().optional(),
  supplierBatch: z.string().optional(),
  notes: z.string().optional(),
});

type LotFormData = z.infer<typeof lotFormSchema>;

export default function ProductLots() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedLot, setSelectedLot] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<LotFormData>({
    resolver: zodResolver(lotFormSchema),
    defaultValues: {
      lotNumber: "",
      quantity: 1,
      manufactureDate: "",
      expiryDate: "",
      supplierBatch: "",
      notes: "",
    },
  });

  // Queries
  const { data: lots, isLoading } = useQuery({
    queryKey: ['/api/inventory/lots'],
  });

  const { data: products } = useQuery({
    queryKey: ['/api/products'],
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: LotFormData) => {
      return await apiRequest('/api/inventory/lots', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/lots'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Product lot created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create product lot",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: LotFormData & { id: number }) => {
      return await apiRequest(`/api/inventory/lots/${id}`, 'PUT', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/lots'] });
      setIsEditDialogOpen(false);
      setSelectedLot(null);
      form.reset();
      toast({
        title: "Success",
        description: "Product lot updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product lot",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/inventory/lots/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/lots'] });
      toast({
        title: "Success",
        description: "Product lot deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product lot",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LotFormData) => {
    if (selectedLot) {
      updateMutation.mutate({ ...data, id: selectedLot.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (lot: any) => {
    setSelectedLot(lot);
    form.reset({
      productId: lot.productId,
      lotNumber: lot.lotNumber,
      quantity: lot.quantity,
      manufactureDate: lot.manufactureDate?.split('T')[0] || '',
      expiryDate: lot.expiryDate?.split('T')[0] || '',
      supplierBatch: lot.supplierBatch || '',
      notes: lot.notes || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product lot?")) {
      deleteMutation.mutate(id);
    }
  };

  const isExpired = (expiryDate: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow && expiry >= new Date();
  };

  const getStatusBadge = (lot: any) => {
    if (isExpired(lot.expiryDate)) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (isExpiringSoon(lot.expiryDate)) {
      return <Badge variant="secondary">Expiring Soon</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  };

  const filteredLots = (lots || []).filter((lot: any) => {
    const matchesSearch = lot.lotNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lot.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lot.supplierBatch?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && !isExpired(lot.expiryDate)) ||
                         (filterStatus === "expired" && isExpired(lot.expiryDate)) ||
                         (filterStatus === "expiring" && isExpiringSoon(lot.expiryDate));
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Lots</h1>
          <p className="text-muted-foreground">
            Track product lots, batches, and expiry dates for complete traceability
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Product Lot
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Product Lot</DialogTitle>
              <DialogDescription>
                Add a new product lot with batch tracking and expiry information.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="productId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product *</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(products || []).map((product: any) => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name}
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
                    name="lotNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lot Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="LOT-2024-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="100"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="manufactureDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manufacture Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="supplierBatch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Batch</FormLabel>
                      <FormControl>
                        <Input placeholder="Supplier batch reference" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional notes about this lot"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create Lot"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by lot number, product, or supplier batch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Lots</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Product Lots Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredLots.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No product lots found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm || filterStatus !== "all" 
                  ? "No lots match your current filters."
                  : "Get started by creating your first product lot."
                }
              </p>
              {!searchTerm && filterStatus === "all" && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Lot
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLots.map((lot: any) => (
            <Card key={lot.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{lot.lotNumber}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {lot.product?.name || 'Unknown Product'}
                    </p>
                  </div>
                  {getStatusBadge(lot)}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Quantity:</span>
                    <span className="text-sm font-medium">{lot.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Manufactured:</span>
                    <span className="text-sm font-medium">
                      {lot.manufactureDate ? new Date(lot.manufactureDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  {lot.expiryDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Expires:</span>
                      <span className={`text-sm font-medium ${isExpired(lot.expiryDate) ? 'text-red-600' : isExpiringSoon(lot.expiryDate) ? 'text-orange-600' : ''}`}>
                        {new Date(lot.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {lot.supplierBatch && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Supplier Batch:</span>
                      <span className="text-sm font-medium">{lot.supplierBatch}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(lot)}
                    className="flex-1"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(lot.id)}
                    className="flex-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLoadingStates } from "@/hooks/useLoadingStates";
import { PageLoader } from "@/components/ui/global-loader";
import { ClipboardList, Calendar, User, AlertTriangle, CheckCircle, Search, Plus, Edit2, Trash2, Play, Square, FileText, MapPin } from "lucide-react";

// Form schema for stock count creation
const stockCountFormSchema = z.object({
  countNumber: z.string().min(1, "Count number is required"),
  warehouseId: z.number().min(1, "Warehouse is required"),
  countType: z.enum(['full', 'partial', 'cycle']).default('full'),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  notes: z.string().optional(),
  status: z.enum(['planned', 'in_progress', 'completed', 'cancelled']).default('planned'),
});

type StockCountFormData = z.infer<typeof stockCountFormSchema>;

export default function StockCounts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCount, setSelectedCount] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<StockCountFormData>({
    resolver: zodResolver(stockCountFormSchema),
    defaultValues: {
      countNumber: "",
      countType: "full",
      scheduledDate: "",
      notes: "",
      status: "planned",
    },
  });

  // Queries
  const { data: stockCounts, isLoading } = useQuery({
    queryKey: ['/api/inventory/stock-counts'],
  });

  const { data: warehouses } = useQuery({
    queryKey: ['/api/warehouses'],
  });

  const { data: countItems } = useQuery({
    queryKey: ['/api/inventory/stock-count-items', selectedCount?.id],
    enabled: !!selectedCount?.id,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: StockCountFormData) => {
      return await apiRequest('/api/inventory/stock-counts', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/stock-counts'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Stock count created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create stock count",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: StockCountFormData & { id: number }) => {
      return await apiRequest(`/api/inventory/stock-counts/${id}`, 'PUT', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/stock-counts'] });
      setIsEditDialogOpen(false);
      setSelectedCount(null);
      form.reset();
      toast({
        title: "Success",
        description: "Stock count updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update stock count",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/inventory/stock-counts/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/stock-counts'] });
      toast({
        title: "Success",
        description: "Stock count deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete stock count",
        variant: "destructive",
      });
    },
  });

  const startCountMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/inventory/stock-counts/${id}/start`, 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/stock-counts'] });
      toast({
        title: "Success",
        description: "Stock count started successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start stock count",
        variant: "destructive",
      });
    },
  });

  const completeCountMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/inventory/stock-counts/${id}/complete`, 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/stock-counts'] });
      toast({
        title: "Success",
        description: "Stock count completed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete stock count",
        variant: "destructive",
      });
    },
  });

  // Use loading states for comprehensive loading feedback including mutations
  useLoadingStates({
    loadingStates: [
      { isLoading, message: 'Loading stock counts...' },
      { isLoading: createMutation.isPending, message: 'Creating stock count...' },
      { isLoading: updateMutation.isPending, message: 'Updating stock count...' },
      { isLoading: deleteMutation.isPending, message: 'Deleting stock count...' },
      { isLoading: startCountMutation.isPending, message: 'Starting stock count...' },
      { isLoading: completeCountMutation.isPending, message: 'Completing stock count...' },
    ],
    progressSteps: ['Fetching stock counts', 'Loading warehouse data', 'Processing inventory data'],
  });

  if (isLoading) {
    return <PageLoader message="Loading stock counts..." />;
  }

  const onSubmit = (data: StockCountFormData) => {
    if (selectedCount) {
      updateMutation.mutate({ ...data, id: selectedCount.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (count: any) => {
    setSelectedCount(count);
    form.reset({
      countNumber: count.countNumber,
      warehouseId: count.warehouseId,
      countType: count.countType,
      scheduledDate: count.scheduledDate?.split('T')[0] || "",
      notes: count.notes || "",
      status: count.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this stock count?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleStart = (id: number) => {
    if (confirm("Are you sure you want to start this stock count?")) {
      startCountMutation.mutate(id);
    }
  };

  const handleComplete = (id: number) => {
    if (confirm("Are you sure you want to complete this stock count?")) {
      completeCountMutation.mutate(id);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'in_progress':
        return <Play className="w-4 h-4 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <Square className="w-4 h-4 text-red-500" />;
      default:
        return <ClipboardList className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cycle':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const filteredStockCounts = (stockCounts || []).filter((count: any) => {
    const matchesSearch = count.countNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         count.warehouse?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || count.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Counts</h1>
          <p className="text-muted-foreground">
            Plan and execute physical inventory counts for accurate stock tracking
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Stock Count
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Schedule New Stock Count</DialogTitle>
              <DialogDescription>
                Create a new stock count to verify physical inventory levels.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="countNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Count Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="SC-2025-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="warehouseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warehouse *</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select warehouse" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(warehouses || []).map((warehouse: any) => (
                              <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                {warehouse.name}
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
                    name="countType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Count Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="full">Full Count</SelectItem>
                            <SelectItem value="partial">Partial Count</SelectItem>
                            <SelectItem value="cycle">Cycle Count</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="scheduledDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scheduled Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
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
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="planned">Planned</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional notes about this stock count"
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
                    {createMutation.isPending ? "Creating..." : "Schedule Count"}
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
                placeholder="Search by count number or warehouse..."
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
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stock Counts Grid */}
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
      ) : filteredStockCounts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <ClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No stock counts found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm || filterStatus !== "all" 
                  ? "No stock counts match your current filters."
                  : "Get started by scheduling your first stock count."
                }
              </p>
              {!searchTerm && filterStatus === "all" && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule First Count
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStockCounts.map((count: any) => (
            <Card key={count.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{count.countNumber}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(count.countType)}`}>
                        {count.countType.charAt(0).toUpperCase() + count.countType.slice(1)} Count
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(count.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(count.status)}`}>
                      {count.status.replace('_', ' ').charAt(0).toUpperCase() + count.status.replace('_', ' ').slice(1)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{count.warehouse?.name || 'Unknown Warehouse'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      Scheduled: {count.scheduledDate ? new Date(count.scheduledDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  {count.completedAt && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        Completed: {new Date(count.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {count.status === 'planned' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStart(count.id)}
                      className="flex-1"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Start
                    </Button>
                  )}
                  {count.status === 'in_progress' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleComplete(count.id)}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(count)}
                    className="flex-1"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  {count.status !== 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(count.id)}
                      className="flex-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog - Same structure as create dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Stock Count</DialogTitle>
            <DialogDescription>
              Update stock count information and scheduling details.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="countNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Count Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="SC-2025-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="warehouseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warehouse *</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select warehouse" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(warehouses || []).map((warehouse: any) => (
                            <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                              {warehouse.name}
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
                  name="countType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Count Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="full">Full Count</SelectItem>
                          <SelectItem value="partial">Partial Count</SelectItem>
                          <SelectItem value="cycle">Cycle Count</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scheduled Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
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
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional notes about this stock count"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedCount(null);
                  form.reset();
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update Count"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
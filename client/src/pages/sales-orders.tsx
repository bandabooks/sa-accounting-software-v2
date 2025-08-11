import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, FileText, Truck, CheckCircle, ShoppingCart, TrendingUp, Users, DollarSign, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { SalesOrder } from "@shared/schema";
import { useLoadingStates } from "@/hooks/useLoadingStates";
import { PageLoader } from "@/components/ui/global-loader";

export default function SalesOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: salesOrders = [], isLoading } = useQuery<SalesOrder[]>({
    queryKey: ["/api/sales-orders"],
  });

  const { data: salesOrderStats = {}, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/sales-orders/stats"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/sales-orders/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales-orders/stats"] });
      toast({
        title: "Success",
        description: "Sales order deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete sales order",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest(`/api/sales-orders/${id}/status`, "PUT", { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales-orders/stats"] });
      toast({
        title: "Success",
        description: "Sales order status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update sales order status",
        variant: "destructive",
      });
    },
  });

  const convertToInvoiceMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/sales-orders/${id}/convert-to-invoice`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Success",
        description: "Sales order converted to invoice successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to convert sales order to invoice",
        variant: "destructive",
      });
    },
  });

  const filteredSalesOrders = salesOrders.filter((order: SalesOrder) => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusColors = {
      draft: "bg-gray-100 text-gray-800",
      confirmed: "bg-blue-100 text-blue-800",
      shipped: "bg-yellow-100 text-yellow-800",
      delivered: "bg-green-100 text-green-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(Number(amount));
  };

  if (isLoading || statsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
          <p className="text-gray-600">Manage your sales orders and track delivery status</p>
        </div>
        <Link href="/sales-orders/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Sales Order
          </Button>
        </Link>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className="cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-blue-300 hover:bg-blue-50"
          onClick={() => setLocation("/sales-orders?status=all")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesOrderStats.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{salesOrderStats.thisMonth || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-green-300 hover:bg-green-50"
          onClick={() => setLocation("/business-reports?report=sales-value")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesOrderStats.totalValue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatCurrency(salesOrderStats.thisMonthValue || 0)} this month
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-amber-300 hover:bg-amber-50"
          onClick={() => setLocation("/sales-orders?status=pending")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesOrderStats.pending || 0}</div>
            <p className="text-xs text-muted-foreground">
              Orders awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-emerald-300 hover:bg-emerald-50"
          onClick={() => setLocation("/deliveries")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesOrderStats.deliveryRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Orders delivered on time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search sales orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sales Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Orders</CardTitle>
          <CardDescription>
            A list of all sales orders with their current status and details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSalesOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No sales orders</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first sales order
              </p>
              <div className="mt-6">
                <Link href="/sales-orders/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Sales Order
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Order Number</th>
                    <th className="text-left p-4 font-medium">Customer</th>
                    <th className="text-left p-4 font-medium">Date</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Total</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalesOrders.map((order: SalesOrder) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <Link href={`/sales-orders/${order.id}`}>
                          <Button variant="link" className="p-0 h-auto font-medium text-blue-600">
                            {order.orderNumber}
                          </Button>
                        </Link>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>Customer #{order.customerId}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusBadge(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-4 font-medium">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/sales-orders/${order.id}`}>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/sales-orders/${order.id}/edit`}>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Order
                              </DropdownMenuItem>
                            </Link>
                            {order.status === 'confirmed' && (
                              <DropdownMenuItem
                                onClick={() => convertToInvoiceMutation.mutate(order.id)}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Convert to Invoice
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'shipped' })}
                              disabled={order.status === 'cancelled' || order.status === 'completed'}
                            >
                              <Truck className="mr-2 h-4 w-4" />
                              Mark as Shipped
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'completed' })}
                              disabled={order.status === 'cancelled' || order.status === 'completed'}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteMutation.mutate(order.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
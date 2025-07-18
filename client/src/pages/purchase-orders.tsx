import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, FileText, Search, Calendar, Package, DollarSign, TrendingUp, ShoppingCart } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils-invoice";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Supplier {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  vatNumber: string | null;
  paymentTerms: number | null;
  category: string | null;
  notes: string | null;
  isActive: boolean | null;
  createdAt: string;
}

interface PurchaseOrderItem {
  id: number;
  purchaseOrderId: number;
  description: string;
  quantity: string;
  unitPrice: string;
  vatRate: string;
  total: string;
  expenseCategory: string | null;
}

interface PurchaseOrder {
  id: number;
  orderNumber: string;
  supplierId: number;
  orderDate: string;
  deliveryDate: string | null;
  status: string;
  subtotal: string;
  vatAmount: string;
  total: string;
  notes: string | null;
  createdAt: string;
  supplier: Supplier;
  items?: PurchaseOrderItem[];
}

const purchaseOrderStatuses = [
  'draft',
  'sent',
  'confirmed',
  'delivered',
  'cancelled'
];

const expenseCategories = [
  'office_supplies',
  'equipment',
  'inventory',
  'services',
  'marketing',
  'travel',
  'utilities',
  'other'
];

export default function PurchaseOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [orderItems, setOrderItems] = useState<Omit<PurchaseOrderItem, 'id' | 'purchaseOrderId'>[]>([{
    description: '',
    quantity: '1',
    unitPrice: '0',
    vatRate: '15',
    total: '0',
    expenseCategory: null,
  }]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['/api/purchase-orders'],
    queryFn: async () => {
      const response = await fetch('/api/purchase-orders');
      if (!response.ok) throw new Error('Failed to fetch purchase orders');
      return response.json() as Promise<PurchaseOrder[]>;
    },
  });

  const { data: suppliers } = useQuery({
    queryKey: ['/api/suppliers'],
    queryFn: async () => {
      const response = await fetch('/api/suppliers');
      if (!response.ok) throw new Error('Failed to fetch suppliers');
      return response.json() as Promise<Supplier[]>;
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/purchase-orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
      setIsCreateModalOpen(false);
      setOrderItems([{
        description: '',
        quantity: '1',
        unitPrice: '0',
        vatRate: '15',
        total: '0',
        expenseCategory: null,
      }]);
      toast({
        title: "Success",
        description: "Purchase order created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create purchase order.",
        variant: "destructive",
      });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest('PUT', `/api/purchase-orders/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
      setEditingOrder(null);
      toast({
        title: "Success",
        description: "Purchase order updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update purchase order.",
        variant: "destructive",
      });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/purchase-orders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
      toast({
        title: "Success",
        description: "Purchase order deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete purchase order.",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      apiRequest('PUT', `/api/purchase-orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
      toast({
        title: "Success",
        description: "Purchase order status updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update purchase order status.",
        variant: "destructive",
      });
    },
  });

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  const calculateItemTotal = (quantity: string, unitPrice: string, vatRate: string) => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    const vat = parseFloat(vatRate) || 0;
    const subtotal = qty * price;
    const vatAmount = subtotal * (vat / 100);
    return (subtotal + vatAmount).toFixed(2);
  };

  const updateItemTotal = (index: number, field: 'quantity' | 'unitPrice' | 'vatRate', value: string) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    newItems[index].total = calculateItemTotal(newItems[index].quantity, newItems[index].unitPrice, newItems[index].vatRate);
    setOrderItems(newItems);
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, {
      description: '',
      quantity: '1',
      unitPrice: '0',
      vatRate: '15',
      total: '0',
      expenseCategory: null,
    }]);
  };

  const removeOrderItem = (index: number) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  const calculateOrderTotals = () => {
    const subtotal = orderItems.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      return sum + (qty * price);
    }, 0);

    const vatAmount = orderItems.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      const vat = parseFloat(item.vatRate) || 0;
      const itemSubtotal = qty * price;
      return sum + (itemSubtotal * (vat / 100));
    }, 0);

    const total = subtotal + vatAmount;

    return { subtotal, vatAmount, total };
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const { subtotal, vatAmount, total } = calculateOrderTotals();
    
    const data = {
      orderNumber: formData.get('orderNumber') as string,
      supplierId: parseInt(formData.get('supplierId') as string),
      orderDate: formData.get('orderDate') as string,
      deliveryDate: formData.get('deliveryDate') as string || null,
      status: formData.get('status') as string,
      subtotal: subtotal.toFixed(2),
      vatAmount: vatAmount.toFixed(2),
      total: total.toFixed(2),
      notes: formData.get('notes') as string,
      items: orderItems,
    };

    if (editingOrder) {
      updateOrderMutation.mutate({ id: editingOrder.id, data });
    } else {
      createOrderMutation.mutate(data);
    }
  };

  const formatStatusName = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatCategoryName = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalOrderValue = filteredOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
  const pendingOrders = filteredOrders.filter(order => ['draft', 'sent', 'confirmed'].includes(order.status));
  const deliveredOrders = filteredOrders.filter(order => order.status === 'delivered');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-600 mt-1">Manage your purchase orders and supplier relationships</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Purchase Order</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orderNumber">Order Number</Label>
                  <Input
                    id="orderNumber"
                    name="orderNumber"
                    placeholder="PO-2024-001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="supplierId">Supplier</Label>
                  <Select name="supplierId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers?.filter(s => s.isActive).map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="orderDate">Order Date</Label>
                  <Input
                    id="orderDate"
                    name="orderDate"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryDate">Delivery Date</Label>
                  <Input
                    id="deliveryDate"
                    name="deliveryDate"
                    type="date"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue="draft">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {purchaseOrderStatuses.map(status => (
                        <SelectItem key={status} value={status}>
                          {formatStatusName(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-medium">Order Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addOrderItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
                <div className="space-y-4">
                  {orderItems.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Item {index + 1}</Label>
                        {orderItems.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOrderItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`description-${index}`}>Description</Label>
                          <Input
                            id={`description-${index}`}
                            value={item.description}
                            onChange={(e) => {
                              const newItems = [...orderItems];
                              newItems[index] = { ...newItems[index], description: e.target.value };
                              setOrderItems(newItems);
                            }}
                            placeholder="Item description"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`expenseCategory-${index}`}>Category</Label>
                          <Select
                            value={item.expenseCategory || ''}
                            onValueChange={(value) => {
                              const newItems = [...orderItems];
                              newItems[index] = { ...newItems[index], expenseCategory: value };
                              setOrderItems(newItems);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {expenseCategories.map(category => (
                                <SelectItem key={category} value={category}>
                                  {formatCategoryName(category)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                          <Input
                            id={`quantity-${index}`}
                            type="number"
                            min="1"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => updateItemTotal(index, 'quantity', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`unitPrice-${index}`}>Unit Price</Label>
                          <Input
                            id={`unitPrice-${index}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItemTotal(index, 'unitPrice', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`vatRate-${index}`}>VAT Rate (%)</Label>
                          <Input
                            id={`vatRate-${index}`}
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.vatRate}
                            onChange={(e) => updateItemTotal(index, 'vatRate', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`total-${index}`}>Total</Label>
                          <Input
                            id={`total-${index}`}
                            value={formatCurrency(item.total)}
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(calculateOrderTotals().subtotal.toFixed(2))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT:</span>
                    <span>{formatCurrency(calculateOrderTotals().vatAmount.toFixed(2))}</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(calculateOrderTotals().total.toFixed(2))}</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Additional notes for this order"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createOrderMutation.isPending}>
                  {createOrderMutation.isPending ? "Creating..." : "Create Order"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              All purchase orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{pendingOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting delivery
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{deliveredOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalOrderValue.toFixed(2))}</div>
            <p className="text-xs text-muted-foreground">
              All orders combined
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {purchaseOrderStatuses.map(status => (
              <SelectItem key={status} value={status}>
                {formatStatusName(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No purchase orders found.</p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4"
              >
                Create Your First Order
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Order #</th>
                    <th className="text-left py-3 px-4">Supplier</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Total</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">
                          {order.deliveryDate && `Delivery: ${formatDate(order.deliveryDate)}`}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{order.supplier.name}</div>
                        <div className="text-sm text-gray-500">{order.supplier.email}</div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(order.orderDate)}
                      </td>
                      <td className="py-3 px-4">
                        <Select
                          value={order.status}
                          onValueChange={(newStatus) => 
                            updateStatusMutation.mutate({ id: order.id, status: newStatus })
                          }
                        >
                          <SelectTrigger className="w-auto">
                            <SelectValue>
                              <Badge className={getStatusColor(order.status)}>
                                {formatStatusName(order.status)}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {purchaseOrderStatuses.map(status => (
                              <SelectItem key={status} value={status}>
                                {formatStatusName(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingOrder(order)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteOrderMutation.mutate(order.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  RotateCcw, Plus, Search, Receipt, DollarSign, 
  AlertTriangle, CheckCircle, Clock, CreditCard, Trash2
} from "lucide-react";

interface RefundRequest {
  id: number;
  originalSaleId: number;
  originalReceiptNumber: string;
  refundAmount: number;
  refundReason: string;
  refundMethod: 'cash' | 'card' | 'store_credit' | 'original_payment';
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  requestedBy: string;
  approvedBy?: string;
  refundDate?: string;
  items: RefundItem[];
  customerName?: string;
  originalAmount: number;
  createdAt: string;
}

interface RefundItem {
  id: number;
  productId: number;
  productName: string;
  originalQuantity: number;
  refundQuantity: number;
  unitPrice: number;
  refundAmount: number;
  reason: string;
}

export default function POSRefundsPage() {
  const [showCreateRefundModal, setShowCreateRefundModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refundItems, setRefundItems] = useState<RefundItem[]>([]);
  const [refundData, setRefundData] = useState({
    reason: '',
    method: 'original_payment' as const,
    partialRefund: false
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch refunds and sales data
  const { data: refunds = [] } = useQuery<RefundRequest[]>({
    queryKey: ['/api/pos/refunds'],
  });

  const { data: sales = [] } = useQuery<any[]>({
    queryKey: ['/api/pos/sales'],
  });

  // Search for sale by receipt number
  const { data: saleSearch, refetch: searchSale } = useQuery({
    queryKey: ['/api/pos/sales/search', searchTerm],
    enabled: false,
  });

  // Create refund mutation
  const createRefundMutation = useMutation({
    mutationFn: async (refundRequestData: any) => {
      return await apiRequest('/api/pos/refunds', 'POST', refundRequestData);
    },
    onSuccess: () => {
      toast({
        title: "Refund Request Created",
        description: "Refund request has been submitted for approval",
      });
      setShowCreateRefundModal(false);
      resetRefundForm();
      queryClient.invalidateQueries({ queryKey: ['/api/pos/refunds'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create refund request",
        variant: "destructive",
      });
    },
  });

  // Approve/Process refund mutation
  const processRefundMutation = useMutation({
    mutationFn: async ({ id, action, data }: { id: number; action: 'approve' | 'reject' | 'complete'; data?: any }) => {
      return await apiRequest(`/api/pos/refunds/${id}/${action}`, 'PUT', data);
    },
    onSuccess: (_, variables) => {
      toast({
        title: `Refund ${variables.action === 'approve' ? 'Approved' : variables.action === 'reject' ? 'Rejected' : 'Completed'}`,
        description: `Refund has been ${variables.action}d successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pos/refunds'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process refund",
        variant: "destructive",
      });
    },
  });

  const resetRefundForm = () => {
    setSelectedSale(null);
    setRefundItems([]);
    setRefundData({
      reason: '',
      method: 'original_payment',
      partialRefund: false
    });
    setSearchTerm('');
  };

  const handleSaleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    const sale = sales.find(s => 
      s.receiptNumber?.includes(searchTerm) || 
      s.id.toString() === searchTerm
    );
    
    if (sale) {
      setSelectedSale(sale);
      // Initialize refund items with all sale items
      const items = sale.items?.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName || `Product ${item.productId}`,
        originalQuantity: item.quantity,
        refundQuantity: 0,
        unitPrice: item.unitPrice,
        refundAmount: 0,
        reason: ''
      })) || [];
      setRefundItems(items);
    } else {
      toast({
        title: "Sale Not Found",
        description: `No sale found with receipt number: ${searchTerm}`,
        variant: "destructive",
      });
    }
  };

  const updateRefundItem = (index: number, field: string, value: any) => {
    setRefundItems(items => 
      items.map((item, i) => {
        if (i === index) {
          const updated = { ...item, [field]: value };
          if (field === 'refundQuantity') {
            updated.refundAmount = value * item.unitPrice;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleCreateRefund = () => {
    if (!selectedSale) return;

    const validItems = refundItems.filter(item => item.refundQuantity > 0);
    if (validItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one item to refund",
        variant: "destructive",
      });
      return;
    }

    const totalRefundAmount = validItems.reduce((sum, item) => sum + item.refundAmount, 0);

    const refundRequest = {
      originalSaleId: selectedSale.id,
      originalReceiptNumber: selectedSale.receiptNumber || `SALE-${selectedSale.id}`,
      refundAmount: totalRefundAmount,
      refundReason: refundData.reason,
      refundMethod: refundData.method,
      items: validItems,
      originalAmount: selectedSale.totalAmount
    };

    createRefundMutation.mutate(refundRequest);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const pendingRefunds = refunds.filter(r => r.status === 'pending');
  const completedRefunds = refunds.filter(r => r.status === 'completed');
  const totalRefundAmount = completedRefunds.reduce((sum, r) => sum + r.refundAmount, 0);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Returns & Refunds</h1>
          <p className="text-gray-600 mt-1">Process returns and manage refund requests</p>
        </div>
        <Dialog open={showCreateRefundModal} onOpenChange={setShowCreateRefundModal}>
          <DialogTrigger asChild>
            <Button onClick={resetRefundForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Refund
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create Refund Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Sale Search */}
              {!selectedSale && (
                <div className="space-y-4">
                  <div>
                    <Label>Search for Original Sale</Label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Enter receipt number or sale ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSaleSearch()}
                      />
                      <Button onClick={handleSaleSearch}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sale Details */}
              {selectedSale && (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h3 className="font-semibold mb-2">Original Sale Details</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Receipt:</span> {selectedSale.receiptNumber || `SALE-${selectedSale.id}`}
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span> {new Date(selectedSale.saleDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="text-gray-600">Total:</span> R {selectedSale.totalAmount?.toFixed(2)}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2" 
                    onClick={() => setSelectedSale(null)}
                  >
                    Change Sale
                  </Button>
                </div>
              )}

              {/* Refund Items */}
              {selectedSale && refundItems.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Select Items to Refund</h3>
                  <div className="border rounded-lg">
                    <div className="bg-gray-50 px-4 py-2 grid grid-cols-6 gap-4 text-sm font-medium">
                      <div>Product</div>
                      <div>Original Qty</div>
                      <div>Refund Qty</div>
                      <div>Unit Price</div>
                      <div>Refund Amount</div>
                      <div>Reason</div>
                    </div>
                    {refundItems.map((item, index) => (
                      <div key={item.id} className="px-4 py-3 grid grid-cols-6 gap-4 border-t">
                        <div className="font-medium">{item.productName}</div>
                        <div>{item.originalQuantity}</div>
                        <div>
                          <Input
                            type="number"
                            min="0"
                            max={item.originalQuantity}
                            value={item.refundQuantity}
                            onChange={(e) => updateRefundItem(index, 'refundQuantity', parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                        </div>
                        <div>R {item.unitPrice.toFixed(2)}</div>
                        <div className="font-medium">R {item.refundAmount.toFixed(2)}</div>
                        <div>
                          <Select
                            value={item.reason}
                            onValueChange={(value) => updateRefundItem(index, 'reason', value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="defective">Defective</SelectItem>
                              <SelectItem value="wrong_item">Wrong Item</SelectItem>
                              <SelectItem value="customer_request">Customer Request</SelectItem>
                              <SelectItem value="damaged">Damaged</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Refund Amount:</span>
                      <span className="text-lg font-bold">
                        R {refundItems.reduce((sum, item) => sum + item.refundAmount, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Refund Details */}
              {selectedSale && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reason">Refund Reason</Label>
                    <Textarea
                      id="reason"
                      value={refundData.reason}
                      onChange={(e) => setRefundData(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Please provide a detailed reason for the refund..."
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="method">Refund Method</Label>
                    <Select
                      value={refundData.method}
                      onValueChange={(value: any) => setRefundData(prev => ({ ...prev, method: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="original_payment">Original Payment Method</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="store_credit">Store Credit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateRefundModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateRefund}
                      disabled={createRefundMutation.isPending || !selectedSale}
                    >
                      {createRefundMutation.isPending ? 'Creating...' : 'Create Refund Request'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Refunds</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRefunds.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{refunds.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refund Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R {totalRefundAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refund Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3%</div>
            <p className="text-xs text-muted-foreground">Of total sales</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Refunds */}
      {pendingRefunds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-yellow-500" />
              Pending Approval ({pendingRefunds.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRefunds.map((refund) => (
                <div key={refund.id} className="border rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center space-x-2">
                          <Receipt className="h-4 w-4" />
                          <span className="font-medium">{refund.originalReceiptNumber}</span>
                        </div>
                        <Badge className={getStatusColor(refund.status)}>
                          {refund.status.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(refund.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Customer:</span> {refund.customerName || 'Walk-in'}
                        </div>
                        <div>
                          <span className="text-gray-600">Original Amount:</span> R {refund.originalAmount.toFixed(2)}
                        </div>
                        <div>
                          <span className="text-gray-600">Refund Amount:</span> R {refund.refundAmount.toFixed(2)}
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-gray-600">Reason:</span> {refund.refundReason}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm"
                        onClick={() => processRefundMutation.mutate({ 
                          id: refund.id, 
                          action: 'approve' 
                        })}
                      >
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => processRefundMutation.mutate({ 
                          id: refund.id, 
                          action: 'reject' 
                        })}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Refunds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RotateCcw className="h-5 w-5 mr-2" />
            Refund History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {refunds.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <RotateCcw className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No refunds processed yet</p>
              <p className="text-sm">Refund requests will appear here as they are created</p>
            </div>
          ) : (
            <div className="space-y-4">
              {refunds.map((refund) => (
                <div key={refund.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(refund.status)}
                          <span className="font-medium">{refund.originalReceiptNumber}</span>
                        </div>
                        <Badge className={getStatusColor(refund.status)}>
                          {refund.status.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(refund.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Customer:</span> {refund.customerName || 'Walk-in'}
                        </div>
                        <div>
                          <span className="text-gray-600">Method:</span> {refund.refundMethod.replace('_', ' ')}
                        </div>
                        <div>
                          <span className="text-gray-600">Original:</span> R {refund.originalAmount.toFixed(2)}
                        </div>
                        <div>
                          <span className="text-gray-600">Refunded:</span> R {refund.refundAmount.toFixed(2)}
                        </div>
                      </div>
                      {refund.items && refund.items.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                          Items: {refund.items.map(item => `${item.productName} (${item.refundQuantity})`).join(', ')}
                        </div>
                      )}
                    </div>
                    {refund.status === 'approved' && (
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => processRefundMutation.mutate({ 
                          id: refund.id, 
                          action: 'complete' 
                        })}
                      >
                        Complete Refund
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
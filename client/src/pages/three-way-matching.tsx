import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Eye, 
  FileText, 
  Package, 
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface ThreeWayMatch {
  id: number;
  purchaseOrderId: number;
  goodsReceiptId: number | null;
  supplierInvoiceId: number | null;
  status: string; // 'pending', 'partial_match', 'full_match', 'discrepancy'
  totalVariance: string;
  quantityVariance: string;
  priceVariance: string;
  createdAt: string;
  purchaseOrder: {
    orderNumber: string;
    supplier: { name: string };
    total: string;
    orderDate: string;
  };
  goodsReceipt?: {
    receiptNumber: string;
    receivedDate: string;
    receivedBy: string;
  };
  supplierInvoice?: {
    invoiceNumber: string;
    invoiceDate: string;
    total: string;
  };
  lineItems: Array<{
    id: number;
    description: string;
    orderedQty: string;
    receivedQty: string;
    invoicedQty: string;
    unitPrice: string;
    invoicePrice: string;
    variance: string;
    status: string;
  }>;
}

interface GoodsReceipt {
  id: number;
  receiptNumber: string;
  purchaseOrderId: number;
  receivedDate: string;
  receivedBy: string;
  notes: string;
  status: string;
}

export default function ThreeWayMatching() {
  const [activeTab, setActiveTab] = useState("pending-matches");
  const [selectedMatch, setSelectedMatch] = useState<ThreeWayMatch | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch 3-way matches
  const { data: matches, isLoading: matchesLoading } = useQuery<ThreeWayMatch[]>({
    queryKey: ["/api/three-way-matches"]
  });

  // Fetch pending purchase orders (without goods receipts)
  const { data: pendingPOs, isLoading: pendingPOsLoading } = useQuery({
    queryKey: ["/api/purchase-orders", { status: "confirmed" }]
  });

  // Fetch goods receipts
  const { data: goodsReceipts, isLoading: goodsReceiptsLoading } = useQuery<GoodsReceipt[]>({
    queryKey: ["/api/goods-receipts"]
  });

  // Create goods receipt mutation
  const createGoodsReceiptMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/goods-receipts", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goods-receipts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/three-way-matches"] });
      setIsCreateDialogOpen(false);
      toast({ title: "Success", description: "Goods receipt created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create goods receipt", variant: "destructive" });
    },
  });

  // Process match mutation
  const processMatchMutation = useMutation({
    mutationFn: ({ matchId, action, comments }: { matchId: number; action: string; comments?: string }) =>
      apiRequest(`/api/three-way-matches/${matchId}/process`, "POST", { action, comments }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/three-way-matches"] });
      toast({ title: "Success", description: "Match processed successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to process match", variant: "destructive" });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "full_match": return "bg-green-100 text-green-800";
      case "partial_match": return "bg-yellow-100 text-yellow-800";
      case "discrepancy": return "bg-red-100 text-red-800";
      case "pending": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance === 0) return "text-green-600";
    if (Math.abs(variance) <= 0.05) return "text-yellow-600"; // 5% tolerance
    return "text-red-600";
  };

  const formatCurrency = (amount: string | number) => {
    return `R ${parseFloat(amount.toString()).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">3-Way Matching System</h1>
          <p className="text-muted-foreground">Purchase Order → Goods Receipt → Supplier Invoice Matching</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record Goods Receipt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record Goods Receipt</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              createGoodsReceiptMutation.mutate({
                purchaseOrderId: parseInt(formData.get('purchaseOrderId') as string),
                receivedDate: formData.get('receivedDate'),
                receivedBy: formData.get('receivedBy'),
                notes: formData.get('notes'),
                status: 'received'
              });
            }}>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="purchaseOrderId">Purchase Order</Label>
                  <select name="purchaseOrderId" className="w-full p-2 border rounded" required>
                    <option value="">Select Purchase Order</option>
                    {pendingPOs?.map((po: any) => (
                      <option key={po.id} value={po.id}>
                        {po.orderNumber} - {po.supplier.name} (R {parseFloat(po.total).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="receivedDate">Received Date</Label>
                    <Input 
                      id="receivedDate" 
                      name="receivedDate" 
                      type="date" 
                      defaultValue={new Date().toISOString().split('T')[0]}
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="receivedBy">Received By</Label>
                    <Input id="receivedBy" name="receivedBy" placeholder="Name of person who received goods" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Receipt Notes</Label>
                  <Textarea id="notes" name="notes" placeholder="Any notes about the delivery..." />
                </div>
                <Button type="submit" className="w-full" disabled={createGoodsReceiptMutation.isPending}>
                  {createGoodsReceiptMutation.isPending ? "Creating..." : "Record Receipt"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Matches</p>
                <p className="text-2xl font-bold">{matches?.filter(m => m.status === 'pending').length || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Matches</p>
                <p className="text-2xl font-bold">{matches?.filter(m => m.status === 'full_match').length || 0}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Discrepancies</p>
                <p className="text-2xl font-bold">{matches?.filter(m => m.status === 'discrepancy').length || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Variance</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(matches?.reduce((sum, m) => sum + parseFloat(m.totalVariance), 0) || 0)}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending-matches">Pending Matches</TabsTrigger>
          <TabsTrigger value="all-matches">All Matches</TabsTrigger>
          <TabsTrigger value="goods-receipts">Goods Receipts</TabsTrigger>
        </TabsList>

        {/* Pending Matches Tab */}
        <TabsContent value="pending-matches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending 3-Way Matches
              </CardTitle>
              <CardDescription>
                Purchase orders waiting for goods receipt and/or supplier invoice matching
              </CardDescription>
            </CardHeader>
            <CardContent>
              {matchesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>PO Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Variance</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matches?.filter(match => match.status === 'pending' || match.status === 'partial_match').map((match) => (
                      <TableRow key={match.id}>
                        <TableCell className="font-medium">{match.purchaseOrder.orderNumber}</TableCell>
                        <TableCell>{match.purchaseOrder.supplier.name}</TableCell>
                        <TableCell>{formatCurrency(match.purchaseOrder.total)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(match.status)}>
                            {match.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={getVarianceColor(parseFloat(match.totalVariance))}>
                            {formatCurrency(match.totalVariance)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <span className="text-xs">PO</span>
                            </div>
                            {match.goodsReceiptId && (
                              <div className="flex items-center gap-1">
                                <Package className="h-4 w-4 text-green-600" />
                                <span className="text-xs">GR</span>
                              </div>
                            )}
                            {match.supplierInvoiceId && (
                              <div className="flex items-center gap-1">
                                <Receipt className="h-4 w-4 text-orange-600" />
                                <span className="text-xs">INV</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedMatch(match)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {match.status === 'full_match' && (
                              <Button 
                                size="sm" 
                                onClick={() => processMatchMutation.mutate({
                                  matchId: match.id,
                                  action: 'approve'
                                })}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Matches Tab */}
        <TabsContent value="all-matches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                All 3-Way Matches
              </CardTitle>
              <CardDescription>
                Complete history of all purchase order matching activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {matchesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Variance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matches?.map((match) => (
                      <TableRow key={match.id}>
                        <TableCell>{new Date(match.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{match.purchaseOrder.orderNumber}</TableCell>
                        <TableCell>{match.purchaseOrder.supplier.name}</TableCell>
                        <TableCell>{formatCurrency(match.purchaseOrder.total)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(match.status)}>
                            {match.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={getVarianceColor(parseFloat(match.totalVariance))}>
                            {formatCurrency(match.totalVariance)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedMatch(match)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goods Receipts Tab */}
        <TabsContent value="goods-receipts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Goods Receipts
              </CardTitle>
              <CardDescription>
                Track all goods receipts for purchase order fulfillment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {goodsReceiptsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt Number</TableHead>
                      <TableHead>Purchase Order</TableHead>
                      <TableHead>Received Date</TableHead>
                      <TableHead>Received By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {goodsReceipts?.map((receipt) => (
                      <TableRow key={receipt.id}>
                        <TableCell className="font-medium">{receipt.receiptNumber}</TableCell>
                        <TableCell>PO-{receipt.purchaseOrderId}</TableCell>
                        <TableCell>{new Date(receipt.receivedDate).toLocaleDateString()}</TableCell>
                        <TableCell>{receipt.receivedBy}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(receipt.status)}>
                            {receipt.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Match Detail Dialog */}
      {selectedMatch && (
        <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>3-Way Match Details: {selectedMatch.purchaseOrder.orderNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Match Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold">Purchase Order</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedMatch.purchaseOrder.orderNumber}
                    </p>
                    <p className="text-lg font-bold">{formatCurrency(selectedMatch.purchaseOrder.total)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-green-600" />
                      <span className="font-semibold">Goods Receipt</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedMatch.goodsReceipt?.receiptNumber || 'Not received'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-orange-600" />
                      <span className="font-semibold">Supplier Invoice</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedMatch.supplierInvoice?.invoiceNumber || 'Not received'}
                    </p>
                    {selectedMatch.supplierInvoice && (
                      <p className="text-lg font-bold">{formatCurrency(selectedMatch.supplierInvoice.total)}</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Line Items Comparison */}
              <div className="mt-6">
                <h4 className="font-semibold mb-4">Line Items Comparison</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Ordered Qty</TableHead>
                      <TableHead>Received Qty</TableHead>
                      <TableHead>Invoiced Qty</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Invoice Price</TableHead>
                      <TableHead>Variance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedMatch.lineItems?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.orderedQty}</TableCell>
                        <TableCell>{item.receivedQty}</TableCell>
                        <TableCell>{item.invoicedQty}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell>{formatCurrency(item.invoicePrice)}</TableCell>
                        <TableCell>
                          <span className={getVarianceColor(parseFloat(item.variance))}>
                            {formatCurrency(item.variance)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
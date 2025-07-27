import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DollarSign, 
  Receipt, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  FileText,
  ArrowRight,
  Plus,
  Search,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface SupplierPayment {
  id: number;
  purchaseOrderId: number;
  bankAccountId: number;
  amount: string;
  paymentDate: string;
  paymentMethod: string;
  reference: string;
  status: string;
  notes: string;
  approvalStatus: string;
  purchaseOrder: {
    orderNumber: string;
    supplier: { name: string };
    total: string;
  };
  bankAccount: {
    accountName: string;
    accountNumber: string;
  };
}

interface PaymentFlow {
  id: number;
  entityType: string;
  entityId: number;
  currentStep: string;
  status: string;
  totalAmount: string;
  matchingStatus: string;
  approvalStatus: string;
  createdAt: string;
  entity: any;
}

export default function PaymentFlows() {
  const [activeTab, setActiveTab] = useState("supplier-payments");
  const [selectedFlow, setSelectedFlow] = useState<PaymentFlow | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  // Fetch supplier payments
  const { data: supplierPayments, isLoading: supplierPaymentsLoading } = useQuery<SupplierPayment[]>({
    queryKey: ["/api/supplier-payments"],
    enabled: activeTab === "supplier-payments"
  });

  // Fetch client payments
  const { data: clientPayments, isLoading: clientPaymentsLoading } = useQuery({
    queryKey: ["/api/payments"],
    enabled: activeTab === "client-payments"
  });

  // Fetch payment flows for comprehensive tracking
  const { data: paymentFlows, isLoading: flowsLoading } = useQuery<PaymentFlow[]>({
    queryKey: ["/api/payment-flows"],
    enabled: activeTab === "payment-flows"
  });

  // Fetch pending approvals
  const { data: pendingApprovals, isLoading: approvalsLoading } = useQuery({
    queryKey: ["/api/approval-requests"],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Process approval mutation
  const processApprovalMutation = useMutation({
    mutationFn: ({ requestId, action, comments }: { requestId: number; action: string; comments?: string }) =>
      apiRequest(`/api/approval-requests/${requestId}/process`, "POST", { action, comments }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/approval-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supplier-payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payment-flows"] });
      toast({ title: "Success", description: "Approval processed successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to process approval", variant: "destructive" });
    },
  });

  // Record payment mutation
  const recordPaymentMutation = useMutation({
    mutationFn: (paymentData: any) =>
      apiRequest("/api/supplier-payments", "POST", paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supplier-payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payment-flows"] });
      toast({ title: "Success", description: "Payment recorded successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to record payment", variant: "destructive" });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-blue-100 text-blue-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "matched": return "bg-green-100 text-green-800";
      case "unmatched": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case "invoice_received": return <FileText className="h-4 w-4" />;
      case "matching": return <CheckCircle className="h-4 w-4" />;
      case "approval": return <Clock className="h-4 w-4" />;
      case "payment": return <CreditCard className="h-4 w-4" />;
      case "completed": return <DollarSign className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Flow Management</h1>
          <p className="text-muted-foreground">Comprehensive supplier and client payment tracking with approval workflows</p>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold">{pendingApprovals?.filter((a: any) => a.status === 'pending').length || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payments Today</p>
                <p className="text-2xl font-bold">{supplierPayments?.filter(p => 
                  new Date(p.paymentDate).toDateString() === new Date().toDateString()
                ).length || 0}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unmatched Items</p>
                <p className="text-2xl font-bold">{paymentFlows?.filter(f => f.matchingStatus === 'unmatched').length || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Flows</p>
                <p className="text-2xl font-bold">{paymentFlows?.filter(f => f.status === 'completed').length || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="supplier-payments">Supplier Payments</TabsTrigger>
          <TabsTrigger value="client-payments">Client Receipts</TabsTrigger>
          <TabsTrigger value="payment-flows">Payment Flows</TabsTrigger>
          <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
        </TabsList>

        {/* Supplier Payments Tab */}
        <TabsContent value="supplier-payments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Supplier Payments (Accounts Payable)
                  </CardTitle>
                  <CardDescription>
                    Track and manage all supplier payments with 3-way matching and approval workflows
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Record Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Record Supplier Payment</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="purchaseOrder">Purchase Order</Label>
                          <Select name="purchaseOrderId">
                            <SelectTrigger>
                              <SelectValue placeholder="Select purchase order" />
                            </SelectTrigger>
                            <SelectContent>
                              {/* Purchase orders will be populated here */}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="amount">Payment Amount</Label>
                          <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="paymentDate">Payment Date</Label>
                          <Input id="paymentDate" name="paymentDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div>
                          <Label htmlFor="paymentMethod">Payment Method</Label>
                          <Select name="paymentMethod">
                            <SelectTrigger>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="eft">EFT Transfer</SelectItem>
                              <SelectItem value="cheque">Cheque</SelectItem>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="card">Card</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="reference">Payment Reference</Label>
                        <Input id="reference" name="reference" placeholder="Payment reference or transaction ID" />
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" name="notes" placeholder="Additional payment notes..." />
                      </div>
                      <Button type="submit" className="w-full">Record Payment</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {supplierPaymentsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Approval</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplierPayments?.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                        <TableCell>{payment.purchaseOrder.supplier.name}</TableCell>
                        <TableCell>{payment.purchaseOrder.orderNumber}</TableCell>
                        <TableCell>R {parseFloat(payment.amount).toLocaleString()}</TableCell>
                        <TableCell className="capitalize">{payment.paymentMethod}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(payment.approvalStatus)}>
                            {payment.approvalStatus}
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

        {/* Client Payments Tab */}
        <TabsContent value="client-payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Client Receipts (Accounts Receivable)
              </CardTitle>
              <CardDescription>
                Manage client payments and receipts with automatic invoice matching
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clientPaymentsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Client payment details will be displayed here
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Flows Tab */}
        <TabsContent value="payment-flows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                Payment Workflow Tracking
              </CardTitle>
              <CardDescription>
                Complete payment flow tracking from invoice to payment with 3-way matching
              </CardDescription>
            </CardHeader>
            <CardContent>
              {flowsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entity</TableHead>
                      <TableHead>Current Step</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Matching Status</TableHead>
                      <TableHead>Approval Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentFlows?.map((flow) => (
                      <TableRow key={flow.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStepIcon(flow.currentStep)}
                            {flow.entityType} #{flow.entityId}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{flow.currentStep.replace('_', ' ')}</TableCell>
                        <TableCell>R {parseFloat(flow.totalAmount).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(flow.matchingStatus)}>
                            {flow.matchingStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(flow.approvalStatus)}>
                            {flow.approvalStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(flow.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedFlow(flow)}>
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

        {/* Pending Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Approvals
              </CardTitle>
              <CardDescription>
                Review and process pending payment approvals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approvalsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals?.filter((approval: any) => approval.status === 'pending').map((approval: any) => (
                    <Card key={approval.id} className="border-l-4 border-l-orange-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{approval.entityType} Approval Required</h4>
                            <p className="text-sm text-muted-foreground">
                              Amount: R {parseFloat(approval.requestData.amount || '0').toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Requested by: {approval.requestedBy}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => processApprovalMutation.mutate({
                                requestId: approval.id,
                                action: 'reject',
                                comments: 'Rejected via payment flows interface'
                              })}
                            >
                              Reject
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => processApprovalMutation.mutate({
                                requestId: approval.id,
                                action: 'approve',
                                comments: 'Approved via payment flows interface'
                              })}
                            >
                              Approve
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {pendingApprovals?.filter((approval: any) => approval.status === 'pending').length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No pending approvals at this time
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
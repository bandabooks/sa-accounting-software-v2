import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  User, 
  Calendar, 
  DollarSign,
  FileText,
  AlertTriangle,
  Users,
  TrendingUp,
  Building2,
  MessageSquare,
  Download,
  Filter,
  Search,
  ChevronRight,
  Receipt,
  CreditCard,
  Settings
} from "lucide-react";
import { format } from "date-fns";
import { useLoadingStates } from "@/hooks/useLoadingStates";
import { PageLoader } from "@/components/ui/global-loader";

interface PendingApproval {
  id: number;
  expenseId?: number;
  billId?: number;
  type: "expense" | "bill";
  description: string;
  amount: string;
  submittedBy: string;
  submittedByName: string;
  submittedDate: string;
  supplierName?: string;
  category: string;
  approverLevel: number;
  approvalLimit?: string;
  attachmentUrl?: string;
  urgency: "low" | "normal" | "high";
  comments?: string;
  daysWaiting: number;
}

interface ApprovalHistory {
  id: number;
  type: "expense" | "bill";
  description: string;
  amount: string;
  submittedBy: string;
  approvedBy: string;
  approvedDate: string;
  status: "approved" | "rejected";
  comments?: string;
  rejectionReason?: string;
}

interface ApprovalMetrics {
  pendingCount: number;
  pendingAmount: string;
  avgApprovalTime: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
  overdueApprovals: number;
}

export default function ExpenseApprovals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);
  const [approvalComments, setApprovalComments] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedUrgency, setSelectedUrgency] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch approval metrics
  const { data: metrics } = useQuery<ApprovalMetrics>({
    queryKey: ['/api/approvals/metrics'],
    staleTime: 30000,
  });

  // Fetch pending approvals
  const { data: pendingApprovals, isLoading } = useQuery<PendingApproval[]>({
    queryKey: ['/api/approvals/pending', {
      urgency: selectedUrgency,
      type: selectedType,
      search: searchTerm
    }],
    staleTime: 10000,
  });

  // Fetch approval history
  const { data: approvalHistory } = useQuery<ApprovalHistory[]>({
    queryKey: ['/api/approvals/history'],
    staleTime: 30000,
  });

  // Approve expense/bill mutation
  const approveMutation = useMutation({
    mutationFn: async ({ approvalId, comments }: { approvalId: number; comments: string }) => {
      return apiRequest(`/api/approvals/${approvalId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ comments }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/approvals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bills'] });
      setSelectedApproval(null);
      setApprovalComments("");
      toast({
        title: "Approved Successfully",
        description: "The expense/bill has been approved and processed.",
      });
    },
  });

  // Reject expense/bill mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ approvalId, reason }: { approvalId: number; reason: string }) => {
      return apiRequest(`/api/approvals/${approvalId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ rejectionReason: reason }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/approvals'] });
      setSelectedApproval(null);
      setRejectionReason("");
      toast({
        title: "Rejected Successfully",
        description: "The expense/bill has been rejected with comments.",
      });
    },
  });

  // Use loading states for comprehensive loading feedback including mutations
  useLoadingStates({
    loadingStates: [
      { isLoading, message: 'Loading expense approvals...' },
      { isLoading: approveMutation.isPending, message: 'Approving expense...' },
      { isLoading: rejectMutation.isPending, message: 'Rejecting expense...' },
    ],
    progressSteps: ['Fetching pending approvals', 'Loading metrics data', 'Processing approval history'],
  });

  if (isLoading) {
    return <PageLoader message="Loading expense approvals..." />;
  }

  const getUrgencyBadge = (urgency: string) => {
    const config = {
      low: { color: "bg-gray-100 text-gray-800", label: "Low" },
      normal: { color: "bg-blue-100 text-blue-800", label: "Normal" },
      high: { color: "bg-red-100 text-red-800", label: "High" },
    };
    
    const urgencyConfig = config[urgency as keyof typeof config] || config.normal;
    return <Badge className={urgencyConfig.color}>{urgencyConfig.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    return type === "bill" ? (
      <Badge variant="outline" className="flex items-center gap-1">
        <FileText className="h-3 w-3" />
        Bill
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Receipt className="h-3 w-3" />
        Expense
      </Badge>
    );
  };

  const formatCurrency = (amount: string) => {
    return `R ${parseFloat(amount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
  };

  const getDaysWaitingColor = (days: number) => {
    if (days <= 1) return "text-green-600";
    if (days <= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredApprovals = pendingApprovals?.filter(approval => {
    const matchesSearch = !searchTerm || 
      approval.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.submittedByName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUrgency = selectedUrgency === "all" || approval.urgency === selectedUrgency;
    const matchesType = selectedType === "all" || approval.type === selectedType;
    
    return matchesSearch && matchesUrgency && matchesType;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expense Approvals</h1>
            <p className="text-gray-600 mt-1">
              Review and approve expenses and bills requiring authorization
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Advanced Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.pendingCount || 0}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatCurrency(metrics?.pendingAmount || "0.00")} total value
                </p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved This Month</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.approvedThisMonth || 0}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Avg {metrics?.avgApprovalTime || 0} hours to approve
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Approvals</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.overdueApprovals || 0}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {metrics?.rejectedThisMonth || 0} rejected this month
                </p>
              </div>
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
          <TabsTrigger value="history">Approval History</TabsTrigger>
          <TabsTrigger value="workflow">Workflow Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search approvals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="expense">Expenses</SelectItem>
                    <SelectItem value="bill">Bills</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Urgency</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Sort by Amount
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals List */}
          <div className="grid gap-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                </CardContent>
              </Card>
            ) : filteredApprovals.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      All expenses and bills are up to date with approvals.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredApprovals.map((approval) => (
                <Card key={approval.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          {getTypeBadge(approval.type)}
                          {getUrgencyBadge(approval.urgency)}
                          <span className={`text-sm font-medium ${getDaysWaitingColor(approval.daysWaiting)}`}>
                            {approval.daysWaiting} days waiting
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {approval.description}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {approval.submittedByName}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(approval.submittedDate), "MMM dd, yyyy")}
                            </div>
                            {approval.supplierName && (
                              <div className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                {approval.supplierName}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-gray-900">
                              {formatCurrency(approval.amount)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Category: {approval.category}
                            </div>
                          </div>
                          
                          {approval.approvalLimit && (
                            <div className="text-right">
                              <div className="text-sm text-gray-500">Approval Limit</div>
                              <div className="text-sm font-medium">
                                {formatCurrency(approval.approvalLimit)}
                              </div>
                            </div>
                          )}
                        </div>

                        {approval.comments && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                              <div>
                                <div className="text-sm font-medium text-gray-700">Comments</div>
                                <div className="text-sm text-gray-600">{approval.comments}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-6">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedApproval(approval)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Review {approval.type === 'bill' ? 'Bill' : 'Expense'}</DialogTitle>
                              <DialogDescription>
                                Carefully review the details before approving or rejecting
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedApproval && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Amount</label>
                                    <div className="text-lg font-bold">{formatCurrency(selectedApproval.amount)}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Category</label>
                                    <div>{selectedApproval.category}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Submitted By</label>
                                    <div>{selectedApproval.submittedByName}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Date Submitted</label>
                                    <div>{format(new Date(selectedApproval.submittedDate), "PPP")}</div>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-sm font-medium text-gray-700">Description</label>
                                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                                    {selectedApproval.description}
                                  </div>
                                </div>

                                {selectedApproval.attachmentUrl && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Attachment</label>
                                    <div className="mt-1">
                                      <Button variant="outline" size="sm">
                                        <Download className="h-4 w-4 mr-1" />
                                        View Receipt
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <label className="text-sm font-medium text-gray-700">Approval Comments</label>
                                  <Textarea
                                    placeholder="Add your approval comments..."
                                    value={approvalComments}
                                    onChange={(e) => setApprovalComments(e.target.value)}
                                    className="mt-1"
                                  />
                                </div>

                                <div className="flex justify-end gap-3">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Reject
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Reject {selectedApproval.type === 'bill' ? 'Bill' : 'Expense'}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Please provide a reason for rejecting this {selectedApproval.type}.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <Textarea
                                        placeholder="Reason for rejection..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                      />
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => rejectMutation.mutate({ 
                                            approvalId: selectedApproval.id, 
                                            reason: rejectionReason 
                                          })}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Reject
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>

                                  <Button 
                                    onClick={() => approveMutation.mutate({ 
                                      approvalId: selectedApproval.id, 
                                      comments: approvalComments 
                                    })}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button 
                          size="sm"
                          onClick={() => approveMutation.mutate({ 
                            approvalId: approval.id, 
                            comments: "" 
                          })}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Quick Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Approval History</CardTitle>
              <CardDescription>
                Recent approval decisions and their outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approvalHistory && approvalHistory.length > 0 ? (
                <div className="space-y-4">
                  {approvalHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          item.status === 'approved' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {item.status === 'approved' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{item.description}</div>
                          <div className="text-sm text-gray-500">
                            {item.status === 'approved' ? 'Approved' : 'Rejected'} by {item.approvedBy} on {format(new Date(item.approvedDate), "MMM dd, yyyy")}
                          </div>
                          {(item.comments || item.rejectionReason) && (
                            <div className="text-sm text-gray-600 mt-1">
                              "{item.comments || item.rejectionReason}"
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(item.amount)}</div>
                        <Badge variant={item.status === 'approved' ? 'default' : 'destructive'}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No approval history</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Approval decisions will appear here once you start reviewing items.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Approval Workflow Rules</CardTitle>
              <CardDescription>
                Configure approval limits and workflow automation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Workflow configuration</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Set up approval limits, escalation rules, and automated workflows.
                </p>
                <Button className="mt-4">
                  Configure Workflows
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
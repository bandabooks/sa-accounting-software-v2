import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  FileText, 
  Filter, 
  Plus, 
  Search, 
  Calendar, 
  TrendingDown, 
  Receipt, 
  CreditCard, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Download,
  DollarSign,
  Building2,
  Users,
  Timer,
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";

interface Bill {
  id: number;
  companyId: number;
  billNumber: string;
  supplierId: number;
  supplierName?: string;
  supplierInvoiceNumber: string;
  billDate: string;
  dueDate: string;
  description: string;
  subtotal: string;
  vatAmount: string;
  total: string;
  paidAmount: string;
  status: "draft" | "pending_approval" | "approved" | "rejected" | "paid" | "overdue";
  approvalStatus: "pending" | "approved" | "rejected";
  approvedBy?: number;
  approvedAt?: string;
  rejectedBy?: number;
  rejectedAt?: string;
  rejectionReason?: string;
  purchaseOrderId?: number;
  purchaseOrderNumber?: string;
  goodsReceiptId?: number;
  paymentTerms: number;
  attachmentUrl?: string;
  notes?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

interface BillMetrics {
  totalOutstanding: string;
  overdueAmount: string;
  thisMonthBills: string;
  pendingApproval: string;
  billCount: number;
  averageBill: string;
  daysPayableOutstanding: number;
}

interface Supplier {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  paymentTerms: number;
}

export default function BillsManagement() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("all_suppliers");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("current_month");

  // Fetch bill metrics
  const { data: metrics } = useQuery<BillMetrics>({
    queryKey: [`/api/bills/metrics/${selectedPeriod}`],
    staleTime: 30000,
  });

  // Fetch bills with filters
  const { data: bills, isLoading } = useQuery<Bill[]>({
    queryKey: [`/api/bills`, { 
      search: searchTerm, 
      supplier: selectedSupplier,
      status: selectedStatus,
      approvalStatus: selectedApprovalStatus,
      period: selectedPeriod 
    }],
    staleTime: 10000,
  });

  // Fetch suppliers for dropdowns
  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers'],
    staleTime: 300000,
  });

  // Approve bill mutation
  const approveBillMutation = useMutation({
    mutationFn: async ({ billId, comments }: { billId: number; comments?: string }) => {
      return apiRequest(`/api/bills/${billId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bills'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bills/metrics'] });
      toast({
        title: "Bill Approved",
        description: "The bill has been successfully approved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to approve bill. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Reject bill mutation
  const rejectBillMutation = useMutation({
    mutationFn: async ({ billId, reason }: { billId: number; reason: string }) => {
      return apiRequest(`/api/bills/${billId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason: reason }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bills'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bills/metrics'] });
      toast({
        title: "Bill Rejected",
        description: "The bill has been rejected.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reject bill. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Convert to expense mutation
  const convertToExpenseMutation = useMutation({
    mutationFn: async (billId: number) => {
      return apiRequest(`/api/bills/${billId}/convert-to-expense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bills'] });
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      toast({
        title: "Bill Converted",
        description: "Bill has been converted to an expense record.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to convert bill to expense.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: "secondary", label: "Draft", icon: Edit },
      pending_approval: { variant: "default", label: "Pending Approval", icon: Clock },
      approved: { variant: "default", label: "Approved", icon: CheckCircle },
      rejected: { variant: "destructive", label: "Rejected", icon: XCircle },
      paid: { variant: "default", label: "Paid", icon: CheckCircle },
      overdue: { variant: "destructive", label: "Overdue", icon: AlertTriangle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getApprovalStatusBadge = (approvalStatus: string) => {
    switch (approvalStatus) {
      case "approved":
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const formatCurrency = (amount: string) => {
    return `R ${parseFloat(amount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
  };

  const calculateDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const filteredBills = bills?.filter(bill => {
    const matchesSearch = !searchTerm || 
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.supplierInvoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSupplier = selectedSupplier === "all_suppliers" || bill.supplierId.toString() === selectedSupplier;
    const matchesStatus = selectedStatus === "all" || bill.status === selectedStatus;
    const matchesApprovalStatus = selectedApprovalStatus === "all" || bill.approvalStatus === selectedApprovalStatus;
    
    return matchesSearch && matchesSupplier && matchesStatus && matchesApprovalStatus;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bills & Accounts Payable</h1>
            <p className="text-gray-600 mt-1">
              Professional supplier invoice management with approval workflows and 3-way matching
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => window.open('/api/bills/export', '_blank')}
            >
              <Download className="h-4 w-4" />
              Export Bills
            </Button>
            <Button 
              className="flex items-center gap-2"
              onClick={() => setLocation("/bills/create")}
            >
              <Plus className="h-4 w-4" />
              Create Bill
            </Button>
          </div>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding Bills</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(metrics?.totalOutstanding || "0.00")}
                </p>
              </div>
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <FileText className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(metrics?.overdueAmount || "0.00")}
                </p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(metrics?.thisMonthBills || "0.00")}
                </p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(metrics?.pendingApproval || "0.00")}
                </p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bills</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.billCount || 0}</p>
              </div>
              <Receipt className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Bill</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(metrics?.averageBill || "0.00")}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Days Payable Outstanding</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.daysPayableOutstanding || 0}</p>
              </div>
              <Timer className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search bills, suppliers, or reference numbers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger>
                <SelectValue placeholder="All Suppliers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_suppliers">All Suppliers</SelectItem>
                {suppliers?.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedApprovalStatus} onValueChange={setSelectedApprovalStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Approvals" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Approvals</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="current_quarter">This Quarter</SelectItem>
                <SelectItem value="current_year">This Year</SelectItem>
                <SelectItem value="all_time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bills & Payables</CardTitle>
          <CardDescription>
            Manage supplier invoices with professional approval workflows and 3-way matching
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bills found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first bill.
              </p>
              <div className="mt-6">
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Bill
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bill Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBills.map((bill) => {
                    const daysOverdue = calculateDaysOverdue(bill.dueDate);
                    const isOverdue = daysOverdue > 0 && bill.status !== 'paid';
                    
                    return (
                      <tr key={bill.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">
                              {bill.billNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              Supplier Ref: {bill.supplierInvoiceNumber}
                            </div>
                            {bill.purchaseOrderNumber && (
                              <div className="text-xs text-blue-600 flex items-center gap-1">
                                <ArrowRight className="h-3 w-3" />
                                PO: {bill.purchaseOrderNumber}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                              <Building2 className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {bill.supplierName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {bill.paymentTerms} days terms
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="font-medium">{formatCurrency(bill.total)}</div>
                            <div className="text-xs text-gray-500">
                              VAT: {formatCurrency(bill.vatAmount)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {getStatusBadge(bill.status)}
                            {getApprovalStatusBadge(bill.approvalStatus)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {format(new Date(bill.dueDate), "MMM dd, yyyy")}
                          </div>
                          {isOverdue && (
                            <div className="text-xs text-red-600 font-medium">
                              {daysOverdue} days overdue
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Bill
                              </DropdownMenuItem>
                              {bill.approvalStatus === "pending" && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => approveBillMutation.mutate({ billId: bill.id })}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      const reason = prompt("Please enter rejection reason:");
                                      if (reason) {
                                        rejectBillMutation.mutate({ billId: bill.id, reason });
                                      }
                                    }}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {bill.status === "approved" && (
                                <DropdownMenuItem 
                                  onClick={() => convertToExpenseMutation.mutate(bill.id)}
                                >
                                  <Receipt className="mr-2 h-4 w-4" />
                                  Convert to Expense
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
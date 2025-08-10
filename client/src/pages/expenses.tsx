import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, Search, Filter, DollarSign, Receipt, TrendingUp, 
  PieChart, Building, Calendar, FileText, CheckCircle2,
  XCircle, Clock, Eye, Edit, Trash2, Download, Upload,
  BarChart3, TrendingDown, AlertCircle, Copy, RefreshCw
} from "lucide-react";
import AddExpenseModal from "@/components/expenses/AddExpenseModal";
import { apiRequest } from "@/lib/queryClient";

interface ExpenseMetrics {
  totalExpenses: string;
  totalVatClaimed: string;
  paidExpenses: string;
  unpaidExpenses: string;
  expenseCount: number;
  categoryBreakdown: Array<{
    category: string;
    amount: string;
    count: number;
  }>;
  supplierBreakdown: Array<{
    supplier: string;
    amount: string;
    count: number;
  }>;
}

export default function ExpensesPage() {
  const { user } = useAuth() as { user: any };
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("current_month");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all_suppliers");
  const [categoryFilter, setCategoryFilter] = useState("all_categories");

  // Fetch expenses with proper endpoint
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['/api/expenses', dateFilter, statusFilter, supplierFilter, categoryFilter],
    queryFn: () => apiRequest(`/api/expenses/${dateFilter}/${statusFilter}/${supplierFilter}/${categoryFilter}`),
  });

  // Fetch overall metrics (all-time) for Total Expenses card
  const { data: allTimeMetrics } = useQuery({
    queryKey: ['/api/expenses/metrics/all_time', user?.companyId],
    queryFn: () => apiRequest(`/api/expenses/metrics/all_time`),
    enabled: !!user?.companyId
  });

  // Fetch filtered metrics based on current date filter selection
  const { data: filteredMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/expenses/metrics', dateFilter, user?.companyId],
    queryFn: () => {
      console.log(`Fetching ${dateFilter} metrics...`);
      return apiRequest(`/api/expenses/metrics/${dateFilter}`);
    },
    enabled: !!user?.companyId,
    staleTime: 0,
    refetchOnMount: true
  });

  // Fetch suppliers for filter
  const { data: suppliers } = useQuery({
    queryKey: ['/api/suppliers'],
  });

  // Fetch categories for filter (including Cost of Sales)
  const { data: categories } = useQuery({
    queryKey: ['/api/chart-of-accounts'],
    select: (data: any) => data?.filter((account: any) => 
      account.accountType === 'Expense' || account.accountType === 'Cost of Sales'
    ),
  });

  const formatCurrency = (amount: string | number) => {
    return `R ${parseFloat(amount.toString()).toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/expenses/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/expenses/metrics'] });
      toast({
        title: "Expense Deleted",
        description: "The expense has been successfully deleted.",
      });
      setDeleteConfirmOpen(false);
      setExpenseToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense",
        variant: "destructive"
      });
    }
  });

  const handleDeleteExpense = (id: number) => {
    setExpenseToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (expenseToDelete) {
      deleteExpenseMutation.mutate(expenseToDelete);
    }
  };

  const handleExportExpenses = async () => {
    try {
      const response = await apiRequest('/api/expenses/export', 'GET');
      // Create downloadable CSV
      const csvContent = response.data;
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export expenses data",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'unpaid':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Unpaid</Badge>;
      case 'partially paid':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Partially Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading expenses...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Expense Management</h1>
          <p className="text-muted-foreground">
            Manage your business expenses with integrated supplier tracking and VAT compliance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportExpenses} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => setAddExpenseOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Expense
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold">{formatCurrency((allTimeMetrics as any)?.totalExpenses || "0")}</p>
                  <p className="text-xs text-muted-foreground">{(allTimeMetrics as any)?.expenseCount || 0} expense entries</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {dateFilter === 'current_month' ? 'This Month' : 
                     dateFilter === 'last_month' ? 'Last Month' :
                     dateFilter === 'current_quarter' ? 'This Quarter' :
                     dateFilter === 'current_year' ? 'This Year' : 'Selected Period'}
                  </p>
                  <p className="text-2xl font-bold">{formatCurrency((filteredMetrics as any)?.totalExpenses || (allTimeMetrics as any)?.totalExpenses || "0")}</p>
                  <p className="text-xs text-muted-foreground">{(filteredMetrics as any)?.expenseCount || (allTimeMetrics as any)?.expenseCount || 0} entries</p>
                  {/* Debug info */}
                  <p className="text-xs text-blue-500">Filtered: {(filteredMetrics as any)?.totalExpenses || "No data"} | All: {(allTimeMetrics as any)?.totalExpenses || "No data"}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unpaid Expenses</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency((filteredMetrics as any)?.unpaidExpenses || (allTimeMetrics as any)?.unpaidExpenses || "0")}</p>
                  <p className="text-xs text-muted-foreground">Outstanding payments</p>
                </div>
                <XCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Expense</p>
                  <p className="text-2xl font-bold">{formatCurrency(
                    ((allTimeMetrics as any)?.expenseCount || 0) > 0 
                      ? (parseFloat((allTimeMetrics as any)?.totalExpenses || "0") / (allTimeMetrics as any).expenseCount).toFixed(2)
                      : "0"
                  )}</p>
                  <p className="text-xs text-muted-foreground">Per expense entry</p>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_month">Current Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="current_quarter">Current Quarter</SelectItem>
                  <SelectItem value="current_year">Current Year</SelectItem>
                  <SelectItem value="all_time">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Supplier</label>
              <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_suppliers">All Suppliers</SelectItem>
                  {suppliers?.map((supplier: any) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_categories">All Categories</SelectItem>
                  {categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.accountName} ({category.accountType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium">Internal Ref</th>
                    <th className="p-3 text-left font-medium">Supplier Invoice #</th>
                    <th className="p-3 text-left font-medium">Description</th>
                    <th className="p-3 text-left font-medium">Supplier</th>
                    <th className="p-3 text-left font-medium">Category</th>
                    <th className="p-3 text-left font-medium">Amount</th>
                    <th className="p-3 text-left font-medium">VAT</th>
                    <th className="p-3 text-left font-medium">Date</th>
                    <th className="p-3 text-left font-medium">Status</th>
                    <th className="p-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // Apply search filtering on the client side
                    const filteredExpenses = expenses.filter((expense: any) => {
                      if (searchTerm === "") return true;
                      
                      const searchLower = searchTerm.toLowerCase();
                      return expense.description?.toLowerCase().includes(searchLower) ||
                        expense.supplier?.name?.toLowerCase().includes(searchLower) ||
                        expense.category?.accountName?.toLowerCase().includes(searchLower) ||
                        expense.supplierInvoiceNumber?.toLowerCase().includes(searchLower) ||
                        expense.amount?.toString().includes(searchTerm);
                    });
                    
                    return filteredExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-muted-foreground">
                          {expenses.length === 0 ? "No expenses found. Click \"Add New Expense\" to get started." : "No expenses match your search criteria."}
                        </td>
                      </tr>
                    ) : (
                      filteredExpenses.map((expense: any) => (
                      <tr key={expense.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <span className="font-mono text-sm font-medium">
                            {expense.internalExpenseRef}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">
                            {expense.supplierInvoiceNumber || 'N/A'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-medium">{expense.description}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{expense.supplier?.name || 'No Supplier'}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">{expense.category?.accountName || 'Uncategorized'}</span>
                        </td>
                        <td className="p-3 font-mono text-right">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="p-3 font-mono text-right">
                          {formatCurrency(expense.vatAmount)}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{new Date(expense.expenseDate).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="p-3">{getStatusBadge(expense.paidStatus)}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedExpense(expense)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setEditingExpense(expense)}
                              title="Edit Expense"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteExpense(expense.id)}
                              title="Delete Expense"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      ))
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Expense Modal */}
      <AddExpenseModal
        open={addExpenseOpen}
        onOpenChange={setAddExpenseOpen}
      />

      {/* Edit Expense Modal */}
      {editingExpense && (
        <AddExpenseModal
          open={!!editingExpense}
          onOpenChange={(open) => !open && setEditingExpense(null)}
          expenseToEdit={editingExpense}
        />
      )}

      {/* Expense Detail Modal */}
      {selectedExpense && (
        <Dialog open={!!selectedExpense} onOpenChange={(open) => !open && setSelectedExpense(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Expense Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Internal Reference</label>
                  <p className="font-mono font-medium">{selectedExpense.internalExpenseRef}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Supplier Invoice #</label>
                  <p>{selectedExpense.supplierInvoiceNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p>{selectedExpense.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Supplier</label>
                  <p>{selectedExpense.supplier?.name || 'No Supplier'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p>{selectedExpense.category?.accountName || 'Uncategorized'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <p>{new Date(selectedExpense.expenseDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Financial Information */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Financial Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Net Amount</label>
                    <p className="font-mono text-lg">{formatCurrency(selectedExpense.amount)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">VAT Amount</label>
                    <p className="font-mono text-lg">{formatCurrency(selectedExpense.vatAmount)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                    <p className="font-mono text-lg font-bold">
                      {formatCurrency(parseFloat(selectedExpense.amount) + parseFloat(selectedExpense.vatAmount))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="border-t pt-4">
                <label className="text-sm font-medium text-muted-foreground">Payment Status</label>
                <div className="mt-1">
                  {getStatusBadge(selectedExpense.paidStatus)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" onClick={() => setEditingExpense(selectedExpense)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Expense
                </Button>
                <Button variant="outline" onClick={() => setSelectedExpense(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone and will remove the expense from all reports and calculations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete Expense
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
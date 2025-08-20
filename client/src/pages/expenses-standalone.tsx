import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { DollarSign, FileText, Filter, Plus, Search, Calendar, TrendingDown, Receipt, CreditCard, Edit, Trash2, MoreHorizontal } from "lucide-react";
import AddExpenseModal from "@/components/expenses/AddExpenseModal";
import { format } from "date-fns";
import { useLoadingStates } from "@/hooks/useLoadingStates";
import { PageLoader } from "@/components/ui/global-loader";

interface Expense {
  id: number;
  companyId: number;
  supplierId?: number;
  supplierName?: string;
  description: string;
  categoryId?: number;
  categoryName?: string;
  amount: string;
  vatType: string;
  vatRate: string;
  vatAmount: string;
  expenseDate: string;
  paidStatus: "Paid" | "Unpaid" | "Partially Paid";
  supplierInvoiceNumber?: string;
  internalExpenseRef: string;
  attachmentUrl?: string;
  createdBy: number;
  createdAt: string;
}

interface ExpenseMetrics {
  totalExpenses: string;
  totalVatClaimed: string;
  taxDeductibleAmount: string;
  nonDeductibleAmount: string;
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

export default function ExpensesStandalone() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [payingExpense, setPayingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("all_suppliers");
  const [selectedCategory, setSelectedCategory] = useState("all_categories");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("current_month");

  // Fetch expense metrics
  const { data: metrics } = useQuery<ExpenseMetrics>({
    queryKey: [`/api/expenses/metrics/${selectedPeriod}`],
    enabled: !!user,
  });

  // Fetch expenses list
  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: [`/api/expenses/${selectedPeriod}/${selectedStatus}/${selectedSupplier}/${selectedCategory}`],
    enabled: !!user,
  });

  // Fetch suppliers for filter dropdown
  const { data: suppliers = [] } = useQuery<any[]>({
    queryKey: ['/api/suppliers'],
    enabled: !!user,
  });

  // Fetch chart of accounts for category filter
  const { data: chartOfAccounts = [] } = useQuery<any[]>({
    queryKey: ['/api/chart-of-accounts'],
    enabled: !!user,
  });

  // Filter expenses based on search term
  const filteredExpenses = expenses.filter(expense =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.internalExpenseRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.supplierInvoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Paid": return "default";
      case "Unpaid": return "destructive";
      case "Partially Paid": return "secondary";
      default: return "outline";
    }
  };

  const formatCurrency = (amount: string) => {
    return `R ${Number(amount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
  };

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: number) => {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }
      return response.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: [`/api/expenses/metrics/${selectedPeriod}`] });
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
      setDeletingExpense(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense",
        variant: "destructive",
      });
    },
  });

  // Update expense mutation  
  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update expense');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: [`/api/expenses/metrics/${selectedPeriod}`] });
      toast({
        title: "Success",
        description: "Expense updated successfully",
      });
      setEditingExpense(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update expense",
        variant: "destructive",
      });
    },
  });

  // Pay expense mutation
  const payExpenseMutation = useMutation({
    mutationFn: async (expenseId: number) => {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paidStatus: 'Paid' }),
      });
      if (!response.ok) {
        throw new Error('Failed to process expense payment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: [`/api/expenses/metrics/${selectedPeriod}`] });
      toast({
        title: "Success",
        description: "Expense payment processed successfully",
      });
      setPayingExpense(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process expense payment",
        variant: "destructive",
      });
    },
  });

  // Use loading states for comprehensive loading feedback including mutations - MUST be after ALL mutations
  useLoadingStates({
    loadingStates: [
      { isLoading, message: 'Loading expenses...' },
      { isLoading: deleteExpenseMutation.isPending, message: 'Deleting expense...' },
      { isLoading: updateExpenseMutation.isPending, message: 'Updating expense...' },
      { isLoading: payExpenseMutation.isPending, message: 'Processing payment...' },
    ],
    progressSteps: ['Fetching expenses', 'Loading suppliers', 'Processing filters'],
  });

  if (isLoading) {
    return <PageLoader message="Loading expenses..." />;
  }

  const handleDeleteExpense = (expense: Expense) => {
    setDeletingExpense(expense);
  };

  const confirmDeleteExpense = () => {
    if (deletingExpense) {
      deleteExpenseMutation.mutate(deletingExpense.id);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handlePayExpense = (expense: Expense) => {
    setPayingExpense(expense);
  };

  const confirmPayExpense = () => {
    if (payingExpense) {
      payExpenseMutation.mutate(payingExpense.id);
    }
  };

  const handleBulkPayExpenses = () => {
    // Find all unpaid expenses
    const unpaidExpenses = filteredExpenses.filter(expense => expense.paidStatus === "Unpaid");
    
    if (unpaidExpenses.length === 0) {
      toast({
        title: "No Unpaid Expenses",
        description: "All expenses are already paid",
      });
      return;
    }

    // For now, show a simple confirmation for bulk payment
    toast({
      title: "Bulk Payment",
      description: `Found ${unpaidExpenses.length} unpaid expenses. Individual payment processing available in dropdown menus.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900">
      <div className="space-y-8 p-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Expenses
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-base">
                  Manage your business expenses and track spending
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setIsAddModalOpen(true)} 
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 text-base px-6 py-3 rounded-xl"
            >
              <Plus className="h-5 w-5" />
              Add New Expense
            </Button>
            <Button 
              onClick={handleBulkPayExpenses}
              variant="outline"
              className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-700 border-green-200 shadow-lg hover:shadow-xl transition-all duration-200 text-base px-6 py-3 rounded-xl"
            >
              <CreditCard className="h-5 w-5" />
              Pay Expenses
            </Button>
          </div>
        </div>

        {/* Enhanced Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Expenses</CardTitle>
              <div className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg">
                <TrendingDown className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                {formatCurrency(metrics?.totalExpenses || "0.00")}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {metrics?.expenseCount || 0} expense entries
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Paid Expenses</CardTitle>
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                <Calendar className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {formatCurrency(metrics?.paidExpenses || "0.00")}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Paid expenses
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Unpaid Expenses</CardTitle>
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {formatCurrency(metrics?.unpaidExpenses || "0.00")}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Outstanding payments
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">VAT Claimed</CardTitle>
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                <Receipt className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {formatCurrency(metrics?.totalVatClaimed || "0.00")}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                VAT claimed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters and Search */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Filters & Search
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_month">Current Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="current_year">Current Year</SelectItem>
                  <SelectItem value="all_time">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Supplier</label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_suppliers">All Suppliers</SelectItem>
                  {suppliers.map((supplier: any) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_categories">All Categories</SelectItem>
                  {chartOfAccounts.map((account: any) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.accountName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                  <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Enhanced Expenses Table */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Expense Entries ({filteredExpenses.length})
              </span>
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Track and manage all your business expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500 dark:text-gray-400">
              <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl mb-4">
                <Receipt className="h-16 w-16" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No expenses found</h3>
              <p className="text-sm text-center max-w-md">
                Create your first expense entry to start tracking your business spending
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExpenses.map((expense) => (
                <Card key={expense.id} className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{expense.description}</h3>
                        <Badge 
                          variant={getStatusBadgeVariant(expense.paidStatus)}
                          className="px-3 py-1 text-xs font-medium rounded-full"
                        >
                          {expense.paidStatus}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-medium">{expense.internalExpenseRef}</span>
                        {expense.supplierInvoiceNumber && (
                          <span>Invoice: {expense.supplierInvoiceNumber}</span>
                        )}
                        <span>{expense.supplierName || "No Supplier"}</span>
                        <span>{format(new Date(expense.expenseDate), "dd MMM yyyy")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold">{formatCurrency(expense.amount)}</div>
                        <div className="text-sm text-muted-foreground">
                          VAT: {formatCurrency(expense.vatAmount)}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {expense.paidStatus === "Unpaid" && (
                            <DropdownMenuItem
                              onClick={() => handlePayExpense(expense)}
                              className="flex items-center gap-2 text-green-600"
                            >
                              <CreditCard className="h-4 w-4" />
                              Pay Expense
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleEditExpense(expense)}
                            className="flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit Expense
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteExpense(expense)}
                            className="flex items-center gap-2 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Expense
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

        {/* Add Expense Modal */}
        <AddExpenseModal
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
        />

        {/* Edit Expense Modal */}
        {editingExpense && (
          <AddExpenseModal
            open={!!editingExpense}
            onOpenChange={(open) => !open && setEditingExpense(null)}
            editingExpense={editingExpense}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingExpense} onOpenChange={(open) => !open && setDeletingExpense(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Expense</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the expense "{deletingExpense?.description}"? 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingExpense(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteExpense}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteExpenseMutation.isPending}
              >
                {deleteExpenseMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Payment Confirmation Dialog */}
        <AlertDialog open={!!payingExpense} onOpenChange={(open) => !open && setPayingExpense(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Pay Expense</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to mark the expense "{payingExpense?.description}" as paid? 
                The expense amount is {payingExpense && formatCurrency(payingExpense.amount)}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPayingExpense(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmPayExpense}
                className="bg-green-600 text-white hover:bg-green-700"
                disabled={payExpenseMutation.isPending}
              >
                {payExpenseMutation.isPending ? "Processing..." : "Confirm Payment"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
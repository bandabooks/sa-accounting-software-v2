import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { 
  Plus, Search, Filter, DollarSign, Receipt, TrendingUp, 
  PieChart, Building, Calendar, FileText, CheckCircle2,
  XCircle, Clock, Eye, Edit, Trash2
} from "lucide-react";
import AddExpenseModal from "@/components/expenses/AddExpenseModal";

interface ExpenseMetrics {
  totalExpenses: string;
  totalVatClaimed: string;
  taxDeductibleAmount: string;
  nonDeductibleAmount: string;
  paidExpenses: string;
  unpaidExpenses: string;
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

export default function EnhancedExpensesPage() {
  const { user } = useAuth() as { user: any };
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("current_month");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all_suppliers");
  const [categoryFilter, setCategoryFilter] = useState("all_categories");

  // Fetch expenses
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['/api/expenses', searchTerm, dateFilter, statusFilter, supplierFilter, categoryFilter],
  }) as { data: any[], isLoading: boolean };

  // Fetch expense metrics
  const { data: metrics } = useQuery<ExpenseMetrics>({
    queryKey: ['/api/expenses/metrics', dateFilter],
  });

  // Fetch suppliers for filter
  const { data: suppliers } = useQuery({
    queryKey: ['/api/suppliers'],
  }) as { data: any[] };

  // Fetch categories for filter
  const { data: categories } = useQuery({
    queryKey: ['/api/chart-of-accounts'],
    select: (data: any) => data?.filter((account: any) => 
      account.accountType === 'Expense' || account.accountType === 'Cost of Sales'
    ),
  }) as { data: any[] };

  // Fetch companies for multi-company filter
  const { data: companies } = useQuery({
    queryKey: ['/api/companies/my'],
    enabled: user?.role === 'super_admin',
  });

  const formatCurrency = (amount: string | number) => {
    return `R ${parseFloat(amount.toString()).toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getStatusBadge = (isPaid: boolean) => {
    return isPaid ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Paid
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
        <Clock className="h-3 w-3 mr-1" />
        Unpaid
      </Badge>
    );
  };

  const getVatTypeBadge = (vatType: string) => {
    const colors = {
      "No VAT": "bg-gray-100 text-gray-800",
      "Inclusive": "bg-blue-100 text-blue-800",
      "Exclusive": "bg-purple-100 text-purple-800",
    };
    
    return (
      <Badge variant="outline" className={colors[vatType as keyof typeof colors] || colors["No VAT"]}>
        {vatType}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Enhanced Expense Management</h1>
          <p className="text-gray-600">Supplier invoice capture with VAT compliance</p>
        </div>
        <Button onClick={() => setAddExpenseOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics?.totalExpenses || "0")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total VAT Claimed</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(metrics?.totalVatClaimed || "0")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tax Deductible</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(metrics?.taxDeductibleAmount || "0")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Expenses</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(metrics?.unpaidExpenses || "0")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category and Supplier Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics?.categoryBreakdown?.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm">{item.category}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.count}
                    </Badge>
                  </div>
                  <span className="font-medium">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Supplier Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Supplier Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics?.supplierBreakdown?.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm">{item.supplier}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.count}
                    </Badge>
                  </div>
                  <span className="font-medium">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_month">Current Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="current_quarter">Current Quarter</SelectItem>
                <SelectItem value="current_year">Current Year</SelectItem>
                <SelectItem value="all_time">All Time</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>

            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_suppliers">All Suppliers</SelectItem>
                {(suppliers as any)?.map((supplier: any) => (
                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_categories">All Categories</SelectItem>
                {(categories as any)?.map((category: any) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.accountName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Company filter removed - company context established at login */}
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Expenses ({expenses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading expenses...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">No expenses found</p>
              <p className="text-gray-600 mb-4">Get started by adding your first expense</p>
              <Button onClick={() => setAddExpenseOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {(expenses as any)?.map((expense: any) => (
                <div key={expense.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{expense.description}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {expense.supplier && (
                              <span className="text-sm text-gray-600 flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {expense.supplier.name}
                              </span>
                            )}
                            {expense.category && (
                              <span className="text-sm text-gray-600">
                                {expense.category.accountName}
                              </span>
                            )}
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(expense.expenseDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {getStatusBadge(expense.isPaid)}
                            {getVatTypeBadge(expense.vatType)}
                            {expense.taxDeductible && (
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Tax Deductible
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg">
                            {formatCurrency(expense.amount)}
                          </div>
                          {expense.vatType !== "No VAT" && (
                            <div className="text-sm text-gray-600">
                              VAT: {formatCurrency(expense.vatAmount)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Expense Modal */}
      <AddExpenseModal
        open={addExpenseOpen}
        onOpenChange={setAddExpenseOpen}
      />
    </div>
  );
}
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Receipt, Search, Filter, Download, Calendar } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils-invoice";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Expense {
  id: number;
  description: string;
  amount: string;
  category: string;
  vatAmount: string;
  expenseDate: string;
  isDeductible: boolean;
  receiptPath?: string;
  createdAt: string;
}

const expenseCategories = [
  'office_supplies',
  'travel',
  'utilities',
  'rent',
  'insurance',
  'professional_services',
  'marketing',
  'equipment',
  'software',
  'phone_internet',
  'fuel',
  'entertainment',
  'other'
];

export default function Expenses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['/api/expenses'],
    queryFn: async () => {
      const response = await fetch('/api/expenses');
      if (!response.ok) throw new Error('Failed to fetch expenses');
      return response.json() as Promise<Expense[]>;
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/expenses', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      setIsCreateModalOpen(false);
      toast({
        title: "Success",
        description: "Expense created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create expense.",
        variant: "destructive",
      });
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest(`/api/expenses/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      setEditingExpense(null);
      toast({
        title: "Success",
        description: "Expense updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update expense.",
        variant: "destructive",
      });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/expenses/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      toast({
        title: "Success",
        description: "Expense deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete expense.",
        variant: "destructive",
      });
    },
  });

  const filteredExpenses = expenses?.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const totalVAT = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.vatAmount || '0'), 0);
  const deductibleExpenses = filteredExpenses.filter(expense => expense.isDeductible);
  const totalDeductible = deductibleExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      description: formData.get('description') as string,
      amount: formData.get('amount') as string,
      category: formData.get('category') as string,
      vatAmount: formData.get('vatAmount') as string,
      expenseDate: formData.get('expenseDate') as string,
      isDeductible: formData.get('isDeductible') === 'on',
    };

    if (editingExpense) {
      updateExpenseMutation.mutate({ id: editingExpense.id, data });
    } else {
      createExpenseMutation.mutate(data);
    }
  };

  const formatCategoryName = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-1">Track and manage business expenses</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Enter expense description"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map(category => (
                        <SelectItem key={category} value={category || ""}>
                          {formatCategoryName(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="vatAmount">VAT Amount</Label>
                  <Input
                    id="vatAmount"
                    name="vatAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    defaultValue="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="expenseDate">Date</Label>
                  <Input
                    id="expenseDate"
                    name="expenseDate"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="isDeductible" name="isDeductible" defaultChecked />
                <Label htmlFor="isDeductible">Tax deductible</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createExpenseMutation.isPending}>
                  {createExpenseMutation.isPending ? "Creating..." : "Create Expense"}
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
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses.toFixed(2))}</div>
            <p className="text-xs text-muted-foreground">
              {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total VAT</CardTitle>
            <Receipt className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalVAT.toFixed(2))}</div>
            <p className="text-xs text-muted-foreground">
              VAT on purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tax Deductible</CardTitle>
            <Receipt className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalDeductible.toFixed(2))}</div>
            <p className="text-xs text-muted-foreground">
              {deductibleExpenses.length} deductible expense{deductibleExpenses.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Filter className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {new Set(filteredExpenses.map(e => e.category)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Different categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {expenseCategories.map(category => (
              <SelectItem key={category} value={category}>
                {formatCategoryName(category)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No expenses found.</p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4"
              >
                Add Your First Expense
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Description</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-right py-3 px-4">Amount</th>
                    <th className="text-right py-3 px-4">VAT</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{expense.description}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">
                          {formatCategoryName(expense.category)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(new Date(expense.expenseDate))}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-600">
                        {formatCurrency(expense.vatAmount || '0')}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={expense.isDeductible ? "default" : "secondary"}>
                          {expense.isDeductible ? "Deductible" : "Not Deductible"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingExpense(expense)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteExpenseMutation.mutate(expense.id)}
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

      {/* Edit Modal */}
      <Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          {editingExpense && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    defaultValue={editingExpense.description}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue={editingExpense.category}>
                    <SelectTrigger>
                      <SelectValue />
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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    defaultValue={editingExpense.amount}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="vatAmount">VAT Amount</Label>
                  <Input
                    id="vatAmount"
                    name="vatAmount"
                    type="number"
                    step="0.01"
                    defaultValue={editingExpense.vatAmount}
                  />
                </div>
                <div>
                  <Label htmlFor="expenseDate">Date</Label>
                  <Input
                    id="expenseDate"
                    name="expenseDate"
                    type="date"
                    defaultValue={editingExpense.expenseDate.split('T')[0]}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isDeductible" 
                  name="isDeductible" 
                  defaultChecked={editingExpense.isDeductible}
                />
                <Label htmlFor="isDeductible">Tax deductible</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingExpense(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateExpenseMutation.isPending}>
                  {updateExpenseMutation.isPending ? "Updating..." : "Update Expense"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
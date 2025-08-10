import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Upload, Calculator, DollarSign, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import AddSupplierModal from "@/components/suppliers/AddSupplierModal";

interface ExpenseFormData {
  companyId: number;
  supplierId?: number;
  bankAccountId?: number;
  description: string;
  categoryId?: number;
  category: string;
  amount: string;
  vatType: "Inclusive" | "Exclusive" | "No VAT";
  vatRate: string;
  vatAmount: string;
  expenseDate: string;
  paidStatus: "Paid" | "Unpaid" | "Partially Paid";
  supplierInvoiceNumber?: string; // New field for supplier invoice number
  attachmentUrl?: string;
  createdBy: number;
}

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingExpense?: any;
}

export default function AddExpenseModal({ open, onOpenChange, editingExpense }: AddExpenseModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<ExpenseFormData>({
    companyId: (user as any)?.companyId || 0,
    description: "",
    amount: "",
    vatType: "No VAT",
    vatRate: "15.00",
    vatAmount: "0.00",
    expenseDate: new Date().toISOString().split('T')[0],
    paidStatus: "Unpaid",
    supplierInvoiceNumber: "",
    categoryId: undefined,
    category: "",
    createdBy: user?.id || 0,
  });

  const [netAmount, setNetAmount] = useState("0.00");
  const [grossAmount, setGrossAmount] = useState("0.00");
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Effect to populate form when editing
  useEffect(() => {
    if (editingExpense) {
      setFormData({
        companyId: editingExpense.companyId,
        supplierId: editingExpense.supplierId,
        bankAccountId: editingExpense.bankAccountId,
        description: editingExpense.description,
        categoryId: editingExpense.categoryId,
        category: editingExpense.categoryName || "",
        amount: editingExpense.amount,
        vatType: editingExpense.vatType,
        vatRate: editingExpense.vatRate,
        vatAmount: editingExpense.vatAmount,
        expenseDate: editingExpense.expenseDate.split('T')[0],
        paidStatus: editingExpense.paidStatus,
        supplierInvoiceNumber: editingExpense.supplierInvoiceNumber || "",
        createdBy: editingExpense.createdBy,
      });
      setNetAmount(editingExpense.amount);
      setGrossAmount((parseFloat(editingExpense.amount) + parseFloat(editingExpense.vatAmount)).toFixed(2));
    } else {
      // Reset form for new expense
      setFormData({
        companyId: (user as any)?.companyId || 0,
        description: "",
        amount: "",
        vatType: "No VAT",
        vatRate: "15.00",
        vatAmount: "0.00",
        expenseDate: new Date().toISOString().split('T')[0],
        paidStatus: "Unpaid",
        supplierInvoiceNumber: "",
        categoryId: undefined,
        category: "",
        createdBy: user?.id || 0,
      });
      setNetAmount("0.00");
      setGrossAmount("0.00");
    }
  }, [editingExpense, user]);

  // Fetch suppliers
  const { data: suppliers } = useQuery({
    queryKey: ['/api/suppliers'],
    enabled: open,
  });

  // Fetch bank accounts
  const { data: bankAccounts } = useQuery({
    queryKey: ['/api/bank-accounts'],
    enabled: open,
  });

  // Fetch Chart of Accounts (expense categories only)
  const { data: accounts } = useQuery({
    queryKey: ['/api/chart-of-accounts'],
    enabled: open,
  });

  // Calculate VAT amounts whenever amount or VAT type changes
  useEffect(() => {
    calculateVAT();
  }, [formData.amount, formData.vatType, formData.vatRate]);

  const calculateVAT = () => {
    const amount = parseFloat(formData.amount) || 0;
    const vatRate = parseFloat(formData.vatRate) || 0;

    if (formData.vatType === "No VAT") {
      setNetAmount(amount.toFixed(2));
      setGrossAmount(amount.toFixed(2));
      setFormData(prev => ({ ...prev, vatAmount: "0.00" }));
    } else if (formData.vatType === "Inclusive") {
      const net = amount / (1 + vatRate / 100);
      const vatAmount = amount - net;
      setNetAmount(net.toFixed(2));
      setGrossAmount(amount.toFixed(2));
      setFormData(prev => ({ ...prev, vatAmount: vatAmount.toFixed(2) }));
    } else { // Exclusive
      const vatAmount = (amount * vatRate) / 100;
      const gross = amount + vatAmount;
      setNetAmount(amount.toFixed(2));
      setGrossAmount(gross.toFixed(2));
      setFormData(prev => ({ ...prev, vatAmount: vatAmount.toFixed(2) }));
    }
  };

  const createExpenseMutation = useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      if (editingExpense) {
        return await apiRequest(`/api/expenses/${editingExpense.id}`, 'PUT', data);
      } else {
        return await apiRequest('/api/expenses', 'POST', data);
      }
    },
    onSuccess: () => {
      // Invalidate all expense-related queries with proper cache clearing
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/expenses/metrics'] });
      queryClient.refetchQueries({ queryKey: ['/api/expenses'] });
      queryClient.refetchQueries({ queryKey: ['/api/expenses/metrics'] });
      toast({
        title: editingExpense ? "Expense Updated" : "Expense Created",
        description: editingExpense ? "The expense has been successfully updated." : "The expense has been successfully recorded.",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      let errorMessage = error.message || "Failed to create expense";
      
      // Handle specific error types
      if (error.message?.includes("Supplier invoice number already exists")) {
        errorMessage = "This supplier invoice number is already used. Please use a different invoice number or leave it blank to auto-generate.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      companyId: (user as any)?.companyId || 0,
      description: "",
      amount: "",
      vatType: "No VAT",
      vatRate: "15.00",
      vatAmount: "0.00",
      expenseDate: new Date().toISOString().split('T')[0],
      paidStatus: "Unpaid",
      supplierInvoiceNumber: "",
      categoryId: undefined,
      category: "",
      createdBy: user?.id || 0,
    });
    setNetAmount("0.00");
    setGrossAmount("0.00");
    setSelectedFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields including category",
        variant: "destructive",
      });
      return;
    }

    // Validate bank account is required for paid expenses
    if ((formData.paidStatus === "Paid" || formData.paidStatus === "Partially Paid") && !formData.bankAccountId) {
      toast({
        title: "Bank Account Required",
        description: "Please select a bank account for paid expenses",
        variant: "destructive",
      });
      return;
    }

    createExpenseMutation.mutate(formData);
  };

  const expenseAccounts = (accounts as any)?.filter((account: any) => 
    account.accountType === 'Expense' || account.accountType === 'Cost of Sales'
  ) || [];

  const handleSupplierAdded = (newSupplier: any) => {
    queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
    setFormData(prev => ({ ...prev, supplierId: newSupplier.id }));
    setShowAddSupplier(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {editingExpense ? "Edit Expense" : "Add New Expense"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
            <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4 min-h-0">
              {/* Supplier Field with Quick Add */}
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.supplierId?.toString() || ""}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      supplierId: value ? parseInt(value) : undefined 
                    }))}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {(suppliers as any)?.map((supplier: any) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddSupplier(true)}
                    className="px-3"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Supplier Invoice Number Field */}
              <div className="space-y-2">
                <Label htmlFor="supplierInvoiceNumber">Supplier Invoice Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="supplierInvoiceNumber"
                    value={formData.supplierInvoiceNumber || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplierInvoiceNumber: e.target.value }))}
                    placeholder="Enter supplier's invoice number (optional)"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setFormData(prev => ({ ...prev, supplierInvoiceNumber: "" }))}
                    className="px-3"
                    title="Clear invoice number"
                  >
                    ×
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Optional: Leave blank to avoid duplicate checks. Each supplier invoice number must be unique per company.
                </p>
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter expense description"
                  required
                />
              </div>

              {/* Expense Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Expense Category *</Label>
                <Select
                  value={formData.categoryId?.toString() || ""}
                  onValueChange={(value) => {
                    const selectedAccount = expenseAccounts.find((account: any) => account.id.toString() === value);
                    setFormData(prev => ({ 
                      ...prev, 
                      categoryId: value ? parseInt(value) : undefined,
                      category: selectedAccount ? selectedAccount.accountName : ""
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseAccounts.map((account: any) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.accountName} ({account.accountType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount and VAT Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vatType">VAT Type</Label>
                  <Select
                    value={formData.vatType}
                    onValueChange={(value: "Inclusive" | "Exclusive" | "No VAT") => 
                      setFormData(prev => ({ ...prev, vatType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Exclusive">Exclusive</SelectItem>
                      <SelectItem value="Inclusive">Inclusive</SelectItem>
                      <SelectItem value="No VAT">No VAT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vatRate">VAT Rate (%)</Label>
                  <Input
                    id="vatRate"
                    type="number"
                    step="0.01"
                    value={formData.vatRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, vatRate: e.target.value }))}
                    disabled={formData.vatType === "No VAT"}
                  />
                </div>
              </div>

              {/* VAT Breakdown */}
              <Card className="bg-gray-50 dark:bg-gray-900">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    VAT Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Net Amount:</span>
                    <span className="font-medium">R {netAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>VAT Amount ({formData.vatRate}%):</span>
                    <span className="font-medium">R {formData.vatAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t pt-2">
                    <span>Gross Amount:</span>
                    <span>R {grossAmount}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Date and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expenseDate">Date of Expense *</Label>
                  <Input
                    id="expenseDate"
                    type="date"
                    value={formData.expenseDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expenseDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paidStatus">Paid Status</Label>
                  <Select
                    value={formData.paidStatus}
                    onValueChange={(value: "Paid" | "Unpaid" | "Partially Paid") => 
                      setFormData(prev => ({ ...prev, paidStatus: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Unpaid">Unpaid</SelectItem>
                      <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Bank Account (Required for Paid Status) */}
              {(formData.paidStatus === "Paid" || formData.paidStatus === "Partially Paid") && (
                <div className="space-y-2">
                  <Label htmlFor="bankAccount">Bank Account *</Label>
                  <Select
                    value={formData.bankAccountId?.toString() || ""}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      bankAccountId: value ? parseInt(value) : undefined 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank account" />
                    </SelectTrigger>
                    <SelectContent>
                      {(bankAccounts as any)?.map((account: any) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.accountName} - {account.bankName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Tax Deductible removed - VAT logic and category determine deductibility */}

              {/* File Upload Section */}
              <div className="space-y-2">
                <Label>Upload Invoice/Receipt (PDF, PNG, JPG)</Label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) {
                          toast({
                            title: "File too large",
                            description: "Please select a file smaller than 10MB",
                            variant: "destructive",
                          });
                          return;
                        }
                        setSelectedFile(file);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    id="file-upload"
                  />
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors">
                    <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                    {selectedFile ? (
                      <div>
                        <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                          ✓ {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-400">PDF, PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Bottom Actions */}
            <div className="flex-shrink-0 mt-6 pt-4 border-t bg-background/95 backdrop-blur-sm sticky bottom-0">
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="w-full sm:w-auto order-2 sm:order-1"
                  disabled={createExpenseMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createExpenseMutation.isPending || !formData.description.trim()}
                  className="w-full sm:w-auto order-1 sm:order-2 bg-primary hover:bg-primary/90"
                >
                  {createExpenseMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving Expense...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Save Transaction
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Supplier Modal */}
      <AddSupplierModal
        open={showAddSupplier}
        onOpenChange={setShowAddSupplier}
        onSupplierAdded={handleSupplierAdded}
      />
    </>
  );
}
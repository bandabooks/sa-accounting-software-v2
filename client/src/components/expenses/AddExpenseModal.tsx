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
}

export default function AddExpenseModal({ open, onOpenChange }: AddExpenseModalProps) {
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
    createdBy: user?.id || 0,
  });

  const [netAmount, setNetAmount] = useState("0.00");
  const [grossAmount, setGrossAmount] = useState("0.00");
  const [showAddSupplier, setShowAddSupplier] = useState(false);

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
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create expense');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      toast({
        title: "Expense Created",
        description: "The expense has been successfully recorded.",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create expense",
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
      createdBy: user?.id || 0,
    });
    setNetAmount("0.00");
    setGrossAmount("0.00");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Add New Expense
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto px-1 space-y-3 pb-4">
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
                <Input
                  id="supplierInvoiceNumber"
                  value={formData.supplierInvoiceNumber || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplierInvoiceNumber: e.target.value }))}
                  placeholder="Enter supplier's invoice number (e.g., INV-12345)"
                />
                <p className="text-xs text-muted-foreground">
                  This field helps prevent duplicate entries. Each supplier invoice number must be unique per company.
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
                <Label htmlFor="category">Expense Category</Label>
                <Select
                  value={formData.categoryId?.toString() || ""}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    categoryId: value ? parseInt(value) : undefined 
                  }))}
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

              {/* File Upload Placeholder */}
              <div className="space-y-2">
                <Label>Upload Invoice (PDF, PNG, JPG)</Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500 mb-1">Drag and drop your file here, or click to browse</p>
                  <p className="text-xs text-gray-400">Supported formats: PDF, PNG, JPG (max 10MB)</p>
                </div>
              </div>
            </div>

            {/* Fixed Bottom Actions - Mobile Friendly */}
            <div className="flex-shrink-0 mt-4 pt-3 border-t bg-background/95 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createExpenseMutation.isPending}
                  className="sm:w-auto"
                >
                  {createExpenseMutation.isPending ? "Creating..." : "Create Expense"}
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
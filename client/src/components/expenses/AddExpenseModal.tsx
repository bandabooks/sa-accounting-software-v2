import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Upload, Calculator, DollarSign, Plus, Trash2, Package, Repeat, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import AddSupplierModal from "@/components/suppliers/AddSupplierModal";

interface LineItem {
  id: string;
  description: string;
  categoryId?: number;
  category: string;
  productId?: number;
  productName?: string;
  quantity: number;
  unitPrice: string;
  amount: string;
  vatTypeId?: number;
  vatType: string; // For backward compatibility
  vatRate: string;
  vatAmount: string;
}

interface ExpenseFormData {
  companyId: number;
  supplierId?: number;
  bankAccountId: number; // Required payment account
  description: string;
  categoryId?: number;
  category: string;
  amount: string;
  vatTypeId?: number;
  vatType: string; // For backward compatibility
  vatCalculationMethod: "inclusive" | "exclusive";
  vatRate: string;
  vatAmount: string;
  expenseDate: string;
  paidStatus: "Paid"; // Expenses are always paid on creation
  supplierInvoiceNumber?: string;
  attachmentUrl?: string;
  createdBy: number;
  // Recurring expense fields
  isRecurring: boolean;
  recurringFrequency?: "weekly" | "monthly" | "yearly";
  recurringStartDate?: string;
  recurringEndDate?: string;
  // Line items
  lineItems: LineItem[];
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
    bankAccountId: 0, // Will be set when bank accounts are loaded
    description: "",
    amount: "",
    vatTypeId: undefined,
    vatType: "No VAT",
    vatRate: "15.00",
    vatAmount: "0.00",
    expenseDate: new Date().toISOString().split('T')[0],
    paidStatus: "Paid", // Expenses are always paid on creation
    supplierInvoiceNumber: "",
    categoryId: undefined,
    category: "",
    createdBy: user?.id || 0,
    isRecurring: false,
    recurringFrequency: "monthly",
    recurringStartDate: new Date().toISOString().split('T')[0],
    recurringEndDate: "",
    lineItems: [],
  });

  const [netAmount, setNetAmount] = useState("0.00");
  const [grossAmount, setGrossAmount] = useState("0.00");
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [totalNetAmount, setTotalNetAmount] = useState("0.00");
  const [totalVatAmount, setTotalVatAmount] = useState("0.00");
  const [totalGrossAmount, setTotalGrossAmount] = useState("0.00");

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

  // Effect to set default bank account when bank accounts are loaded
  useEffect(() => {
    if (bankAccounts && (bankAccounts as any).length > 0 && !editingExpense && formData.bankAccountId === 0) {
      setFormData(prev => ({
        ...prev,
        bankAccountId: (bankAccounts as any)[0].id
      }));
    }
  }, [bankAccounts, editingExpense, formData.bankAccountId]);

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
        vatTypeId: editingExpense.vatTypeId,
        vatType: editingExpense.vatType,
        vatRate: editingExpense.vatRate,
        vatAmount: editingExpense.vatAmount,
        expenseDate: editingExpense.expenseDate.split('T')[0],
        paidStatus: "Paid", // Always "Paid" for expenses
        supplierInvoiceNumber: editingExpense.supplierInvoiceNumber || "",
        createdBy: editingExpense.createdBy,
        isRecurring: false,
        recurringFrequency: "monthly",
        recurringStartDate: new Date().toISOString().split('T')[0],
        recurringEndDate: "",
        lineItems: [],
      });
      setNetAmount(editingExpense.amount);
      setGrossAmount((parseFloat(editingExpense.amount) + parseFloat(editingExpense.vatAmount)).toFixed(2));
    } else {
      // Reset form for new expense
      setFormData({
        companyId: (user as any)?.companyId || 0,
        bankAccountId: 0, // Will be set by useEffect when accounts load
        description: "",
        amount: "",
        vatType: "No VAT",
        vatRate: "15.00",
        vatAmount: "0.00",
        expenseDate: new Date().toISOString().split('T')[0],
        paidStatus: "Paid", // Expenses are always paid on creation
        supplierInvoiceNumber: "",
        categoryId: undefined,
        category: "",
        createdBy: user?.id || 0,
        isRecurring: false,
        recurringFrequency: "monthly",
        recurringStartDate: new Date().toISOString().split('T')[0],
        recurringEndDate: "",
        lineItems: [],
      });
      setNetAmount("0.00");
      setGrossAmount("0.00");
    }
  }, [editingExpense, user, bankAccounts]);

  // Fetch Chart of Accounts (expense categories only)
  const { data: accounts } = useQuery({
    queryKey: ['/api/chart-of-accounts'],
    enabled: open,
  });

  // Fetch Products
  const { data: products } = useQuery({
    queryKey: ['/api/products'],
    enabled: open,
  });

  // Fetch VAT Types (Global VAT system - same as invoices)
  const { data: vatTypes } = useQuery({
    queryKey: ['/api/vat-types'],
    enabled: open,
  });

  // Calculate VAT amounts whenever amount or VAT type changes (using global VAT system)
  useEffect(() => {
    calculateVAT();
  }, [formData.amount, formData.vatTypeId, vatTypes]);

  const calculateVAT = () => {
    const amount = parseFloat(formData.amount) || 0;

    if (!formData.vatTypeId || !vatTypes) {
      // No VAT selected
      setNetAmount(amount.toFixed(2));
      setGrossAmount(amount.toFixed(2));
      setFormData(prev => ({ ...prev, vatAmount: "0.00", vatRate: "0.00" }));
      return;
    }

    // Find VAT type from global VAT system
    const vatType = (vatTypes as any)?.find((type: any) => type.id === formData.vatTypeId);
    if (!vatType) {
      setNetAmount(amount.toFixed(2));
      setGrossAmount(amount.toFixed(2));
      setFormData(prev => ({ ...prev, vatAmount: "0.00", vatRate: "0.00" }));
      return;
    }

    const vatRate = parseFloat(vatType.rate || "0");
    
    // Update VAT rate in form data
    setFormData(prev => ({ ...prev, vatRate: vatRate.toFixed(2) }));

    if (vatRate === 0) {
      // Zero-rated or exempt VAT
      setNetAmount(amount.toFixed(2));
      setGrossAmount(amount.toFixed(2));
      setFormData(prev => ({ ...prev, vatAmount: "0.00" }));
    } else {
      // Standard VAT calculation (exclusive method for expenses)
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
      isRecurring: false,
      recurringFrequency: "monthly",
      recurringStartDate: new Date().toISOString().split('T')[0],
      recurringEndDate: "",
      lineItems: [],
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

    // Validate bank account is required for all expenses
    if (!formData.bankAccountId) {
      toast({
        title: "Payment Account Required",
        description: "Please select a payment account for this expense",
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

  // Line item management functions
  const addLineItem = () => {
    const newLineItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      categoryId: undefined,
      category: "",
      productId: undefined,
      productName: "",
      quantity: 1,
      unitPrice: "0.00",
      amount: "0.00",
      vatType: "No VAT",
      vatRate: "15.00",
      vatAmount: "0.00",
    };
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, newLineItem]
    }));
  };

  const removeLineItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(item => item.id !== id)
    }));
  };

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    }));
  };

  const calculateLineItemAmount = (lineItem: LineItem) => {
    const quantity = lineItem.quantity || 1;
    const unitPrice = parseFloat(lineItem.unitPrice) || 0;
    const amount = quantity * unitPrice;
    const vatRate = parseFloat(lineItem.vatRate) || 0;

    let netAmount, vatAmount, grossAmount;

    if (lineItem.vatType === "No VAT") {
      netAmount = amount;
      vatAmount = 0;
      grossAmount = amount;
    } else if (lineItem.vatType === "Inclusive") {
      netAmount = amount / (1 + vatRate / 100);
      vatAmount = amount - netAmount;
      grossAmount = amount;
    } else { // Exclusive
      netAmount = amount;
      vatAmount = (amount * vatRate) / 100;
      grossAmount = amount + vatAmount;
    }

    return {
      amount: netAmount.toFixed(2),
      vatAmount: vatAmount.toFixed(2),
      grossAmount: grossAmount.toFixed(2)
    };
  };

  // Calculate totals from line items
  useEffect(() => {
    if (formData.lineItems.length > 0) {
      let totalNet = 0;
      let totalVat = 0;
      let totalGross = 0;

      formData.lineItems.forEach(item => {
        const calculated = calculateLineItemAmount(item);
        totalNet += parseFloat(calculated.amount);
        totalVat += parseFloat(calculated.vatAmount);
        totalGross += parseFloat(calculated.grossAmount);
      });

      setTotalNetAmount(totalNet.toFixed(2));
      setTotalVatAmount(totalVat.toFixed(2));
      setTotalGrossAmount(totalGross.toFixed(2));

      // Update main form data with totals
      setFormData(prev => ({
        ...prev,
        amount: totalNet.toFixed(2),
        vatAmount: totalVat.toFixed(2)
      }));
    }
  }, [formData.lineItems]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {editingExpense ? "Edit Expense" : "Add New Expense"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
            <div className="flex-1 overflow-y-auto px-2 py-4 min-h-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Basic Details
                  </TabsTrigger>
                  <TabsTrigger value="line-items" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Line Items
                  </TabsTrigger>
                  <TabsTrigger value="recurring" className="flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    Recurring Options
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
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

              {/* Recurring Expense Checkbox */}
              <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg border">
                <Checkbox
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isRecurring: checked as boolean }))
                  }
                />
                <Label htmlFor="isRecurring" className="text-sm font-medium">
                  Make this a recurring expense
                </Label>
                <div className="ml-auto">
                  {formData.isRecurring && (
                    <Select
                      value={formData.recurringFrequency}
                      onValueChange={(value: "weekly" | "monthly" | "yearly") =>
                        setFormData(prev => ({ ...prev, recurringFrequency: value }))
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
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
                    value={formData.vatTypeId?.toString() || ""}
                    onValueChange={(value) => {
                      const vatTypeId = value ? parseInt(value) : undefined;
                      const vatType = (vatTypes as any)?.find((type: any) => type.id === vatTypeId);
                      setFormData(prev => ({ 
                        ...prev, 
                        vatTypeId,
                        vatType: vatType ? `${vatType.name} (${vatType.rate}%)` : "No VAT"
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select VAT type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No VAT</SelectItem>
                      {(vatTypes as any)?.map((vatType: any) => (
                        <SelectItem key={vatType.id} value={vatType.id.toString()}>
                          {vatType.name} ({vatType.rate}%)
                        </SelectItem>
                      ))}
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

              {/* Date and Payment Account */}
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
                  <Label htmlFor="bankAccount">Payment Account *</Label>
                  <Select
                    value={formData.bankAccountId?.toString() || ""}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      bankAccountId: value ? parseInt(value) : 0 
                    }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment account" />
                    </SelectTrigger>
                    <SelectContent>
                      {(bankAccounts as any)?.map((account: any) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.accountName} - {account.bankName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">The bank or cash account used for this payment</p>
                </div>
              </div>

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
                </TabsContent>

                <TabsContent value="line-items" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Line Items</h3>
                      <p className="text-sm text-gray-600">Add multiple expense items with products or categories</p>
                    </div>
                    <Button
                      type="button"
                      onClick={addLineItem}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Line Item
                    </Button>
                  </div>

                  {formData.lineItems.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px]">Description</TableHead>
                            <TableHead className="w-[150px]">Category/Product</TableHead>
                            <TableHead className="w-[80px]">Qty</TableHead>
                            <TableHead className="w-[100px]">Unit Price</TableHead>
                            <TableHead className="w-[80px]">VAT Type</TableHead>
                            <TableHead className="w-[80px]">VAT Rate</TableHead>
                            <TableHead className="w-[100px]">Net Amount</TableHead>
                            <TableHead className="w-[100px]">VAT Amount</TableHead>
                            <TableHead className="w-[100px]">Total</TableHead>
                            <TableHead className="w-[50px]">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.lineItems.map((item) => {
                            const calculated = calculateLineItemAmount(item);
                            return (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <Input
                                    value={item.description}
                                    onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                                    placeholder="Item description"
                                    className="w-full"
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-2">
                                    <Select
                                      value={item.productId ? `product-${item.productId}` : item.categoryId ? `category-${item.categoryId}` : ""}
                                      onValueChange={(value) => {
                                        if (value.startsWith('product-')) {
                                          const productId = parseInt(value.replace('product-', ''));
                                          const product = (products as any)?.find((p: any) => p.id === productId);
                                          updateLineItem(item.id, {
                                            productId,
                                            productName: product?.name || "",
                                            categoryId: undefined,
                                            category: "",
                                            unitPrice: product?.price || "0.00"
                                          });
                                        } else if (value.startsWith('category-')) {
                                          const categoryId = parseInt(value.replace('category-', ''));
                                          const account = expenseAccounts.find((a: any) => a.id === categoryId);
                                          updateLineItem(item.id, {
                                            categoryId,
                                            category: account?.accountName || "",
                                            productId: undefined,
                                            productName: ""
                                          });
                                        }
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select category or product" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <div className="px-2 py-1 text-xs font-semibold text-gray-500">Products</div>
                                        {(products as any)?.map((product: any) => (
                                          <SelectItem key={`product-${product.id}`} value={`product-${product.id}`}>
                                            📦 {product.name} - R{product.price}
                                          </SelectItem>
                                        ))}
                                        <div className="px-2 py-1 text-xs font-semibold text-gray-500 border-t mt-1 pt-2">Categories</div>
                                        {expenseAccounts.map((account: any) => (
                                          <SelectItem key={`category-${account.id}`} value={`category-${account.id}`}>
                                            📁 {account.accountName}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    value={item.quantity}
                                    onChange={(e) => updateLineItem(item.id, { quantity: parseFloat(e.target.value) || 1 })}
                                    className="w-full"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={item.unitPrice}
                                    onChange={(e) => updateLineItem(item.id, { unitPrice: e.target.value })}
                                    className="w-full"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={item.vatType}
                                    onValueChange={(value: "Inclusive" | "Exclusive" | "No VAT") =>
                                      updateLineItem(item.id, { vatType: value })
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
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={item.vatRate}
                                    onChange={(e) => updateLineItem(item.id, { vatRate: e.target.value })}
                                    disabled={item.vatType === "No VAT"}
                                    className="w-full"
                                  />
                                </TableCell>
                                <TableCell>
                                  <span className="font-medium">R {calculated.amount}</span>
                                </TableCell>
                                <TableCell>
                                  <span className="font-medium">R {calculated.vatAmount}</span>
                                </TableCell>
                                <TableCell>
                                  <span className="font-bold">R {calculated.grossAmount}</span>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeLineItem(item.id)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>

                      {/* Line Items Totals */}
                      <div className="bg-gray-50 p-4 border-t">
                        <div className="flex justify-end space-x-8">
                          <div className="text-sm">
                            <span className="text-gray-600">Net Total: </span>
                            <span className="font-semibold">R {totalNetAmount}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">VAT Total: </span>
                            <span className="font-semibold">R {totalVatAmount}</span>
                          </div>
                          <div className="text-lg">
                            <span className="text-gray-600">Grand Total: </span>
                            <span className="font-bold">R {totalGrossAmount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No line items added yet. Click "Add Line Item" to get started.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="recurring" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">Recurring Expense Settings</h3>
                      <p className="text-sm text-gray-600">Configure automatic recurring for this expense</p>
                    </div>

                    <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg border">
                      <Checkbox
                        id="isRecurringTab"
                        checked={formData.isRecurring}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, isRecurring: checked as boolean }))
                        }
                      />
                      <Label htmlFor="isRecurringTab" className="text-sm font-medium">
                        Enable recurring expense
                      </Label>
                    </div>

                    {formData.isRecurring && (
                      <div className="space-y-4 p-4 border rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="frequency">Frequency</Label>
                            <Select
                              value={formData.recurringFrequency}
                              onValueChange={(value: "weekly" | "monthly" | "yearly") =>
                                setFormData(prev => ({ ...prev, recurringFrequency: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={formData.recurringStartDate}
                              onChange={(e) => setFormData(prev => ({ ...prev, recurringStartDate: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate">End Date (Optional)</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={formData.recurringEndDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, recurringEndDate: e.target.value }))}
                            placeholder="Leave blank for indefinite recurring"
                          />
                        </div>

                        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                          <div className="flex items-start gap-2">
                            <Calendar className="h-4 w-4 text-yellow-600 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-medium text-yellow-800">Recurring Schedule</p>
                              <p className="text-yellow-700">
                                This expense will be automatically created every{" "}
                                <span className="font-semibold">{formData.recurringFrequency}</span>
                                {formData.recurringStartDate && (
                                  <> starting from <span className="font-semibold">{formData.recurringStartDate}</span></>
                                )}
                                {formData.recurringEndDate && (
                                  <> until <span className="font-semibold">{formData.recurringEndDate}</span></>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
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
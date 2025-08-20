import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Package, Repeat, FileText } from "lucide-react";

interface ExpenseFormData {
  companyId: number;
  supplierId?: number;
  bankAccountId: number;
  description: string;
  categoryId?: number;
  amount: string;
  vatTypeId?: number;
  vatCalculationMethod: "inclusive" | "exclusive";
  vatRate: string;
  vatAmount: string;
  expenseDate: string;
  supplierInvoiceNumber: string;
  createdBy: number;
}

interface AddExpenseModalVATProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingExpense?: any;
}

export default function AddExpenseModalVAT({ open, onOpenChange, editingExpense }: AddExpenseModalVATProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<ExpenseFormData>({
    companyId: (user as any)?.companyId || 0,
    bankAccountId: 0,
    description: "",
    amount: "",
    vatTypeId: undefined,
    vatCalculationMethod: "exclusive", // Default to exclusive like invoices
    vatRate: "0.00",
    vatAmount: "0.00",
    expenseDate: new Date().toISOString().split('T')[0],
    supplierInvoiceNumber: "",
    createdBy: user?.id || 0,
  });

  const [netAmount, setNetAmount] = useState("0.00");
  const [grossAmount, setGrossAmount] = useState("0.00");

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

  // Fetch Chart of Accounts (expense categories)
  const { data: accounts } = useQuery({
    queryKey: ['/api/chart-of-accounts'],
    enabled: open,
  });

  // Fetch VAT Types (Global VAT system - same as invoices)
  const { data: vatTypes } = useQuery({
    queryKey: ['/api/vat-types'],
    enabled: open,
  });

  // Calculate VAT using the same logic as invoices
  useEffect(() => {
    calculateVAT();
  }, [formData.amount, formData.vatTypeId, formData.vatCalculationMethod, vatTypes]);

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
      // VAT calculation using the same logic as invoices
      let calculatedVAT = 0;
      let netAmt = 0;
      let grossAmt = 0;

      if (formData.vatCalculationMethod === 'inclusive') {
        // For inclusive method: VAT = amount * (rate / (100 + rate))
        calculatedVAT = amount * (vatRate / (100 + vatRate));
        netAmt = amount - calculatedVAT;
        grossAmt = amount;
      } else {
        // For exclusive method: VAT = amount * (rate / 100)
        calculatedVAT = amount * (vatRate / 100);
        netAmt = amount;
        grossAmt = amount + calculatedVAT;
      }

      setNetAmount(netAmt.toFixed(2));
      setGrossAmount(grossAmt.toFixed(2));
      setFormData(prev => ({ ...prev, vatAmount: calculatedVAT.toFixed(2) }));
    }
  };

  const expenseAccounts = (accounts as any)?.filter((account: any) => 
    ["Expense", "Cost of Sales", "Other Expense"].includes(account.accountType)
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description || !formData.amount || !formData.categoryId || !formData.bankAccountId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        ...formData,
        amount: netAmount, // Use net amount for the expense
        vatAmount: formData.vatAmount,
        total: grossAmount, // Total including VAT
      };

      await createExpenseMutation.mutateAsync(payload);
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  };

  const createExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingExpense) {
        return await apiRequest(`/api/expenses/${editingExpense.id}`, 'PUT', data);
      } else {
        return await apiRequest('/api/expenses', 'POST', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      toast({
        title: "Success",
        description: `Expense ${editingExpense ? 'updated' : 'created'} successfully.`,
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || `Failed to ${editingExpense ? 'update' : 'create'} expense.`,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {editingExpense ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
          <div className="flex-1 overflow-y-auto px-2 py-4 min-h-0 space-y-4">
            {/* Basic Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Basic Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Supplier */}
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Select
                    value={formData.supplierId?.toString() || ""}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      supplierId: value ? parseInt(value) : undefined 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-supplier">No Supplier</SelectItem>
                      {(suppliers as any)?.map((supplier: any) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
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
                      setFormData(prev => ({ 
                        ...prev, 
                        categoryId: value ? parseInt(value) : undefined,
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

                {/* Bank Account */}
                <div className="space-y-2">
                  <Label htmlFor="bankAccount">Payment Account *</Label>
                  <Select
                    value={formData.bankAccountId?.toString() || ""}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      bankAccountId: parseInt(value) 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment account" />
                    </SelectTrigger>
                    <SelectContent>
                      {(bankAccounts as any)?.map((account: any) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.accountName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount and VAT Section - Same as invoices */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="vatCalculationMethod">VAT Calculation Method</Label>
                    <Select
                      value={formData.vatCalculationMethod}
                      onValueChange={(value: "inclusive" | "exclusive") => 
                        setFormData(prev => ({ ...prev, vatCalculationMethod: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exclusive">Exclusive (Add VAT)</SelectItem>
                        <SelectItem value="inclusive">Inclusive (VAT included)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vatType">VAT Type</Label>
                    <Select
                      value={formData.vatTypeId?.toString() || "no-vat"}
                      onValueChange={(value) => {
                        if (value === "no-vat") {
                          setFormData(prev => ({ 
                            ...prev, 
                            vatTypeId: undefined,
                          }));
                        } else {
                          const vatTypeId = parseInt(value);
                          setFormData(prev => ({ 
                            ...prev, 
                            vatTypeId,
                          }));
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select VAT type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-vat">No VAT</SelectItem>
                        {(vatTypes as any)?.map((vatType: any) => (
                          <SelectItem key={vatType.id} value={vatType.id.toString()}>
                            {vatType.name} ({vatType.rate}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expenseDate">Expense Date *</Label>
                    <Input
                      id="expenseDate"
                      type="date"
                      value={formData.expenseDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, expenseDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* VAT Summary - Same as invoices */}
                {formData.vatTypeId && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">VAT Summary</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Net Amount:</span>
                        <p className="font-medium">R{netAmount}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">VAT Amount:</span>
                        <p className="font-medium">R{formData.vatAmount}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Amount:</span>
                        <p className="font-medium">R{grossAmount}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Supplier Invoice Number */}
                <div className="space-y-2">
                  <Label htmlFor="supplierInvoiceNumber">Supplier Invoice Number</Label>
                  <Input
                    id="supplierInvoiceNumber"
                    value={formData.supplierInvoiceNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplierInvoiceNumber: e.target.value }))}
                    placeholder="Optional supplier invoice reference"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex-shrink-0 flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createExpenseMutation.isPending}
            >
              {createExpenseMutation.isPending 
                ? `${editingExpense ? 'Updating' : 'Creating'}...` 
                : `${editingExpense ? 'Update' : 'Create'} Expense`
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
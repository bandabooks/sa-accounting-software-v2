import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Upload, Calculator, DollarSign } from "lucide-react";

interface ExpenseFormData {
  companyId: number;
  supplierId?: number;
  description: string;
  categoryId?: number;
  amount: string;
  vatType: "Inclusive" | "Exclusive" | "No VAT";
  vatRate: string;
  vatAmount: string;
  expenseDate: string;
  isPaid: boolean;
  taxDeductible: boolean;
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
    companyId: user?.companyId || 0,
    description: "",
    amount: "",
    vatType: "No VAT",
    vatRate: "15.00",
    vatAmount: "0.00",
    expenseDate: new Date().toISOString().split('T')[0],
    isPaid: false,
    taxDeductible: true,
    createdBy: user?.id || 0,
  });

  const [netAmount, setNetAmount] = useState("0.00");
  const [grossAmount, setGrossAmount] = useState("0.00");

  // Fetch suppliers
  const { data: suppliers } = useQuery({
    queryKey: ['/api/suppliers'],
    enabled: open,
  });

  // Fetch Chart of Accounts (expense categories only)
  const { data: accounts } = useQuery({
    queryKey: ['/api/chart-of-accounts'],
    enabled: open,
  });

  // Fetch companies for multi-company dropdown
  const { data: companies } = useQuery({
    queryKey: ['/api/companies/my'],
    enabled: open && user?.role === 'super_admin',
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
      companyId: user?.companyId || 0,
      description: "",
      amount: "",
      vatType: "No VAT",
      vatRate: "15.00",
      vatAmount: "0.00",
      expenseDate: new Date().toISOString().split('T')[0],
      isPaid: false,
      taxDeductible: true,
      createdBy: user?.id || 0,
    });
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
    createExpenseMutation.mutate(formData);
  };

  const expenseAccounts = accounts?.filter((account: any) => 
    account.accountType === 'Expense' || account.accountType === 'Cost of Sales'
  ) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Add New Expense
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Multi-company dropdown - only show for super_admin */}
            {user?.role === 'super_admin' && companies && (
              <div className="md:col-span-2">
                <Label htmlFor="companyId">Client/Company *</Label>
                <Select 
                  value={formData.companyId.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, companyId: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company: any) => (
                      <SelectItem key={company.companyId} value={company.companyId.toString()}>
                        {company.company?.name || company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Supplier dropdown */}
            <div>
              <Label htmlFor="supplierId">Supplier</Label>
              <Select 
                value={formData.supplierId?.toString() || ""}
                onValueChange={(value) => setFormData(prev => ({ ...prev, supplierId: value ? parseInt(value) : undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers?.map((supplier: any) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="categoryId">Category</Label>
              <Select 
                value={formData.categoryId?.toString() || ""}
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value ? parseInt(value) : undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseAccounts.map((account: any) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.accountCode} - {account.accountName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Expense Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter expense description"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Amount */}
            <div>
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

            {/* VAT Type */}
            <div>
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
                  <SelectItem value="No VAT">No VAT</SelectItem>
                  <SelectItem value="Inclusive">Inclusive</SelectItem>
                  <SelectItem value="Exclusive">Exclusive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* VAT Rate */}
            <div>
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

          {/* VAT Breakdown Card */}
          {formData.vatType !== "No VAT" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Calculator className="h-4 w-4" />
                  VAT Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Net Amount:</span>
                  <span>R {netAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>VAT Amount ({formData.vatRate}%):</span>
                  <span>R {formData.vatAmount}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Gross Amount:</span>
                  <span>R {grossAmount}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <Label htmlFor="expenseDate">Date of Expense *</Label>
              <Input
                id="expenseDate"
                type="date"
                value={formData.expenseDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expenseDate: e.target.value }))}
                required
              />
            </div>

            {/* Paid Status */}
            <div>
              <Label htmlFor="isPaid">Paid Status</Label>
              <Select 
                value={formData.isPaid.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, isPaid: value === "true" }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Unpaid</SelectItem>
                  <SelectItem value="true">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="taxDeductible"
                checked={formData.taxDeductible}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, taxDeductible: checked === true }))
                }
              />
              <Label htmlFor="taxDeductible">Tax Deductible</Label>
            </div>
          </div>

          {/* File upload placeholder */}
          <div>
            <Label>Upload Invoice (PDF, PNG, or JPG)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, PNG, JPG (max 10MB)
              </p>
            </div>
          </div>

          {/* Form actions */}
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createExpenseMutation.isPending}
            >
              {createExpenseMutation.isPending ? "Creating..." : "Create Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
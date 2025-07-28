import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Banknote, 
  Plus, 
  Save, 
  Trash2, 
  Eye,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Activity,
  DollarSign,
  Calendar,
  Building
} from "lucide-react";
import { format } from "date-fns";

interface ExpenseEntry {
  id?: number;
  transactionDate: string;
  categoryId: number;
  description: string;
  amount: string;
  supplierId?: number;
  vatTransactionType: string;
  vatRate: string;
  vatAmount: string;
  netAmount: string;
  bankAccountId?: number;
  reference?: string;
  notes?: string;
  status: string;
}

interface IncomeEntry {
  id?: number;
  transactionDate: string;
  incomeAccountId: number;
  description: string;
  amount: string;
  clientId?: number;
  vatTransactionType: string;
  vatRate: string;
  vatAmount: string;
  netAmount: string;
  bankAccountId?: number;
  reference?: string;
  notes?: string;
  status: string;
}

interface BulkSession {
  id: number;
  batchId: string;
  sessionType: string;
  status: string;
  totalEntries: number;
  processedEntries: number;
  batchNotes?: string;
  createdAt: string;
  updatedAt: string;
}

const BulkCapture = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get active company information
  const { data: activeCompany } = useQuery({
    queryKey: ["/api/auth/user"],
    select: (data: any) => data?.activeCompany || { id: 2, name: "Default Company" }
  });
  
  const [activeTab, setActiveTab] = useState<'income' | 'expense' | 'bank_import' | 'sessions'>('expense');
  const [expenseEntries, setExpenseEntries] = useState<ExpenseEntry[]>([]);
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [batchNotes, setBatchNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch chart of accounts for expense/income categorization
  const { data: chartOfAccounts = [] } = useQuery({
    queryKey: ['/api/chart-of-accounts'],
  });

  // Fetch suppliers for expense entries
  const { data: suppliers = [] } = useQuery({
    queryKey: ['/api/suppliers'],
  });

  // Fetch customers for income entries
  const { data: customers = [] } = useQuery({
    queryKey: ['/api/customers'],
  });

  // Fetch bank accounts
  const { data: bankAccounts = [] } = useQuery({
    queryKey: ['/api/bank-accounts'],
  });

  // Fetch bulk capture sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ['/api/bulk-capture/sessions'],
  });

  // Mutation for creating bulk session
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: {
      sessionType: string;
      totalEntries: number;
      batchNotes?: string;
      entries: ExpenseEntry[] | IncomeEntry[];
    }) => {
      return await apiRequest({
        method: 'POST',
        url: '/api/bulk-capture/sessions',
        data: sessionData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bulk-capture/sessions'] });
      toast({
        title: "Bulk Session Created",
        description: "Your bulk capture session has been created successfully.",
      });
      // Reset entries
      setExpenseEntries([]);
      setIncomeEntries([]);
      setBatchNotes('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create bulk session",
        variant: "destructive",
      });
    },
  });

  // Add new expense entry
  const addExpenseEntry = useCallback(() => {
    const newEntry: ExpenseEntry = {
      transactionDate: format(new Date(), 'yyyy-MM-dd'),
      categoryId: 0,
      description: '',
      amount: '',
      vatTransactionType: 'vat_inclusive',
      vatRate: '15.00',
      vatAmount: '0.00',
      netAmount: '0.00',
      status: 'draft',
    };
    setExpenseEntries(prev => [...prev, newEntry]);
  }, []);

  // Add new income entry
  const addIncomeEntry = useCallback(() => {
    const newEntry: IncomeEntry = {
      transactionDate: format(new Date(), 'yyyy-MM-dd'),
      incomeAccountId: 0,
      description: '',
      amount: '',
      vatTransactionType: 'vat_inclusive',
      vatRate: '15.00',
      vatAmount: '0.00',
      netAmount: '0.00',
      status: 'draft',
    };
    setIncomeEntries(prev => [...prev, newEntry]);
  }, []);

  // Calculate VAT amounts when amount or VAT rate changes
  const calculateVAT = useCallback((amount: string, vatRate: string, vatType: string) => {
    const amountNum = parseFloat(amount) || 0;
    const rateNum = parseFloat(vatRate) || 0;

    if (vatType === 'vat_inclusive') {
      const vatAmount = (amountNum * rateNum) / (100 + rateNum);
      const netAmount = amountNum - vatAmount;
      return {
        vatAmount: vatAmount.toFixed(2),
        netAmount: netAmount.toFixed(2),
      };
    } else if (vatType === 'vat_exclusive') {
      const vatAmount = (amountNum * rateNum) / 100;
      const netAmount = amountNum;
      return {
        vatAmount: vatAmount.toFixed(2),
        netAmount: netAmount.toFixed(2),
      };
    } else {
      return {
        vatAmount: '0.00',
        netAmount: amount,
      };
    }
  }, []);

  // Update expense entry
  const updateExpenseEntry = useCallback((index: number, field: keyof ExpenseEntry, value: any) => {
    setExpenseEntries(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Recalculate VAT if amount, rate, or type changes
      if (field === 'amount' || field === 'vatRate' || field === 'vatTransactionType') {
        const entry = updated[index];
        const calculations = calculateVAT(entry.amount, entry.vatRate, entry.vatTransactionType);
        updated[index].vatAmount = calculations.vatAmount;
        updated[index].netAmount = calculations.netAmount;
      }

      return updated;
    });
  }, [calculateVAT]);

  // Update income entry
  const updateIncomeEntry = useCallback((index: number, field: keyof IncomeEntry, value: any) => {
    setIncomeEntries(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Recalculate VAT if amount, rate, or type changes
      if (field === 'amount' || field === 'vatRate' || field === 'vatTransactionType') {
        const entry = updated[index];
        const calculations = calculateVAT(entry.amount, entry.vatRate, entry.vatTransactionType);
        updated[index].vatAmount = calculations.vatAmount;
        updated[index].netAmount = calculations.netAmount;
      }

      return updated;
    });
  }, [calculateVAT]);

  // Remove entry
  const removeExpenseEntry = useCallback((index: number) => {
    setExpenseEntries(prev => prev.filter((_, i) => i !== index));
  }, []);

  const removeIncomeEntry = useCallback((index: number) => {
    setIncomeEntries(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Submit bulk session
  const handleSubmit = useCallback(() => {
    const entries = activeTab === 'expense' ? expenseEntries : incomeEntries;
    
    if (entries.length === 0) {
      toast({
        title: "No Entries",
        description: "Please add at least one entry before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Validate entries
    const validEntries = entries.filter(entry => 
      entry.description && 
      entry.amount && 
      (activeTab === 'expense' ? entry.categoryId : entry.incomeAccountId)
    );

    if (validEntries.length !== entries.length) {
      toast({
        title: "Incomplete Entries",
        description: "Please complete all required fields for all entries.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    createSessionMutation.mutate({
      sessionType: activeTab,
      totalEntries: validEntries.length,
      batchNotes,
      entries: validEntries,
    });
    setIsProcessing(false);
  }, [activeTab, expenseEntries, incomeEntries, batchNotes, createSessionMutation, toast]);

  // Get expense accounts
  const expenseAccounts = chartOfAccounts.filter((account: any) => 
    account.accountType === 'Expense' || account.accountType === 'Cost of Goods Sold'
  );

  // Get income accounts
  const incomeAccounts = chartOfAccounts.filter((account: any) => 
    account.accountType === 'Revenue' || account.accountType === 'Income'
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bulk Capture</h1>
          <p className="text-muted-foreground">Efficiently capture multiple transactions at once</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'expense' ? 'default' : 'outline'}
            onClick={() => setActiveTab('expense')}
          >
            <TrendingDown className="w-4 h-4 mr-2" />
            Expenses
          </Button>
          <Button
            variant={activeTab === 'income' ? 'default' : 'outline'}
            onClick={() => setActiveTab('income')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Income
          </Button>
          <Button
            variant={activeTab === 'bank_import' ? 'default' : 'outline'}
            onClick={() => setActiveTab('bank_import')}
          >
            <Banknote className="w-4 h-4 mr-2" />
            Bank Import
          </Button>
          <Button
            variant={activeTab === 'sessions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('sessions')}
          >
            <Activity className="w-4 h-4 mr-2" />
            Sessions
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">{sessions.filter((s: BulkSession) => s.status === 'processing').length}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold">{sessions.filter((s: BulkSession) => 
                  s.status === 'completed' && 
                  format(new Date(s.createdAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                ).length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold">{activeTab === 'expense' ? expenseEntries.length : incomeEntries.length}</p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estimated Total</p>
                <p className="text-2xl font-bold">
                  R {activeTab === 'expense' 
                    ? expenseEntries.reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0).toFixed(2)
                    : incomeEntries.reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0).toFixed(2)
                  }
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {activeTab === 'expense' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Bulk Expense Capture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Batch Notes */}
            <div>
              <Label htmlFor="batchNotes">Batch Notes</Label>
              <Textarea
                id="batchNotes"
                placeholder="Enter notes for this batch..."
                value={batchNotes}
                onChange={(e) => setBatchNotes(e.target.value)}
              />
            </div>

            {/* Add Entry Button */}
            <Button onClick={addExpenseEntry} className="mb-4">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense Entry
            </Button>

            {/* Expense Entries */}
            <div className="space-y-4">
              {expenseEntries.map((entry, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={entry.transactionDate}
                        onChange={(e) => updateExpenseEntry(index, 'transactionDate', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={entry.categoryId.toString()}
                        onValueChange={(value) => updateExpenseEntry(index, 'categoryId', parseInt(value))}
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

                    <div>
                      <Label>Description</Label>
                      <Input
                        placeholder="Description"
                        value={entry.description}
                        onChange={(e) => updateExpenseEntry(index, 'description', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={entry.amount}
                        onChange={(e) => updateExpenseEntry(index, 'amount', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>VAT Type</Label>
                      <Select
                        value={entry.vatTransactionType}
                        onValueChange={(value) => updateExpenseEntry(index, 'vatTransactionType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vat_inclusive">VAT Inclusive</SelectItem>
                          <SelectItem value="vat_exclusive">VAT Exclusive</SelectItem>
                          <SelectItem value="zero_rated">Zero Rated</SelectItem>
                          <SelectItem value="exempt">Exempt</SelectItem>
                          <SelectItem value="no_vat">No VAT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end gap-2">
                      <div className="text-sm text-muted-foreground">
                        VAT: R{entry.vatAmount}<br />
                        Net: R{entry.netAmount}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeExpenseEntry(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Submit Button */}
            {expenseEntries.length > 0 && (
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setExpenseEntries([])}>
                  Clear All
                </Button>
                <Button onClick={handleSubmit} disabled={isProcessing}>
                  <Save className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Submit Bulk Expenses'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'income' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Bulk Income Capture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Batch Notes */}
            <div>
              <Label htmlFor="batchNotes">Batch Notes</Label>
              <Textarea
                id="batchNotes"
                placeholder="Enter notes for this batch..."
                value={batchNotes}
                onChange={(e) => setBatchNotes(e.target.value)}
              />
            </div>

            {/* Add Entry Button */}
            <Button onClick={addIncomeEntry} className="mb-4">
              <Plus className="w-4 h-4 mr-2" />
              Add Income Entry
            </Button>

            {/* Income Entries */}
            <div className="space-y-4">
              {incomeEntries.map((entry, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={entry.transactionDate}
                        onChange={(e) => updateIncomeEntry(index, 'transactionDate', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label>Income Account</Label>
                      <Select
                        value={entry.incomeAccountId.toString()}
                        onValueChange={(value) => updateIncomeEntry(index, 'incomeAccountId', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {incomeAccounts.map((account: any) => (
                            <SelectItem key={account.id} value={account.id.toString()}>
                              {account.accountCode} - {account.accountName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Input
                        placeholder="Description"
                        value={entry.description}
                        onChange={(e) => updateIncomeEntry(index, 'description', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={entry.amount}
                        onChange={(e) => updateIncomeEntry(index, 'amount', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>VAT Type</Label>
                      <Select
                        value={entry.vatTransactionType}
                        onValueChange={(value) => updateIncomeEntry(index, 'vatTransactionType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vat_inclusive">VAT Inclusive</SelectItem>
                          <SelectItem value="vat_exclusive">VAT Exclusive</SelectItem>
                          <SelectItem value="zero_rated">Zero Rated</SelectItem>
                          <SelectItem value="exempt">Exempt</SelectItem>
                          <SelectItem value="no_vat">No VAT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end gap-2">
                      <div className="text-sm text-muted-foreground">
                        VAT: R{entry.vatAmount}<br />
                        Net: R{entry.netAmount}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeIncomeEntry(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Submit Button */}
            {incomeEntries.length > 0 && (
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIncomeEntries([])}>
                  Clear All
                </Button>
                <Button onClick={handleSubmit} disabled={isProcessing}>
                  <Save className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Submit Bulk Income'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'bank_import' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5" />
              Bank Statement Import
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Upload className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Bank Statement Import</h3>
              <p className="text-muted-foreground mb-4">
                Upload bank statements to automatically import and categorize transactions
              </p>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Bank Statement
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'sessions' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Bulk Capture Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No bulk capture sessions found</p>
                </div>
              ) : (
                sessions.map((session: BulkSession) => (
                  <Card key={session.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            session.status === 'completed' ? 'default' :
                            session.status === 'processing' ? 'secondary' :
                            session.status === 'error' ? 'destructive' : 'outline'
                          }>
                            {session.status}
                          </Badge>
                          <span className="font-medium">{session.batchId}</span>
                          <span className="text-sm text-muted-foreground capitalize">
                            {session.sessionType} Capture
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {session.processedEntries} of {session.totalEntries} entries processed
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Created: {format(new Date(session.createdAt), 'MMM dd, yyyy HH:mm')}
                        </div>
                        {session.batchNotes && (
                          <div className="text-sm">{session.batchNotes}</div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkCapture;
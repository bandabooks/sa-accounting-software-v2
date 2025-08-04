import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VATTypeSelect } from "@/components/ui/vat-type-select";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Save, 
  CheckCircle,
  Clock,
  Calculator,
  CreditCard,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { UNIFIED_VAT_TYPES, calculateVATAmount, calculateNetAmount } from "@shared/vat-constants";

interface ExpenseEntry {
  id?: number;
  transactionDate: string;
  categoryId: number;
  description: string;
  amount: string;
  supplierId?: number;
  vatTypeId: number;
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
  vatTypeId: number;
  vatRate: string;
  vatAmount: string;
  netAmount: string;
  bankAccountId?: number;
  reference?: string;
  notes?: string;
  status: string;
}

const EnhancedBulkCapture = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [expenseEntries, setExpenseEntries] = useState<ExpenseEntry[]>([]);
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [quickDate, setQuickDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch data
  const { data: chartOfAccounts = [] } = useQuery<any[]>({
    queryKey: ['/api/chart-of-accounts'],
  });

  const { data: suppliers = [] } = useQuery<any[]>({
    queryKey: ['/api/suppliers'],
  });

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ['/api/customers'],
  });

  // Fetch bulk capture sessions
  const { data: bulkSessions = [], refetch: refetchSessions } = useQuery<any[]>({
    queryKey: ['/api/bulk-capture/sessions'],
  });

  const { data: bankAccounts = [] } = useQuery<any[]>({
    queryKey: ['/api/bank-accounts'],
  });

  // Initialize 10 default expense entries
  const initializeExpenseEntries = useCallback(() => {
    const defaultEntries: ExpenseEntry[] = Array.from({ length: 10 }, () => ({
      transactionDate: quickDate,
      categoryId: 0,
      description: '',
      amount: '',
      vatTypeId: 1, // Default to Standard Rate VAT type
      vatRate: '15.00',
      vatAmount: '0.00',
      netAmount: '0.00',
      status: 'draft',
    }));
    setExpenseEntries(defaultEntries);
  }, [quickDate]);

  // Initialize 10 default income entries
  const initializeIncomeEntries = useCallback(() => {
    const defaultEntries: IncomeEntry[] = Array.from({ length: 10 }, () => ({
      transactionDate: quickDate,
      incomeAccountId: 0,
      description: '',
      amount: '',
      vatTypeId: 1, // Default to Standard Rate VAT type
      vatRate: '15.00',
      vatAmount: '0.00',
      netAmount: '0.00',
      status: 'draft',
    }));
    setIncomeEntries(defaultEntries);
  }, [quickDate]);

  // Initialize entries on mount and tab change
  useEffect(() => {
    if (activeTab === 'expense' && expenseEntries.length === 0) {
      initializeExpenseEntries();
    } else if (activeTab === 'income' && incomeEntries.length === 0) {
      initializeIncomeEntries();
    }
  }, [activeTab, initializeExpenseEntries, initializeIncomeEntries, expenseEntries.length, incomeEntries.length]);

  // VAT calculation function using database VAT types
  const calculateVAT = useCallback((amount: string, vatRate: string, vatTypeId: number) => {
    const numAmount = Number(amount ?? 0);
    const numVatRate = Number(vatRate ?? 15);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      return { vatAmount: '0.00', netAmount: '0.00' };
    }

    let vatAmount = 0;
    let netAmount = 0;

    // VAT type 1 = Standard Rate (15% - inclusive by default)
    // VAT type 2 = Zero Rated (0%)
    // VAT type 3 = Exempt (0%)
    // VAT type 4 = Out of Scope (0%)
    if (vatTypeId === 1) {
      // Standard rate - assume inclusive calculation
      vatAmount = numAmount * (numVatRate / (100 + numVatRate));
      netAmount = numAmount - vatAmount;
    } else {
      // Zero rated, exempt, or out of scope
      vatAmount = 0;
      netAmount = numAmount;
    }

    return {
      vatAmount: vatAmount.toFixed(2),
      netAmount: netAmount.toFixed(2),
    };
  }, []);

  // Real-time calculations for income entries
  const incomeCalculations = useMemo(() => {
    const activeEntries = incomeEntries.filter(entry => 
      entry.amount && parseFloat(entry.amount) > 0
    );
    
    let totalIncome = 0;
    let totalVAT = 0;
    let totalNet = 0;
    let vatBreakdown = {
      vatInclusive: 0,
      vatExclusive: 0,
      zeroRated: 0,
      exempt: 0,
      noVAT: 0,
    };

    activeEntries.forEach(entry => {
      const amount = parseFloat(entry.amount) || 0;
      const vatAmount = parseFloat(entry.vatAmount) || 0;
      const netAmount = parseFloat(entry.netAmount) || 0;

      totalIncome += amount;
      totalVAT += vatAmount;
      totalNet += netAmount;

      // VAT breakdown by type ID (1=STD, 2=ZER, 3=EXE, 4=OUT)
      if (entry.vatTypeId === 1) {
        vatBreakdown.vatInclusive += amount;
      } else if (entry.vatTypeId === 2) {
        vatBreakdown.zeroRated += amount;
      } else if (entry.vatTypeId === 3) {
        vatBreakdown.exempt += amount;
      } else if (entry.vatTypeId === 4) {
        vatBreakdown.noVAT += amount;
      } else {
        vatBreakdown.vatExclusive += amount;
      }
    });

    return {
      totalIncome: totalIncome.toFixed(2),
      totalVAT: totalVAT.toFixed(2),
      totalNet: totalNet.toFixed(2),
      activeEntries: activeEntries.length,
      vatBreakdown,
    };
  }, [incomeEntries]);

  // Real-time calculations for expense entries
  const expenseCalculations = useMemo(() => {
    const activeEntries = expenseEntries.filter(entry => 
      entry.amount && parseFloat(entry.amount) > 0
    );
    
    let subtotalExclVAT = 0;
    let totalVAT = 0;
    let grandTotal = 0;

    activeEntries.forEach(entry => {
      const amount = parseFloat(entry.amount) || 0;
      const vatAmount = parseFloat(entry.vatAmount) || 0;
      const netAmount = parseFloat(entry.netAmount) || 0;

      if (entry.vatTypeId === 1) {
        subtotalExclVAT += netAmount;
        grandTotal += amount;
      } else {
        subtotalExclVAT += amount;
        grandTotal += amount + vatAmount;
      }
      totalVAT += vatAmount;
    });

    return {
      subtotalExclVAT: subtotalExclVAT.toFixed(2),
      totalVAT: totalVAT.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      activeEntries: activeEntries.length,
    };
  }, [expenseEntries]);

  // Update expense entry field
  const updateExpenseEntry = useCallback((index: number, field: keyof ExpenseEntry, value: string | number) => {
    setExpenseEntries(prev => {
      const updated = [...prev];
      const entry = { ...updated[index] };
      
      (entry as any)[field] = value;
      
      if (field === 'amount' || field === 'vatRate' || field === 'vatTypeId') {
        const calculations = calculateVAT(
          entry.amount.toString(),
          entry.vatRate.toString(),
          entry.vatTypeId
        );
        entry.vatAmount = calculations.vatAmount;
        entry.netAmount = calculations.netAmount;
      }
      
      updated[index] = entry;
      return updated;
    });
  }, [calculateVAT]);

  // Update income entry field
  const updateIncomeEntry = useCallback((index: number, field: keyof IncomeEntry, value: string | number) => {
    setIncomeEntries(prev => {
      const updated = [...prev];
      const entry = { ...updated[index] };
      
      (entry as any)[field] = value;
      
      if (field === 'amount' || field === 'vatRate' || field === 'vatTypeId') {
        const calculations = calculateVAT(
          entry.amount.toString(),
          entry.vatRate.toString(),
          entry.vatTypeId
        );
        entry.vatAmount = calculations.vatAmount;
        entry.netAmount = calculations.netAmount;
      }
      
      updated[index] = entry;
      return updated;
    });
  }, [calculateVAT]);

  // Apply quick date to all entries
  const applyQuickDateToAll = useCallback(() => {
    if (activeTab === 'expense') {
      setExpenseEntries(prev => prev.map(entry => ({
        ...entry,
        transactionDate: quickDate
      })));
    } else {
      setIncomeEntries(prev => prev.map(entry => ({
        ...entry,
        transactionDate: quickDate
      })));
    }
  }, [activeTab, quickDate]);

  // Add more rows
  const addMoreRows = useCallback((count: number = 5) => {
    if (activeTab === 'expense') {
      const newEntries = Array.from({ length: count }, () => ({
        transactionDate: quickDate,
        categoryId: 0,
        description: '',
        amount: '',
        vatTypeId: 1, // Default to Standard Rate
        vatRate: '15.00',
        vatAmount: '0.00',
        netAmount: '0.00',
        status: 'draft',
      }));
      setExpenseEntries(prev => [...prev, ...newEntries]);
    } else {
      const newEntries = Array.from({ length: count }, () => ({
        transactionDate: quickDate,
        incomeAccountId: 0,
        description: '',
        amount: '',
        vatTypeId: 1, // Default to Standard Rate
        vatRate: '15.00',
        vatAmount: '0.00',
        netAmount: '0.00',
        status: 'draft',
      }));
      setIncomeEntries(prev => [...prev, ...newEntries]);
    }
  }, [activeTab, quickDate]);

  // Save expense entries mutation
  const saveExpensesMutation = useMutation({
    mutationFn: async () => {
      const validEntries = expenseEntries.filter(entry => 
        entry.description && 
        parseFloat(entry.amount) > 0 && 
        entry.categoryId > 0
      );
      
      if (validEntries.length === 0) {
        throw new Error('No valid entries to save');
      }

      return await apiRequest('/api/bulk-capture/sessions', 'POST', {
        sessionType: 'expense',
        totalEntries: validEntries.length,
        batchNotes: `Bulk expense capture - ${validEntries.length} entries`,
        entries: validEntries.map(entry => ({
          transactionDate: entry.transactionDate,
          categoryId: entry.categoryId,
          description: entry.description,
          amount: parseFloat(entry.amount),
          supplierId: entry.supplierId || null,
          bankAccountId: entry.bankAccountId || null,
          vatTypeId: entry.vatTypeId,
          vatRate: parseFloat(entry.vatRate),
          vatAmount: parseFloat(entry.vatAmount),
          netAmount: parseFloat(entry.netAmount) || (parseFloat(entry.amount) - parseFloat(entry.vatAmount)),
          reference: entry.reference || null,
          notes: entry.notes || null,
        }))
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Success",
        description: `Successfully saved ${expenseCalculations.activeEntries} expense entries to session ${data.session?.batchId}`,
      });
      // Reset the form
      initializeExpenseEntries();
      // Refetch sessions to show the new one
      queryClient.invalidateQueries({ queryKey: ['/api/bulk-capture/sessions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save expense entries",
        variant: "destructive",
      });
    },
  });

  // Save income entries mutation
  const saveIncomesMutation = useMutation({
    mutationFn: async () => {
      const validEntries = incomeEntries.filter(entry => 
        entry.description && 
        parseFloat(entry.amount) > 0 && 
        entry.incomeAccountId > 0
      );
      
      if (validEntries.length === 0) {
        throw new Error('No valid entries to save');
      }

      return await apiRequest('/api/bulk-capture/sessions', 'POST', {
        sessionType: 'income',
        totalEntries: validEntries.length,
        batchNotes: `Bulk income capture - ${validEntries.length} entries`,
        entries: validEntries.map(entry => ({
          transactionDate: entry.transactionDate,
          incomeAccountId: entry.incomeAccountId,
          description: entry.description,
          amount: parseFloat(entry.amount),
          clientId: entry.clientId || null,
          bankAccountId: entry.bankAccountId || null,
          vatTypeId: entry.vatTypeId,
          vatRate: parseFloat(entry.vatRate),
          vatAmount: parseFloat(entry.vatAmount),
          netAmount: parseFloat(entry.netAmount) || (parseFloat(entry.amount) - parseFloat(entry.vatAmount)),
          reference: entry.reference || null,
          notes: entry.notes || null,
        }))
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Success",
        description: `Successfully saved ${incomeCalculations.activeEntries} income entries to session ${data.session?.batchId}`,
      });
      // Reset the form
      initializeIncomeEntries();
      // Refetch sessions to show the new one
      queryClient.invalidateQueries({ queryKey: ['/api/bulk-capture/sessions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save income entries",
        variant: "destructive",
      });
    },
  });

  // Process bulk session mutation
  const processBulkSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      return await apiRequest(`/api/bulk-capture/sessions/${sessionId}/process`, 'POST', {});
    },
    onSuccess: (data: any) => {
      toast({
        title: "Success",
        description: `Successfully processed ${data.processedCount} entries. ${data.errors?.length || 0} errors.`,
      });
      // Refetch sessions to update status
      queryClient.invalidateQueries({ queryKey: ['/api/bulk-capture/sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process bulk session",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className={`p-6 rounded-lg ${
        activeTab === 'income' 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
          : 'bg-slate-800 text-white border border-slate-700'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              activeTab === 'income'
                ? 'bg-gradient-to-br from-green-100 to-emerald-100'
                : 'bg-blue-600'
            }`}>
              {activeTab === 'income' ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${
                activeTab === 'income' ? 'text-green-900' : 'text-white'
              }`}>
                {activeTab === 'income' ? 'Bulk Income Capture' : 'Bulk Expense Capture'}
              </h1>
              <p className={`${
                activeTab === 'income' ? 'text-green-600' : 'text-slate-300'
              }`}>
                {activeTab === 'income' 
                  ? 'Professional bulk income entry for revenue transactions and client billing'
                  : 'Professional bulk entry system with intelligent automation and VAT compliance'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className={`px-3 py-1 ${
              activeTab === 'income'
                ? 'border-green-300 text-green-700 bg-green-100'
                : 'border-blue-400 text-white bg-blue-600'
            }`}>
              {activeTab === 'income' ? incomeCalculations.activeEntries : expenseCalculations.activeEntries} active entries
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className={`${
                activeTab === 'income'
                  ? 'bg-green-100 hover:bg-green-200 text-green-700 border-green-300'
                  : 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600'
              }`}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Smart Fill
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'income' | 'expense')}>
        <TabsList className="grid w-full grid-cols-2 bg-gray-100">
          <TabsTrigger 
            value="income" 
            className="flex items-center space-x-2 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Income Capture</span>
          </TabsTrigger>
          <TabsTrigger 
            value="expense" 
            className="flex items-center space-x-2 data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
          >
            <TrendingDown className="w-4 h-4" />
            <span>Expense Capture</span>
          </TabsTrigger>
        </TabsList>

        {/* Income Tab */}
        <TabsContent value="income" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-700 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Total Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">
                  R {incomeCalculations.totalIncome}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-700 flex items-center">
                  <Calculator className="w-4 h-4 mr-2" />
                  VAT Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">
                  R {incomeCalculations.totalVAT}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Net Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  R {incomeCalculations.totalNet}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* VAT Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                VAT Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4 text-center">
                <div>
                  <div className="text-sm font-medium text-blue-600">VAT Inclusive</div>
                  <div className="text-sm text-gray-600">R {incomeCalculations.vatBreakdown.vatInclusive.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-green-600">VAT Exclusive</div>
                  <div className="text-sm text-gray-600">R {incomeCalculations.vatBreakdown.vatExclusive.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-yellow-600">Zero Rated</div>
                  <div className="text-sm text-gray-600">R {incomeCalculations.vatBreakdown.zeroRated.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-orange-600">Exempt</div>
                  <div className="text-sm text-gray-600">R {incomeCalculations.vatBreakdown.exempt.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-red-600">No VAT</div>
                  <div className="text-sm text-gray-600">R {incomeCalculations.vatBreakdown.noVAT.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Controls */}
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="quickDate" className="text-sm font-medium">Quick Date:</Label>
                <Input
                  id="quickDate"
                  type="date"
                  value={quickDate}
                  onChange={(e) => setQuickDate(e.target.value)}
                  className="w-40"
                />
                <Button variant="outline" size="sm" onClick={applyQuickDateToAll}>
                  Apply to All
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => addMoreRows(5)}>
                <Plus className="w-4 h-4 mr-2" />
                Add 5 Rows
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => saveIncomesMutation.mutate()}
                disabled={saveIncomesMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {saveIncomesMutation.isPending ? 'Saving...' : 'Save All Income'}
              </Button>
            </div>
          </div>

          {/* Income Entry Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-green-700">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-white">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Date
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-white">Income Account</th>
                      <th className="text-left p-3 text-sm font-medium text-white">Description</th>
                      <th className="text-left p-3 text-sm font-medium text-white">Amount (R)</th>
                      <th className="text-left p-3 text-sm font-medium text-white">Client</th>
                      <th className="text-left p-3 text-sm font-medium text-white">VAT Treatment</th>
                      <th className="text-left p-3 text-sm font-medium text-white">Bank Account</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeEntries.map((entry, index) => (
                      <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-3">
                          <Input
                            type="date"
                            value={entry.transactionDate}
                            onChange={(e) => updateIncomeEntry(index, 'transactionDate', e.target.value)}
                            className="w-full"
                          />
                        </td>
                        <td className="p-3">
                          <Select
                            value={entry.incomeAccountId.toString()}
                            onValueChange={(value) => updateIncomeEntry(index, 'incomeAccountId', parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose income..." />
                            </SelectTrigger>
                            <SelectContent>
                              {chartOfAccounts
                                .filter(account => account.accountType === 'Revenue')
                                .map(account => (
                                  <SelectItem key={account.id} value={account.id.toString()}>
                                    {account.accountCode} - {account.accountName}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3">
                          <Input
                            value={entry.description}
                            onChange={(e) => updateIncomeEntry(index, 'description', e.target.value)}
                            placeholder="Revenue description..."
                            className="w-full"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            step="0.01"
                            value={entry.amount}
                            onChange={(e) => updateIncomeEntry(index, 'amount', e.target.value)}
                            placeholder="0.00"
                            className="w-full"
                          />
                        </td>
                        <td className="p-3">
                          <Select
                            value={entry.clientId?.toString() || ''}
                            onValueChange={(value) => updateIncomeEntry(index, 'clientId', value ? parseInt(value) : 0)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose..." />
                            </SelectTrigger>
                            <SelectContent>
                              {customers.map(customer => (
                                <SelectItem key={customer.id} value={customer.id.toString()}>
                                  {customer.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3">
                          <VATTypeSelect
                            value={entry.vatTypeId.toString()}
                            onValueChange={(value) => updateIncomeEntry(index, 'vatTypeId', parseInt(value))}
                            placeholder="VAT..."
                          />
                        </td>
                        <td className="p-3">
                          <Select
                            value={entry.bankAccountId?.toString() || ''}
                            onValueChange={(value) => updateIncomeEntry(index, 'bankAccountId', value ? parseInt(value) : 0)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose bank..." />
                            </SelectTrigger>
                            <SelectContent>
                              {bankAccounts.map(account => (
                                <SelectItem key={account.id} value={account.id.toString()}>
                                  {account.accountName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expense Tab */}
        <TabsContent value="expense" className="space-y-6">
          {/* Summary Cards for Expenses */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">ACTIVE ENTRIES</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {expenseCalculations.activeEntries}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-700">SUBTOTAL (EXCL VAT)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">
                  R {expenseCalculations.subtotalExclVAT}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-orange-700">TOTAL VAT</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">
                  R {expenseCalculations.totalVAT}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-700">GRAND TOTAL</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900">
                R {expenseCalculations.grandTotal}
              </div>
            </CardContent>
          </Card>

          {/* Quick Controls for Expenses */}
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="quickDateExpense" className="text-sm font-medium">Date Range:</Label>
                <Input
                  id="quickDateExpense"
                  type="date"
                  value={quickDate}
                  onChange={(e) => setQuickDate(e.target.value)}
                  className="w-40"
                />
                <span className="text-sm text-gray-500">to</span>
                <Input
                  type="date"
                  value={quickDate}
                  className="w-40"
                />
                <Button variant="outline" size="sm" onClick={applyQuickDateToAll}>
                  Apply to All
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => addMoreRows(5)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Rows
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => saveExpensesMutation.mutate()}
                disabled={saveExpensesMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {saveExpensesMutation.isPending ? 'Saving...' : 'Save All Expenses'}
              </Button>
            </div>
          </div>

          {/* Expense Entry Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-white">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Date
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-white">Expense Account</th>
                      <th className="text-left p-3 text-sm font-medium text-white">Description</th>
                      <th className="text-left p-3 text-sm font-medium text-white">Amount (R)</th>
                      <th className="text-left p-3 text-sm font-medium text-white">Supplier/Vendor</th>
                      <th className="text-left p-3 text-sm font-medium text-white">VAT Treatment</th>
                      <th className="text-left p-3 text-sm font-medium text-white">Bank Account</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseEntries.map((entry, index) => (
                      <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-3">
                          <Input
                            type="date"
                            value={entry.transactionDate}
                            onChange={(e) => updateExpenseEntry(index, 'transactionDate', e.target.value)}
                            className="w-full"
                          />
                        </td>
                        <td className="p-3">
                          <Select
                            value={entry.categoryId.toString()}
                            onValueChange={(value) => updateExpenseEntry(index, 'categoryId', parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose expense..." />
                            </SelectTrigger>
                            <SelectContent>
                              {chartOfAccounts
                                .filter(account => account.accountType === 'Expense' || account.accountType === 'Cost of Goods Sold')
                                .map(account => (
                                  <SelectItem key={account.id} value={account.id.toString()}>
                                    {account.accountCode} - {account.accountName}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3">
                          <Input
                            value={entry.description}
                            onChange={(e) => updateExpenseEntry(index, 'description', e.target.value)}
                            placeholder="Expense description..."
                            className="w-full"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            step="0.01"
                            value={entry.amount}
                            onChange={(e) => updateExpenseEntry(index, 'amount', e.target.value)}
                            placeholder="0.00"
                            className="w-full"
                          />
                        </td>
                        <td className="p-3">
                          <Select
                            value={entry.supplierId?.toString() || ''}
                            onValueChange={(value) => updateExpenseEntry(index, 'supplierId', value ? parseInt(value) : 0)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose..." />
                            </SelectTrigger>
                            <SelectContent>
                              {suppliers.map(supplier => (
                                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                  {supplier.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3">
                          <VATTypeSelect
                            value={entry.vatTypeId.toString()}
                            onValueChange={(value) => updateExpenseEntry(index, 'vatTypeId', parseInt(value))}
                            placeholder="VAT..."
                          />
                        </td>
                        <td className="p-3">
                          <Select
                            value={entry.bankAccountId?.toString() || ''}
                            onValueChange={(value) => updateExpenseEntry(index, 'bankAccountId', value ? parseInt(value) : 0)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose bank..." />
                            </SelectTrigger>
                            <SelectContent>
                              {bankAccounts.map(account => (
                                <SelectItem key={account.id} value={account.id.toString()}>
                                  {account.accountName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* VAT Breakdown for Expenses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
                <Calculator className="w-4 h-4 mr-2" />
                VAT Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-xs text-blue-600 font-medium">VAT Inclusive</div>
                  <div className="text-lg font-bold text-blue-900">
                    R {expenseEntries
                      .filter(e => e.vatTransactionType === 'vat_inclusive' && parseFloat(e.amount) > 0)
                      .reduce((sum, e) => sum + parseFloat(e.amount), 0)
                      .toFixed(2)
                    }
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-xs text-green-600 font-medium">VAT Exclusive</div>
                  <div className="text-lg font-bold text-green-900">
                    R {expenseEntries
                      .filter(e => e.vatTransactionType === 'vat_exclusive' && parseFloat(e.amount) > 0)
                      .reduce((sum, e) => sum + parseFloat(e.amount), 0)
                      .toFixed(2)
                    }
                  </div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="text-xs text-yellow-600 font-medium">Zero Rated</div>
                  <div className="text-lg font-bold text-yellow-900">
                    R {expenseEntries
                      .filter(e => e.vatTransactionType === 'zero_rated' && parseFloat(e.amount) > 0)
                      .reduce((sum, e) => sum + parseFloat(e.amount), 0)
                      .toFixed(2)
                    }
                  </div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-xs text-purple-600 font-medium">Exempt</div>
                  <div className="text-lg font-bold text-purple-900">
                    R {expenseEntries
                      .filter(e => e.vatTransactionType === 'exempt' && parseFloat(e.amount) > 0)
                      .reduce((sum, e) => sum + parseFloat(e.amount), 0)
                      .toFixed(2)
                    }
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-600 font-medium">No VAT</div>
                  <div className="text-lg font-bold text-gray-900">
                    R {expenseEntries
                      .filter(e => e.vatTransactionType === 'no_vat' && parseFloat(e.amount) > 0)
                      .reduce((sum, e) => sum + parseFloat(e.amount), 0)
                      .toFixed(2)
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bulk Sessions Management */}
      {bulkSessions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Bulk Capture Sessions
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Process saved bulk entries into journal entries for general ledger integration
                </p>
              </div>
              {bulkSessions.some((session: any) => session.status === 'processing' || session.status === 'draft') && (
                <Button
                  onClick={() => {
                    // Process all unprocessed sessions
                    bulkSessions
                      .filter((session: any) => session.status === 'processing' || session.status === 'draft')
                      .forEach((session: any) => processBulkSessionMutation.mutate(session.id));
                  }}
                  disabled={processBulkSessionMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Process All Sessions
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bulkSessions.map((session: any) => (
                <div 
                  key={session.id} 
                  className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant={session.status === 'completed' ? 'default' : 
                                session.status === 'error' ? 'destructive' : 'secondary'}
                      >
                        {session.status}
                      </Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {session.sessionType === 'expense' ? 'Expenses' : 'Income'}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {session.batchId}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {session.totalEntries} entries
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Created: {format(new Date(session.createdAt), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(session.status === 'processing' || session.status === 'draft') && (
                      <Button
                        size="sm"
                        onClick={() => processBulkSessionMutation.mutate(session.id)}
                        disabled={processBulkSessionMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {processBulkSessionMutation.isPending ? (
                          <>Processing...</>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Process to Journal
                          </>
                        )}
                      </Button>
                    )}
                    {session.status === 'completed' && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        ✓ Processed ({session.processedEntries} entries)
                      </Badge>
                    )}
                    {session.status === 'error' && (
                      <Badge variant="destructive">
                        ✗ Error
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedBulkCapture;
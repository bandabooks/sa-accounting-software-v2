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
  CheckCircle2,
  Clock,
  Calculator,
  CreditCard,
  Calendar
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  status: 'draft' | 'finalized';
  isLocked?: boolean;
}

interface IncomeEntry {
  id?: number;
  transactionDate: string;
  incomeAccountId: number | string;
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
  status: 'draft' | 'finalized';
  isLocked?: boolean;
}

interface CaptureMetrics {
  today: { finalized: number; draft: number; };
  yesterday: { finalized: number; };
  thisMonth: { total: number; finalized: number; };
  totalValue: number;
  percentFinalized: number;
}

const EnhancedBulkCapture = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [expenseEntries, setExpenseEntries] = useState<ExpenseEntry[]>([]);
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [quickDate, setQuickDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{count: number, type: string, status: 'draft' | 'finalized'}>({count: 0, type: '', status: 'finalized'});
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'finalized'>('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Fetch live transaction counts
  const { data: transactionCounts = { totalToday: 0, finalizedToday: 0, draftToday: 0 } } = useQuery<{
    totalToday: number;
    finalizedToday: number;
    draftToday: number;
  }>({
    queryKey: ['/api/bulk-capture/transaction-counts'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch recent bulk capture journal entries (today's entries only)
  const { data: recentEntries = [] } = useQuery<any[]>({
    queryKey: ['/api/journal-entries', 'bulk-capture-today'],
    queryFn: async () => {
      const response = await fetch('/api/journal-entries', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch journal entries');
      }
      const entries = await response.json();
      const today = new Date();
      const todayString = today.toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      
      console.log('Filtering entries for today:', todayString);
      console.log('Total entries fetched:', entries?.length || 0);
      console.log('Entries response type:', typeof entries);
      console.log('Sample entry:', entries?.[0]);
      
      // Ensure entries is an array
      if (!Array.isArray(entries)) {
        console.log('Entries is not an array:', entries);
        return [];
      }
      
      // Filter only bulk capture entries from today
      const filteredEntries = entries.filter((entry: any) => {
        // Handle both date string and timestamp formats
        let entryDate = entry.transactionDate;
        if (entryDate) {
          // Convert to date string for comparison
          if (typeof entryDate === 'string' && entryDate.includes('T')) {
            entryDate = entryDate.split('T')[0];
          } else {
            entryDate = new Date(entryDate).toISOString().split('T')[0];
          }
        }
        
        const isBulkCapture = entry.entryNumber && entry.entryNumber.startsWith('bulk-');
        const isToday = entryDate === todayString;
        
        if (isBulkCapture && isToday) {
          console.log('Found bulk capture entry for today:', entry.entryNumber, entryDate);
        }
        
        return isBulkCapture && isToday;
      });
      
      console.log('Filtered bulk capture entries:', filteredEntries.length);
      
      return filteredEntries
        .sort((a, b) => new Date(b.createdAt || b.transactionDate).getTime() - new Date(a.createdAt || a.transactionDate).getTime())
        .slice(0, 20); // Show last 20 entries from today
    },
    refetchInterval: 15000, // Refresh every 15 seconds
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
    // Find the first revenue account as default, or leave as empty string if none
    const revenueAccounts = chartOfAccounts.filter(account => account.accountType === 'Revenue');
    const defaultIncomeAccountId = revenueAccounts.length > 0 ? revenueAccounts[0].id : '';
    
    const defaultEntries: IncomeEntry[] = Array.from({ length: 10 }, () => ({
      transactionDate: quickDate,
      incomeAccountId: defaultIncomeAccountId,
      description: '',
      amount: '',
      vatTypeId: 1, // Default to Standard Rate VAT type
      vatRate: '15.00',
      vatAmount: '0.00',
      netAmount: '0.00',
      status: 'draft',
    }));
    setIncomeEntries(defaultEntries);
  }, [quickDate, chartOfAccounts]);

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
      const newEntries: ExpenseEntry[] = Array.from({ length: count }, () => ({
        transactionDate: quickDate,
        categoryId: 0,
        description: '',
        amount: '',
        vatTypeId: 1, // Default to Standard Rate
        vatRate: '15.00',
        vatAmount: '0.00',
        netAmount: '0.00',
        status: 'draft' as 'draft',
      }));
      setExpenseEntries(prev => [...prev, ...newEntries]);
    } else {
      // Find the first revenue account as default, or leave as empty string if none
      const revenueAccounts = chartOfAccounts.filter(account => account.accountType === 'Revenue');
      const defaultIncomeAccountId = revenueAccounts.length > 0 ? revenueAccounts[0].id : '';
      
      const newEntries: IncomeEntry[] = Array.from({ length: count }, () => ({
        transactionDate: quickDate,
        incomeAccountId: defaultIncomeAccountId,
        description: '',
        amount: '',
        vatTypeId: 1, // Default to Standard Rate
        vatRate: '15.00',
        vatAmount: '0.00',
        netAmount: '0.00',
        status: 'draft' as 'draft',
      }));
      setIncomeEntries(prev => [...prev, ...newEntries]);
    }
  }, [activeTab, quickDate, chartOfAccounts]);

  // Save expense entries mutation - using journal entry logic
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

      const responses = [];
      
      for (const entry of validEntries) {
        const amount = parseFloat(entry.amount);
        const vatAmount = parseFloat(entry.vatAmount) || 0;
        const netAmount = amount - vatAmount;
        
        const response = await apiRequest('/api/journal-entries', 'POST', {
          entry: {
            entryNumber: `bulk-exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            transactionDate: entry.transactionDate,
            description: entry.description,
            reference: entry.reference || '',
            totalDebit: amount.toFixed(2),
            totalCredit: amount.toFixed(2),
            sourceModule: 'bulk-expense',
            sourceId: null
          },
          lines: [
            // Debit expense category account
            {
              accountId: parseInt(entry.categoryId.toString()),
              description: entry.description,
              debitAmount: netAmount.toFixed(2),
              creditAmount: '0.00',
              reference: entry.reference || ''
            },
            // Debit VAT account if applicable
            ...(vatAmount > 0 ? [{
              accountId: (() => {
                // Find VAT Input account from chart of accounts
                const vatAccount = chartOfAccounts.find(acc => 
                  acc.accountName === 'VAT Input' &&
                  acc.accountType === 'Asset'
                );
                return vatAccount ? vatAccount.id : 70; // Default to known VAT Input account
              })(),
              description: `VAT on ${entry.description}`,
              debitAmount: vatAmount.toFixed(2),
              creditAmount: '0.00',
              reference: entry.reference || ''
            }] : []),
            // Credit bank account (use chart_account_id from bank_accounts table)
            {
              accountId: (() => {
                const bankAccount = bankAccounts.find(ba => ba.id === parseInt(entry.bankAccountId?.toString() || '0'));
                return bankAccount ? bankAccount.chartAccountId : 0;
              })(),
              description: entry.description,
              debitAmount: '0.00',
              creditAmount: amount.toFixed(2),
              reference: entry.reference || ''
            }
          ]
        });
        responses.push(response);
      }
      
      return responses;
    },
    onSuccess: (responses: any[]) => {
      setSuccessDetails({ count: responses.length, type: 'expense', status: 'finalized' });
      setShowSuccessModal(true);
      // Reset the form
      initializeExpenseEntries();
      // Refetch journal entries and sessions
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
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

  // Save income entries mutation - using journal entry logic
  const saveIncomesMutation = useMutation({
    mutationFn: async () => {
      const validEntries = incomeEntries.filter(entry => 
        entry.description && 
        parseFloat(entry.amount) > 0 && 
        entry.incomeAccountId && 
        (typeof entry.incomeAccountId === 'number' ? entry.incomeAccountId > 0 : entry.incomeAccountId !== '')
      );
      
      if (validEntries.length === 0) {
        throw new Error('No valid entries to save');
      }

      const responses = [];
      
      for (const entry of validEntries) {
        const amount = parseFloat(entry.amount);
        const vatAmount = parseFloat(entry.vatAmount) || 0;
        const netAmount = amount - vatAmount;
        
        const response = await apiRequest('/api/journal-entries', 'POST', {
          entry: {
            entryNumber: `bulk-inc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            transactionDate: entry.transactionDate,
            description: entry.description,
            reference: entry.reference || '',
            totalDebit: amount.toFixed(2),
            totalCredit: amount.toFixed(2),
            sourceModule: 'bulk-income',
            sourceId: null
          },
          lines: [
            // Debit bank account (use chart_account_id from bank_accounts table)
            {
              accountId: (() => {
                const bankAccount = bankAccounts.find(ba => ba.id === parseInt(entry.bankAccountId?.toString() || '0'));
                return bankAccount ? bankAccount.chartAccountId : 0;
              })(),
              description: entry.description,
              debitAmount: amount.toFixed(2),
              creditAmount: '0.00',
              reference: entry.reference || ''
            },
            // Credit income account
            {
              accountId: typeof entry.incomeAccountId === 'string' ? parseInt(entry.incomeAccountId) : entry.incomeAccountId,
              description: entry.description,
              debitAmount: '0.00',
              creditAmount: netAmount.toFixed(2),
              reference: entry.reference || ''
            },
            // Credit VAT account if applicable
            ...(vatAmount > 0 ? [{
              accountId: (() => {
                // Find VAT Output account from chart of accounts
                const vatAccount = chartOfAccounts.find(acc => 
                  acc.accountName === 'VAT Output' &&
                  acc.accountType === 'Liability'
                );
                return vatAccount ? vatAccount.id : 98; // Default to known VAT Output account
              })(),
              description: `VAT on ${entry.description}`,
              debitAmount: '0.00',
              creditAmount: vatAmount.toFixed(2),
              reference: entry.reference || ''
            }] : [])
          ]
        });
        responses.push(response);
      }
      
      return responses;
    },
    onSuccess: (responses: any[]) => {
      setSuccessDetails({ count: responses.length, type: 'income', status: 'finalized' });
      setShowSuccessModal(true);
      // Reset the form
      initializeIncomeEntries();
      // Refetch journal entries and sessions
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
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
            {/* Live Transaction Counter */}
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">
                Today: {transactionCounts.totalToday} entries
              </span>
              <span className="text-xs opacity-75">
                ({transactionCounts.finalizedToday} saved)
              </span>
            </div>
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
          {/* Transaction Matrix Card */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-indigo-900 flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Live Transaction Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-600">{transactionCounts.totalToday}</div>
                  <div className="text-sm text-gray-600">Total Today</div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-300"
                      style={{ width: `${transactionCounts.totalToday > 0 ? 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-blue-600">{transactionCounts.finalizedToday}</div>
                  <div className="text-sm text-gray-600">Saved Entries</div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${transactionCounts.totalToday > 0 ? (transactionCounts.finalizedToday / transactionCounts.totalToday) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-orange-600">{transactionCounts.draftToday}</div>
                  <div className="text-sm text-gray-600">Draft Entries</div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${transactionCounts.totalToday > 0 ? (transactionCounts.draftToday / transactionCounts.totalToday) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <Badge variant="outline" className="text-indigo-700 border-indigo-300">
                  Auto-refreshes every 30 seconds
                </Badge>
              </div>
            </CardContent>
          </Card>

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
                            value={entry.incomeAccountId ? entry.incomeAccountId.toString() : ''}
                            onValueChange={(value) => updateIncomeEntry(index, 'incomeAccountId', value ? parseInt(value) : '')}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose income account..." />
                            </SelectTrigger>
                            <SelectContent>
                              {chartOfAccounts
                                .filter(account => account.accountType === 'Revenue')
                                .map(account => (
                                  <SelectItem key={account.id} value={account.id.toString()}>
                                    {account.accountCode} - {account.accountName}
                                  </SelectItem>
                                ))}
                              {chartOfAccounts.filter(account => account.accountType === 'Revenue').length === 0 && (
                                <div className="p-2 text-sm text-red-500 text-center">
                                  No Revenue accounts found. Please create Revenue accounts in Chart of Accounts.
                                </div>
                              )}
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
                <CardTitle className="text-sm font-medium text-gray-700">ACTIVE ENTRIES2020</CardTitle>
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
                      .filter(e => parseFloat(e.amount) > 0)
                      .reduce((sum, e) => sum + parseFloat(e.amount), 0)
                      .toFixed(2)
                    }
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-xs text-green-600 font-medium">VAT Exclusive</div>
                  <div className="text-lg font-bold text-green-900">
                    R {expenseEntries
                      .filter(e => parseFloat(e.amount) > 0)
                      .reduce((sum, e) => sum + parseFloat(e.amount), 0)
                      .toFixed(2)
                    }
                  </div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="text-xs text-yellow-600 font-medium">Zero Rated</div>
                  <div className="text-lg font-bold text-yellow-900">
                    R {expenseEntries
                      .filter(e => parseFloat(e.amount) > 0)
                      .reduce((sum, e) => sum + parseFloat(e.amount), 0)
                      .toFixed(2)
                    }
                  </div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-xs text-purple-600 font-medium">Exempt</div>
                  <div className="text-lg font-bold text-purple-900">
                    R {expenseEntries
                      .filter(e => parseFloat(e.amount) > 0)
                      .reduce((sum, e) => sum + parseFloat(e.amount), 0)
                      .toFixed(2)
                    }
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-600 font-medium">No VAT</div>
                  <div className="text-lg font-bold text-gray-900">
                    R {expenseEntries
                      .filter(e => parseFloat(e.amount) > 0)
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

      {/* Note: Bulk Capture Sessions removed - all transactions are now processed directly to Journal Entries */}

      {/* Today's Journal Entries Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Today's Journal Entries
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-gray-600">
                {transactionCounts?.totalToday || 0} entries today
              </Badge>
            </div>
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            All journal entries created today with bulk capture and direct posting capabilities
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No journal entries created today</p>
                <p className="text-xs mt-1">Start by adding income or expense entries above</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Entry #</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Description</th>
                      <th className="pb-2">Reference</th>
                      <th className="pb-2">Debit</th>
                      <th className="pb-2">Credit</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="py-3">
                          <Badge
                            variant={entry.isPosted ? "default" : "secondary"}
                            className={`text-xs ${
                              entry.isPosted 
                                ? "bg-green-100 text-green-800 hover:bg-green-200" 
                                : "bg-orange-100 text-orange-800 hover:bg-orange-200"
                            }`}
                          >
                            {entry.isPosted ? "Posted" : "Draft"}
                          </Badge>
                        </td>
                        <td className="py-3 text-sm font-medium text-gray-900">
                          {entry.entryNumber}
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          {format(new Date(entry.transactionDate), 'MMM dd, yyyy')}
                        </td>
                        <td className="py-3 text-sm text-gray-900 max-w-xs truncate">
                          {entry.description}
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          {entry.reference || '-'}
                        </td>
                        <td className="py-3 text-sm font-mono text-green-600">
                          R {parseFloat(entry.totalDebit).toFixed(2)}
                        </td>
                        <td className="py-3 text-sm font-mono text-blue-600">
                          R {parseFloat(entry.totalCredit).toFixed(2)}
                        </td>
                        <td className="py-3">
                          {!entry.isPosted ? (
                            <Button
                              onClick={() => postSingleEntryMutation.mutate(entry.id)}
                              disabled={postSingleEntryMutation.isPending}
                              size="sm"
                              variant="outline"
                              className="text-xs border-green-300 text-green-700 hover:bg-green-50"
                            >
                              {postSingleEntryMutation.isPending ? 'Posting...' : 'Post'}
                            </Button>
                          ) : (
                            <Badge variant="outline" className="text-xs text-gray-500">
                              Locked
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Professional Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {successDetails.type === 'income' ? 'Income Entries' : 'Expense Entries'} Created Successfully
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 text-center">
            <p className="text-gray-600 mb-6">
              Successfully created <span className="font-semibold text-green-600">{successDetails.count}</span> {successDetails.type} journal {successDetails.count === 1 ? 'entry' : 'entries'}. 
              {successDetails.type === 'income' ? ' Your revenue has been recorded with proper VAT handling.' : ' Your expenses have been recorded with proper VAT handling.'}
            </p>
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-700 font-medium">Journal Entries Created:</span>
                  <span className="text-green-900 font-semibold">{successDetails.count}</span>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700 font-medium">Transaction Type:</span>
                  <span className="text-blue-900 font-semibold capitalize">{successDetails.type}</span>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setShowSuccessModal(false)}
              className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Continue Working
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedBulkCapture;
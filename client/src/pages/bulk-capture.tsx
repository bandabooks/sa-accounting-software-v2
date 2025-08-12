import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
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
  Calendar,
  Upload,
  FileSpreadsheet,
  Landmark,
  Download,
  RefreshCw,
  Sparkles,
  Zap,
  Bot
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

interface BankImportBatch {
  id: number;
  fileName: string;
  uploadDate: string;
  status: 'processing' | 'parsed' | 'validated' | 'completed' | 'failed';
  bankName: string;
  totalTransactions: number;
  processedTransactions: number;
  errorCount: number;
  accountNumber?: string;
}

interface BankTransaction {
  id?: number;
  date: string;
  description: string;
  reference: string;
  amount: number;
  balance?: number;
  type: 'debit' | 'credit';
  category?: string;
  status: 'pending' | 'matched' | 'ignored';
}

const EnhancedBulkCapture = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'income' | 'expense' | 'bank-import'>('income');
  const [expenseEntries, setExpenseEntries] = useState<ExpenseEntry[]>([]);
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [quickDate, setQuickDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{count: number, type: string, status: 'draft' | 'finalized'}>({count: 0, type: '', status: 'finalized'});
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'finalized'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Bank import states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedBank, setSelectedBank] = useState<string>('First');
  const [isUploading, setIsUploading] = useState(false);
  const [bankImportBatches, setBankImportBatches] = useState<BankImportBatch[]>([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>('');
  
  // AI matching states
  const [isAiMatching, setIsAiMatching] = useState(false);
  const [aiMatchingProgress, setAiMatchingProgress] = useState(0);
  const [autoMatchedEntries, setAutoMatchedEntries] = useState<Set<number>>(new Set());

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
    // Find Sales Revenue account specifically, otherwise first revenue account
    const revenueAccounts = chartOfAccounts.filter(account => account.accountType === 'Revenue');
    const salesRevenueAccount = revenueAccounts.find(account => 
      account.accountName.toLowerCase().includes('sales revenue') || 
      account.accountName.toLowerCase().includes('revenue')
    );
    const defaultIncomeAccountId = salesRevenueAccount ? salesRevenueAccount.id : 
                                  (revenueAccounts.length > 0 ? revenueAccounts[0].id : '');
    
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
    // Re-initialize income entries when chart of accounts loads to ensure Sales Revenue is pre-selected
    else if (activeTab === 'income' && chartOfAccounts.length > 0 && incomeEntries.length > 0) {
      const needsUpdate = incomeEntries.some(entry => !entry.incomeAccountId);
      if (needsUpdate) {
        initializeIncomeEntries();
      }
    }
  }, [activeTab, initializeExpenseEntries, initializeIncomeEntries, expenseEntries.length, incomeEntries.length, chartOfAccounts]);

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
      
      // Auto-select Sales Revenue for positive amounts
      if (field === 'amount' && value && parseFloat(value.toString()) > 0) {
        const revenueAccounts = chartOfAccounts.filter(account => account.accountType === 'Revenue');
        const salesRevenueAccount = revenueAccounts.find(account => 
          account.accountName.toLowerCase().includes('sales revenue') || 
          account.accountName.toLowerCase().includes('revenue')
        );
        
        if (salesRevenueAccount && (!entry.incomeAccountId || entry.incomeAccountId === '')) {
          entry.incomeAccountId = salesRevenueAccount.id;
        }
      }
      
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
  }, [calculateVAT, chartOfAccounts]);

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

  // Bank import functions
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const handleBankUpload = useCallback(async () => {
    if (!selectedFile || !selectedBankAccount) {
      toast({
        title: "Error",
        description: "Please select a file and bank account",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('bankName', selectedBank);
      formData.append('bankAccountId', selectedBankAccount);

      // Parse bank statement to get transactions
      const token = localStorage.getItem('authToken');
      const sessionToken = localStorage.getItem('sessionToken');
      
      const headers: HeadersInit = {};
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      if (sessionToken) {
        headers["X-Session-Token"] = sessionToken;
      }

      const response = await fetch('/api/bank/parse-statement', {
        method: 'POST',
        headers,
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Clear authentication data
          localStorage.removeItem('authToken');
          localStorage.removeItem('sessionToken');
          localStorage.removeItem('userData');
          throw new Error("Authentication failed. Please refresh the page and try again.");
        }
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      
      if (data.transactions && data.transactions.length > 0) {
        // Convert bank transactions to bulk capture entries
        const convertedExpenses: ExpenseEntry[] = [];
        const convertedIncome: IncomeEntry[] = [];
        
        data.transactions.forEach((transaction: any) => {
          const baseEntry = {
            transactionDate: transaction.date || quickDate,
            description: transaction.description || transaction.reference || '',
            amount: Math.abs(transaction.amount).toFixed(2),
            vatTypeId: 1, // Default Standard Rate VAT
            vatRate: '15.00',
            vatAmount: '0.00',
            netAmount: '0.00',
            bankAccountId: parseInt(selectedBankAccount),
            reference: transaction.reference || '',
            notes: `Imported from ${selectedBank} bank statement`,
            status: 'draft' as const,
          };
          
          if (transaction.type === 'debit' || transaction.amount < 0) {
            // Debit transactions become expenses
            convertedExpenses.push({
              ...baseEntry,
              categoryId: 0, // Default expense category - user will need to select
              supplierId: undefined,
            } as ExpenseEntry);
          } else {
            // Credit transactions become income
            convertedIncome.push({
              ...baseEntry,
              incomeAccountId: 0, // Default income account - user will need to select
              clientId: undefined,
            } as IncomeEntry);
          }
        });
        
        // Add converted entries to existing entries
        if (convertedExpenses.length > 0) {
          setExpenseEntries(prev => [...convertedExpenses, ...prev]);
        }
        if (convertedIncome.length > 0) {
          setIncomeEntries(prev => [...convertedIncome, ...prev]);
        }
        
        // Switch to appropriate tab based on majority of transactions
        if (convertedExpenses.length > convertedIncome.length) {
          setActiveTab('expense');
        } else if (convertedIncome.length > 0) {
          setActiveTab('income');
        }
        
        toast({
          title: "Bank Statement Imported Successfully",
          description: `Imported ${data.transactions.length} transactions (${convertedExpenses.length} expenses, ${convertedIncome.length} income). Please review and categorize entries before saving.`,
          variant: "success" as any,
        });
      } else {
        toast({
          title: "No Transactions Found",
          description: "The bank statement does not contain any transactions to import.",
          variant: "destructive",
        });
      }

      // Reset form
      setSelectedFile(null);
      setSelectedBankAccount('');
      
      // Clear file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
    } catch (error: any) {
      console.error('Bank import error:', error);
      
      let errorMessage = "Failed to parse bank statement";
      
      if (error.message) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = "Authentication failed. Please refresh the page and try again.";
        } else if (error.message.includes('400')) {
          errorMessage = "Invalid file format or missing information. Please check your file and selections.";
        } else if (error.message.includes('413')) {
          errorMessage = "File is too large. Please use a smaller file.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Bank Import Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, selectedBank, selectedBankAccount, toast, queryClient, quickDate, setActiveTab, setExpenseEntries, setIncomeEntries]);

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
      // Find Sales Revenue account specifically, otherwise first revenue account
      const revenueAccounts = chartOfAccounts.filter(account => account.accountType === 'Revenue');
      const salesRevenueAccount = revenueAccounts.find(account => 
        account.accountName.toLowerCase().includes('sales revenue') || 
        account.accountName.toLowerCase().includes('revenue')
      );
      const defaultIncomeAccountId = salesRevenueAccount ? salesRevenueAccount.id : 
                                    (revenueAccounts.length > 0 ? revenueAccounts[0].id : '');
      
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
        entry.categoryId > 0 &&
        entry.bankAccountId && entry.bankAccountId > 0  // Ensure bank account is selected
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
                if (!bankAccount || !bankAccount.chartAccountId) {
                  throw new Error(`Bank account not found or missing chart account ID for entry: ${entry.description}`);
                }
                return bankAccount.chartAccountId;
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
        variant: "success" as any,
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

  // Post single journal entry mutation
  const postSingleEntryMutation = useMutation({
    mutationFn: async (entryId: number) => {
      return await apiRequest(`/api/journal-entries/${entryId}/post`, 'POST');
    },
    onSuccess: () => {
      toast({
        title: "Entry Posted",
        description: "Journal entry has been posted successfully",
        variant: "success" as any,
      });
      // Refetch journal entries
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Post Entry",
        description: error.message || "An error occurred while posting the entry",
        variant: "destructive",
      });
    },
  });

  // Script-based Auto-Matching Mutation (Primary Solution)
  const scriptAutoMatchMutation = useMutation({
    mutationFn: async ({ entries, type }: { entries: (ExpenseEntry | IncomeEntry)[], type: 'expense' | 'income' }): Promise<any> => {
      const transactionsToMatch = entries.map((entry, index) => ({
        id: index,
        description: entry.description,
        amount: parseFloat(entry.amount),
        type: type
      }));

      const response = await apiRequest('/api/script/match-transactions', 'POST', {
        transactions: transactionsToMatch
      });
      return response;
    },
    onSuccess: (response: any, variables) => {
      const { entries, type } = variables;
      const matches = response?.matches || [];
      
      if (!Array.isArray(matches)) {
        toast({
          title: "Script Auto-Match Failed", 
          description: "Invalid response format from script matcher",
          variant: "destructive"
        });
        return;
      }

      // Apply script-based suggestions to entries
      matches.forEach((match: any) => {
        const index = match.transactionId;
        if (index >= 0 && index < entries.length && match.confidence > 0.6) {
          const updatedEntry = { ...entries[index] };
          
          if (type === 'expense') {
            const expenseEntry = updatedEntry as ExpenseEntry;
            if (match.accountId) {
              expenseEntry.categoryId = match.accountId;
            }
            if (match.vatRate !== undefined) {
              expenseEntry.vatRate = match.vatRate.toString();
              expenseEntry.vatTypeId = match.vatRate === 15 ? 1 : 
                                       match.vatRate === 0 ? 2 : 1;
              // Recalculate VAT amounts
              const amount = parseFloat(expenseEntry.amount);
              const vatAmount = calculateVATAmount(amount, match.vatRate);
              const netAmount = calculateNetAmount(amount, match.vatRate);
              expenseEntry.vatAmount = vatAmount.toFixed(2);
              expenseEntry.netAmount = netAmount.toFixed(2);
            }
            
            setExpenseEntries(prev => {
              const newEntries = [...prev];
              newEntries[index] = expenseEntry;
              return newEntries;
            });
          } else {
            const incomeEntry = updatedEntry as IncomeEntry;
            if (match.accountId) {
              incomeEntry.incomeAccountId = match.accountId;
            }
            if (match.vatRate !== undefined) {
              incomeEntry.vatRate = match.vatRate.toString();
              incomeEntry.vatTypeId = match.vatRate === 15 ? 1 : 
                                      match.vatRate === 0 ? 2 : 1;
              // Recalculate VAT amounts
              const amount = parseFloat(incomeEntry.amount);
              const vatAmount = calculateVATAmount(amount, match.vatRate);
              const netAmount = calculateNetAmount(amount, match.vatRate);
              incomeEntry.vatAmount = vatAmount.toFixed(2);
              incomeEntry.netAmount = netAmount.toFixed(2);
            }
            
            setIncomeEntries(prev => {
              const newEntries = [...prev];
              newEntries[index] = incomeEntry;
              return newEntries;
            });
          }
        }
      });

      toast({
        title: "Script Auto-Match Complete",
        description: `Successfully matched ${matches.length} out of ${entries.length} transactions`,
        variant: "success" as any,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Script Auto-Match Failed",
        description: error.message || "Failed to auto-match transactions",
        variant: "destructive",
      });
    },
  });

  // AI Auto-Matching Mutation (Secondary Option)
  const aiAutoMatchMutation = useMutation({
    mutationFn: async ({ entries, type }: { entries: (ExpenseEntry | IncomeEntry)[], type: 'expense' | 'income' }): Promise<any[]> => {
      const transactionsToMatch = entries.map((entry, index) => ({
        id: index,
        description: entry.description,
        amount: parseFloat(entry.amount),
        type: type
      }));

      const response = await apiRequest('/api/ai/match-transactions', 'POST', {
        transactions: transactionsToMatch
      });
      return (response as any)?.matches || [];
    },
    onSuccess: (matches: any[], variables) => {
      const { entries, type } = variables;
      setAiMatchingProgress(100);
      
      // Apply AI suggestions to entries
      matches.forEach((match, index) => {
        if (match.suggestion && match.confidence > 0.7) {
          const updatedEntry = { ...entries[index] };
          
          if (type === 'expense') {
            const expenseEntry = updatedEntry as ExpenseEntry;
            if (match.suggestion.accountId) {
              expenseEntry.categoryId = parseInt(match.suggestion.accountId);
            }
            if (match.suggestion.vatRate) {
              expenseEntry.vatRate = match.suggestion.vatRate.toString();
              expenseEntry.vatTypeId = match.suggestion.vatRate === 15 ? 1 : 
                                       match.suggestion.vatRate === 0 ? 2 : 1;
            }
            
            setExpenseEntries(prev => {
              const newEntries = [...prev];
              newEntries[index] = expenseEntry;
              return newEntries;
            });
          } else {
            const incomeEntry = updatedEntry as IncomeEntry;
            if (match.suggestion.accountId) {
              incomeEntry.incomeAccountId = parseInt(match.suggestion.accountId);
            }
            if (match.suggestion.vatRate) {
              incomeEntry.vatRate = match.suggestion.vatRate.toString();
              incomeEntry.vatTypeId = match.suggestion.vatRate === 15 ? 1 : 
                                      match.suggestion.vatRate === 0 ? 2 : 1;
            }
            
            setIncomeEntries(prev => {
              const newEntries = [...prev];
              newEntries[index] = incomeEntry;
              return newEntries;
            });
          }
          
          setAutoMatchedEntries(prev => new Set([...Array.from(prev), index]));
        }
      });

      toast({
        title: "AI Auto-Matching Complete",
        description: `Matched ${matches.filter(m => m.confidence > 0.7).length} of ${matches.length} transactions`,
        variant: "success" as any,
      });
      
      setIsAiMatching(false);
      setAiMatchingProgress(0);
    },
    onError: (error: any) => {
      setIsAiMatching(false);
      setAiMatchingProgress(0);
      toast({
        title: "AI Matching Failed",
        description: error.message || "Failed to auto-match transactions",
        variant: "destructive",
      });
    },
  });

  // Script-based auto-match handler (Primary)
  const handleScriptAutoMatch = useCallback(async () => {
    const currentEntries = activeTab === 'expense' ? expenseEntries : incomeEntries;
    
    if (currentEntries.length === 0) {
      toast({
        title: "No Transactions",
        description: "Add some transactions first to use auto-matching",
        variant: "destructive",
      });
      return;
    }

    scriptAutoMatchMutation.mutate({ 
      entries: currentEntries, 
      type: activeTab as 'expense' | 'income'
    });
  }, [activeTab, expenseEntries, incomeEntries, scriptAutoMatchMutation, toast]);

  // AI-based auto-match handler (Secondary)
  const handleAiAutoMatch = useCallback(async () => {
    if (isAiMatching) return;
    
    const currentEntries = activeTab === 'expense' ? expenseEntries : incomeEntries;
    
    if (currentEntries.length === 0) {
      toast({
        title: "No Transactions",
        description: "Add some transactions first to use AI auto-matching",
        variant: "destructive",
      });
      return;
    }

    setIsAiMatching(true);
    setAiMatchingProgress(20);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setAiMatchingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    aiAutoMatchMutation.mutate({ 
      entries: currentEntries, 
      type: activeTab as 'expense' | 'income'
    });
  }, [activeTab, expenseEntries, incomeEntries, isAiMatching, aiAutoMatchMutation, toast]);

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
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'income' | 'expense' | 'bank-import')}>
        <TabsList className="grid w-full grid-cols-3 bg-gray-100">
          <TabsTrigger 
            value="bank-import" 
            className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
          >
            <Upload className="w-4 h-4" />
            <span>Bank Import</span>
          </TabsTrigger>
          <TabsTrigger 
            value="expense" 
            className="flex items-center space-x-2 data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
          >
            <TrendingDown className="w-4 h-4" />
            <span>Bulk Expenses</span>
          </TabsTrigger>
          <TabsTrigger 
            value="income" 
            className="flex items-center space-x-2 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Bulk Income</span>
          </TabsTrigger>
        </TabsList>

        {/* Bank Import Tab */}
        <TabsContent value="bank-import" className="space-y-6">
          {/* Bank Import Upload Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-blue-900 flex items-center">
                <Landmark className="w-5 h-5 mr-2" />
                Bank Statement Import
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* File Upload Section */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bank-select" className="text-sm font-medium text-gray-700">
                      Select Bank
                    </Label>
                    <Select value={selectedBank} onValueChange={setSelectedBank}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose your bank" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FNB">FNB</SelectItem>
                        <SelectItem value="Standard Bank">Standard Bank</SelectItem>
                        <SelectItem value="ABSA">ABSA</SelectItem>
                        <SelectItem value="Nedbank">Nedbank</SelectItem>
                        <SelectItem value="Capitec">Capitec</SelectItem>
                        <SelectItem value="Discovery Bank">Discovery Bank</SelectItem>
                        <SelectItem value="TymeBank">TymeBank</SelectItem>
                        <SelectItem value="African Bank">African Bank</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bank-account-select" className="text-sm font-medium text-gray-700">
                      Bank Account
                    </Label>
                    <Select value={selectedBankAccount} onValueChange={setSelectedBankAccount}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select bank account" />
                      </SelectTrigger>
                      <SelectContent>
                        {bankAccounts.map((account: any) => (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            {account.accountName} - {account.accountNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="file-upload" className="text-sm font-medium text-gray-700">
                      Upload Statement File
                    </Label>
                    <div className="mt-2">
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".csv,.xlsx,.xls,.qif,.ofx,.pdf"
                        onChange={handleFileSelect}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Supported formats: CSV, Excel (.xlsx, .xls), QIF, OFX, PDF
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upload Status Section */}
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Upload Status</h4>
                    {selectedFile ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">{selectedFile.name}</span>
                          <Badge variant="outline" className="text-xs">
                            Ready
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          Size: {(selectedFile.size / 1024).toFixed(1)} KB
                        </div>
                        <div className="text-xs text-gray-500">
                          Type: {selectedFile.type || selectedFile.name.split('.').pop()?.toUpperCase() || 'Unknown'}
                        </div>
                        {selectedBankAccount && (
                          <div className="text-xs text-green-600 font-medium">
                            ✓ Bank account selected
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        No file selected
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={handleBankUpload}
                    disabled={!selectedFile || !selectedBankAccount || isUploading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Parsing Bank Statement...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Import to Bulk Capture
                      </>
                    )}
                  </Button>
                  
                  {(selectedFile && selectedBankAccount && !isUploading) && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Ready to Import</span>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        Bank statement will be converted to bulk capture entries with VAT handling for review and categorization
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Guide */}
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Quick Import Guide</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Download your bank statement in CSV or Excel format</li>
                  <li>• Select the corresponding bank account from the dropdown</li>
                  <li>• Upload the file and we'll automatically parse transactions</li>
                  <li>• Review and categorize imported transactions in the next step</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Recent Imports (if any) */}
          <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                <Download className="w-5 h-5 mr-2" />
                Recent Imports
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bankImportBatches.length > 0 ? (
                <div className="space-y-3">
                  {bankImportBatches.map((batch) => (
                    <div key={batch.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          batch.status === 'completed' ? 'bg-green-500' :
                          batch.status === 'failed' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`} />
                        <div>
                          <div className="text-sm font-medium">{batch.fileName}</div>
                          <div className="text-xs text-gray-500">
                            {batch.bankName} • {format(new Date(batch.uploadDate), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{batch.totalTransactions} transactions</div>
                        <div className="text-xs text-gray-500">
                          {batch.processedTransactions} processed
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No recent imports found</p>
                  <p className="text-xs">Upload a bank statement to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Income Tab */}
        <TabsContent value="income" className="space-y-6">

          {/* Summary Cards - 60% smaller and VAT Breakdown as 4th card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-green-700 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Total Income
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg font-bold text-green-900">
                  R {incomeCalculations.totalIncome}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-blue-700 flex items-center">
                  <Calculator className="w-3 h-3 mr-1" />
                  VAT Amount
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg font-bold text-blue-900">
                  R {incomeCalculations.totalVAT}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-700 flex items-center">
                  <CreditCard className="w-3 h-3 mr-1" />
                  Net Income
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg font-bold text-gray-900">
                  R {incomeCalculations.totalNet}
                </div>
              </CardContent>
            </Card>

            {/* VAT Breakdown as 4th card */}
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-purple-700 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  VAT Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 gap-1 text-center">
                  <div className="flex justify-between">
                    <span className="text-xs text-blue-600">VAT Inc:</span>
                    <span className="text-xs text-gray-600">R {incomeCalculations.vatBreakdown.vatInclusive.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-green-600">VAT Exc:</span>
                    <span className="text-xs text-gray-600">R {incomeCalculations.vatBreakdown.vatExclusive.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-yellow-600">Zero:</span>
                    <span className="text-xs text-gray-600">R {incomeCalculations.vatBreakdown.zeroRated.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-orange-600">Exempt:</span>
                    <span className="text-xs text-gray-600">R {incomeCalculations.vatBreakdown.exempt.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-red-600">No VAT:</span>
                    <span className="text-xs text-gray-600">R {incomeCalculations.vatBreakdown.noVAT.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>



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
              {/* Script Auto-Match Button (Primary) */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleScriptAutoMatch}
                disabled={scriptAutoMatchMutation.isPending || incomeEntries.length === 0}
                className="bg-gradient-to-r from-green-500 to-teal-500 text-white border-0 hover:from-green-600 hover:to-teal-600"
              >
                {scriptAutoMatchMutation.isPending ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-pulse" />
                    Matching...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Script Auto-Match
                  </>
                )}
              </Button>

              {/* AI Auto-Match Button (Secondary) */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAiAutoMatch}
                disabled={isAiMatching || incomeEntries.length === 0}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 hover:from-purple-600 hover:to-blue-600"
              >
                {isAiMatching ? (
                  <>
                    <Bot className="w-4 h-4 mr-2 animate-pulse" />
                    AI Matching... {aiMatchingProgress}%
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Auto-Match
                  </>
                )}
              </Button>
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
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
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
                      <tr key={index} className={`border-b-2 border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors ${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'
                      } ${
                        autoMatchedEntries.has(index) ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-300' : ''
                      }`}>
                        <td className="p-4 border-r border-gray-200 dark:border-gray-600">
                          <Input
                            type="date"
                            value={entry.transactionDate}
                            onChange={(e) => updateIncomeEntry(index, 'transactionDate', e.target.value)}
                            className="w-full shadow-sm"
                          />
                        </td>
                        <td className="p-4 border-r border-gray-200 dark:border-gray-600">
                          <SearchableSelect
                            options={chartOfAccounts
                              .filter(account => account.accountType === 'Revenue')
                              .map(account => ({
                                value: account.id.toString(),
                                label: account.accountName,
                                subtext: account.accountCode
                              }))}
                            value={entry.incomeAccountId ? entry.incomeAccountId.toString() : ''}
                            onValueChange={(value) => {
                              const accountId = value ? parseInt(value) : '';
                              updateIncomeEntry(index, 'incomeAccountId', accountId);
                              
                              // Auto-populate description from chart of accounts
                              if (accountId) {
                                const selectedAccount = chartOfAccounts.find(acc => acc.id === accountId);
                                if (selectedAccount && !entry.description) {
                                  updateIncomeEntry(index, 'description', selectedAccount.accountName + ' revenue');
                                }
                              }
                            }}
                            placeholder="Select income account..."
                            clearable
                          />
                        </td>
                        <td className="p-4 border-r border-gray-200 dark:border-gray-600">
                          <div className="flex items-center space-x-2">
                            <Textarea
                              value={entry.description}
                              onChange={(e) => updateIncomeEntry(index, 'description', e.target.value)}
                              placeholder="Revenue description..."
                              className="w-full min-h-[2.5rem] resize-y shadow-sm bg-green-50 border-green-200 focus:bg-green-100 focus:border-green-300"
                              rows={1}
                            />
                            {autoMatchedEntries.has(index) && (
                              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 text-xs">
                                <Sparkles className="w-3 h-3 mr-1" />
                                AI
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4 border-r border-gray-200 dark:border-gray-600">
                          <Input
                            type="number"
                            step="0.01"
                            value={entry.amount}
                            onChange={(e) => updateIncomeEntry(index, 'amount', e.target.value)}
                            placeholder="0.00"
                            className="w-full shadow-sm"
                          />
                        </td>
                        <td className="p-4 border-r border-gray-200 dark:border-gray-600">
                          <SearchableSelect
                            options={customers.map(customer => ({
                              value: customer.id.toString(),
                              label: customer.name,
                              subtext: customer.email || customer.phone || ''
                            }))}
                            value={entry.clientId?.toString() || ''}
                            onValueChange={(value) => updateIncomeEntry(index, 'clientId', value ? parseInt(value) : 0)}
                            placeholder="Select client..."
                            clearable
                          />
                        </td>
                        <td className="p-4 border-r border-gray-200 dark:border-gray-600">
                          <VATTypeSelect
                            value={entry.vatTypeId.toString()}
                            onValueChange={(value) => updateIncomeEntry(index, 'vatTypeId', parseInt(value))}
                            placeholder="VAT..."
                          />
                        </td>
                        <td className="p-4">
                          <SearchableSelect
                            options={bankAccounts.map(account => ({
                              value: account.id.toString(),
                              label: account.accountName,
                              subtext: account.accountNumber || account.bankName || ''
                            }))}
                            value={entry.bankAccountId?.toString() || ''}
                            onValueChange={(value) => updateIncomeEntry(index, 'bankAccountId', value ? parseInt(value) : 0)}
                            placeholder="Select bank account..."
                            clearable
                          />
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

          {/* Expense Header with Summary Cards and Controls */}
          <div className="bg-slate-700 dark:bg-slate-800 p-4 rounded-lg">
            {/* Summary Cards in Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {/* Sub Total Card */}
                <div className="bg-green-600 px-4 py-2 rounded-lg">
                  <div className="text-xs font-medium text-green-100">SUBTOTAL (EXCL VAT)</div>
                  <div className="text-lg font-bold text-white">
                    R {expenseCalculations.subtotalExclVAT}
                  </div>
                </div>
                
                {/* Total VAT Card */}
                <div className="bg-orange-600 px-4 py-2 rounded-lg">
                  <div className="text-xs font-medium text-orange-100">TOTAL VAT</div>
                  <div className="text-lg font-bold text-white">
                    R {expenseCalculations.totalVAT}
                  </div>
                </div>
                
                {/* Grand Total Card */}
                <div className="bg-red-600 px-4 py-2 rounded-lg">
                  <div className="text-xs font-medium text-red-100">GRAND TOTAL</div>
                  <div className="text-xl font-bold text-white">
                    R {expenseCalculations.grandTotal}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="quickDateExpense" className="text-sm font-medium text-slate-200">Date Range:</Label>
                  <Input
                    id="quickDateExpense"
                    type="date"
                    value={quickDate}
                    onChange={(e) => setQuickDate(e.target.value)}
                    className="w-40"
                  />
                  <span className="text-sm text-slate-400">to</span>
                  <Input
                    type="date"
                    value={quickDate}
                    className="w-40"
                  />
                  <Button variant="outline" size="sm" onClick={applyQuickDateToAll} className="border-slate-500 text-slate-200 hover:bg-slate-600">
                    Apply to All
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
              {/* Script Auto-Match Button (Primary) */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleScriptAutoMatch}
                disabled={scriptAutoMatchMutation.isPending || expenseEntries.length === 0}
                className="bg-gradient-to-r from-green-500 to-teal-500 text-white border-0 hover:from-green-600 hover:to-teal-600"
              >
                {scriptAutoMatchMutation.isPending ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-pulse" />
                    Matching...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Script Auto-Match
                  </>
                )}
              </Button>

              {/* AI Auto-Match Button (Secondary) */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAiAutoMatch}
                disabled={isAiMatching || expenseEntries.length === 0}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 hover:from-purple-600 hover:to-blue-600"
              >
                {isAiMatching ? (
                  <>
                    <Bot className="w-4 h-4 mr-2 animate-pulse" />
                    AI Matching... {aiMatchingProgress}%
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Auto-Match
                  </>
                )}
              </Button>
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
          </div>

          {/* Expense Entry Table */}
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
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
                      <tr key={index} className={`border-b-2 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'
                      } ${
                        autoMatchedEntries.has(index) ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-300' : ''
                      }`}>
                        <td className="p-3">
                          <Input
                            type="date"
                            value={entry.transactionDate}
                            onChange={(e) => updateExpenseEntry(index, 'transactionDate', e.target.value)}
                            className="w-full"
                          />
                        </td>
                        <td className="p-3">
                          <SearchableSelect
                            options={chartOfAccounts
                              .filter(account => account.accountType === 'Expense' || account.accountType === 'Cost of Goods Sold')
                              .map(account => ({
                                value: account.id.toString(),
                                label: account.accountName,
                                subtext: account.accountCode
                              }))}
                            value={entry.categoryId.toString()}
                            onValueChange={(value) => {
                              const accountId = parseInt(value);
                              updateExpenseEntry(index, 'categoryId', accountId);
                              
                              // Auto-populate description from chart of accounts
                              if (accountId) {
                                const selectedAccount = chartOfAccounts.find(acc => acc.id === accountId);
                                if (selectedAccount && !entry.description) {
                                  updateExpenseEntry(index, 'description', selectedAccount.accountName + ' expense');
                                }
                              }
                            }}
                            placeholder="Select expense account..."
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <Textarea
                              value={entry.description}
                              onChange={(e) => updateExpenseEntry(index, 'description', e.target.value)}
                              placeholder="Expense description..."
                              className="w-full min-h-[2.5rem] resize-y bg-blue-50 border-blue-200 focus:bg-blue-100 focus:border-blue-300"
                              rows={1}
                            />
                            {autoMatchedEntries.has(index) && (
                              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 text-xs">
                                <Sparkles className="w-3 h-3 mr-1" />
                                AI
                              </Badge>
                            )}
                          </div>
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
                          <SearchableSelect
                            options={suppliers.map(supplier => ({
                              value: supplier.id.toString(),
                              label: supplier.name,
                              subtext: supplier.email || supplier.phone || ''
                            }))}
                            value={entry.supplierId?.toString() || ''}
                            onValueChange={(value) => updateExpenseEntry(index, 'supplierId', value ? parseInt(value) : 0)}
                            placeholder="Select supplier..."
                            clearable
                          />
                        </td>
                        <td className="p-3">
                          <VATTypeSelect
                            value={entry.vatTypeId.toString()}
                            onValueChange={(value) => updateExpenseEntry(index, 'vatTypeId', parseInt(value))}
                            placeholder="VAT..."
                          />
                        </td>
                        <td className="p-3">
                          <SearchableSelect
                            options={bankAccounts.map(account => ({
                              value: account.id.toString(),
                              label: account.accountName,
                              subtext: account.accountNumber || account.bankName || ''
                            }))}
                            value={entry.bankAccountId?.toString() || ''}
                            onValueChange={(value) => updateExpenseEntry(index, 'bankAccountId', value ? parseInt(value) : 0)}
                            placeholder="Select bank account..."
                            clearable
                          />
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
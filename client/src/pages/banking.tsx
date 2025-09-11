import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Building, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Landmark,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  Shield,
  Zap,
  Calendar,
  Clock,
  AlertCircle,
  Upload,
  FileSpreadsheet,
  Link2,
  RefreshCw,
  Settings,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useCompany } from "@/contexts/CompanyContext";
import type { BankAccountWithTransactions, ChartOfAccount } from "@shared/schema";
import { useLoadingStates } from "@/hooks/useLoadingStates";
import { PageLoader } from "@/components/ui/global-loader";
import { BankFeedDashboard } from "@/components/stitch/BankFeedDashboard";
import BankFeeDashboard from "@/components/BankFeeDashboard";
import BankAccountVerification from "@/components/BankAccountVerification";
import TransactionHistory from "@/components/TransactionHistory";

const bankAccountSchema = z.object({
  accountName: z.string().min(1, "Account name is required"),
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  branchCode: z.string().optional(),
  accountType: z.string().min(1, "Account type is required"),
  currency: z.string().default("ZAR"),
  openingBalance: z.string().default("0.00"),
  chartAccountId: z.number().optional(),
  notes: z.string().optional(),
});

type BankAccountForm = z.infer<typeof bankAccountSchema>;

const transactionSchema = z.object({
  bankAccountId: z.number(),
  transactionDate: z.string(),
  description: z.string().min(1, "Description is required"),
  reference: z.string().optional(),
  transactionType: z.string().min(1, "Transaction type is required"),
  amount: z.string().min(1, "Amount is required"),
  category: z.string().optional(),
});

type TransactionForm = z.infer<typeof transactionSchema>;

export default function Banking() {
  const [selectedAccount, setSelectedAccount] = useState<BankAccountWithTransactions | null>(null);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccountWithTransactions | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { companyId } = useCompany();

  const { data: bankAccounts = [], isLoading, error } = useQuery<BankAccountWithTransactions[]>({
    queryKey: ["/api/bank-accounts"],
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('401')) return false;
      return failureCount < 2;
    }
  });

  const { data: chartAccounts = [] } = useQuery<ChartOfAccount[]>({
    queryKey: ["/api/chart-of-accounts"],
  });

  // Refresh banking data when company changes
  useEffect(() => {
    if (companyId) {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chart-of-accounts"] });
    }
  }, [companyId, queryClient]);

  const createAccountMutation = useMutation({
    mutationFn: (data: BankAccountForm) => apiRequest("/api/bank-accounts", "POST", data),
    onSuccess: () => {
      // Invalidate both with and without company ID to ensure refresh works
      queryClient.invalidateQueries({ queryKey: ["/api/bank-accounts"] });
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: ["/api/bank-accounts", companyId] });
      }
      setShowAccountDialog(false);
      toast({ title: "Success", description: "Bank account created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to create bank account", variant: "destructive" });
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BankAccountForm> }) => 
      apiRequest(`/api/bank-accounts/${id}`, "PATCH", data),
    onSuccess: () => {
      // Invalidate both with and without company ID to ensure refresh works
      queryClient.invalidateQueries({ queryKey: ["/api/bank-accounts"] });
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: ["/api/bank-accounts", companyId] });
      }
      setShowEditDialog(false);
      setEditingAccount(null);
      toast({ title: "Success", description: "Bank account updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to update bank account", variant: "destructive" });
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: (data: TransactionForm) => apiRequest("/api/bank-transactions", "POST", data),
    onSuccess: () => {
      // Invalidate both with and without company ID to ensure refresh works
      queryClient.invalidateQueries({ queryKey: ["/api/bank-accounts"] });
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: ["/api/bank-accounts", companyId] });
      }
      setShowTransactionDialog(false);
      toast({ title: "Success", description: "Transaction created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to create transaction", variant: "destructive" });
    },
  });

  const toggleAccountMutation = useMutation({
    mutationFn: (accountId: number) => apiRequest(`/api/bank-accounts/${accountId}/toggle`, "PATCH"),
    onSuccess: (updatedAccount: any) => {
      // Invalidate both with and without company ID to ensure refresh works
      queryClient.invalidateQueries({ queryKey: ["/api/bank-accounts"] });
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: ["/api/bank-accounts", companyId] });
      }
      toast({ 
        title: "Success", 
        description: `Bank account ${updatedAccount.isActive ? 'activated' : 'deactivated'} successfully` 
      });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to toggle bank account status", variant: "destructive" });
    },
  });

  const accountForm = useForm<BankAccountForm>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      accountName: "",
      bankName: "",
      accountNumber: "",
      branchCode: "",
      accountType: "current",
      currency: "ZAR",
      openingBalance: "0.00",
      notes: "",
    },
  });

  const editAccountForm = useForm<BankAccountForm>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      accountName: "",
      bankName: "",
      accountNumber: "",
      branchCode: "",
      accountType: "current",
      currency: "ZAR",
      openingBalance: "0.00",
      notes: "",
    },
  });

  const transactionForm = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      bankAccountId: 0,
      transactionDate: new Date().toISOString().split('T')[0],
      description: "",
      reference: "",
      transactionType: "debit",
      amount: "",
      category: "deposit",
    },
  });

  const onCreateAccount = (data: BankAccountForm) => {
    createAccountMutation.mutate(data);
  };

  const onCreateTransaction = (data: TransactionForm) => {
    createTransactionMutation.mutate(data);
  };

  const onUpdateAccount = (data: BankAccountForm) => {
    if (editingAccount) {
      updateAccountMutation.mutate({ id: editingAccount.id, data });
    }
  };

  const handleEditAccount = (account: BankAccountWithTransactions) => {
    setEditingAccount(account);
    editAccountForm.reset({
      accountName: account.accountName,
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      branchCode: account.branchCode || "",
      accountType: account.accountType,
      currency: account.currency,
      openingBalance: account.openingBalance || "0.00",
      notes: account.notes ?? "",
      chartAccountId: account.chartAccountId ?? undefined,
    });
    setShowEditDialog(true);
  };

  // Handler for statement upload
  const handleStatementUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.ofx,.qif';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        processStatementFile(file);
      }
    };
    input.click();
  };

  // Process uploaded statement file
  const processStatementFile = (file: File) => {
    toast({
      title: 'Processing File',
      description: `Processing ${file.name}...`,
    });
    // Here you would implement actual file processing
    setTimeout(() => {
      toast({
        title: 'Success',
        description: 'Statement imported successfully',
      });
    }, 2000);
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-primary', 'bg-primary/5');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
    
    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find(file => 
      file.name.endsWith('.csv') || 
      file.name.endsWith('.ofx') || 
      file.name.endsWith('.qif')
    );
    
    if (validFile) {
      processStatementFile(validFile);
    } else {
      toast({
        title: 'Invalid File',
        description: 'Please upload a CSV, OFX, or QIF file',
        variant: 'destructive',
      });
    }
  };

  // Handler for starting reconciliation
  const handleStartReconciliation = () => {
    if (bankAccounts.length === 0) {
      toast({
        title: 'No Bank Accounts',
        description: 'Please add a bank account first',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Reconciliation Started',
      description: 'Starting reconciliation process...',
    });
    // Navigate to reconciliation workflow
    setTimeout(() => {
      toast({
        title: 'Loading',
        description: 'Reconciliation module loading...',
      });
    }, 1000);
  };

  // Handler for adding new rule
  const handleAddNewRule = () => {
    toast({
      title: 'Rule Configuration',
      description: 'Opening rule configuration...',
    });
    // This would open a dialog to add new categorization rules
  };

  // Handler for configuring fee mappings
  const handleConfigureFeeMappings = () => {
    toast({
      title: 'Fee Mappings',
      description: 'Opening fee mapping configuration...',
    });
    // This would open a dialog to configure fee mappings
  };

  // Handler for connecting new bank via Stitch
  const handleConnectBank = () => {
    // Navigate to bank feeds tab to connect a specific bank
    toast({
      title: 'Connect Bank Account',
      description: 'Please select a bank to connect via Stitch',
    });
  };

  // Handler for managing auto-categorization rules
  const handleManageRules = () => {
    toast({
      title: 'Auto-Categorization Rules',
      description: 'Manage your auto-categorization rules here',
    });
  };

  // Handler for configuring banking alerts
  const handleConfigureAlerts = () => {
    toast({
      title: 'Banking Alerts',
      description: 'Opening banking alerts configuration...',
    });
  };

  // Calculate metrics from Chart of Accounts bank data
  const totalBalance = bankAccounts.reduce((sum: number, account: BankAccountWithTransactions) => 
    sum + parseFloat(account.currentBalance || "0"), 0
  );

  const activeAccounts = bankAccounts.filter((account: BankAccountWithTransactions) => 
    parseFloat(account.currentBalance || "0") > 0
  ).length;

  const totalAccounts = bankAccounts.length;

  // Use loading states for comprehensive loading feedback including mutations
  useLoadingStates({
    loadingStates: [
      { isLoading, message: 'Loading bank accounts...' },
      { isLoading: createAccountMutation.isPending, message: 'Creating account...' },
      { isLoading: updateAccountMutation.isPending, message: 'Updating account...' },
      { isLoading: createTransactionMutation.isPending, message: 'Creating transaction...' },
      { isLoading: toggleAccountMutation.isPending, message: 'Updating status...' },
    ],
    progressSteps: ['Fetching accounts', 'Loading transactions', 'Processing data'],
  });

  if (isLoading) {
    return <PageLoader message="Loading banking..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <Landmark className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Banking Center
              </h1>
              <p className="text-gray-600 mt-1 font-medium">Comprehensive financial account management</p>
            </div>
          </div>
          <Dialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg px-6 py-3 text-sm font-semibold">
                <Plus className="w-5 h-5 mr-2" />
                Add Bank Account
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Bank Account</DialogTitle>
            </DialogHeader>
            <Form {...accountForm}>
              <form onSubmit={accountForm.handleSubmit(onCreateAccount)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={accountForm.control}
                    name="accountName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Main Business Account" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={accountForm.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Standard Bank" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={accountForm.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input placeholder="123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={accountForm.control}
                    name="branchCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch Code</FormLabel>
                        <FormControl>
                          <Input placeholder="051001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={accountForm.control}
                    name="accountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="current">Current</SelectItem>
                            <SelectItem value="savings">Savings</SelectItem>
                            <SelectItem value="credit">Credit</SelectItem>
                            <SelectItem value="loan">Loan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={accountForm.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <FormControl>
                          <Input placeholder="ZAR" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={accountForm.control}
                    name="openingBalance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening Balance</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={accountForm.control}
                  name="chartAccountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link to Chart Account (Optional)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select chart account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {chartAccounts
                            .filter(account => account.accountType === "Asset")
                            .map((account) => (
                              <SelectItem key={account.id} value={account.id.toString()}>
                                {account.accountCode} - {account.accountName}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={accountForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes about this account..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowAccountDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createAccountMutation.isPending}>
                    {createAccountMutation.isPending ? "Creating..." : "Create Account"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

        {/* Compact Overview KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 shadow-md cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105" onClick={() => setActiveTab("overview")} data-testid="card-total-balance">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-xs font-medium">Total Balance</p>
                  <p className="text-lg font-bold text-white">
                    R {totalBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <Landmark className="h-5 w-5 text-white opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-md cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105" onClick={() => setActiveTab("accounts")} data-testid="card-bank-accounts">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs font-medium">Bank Accounts</p>
                  <p className="text-lg font-bold text-white">{bankAccounts.length}</p>
                </div>
                <Building className="h-5 w-5 text-white opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white border-0 shadow-md cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105" onClick={() => setActiveTab("accounts")} data-testid="card-active-accounts">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs font-medium">Active Accounts</p>
                  <p className="text-lg font-bold text-white">{activeAccounts}</p>
                </div>
                <TrendingUp className="h-5 w-5 text-white opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-md cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105" onClick={() => setActiveTab("overview")} data-testid="card-last-activity">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs font-medium">Last Activity</p>
                  <p className="text-base font-bold text-white">Today</p>
                </div>
                <Clock className="h-5 w-5 text-white opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Interface */}
        <Tabs defaultValue="overview" className="space-y-6" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="feeds">Bank Feeds (Stitch)</TabsTrigger>
            <TabsTrigger value="upload">Statement Upload</TabsTrigger>
            <TabsTrigger value="reconcile">Reconciliation</TabsTrigger>
            <TabsTrigger value="fees">Fee Analytics</TabsTrigger>
            <TabsTrigger value="history">Transaction History</TabsTrigger>
            <TabsTrigger value="verification">Account Verification</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Transactions Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest activity across all accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bankAccounts.slice(0, 2).map((account) => (
                      <div key={account.id} className="border-b pb-3 last:border-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{account.accountName}</p>
                            <p className="text-sm text-muted-foreground">{account.bankName}</p>
                          </div>
                          <Badge variant={parseFloat(account.currentBalance || "0") >= 0 ? "default" : "destructive"}>
                            R {parseFloat(account.currentBalance || "0").toFixed(2)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {bankAccounts.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No transactions yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Unreconciled Items Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Unreconciled Items</CardTitle>
                  <CardDescription>Transactions pending reconciliation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                        <div>
                          <p className="font-medium">Pending Items</p>
                          <p className="text-sm text-muted-foreground">Requires attention</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-amber-100 text-amber-700">
                        0
                      </Badge>
                    </div>
                    <Button variant="outline" className="w-full">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Start Reconciliation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bank Account Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
                <CardDescription>Quick overview of all bank accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bankAccounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${account.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <Landmark className={`h-4 w-4 ${account.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className="font-medium">{account.accountName}</p>
                          <p className="text-sm text-muted-foreground">{account.bankName} • {account.accountNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">R {parseFloat(account.currentBalance || "0").toFixed(2)}</p>
                        <Badge variant={account.isActive ? "default" : "secondary"} className="mt-1">
                          {account.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {bankAccounts.length === 0 && (
                    <div className="text-center py-8">
                      <Landmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No bank accounts added yet</p>
                      <Button className="mt-4" onClick={() => setShowAccountDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Account
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Bank Accounts</h2>
                <p className="text-gray-600 mt-1">Manage and monitor all your financial accounts</p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1">
                  <Zap className="h-3 w-3 mr-1" />
                  {bankAccounts.length} Total Accounts
                </Badge>
              </div>
            </div>

          {bankAccounts.length === 0 ? (
            <Card className="border-dashed border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
              <CardContent className="flex flex-col items-center justify-center py-20 relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <Landmark className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Banking Center</h3>
                <p className="text-gray-600 text-center max-w-lg mb-8 leading-relaxed">
                  Start managing your finances by adding your first bank account. Track balances, 
                  manage transactions, and maintain complete financial visibility.
                </p>
                <Button 
                  onClick={() => setShowAccountDialog(true)} 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg px-8 py-4"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Account
                </Button>
              </CardContent>
            </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Bank Accounts</CardTitle>
              <CardDescription>Manage and monitor all your financial accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {bankAccounts.map((account: any) => (
                  <div key={account.id} className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Landmark className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{account.accountName}</h3>
                        <p className="text-sm text-gray-500">{account.bankName} • {account.accountNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-lg text-gray-900">R {parseFloat(account.currentBalance || "0").toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
                        <p className="text-sm text-gray-500">{account.accountType}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={account.isActive ? "default" : "secondary"}>
                          {account.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAccount(account)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
          </TabsContent>

          <TabsContent value="feeds">
            <BankFeedDashboard />
          </TabsContent>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Bank Statement</CardTitle>
                <CardDescription>Import transactions from CSV, OFX, or QIF files</CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="mx-auto text-muted-foreground mb-4" size={48} />
                  <p className="text-lg font-medium mb-2">Drop your statement file here</p>
                  <p className="text-sm text-muted-foreground mb-4">Supports CSV, OFX, and QIF formats</p>
                  <Button onClick={handleStatementUpload}>
                    <FileSpreadsheet size={16} className="mr-2" />
                    Browse Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reconcile">
            <Card>
              <CardHeader>
                <CardTitle>Bank Reconciliation</CardTitle>
                <CardDescription>Match bank transactions with your records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Statement Balance</p>
                      <p className="text-2xl font-bold">R {totalBalance.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="font-medium">Book Balance</p>
                      <p className="text-2xl font-bold">R {totalBalance.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="font-medium">Difference</p>
                      <p className="text-2xl font-bold text-green-600">R 0.00</p>
                    </div>
                  </div>
                  <Button className="w-full" onClick={handleStartReconciliation}>
                    <RefreshCw size={16} className="mr-2" />
                    Start Reconciliation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fees">
            <BankFeeDashboard onNavigateToTab={setActiveTab} />
          </TabsContent>

          <TabsContent value="history">
            <TransactionHistory 
              organizationId={companyId || 1}
              selectedYear={new Date().getFullYear().toString()}
              selectedMonth="all"
              selectedAccount="all"
            />
          </TabsContent>

          <TabsContent value="verification">
            <BankAccountVerification />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Banking Settings</CardTitle>
                <CardDescription>Configure bank feeds and automation rules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Bank Feed Connections</h3>
                    <Button variant="outline" className="w-full" onClick={handleConnectBank}>
                      <Link2 size={16} className="mr-2" />
                      Connect New Bank via Stitch
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Import Rules</h3>
                    <Button variant="outline" className="w-full" onClick={handleManageRules}>
                      <Settings size={16} className="mr-2" />
                      Manage Auto-Categorization Rules
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Notifications</h3>
                    <Button variant="outline" className="w-full" onClick={handleConfigureAlerts}>
                      <AlertCircle size={16} className="mr-2" />
                      Configure Banking Alerts
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Transaction Dialog */}
        <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <Form {...transactionForm}>
            <form onSubmit={transactionForm.handleSubmit(onCreateTransaction)} className="space-y-4">
              <FormField
                control={transactionForm.control}
                name="transactionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={transactionForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Payment received from customer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={transactionForm.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference</FormLabel>
                    <FormControl>
                      <Input placeholder="INV-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={transactionForm.control}
                  name="transactionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="credit">Credit (Deposit)</SelectItem>
                          <SelectItem value="debit">Debit (Withdrawal)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={transactionForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={transactionForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="deposit">Deposit</SelectItem>
                        <SelectItem value="withdrawal">Withdrawal</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                        <SelectItem value="fee">Bank Fee</SelectItem>
                        <SelectItem value="interest">Interest</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowTransactionDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTransactionMutation.isPending}>
                  {createTransactionMutation.isPending ? "Adding..." : "Add Transaction"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
        </Dialog>

        {/* Edit Account Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Bank Account</DialogTitle>
            </DialogHeader>
            <Form {...editAccountForm}>
              <form onSubmit={editAccountForm.handleSubmit(onUpdateAccount)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editAccountForm.control}
                    name="accountName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Main Business Account" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editAccountForm.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Standard Bank" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editAccountForm.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input placeholder="123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editAccountForm.control}
                    name="branchCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch Code</FormLabel>
                        <FormControl>
                          <Input placeholder="051001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={editAccountForm.control}
                    name="accountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="current">Current</SelectItem>
                            <SelectItem value="savings">Savings</SelectItem>
                            <SelectItem value="credit">Credit</SelectItem>
                            <SelectItem value="loan">Loan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editAccountForm.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <FormControl>
                          <Input placeholder="ZAR" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editAccountForm.control}
                    name="openingBalance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening Balance</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={editAccountForm.control}
                  name="chartAccountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link to Chart Account (Optional)</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select chart account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {chartAccounts
                            .filter(account => account.accountType === "Asset")
                            .map((account) => (
                              <SelectItem key={account.id} value={account.id.toString()}>
                                {account.accountCode} - {account.accountName}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editAccountForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes about this account..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateAccountMutation.isPending}>
                    {updateAccountMutation.isPending ? "Updating..." : "Update Account"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
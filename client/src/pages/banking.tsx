import { useState } from "react";
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
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import type { BankAccountWithTransactions, ChartOfAccount } from "@shared/schema";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bankAccounts = [], isLoading, error } = useQuery({
    queryKey: ["/api/bank-accounts"],
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('401')) return false;
      return failureCount < 2;
    }
  });

  const { data: chartAccounts = [] } = useQuery<ChartOfAccount[]>({
    queryKey: ["/api/chart-of-accounts"],
  });

  const createAccountMutation = useMutation({
    mutationFn: (data: BankAccountForm) => apiRequest("/api/bank-accounts", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-accounts"] });
      setShowAccountDialog(false);
      toast({ title: "Success", description: "Bank account created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to create bank account", variant: "destructive" });
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: (data: TransactionForm) => apiRequest("/api/bank-transactions", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-accounts"] });
      setShowTransactionDialog(false);
      toast({ title: "Success", description: "Transaction created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to create transaction", variant: "destructive" });
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

  const totalBalance = bankAccounts.reduce((sum: number, account: BankAccountWithTransactions) => 
    sum + parseFloat(account.currentBalance), 0
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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

        {/* Advanced Overview Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 shadow-xl shadow-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium mb-1">Total Balance</p>
                  <p className="text-3xl font-bold text-white">
                    R {totalBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-emerald-200 text-xs mt-1">All accounts combined</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-xl shadow-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Bank Accounts</p>
                  <p className="text-3xl font-bold text-white">{bankAccounts.length}</p>
                  <p className="text-blue-200 text-xs mt-1">Total registered</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <Building className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white border-0 shadow-xl shadow-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium mb-1">Active Accounts</p>
                  <p className="text-3xl font-bold text-white">
                    {bankAccounts.filter((account: BankAccountWithTransactions) => account.isActive).length}
                  </p>
                  <p className="text-purple-200 text-xs mt-1">With positive balance</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-xl shadow-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium mb-1">Last Activity</p>
                  <p className="text-2xl font-bold text-white">Today</p>
                  <p className="text-orange-200 text-xs mt-1">Recent transaction</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <Clock className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Bank Accounts Section */}
        <div className="space-y-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bankAccounts.map((account: BankAccountWithTransactions) => (
              <Card key={account.id} className="group relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-gray-100 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
                {/* Bank Card Style Header */}
                <div className={`h-40 bg-gradient-to-br ${
                  account.accountType === 'current' 
                    ? 'from-blue-600 via-indigo-600 to-purple-700' 
                    : account.accountType === 'savings'
                    ? 'from-green-600 via-emerald-600 to-teal-700'
                    : account.accountType === 'credit'
                    ? 'from-red-600 via-pink-600 to-rose-700'
                    : 'from-gray-600 via-slate-600 to-zinc-700'
                } relative overflow-hidden`}>
                  {/* Bank Card Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                  <div className="absolute top-4 right-4 w-12 h-8 bg-white/20 rounded backdrop-blur-sm"></div>
                  
                  <CardContent className="p-6 relative z-10 h-full flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div className="text-white">
                        <p className="text-white/80 text-xs font-medium uppercase tracking-wider">{account.bankName}</p>
                        <h3 className="text-white font-bold text-lg mt-1 leading-tight">{account.accountName}</h3>
                      </div>
                      <Badge className={`${
                        account.isActive 
                          ? 'bg-green-500/20 text-green-100 border-green-300/30' 
                          : 'bg-gray-500/20 text-gray-200 border-gray-300/30'
                      } backdrop-blur-sm`}>
                        {account.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                    <div className="text-white mt-4">
                      <p className="text-white/70 text-sm mb-2 font-medium">Available Balance</p>
                      <p className="text-3xl font-bold leading-none">
                        R {parseFloat(account.currentBalance).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </CardContent>
                </div>

                {/* Account Details */}
                <CardContent className="p-6 space-y-4">
                  {/* Account Information */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">Account Number</p>
                        <div className="flex items-center space-x-2">
                          <p className="font-mono text-sm text-gray-800">****{account.accountNumber.slice(-4)}</p>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-blue-100">
                            <Eye className="h-3 w-3 text-gray-500" />
                          </Button>
                        </div>
                      </div>
                      {account.branchCode && (
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">Branch Code</p>
                          <p className="font-mono text-sm text-gray-800">{account.branchCode}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3 mt-3">
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs px-2 py-1">
                        <CreditCard className="h-3 w-3 mr-1" />
                        {account.accountType}
                      </Badge>
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs px-2 py-1">
                        {account.currency}
                      </Badge>
                    </div>
                  </div>

                  {/* Chart of Accounts Link */}
                  {account.chartAccount && (
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <Shield className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-emerald-700 mb-1">Linked to Chart of Accounts</p>
                          <p className="text-xs text-emerald-600">
                            {account.chartAccount.accountCode} - {account.chartAccount.accountName}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-2">
                    <Button
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-md"
                      size="sm"
                      onClick={() => {
                        setSelectedAccount(account);
                        setShowTransactionDialog(true);
                        transactionForm.setValue("bankAccountId", account.id);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Transaction
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="px-4 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>

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
      </div>
    </div>
  );
}
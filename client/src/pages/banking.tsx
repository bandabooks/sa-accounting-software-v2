import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Building, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banking</h1>
          <p className="text-gray-600 mt-1">Manage bank accounts and transactions</p>
        </div>
        <Dialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R {totalBalance.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bank Accounts</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bankAccounts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bankAccounts.filter((account: BankAccountWithTransactions) => account.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Transaction</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Today</div>
          </CardContent>
        </Card>
      </div>

      {/* Bank Accounts Grid */}
      <div className="space-y-6">
        {bankAccounts.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300 bg-gray-50/50">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Building className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No bank accounts found</h3>
              <p className="text-gray-500 text-center max-w-md mb-6">
                Get started by adding your first bank account to manage transactions and reconciliations.
              </p>
              <Button onClick={() => setShowAccountDialog(true)} size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Bank Account
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bankAccounts.map((account: BankAccountWithTransactions) => (
              <Card key={account.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold">{account.accountName}</CardTitle>
                        <p className="text-sm text-gray-500">{account.bankName}</p>
                      </div>
                    </div>
                    <Badge variant={account.isActive ? "default" : "secondary"}>
                      {account.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-center py-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Current Balance</p>
                    <p className="text-2xl font-bold text-gray-900">
                      R {parseFloat(account.currentBalance).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center justify-center space-x-2 mt-2">
                      <Badge variant="outline" className="text-xs">{account.accountType}</Badge>
                      <Badge variant="outline" className="text-xs">{account.currency}</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">Account Number</p>
                    <p className="font-mono text-sm">****{account.accountNumber.slice(-4)}</p>
                    {account.branchCode && (
                      <>
                        <p className="text-xs text-gray-500 mt-2">Branch Code</p>
                        <p className="font-mono text-sm">{account.branchCode}</p>
                      </>
                    )}
                  </div>

                  {account.chartAccount && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-xs text-green-700 font-medium mb-1">Chart of Accounts</p>
                      <p className="text-sm text-green-800">
                        {account.chartAccount.accountCode} - {account.chartAccount.accountName}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedAccount(account);
                        setShowTransactionDialog(true);
                        transactionForm.setValue("bankAccountId", account.id);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Transaction
                    </Button>
                    <Button variant="outline" size="sm">
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
  );
}
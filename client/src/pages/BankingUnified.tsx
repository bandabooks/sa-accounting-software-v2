import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { 
  Landmark, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Clock, 
  TrendingUp, DollarSign, Plus, ArrowLeft, Settings, Shield, Link2,
  RefreshCw, Download, Eye, ChevronRight, Building, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BankFeedDashboard } from "@/components/stitch/BankFeedDashboard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Bank Account Schema for form validation
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

export default function BankingUnified() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/banking/:accountId");
  const accountId = params?.accountId;
  
  // Get tab from URL query params
  const urlParams = new URLSearchParams(window.location.search);
  const tabFromUrl = urlParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update URL when tab changes
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    if (accountId) {
      navigate(`/banking/${accountId}?tab=${newTab}`);
    }
  };

  // Fetch all bank accounts from Chart of Accounts
  const { data: bankAccounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['/api/chart-of-accounts'],
    select: (data: any) => {
      if (!Array.isArray(data)) return [];
      return data.filter((account: any) => 
        account.accountType === 'Asset' && 
        account.accountCode >= '1110' && 
        account.accountCode <= '1199' &&
        account.isActive === true
      );
    }
  });

  // Fetch specific account details if accountId is provided
  const { data: selectedAccount } = useQuery({
    queryKey: accountId ? [`/api/chart-of-accounts/${accountId}`] : null,
    enabled: !!accountId,
  });

  // Fetch import batches for the selected account
  const { data: importBatches = [] } = useQuery({
    queryKey: accountId ? [`/api/bank/import-batches`, { bankAccountId: accountId }] : null,
    enabled: !!accountId,
  });

  // Create bank account mutation
  const createAccountMutation = useMutation({
    mutationFn: (data: BankAccountForm) => apiRequest("/api/bank-accounts", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chart-of-accounts"] });
      setShowAccountDialog(false);
      toast({ title: "Success", description: "Bank account created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create bank account", variant: "destructive" });
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

  const onCreateAccount = (data: BankAccountForm) => {
    createAccountMutation.mutate(data);
  };

  // Calculate metrics
  const totalBalance = bankAccounts.reduce((sum: number, account: any) => 
    sum + parseFloat(account.balance || "0"), 0
  );

  const activeAccounts = bankAccounts.filter((account: any) => 
    parseFloat(account.balance || "0") > 0
  ).length;

  // Mock data for reconciliation and transactions (would come from API in production)
  const mockTransactions = [
    { id: 1, date: "2025-01-15", description: "Client Payment", amount: 15000, type: "credit", status: "matched" },
    { id: 2, date: "2025-01-14", description: "Office Rent", amount: -8500, type: "debit", status: "unmatched" },
    { id: 3, date: "2025-01-13", description: "Supplier Invoice", amount: -3200, type: "debit", status: "matched" },
    { id: 4, date: "2025-01-12", description: "Bank Fees", amount: -150, type: "debit", status: "rule_matched" },
  ];

  const mockRules = [
    { id: 1, name: "Bank Fees Auto-Category", pattern: "Bank Fees", category: "Banking Fees", active: true },
    { id: 2, name: "Rent Payment", pattern: "Office Rent", category: "Operating Expenses", active: true },
    { id: 3, name: "Client Deposits", pattern: "Payment from", category: "Revenue", active: false },
  ];

  if (accountsLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading banking module...</p>
          </div>
        </div>
      </div>
    );
  }

  // If no account is selected, show accounts list
  if (!accountId) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Banking</h1>
            <p className="text-muted-foreground mt-2">
              Manage your bank accounts, transactions, and reconciliation
            </p>
          </div>
          <Button 
            onClick={() => setShowAccountDialog(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus size={16} className="mr-2" />
            Add Bank Account
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Balance</p>
                  <p className="text-2xl font-bold">R {totalBalance.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="text-green-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Accounts</p>
                  <p className="text-2xl font-bold">{activeAccounts}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CreditCard className="text-blue-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Accounts</p>
                  <p className="text-2xl font-bold">{bankAccounts.length}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Building className="text-purple-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Accounts List */}
        <Card>
          <CardHeader>
            <CardTitle>Bank Accounts</CardTitle>
            <CardDescription>Select an account to manage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bankAccounts.map((account: any) => (
                <div 
                  key={account.id}
                  onClick={() => navigate(`/banking/${account.id}?tab=overview`)}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Landmark className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium">{account.accountName}</p>
                      <p className="text-sm text-muted-foreground">{account.accountCode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">R {parseFloat(account.balance || "0").toFixed(2)}</p>
                      <Badge variant={parseFloat(account.balance || "0") >= 0 ? "default" : "destructive"}>
                        {account.accountType}
                      </Badge>
                    </div>
                    <ChevronRight className="text-muted-foreground" size={20} />
                  </div>
                </div>
              ))}
              {bankAccounts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No bank accounts found. Add your first account to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add Account Dialog */}
        <Dialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
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
                <div className="grid grid-cols-2 gap-4">
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
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes..." {...field} />
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
    );
  }

  // Account detail view with tabs
  const currentAccount = bankAccounts.find((acc: any) => acc.id === parseInt(accountId));
  
  if (!currentAccount) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <p className="text-muted-foreground">Account not found</p>
          <Button onClick={() => navigate('/banking')} className="mt-4">
            <ArrowLeft size={16} className="mr-2" />
            Back to Accounts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/banking">Banking</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{currentAccount.accountName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Account Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Landmark size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{currentAccount.accountName}</h1>
              <p className="text-white/80">{currentAccount.accountCode} • {currentAccount.accountType}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80">Current Balance</p>
            <p className="text-3xl font-bold">R {parseFloat(currentAccount.balance || "0").toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="feeds">Feeds</TabsTrigger>
          <TabsTrigger value="upload">Statement Upload</TabsTrigger>
          <TabsTrigger value="reconcile">Reconcile</TabsTrigger>
          <TabsTrigger value="rules">Rules & Fees</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-xl font-bold text-green-600">+R 45,200.00</p>
                  </div>
                  <TrendingUp className="text-green-600" size={24} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-xl font-bold">R 12,350.00</p>
                  </div>
                  <Clock className="text-yellow-600" size={24} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Unreconciled</p>
                    <p className="text-xl font-bold text-orange-600">15 items</p>
                  </div>
                  <AlertCircle className="text-orange-600" size={24} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockTransactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{txn.description}</p>
                      <p className="text-sm text-muted-foreground">{txn.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={txn.status === 'matched' ? 'default' : txn.status === 'rule_matched' ? 'secondary' : 'outline'}>
                        {txn.status.replace('_', ' ')}
                      </Badge>
                      <span className={`font-semibold ${txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        R {Math.abs(txn.amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="mx-auto text-muted-foreground mb-4" size={48} />
                <p className="text-lg font-medium mb-2">Drop your statement file here</p>
                <p className="text-sm text-muted-foreground mb-4">Supports CSV, OFX, and QIF formats</p>
                <Button>
                  <FileSpreadsheet size={16} className="mr-2" />
                  Browse Files
                </Button>
              </div>

              {importBatches.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold">Recent Uploads</h3>
                  {importBatches.slice(0, 3).map((batch: any) => (
                    <div key={batch.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="text-muted-foreground" size={20} />
                        <div>
                          <p className="font-medium">{batch.fileName}</p>
                          <p className="text-sm text-muted-foreground">{batch.uploadedAt}</p>
                        </div>
                      </div>
                      <Badge>{batch.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
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
                    <p className="text-2xl font-bold">R {parseFloat(currentAccount.balance || "0").toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Book Balance</p>
                    <p className="text-2xl font-bold">R {parseFloat(currentAccount.balance || "0").toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Difference</p>
                    <p className="text-2xl font-bold text-green-600">R 0.00</p>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Unreconciled Transactions</h3>
                  <div className="space-y-2">
                    {mockTransactions.filter(t => t.status === 'unmatched').map((txn) => (
                      <div key={txn.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{txn.description}</p>
                          <p className="text-sm text-muted-foreground">{txn.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button size="sm" variant="outline">Match</Button>
                          <span className={`font-semibold ${txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            R {Math.abs(txn.amount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>Bank Rules & Fees</CardTitle>
              <CardDescription>Automate transaction categorization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full">
                  <Plus size={16} className="mr-2" />
                  Add New Rule
                </Button>
                
                {mockRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{rule.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Pattern: "{rule.pattern}" → {rule.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={rule.active ? "default" : "secondary"}>
                        {rule.active ? "Active" : "Inactive"}
                      </Badge>
                      <Button size="sm" variant="outline">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage account preferences and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Account Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Account Number</p>
                      <p className="font-medium">****1234</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Branch Code</p>
                      <p className="font-medium">051001</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Account Type</p>
                      <p className="font-medium">{currentAccount.accountType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Currency</p>
                      <p className="font-medium">ZAR</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Permissions</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <Shield className="text-muted-foreground" size={20} />
                        <div>
                          <p className="font-medium">View Access</p>
                          <p className="text-sm text-muted-foreground">All staff members</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Manage</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <Shield className="text-muted-foreground" size={20} />
                        <div>
                          <p className="font-medium">Edit Access</p>
                          <p className="text-sm text-muted-foreground">Finance team only</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Manage</Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline">Export Account Data</Button>
                  <Button variant="destructive">Close Account</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
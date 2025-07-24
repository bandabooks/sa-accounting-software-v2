import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, CheckCircle, AlertCircle, Landmark, Calendar, DollarSign, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency, formatDate } from "@/lib/utils";

interface BankAccount {
  id: number;
  accountName: string;
  accountNumber: string;
  bankName: string;
  currentBalance: string;
}

interface BankReconciliation {
  id: number;
  bankAccountId: number;
  reconciliationDate: string;
  statementBalance: string;
  bookBalance: string;
  difference: string;
  status: string;
  reconciliationType: string;
  notes?: string;
  createdAt: string;
}

interface UnmatchedTransaction {
  id: number;
  transactionDate: string;
  description: string;
  amount: string;
  transactionType: string;
  reference?: string;
  status: string;
}

export default function BankReconciliation() {
  const [activeTab, setActiveTab] = useState("reconciliations");
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>("");
  const [selectedTransactions, setSelectedTransactions] = useState<number[]>([]);
  const { toast } = useToast();

  // Fetch bank accounts
  const { data: bankAccounts = [], isLoading: accountsLoading } = useQuery<BankAccount[]>({
    queryKey: ["/api/bank-accounts"],
  });

  // Fetch bank reconciliations
  const { data: reconciliations = [], isLoading: reconciliationsLoading } = useQuery<BankReconciliation[]>({
    queryKey: ["/api/bank-reconciliations"],
  });

  // Fetch unmatched transactions for selected bank account
  const { data: unmatchedTransactions = [], isLoading: transactionsLoading } = useQuery<UnmatchedTransaction[]>({
    queryKey: ["/api/bank-accounts", selectedBankAccount, "unmatched-transactions"],
    enabled: !!selectedBankAccount,
  });

  // Auto-match transactions mutation
  const matchTransactionsMutation = useMutation({
    mutationFn: (reconciliationId: number) => 
      apiRequest(`/api/bank-reconciliations/${reconciliationId}/match`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-reconciliations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bank-accounts"] });
      toast({ title: "Success", description: "Transactions matched successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to match transactions", variant: "destructive" });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "pending": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalReconciliations = reconciliations.length;
  const pendingReconciliations = reconciliations.filter(r => r.status === "pending").length;
  const completedReconciliations = reconciliations.filter(r => r.status === "completed").length;

  const handleTransactionSelect = (transactionId: number, checked: boolean) => {
    if (checked) {
      setSelectedTransactions([...selectedTransactions, transactionId]);
    } else {
      setSelectedTransactions(selectedTransactions.filter(id => id !== transactionId));
    }
  };

  if (accountsLoading || reconciliationsLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900">Bank Reconciliation</h1>
          <p className="text-gray-600 mt-1">Match your bank statements with accounting records</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Start Reconciliation
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reconciliations</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReconciliations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingReconciliations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedReconciliations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bank Accounts</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bankAccounts.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reconciliations">Reconciliation History</TabsTrigger>
          <TabsTrigger value="unmatched">Unmatched Transactions</TabsTrigger>
          <TabsTrigger value="matching">Auto Matching</TabsTrigger>
        </TabsList>

        <TabsContent value="reconciliations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bank Reconciliation History</CardTitle>
              <CardDescription>View and manage all bank reconciliations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reconciliations.length === 0 ? (
                  <div className="text-center py-8">
                    <Landmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Reconciliations Found</h3>
                    <p className="text-gray-600 mb-4">Start your first bank reconciliation</p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Start First Reconciliation
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Date</th>
                          <th className="text-left py-3 px-4 font-medium">Bank Account</th>
                          <th className="text-left py-3 px-4 font-medium">Statement Balance</th>
                          <th className="text-left py-3 px-4 font-medium">Book Balance</th>
                          <th className="text-left py-3 px-4 font-medium">Difference</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                          <th className="text-left py-3 px-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reconciliations.map((reconciliation) => {
                          const bankAccount = bankAccounts.find(acc => acc.id === reconciliation.bankAccountId);
                          return (
                            <tr key={reconciliation.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm">{formatDate(reconciliation.reconciliationDate)}</td>
                              <td className="py-3 px-4 text-sm">
                                {bankAccount ? `${bankAccount.accountName} (${bankAccount.accountNumber})` : "Unknown"}
                              </td>
                              <td className="py-3 px-4 text-sm">{formatCurrency(parseFloat(reconciliation.statementBalance))}</td>
                              <td className="py-3 px-4 text-sm">{formatCurrency(parseFloat(reconciliation.bookBalance))}</td>
                              <td className="py-3 px-4 text-sm">
                                <span className={parseFloat(reconciliation.difference) === 0 ? "text-green-600" : "text-red-600"}>
                                  {formatCurrency(parseFloat(reconciliation.difference))}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <Badge className={`capitalize ${getStatusColor(reconciliation.status)}`}>
                                  {reconciliation.status.replace('_', ' ')}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                  {reconciliation.status === "pending" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => matchTransactionsMutation.mutate(reconciliation.id)}
                                      disabled={matchTransactionsMutation.isPending}
                                    >
                                      <RefreshCw className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unmatched" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Unmatched Transactions</CardTitle>
                  <CardDescription>Transactions that need to be matched or reconciled</CardDescription>
                </div>
                <Select value={selectedBankAccount} onValueChange={setSelectedBankAccount}>
                  <SelectTrigger className="w-60">
                    <SelectValue placeholder="Select bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.accountName} ({account.accountNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedBankAccount ? (
                <div className="text-center py-8">
                  <Landmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select Bank Account</h3>
                  <p className="text-gray-600">Choose a bank account to view unmatched transactions</p>
                </div>
              ) : transactionsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : unmatchedTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All Transactions Matched</h3>
                  <p className="text-gray-600">No unmatched transactions found for this account</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      {unmatchedTransactions.length} unmatched transaction(s)
                    </p>
                    <Button 
                      disabled={selectedTransactions.length === 0}
                      variant="outline"
                    >
                      Match Selected ({selectedTransactions.length})
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">
                            <Checkbox
                              checked={selectedTransactions.length === unmatchedTransactions.length}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedTransactions(unmatchedTransactions.map(t => t.id));
                                } else {
                                  setSelectedTransactions([]);
                                }
                              }}
                            />
                          </th>
                          <th className="text-left py-3 px-4 font-medium">Date</th>
                          <th className="text-left py-3 px-4 font-medium">Description</th>
                          <th className="text-left py-3 px-4 font-medium">Amount</th>
                          <th className="text-left py-3 px-4 font-medium">Type</th>
                          <th className="text-left py-3 px-4 font-medium">Reference</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unmatchedTransactions.map((transaction) => (
                          <tr key={transaction.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <Checkbox
                                checked={selectedTransactions.includes(transaction.id)}
                                onCheckedChange={(checked) => handleTransactionSelect(transaction.id, checked as boolean)}
                              />
                            </td>
                            <td className="py-3 px-4 text-sm">{formatDate(transaction.transactionDate)}</td>
                            <td className="py-3 px-4 text-sm">{transaction.description}</td>
                            <td className="py-3 px-4 text-sm">
                              <span className={transaction.transactionType === "credit" ? "text-green-600" : "text-red-600"}>
                                {formatCurrency(parseFloat(transaction.amount))}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm capitalize">{transaction.transactionType}</td>
                            <td className="py-3 px-4 text-sm">{transaction.reference || "—"}</td>
                            <td className="py-3 px-4">
                              <Badge variant="outline">{transaction.status}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matching" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automatic Transaction Matching</CardTitle>
              <CardDescription>AI-powered transaction matching and reconciliation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Smart Matching</h3>
                <p className="text-gray-600 mb-4">Automatically match transactions using AI algorithms</p>
                <Button>Run Auto-Matching</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
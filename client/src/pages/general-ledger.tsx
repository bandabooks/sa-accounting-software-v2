import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Filter, Download, Calendar, TrendingUp, BookOpen, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { GeneralLedgerEntry, ChartOfAccount } from "@shared/schema";

export default function GeneralLedger() {
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (selectedAccount) queryParams.set("accountId", selectedAccount);
  if (startDate) queryParams.set("startDate", startDate);
  if (endDate) queryParams.set("endDate", endDate);

  const { data: ledgerEntries = [], isLoading } = useQuery<GeneralLedgerEntry[]>({
    queryKey: ["/api/general-ledger", queryParams.toString()],
    queryFn: async () => {
      const url = `/api/general-ledger${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch general ledger");
      return response.json();
    },
  });

  const { data: chartAccounts = [] } = useQuery<ChartOfAccount[]>({
    queryKey: ["/api/chart-of-accounts"],
  });

  const syncLedgerMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/general-ledger/sync", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/general-ledger"] });
      toast({ title: "Success", description: "General ledger synchronized successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to sync general ledger", variant: "destructive" });
    },
  });

  const handleSync = () => {
    syncLedgerMutation.mutate();
  };

  const handleExport = () => {
    // Export functionality would go here
    toast({ title: "Export", description: "Export functionality coming soon" });
  };

  const clearFilters = () => {
    setSelectedAccount("");
    setStartDate("");
    setEndDate("");
  };

  // Calculate totals
  const totalDebits = ledgerEntries.reduce((sum, entry) => sum + parseFloat(entry.debitAmount || "0"), 0);
  const totalCredits = ledgerEntries.reduce((sum, entry) => sum + parseFloat(entry.creditAmount || "0"), 0);
  const netChange = totalDebits - totalCredits;

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
          <h1 className="text-3xl font-bold text-gray-900">General Ledger</h1>
          <p className="text-gray-600 mt-1">View all accounting transactions and balances</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleSync} disabled={syncLedgerMutation.isPending}>
            <RefreshCw className={`w-4 h-4 mr-2 ${syncLedgerMutation.isPending ? "animate-spin" : ""}`} />
            {syncLedgerMutation.isPending ? "Syncing..." : "Sync Ledger"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ledgerEntries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R {totalDebits.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R {totalCredits.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Change</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R {netChange.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Filter transactions by account and date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Account</label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="All accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All accounts</SelectItem>
                  {chartAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.accountCode} - {account.accountName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <Filter className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* General Ledger Table */}
      <Card>
        <CardHeader>
          <CardTitle>General Ledger Entries</CardTitle>
          <CardDescription>
            All posted journal entries with running balances
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ledgerEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No entries found</h3>
              <p className="text-gray-500 text-center max-w-md">
                {selectedAccount || startDate || endDate
                  ? "No entries match your filter criteria. Try adjusting your filters."
                  : "No journal entries have been posted yet. Create journal entries to see them in the general ledger."}
              </p>
              {(selectedAccount || startDate || endDate) && (
                <Button className="mt-4" variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Entry #</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerEntries.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {new Date(entry.transactionDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.entryNumber}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{entry.accountCode}</div>
                          <div className="text-sm text-gray-500">{entry.accountName}</div>
                        </div>
                      </TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>
                        {entry.reference && (
                          <Badge variant="secondary" className="text-xs">
                            {entry.reference}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {parseFloat(entry.debitAmount) > 0 && (
                          <span className="text-green-600 font-medium">
                            R {parseFloat(entry.debitAmount).toFixed(2)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {parseFloat(entry.creditAmount) > 0 && (
                          <span className="text-red-600 font-medium">
                            R {parseFloat(entry.creditAmount).toFixed(2)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={parseFloat(entry.runningBalance) >= 0 ? 'text-green-600' : 'text-red-600'}>
                          R {parseFloat(entry.runningBalance).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {entry.sourceModule && (
                          <Badge variant="outline" className="text-xs">
                            {entry.sourceModule}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Footer */}
      {ledgerEntries.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-500">Total Debits</div>
                <div className="text-xl font-bold text-green-600">R {totalDebits.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Credits</div>
                <div className="text-xl font-bold text-red-600">R {totalCredits.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Difference</div>
                <div className={`text-xl font-bold ${Math.abs(totalDebits - totalCredits) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                  R {Math.abs(totalDebits - totalCredits).toFixed(2)}
                  {Math.abs(totalDebits - totalCredits) < 0.01 && " ✓"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
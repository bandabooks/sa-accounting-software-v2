import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Download, TrendingUp, Calculator, BarChart3, PieChart, Activity, DollarSign, Building, FileBarChart, RefreshCw, CalendarIcon, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface BalanceSheetData {
  assets: {
    currentAssets: Array<{ account: string; amount: string }>;
    nonCurrentAssets: Array<{ account: string; amount: string }>;
    totalAssets: string;
  };
  liabilities: {
    currentLiabilities: Array<{ account: string; amount: string }>;
    nonCurrentLiabilities: Array<{ account: string; amount: string }>;
    totalLiabilities: string;
  };
  equity: {
    items: Array<{ account: string; amount: string }>;
    totalEquity: string;
  };
  totalLiabilitiesAndEquity: string;
}

interface TrialBalanceData {
  accounts: Array<{
    accountCode: string;
    accountName: string;
    debit: string;
    credit: string;
  }>;
  totalDebits: string;
  totalCredits: string;
}

interface ProfitLossData {
  revenue: Array<{ category: string; amount: string }>;
  expenses: Array<{ category: string; amount: string }>;
  grossProfit: string;
  netProfit: string;
  totalRevenue: string;
  totalExpenses: string;
}

interface CashFlowData {
  operatingActivities: Array<{ item: string; amount: string }>;
  investingActivities: Array<{ item: string; amount: string }>;
  financingActivities: Array<{ item: string; amount: string }>;
  netCashFlow: string;
  openingBalance: string;
  closingBalance: string;
}

interface GeneralLedgerData {
  accounts: Array<{
    accountCode: string;
    accountName: string;
    transactions: Array<{
      date: string;
      description: string;
      reference: string;
      debit: string;
      credit: string;
      balance: string;
    }>;
    openingBalance: string;
    closingBalance: string;
  }>;
}

interface AgedReceivablesData {
  customers: Array<{
    customerName: string;
    current: string;
    days30: string;
    days60: string;
    days90: string;
    total: string;
  }>;
  totals: {
    current: string;
    days30: string;
    days60: string;
    days90: string;
    total: string;
  };
}

interface AgedPayablesData {
  suppliers: Array<{
    supplierName: string;
    current: string;
    days30: string;
    days60: string;
    days90: string;
    total: string;
  }>;
  totals: {
    current: string;
    days30: string;
    days60: string;
    days90: string;
    total: string;
  };
}

export default function FinancialReports() {
  const [dateFrom, setDateFrom] = useState(format(new Date(new Date().getFullYear(), 0, 1), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [activeTab, setActiveTab] = useState("balance-sheet");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Balance Sheet Query
  const { data: balanceSheet, isLoading: balanceSheetLoading } = useQuery<BalanceSheetData>({
    queryKey: ["/api/reports/balance-sheet", dateFrom, dateTo],
    enabled: activeTab === "balance-sheet"
  });

  // Trial Balance Query
  const { data: trialBalance, isLoading: trialBalanceLoading } = useQuery<TrialBalanceData>({
    queryKey: ["/api/reports/trial-balance", dateFrom, dateTo],
    enabled: activeTab === "trial-balance"
  });

  // Profit & Loss Query
  const { data: profitLoss, isLoading: profitLossLoading } = useQuery<ProfitLossData>({
    queryKey: ["/api/reports/profit-loss", dateFrom, dateTo],
    enabled: activeTab === "profit-loss"
  });

  // Cash Flow Query
  const { data: cashFlow, isLoading: cashFlowLoading } = useQuery<CashFlowData>({
    queryKey: ["/api/reports/cash-flow", dateFrom, dateTo],
    enabled: activeTab === "cash-flow"
  });

  // General Ledger Query
  const { data: generalLedger, isLoading: generalLedgerLoading } = useQuery<GeneralLedgerData>({
    queryKey: ["/api/reports/general-ledger", dateFrom, dateTo],
    enabled: activeTab === "general-ledger"
  });

  // Aged Receivables Query
  const { data: agedReceivables, isLoading: agedReceivablesLoading } = useQuery<AgedReceivablesData>({
    queryKey: ["/api/reports/aged-receivables", dateTo],
    enabled: activeTab === "aged-receivables"
  });

  // Aged Payables Query
  const { data: agedPayables, isLoading: agedPayablesLoading } = useQuery<AgedPayablesData>({
    queryKey: ["/api/reports/aged-payables", dateTo],
    enabled: activeTab === "aged-payables"
  });

  const reportTabs = [
    { 
      id: "balance-sheet", 
      label: "Balance Sheet", 
      icon: <Building className="h-4 w-4" />,
      description: "Financial position statement showing assets, liabilities, and equity"
    },
    { 
      id: "trial-balance", 
      label: "Trial Balance", 
      icon: <Calculator className="h-4 w-4" />,
      description: "Summary of all general ledger account balances"
    },
    { 
      id: "profit-loss", 
      label: "Profit & Loss", 
      icon: <TrendingUp className="h-4 w-4" />,
      description: "Income statement showing revenue, expenses, and net profit"
    },
    { 
      id: "cash-flow", 
      label: "Cash Flow", 
      icon: <Activity className="h-4 w-4" />,
      description: "Statement of cash flows from operating, investing, and financing activities"
    },
    { 
      id: "general-ledger", 
      label: "General Ledger", 
      icon: <FileText className="h-4 w-4" />,
      description: "Detailed transaction history for all accounts"
    },
    { 
      id: "aged-receivables", 
      label: "Aged Receivables", 
      icon: <DollarSign className="h-4 w-4" />,
      description: "Outstanding customer balances by age"
    },
    { 
      id: "aged-payables", 
      label: "Aged Payables", 
      icon: <FileBarChart className="h-4 w-4" />,
      description: "Outstanding supplier balances by age"
    }
  ];

  const downloadReport = (reportType: string) => {
    window.open(`/api/reports/${reportType}/download?from=${dateFrom}&to=${dateTo}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground">Comprehensive financial analysis and reporting</p>
        </div>
        <Badge variant="secondary" className="text-xs">
          IFRS Compliant
        </Badge>
      </div>

      {/* Date Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Report Parameters
          </CardTitle>
          <CardDescription>
            Select date range for financial reports
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-end gap-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="dateFrom">From</Label>
            <Input
              type="date"
              id="dateFrom"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="dateTo">To</Label>
            <Input
              type="date"
              id="dateTo"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => downloadReport(activeTab)}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </CardContent>
      </Card>

      {/* Financial Reports Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          {reportTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 text-xs">
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Balance Sheet */}
        <TabsContent value="balance-sheet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Balance Sheet
              </CardTitle>
              <CardDescription>
                As at {format(new Date(dateTo), "dd MMMM yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {balanceSheetLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : balanceSheet ? (
                <div className="space-y-6">
                  {/* Assets */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">ASSETS</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Current Assets</h4>
                        <div className="space-y-1">
                          {balanceSheet.assets.currentAssets.map((asset, index) => (
                            <div key={index} className="flex justify-between py-1">
                              <span className="text-sm">{asset.account}</span>
                              <span className="font-mono text-sm">{formatCurrency(parseFloat(asset.amount))}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Non-Current Assets</h4>
                        <div className="space-y-1">
                          {balanceSheet.assets.nonCurrentAssets.map((asset, index) => (
                            <div key={index} className="flex justify-between py-1">
                              <span className="text-sm">{asset.account}</span>
                              <span className="font-mono text-sm">{formatCurrency(parseFloat(asset.amount))}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-2">
                        <div className="flex justify-between font-semibold">
                          <span>TOTAL ASSETS</span>
                          <span className="font-mono">{formatCurrency(parseFloat(balanceSheet.assets.totalAssets))}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Liabilities & Equity */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">LIABILITIES AND EQUITY</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Current Liabilities</h4>
                        <div className="space-y-1">
                          {balanceSheet.liabilities.currentLiabilities.map((liability, index) => (
                            <div key={index} className="flex justify-between py-1">
                              <span className="text-sm">{liability.account}</span>
                              <span className="font-mono text-sm">{formatCurrency(parseFloat(liability.amount))}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Non-Current Liabilities</h4>
                        <div className="space-y-1">
                          {balanceSheet.liabilities.nonCurrentLiabilities.map((liability, index) => (
                            <div key={index} className="flex justify-between py-1">
                              <span className="text-sm">{liability.account}</span>
                              <span className="font-mono text-sm">{formatCurrency(parseFloat(liability.amount))}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-2">
                        <div className="flex justify-between font-medium">
                          <span>Total Liabilities</span>
                          <span className="font-mono">{formatCurrency(parseFloat(balanceSheet.liabilities.totalLiabilities))}</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Equity</h4>
                        <div className="space-y-1">
                          {balanceSheet.equity.items.map((equity, index) => (
                            <div key={index} className="flex justify-between py-1">
                              <span className="text-sm">{equity.account}</span>
                              <span className="font-mono text-sm">{formatCurrency(parseFloat(equity.amount))}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-2">
                        <div className="flex justify-between font-medium">
                          <span>Total Equity</span>
                          <span className="font-mono">{formatCurrency(parseFloat(balanceSheet.equity.totalEquity))}</span>
                        </div>
                      </div>

                      <div className="border-t-2 border-black pt-2">
                        <div className="flex justify-between font-semibold text-lg">
                          <span>TOTAL LIABILITIES AND EQUITY</span>
                          <span className="font-mono">{formatCurrency(parseFloat(balanceSheet.totalLiabilitiesAndEquity))}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No balance sheet data available for the selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trial Balance */}
        <TabsContent value="trial-balance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Trial Balance
              </CardTitle>
              <CardDescription>
                As at {format(new Date(dateTo), "dd MMMM yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trialBalanceLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : trialBalance ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 text-sm font-medium">Account Code</th>
                          <th className="text-left py-2 text-sm font-medium">Account Name</th>
                          <th className="text-right py-2 text-sm font-medium">Debit</th>
                          <th className="text-right py-2 text-sm font-medium">Credit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trialBalance.accounts.map((account, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-2 text-sm font-mono">{account.accountCode}</td>
                            <td className="py-2 text-sm">{account.accountName}</td>
                            <td className="py-2 text-sm text-right font-mono">
                              {parseFloat(account.debit) > 0 ? formatCurrency(parseFloat(account.debit)) : "-"}
                            </td>
                            <td className="py-2 text-sm text-right font-mono">
                              {parseFloat(account.credit) > 0 ? formatCurrency(parseFloat(account.credit)) : "-"}
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-black font-semibold">
                          <td className="py-2"></td>
                          <td className="py-2 text-sm">TOTALS</td>
                          <td className="py-2 text-sm text-right font-mono">
                            {formatCurrency(parseFloat(trialBalance.totalDebits))}
                          </td>
                          <td className="py-2 text-sm text-right font-mono">
                            {formatCurrency(parseFloat(trialBalance.totalCredits))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No trial balance data available for the selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profit & Loss */}
        <TabsContent value="profit-loss" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Profit & Loss Statement
              </CardTitle>
              <CardDescription>
                For the period {format(new Date(dateFrom), "dd MMM yyyy")} to {format(new Date(dateTo), "dd MMM yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profitLossLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : profitLoss ? (
                <div className="space-y-6">
                  {/* Revenue */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">REVENUE</h3>
                    <div className="space-y-1">
                      {profitLoss.revenue.map((item, index) => (
                        <div key={index} className="flex justify-between py-1">
                          <span className="text-sm">{item.category}</span>
                          <span className="font-mono text-sm">{formatCurrency(parseFloat(item.amount))}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-2 mt-3">
                      <div className="flex justify-between font-semibold">
                        <span>Total Revenue</span>
                        <span className="font-mono">{formatCurrency(parseFloat(profitLoss.totalRevenue))}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expenses */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">EXPENSES</h3>
                    <div className="space-y-1">
                      {profitLoss.expenses.map((item, index) => (
                        <div key={index} className="flex justify-between py-1">
                          <span className="text-sm">{item.category}</span>
                          <span className="font-mono text-sm">{formatCurrency(parseFloat(item.amount))}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-2 mt-3">
                      <div className="flex justify-between font-semibold">
                        <span>Total Expenses</span>
                        <span className="font-mono">{formatCurrency(parseFloat(profitLoss.totalExpenses))}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Profit */}
                  <div className="border-t-2 border-black pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>NET PROFIT</span>
                      <span className={`font-mono ${parseFloat(profitLoss.netProfit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(parseFloat(profitLoss.netProfit))}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No profit & loss data available for the selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Flow */}
        <TabsContent value="cash-flow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Cash Flow Statement
              </CardTitle>
              <CardDescription>
                For the period {format(new Date(dateFrom), "dd MMM yyyy")} to {format(new Date(dateTo), "dd MMM yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cashFlowLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : cashFlow ? (
                <div className="space-y-6">
                  {/* Opening Balance */}
                  <div>
                    <div className="flex justify-between font-semibold">
                      <span>Opening Cash Balance</span>
                      <span className="font-mono">{formatCurrency(parseFloat(cashFlow.openingBalance))}</span>
                    </div>
                  </div>

                  {/* Operating Activities */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">CASH FLOWS FROM OPERATING ACTIVITIES</h3>
                    <div className="space-y-1">
                      {cashFlow.operatingActivities?.map((item, index) => (
                        <div key={index} className="flex justify-between py-1">
                          <span className="text-sm">{item.item}</span>
                          <span className="font-mono text-sm">{formatCurrency(parseFloat(item.amount))}</span>
                        </div>
                      )) || <div className="text-sm text-gray-500">No operating activities data available</div>}
                    </div>
                  </div>

                  {/* Investing Activities */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">CASH FLOWS FROM INVESTING ACTIVITIES</h3>
                    <div className="space-y-1">
                      {cashFlow.investingActivities?.map((item, index) => (
                        <div key={index} className="flex justify-between py-1">
                          <span className="text-sm">{item.item}</span>
                          <span className="font-mono text-sm">{formatCurrency(parseFloat(item.amount))}</span>
                        </div>
                      )) || <div className="text-sm text-gray-500">No investing activities data available</div>}
                    </div>
                  </div>

                  {/* Financing Activities */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">CASH FLOWS FROM FINANCING ACTIVITIES</h3>
                    <div className="space-y-1">
                      {cashFlow.financingActivities?.map((item, index) => (
                        <div key={index} className="flex justify-between py-1">
                          <span className="text-sm">{item.item}</span>
                          <span className="font-mono text-sm">{formatCurrency(parseFloat(item.amount))}</span>
                        </div>
                      )) || <div className="text-sm text-gray-500">No financing activities data available</div>}
                    </div>
                  </div>

                  {/* Net Cash Flow */}
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold">
                      <span>Net Increase/(Decrease) in Cash</span>
                      <span className={`font-mono ${parseFloat(cashFlow.netCashFlow) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(parseFloat(cashFlow.netCashFlow))}
                      </span>
                    </div>
                  </div>

                  {/* Closing Balance */}
                  <div className="border-t-2 border-black pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>CLOSING CASH BALANCE</span>
                      <span className="font-mono">{formatCurrency(parseFloat(cashFlow.closingBalance))}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No cash flow data available for the selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Ledger */}
        <TabsContent value="general-ledger" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                General Ledger
              </CardTitle>
              <CardDescription>
                Detailed transaction history for all accounts from {format(new Date(dateFrom), "dd MMM yyyy")} to {format(new Date(dateTo), "dd MMM yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generalLedgerLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : generalLedger ? (
                <div className="space-y-6">
                  {generalLedger.accounts.map((account, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                          {account.accountCode} - {account.accountName}
                        </h3>
                        <div className="text-sm text-muted-foreground">
                          Opening: {formatCurrency(parseFloat(account.openingBalance))} | 
                          Closing: {formatCurrency(parseFloat(account.closingBalance))}
                        </div>
                      </div>
                      
                      {account.transactions.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 text-sm font-medium">Date</th>
                                <th className="text-left py-2 text-sm font-medium">Description</th>
                                <th className="text-left py-2 text-sm font-medium">Reference</th>
                                <th className="text-right py-2 text-sm font-medium">Debit</th>
                                <th className="text-right py-2 text-sm font-medium">Credit</th>
                                <th className="text-right py-2 text-sm font-medium">Balance</th>
                              </tr>
                            </thead>
                            <tbody>
                              {account.transactions.map((transaction, txIndex) => (
                                <tr key={txIndex} className="border-b border-gray-100">
                                  <td className="py-2 text-sm">{format(new Date(transaction.date), "dd/MM/yyyy")}</td>
                                  <td className="py-2 text-sm">{transaction.description}</td>
                                  <td className="py-2 text-sm">{transaction.reference}</td>
                                  <td className="py-2 text-sm text-right font-mono">
                                    {parseFloat(transaction.debit) > 0 ? formatCurrency(parseFloat(transaction.debit)) : "-"}
                                  </td>
                                  <td className="py-2 text-sm text-right font-mono">
                                    {parseFloat(transaction.credit) > 0 ? formatCurrency(parseFloat(transaction.credit)) : "-"}
                                  </td>
                                  <td className="py-2 text-sm text-right font-mono">
                                    {formatCurrency(parseFloat(transaction.balance))}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No transactions for this account in the selected period
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No general ledger data available for the selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aged Receivables */}
        <TabsContent value="aged-receivables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Aged Receivables Analysis
              </CardTitle>
              <CardDescription>
                Outstanding customer balances as at {format(new Date(dateTo), "dd MMMM yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {agedReceivablesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : agedReceivables ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 text-sm font-medium">Customer</th>
                          <th className="text-right py-2 text-sm font-medium">Current</th>
                          <th className="text-right py-2 text-sm font-medium">1-30 Days</th>
                          <th className="text-right py-2 text-sm font-medium">31-60 Days</th>
                          <th className="text-right py-2 text-sm font-medium">61-90 Days</th>
                          <th className="text-right py-2 text-sm font-medium">90+ Days</th>
                          <th className="text-right py-2 text-sm font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agedReceivables.customers.map((customer, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-2 text-sm">{customer.customerName}</td>
                            <td className="py-2 text-sm text-right font-mono">{formatCurrency(parseFloat(customer.current))}</td>
                            <td className="py-2 text-sm text-right font-mono">{formatCurrency(parseFloat(customer.days30))}</td>
                            <td className="py-2 text-sm text-right font-mono">{formatCurrency(parseFloat(customer.days60))}</td>
                            <td className="py-2 text-sm text-right font-mono text-orange-600">{formatCurrency(parseFloat(customer.days90))}</td>
                            <td className="py-2 text-sm text-right font-mono text-red-600">{formatCurrency(parseFloat(customer.days90))}</td>
                            <td className="py-2 text-sm text-right font-mono font-semibold">{formatCurrency(parseFloat(customer.total))}</td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-black font-semibold">
                          <td className="py-2 text-sm">TOTALS</td>
                          <td className="py-2 text-sm text-right font-mono">{formatCurrency(parseFloat(agedReceivables.totals.current))}</td>
                          <td className="py-2 text-sm text-right font-mono">{formatCurrency(parseFloat(agedReceivables.totals.days30))}</td>
                          <td className="py-2 text-sm text-right font-mono">{formatCurrency(parseFloat(agedReceivables.totals.days60))}</td>
                          <td className="py-2 text-sm text-right font-mono">{formatCurrency(parseFloat(agedReceivables.totals.days90))}</td>
                          <td className="py-2 text-sm text-right font-mono">{formatCurrency(parseFloat(agedReceivables.totals.days90))}</td>
                          <td className="py-2 text-sm text-right font-mono">{formatCurrency(parseFloat(agedReceivables.totals.total))}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No aged receivables data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aged Payables */}
        <TabsContent value="aged-payables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileBarChart className="h-5 w-5" />
                Aged Payables Analysis
              </CardTitle>
              <CardDescription>
                Outstanding supplier balances as at {format(new Date(dateTo), "dd MMMM yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {agedPayablesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : agedPayables ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 text-sm font-medium">Supplier</th>
                          <th className="text-right py-2 text-sm font-medium">Current</th>
                          <th className="text-right py-2 text-sm font-medium">1-30 Days</th>
                          <th className="text-right py-2 text-sm font-medium">31-60 Days</th>
                          <th className="text-right py-2 text-sm font-medium">61-90 Days</th>
                          <th className="text-right py-2 text-sm font-medium">90+ Days</th>
                          <th className="text-right py-2 text-sm font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agedPayables.suppliers.map((supplier, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-2 text-sm">{supplier.supplierName}</td>
                            <td className="py-2 text-sm text-right font-mono">{formatCurrency(parseFloat(supplier.current))}</td>
                            <td className="py-2 text-sm text-right font-mono">{formatCurrency(parseFloat(supplier.days30))}</td>
                            <td className="py-2 text-sm text-right font-mono">{formatCurrency(parseFloat(supplier.days60))}</td>
                            <td className="py-2 text-sm text-right font-mono text-orange-600">{formatCurrency(parseFloat(supplier.days90))}</td>
                            <td className="py-2 text-sm text-right font-mono text-red-600">{formatCurrency(parseFloat(supplier.days90))}</td>
                            <td className="py-2 text-sm text-right font-mono font-semibold">{formatCurrency(parseFloat(supplier.total))}</td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-black font-semibold">
                          <td className="py-2 text-sm">TOTALS</td>
                          <td className="py-2 text-sm text-right font-mono">{formatCurrency(parseFloat(agedPayables.totals.current))}</td>
                          <td className="py-2 text-sm text-right font-mono">{formatCurrency(parseFloat(agedPayables.totals.days30))}</td>
                          <td className="py-2 text-sm text-right font-mono">{formatCurrency(parseFloat(agedPayables.totals.days60))}</td>
                          <td className="py-2 text-sm text-right font-mono">{formatCurrency(parseFloat(agedPayables.totals.days90))}</td>
                          <td className="py-2 text-sm text-right font-mono">{formatCurrency(parseFloat(agedPayables.totals.days90))}</td>
                          <td className="py-2 text-sm text-right font-mono">{formatCurrency(parseFloat(agedPayables.totals.total))}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No aged payables data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
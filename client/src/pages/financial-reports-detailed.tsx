import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { 
  Calendar, 
  Download, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Activity,
  FileBarChart,
  Receipt,
  PiggyBank,
  Building,
  ShieldCheck,
  FolderOpen,
  ArrowLeft
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function FinancialReportsDetailed() {
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [activeTab, setActiveTab] = useState("balance-sheet");

  // Get URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    const from = urlParams.get('from');
    const to = urlParams.get('to');
    
    if (tab) setActiveTab(tab);
    if (from) setDateFrom(from);
    if (to) setDateTo(to);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  // Data fetching queries
  const { data: balanceSheet, isLoading: balanceSheetLoading } = useQuery({
    queryKey: [`/api/reports/balance-sheet/${dateFrom}/${dateTo}`],
    enabled: activeTab === "balance-sheet"
  });

  const { data: profitLoss, isLoading: profitLossLoading } = useQuery({
    queryKey: [`/api/reports/profit-loss/${dateFrom}/${dateTo}`],
    enabled: activeTab === "profit-loss"
  });

  const { data: cashFlow, isLoading: cashFlowLoading } = useQuery({
    queryKey: [`/api/reports/cash-flow/${dateFrom}/${dateTo}`],
    enabled: activeTab === "cash-flow"
  });

  const { data: trialBalance, isLoading: trialBalanceLoading } = useQuery({
    queryKey: [`/api/reports/trial-balance/${dateFrom}/${dateTo}`],
    enabled: activeTab === "trial-balance"
  });

  const { data: generalLedger, isLoading: generalLedgerLoading } = useQuery({
    queryKey: [`/api/reports/general-ledger/${dateFrom}/${dateTo}`],
    enabled: activeTab === "general-ledger"
  });

  const { data: agedReceivables, isLoading: agedReceivablesLoading } = useQuery({
    queryKey: [`/api/reports/aged-receivables/${dateTo}`],
    enabled: activeTab === "aged-receivables"
  });

  const { data: agedPayables, isLoading: agedPayablesLoading } = useQuery({
    queryKey: [`/api/reports/aged-payables/${dateTo}`],
    enabled: activeTab === "aged-payables"
  });

  const { data: vatSummary, isLoading: vatSummaryLoading } = useQuery({
    queryKey: [`/api/reports/vat-summary?from=${dateFrom}&to=${dateTo}`],
    enabled: activeTab === "vat-summary"
  });

  const { data: bankReconciliation, isLoading: bankReconciliationLoading } = useQuery({
    queryKey: [`/api/reports/bank-reconciliation?asAt=${dateTo}`],
    enabled: activeTab === "bank-reconciliation"
  });

  const { data: fixedAssetRegister, isLoading: fixedAssetRegisterLoading } = useQuery({
    queryKey: [`/api/reports/fixed-asset-register?asAt=${dateTo}`],
    enabled: activeTab === "fixed-asset-register"
  });

  const { data: taxSummary, isLoading: taxSummaryLoading } = useQuery({
    queryKey: [`/api/reports/tax-summary?from=${dateFrom}&to=${dateTo}`],
    enabled: activeTab === "tax-summary"
  });

  const { data: expenseReport, isLoading: expenseReportLoading } = useQuery({
    queryKey: [`/api/reports/expense-report?from=${dateFrom}&to=${dateTo}`],
    enabled: activeTab === "expense-report"
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detailed Financial Reports</h1>
            <p className="text-gray-600">
              Period: {format(new Date(dateFrom), "dd MMM yyyy")} to {format(new Date(dateTo), "dd MMM yyyy")}
            </p>
          </div>
        </div>
        
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 lg:grid-cols-6 gap-1 h-auto p-1 bg-gray-100">
          <TabsTrigger value="balance-sheet" className="flex items-center gap-2 text-xs">
            <FileText className="h-3 w-3" />
            Balance Sheet
          </TabsTrigger>
          <TabsTrigger value="profit-loss" className="flex items-center gap-2 text-xs">
            <TrendingUp className="h-3 w-3" />
            P&L
          </TabsTrigger>
          <TabsTrigger value="cash-flow" className="flex items-center gap-2 text-xs">
            <Activity className="h-3 w-3" />
            Cash Flow
          </TabsTrigger>
          <TabsTrigger value="trial-balance" className="flex items-center gap-2 text-xs">
            <FileBarChart className="h-3 w-3" />
            Trial Balance
          </TabsTrigger>
          <TabsTrigger value="general-ledger" className="flex items-center gap-2 text-xs">
            <FileText className="h-3 w-3" />
            General Ledger
          </TabsTrigger>
          <TabsTrigger value="aged-receivables" className="flex items-center gap-2 text-xs">
            <FileBarChart className="h-3 w-3" />
            A/R Aging
          </TabsTrigger>
          <TabsTrigger value="aged-payables" className="flex items-center gap-2 text-xs">
            <FileBarChart className="h-3 w-3" />
            A/P Aging
          </TabsTrigger>
          <TabsTrigger value="vat-summary" className="flex items-center gap-2 text-xs">
            <Receipt className="h-3 w-3" />
            VAT Summary
          </TabsTrigger>
          <TabsTrigger value="bank-reconciliation" className="flex items-center gap-2 text-xs">
            <PiggyBank className="h-3 w-3" />
            Bank Recon
          </TabsTrigger>
          <TabsTrigger value="fixed-asset-register" className="flex items-center gap-2 text-xs">
            <Building className="h-3 w-3" />
            Assets
          </TabsTrigger>
          <TabsTrigger value="tax-summary" className="flex items-center gap-2 text-xs">
            <ShieldCheck className="h-3 w-3" />
            Tax Summary
          </TabsTrigger>
          <TabsTrigger value="expense-report" className="flex items-center gap-2 text-xs">
            <FolderOpen className="h-3 w-3" />
            Expenses
          </TabsTrigger>
        </TabsList>

        {/* Balance Sheet */}
        <TabsContent value="balance-sheet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Balance Sheet
              </CardTitle>
              <CardDescription>
                Financial position as at {format(new Date(dateTo), "dd MMMM yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {balanceSheetLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Balance Sheet data will be displayed here
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
                Income and expenses for {format(new Date(dateFrom), "dd MMM yyyy")} to {format(new Date(dateTo), "dd MMM yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profitLossLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Profit & Loss data will be displayed here
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
                Cash movements for {format(new Date(dateFrom), "dd MMM yyyy")} to {format(new Date(dateTo), "dd MMM yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cashFlowLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Cash Flow data will be displayed here
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional tabs would continue here with similar structure */}
        
      </Tabs>
    </div>
  );
}
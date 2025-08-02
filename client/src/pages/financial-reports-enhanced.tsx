import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { 
  Calendar, 
  Download, 
  FileText, 
  TrendingUp, 
  Activity,
  FileBarChart,
  Receipt,
  PiggyBank,
  Building,
  ShieldCheck,
  FolderOpen,
  BarChart3,
  Calculator,
  BookOpen,
  Target,
  Settings,
  Filter,
  ChevronRight,
  Eye,
  Users,
  Clock,
  X,
  Printer,
  Mail,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  TrendingDown,
  DollarSign,
  Percent
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";

interface ReportData {
  id: string;
  title: string;
  data: any;
  lastGenerated: string;
  summary?: {
    totalAssets?: number;
    totalLiabilities?: number;
    equity?: number;
    revenue?: number;
    expenses?: number;
    netIncome?: number;
    cashInflow?: number;
    cashOutflow?: number;
    netCashFlow?: number;
  };
}

export default function FinancialReportsEnhanced() {
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [modalReport, setModalReport] = useState<ReportData | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  // Mock data queries - replace with real API calls
  const { data: reportData } = useQuery({
    queryKey: ["/api/reports/summary", dateFrom, dateTo],
    queryFn: () => apiRequest(`/api/reports/summary?from=${dateFrom}&to=${dateTo}`, "GET"),
    select: (data) => ({
      balanceSheet: {
        id: "balance-sheet",
        title: "Balance Sheet",
        lastGenerated: format(new Date(), "yyyy-MM-dd"),
        summary: {
          totalAssets: 2500000,
          totalLiabilities: 1200000,
          equity: 1300000
        },
        data: {
          assets: {
            current: [
              { account: "Cash and Cash Equivalents", amount: 450000 },
              { account: "Accounts Receivable", amount: 320000 },
              { account: "Inventory", amount: 180000 },
              { account: "Prepaid Expenses", amount: 25000 }
            ],
            nonCurrent: [
              { account: "Property, Plant & Equipment", amount: 1200000 },
              { account: "Intangible Assets", amount: 185000 },
              { account: "Long-term Investments", amount: 140000 }
            ]
          },
          liabilities: {
            current: [
              { account: "Accounts Payable", amount: 280000 },
              { account: "Short-term Debt", amount: 150000 },
              { account: "Accrued Expenses", amount: 95000 }
            ],
            nonCurrent: [
              { account: "Long-term Debt", amount: 525000 },
              { account: "Deferred Tax Liabilities", amount: 150000 }
            ]
          },
          equity: [
            { account: "Share Capital", amount: 800000 },
            { account: "Retained Earnings", amount: 500000 }
          ]
        }
      },
      profitLoss: {
        id: "profit-loss",
        title: "Profit & Loss Statement",
        lastGenerated: format(new Date(), "yyyy-MM-dd"),
        summary: {
          revenue: 1850000,
          expenses: 1420000,
          netIncome: 430000
        },
        data: {
          revenue: [
            { account: "Sales Revenue", amount: 1600000 },
            { account: "Service Revenue", amount: 250000 }
          ],
          expenses: [
            { account: "Cost of Goods Sold", amount: 680000 },
            { account: "Operating Expenses", amount: 520000 },
            { account: "Administrative Expenses", amount: 220000 }
          ]
        }
      },
      cashFlow: {
        id: "cash-flow",
        title: "Cash Flow Statement",
        lastGenerated: format(new Date(), "yyyy-MM-dd"),
        summary: {
          cashInflow: 1950000,
          cashOutflow: 1680000,
          netCashFlow: 270000
        },
        data: {
          operating: [
            { activity: "Net Income", amount: 430000 },
            { activity: "Depreciation", amount: 120000 },
            { activity: "Changes in Working Capital", amount: -85000 }
          ],
          investing: [
            { activity: "Purchase of Equipment", amount: -180000 },
            { activity: "Sale of Investments", amount: 65000 }
          ],
          financing: [
            { activity: "Loan Proceeds", amount: 200000 },
            { activity: "Dividends Paid", amount: -120000 }
          ]
        }
      },
      trialBalance: {
        id: "trial-balance",
        title: "Trial Balance",
        lastGenerated: format(new Date(), "yyyy-MM-dd"),
        data: {
          accounts: [
            { account: "Cash", debit: 450000, credit: 0 },
            { account: "Accounts Receivable", debit: 320000, credit: 0 },
            { account: "Inventory", debit: 180000, credit: 0 },
            { account: "Equipment", debit: 1200000, credit: 0 },
            { account: "Accounts Payable", debit: 0, credit: 280000 },
            { account: "Long-term Debt", debit: 0, credit: 525000 },
            { account: "Share Capital", debit: 0, credit: 800000 },
            { account: "Retained Earnings", debit: 0, credit: 500000 },
            { account: "Sales Revenue", debit: 0, credit: 1600000 },
            { account: "Cost of Goods Sold", debit: 680000, credit: 0 }
          ]
        }
      }
    })
  });

  const reportCategories = [
    {
      id: "core-reports",
      title: "Core Financial Reports",
      description: "Essential financial statements and analysis",
      icon: BarChart3,
      color: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-600",
      gradient: "from-blue-600 via-indigo-700 to-purple-800",
      count: 4,
      reports: [
        { 
          id: "balance-sheet", 
          title: "Balance Sheet", 
          icon: FileText, 
          description: "Assets, liabilities & equity as at specific date",
          lastGenerated: "2025-01-27",
          frequency: "Monthly",
          data: reportData?.balanceSheet
        },
        { 
          id: "profit-loss", 
          title: "Profit & Loss Statement", 
          icon: TrendingUp, 
          description: "Revenue, expenses and net income analysis",
          lastGenerated: "2025-01-27", 
          frequency: "Monthly",
          data: reportData?.profitLoss
        },
        { 
          id: "cash-flow", 
          title: "Cash Flow Statement", 
          icon: Activity, 
          description: "Operating, investing & financing activities",
          lastGenerated: "2025-01-27",
          frequency: "Monthly",
          data: reportData?.cashFlow
        },
        { 
          id: "trial-balance", 
          title: "Trial Balance", 
          icon: Calculator, 
          description: "Account balance verification and summary",
          lastGenerated: "2025-01-27",
          frequency: "Monthly",
          data: reportData?.trialBalance
        }
      ]
    },
    {
      id: "analytical-reports", 
      title: "Analytical & Detail Reports",
      description: "Detailed analysis and operational insights",
      icon: Target,
      color: "bg-green-50 border-green-200",
      iconColor: "text-green-600",
      gradient: "from-emerald-600 via-green-700 to-teal-800",
      count: 4,
      reports: [
        { 
          id: "general-ledger", 
          title: "General Ledger", 
          icon: BookOpen, 
          description: "Detailed transaction history by account",
          lastGenerated: "2025-01-27",
          frequency: "Weekly"
        },
        { 
          id: "aged-receivables", 
          title: "Aged Receivables Analysis", 
          icon: FileBarChart, 
          description: "Outstanding customer balances aging",
          lastGenerated: "2025-01-27",
          frequency: "Weekly"
        },
        { 
          id: "aged-payables", 
          title: "Aged Payables Analysis", 
          icon: FileBarChart, 
          description: "Outstanding supplier balances aging",
          lastGenerated: "2025-01-27",
          frequency: "Weekly"
        },
        { 
          id: "expense-report", 
          title: "Expense Analysis Report", 
          icon: FolderOpen, 
          description: "Categorized expense breakdown and trends",
          lastGenerated: "2025-01-27",
          frequency: "Monthly"
        }
      ]
    },
    {
      id: "tax-compliance",
      title: "Tax & Compliance Reports",
      description: "VAT, tax and regulatory compliance",
      icon: ShieldCheck,
      color: "bg-purple-50 border-purple-200",
      iconColor: "text-purple-600",
      gradient: "from-purple-600 via-indigo-700 to-blue-800",
      count: 3,
      reports: [
        { 
          id: "vat-summary", 
          title: "VAT Summary Report", 
          icon: Receipt, 
          description: "VAT calculations and compliance summary",
          lastGenerated: "2025-01-27",
          frequency: "Monthly"
        },
        { 
          id: "tax-summary", 
          title: "Tax Summary Report", 
          icon: Building, 
          description: "Comprehensive tax liability analysis",
          lastGenerated: "2025-01-27",
          frequency: "Quarterly"
        },
        { 
          id: "bank-reconciliation", 
          title: "Bank Reconciliation", 
          icon: PiggyBank, 
          description: "Bank statement to ledger reconciliation",
          lastGenerated: "2025-01-27",
          frequency: "Monthly"
        }
      ]
    }
  ];

  const handleReportClick = (report: any) => {
    if (report.data) {
      setModalReport(report.data);
    } else {
      // For reports without data, show expanded view
      setSelectedReport(report.id);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Implementation for PDF download
    console.log("Downloading PDF...");
  };

  const handleEmailReport = () => {
    // Implementation for email functionality
    console.log("Emailing report...");
  };

  const renderReportContent = (reportData: ReportData) => {
    switch (reportData.id) {
      case "balance-sheet":
        return renderBalanceSheet(reportData);
      case "profit-loss":
        return renderProfitLoss(reportData);
      case "cash-flow":
        return renderCashFlow(reportData);
      case "trial-balance":
        return renderTrialBalance(reportData);
      default:
        return <div>Report content not available</div>;
    }
  };

  const renderBalanceSheet = (reportData: ReportData) => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.totalAssets || 0)}</div>
            <div className="text-blue-100 text-sm">Total Assets</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-600 to-pink-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.totalLiabilities || 0)}</div>
            <div className="text-red-100 text-sm">Total Liabilities</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-600 to-emerald-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.equity || 0)}</div>
            <div className="text-green-100 text-sm">Total Equity</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Current Assets</h4>
                <div className="space-y-2">
                  {reportData.data?.assets?.current?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.account}</span>
                      <span className="font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Non-Current Assets</h4>
                <div className="space-y-2">
                  {reportData.data?.assets?.nonCurrent?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.account}</span>
                      <span className="font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liabilities & Equity */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Liabilities & Equity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Current Liabilities</h4>
                <div className="space-y-2">
                  {reportData.data?.liabilities?.current?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.account}</span>
                      <span className="font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Non-Current Liabilities</h4>
                <div className="space-y-2">
                  {reportData.data?.liabilities?.nonCurrent?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.account}</span>
                      <span className="font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Equity</h4>
                <div className="space-y-2">
                  {reportData.data?.equity?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.account}</span>
                      <span className="font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderProfitLoss = (reportData: ReportData) => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-600 to-emerald-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.revenue || 0)}</div>
            <div className="text-green-100 text-sm">Total Revenue</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-600 to-pink-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.expenses || 0)}</div>
            <div className="text-red-100 text-sm">Total Expenses</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.netIncome || 0)}</div>
            <div className="text-blue-100 text-sm">Net Income</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.data?.revenue?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{item.account}</span>
                  <span className="font-semibold text-green-600">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.data?.expenses?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{item.account}</span>
                  <span className="font-semibold text-red-600">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCashFlow = (reportData: ReportData) => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-600 to-emerald-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.cashInflow || 0)}</div>
            <div className="text-green-100 text-sm">Cash Inflow</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-600 to-pink-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.cashOutflow || 0)}</div>
            <div className="text-red-100 text-sm">Cash Outflow</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(reportData.summary?.netCashFlow || 0)}</div>
            <div className="text-blue-100 text-sm">Net Cash Flow</div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Activities */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Operating Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.data?.operating?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{item.activity}</span>
                  <span className={`font-semibold ${item.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Investing Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.data?.investing?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{item.activity}</span>
                  <span className={`font-semibold ${item.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Financing Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.data?.financing?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{item.activity}</span>
                  <span className={`font-semibold ${item.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTrialBalance = (reportData: ReportData) => (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Trial Balance</CardTitle>
          <CardDescription>Account balances as at {reportData.lastGenerated}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Account</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Debit</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.data?.accounts?.map((account: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800">{account.account}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {account.debit > 0 ? formatCurrency(account.debit) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {account.credit > 0 ? formatCurrency(account.credit) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="container mx-auto px-4 py-6 space-y-8">
        
        {/* Enhanced Header Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-700 to-indigo-800 rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative p-8 lg:p-12 text-white">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-purple-100 text-lg font-medium">Financial Reporting</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
                  Financial Reports
                </h1>
                <p className="text-purple-100 text-xl font-medium">
                  Complete financial statements and analysis dashboard
                </p>
              </div>

              {/* Date Range Selector */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 lg:min-w-[300px]">
                <h3 className="text-white font-semibold mb-3">Report Parameters</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="dateFrom" className="text-purple-100 text-sm">From Date</Label>
                    <Input
                      id="dateFrom"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="mt-1 bg-white/20 border-white/30 text-white placeholder-purple-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateTo" className="text-purple-100 text-sm">To Date</Label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="mt-1 bg-white/20 border-white/30 text-white placeholder-purple-200"
                    />
                  </div>
                  <Button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30">
                    <Filter className="h-4 w-4 mr-2" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Categories */}
        <div className="space-y-6">
          {reportCategories.map((category) => (
            <div key={category.id} className="space-y-4">
              {/* Category Header */}
              <Card className={`border-0 shadow-xl bg-gradient-to-r ${category.gradient} text-white transform hover:scale-[1.01] transition-all duration-300`}>
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => handleCategoryToggle(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        <category.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-white">{category.title}</CardTitle>
                        <CardDescription className="text-white/80">{category.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="bg-white/20 text-white border-0">
                        {category.count} reports
                      </Badge>
                      {expandedCategory === category.id ? (
                        <ChevronUp className="h-5 w-5 text-white" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-white" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Category Reports */}
              <Collapsible open={expandedCategory === category.id}>
                <CollapsibleContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pl-4">
                    {category.reports.map((report) => (
                      <Card 
                        key={report.id} 
                        className="group border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
                        onClick={() => handleReportClick(report)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${category.gradient}`}>
                              <report.icon className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-sm font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                                {report.title}
                              </CardTitle>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-xs text-gray-600">{report.description}</p>
                          
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Last: {report.lastGenerated}</span>
                            <Badge variant="outline" className="text-xs">
                              {report.frequency}
                            </Badge>
                          </div>

                          {/* Summary Preview */}
                          {report.data?.summary && (
                            <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                              <div className="grid grid-cols-1 gap-1 text-xs">
                                {report.id === 'balance-sheet' && report.data?.summary && (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Assets:</span>
                                      <span className="font-semibold">{formatCurrency(report.data.summary.totalAssets || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Equity:</span>
                                      <span className="font-semibold">{formatCurrency(report.data.summary.equity || 0)}</span>
                                    </div>
                                  </>
                                )}
                                {report.id === 'profit-loss' && report.data?.summary && (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Revenue:</span>
                                      <span className="font-semibold text-green-600">{formatCurrency(report.data.summary.revenue || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Net Income:</span>
                                      <span className="font-semibold text-blue-600">{formatCurrency(report.data.summary.netIncome || 0)}</span>
                                    </div>
                                  </>
                                )}
                                {report.id === 'cash-flow' && report.data?.summary && (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Inflow:</span>
                                      <span className="font-semibold text-green-600">{formatCurrency(report.data.summary.cashInflow || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Net Flow:</span>
                                      <span className="font-semibold text-blue-600">{formatCurrency(report.data.summary.netCashFlow || 0)}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                          <Button className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <Eye className="h-4 w-4 mr-2" />
                            View Report
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
        </div>

        {/* Report Modal */}
        <Dialog open={modalReport !== null} onOpenChange={() => setModalReport(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-bold text-gray-800">
                    {modalReport?.title}
                  </DialogTitle>
                  <DialogDescription>
                    Period: {dateFrom} to {dateTo} | Generated: {modalReport?.lastGenerated}
                  </DialogDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handlePrint} className="bg-gray-600 hover:bg-gray-700">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700">
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button onClick={handleEmailReport} className="bg-green-600 hover:bg-green-700">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
            </DialogHeader>
            
            <div className="mt-6">
              {modalReport && renderReportContent(modalReport)}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
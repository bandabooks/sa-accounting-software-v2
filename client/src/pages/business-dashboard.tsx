import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as ChartTooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell 
} from "recharts";
import { 
  TrendingUp, TrendingDown, DollarSign, CreditCard, Users, 
  AlertTriangle, CheckCircle, Clock, RefreshCw, Download, 
  ArrowUpRight, ArrowDownRight, Calendar, Target, Eye, Banknote
} from "lucide-react";
import { KPIStat, SuccessKPIStat, InfoKPIStat, WarningKPIStat, DangerKPIStat, PurpleKPIStat } from "@/components/ui/kpi-stat";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DuplicateInvoicesModal } from "@/components/dashboard/DuplicateInvoicesModal";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";

interface DashboardData {
  asOf: string;
  basis: string;
  freshness: {
    lastGlPostAt: string;
    lastBankSyncAt: string;
  };
  closeStatus: {
    period: string;
    status: string;
  };
  kpis: {
    bankBalance: number;
    bankBalanceGuardrail?: {
      glBalance: number;
      legacyBalance: number;
      difference: number;
      hasDiscrepancy: boolean;
    };
    recon: {
      lastReconciledAt: string;
      percentMatched: number;
    };
    ar: {
      total: number;
      overdue: number;
    };
    ap: {
      total: number;
      overdue: number;
    };
    monthlyRevenue: number;
    grossMargin: number;
    netProfit: number;
    profitMargin: number;
    vat: {
      position: number;
      dueDate: string;
      status: string;
    };
  };
  charts: {
    cashFlow13w: Array<{
      week: string;
      actualIn: number;
      actualOut: number;
      forecastIn: number;
      forecastOut: number;
    }>;
    incomeVsExpenseT12M: Array<{
      month: string;
      income: number;
      expense: number;
    }>;
    aging: {
      ar: {
        "0_30": number;
        "31_60": number;
        "61_90": number;
        "90_plus": number;
      };
      ap: {
        "0_30": number;
        "31_60": number;
        "61_90": number;
        "90_plus": number;
      };
    };
  };
  priorityActions: {
    billsDueThisWeek: any[];
    overdueInvoices: Array<{
      id: number;
      customer: string;
      amount: number;
      dueDate: string;
      daysOverdue: number;
    }>;
  };
  anomalies?: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    count: number;
    description: string;
    actionable?: boolean;
  }>;
}

export default function BusinessDashboard() {
  const { companyId } = useCompany();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [accountingBasis, setAccountingBasis] = useState<'accrual' | 'cash'>('accrual');
  const [period, setPeriod] = useState('YTD');
  const [duplicatesModalOpen, setDuplicatesModalOpen] = useState(false);

  // Calculate period dates
  const getPeriodDates = () => {
    const now = new Date();
    const year = now.getFullYear();
    
    switch (period) {
      case 'MTD':
        return { from: new Date(year, now.getMonth(), 1), to: now };
      case 'QTD':
        const quarter = Math.floor(now.getMonth() / 3);
        return { from: new Date(year, quarter * 3, 1), to: now };
      case 'YTD':
        return { from: new Date(year, 0, 1), to: now };
      case 'Last30':
        return { from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), to: now };
      case 'T12M':
        return { from: new Date(year - 1, now.getMonth(), now.getDate()), to: now };
      case 'LastMonth':
        const lastMonth = new Date(year, now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(year, now.getMonth(), 0);
        return { from: lastMonth, to: lastMonthEnd };
      case 'LastQuarter':
        const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
        const lastQuarterStart = lastQuarter >= 0 
          ? new Date(year, lastQuarter * 3, 1)
          : new Date(year - 1, 9, 1);
        const lastQuarterEnd = lastQuarter >= 0
          ? new Date(year, lastQuarter * 3 + 3, 0)
          : new Date(year, 0, 0);
        return { from: lastQuarterStart, to: lastQuarterEnd };
      case 'AllTime':
        return { from: new Date(2019, 0, 1), to: now };
      default:
        return { from: new Date(year, 0, 1), to: now };
    }
  };

  // Memoize period dates to prevent recalculation on every render
  const periodDates = useMemo(() => getPeriodDates(), [period]);
  const { from, to } = periodDates;

  // Stabilize query key to prevent excessive refetching
  const stableFromDate = useMemo(() => from.toISOString().split('T')[0], [from]);
  const stableToDate = useMemo(() => to.toISOString().split('T')[0], [to]);
  
  const { data: dashboardData, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: [`/api/dashboard/business?basis=${accountingBasis}&period=${period}&from=${stableFromDate}&to=${stableToDate}`],
    enabled: !!companyId,
    staleTime: 60000, // 1 minute
    retry: 2,
    refetchOnWindowFocus: false,
    refetchInterval: false, // Disable automatic refetching
  });

  // Debug logging
  console.log('Dashboard Query State:', { 
    companyId, 
    isLoading, 
    error: error?.message, 
    hasData: !!dashboardData,
    dataKeys: dashboardData ? Object.keys(dashboardData) : [],
    queryKey: `/api/dashboard/business?basis=${accountingBasis}&period=${period}&from=${stableFromDate}&to=${stableToDate}`
  });

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
    }).format(num);
  };

  const formatPercentage = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${num.toFixed(1)}%`;
  };

  // Drill-through navigation functions
  const navigateToInvoices = (status?: string) => {
    const query = status ? `?status=${status}` : '';
    setLocation(`/invoices${query}`);
  };

  const navigateToBankTransactions = () => {
    setLocation('/banking');
  };

  const navigateToExpenses = () => {
    setLocation('/expenses');
  };

  const navigateToVATReturns = () => {
    setLocation('/vat-returns');
  };

  const navigateToSalesReports = () => {
    setLocation('/invoices');
  };

  const navigateToFinancialReports = () => {
    setLocation('/reports/financial');
  };

  const navigateToPayables = () => {
    setLocation('/bills');
  };

  const navigateToCashFlowForecasting = () => {
    setLocation('/cash-flow-forecasting');
  };

  const navigateToAgingReports = () => {
    setLocation('/reports/accounts-receivable');
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Dashboard Refreshed",
      description: "Financial data has been updated with the latest information.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your dashboard report is being prepared for download.",
    });
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-700">Error Loading Dashboard</h3>
              <p className="text-gray-600 mt-2">Failed to load dashboard data. Please try again.</p>
              <Button onClick={() => refetch()} className="mt-4">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Business Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time financial insights
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Period Filter */}
              <Select value={period} onValueChange={setPeriod} data-testid="select-period">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MTD">This month</SelectItem>
                  <SelectItem value="QTD">This quarter</SelectItem>
                  <SelectItem value="YTD">This year so far</SelectItem>
                  <SelectItem value="Last30">Past 30 days</SelectItem>
                  <SelectItem value="T12M">Past 12 months</SelectItem>
                  <SelectItem value="LastMonth">Last month</SelectItem>
                  <SelectItem value="LastQuarter">Last quarter</SelectItem>
                  <SelectItem value="AllTime">All time</SelectItem>
                </SelectContent>
              </Select>

              {/* Accounting Basis Toggle */}
              <Tabs value={accountingBasis} onValueChange={(value) => setAccountingBasis(value as 'accrual' | 'cash')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="accrual" data-testid="button-accrual-basis">Accrual</TabsTrigger>
                  <TabsTrigger value="cash" data-testid="button-cash-basis">Cash</TabsTrigger>
                </TabsList>
              </Tabs>

              <Button variant="outline" onClick={handleRefresh} data-testid="button-refresh">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>

              <Button variant="outline" onClick={handleExport} data-testid="button-export">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Data Freshness Indicators */}
          {dashboardData && (
            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Period: {dashboardData.closeStatus.status}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>GL: {new Date(dashboardData.freshness.lastGlPostAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>Bank: {new Date(dashboardData.freshness.lastBankSyncAt).toLocaleString()}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {accountingBasis.toUpperCase()} Basis
              </Badge>
              <Badge variant="outline" className="text-xs">
                As of {dashboardData.asOf}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-6 space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : dashboardData && dashboardData.kpis ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Bank Balance */}
              <div onClick={navigateToBankTransactions} className="cursor-pointer" data-testid="card-bank-balance">
                <TooltipProvider>
                  <div className="relative">
                    <InfoKPIStat
                      title="Bank Balance"
                      value={dashboardData.kpis.bankBalance}
                      icon={Banknote}
                      subtitle={`${formatPercentage(dashboardData.kpis.recon.percentMatched * 100)} reconciled • Last: ${dashboardData.kpis.recon.lastReconciledAt}`}
                    />
                    {dashboardData.kpis.bankBalanceGuardrail?.hasDiscrepancy && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center cursor-help animate-pulse">
                            <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="text-sm">
                            <p className="font-medium text-yellow-800 mb-1">Balance Discrepancy Detected</p>
                            <div className="space-y-1 text-xs">
                              <p>GL Balance: {formatCurrency(dashboardData.kpis.bankBalanceGuardrail.glBalance)}</p>
                              <p>Legacy Balance: {formatCurrency(dashboardData.kpis.bankBalanceGuardrail.legacyBalance)}</p>
                              <p className="text-yellow-700">
                                Difference: {formatCurrency(dashboardData.kpis.bankBalanceGuardrail.difference)}
                              </p>
                            </div>
                            <p className="text-xs text-gray-600 mt-2">
                              The GL calculation differs from the stored balance. This may indicate data sync issues.
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TooltipProvider>
              </div>

              {/* Monthly Revenue */}
              <div onClick={navigateToSalesReports} className="cursor-pointer" data-testid="card-monthly-revenue">
                <SuccessKPIStat
                  title="Monthly Revenue"
                  value={dashboardData.kpis.monthlyRevenue}
                  icon={TrendingUp}
                  subtitle={`${formatPercentage(dashboardData.kpis.grossMargin * 100)} gross margin • ${dashboardData.basis} basis`}
                />
              </div>

              {/* Net Profit */}
              <div onClick={navigateToFinancialReports} className="cursor-pointer" data-testid="card-net-profit">
                <KPIStat
                  title="Net Profit"
                  value={dashboardData.kpis.netProfit}
                  icon={Target}
                  variant={dashboardData.kpis.netProfit >= 0 ? 'success' : 'danger'}
                  change={{
                    value: dashboardData.kpis.profitMargin * 100,
                    period: 'margin',
                    type: dashboardData.kpis.profitMargin >= 0 ? 'increase' : 'decrease'
                  }}
                />
              </div>

              {/* VAT Position */}
              <div onClick={navigateToVATReturns} className="cursor-pointer" data-testid="card-vat-position">
                <WarningKPIStat
                  title="VAT Position"
                  value={Math.abs(dashboardData.kpis.vat.position)}
                  icon={AlertTriangle}
                  subtitle={`${dashboardData.kpis.vat.status} • Due: ${dashboardData.kpis.vat.dueDate}`}
                  badge={{
                    text: dashboardData.kpis.vat.status,
                    variant: dashboardData.kpis.vat.status === 'Payable' ? 'destructive' : 'default'
                  }}
                />
              </div>
            </div>

            {/* Additional KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Accounts Receivable */}
              <div onClick={() => navigateToInvoices('sent')} className="cursor-pointer" data-testid="card-receivables-ar">
                <SuccessKPIStat
                  title="Receivables (AR)"
                  value={dashboardData.kpis.ar.total}
                  icon={CreditCard}
                  subtitle={`${formatCurrency(dashboardData.kpis.ar.overdue)} overdue (${dashboardData.kpis.ar.total > 0 ? formatPercentage((dashboardData.kpis.ar.overdue / dashboardData.kpis.ar.total) * 100) : '0%'})`}
                  badge={dashboardData.kpis.ar.overdue > 0 ? {
                    text: 'Overdue',
                    variant: 'destructive'
                  } : undefined}
                />
              </div>

              {/* Accounts Payable */}
              <div onClick={navigateToPayables} className="cursor-pointer" data-testid="card-payables-ap">
                <DangerKPIStat
                  title="Payables (AP)"
                  value={dashboardData.kpis.ap.total}
                  icon={Users}
                  subtitle={`${formatCurrency(dashboardData.kpis.ap.overdue)} overdue`}
                />
              </div>

              {/* Cash Flow (Weekly Avg) */}
              <div onClick={navigateToCashFlowForecasting} className="cursor-pointer" data-testid="card-weekly-cash-flow">
                <PurpleKPIStat
                  title="Weekly Cash Flow"
                  value={dashboardData.charts.cashFlow13w.length > 0 ? 
                    dashboardData.charts.cashFlow13w
                      .slice(0, 4)
                      .reduce((sum, week) => sum + (week.actualIn - week.actualOut), 0) / 4
                    : 0}
                  icon={TrendingUp}
                  subtitle="4-week average net flow"
                />
              </div>

              {/* AR Aging Summary */}
              <div onClick={navigateToAgingReports} className="cursor-pointer" data-testid="card-ar-aging">
                <WarningKPIStat
                  title="AR Aging"
                  value={dashboardData.charts.aging.ar["90_plus"]}
                  icon={Calendar}
                  subtitle="90+ days overdue"
                  badge={dashboardData.charts.aging.ar["90_plus"] > 0 ? {
                    text: 'Action Needed',
                    variant: 'destructive'
                  } : {
                    text: 'Good',
                    variant: 'outline'
                  }}
                />
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 13-Week Cash Flow Forecast */}
              <Card>
                <CardHeader>
                  <CardTitle>13-Week Cash Flow Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.charts.cashFlow13w}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <ChartTooltip formatter={(value) => [formatCurrency(value as number)]} />
                      <Legend />
                      <Bar dataKey="actualIn" fill="#10b981" name="Actual In" />
                      <Bar dataKey="actualOut" fill="#ef4444" name="Actual Out" />
                      <Bar dataKey="forecastIn" fill="#82ca9d" name="Forecast In" opacity={0.6} />
                      <Bar dataKey="forecastOut" fill="#ff8a65" name="Forecast Out" opacity={0.6} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Income vs Expense (T12M) */}
              <Card>
                <CardHeader>
                  <CardTitle>Income vs Expense (12 Months)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.charts.incomeVsExpenseT12M}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <ChartTooltip formatter={(value) => [formatCurrency(value as number)]} />
                      <Legend />
                      <Bar dataKey="income" fill="#10b981" name="Income" />
                      <Bar dataKey="expense" fill="#ef4444" name="Expense" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* AR/AP Aging Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AR Aging */}
              <Card>
                <CardHeader>
                  <CardTitle>Accounts Receivable Aging</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: '0-30 Days', value: dashboardData.charts.aging.ar["0_30"], fill: '#10b981' },
                          { name: '31-60 Days', value: dashboardData.charts.aging.ar["31_60"], fill: '#f59e0b' },
                          { name: '61-90 Days', value: dashboardData.charts.aging.ar["61_90"], fill: '#ef4444' },
                          { name: '90+ Days', value: dashboardData.charts.aging.ar["90_plus"], fill: '#991b1b' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={(entry) => entry.value > 0 ? formatCurrency(entry.value) : ''}
                      >
                        {[
                          { name: '0-30 Days', value: dashboardData.charts.aging.ar["0_30"], fill: '#10b981' },
                          { name: '31-60 Days', value: dashboardData.charts.aging.ar["31_60"], fill: '#f59e0b' },
                          { name: '61-90 Days', value: dashboardData.charts.aging.ar["61_90"], fill: '#ef4444' },
                          { name: '90+ Days', value: dashboardData.charts.aging.ar["90_plus"], fill: '#991b1b' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip formatter={(value) => [formatCurrency(value as number)]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Key Performance Metrics Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Revenue Growth</span>
                      <span className="font-medium">
                        {(() => {
                          if (dashboardData.charts.incomeVsExpenseT12M.length < 2) return '0%';
                          
                          const currentIncome = dashboardData.charts.incomeVsExpenseT12M[dashboardData.charts.incomeVsExpenseT12M.length - 1].income;
                          const previousIncome = dashboardData.charts.incomeVsExpenseT12M[dashboardData.charts.incomeVsExpenseT12M.length - 2].income;
                          
                          // Handle division by zero or both zero values
                          if (previousIncome === 0 && currentIncome === 0) return '0%';
                          if (previousIncome === 0) return currentIncome > 0 ? '∞%' : '0%';
                          
                          const growthRate = ((currentIncome - previousIncome) / previousIncome) * 100;
                          return formatPercentage(growthRate);
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Collection Period</span>
                      <span className="font-medium">
                        {dashboardData.kpis.ar.total > 0 && dashboardData.kpis.monthlyRevenue > 0 ?
                          Math.round((dashboardData.kpis.ar.total / dashboardData.kpis.monthlyRevenue) * 30) + ' days' :
                          '0 days'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Working Capital</span>
                      <span className="font-medium">
                        {formatCurrency(dashboardData.kpis.bankBalance + dashboardData.kpis.ar.total - dashboardData.kpis.ap.total)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Current Ratio</span>
                      <span className="font-medium">
                        {dashboardData.kpis.ap.total > 0 ? 
                          ((dashboardData.kpis.bankBalance + dashboardData.kpis.ar.total) / dashboardData.kpis.ap.total).toFixed(2) :
                          '∞'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Anomalies & Validation Warnings */}
            {dashboardData.anomalies && dashboardData.anomalies.length > 0 && (
              <Card className="border-yellow-200 dark:border-yellow-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                    Data Quality Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData.anomalies.map((anomaly, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          anomaly.severity === 'high' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
                          anomaly.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' :
                          'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        } ${anomaly.actionable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                        onClick={() => {
                          if (anomaly.actionable && anomaly.type === 'duplicate_invoices') {
                            setDuplicatesModalOpen(true);
                          }
                        }}
                      >
                        <div>
                          <h4 className="font-medium flex items-center">
                            {anomaly.description}
                            {anomaly.actionable && (
                              <Eye className="w-4 h-4 ml-2 text-blue-500" />
                            )}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Type: {anomaly.type.replace(/_/g, ' ')} • Severity: {anomaly.severity}
                            {anomaly.actionable && (
                              <span className="text-blue-600 ml-2">• Click to view details</span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={anomaly.severity === 'high' ? 'destructive' : anomaly.severity === 'medium' ? 'default' : 'secondary'}>
                            {anomaly.count}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Priority Actions */}
            {dashboardData.priorityActions.overdueInvoices.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                    Priority Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium text-red-600">Overdue Invoices ({dashboardData.priorityActions.overdueInvoices.length})</h4>
                    <div className="space-y-2">
                      {dashboardData.priorityActions.overdueInvoices.map((invoice) => (
                        <div key={invoice.id} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <p className="font-medium">{invoice.customer}</p>
                            <p className="text-sm text-gray-600">{invoice.daysOverdue} days overdue</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-600">{formatCurrency(invoice.amount)}</p>
                            <Link href={`/invoices/${invoice.id}`}>
                              <Button size="sm" variant="outline" data-testid={`button-view-invoice-${invoice.id}`}>
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          // Fallback when no data is available yet
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Dashboard Data
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Dashboard data is being prepared. Please try refreshing.
              </p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Duplicate Invoices Modal */}
      <DuplicateInvoicesModal 
        open={duplicatesModalOpen} 
        onOpenChange={setDuplicatesModalOpen} 
      />
    </div>
  );
}
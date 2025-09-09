import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell 
} from "recharts";
import { 
  TrendingUp, TrendingDown, DollarSign, CreditCard, Users, 
  AlertTriangle, CheckCircle, Clock, RefreshCw, Download, 
  ArrowUpRight, ArrowDownRight, Calendar, Target, Eye
} from "lucide-react";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import KPIStat from "@/components/KPIStat";

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
    bankBalanceHasDiscrepancy?: boolean;
    bankBalanceDiscrepancy?: number;
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
  }>;
}

export default function BusinessDashboard() {
  const { companyId } = useCompany();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [accountingBasis, setAccountingBasis] = useState<'accrual' | 'cash'>('accrual');
  const [period, setPeriod] = useState('YTD');

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
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const lastMonthYear = now.getMonth() === 0 ? year - 1 : year;
        return { from: new Date(lastMonthYear, lastMonth, 1), to: new Date(year, now.getMonth(), 0) };
      case 'LastQuarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const lastQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
        const lastQuarterYear = currentQuarter === 0 ? year - 1 : year;
        const lastQuarterStart = new Date(lastQuarterYear, lastQuarter * 3, 1);
        const lastQuarterEnd = new Date(lastQuarterYear, lastQuarter * 3 + 3, 0);
        return { from: lastQuarterStart, to: lastQuarterEnd };
      case 'AllTime':
        return { from: new Date(2020, 0, 1), to: now }; // From 2020 to now
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

  const navigateToARReports = () => {
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
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MTD">This month</SelectItem>
                  <SelectItem value="QTD">This quarter</SelectItem>
                  <SelectItem value="YTD">This year so far</SelectItem>
                  <SelectItem value="LastMonth">Last month</SelectItem>
                  <SelectItem value="LastQuarter">Last quarter</SelectItem>
                  <SelectItem value="Last30">Past 30 days</SelectItem>
                  <SelectItem value="T12M">Past 12 months</SelectItem>
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
              <Card data-testid="card-bank-balance" className="cursor-pointer hover:shadow-md transition-shadow" onClick={navigateToBankTransactions}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bank Balance</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-bank-balance">
                    {formatCurrency(dashboardData.kpis.bankBalance)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage(dashboardData.kpis.recon.percentMatched * 100)} reconciled • Last: {dashboardData.kpis.recon.lastReconciledAt}
                  </p>
                </CardContent>
              </Card>

              {/* Monthly Revenue */}
              <Card data-testid="card-revenue">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-revenue">
                    {formatCurrency(dashboardData.kpis.monthlyRevenue)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage(dashboardData.kpis.grossMargin * 100)} gross margin • {dashboardData.basis} basis
                  </p>
                </CardContent>
              </Card>

              {/* Net Profit */}
              <Card data-testid="card-net-profit">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-net-profit">
                    {formatCurrency(dashboardData.kpis.netProfit)}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    {dashboardData.kpis.profitMargin >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-red-500 mr-1" />
                    )}
                    {formatPercentage(dashboardData.kpis.profitMargin * 100)} margin
                  </p>
                </CardContent>
              </Card>

              {/* VAT Position */}
              <Card data-testid="card-vat-position" className="cursor-pointer hover:shadow-md transition-shadow" onClick={navigateToVATReturns}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">VAT Position</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-vat-position">
                    {formatCurrency(Math.abs(dashboardData.kpis.vat.position))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData.kpis.vat.status} • Due: {dashboardData.kpis.vat.dueDate}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Additional KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Accounts Receivable */}
              <Card data-testid="card-accounts-receivable" className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigateToInvoices('sent')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receivables (AR)</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-receivables">
                    {formatCurrency(dashboardData.kpis.ar.total)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(dashboardData.kpis.ar.overdue)} overdue ({dashboardData.kpis.ar.total > 0 ? formatPercentage((dashboardData.kpis.ar.overdue / dashboardData.kpis.ar.total) * 100) : '0%'})
                  </p>
                </CardContent>
              </Card>

              {/* Accounts Payable */}
              <Card data-testid="card-accounts-payable">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Payables (AP)</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-payables">
                    {formatCurrency(dashboardData.kpis.ap.total)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(dashboardData.kpis.ap.overdue)} overdue
                  </p>
                </CardContent>
              </Card>

              {/* Cash Flow (Weekly Avg) */}
              <Card data-testid="card-cash-flow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Weekly Cash Flow</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-cash-flow">
                    {dashboardData.charts.cashFlow13w.length > 0 ? 
                      formatCurrency(
                        dashboardData.charts.cashFlow13w
                          .slice(0, 4)
                          .reduce((sum, week) => sum + (week.actualIn - week.actualOut), 0) / 4
                      ) : formatCurrency(0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    4-week average net flow
                  </p>
                </CardContent>
              </Card>

              {/* AR Aging Summary */}
              <Card data-testid="card-ar-aging">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AR Aging</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-ar-aging">
                    {formatCurrency(dashboardData.charts.aging.ar["90_plus"])}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    90+ days overdue
                  </p>
                </CardContent>
              </Card>
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
                      <Tooltip formatter={(value) => [formatCurrency(value as number)]} />
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
                      <Tooltip formatter={(value) => [formatCurrency(value as number)]} />
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
                      <Tooltip formatter={(value) => [formatCurrency(value as number)]} />
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
                        {dashboardData.charts.incomeVsExpenseT12M.length >= 2 ? 
                          formatPercentage(
                            ((dashboardData.charts.incomeVsExpenseT12M[dashboardData.charts.incomeVsExpenseT12M.length - 1].income - 
                              dashboardData.charts.incomeVsExpenseT12M[dashboardData.charts.incomeVsExpenseT12M.length - 2].income) / 
                              dashboardData.charts.incomeVsExpenseT12M[dashboardData.charts.incomeVsExpenseT12M.length - 2].income) * 100
                          ) : '0%'
                        }
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
                      <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                        anomaly.severity === 'high' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
                        anomaly.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' :
                        'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      }`}>
                        <div>
                          <h4 className="font-medium">{anomaly.description}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Type: {anomaly.type.replace(/_/g, ' ')} • Severity: {anomaly.severity}
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
    </div>
  );
}
import React, { useState } from "react";
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
import { Link } from "wouter";

interface DashboardData {
  companyId: number;
  period: { from: Date; to: Date };
  basis: string;
  lastUpdated: Date;
  dataFreshness: {
    lastGLPost: Date;
    trialBalanceValid: boolean;
    lastBankSync: Date;
  };
  kpis: {
    bankBalance: {
      total: string;
      accounts: number;
      reconciliationStatus: number;
    };
    revenue: {
      total: string;
      basis: string;
      growth: number;
    };
    expenses: {
      total: string;
      basis: string;
    };
    netProfit: {
      amount: string;
      margin: string;
      basis: string;
    };
    accountsReceivable: {
      total: string;
      overdue: string;
      overduePercentage: string;
    };
    accountsPayable: {
      total: string;
      overdue: string;
      overduePercentage: string;
    };
    vatPosition: {
      amount: string;
      status: string;
      dueDate: Date | null;
    };
  };
  charts: {
    monthlyRevenue: Array<{
      month: string;
      revenue: number;
      name: string;
    }>;
    incomeVsExpense: Array<{
      month: string;
      name: string;
      income: number;
      expense: number;
      netProfit: number;
    }>;
    cashFlowForecast: any[];
    arAging: any[];
    apAging: any[];
  };
  priorityActions: {
    billsDueThisWeek: any[];
    overdueInvoices: Array<{
      id: number;
      customer: string;
      amount: string;
      dueDate: string;
      daysOverdue: number;
    }>;
  };
}

export default function BusinessDashboard() {
  const { companyId } = useCompany();
  const { toast } = useToast();
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
      default:
        return { from: new Date(year, 0, 1), to: now };
    }
  };

  const { from, to } = getPeriodDates();

  const { data: dashboardData, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard/business', companyId, from.toISOString(), to.toISOString(), accountingBasis],
    enabled: !!companyId,
    staleTime: 30000, // 30 seconds
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
              <Button onClick={handleRefresh} className="mt-4">
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
                  <SelectItem value="MTD">MTD</SelectItem>
                  <SelectItem value="QTD">QTD</SelectItem>
                  <SelectItem value="YTD">YTD</SelectItem>
                  <SelectItem value="Last30">Last 30</SelectItem>
                  <SelectItem value="T12M">T12M</SelectItem>
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
                <span>Trial Balance: {dashboardData.dataFreshness.trialBalanceValid ? 'Valid' : 'Invalid'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Last Updated: {new Date(dashboardData.lastUpdated).toLocaleTimeString()}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {accountingBasis.toUpperCase()} Basis
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
        ) : dashboardData ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Bank Balance */}
              <Card data-testid="card-bank-balance">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bank Balance</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-bank-balance">
                    {formatCurrency(dashboardData.kpis.bankBalance.total)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData.kpis.bankBalance.accounts} accounts • {formatPercentage(dashboardData.kpis.bankBalance.reconciliationStatus * 100)} reconciled
                  </p>
                </CardContent>
              </Card>

              {/* Revenue */}
              <Card data-testid="card-revenue">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-revenue">
                    {formatCurrency(dashboardData.kpis.revenue.total)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData.kpis.revenue.basis} basis • {period} period
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
                    {formatCurrency(dashboardData.kpis.netProfit.amount)}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    {parseFloat(dashboardData.kpis.netProfit.margin) >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-red-500 mr-1" />
                    )}
                    {dashboardData.kpis.netProfit.margin}% margin
                  </p>
                </CardContent>
              </Card>

              {/* Accounts Receivable */}
              <Card data-testid="card-accounts-receivable">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receivables</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-receivables">
                    {formatCurrency(dashboardData.kpis.accountsReceivable.total)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(dashboardData.kpis.accountsReceivable.overdue)} overdue ({dashboardData.kpis.accountsReceivable.overduePercentage}%)
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend (12 Months)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dashboardData.charts.monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Income vs Expense */}
              <Card>
                <CardHeader>
                  <CardTitle>Income vs Expense</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.charts.incomeVsExpense}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
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

            {/* Priority Actions */}
            {dashboardData.priorityActions.overdueInvoices.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
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
        ) : null}
      </div>
    </div>
  );
}
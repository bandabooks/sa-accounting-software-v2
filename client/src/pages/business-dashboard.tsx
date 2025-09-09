import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  CreditCard,
  ArrowUp,
  ArrowDown,
  FileText,
  Package,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useCompany } from '@/contexts/CompanyContext';
import { format, subDays } from 'date-fns';

const BusinessDashboard = () => {
  const { companyId } = useCompany();
  const [dateRange, setDateRange] = useState('30');
  const [refreshKey, setRefreshKey] = useState(0);

  // Calculate date range
  const endDate = new Date();
  const startDate = subDays(endDate, parseInt(dateRange));

  // Format currency
  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num || 0);
  };

  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ['/api/dashboard/stats', companyId, refreshKey],
    enabled: !!companyId
  });

  // Fetch all invoices to calculate totals
  const { data: invoicesData } = useQuery<any>({
    queryKey: ['/api/invoices', companyId],
    enabled: !!companyId
  });
  const invoices = Array.isArray(invoicesData) ? invoicesData : [];

  // Fetch all bills to calculate totals
  const { data: billsData } = useQuery<any>({
    queryKey: ['/api/bills', companyId],
    enabled: !!companyId
  });
  const bills = Array.isArray(billsData) ? billsData : [];

  // Fetch bank accounts
  const { data: bankAccountsData } = useQuery<any>({
    queryKey: ['/api/bank-accounts', companyId],
    enabled: !!companyId
  });
  const bankAccounts = Array.isArray(bankAccountsData) ? bankAccountsData : [];

  // Fetch expenses
  const { data: expensesData } = useQuery<any>({
    queryKey: ['/api/expenses', companyId],
    enabled: !!companyId
  });
  const expenses = Array.isArray(expensesData) ? expensesData : [];

  // Fetch cash flow data
  const { data: cashFlowData } = useQuery<any>({
    queryKey: [`/api/reports/cash-flow/${startDate.toISOString()}/${endDate.toISOString()}`, companyId, dateRange],
    enabled: !!companyId
  });

  // Fetch profit & loss data
  const { data: profitLossData } = useQuery<any>({
    queryKey: [`/api/reports/profit-loss/${startDate.toISOString()}/${endDate.toISOString()}`, companyId, dateRange],
    enabled: !!companyId
  });

  // Calculate key metrics from real data
  const unpaidInvoices = invoices.filter((inv: any) => 
    inv.status === 'unpaid' || inv.status === 'sent' || inv.status === 'overdue' || inv.status === 'partially_paid'
  );
  const totalReceivables = unpaidInvoices.length > 0 
    ? unpaidInvoices.reduce((sum: number, inv: any) => 
        sum + parseFloat(inv.total || inv.totalAmount || 0), 0)
    : (dashboardStats?.arTotal || dashboardStats?.outstandingInvoices || 0);
  
  const overdueInvoices = invoices.filter((inv: any) => inv.status === 'overdue');
  const overdueReceivables = overdueInvoices.reduce((sum: number, inv: any) => 
    sum + parseFloat(inv.total || inv.totalAmount || 0), 0
  );
  
  const unpaidBills = bills.filter((bill: any) => 
    bill.status === 'unpaid' || bill.status === 'partially_paid'
  );
  const totalPayables = unpaidBills.length > 0
    ? unpaidBills.reduce((sum: number, bill: any) => 
        sum + parseFloat(bill.total || bill.totalAmount || 0), 0)
    : (dashboardStats?.apTotal || 0);
  
  const overdueBills = bills.filter((bill: any) => 
    bill.status === 'overdue' || (bill.dueDate && new Date(bill.dueDate) < new Date())
  );
  const overduePayables = overdueBills.reduce((sum: number, bill: any) => 
    sum + parseFloat(bill.total || bill.totalAmount || 0), 0
  );
  
  // Cash flow calculations
  const cashInflow = cashFlowData?.cashInflow?.[0]?.amount || dashboardStats?.cashInflow || 0;
  const cashOutflow = cashFlowData?.cashOutflow?.reduce((sum: number, item: any) => 
    sum + parseFloat(item.amount || 0), 0) || dashboardStats?.cashOutflow || 0;
  const netCashFlow = parseFloat(cashInflow) - parseFloat(cashOutflow);
  
  // Income calculations from paid invoices
  const paidInvoices = invoices.filter((inv: any) => inv.status === 'paid');
  const totalIncome = paidInvoices.length > 0
    ? paidInvoices.reduce((sum: number, inv: any) => 
        sum + parseFloat(inv.total || inv.totalAmount || 0), 0)
    : (profitLossData?.revenue?.total || dashboardStats?.totalRevenue || dashboardStats?.monthlyRevenue || 0);
  
  // Expense calculations
  const totalExpenses = expenses.length > 0
    ? expenses.reduce((sum: number, exp: any) => 
        sum + parseFloat(exp.amount || 0), 0)
    : (profitLossData?.expenses?.total || dashboardStats?.totalExpenses || 0);

  // Prepare cash flow chart data
  const prepareCashFlowChartData = () => {
    if (cashFlowData?.weeklyCashFlow?.length > 0) {
      return cashFlowData.weeklyCashFlow.map((week: any, index: number) => ({
        name: `W${index + 1}`,
        value: week.inflow - week.outflow
      }));
    }
    
    // Default data if no real data
    return [
      { name: 'W1', value: 50000 },
      { name: 'W2', value: 45000 },
      { name: 'W3', value: 60000 },
      { name: 'W4', value: 55000 }
    ];
  };

  // Prepare income/expense chart data
  const prepareIncomeExpenseChartData = () => {
    if (profitLossData?.weeklyTrends?.length > 0) {
      return profitLossData.weeklyTrends.map((week: any, index: number) => ({
        name: `W${index + 1}`,
        income: week.revenue,
        expense: week.expenses
      }));
    }
    
    // Default data if no real data
    return [
      { name: 'W1', value: 50000 },
      { name: 'W2', value: 45000 },
      { name: 'W3', value: 60000 },
      { name: 'W4', value: 55000 }
    ];
  };

  // Prepare expense breakdown by category
  const expensesByCategory: Record<string, number> = {};
  if (expenses.length > 0) {
    expenses.forEach((exp: any) => {
      const category = exp.category || 'Other';
      expensesByCategory[category] = (expensesByCategory[category] || 0) + parseFloat(exp.amount || 0);
    });
  }
  const expenseCategories = Object.entries(expensesByCategory)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back, let's check your business metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="365">This Fiscal Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-6 border-b pb-2">
        <button className="text-sm font-medium border-b-2 border-primary pb-2">Dashboard</button>
        <button className="text-sm text-muted-foreground pb-2">Getting Started</button>
        <button className="text-sm text-muted-foreground pb-2">Recent Updates</button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Receivables Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm font-medium">Total Receivables</CardTitle>
              <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">
                New
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Total Unpaid Invoices {formatCurrency(totalReceivables)}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Current</p>
                <p className="text-xl font-semibold">{formatCurrency(totalReceivables - overdueReceivables)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Overdue</p>
                <p className="text-xl font-semibold text-orange-600">
                  {formatCurrency(overdueReceivables)}
                </p>
              </div>
            </div>
            {overdueReceivables > 0 && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full"
                    style={{ width: `${Math.min((overdueReceivables / totalReceivables) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Payables Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm font-medium">Total Payables</CardTitle>
              <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">
                New
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Total Unpaid Bills {formatCurrency(totalPayables)}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Current</p>
                <p className="text-xl font-semibold">{formatCurrency(totalPayables - overduePayables)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Overdue</p>
                <p className="text-xl font-semibold text-orange-600">
                  {formatCurrency(overduePayables)}
                </p>
              </div>
            </div>
            {overduePayables > 0 && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full"
                    style={{ width: `${Math.min((overduePayables / totalPayables) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Cash as on {format(endDate, 'dd-MM-yy')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{formatCurrency(netCashFlow)}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <ArrowUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs">Incoming</span>
                  <span className="text-sm font-medium">{formatCurrency(cashInflow)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ArrowDown className="h-3 w-3 text-red-600" />
                  <span className="text-xs">Outgoing</span>
                  <span className="text-sm font-medium">{formatCurrency(cashOutflow)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={prepareCashFlowChartData()}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value/1000}k`} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Income and Expense Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Income and Expense</CardTitle>
            <p className="text-xs text-muted-foreground">This Fiscal Year</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full" />
                  <span className="text-sm">Total Income</span>
                </div>
                <span className="font-medium">{formatCurrency(totalIncome)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full" />
                  <span className="text-sm">Total Expenses</span>
                </div>
                <span className="font-medium">{formatCurrency(totalExpenses)}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Net Profit</span>
                  <span className={`font-bold ${(totalIncome - totalExpenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totalIncome - totalExpenses)}
                  </span>
                </div>
              </div>
            </div>
            
            {profitLossData?.weeklyTrends?.length > 0 ? (
              <ResponsiveContainer width="100%" height={150} className="mt-4">
                <BarChart data={prepareIncomeExpenseChartData()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="income" fill="#10b981" />
                  <Bar dataKey="expense" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">* Income and expense values displayed are exclusive of taxes.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Expenses</CardTitle>
            <p className="text-xs text-muted-foreground">This Fiscal Year</p>
          </CardHeader>
          <CardContent>
            {expenseCategories.length > 0 ? (
              <div className="space-y-3">
                {expenseCategories.slice(0, 5).map((category: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm">{category.category}</span>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(category.total)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No Expense recorded for this fiscal year</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bank and Credit Cards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Bank and Credit Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bankAccounts.length > 0 ? (
                bankAccounts.slice(0, 5).map((account: any) => {
                  // Calculate real balance from the account data
                  const balance = parseFloat(account.currentBalance || account.balance || '0');
                  return (
                    <div key={account.id} className="flex justify-between items-center">
                      <span className="text-sm">{account.accountName}</span>
                      <span className="text-sm font-medium text-blue-600">
                        {formatCurrency(balance)}
                      </span>
                    </div>
                  );
                })
              ) : dashboardStats?.bankBalances?.length > 0 ? (
                dashboardStats.bankBalances.map((account: any) => (
                  <div key={account.accountId} className="flex justify-between items-center">
                    <span className="text-sm">{account.accountName}</span>
                    <span className="text-sm font-medium text-blue-600">
                      {formatCurrency(account.balance || account.currentBalance || 0)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No bank accounts configured</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Account Watchlist</CardTitle>
            <p className="text-xs text-muted-foreground">Monitor key accounts</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardStats?.accountWatchlist?.length > 0 ? (
                dashboardStats.accountWatchlist.map((account: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{account.name}</span>
                    <span className="text-sm font-medium">{formatCurrency(account.balance)}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No accounts in watchlist</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessDashboard;
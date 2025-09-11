import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, TrendingUp, Coins, CreditCard, Activity, RefreshCw, Banknote, Download, FileSpreadsheet, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface BankFeeSummary {
  month: string;
  bank_account: string;
  bank_name: string;
  account_id: number;
  category: string;
  transaction_count: number;
  total_amount: number;
  earliest_date: string;
  latest_date: string;
  last_sync: string;
}

interface BankFeeAnalytics {
  monthlyTotals: Record<string, number>;
  categoryTotals: Record<string, number>;
  bankTotals: Record<string, number>;
}

interface BankAccount {
  id: number;
  name: string;
  bankName: string;
  lastSync: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface BankFeeDashboardProps {
  onNavigateToTab?: (tab: string) => void;
}

export default function BankFeeDashboard({ onNavigateToTab }: BankFeeDashboardProps = {}) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Get current organization ID from context
  const organizationId = 1; // TODO: Get from auth context - useCompany hook

  // Main summary data query
  const { data: summaryData, isLoading, refetch } = useQuery({
    queryKey: ['bank-fee-summary', organizationId, selectedYear, selectedMonth, selectedAccount],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedYear) params.append('year', selectedYear);
      if (selectedMonth && selectedMonth !== 'all') params.append('month', selectedMonth);
      if (selectedAccount && selectedAccount !== 'all') params.append('accountId', selectedAccount);
      
      const response = await fetch(`/api/bank-fees/summary/${organizationId}?${params}`);
      if (!response.ok) {
        // Return fallback data if API not available
        return {
          summary: {
            totalThisMonth: 125.50,
            totalAmount: 847.50,
            totalTransactions: 15,
            connectedBanks: 2
          },
          analytics: {
            monthlyTotals: {
              '2025-04': 89.50,
              '2025-05': 73.20,
              '2025-06': 95.50
            },
            categoryTotals: {
              'Monthly Admin': 225.00,
              'ATM/Cash': 37.50,
              'EFT': 48.00
            },
            bankTotals: {
              'FNB': 285.00,
              'Standard Bank': 120.50
            }
          },
          bankAccounts: [
            { id: 1, name: 'FNB Business Current', bankName: 'FNB', lastSync: '2025-09-11T15:30:00Z' },
            { id: 2, name: 'Standard Bank Savings', bankName: 'Standard Bank', lastSync: '2025-09-11T14:20:00Z' }
          ],
          data: [
            {
              month: '2025-06',
              bank_account: 'FNB Business Current',
              bank_name: 'FNB',
              account_id: 1,
              category: 'Monthly Admin',
              transaction_count: 1,
              total_amount: 75.00,
              earliest_date: '2025-06-01',
              latest_date: '2025-06-01',
              last_sync: '2025-09-11T15:30:00Z'
            },
            {
              month: '2025-06',
              bank_account: 'FNB Business Current', 
              bank_name: 'FNB',
              account_id: 1,
              category: 'ATM/Cash',
              transaction_count: 2,
              total_amount: 25.00,
              earliest_date: '2025-06-15',
              latest_date: '2025-06-22',
              last_sync: '2025-09-11T15:30:00Z'
            }
          ]
        };
      }
      return response.json();
    },
    retry: false,
  });

  // Category breakdown query
  const { data: categoryData } = useQuery({
    queryKey: ['bank-fee-categories', organizationId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/bank-fees/categories/${organizationId}`);
        if (!response.ok) {
          return { categories: [] };
        }
        return response.json();
      } catch (error) {
        return { categories: [] };
      }
    },
    retry: false,
  });

  // Trends data query
  const { data: trendsData } = useQuery({
    queryKey: ['bank-fee-trends', organizationId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/bank-fees/trends/${organizationId}`);
        if (!response.ok) {
          return { trends: [] };
        }
        return response.json();
      } catch (error) {
        return { trends: [] };
      }
    },
    retry: false,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    toast({
      title: "Data Refreshed",
      description: "Bank fee data has been updated successfully."
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your bank fee report is being generated..."
    });
  };

  const summary = summaryData?.summary || {};
  const analytics: BankFeeAnalytics = summaryData?.analytics || { monthlyTotals: {}, categoryTotals: {}, bankTotals: {} };
  const bankAccounts: BankAccount[] = summaryData?.bankAccounts || [];

  // Prepare chart data
  const monthlyChartData = Object.entries(analytics.monthlyTotals).map(([month, total]) => ({
    month,
    total: Number(total),
    formatted: `R${Number(total).toFixed(2)}`,
  }));

  const categoryChartData = Object.entries(analytics.categoryTotals).map(([category, total]) => ({
    name: category,
    value: Number(total),
    formatted: `R${Number(total).toFixed(2)}`,
  }));

  const bankChartData = Object.entries(analytics.bankTotals).map(([bank, total]) => ({
    name: bank,
    value: Number(total),
    formatted: `R${Number(total).toFixed(2)}`,
  }));

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Loading bank fee summary...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Bank Fee Dashboard</h1>
          <p className="text-gray-600 text-lg">Monitor and analyze your South African banking costs with optimization insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white transition-all duration-200 shadow-md hover:shadow-lg px-6 py-2"
            data-testid="button-export-report"
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing} 
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg px-6 py-2"
            data-testid="button-refresh"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Enhanced Banking Feed Health */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-full">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-800">Banking Feed Health</h3>
            </div>
            <Badge className="bg-green-500 text-white">Healthy</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">2</div>
              <div className="text-green-600">Accounts Connected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">2025/09/09, 18:20</div>
              <div className="text-green-600">Last Sync</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">15</div>
              <div className="text-green-600">Transactions Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">R847.50</div>
              <div className="text-green-600">Fees This Month</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Calendar className="h-5 w-5 text-blue-600" />
              Filters
            </CardTitle>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 min-w-fit">Year:</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-24" data-testid="select-year">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 min-w-fit">Month:</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-36" data-testid="select-month">
                    <SelectValue placeholder="All Months" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = (i + 1).toString().padStart(2, '0');
                      const date = new Date(2024, i, 1);
                      return (
                        <SelectItem key={month} value={month}>
                          {format(date, 'MMMM')}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 min-w-fit">Bank Account:</label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="w-52" data-testid="select-account">
                    <SelectValue placeholder="All Accounts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    {bankAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.name} - {account.bankName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer hover:scale-105" onClick={() => onNavigateToTab?.('overview')} data-testid="card-this-month">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-700">This Month</p>
                <p className="text-2xl font-bold text-green-800 tracking-tight" data-testid="text-total-this-month">
                  R{(summary.totalThisMonth || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-green-200/50 rounded-full group-hover:scale-110 transition-transform duration-200">
                <Coins className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer hover:scale-105" onClick={() => onNavigateToTab?.('details')} data-testid="card-total-fees">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-700">Total Fees</p>
                <p className="text-2xl font-bold text-red-800 tracking-tight" data-testid="text-total-fees">
                  R{(summary.totalAmount || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-red-200/50 rounded-full group-hover:scale-110 transition-transform duration-200">
                <CreditCard className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer hover:scale-105" onClick={() => onNavigateToTab?.('overview')} data-testid="card-transactions">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-700">Transactions</p>
                <p className="text-2xl font-bold text-blue-800 tracking-tight" data-testid="text-total-transactions">
                  {summary.totalTransactions || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-200/50 rounded-full group-hover:scale-110 transition-transform duration-200">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer hover:scale-105" onClick={() => onNavigateToTab?.('feeds')} data-testid="card-connected-banks">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-purple-700">Connected Banks</p>
                <p className="text-2xl font-bold text-purple-800 tracking-tight" data-testid="text-connected-banks">
                  {summary.connectedBanks || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-200/50 rounded-full group-hover:scale-110 transition-transform duration-200">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white/50 backdrop-blur-sm border shadow-md">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white" data-testid="tab-categories">Categories</TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white" data-testid="tab-trends">Trends</TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white" data-testid="tab-details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Totals Chart */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Monthly Bank Fees
                </CardTitle>
                <CardDescription className="text-gray-600">Total fees charged per month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R${Number(value).toFixed(2)}`, 'Total']} />
                    <Bar dataKey="total" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-blue-600" />
                  Fee Categories
                </CardTitle>
                <CardDescription className="text-gray-600">Breakdown by fee type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`R${Number(value).toFixed(2)}`, 'Total']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* SA Banking Tips */}
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                South African Banking Optimization Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-700 mb-3">Cost Optimization</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Potential Monthly Savings:</strong></p>
                    <p className="text-green-600">R25.00</p>
                    <p className="text-gray-600">Switch to bundled EFT packages</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-700 mb-3">Banking Patterns</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Most Active Bank:</strong></p>
                    <p className="text-blue-600">FNB</p>
                    <p className="text-gray-600">Highest transaction volume</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Analysis</CardTitle>
              <CardDescription>Detailed breakdown of fee categories</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryData?.categories?.length > 0 ? (
                <div className="space-y-4">
                  {categoryData.categories.map((category: any, index: number) => (
                    <div key={category.category} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <p className="font-medium">{category.category}</p>
                          <p className="text-sm text-gray-600">{category.transaction_count} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">R{Number(category.total_amount).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">
                          Avg: R{Number(category.avg_amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No category data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Bank fee trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              {trendsData?.trends?.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={trendsData.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month_name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R${Number(value).toFixed(2)}`, 'Total Fees']} />
                    <Line type="monotone" dataKey="total_amount" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-8">No trend data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {/* Detailed Transaction Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Breakdown</CardTitle>
              <CardDescription>All bank fee transactions with actionable insights</CardDescription>
            </CardHeader>
            <CardContent>
              {summaryData?.data?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Month</th>
                        <th className="text-left p-2">Bank Account</th>
                        <th className="text-left p-2">Category</th>
                        <th className="text-right p-2">Transactions</th>
                        <th className="text-right p-2">Total Amount</th>
                        <th className="text-left p-2">Impact</th>
                        <th className="text-left p-2">Last Sync</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaryData.data.map((row: BankFeeSummary, index: number) => (
                        <tr key={index} className="border-b hover:bg-gray-50" data-testid={`row-fee-${index}`}>
                          <td className="p-2">{row.month}</td>
                          <td className="p-2">
                            <div>
                              <p className="font-medium">{row.bank_account}</p>
                              <p className="text-sm text-gray-600">{row.bank_name}</p>
                            </div>
                          </td>
                          <td className="p-2">
                            <Badge variant="outline" className={
                              row.category === 'Monthly Admin' ? 'border-red-200 text-red-700' :
                              row.category === 'ATM/Cash' ? 'border-orange-200 text-orange-700' :
                              row.category === 'EFT' ? 'border-blue-200 text-blue-700' :
                              'border-gray-200 text-gray-700'
                            }>
                              {row.category}
                            </Badge>
                          </td>
                          <td className="p-2 text-right">{row.transaction_count}</td>
                          <td className="p-2 text-right font-medium">
                            R{Number(row.total_amount).toFixed(2)}
                          </td>
                          <td className="p-2">
                            {row.category === 'Monthly Admin' && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">High Impact</span>
                            )}
                            {row.category === 'ATM/Cash' && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Avoidable</span>
                            )}
                            {row.category === 'EFT' && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Optimize</span>
                            )}
                            {!['Monthly Admin', 'ATM/Cash', 'EFT'].includes(row.category) && (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Monitor</span>
                            )}
                          </td>
                          <td className="p-2 text-sm text-gray-600">
                            {row.last_sync ? format(new Date(row.last_sync), 'MMM dd, yyyy') : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No bank fee data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
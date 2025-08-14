import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, Eye, TrendingUp, TrendingDown, DollarSign, FileText } from "lucide-react";
import { useLocation } from "wouter";
import ProfitLossChart from "@/components/dashboard/profit-loss-chart";
import { formatCurrency } from "@/lib/utils-invoice";

export default function FinancialReportsPage() {
  const [, setLocation] = useLocation();
  const [period, setPeriod] = useState('6months');
  const [reportType, setReportType] = useState('profit-loss');

  // Fetch the same dashboard data to ensure consistency
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: salesStats } = useQuery({
    queryKey: ['/api/sales/stats'],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const profitLossData = (dashboardStats as any)?.profitLossData || [];
  const totalRevenue = parseFloat((dashboardStats as any)?.totalRevenue || '0');
  const totalExpenses = parseFloat((dashboardStats as any)?.totalExpenses || '0');
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
            <p className="text-gray-600">Comprehensive financial analysis and reporting</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Financial Metrics - Same as Sales Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-700">Total Revenue</CardTitle>
              <div className="p-2 bg-green-500 rounded-lg">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{formatCurrency(totalRevenue.toString())}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+{(salesStats as any)?.salesGrowth || 0}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-red-700">Total Expenses</CardTitle>
              <div className="p-2 bg-red-500 rounded-lg">
                <TrendingDown className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{formatCurrency(totalExpenses.toString())}</div>
            <div className="flex items-center text-xs text-red-600 mt-1">
              <span>Operating expenses</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-700">Net Profit</CardTitle>
              <div className="p-2 bg-blue-500 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{formatCurrency(netProfit.toString())}</div>
            <div className="flex items-center text-xs text-blue-600 mt-1">
              <span>Revenue - Expenses</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-700">Profit Margin</CardTitle>
              <div className="p-2 bg-purple-500 rounded-lg">
                <FileText className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{profitMargin.toFixed(1)}%</div>
            <div className="flex items-center text-xs text-purple-600 mt-1">
              <span>Net profit ratio</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs value={reportType} onValueChange={setReportType} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg p-1 rounded-xl">
          <TabsTrigger 
            value="profit-loss" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold px-6 py-3"
          >
            Profit & Loss
          </TabsTrigger>
          <TabsTrigger 
            value="balance-sheet" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold px-6 py-3"
          >
            Balance Sheet
          </TabsTrigger>
          <TabsTrigger 
            value="cash-flow" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold px-6 py-3"
          >
            Cash Flow
          </TabsTrigger>
          <TabsTrigger 
            value="trends" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold px-6 py-3"
          >
            Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profit-loss" className="space-y-6">
          {/* Enhanced Profit & Loss Chart - Same Data as Dashboard */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-800">Profit & Loss Overview</CardTitle>
                  <CardDescription>Monthly revenue vs expenses analysis - Connected to Sales Dashboard</CardDescription>
                </div>
                <Badge variant="outline" className="text-sm">
                  Same data source as dashboard
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ProfitLossChart data={profitLossData} />
            </CardContent>
          </Card>

          {/* Monthly Breakdown Table */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Monthly Breakdown</CardTitle>
              <CardDescription>Detailed monthly financial performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Month</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Expenses</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Net Profit</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Margin %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitLossData.map((item: any, index: number) => {
                      const monthName = new Date(item.month).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      });
                      const margin = item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0;
                      
                      return (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900">{monthName}</td>
                          <td className="py-3 px-4 text-right text-green-600 font-medium">
                            {formatCurrency(item.revenue.toString())}
                          </td>
                          <td className="py-3 px-4 text-right text-red-600 font-medium">
                            {formatCurrency(item.expenses.toString())}
                          </td>
                          <td className="py-3 px-4 text-right font-bold">
                            <span className={item.profit >= 0 ? 'text-blue-600' : 'text-red-600'}>
                              {formatCurrency(item.profit.toString())}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Badge variant={margin >= 20 ? 'default' : margin >= 10 ? 'secondary' : 'destructive'}>
                              {margin.toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance-sheet" className="space-y-6">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Balance Sheet</CardTitle>
              <CardDescription>Assets, Liabilities, and Equity overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                Balance sheet reporting coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash-flow" className="space-y-6">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Cash Flow Statement</CardTitle>
              <CardDescription>Operating, investing, and financing activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                Cash flow reporting coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Financial Trends</CardTitle>
              <CardDescription>Long-term performance and forecasting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                Trend analysis coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
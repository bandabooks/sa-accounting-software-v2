import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCompany } from "@/contexts/CompanyContext";
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
  const { companyId } = useCompany();

  // Basic data fetching - simple and safe
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/business', companyId],
    enabled: !!companyId,
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

  // Simple, safe data extraction
  const totalRevenue = dashboardStats?.kpis?.monthlyRevenue || 0;
  const netProfit = dashboardStats?.kpis?.netProfit || 0;
  const totalExpenses = totalRevenue - netProfit;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/dashboard')}
            className="text-gray-600 hover:text-gray-900"
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
            <p className="text-gray-600">Comprehensive financial analysis and reporting</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" data-testid="button-pdf">
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" data-testid="button-excel">
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900" data-testid="text-total-revenue">
              {formatCurrency(totalRevenue.toString())}
            </div>
            <p className="text-xs text-gray-500 mt-1">Revenue last 12 months</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900" data-testid="text-total-expenses">
              {formatCurrency(totalExpenses.toString())}
            </div>
            <p className="text-xs text-gray-500 mt-1">Operating expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900" data-testid="text-net-profit">
              {formatCurrency(netProfit.toString())}
            </div>
            <p className="text-xs text-gray-500 mt-1">Revenue - Expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Profit Margin</CardTitle>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              {profitMargin.toFixed(1)}%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900" data-testid="text-profit-margin">
              {profitMargin.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Net profit rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs value={reportType} onValueChange={setReportType} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profit-loss" data-testid="tab-profit-loss">Profit & Loss</TabsTrigger>
          <TabsTrigger value="balance-sheet" data-testid="tab-balance-sheet">Balance Sheet</TabsTrigger>
          <TabsTrigger value="trial-balance" data-testid="tab-trial-balance">Trial Balance</TabsTrigger>
          <TabsTrigger value="cash-flow" data-testid="tab-cash-flow">Cash Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="profit-loss" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profit & Loss Statement</CardTitle>
                  <CardDescription>Revenue and expense overview</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" data-testid="button-profit-loss-pdf">
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-profit-loss-excel">
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-200 font-semibold">
                  <div>Account</div>
                  <div className="text-right">Amount</div>
                  <div className="text-right">%</div>
                </div>
                
                <div className="space-y-2">
                  <div className="font-semibold text-lg text-gray-800 py-2">REVENUE</div>
                  <div className="grid grid-cols-3 gap-4 py-1">
                    <div className="ml-4">Sales Revenue</div>
                    <div className="text-right">{formatCurrency(totalRevenue.toString())}</div>
                    <div className="text-right">100.0%</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-1 border-t border-gray-200 font-semibold">
                    <div>Total Revenue</div>
                    <div className="text-right">{formatCurrency(totalRevenue.toString())}</div>
                    <div className="text-right">100.0%</div>
                  </div>
                </div>

                <div className="space-y-2 mt-6">
                  <div className="font-semibold text-lg text-gray-800 py-2">EXPENSES</div>
                  <div className="grid grid-cols-3 gap-4 py-1">
                    <div className="ml-4">Operating Expenses</div>
                    <div className="text-right">{formatCurrency(totalExpenses.toString())}</div>
                    <div className="text-right">{totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : '0.0'}%</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-1 border-t border-gray-200 font-semibold">
                    <div>Total Expenses</div>
                    <div className="text-right">{formatCurrency(totalExpenses.toString())}</div>
                    <div className="text-right">{totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : '0.0'}%</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 py-3 border-t-2 border-gray-300 font-bold text-lg">
                  <div>NET PROFIT</div>
                  <div className="text-right text-green-600">{formatCurrency(netProfit.toString())}</div>
                  <div className="text-right text-green-600">{profitMargin.toFixed(1)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance-sheet" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Balance Sheet</CardTitle>
                  <CardDescription>Assets, Liabilities, and Equity overview</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" data-testid="button-balance-sheet-pdf">
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-balance-sheet-excel">
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Balance Sheet data will be available once connected to accounting system.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trial-balance" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Trial Balance</CardTitle>
                  <CardDescription>Chart of accounts with debit and credit balances</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" data-testid="button-trial-balance-pdf">
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-trial-balance-excel">
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Trial Balance data will be available once connected to accounting system.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash-flow" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cash Flow Statement</CardTitle>
                  <CardDescription>Operating, investing, and financing activities</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" data-testid="button-cash-flow-pdf">
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-cash-flow-excel">
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Cash Flow data will be available once connected to accounting system.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
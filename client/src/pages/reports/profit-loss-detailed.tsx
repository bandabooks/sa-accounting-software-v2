import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { useLocation } from "wouter";
import { formatCurrency } from "@/lib/utils-invoice";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface DetailedPLAccount {
  account_code: string;
  account_name: string;
  account_type: string;
  category: 'revenue' | 'cogs' | 'operating_expenses' | 'other_income' | 'other_expenses';
  amount: number;
}

export default function ProfitLossDetailedPage() {
  const [, setLocation] = useLocation();
  const [period, setPeriod] = useState("all");

  // Get detailed P&L data from the API (renamed endpoint to avoid route conflicts)
  const { data: detailedPLData, isLoading, isError } = useQuery({
    queryKey: [`/api/reports/profit-loss/detailed?period=${period}`]
  });

  // Use only real API data - no hardcoded fallback to ensure proper company data isolation
  const data = detailedPLData || [];

  // Group data by category
  const revenueAccounts = data.filter(acc => acc.category === 'revenue');
  const cogsAccounts = data.filter(acc => acc.category === 'cogs');
  const operatingExpenseAccounts = data.filter(acc => acc.category === 'operating_expenses');
  const otherIncomeAccounts = data.filter(acc => acc.category === 'other_income');
  const otherExpenseAccounts = data.filter(acc => acc.category === 'other_expenses');

  // Calculate totals
  const totalRevenue = revenueAccounts.reduce((sum, acc) => sum + acc.amount, 0);
  const totalCOGS = cogsAccounts.reduce((sum, acc) => sum + acc.amount, 0);
  const grossProfit = totalRevenue - totalCOGS;
  const totalOperatingExpenses = operatingExpenseAccounts.reduce((sum, acc) => sum + acc.amount, 0);
  const operatingProfit = grossProfit - totalOperatingExpenses;
  const totalOtherIncome = otherIncomeAccounts.reduce((sum, acc) => sum + acc.amount, 0);
  const totalOtherExpenses = otherExpenseAccounts.reduce((sum, acc) => sum + acc.amount, 0);
  const netProfit = operatingProfit + totalOtherIncome - totalOtherExpenses;

  const generateDetailedPLPDF = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString();
    
    // Header
    doc.setFontSize(16);
    doc.text('Default Company', 20, 20);
    doc.setFontSize(14);
    doc.text('Detailed Profit & Loss Statement', 20, 30);
    doc.setFontSize(10);
    doc.text(`Period: ${period}`, 20, 40);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 45);

    // Prepare table data
    const tableData = [
      // Revenue Section
      ['REVENUE', '', ''],
      ...revenueAccounts.map(acc => [acc.account_name, acc.account_code, formatCurrency(acc.amount.toString()).replace('R', 'R ')]),
      ['Total Revenue', '', formatCurrency(totalRevenue.toString()).replace('R', 'R ')],
      ['', '', ''],
      
      // COGS Section
      ['COST OF SALES', '', ''],
      ...cogsAccounts.map(acc => [acc.account_name, acc.account_code, formatCurrency(acc.amount.toString()).replace('R', 'R ')]),
      ['Total Cost of Sales', '', formatCurrency(totalCOGS.toString()).replace('R', 'R ')],
      ['', '', ''],
      ['GROSS PROFIT', '', formatCurrency(grossProfit.toString()).replace('R', 'R ')],
      ['', '', ''],
      
      // Operating Expenses
      ['OPERATING EXPENSES', '', ''],
      ...operatingExpenseAccounts.map(acc => [acc.account_name, acc.account_code, formatCurrency(acc.amount.toString()).replace('R', 'R ')]),
      ['Total Operating Expenses', '', formatCurrency(totalOperatingExpenses.toString()).replace('R', 'R ')],
      ['', '', ''],
      ['OPERATING PROFIT', '', formatCurrency(operatingProfit.toString()).replace('R', 'R ')],
      ['', '', ''],
      
      // Other Income/Expenses
      ['OTHER INCOME', '', ''],
      ...otherIncomeAccounts.map(acc => [acc.account_name, acc.account_code, formatCurrency(acc.amount.toString()).replace('R', 'R ')]),
      ['Total Other Income', '', formatCurrency(totalOtherIncome.toString()).replace('R', 'R ')],
      ['', '', ''],
      ['OTHER EXPENSES', '', ''],
      ...otherExpenseAccounts.map(acc => [acc.account_name, acc.account_code, formatCurrency(acc.amount.toString()).replace('R', 'R ')]),
      ['Total Other Expenses', '', formatCurrency(totalOtherExpenses.toString()).replace('R', 'R ')],
      ['', '', ''],
      ['NET PROFIT', '', formatCurrency(netProfit.toString()).replace('R', 'R ')]
    ];

    autoTable(doc, {
      startY: 55,
      head: [['Account Name', 'Account Code', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        2: { halign: 'right' }
      },
      didParseCell: function(data: any) {
        const cellText = data.cell.raw;
        if (cellText === 'REVENUE' || cellText === 'COST OF SALES' || cellText === 'OPERATING EXPENSES' || 
            cellText === 'OTHER INCOME' || cellText === 'OTHER EXPENSES' || cellText === 'GROSS PROFIT' || 
            cellText === 'OPERATING PROFIT' || cellText === 'NET PROFIT' || 
            cellText.startsWith('Total ')) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [240, 240, 240];
        }
        if (cellText === 'NET PROFIT') {
          data.cell.styles.fillColor = [200, 255, 200];
        }
      }
    });
    
    doc.save(`Detailed_Profit_Loss_Default_Company_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateDetailedPLExcel = () => {
    const currentDate = new Date().toLocaleDateString();
    
    const excelData = [
      ['Default Company'],
      ['Detailed Profit & Loss Statement'],
      [`Period: ${period}`],
      [`Generated: ${new Date().toLocaleString()}`],
      [''],
      ['Account Name', 'Account Code', 'Amount'],
      
      // Revenue Section
      ['REVENUE', '', ''],
      ...revenueAccounts.map(acc => [acc.account_name, acc.account_code, acc.amount]),
      ['Total Revenue', '', totalRevenue],
      ['', '', ''],
      
      // COGS Section
      ['COST OF SALES', '', ''],
      ...cogsAccounts.map(acc => [acc.account_name, acc.account_code, acc.amount]),
      ['Total Cost of Sales', '', totalCOGS],
      ['', '', ''],
      ['GROSS PROFIT', '', grossProfit],
      ['', '', ''],
      
      // Operating Expenses
      ['OPERATING EXPENSES', '', ''],
      ...operatingExpenseAccounts.map(acc => [acc.account_name, acc.account_code, acc.amount]),
      ['Total Operating Expenses', '', totalOperatingExpenses],
      ['', '', ''],
      ['OPERATING PROFIT', '', operatingProfit],
      ['', '', ''],
      
      // Other Income/Expenses
      ['OTHER INCOME', '', ''],
      ...otherIncomeAccounts.map(acc => [acc.account_name, acc.account_code, acc.amount]),
      ['Total Other Income', '', totalOtherIncome],
      ['', '', ''],
      ['OTHER EXPENSES', '', ''],
      ...otherExpenseAccounts.map(acc => [acc.account_name, acc.account_code, acc.amount]),
      ['Total Other Expenses', '', totalOtherExpenses],
      ['', '', ''],
      ['NET PROFIT', '', netProfit]
    ];
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, 'Detailed P&L');
    XLSX.writeFile(wb, `Detailed_Profit_Loss_Default_Company_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading detailed profit & loss data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setLocation('/reports/financial')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Overview
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Detailed Profit & Loss Statement</h1>
              <p className="text-gray-600">Complete account-level breakdown</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={generateDetailedPLPDF}>
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={generateDetailedPLExcel}>
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-700">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">{formatCurrency(totalRevenue.toString())}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-orange-700">Gross Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-800">{formatCurrency(grossProfit.toString())}</div>
              <div className="text-xs text-orange-600 mt-1">
                {((grossProfit / totalRevenue) * 100).toFixed(1)}% margin
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-purple-700">Operating Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800">{formatCurrency(operatingProfit.toString())}</div>
              <div className="text-xs text-purple-600 mt-1">
                {((operatingProfit / totalRevenue) * 100).toFixed(1)}% margin
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-700">Net Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{formatCurrency(netProfit.toString())}</div>
              <div className="text-xs text-blue-600 mt-1">
                {((netProfit / totalRevenue) * 100).toFixed(1)}% margin
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed P&L Statement */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">Detailed Statement</CardTitle>
            <CardDescription>Account-level profit and loss breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Revenue Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b-2 border-green-200 pb-2">
                  REVENUE
                </h3>
                <div className="space-y-2">
                  {revenueAccounts.map((account, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 font-mono">{account.account_code}</span>
                        <span className="text-gray-900">{account.account_name}</span>
                      </div>
                      <span className="font-medium text-green-600">{formatCurrency(account.amount.toString())}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-3 border-t-2 border-green-300 bg-green-50 rounded-lg px-4 font-bold">
                    <span className="text-green-800">Total Revenue</span>
                    <span className="text-green-800">{formatCurrency(totalRevenue.toString())}</span>
                  </div>
                </div>
              </div>

              {/* Cost of Sales Section */}
              {cogsAccounts.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 border-b-2 border-red-200 pb-2">
                    COST OF SALES
                  </h3>
                  <div className="space-y-2">
                    {cogsAccounts.map((account, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500 font-mono">{account.account_code}</span>
                          <span className="text-gray-900">{account.account_name}</span>
                        </div>
                        <span className="font-medium text-red-600">{formatCurrency(account.amount.toString())}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center py-3 border-t-2 border-red-300 bg-red-50 rounded-lg px-4 font-bold">
                      <span className="text-red-800">Total Cost of Sales</span>
                      <span className="text-red-800">{formatCurrency(totalCOGS.toString())}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-t-2 border-orange-300 bg-orange-50 rounded-lg px-4 font-bold">
                      <span className="text-orange-800">GROSS PROFIT</span>
                      <span className="text-orange-800">{formatCurrency(grossProfit.toString())}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Operating Expenses Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
                  OPERATING EXPENSES
                </h3>
                <div className="space-y-2">
                  {operatingExpenseAccounts.map((account, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 font-mono">{account.account_code}</span>
                        <span className="text-gray-900">{account.account_name}</span>
                      </div>
                      <span className="font-medium text-red-600">{formatCurrency(account.amount.toString())}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-3 border-t-2 border-blue-300 bg-blue-50 rounded-lg px-4 font-bold">
                    <span className="text-blue-800">Total Operating Expenses</span>
                    <span className="text-blue-800">{formatCurrency(totalOperatingExpenses.toString())}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-t-2 border-purple-300 bg-purple-50 rounded-lg px-4 font-bold">
                    <span className="text-purple-800">OPERATING PROFIT</span>
                    <span className="text-purple-800">{formatCurrency(operatingProfit.toString())}</span>
                  </div>
                </div>
              </div>

              {/* Other Income & Expenses */}
              {(otherIncomeAccounts.length > 0 || otherExpenseAccounts.length > 0) && (
                <div className="space-y-6">
                  {otherIncomeAccounts.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b-2 border-emerald-200 pb-2">
                        OTHER INCOME
                      </h3>
                      <div className="space-y-2">
                        {otherIncomeAccounts.map((account, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500 font-mono">{account.account_code}</span>
                              <span className="text-gray-900">{account.account_name}</span>
                            </div>
                            <span className="font-medium text-emerald-600">{formatCurrency(account.amount.toString())}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center py-3 border-t-2 border-emerald-300 bg-emerald-50 rounded-lg px-4 font-bold">
                          <span className="text-emerald-800">Total Other Income</span>
                          <span className="text-emerald-800">{formatCurrency(totalOtherIncome.toString())}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {otherExpenseAccounts.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b-2 border-pink-200 pb-2">
                        OTHER EXPENSES
                      </h3>
                      <div className="space-y-2">
                        {otherExpenseAccounts.map((account, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500 font-mono">{account.account_code}</span>
                              <span className="text-gray-900">{account.account_name}</span>
                            </div>
                            <span className="font-medium text-pink-600">{formatCurrency(account.amount.toString())}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center py-3 border-t-2 border-pink-300 bg-pink-50 rounded-lg px-4 font-bold">
                          <span className="text-pink-800">Total Other Expenses</span>
                          <span className="text-pink-800">{formatCurrency(totalOtherExpenses.toString())}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Final Net Profit */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-blue-900">NET PROFIT</h3>
                    <p className="text-blue-700">Final profit after all income and expenses</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-900">{formatCurrency(netProfit.toString())}</div>
                    <Badge variant={netProfit >= 0 ? "default" : "destructive"} className="mt-2">
                      {netProfit >= 0 ? "Profitable" : "Loss"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calculator, 
  Download,
  Calendar,
  Receipt,
  PieChart,
  BarChart3,
  ArrowUpDown
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils-invoice";
import { useToast } from "@/hooks/use-toast";

interface FinancialSummary {
  totalRevenue: string;
  totalExpenses: string;
  grossProfit: string;
  netProfit: string;
  totalVatCollected: string;
  totalVatPaid: string;
}

interface ProfitLossReport {
  revenue: { category: string; amount: string }[];
  expenses: { category: string; amount: string }[];
  netProfit: string;
}

interface CashFlowReport {
  cashInflow: { source: string; amount: string }[];
  cashOutflow: { category: string; amount: string }[];
  netCashFlow: string;
}

interface VatCalculation {
  periodStart: string;
  periodEnd: string;
  totalVatCollected: string;
  totalVatPaid: string;
  vatPayable: string;
  status: string;
}

export default function FinancialReports() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of year
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const { toast } = useToast();

  const { data: financialSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['/api/reports/financial-summary', dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      const response = await fetch(`/api/reports/financial-summary?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      if (!response.ok) throw new Error('Failed to fetch financial summary');
      return response.json() as Promise<FinancialSummary>;
    },
  });

  const { data: profitLoss, isLoading: profitLossLoading } = useQuery({
    queryKey: ['/api/reports/profit-loss', dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      const response = await fetch(`/api/reports/profit-loss?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      if (!response.ok) throw new Error('Failed to fetch profit & loss report');
      return response.json() as Promise<ProfitLossReport>;
    },
  });

  const { data: cashFlow, isLoading: cashFlowLoading } = useQuery({
    queryKey: ['/api/reports/cash-flow', dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      const response = await fetch(`/api/reports/cash-flow?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      if (!response.ok) throw new Error('Failed to fetch cash flow report');
      return response.json() as Promise<CashFlowReport>;
    },
  });

  const { data: vatCalculation, isLoading: vatLoading } = useQuery({
    queryKey: ['/api/reports/vat-calculation', dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      const response = await fetch(`/api/reports/vat-calculation?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      if (!response.ok) throw new Error('Failed to fetch VAT calculation');
      return response.json() as Promise<VatCalculation>;
    },
  });

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const downloadReport = (reportType: string) => {
    // In a real implementation, this would generate and download a PDF report
    toast({
      title: "Report Download",
      description: `${reportType} report download will be implemented with PDF generation.`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive financial analysis and reporting</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="startDate" className="text-sm font-medium">From:</Label>
            <Input
              id="startDate"
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="endDate" className="text-sm font-medium">To:</Label>
            <Input
              id="endDate"
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              className="w-40"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Financial Summary</TabsTrigger>
          <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="vat-returns">VAT Returns</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {summaryLoading ? "Loading..." : formatCurrency(financialSummary?.totalRevenue || '0')}
                </div>
                <p className="text-xs text-muted-foreground">
                  From paid invoices
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {summaryLoading ? "Loading..." : formatCurrency(financialSummary?.totalExpenses || '0')}
                </div>
                <p className="text-xs text-muted-foreground">
                  Business expenses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {summaryLoading ? "Loading..." : formatCurrency(financialSummary?.netProfit || '0')}
                </div>
                <p className="text-xs text-muted-foreground">
                  Revenue minus expenses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">VAT Collected</CardTitle>
                <Calculator className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {summaryLoading ? "Loading..." : formatCurrency(financialSummary?.totalVatCollected || '0')}
                </div>
                <p className="text-xs text-muted-foreground">
                  VAT on sales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">VAT Paid</CardTitle>
                <Receipt className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {summaryLoading ? "Loading..." : formatCurrency(financialSummary?.totalVatPaid || '0')}
                </div>
                <p className="text-xs text-muted-foreground">
                  VAT on purchases
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
                <BarChart3 className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600">
                  {summaryLoading ? "Loading..." : formatCurrency(financialSummary?.grossProfit || '0')}
                </div>
                <p className="text-xs text-muted-foreground">
                  Before expenses
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Financial Summary Report</span>
                <Button onClick={() => downloadReport('Financial Summary')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Period</h4>
                    <p className="text-sm text-gray-600">
                      {formatDate(new Date(dateRange.startDate))} - {formatDate(new Date(dateRange.endDate))}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Report Generated</h4>
                    <p className="text-sm text-gray-600">{formatDate(new Date())}</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">
                    This summary includes all financial activity for the selected period. 
                    Revenue figures are based on paid invoices only.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit-loss" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Profit & Loss Statement</span>
                <Button onClick={() => downloadReport('Profit & Loss')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profitLossLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Revenue</h4>
                    <div className="space-y-2">
                      {profitLoss?.revenue.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b">
                          <span className="text-sm">{item.category}</span>
                          <span className="font-medium text-green-600">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Expenses</h4>
                    <div className="space-y-2">
                      {profitLoss?.expenses.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b">
                          <span className="text-sm">{item.category}</span>
                          <span className="font-medium text-red-600">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Net Profit</span>
                      <span className={`text-xl font-bold ${
                        parseFloat(profitLoss?.netProfit || '0') >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(profitLoss?.netProfit || '0')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash-flow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Cash Flow Report</span>
                <Button onClick={() => downloadReport('Cash Flow')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cashFlowLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                      Cash Inflow
                    </h4>
                    <div className="space-y-2">
                      {cashFlow?.cashInflow.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b">
                          <span className="text-sm">{item.source}</span>
                          <span className="font-medium text-green-600">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
                      Cash Outflow
                    </h4>
                    <div className="space-y-2">
                      {cashFlow?.cashOutflow.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b">
                          <span className="text-sm">{item.category}</span>
                          <span className="font-medium text-red-600">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold flex items-center">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        Net Cash Flow
                      </span>
                      <span className={`text-xl font-bold ${
                        parseFloat(cashFlow?.netCashFlow || '0') >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(cashFlow?.netCashFlow || '0')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vat-returns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>VAT Return Calculation</span>
                <Button onClick={() => downloadReport('VAT Return')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vatLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">VAT Period</h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(new Date(vatCalculation?.periodStart || dateRange.startDate))} - {formatDate(new Date(vatCalculation?.periodEnd || dateRange.endDate))}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Status</h4>
                      <Badge variant="outline" className="capitalize">
                        {vatCalculation?.status || 'calculated'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">VAT Collected (Output VAT)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(vatCalculation?.totalVatCollected || '0')}
                        </div>
                        <p className="text-xs text-muted-foreground">VAT on sales</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">VAT Paid (Input VAT)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                          {formatCurrency(vatCalculation?.totalVatPaid || '0')}
                        </div>
                        <p className="text-xs text-muted-foreground">VAT on purchases</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">VAT Payable</span>
                      <span className={`text-xl font-bold ${
                        parseFloat(vatCalculation?.vatPayable || '0') >= 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatCurrency(vatCalculation?.vatPayable || '0')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {parseFloat(vatCalculation?.vatPayable || '0') >= 0 
                        ? 'Amount to be paid to SARS' 
                        : 'Amount to be refunded by SARS'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Download, Filter, Calendar, DollarSign, Users, ShoppingCart, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { DatePicker } from "@/components/ui/date-picker";

export default function SalesReportsPage() {
  const [reportType, setReportType] = useState("sales-summary");
  const [dateRange, setDateRange] = useState("this-month");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const { data: reportData = {}, isLoading } = useQuery<any>({
    queryKey: ["/api/reports/sales", { type: reportType, range: dateRange, startDate, endDate }],
  });

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(Number(amount));
  };

  const handleExportReport = (format: string) => {
    // Export functionality would be implemented here
    console.log(`Exporting ${reportType} as ${format}`);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Reports</h1>
          <p className="text-gray-600">Analyze your sales performance and trends</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExportReport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales-summary">Sales Summary</SelectItem>
                  <SelectItem value="customer-analysis">Customer Analysis</SelectItem>
                  <SelectItem value="product-performance">Product Performance</SelectItem>
                  <SelectItem value="sales-trends">Sales Trends</SelectItem>
                  <SelectItem value="invoice-aging">Invoice Aging</SelectItem>
                  <SelectItem value="payment-analysis">Payment Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="this-quarter">This Quarter</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === 'custom' && (
              <>
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <input 
                    type="date" 
                    value={startDate?.toISOString().split('T')[0] || ''}
                    onChange={(e) => setStartDate(new Date(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <input 
                    type="date" 
                    value={endDate?.toISOString().split('T')[0] || ''}
                    onChange={(e) => setEndDate(new Date(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(reportData.totalSales || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {reportData.salesGrowth >= 0 ? '+' : ''}{reportData.salesGrowth || 0}% from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Count</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.ordersCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Average: {formatCurrency(reportData.averageOrderValue || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.activeCustomers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {reportData.newCustomers || 0} new customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.collectionRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(reportData.collected || 0)} collected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Sales Trend
            </CardTitle>
            <CardDescription>Sales performance over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <p className="text-gray-500">Sales trend chart would display here</p>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
            <CardDescription>Best selling products in the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.topProducts?.length > 0 ? (
                reportData.topProducts.map((product: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.quantity} units sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(product.revenue)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No product data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>Highest value customers in the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.topCustomers?.length > 0 ? (
                reportData.topCustomers.map((customer: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.orders} orders</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(customer.total)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No customer data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method Analysis</CardTitle>
            <CardDescription>Breakdown of payment methods used</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.paymentMethods?.length > 0 ? (
                reportData.paymentMethods.map((method: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{method.method}</p>
                      <p className="text-sm text-muted-foreground">{method.percentage}% of transactions</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(method.amount)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No payment method data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
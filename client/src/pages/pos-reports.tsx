import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Clock } from "lucide-react";

export default function POSReports() {
  const [dateRange, setDateRange] = useState("today");

  const salesData = {
    totalSales: 45280,
    totalTransactions: 156,
    averageTicket: 290.26,
    topProducts: [
      { name: "Premium Coffee", sold: 45, revenue: 2250 },
      { name: "Sandwich Combo", sold: 32, revenue: 1920 },
      { name: "Fresh Pastry", sold: 28, revenue: 1120 }
    ],
    hourlyData: [
      { hour: "08:00", sales: 1200, transactions: 8 },
      { hour: "09:00", sales: 2400, transactions: 15 },
      { hour: "10:00", sales: 3600, transactions: 22 },
      { hour: "11:00", sales: 4800, transactions: 28 },
      { hour: "12:00", sales: 8400, transactions: 35 },
      { hour: "13:00", sales: 7200, transactions: 32 },
      { hour: "14:00", sales: 5400, transactions: 25 }
    ]
  };

  const paymentMethods = [
    { method: "Card", amount: 28650, percentage: 63.3, transactions: 98 },
    { method: "Cash", amount: 12420, percentage: 27.4, transactions: 45 },
    { method: "Mobile Pay", amount: 4210, percentage: 9.3, transactions: 13 }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">POS Reports</h1>
          <p className="text-muted-foreground">
            Sales analytics and performance insights
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{salesData.totalSales.toLocaleString()}</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.totalTransactions}</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.2% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Ticket</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{salesData.averageTicket.toFixed(2)}</div>
            <p className="text-xs text-red-600 flex items-center">
              <TrendingDown className="h-3 w-3 mr-1" />
              -2.1% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12:00 PM</div>
            <p className="text-xs text-muted-foreground">
              35 transactions
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Overview</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          <TabsTrigger value="hourly">Hourly Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>
                  Sales performance over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                    <p>Sales chart would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Volume</CardTitle>
                <CardDescription>
                  Number of transactions by hour
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2" />
                    <p>Transaction chart would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>
                Best performing products for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesData.topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {product.sold} units sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">R{product.revenue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        R{(product.revenue / product.sold).toFixed(2)} avg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Breakdown of payment methods used
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((payment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-medium">{payment.method}</h3>
                        <p className="text-sm text-muted-foreground">
                          {payment.transactions} transactions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">R{payment.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.percentage}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hourly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hourly Performance</CardTitle>
              <CardDescription>
                Sales and transaction breakdown by hour
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesData.hourlyData.map((hour, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">{hour.hour}</Badge>
                      <div>
                        <p className="font-medium">R{hour.sales.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {hour.transactions} transactions
                        </p>
                      </div>
                    </div>
                    <div className="w-full max-w-32 bg-secondary rounded-full h-2 ml-4">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(hour.sales / Math.max(...salesData.hourlyData.map(h => h.sales))) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
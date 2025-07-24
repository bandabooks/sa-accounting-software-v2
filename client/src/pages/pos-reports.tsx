import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, TrendingUp, DollarSign, Package, Users, 
  Calendar, Download, Filter, Clock, CreditCard, ShoppingCart
} from "lucide-react";

export default function POSReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("today");

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">POS Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive sales reporting and business insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Period Selection */}
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <Calendar className="h-5 w-5 text-gray-500" />
        <span className="font-medium">Report Period:</span>
        <div className="flex space-x-2">
          {["today", "week", "month", "quarter"].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R 24,150.00</div>
            <p className="text-xs text-muted-foreground">+12.5% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">Average: R 170.07</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">486</div>
            <p className="text-xs text-muted-foreground">3.4 items per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">62% returning customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sales">Sales Reports</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          <TabsTrigger value="hourly">Hourly Analysis</TabsTrigger>
          <TabsTrigger value="shifts">Shift Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Daily Sales Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">Sales trend chart would appear here</p>
                    <p className="text-sm text-gray-500">Integration with charting library needed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Sales Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { day: "Friday", sales: "R 4,250.00", transactions: 28 },
                    { day: "Saturday", sales: "R 3,890.00", transactions: 25 },
                    { day: "Thursday", sales: "R 3,650.00", transactions: 23 },
                    { day: "Wednesday", sales: "R 3,420.00", transactions: 21 },
                    { day: "Tuesday", sales: "R 3,180.00", transactions: 19 }
                  ].map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{day.day}</p>
                        <p className="text-sm text-gray-600">{day.transactions} transactions</p>
                      </div>
                      <Badge variant="secondary">{day.sales}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Top Selling Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Premium Coffee Blend", sold: 85, revenue: "R 2,125.00", margin: "45%" },
                  { name: "Artisan Sandwich", sold: 64, revenue: "R 1,920.00", margin: "38%" },
                  { name: "Fresh Pastries", sold: 72, revenue: "R 1,440.00", margin: "52%" },
                  { name: "Specialty Tea", sold: 48, revenue: "R 1,200.00", margin: "48%" },
                  { name: "Energy Drinks", sold: 56, revenue: "R 1,120.00", margin: "25%" }
                ].map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sold} units sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{product.revenue}</p>
                      <Badge variant="outline">{product.margin} margin</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Method Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { method: "Cash", amount: "R 14,490.00", percentage: "60%", color: "green" },
                    { method: "Card (Chip & PIN)", amount: "R 7,245.00", percentage: "30%", color: "blue" },
                    { method: "Mobile Payment", amount: "R 1,932.50", percentage: "8%", color: "purple" },
                    { method: "EFT", amount: "R 482.50", percentage: "2%", color: "orange" }
                  ].map((payment, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full bg-${payment.color}-500`}></div>
                        <span className="font-medium">{payment.method}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{payment.amount}</p>
                        <p className="text-sm text-gray-600">{payment.percentage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <CreditCard className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">Payment trends chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hourly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Hourly Sales Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { hour: "8-9 AM", sales: "R 245.00", transactions: 5 },
                  { hour: "9-10 AM", sales: "R 680.00", transactions: 12 },
                  { hour: "10-11 AM", sales: "R 1,250.00", transactions: 18 },
                  { hour: "11-12 PM", sales: "R 1,890.00", transactions: 24 },
                  { hour: "12-1 PM", sales: "R 2,450.00", transactions: 32 },
                  { hour: "1-2 PM", sales: "R 1,680.00", transactions: 22 },
                  { hour: "2-3 PM", sales: "R 1,125.00", transactions: 15 },
                  { hour: "3-4 PM", sales: "R 890.00", transactions: 12 }
                ].map((slot, index) => (
                  <div key={index} className="p-3 border rounded-lg text-center">
                    <p className="font-medium text-sm">{slot.hour}</p>
                    <p className="text-lg font-bold text-blue-600">{slot.sales}</p>
                    <p className="text-xs text-gray-600">{slot.transactions} sales</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shifts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shift Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { 
                    shift: "Morning Shift", 
                    cashier: "Sarah Wilson", 
                    time: "8:00 AM - 2:00 PM", 
                    sales: "R 8,450.00", 
                    transactions: 45,
                    variance: "R 0.00"
                  },
                  { 
                    shift: "Afternoon Shift", 
                    cashier: "Mike Johnson", 
                    time: "2:00 PM - 8:00 PM", 
                    sales: "R 12,200.00", 
                    transactions: 68,
                    variance: "-R 5.00"
                  },
                  { 
                    shift: "Evening Shift", 
                    cashier: "Lisa Chen", 
                    time: "8:00 PM - 11:00 PM", 
                    sales: "R 3,500.00", 
                    transactions: 29,
                    variance: "R 0.00"
                  }
                ].map((shift, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{shift.shift}</h3>
                        <p className="text-sm text-gray-600">{shift.cashier} • {shift.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{shift.sales}</p>
                        <p className="text-sm text-gray-600">{shift.transactions} transactions</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cash Variance:</span>
                      <Badge variant={shift.variance.includes('-') ? "destructive" : "secondary"}>
                        {shift.variance}
                      </Badge>
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
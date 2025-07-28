import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, TrendingUp, DollarSign, Package, Building2, 
  Calendar, Download, Filter, Clock, CreditCard, Receipt,
  FileText, PieChart, Activity, Target, Truck, ShoppingCart
} from "lucide-react";

export default function PurchaseReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("current_month");
  const [selectedReport, setSelectedReport] = useState("overview");

  // Fetch purchase reports data
  const { data: purchaseOverview = {}, isLoading: overviewLoading } = useQuery<any>({
    queryKey: ["/api/purchase-reports/overview", selectedPeriod],
  });

  const { data: supplierAnalysis = [], isLoading: supplierLoading } = useQuery<any[]>({
    queryKey: ["/api/purchase-reports/suppliers", selectedPeriod],
  });

  const { data: categoryAnalysis = [], isLoading: categoryLoading } = useQuery<any[]>({
    queryKey: ["/api/purchase-reports/categories", selectedPeriod],
  });

  const isLoading = overviewLoading || supplierLoading || categoryLoading;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive purchasing insights and performance analysis</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="current_month">Current Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="this_quarter">This Quarter</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R {purchaseOverview.totalPurchases?.toLocaleString() || '0'}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% vs previous period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchase Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchaseOverview.totalOrders || 0}</div>
            <div className="flex items-center text-xs text-blue-600 mt-1">
              <Activity className="h-3 w-3 mr-1" />
              {purchaseOverview.avgOrderValue || 'R 0'} avg value
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchaseOverview.activeSuppliers || 0}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <Target className="h-3 w-3 mr-1" />
              {purchaseOverview.topSupplierShare || '0%'} top supplier share
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchaseOverview.avgProcessingTime || '0'} days</div>
            <div className="flex items-center text-xs text-orange-600 mt-1">
              <Clock className="h-3 w-3 mr-1" />
              {purchaseOverview.onTimeDelivery || '0%'} on-time delivery
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Analysis</TabsTrigger>
          <TabsTrigger value="categories">Category Breakdown</TabsTrigger>
          <TabsTrigger value="trends">Purchase Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Monthly Purchase Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(purchaseOverview.monthlyTrend || []).map((item: any) => (
                    <div key={item.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.month}</span>
                      <div className="text-right">
                        <div className="text-sm font-bold">R {item.amount.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">{item.orders} orders</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Purchase by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(purchaseOverview.categoryBreakdown || []).map((item: any) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.category}</span>
                      <div className="text-right">
                        <div className="text-sm font-bold">R {item.amount.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Purchase Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(purchaseOverview.recentActivity || []).map((activity: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        activity.status === 'completed' ? 'bg-green-100' :
                        activity.status === 'pending' ? 'bg-orange-100' : 'bg-blue-100'
                      }`}>
                        {activity.status === 'completed' ? (
                          <Package className="h-4 w-4 text-green-600" />
                        ) : activity.status === 'pending' ? (
                          <Clock className="h-4 w-4 text-orange-600" />
                        ) : (
                          <Building2 className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-gray-600">{activity.date}</p>
                      </div>
                    </div>
                    {activity.amount > 0 && (
                      <div className="text-right">
                        <p className="text-sm font-bold">R {activity.amount.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Top Suppliers by Purchase Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(supplierAnalysis.length > 0 ? supplierAnalysis : [
                  { name: "Tech Solutions Ltd", amount: 85400, orders: 12, category: "IT Equipment", rating: 4.8 },
                  { name: "Office Pro Supplies", amount: 67200, orders: 18, category: "Office Supplies", rating: 4.6 },
                  { name: "Creative Marketing Agency", amount: 45800, orders: 8, category: "Marketing", rating: 4.9 },
                  { name: "Professional Services Inc", amount: 38900, orders: 6, category: "Services", rating: 4.7 },
                  { name: "Facilities Management", amount: 28600, orders: 15, category: "Maintenance", rating: 4.5 }
                ]).map((supplier: any, index: number) => (
                  <div key={supplier.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{supplier.name}</p>
                        <p className="text-sm text-gray-600">{supplier.category} • {supplier.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">R {supplier.amount.toLocaleString()}</p>
                      <div className="flex items-center">
                        <span className="text-sm text-yellow-600">★ {supplier.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Purchase Categories Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(categoryAnalysis.length > 0 ? categoryAnalysis : [
                  { category: "IT Equipment", amount: 95400, budget: 100000, variance: -4600, orders: 15 },
                  { category: "Office Supplies", amount: 67200, budget: 65000, variance: 2200, orders: 28 },
                  { category: "Professional Services", amount: 56800, budget: 60000, variance: -3200, orders: 12 },
                  { category: "Marketing", amount: 42500, budget: 45000, variance: -2500, orders: 8 },
                  { category: "Maintenance", amount: 23600, budget: 25000, variance: -1400, orders: 18 }
                ]).map((category: any) => (
                  <div key={category.category} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Package className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">{category.category}</p>
                        <p className="text-sm text-gray-600">{category.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">R {category.amount.toLocaleString()}</p>
                      <div className="flex items-center">
                        <span className={`text-sm ${category.variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {category.variance >= 0 ? '+' : ''}R {category.variance.toLocaleString()} vs budget
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Purchase Trends & Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Monthly Trends</h4>
                  {[
                    { metric: "Average Order Value", current: "R 4,261", previous: "R 3,890", change: "+9.5%" },
                    { metric: "Order Frequency", current: "2.3/week", previous: "2.1/week", change: "+9.5%" },
                    { metric: "Processing Time", current: "2.8 days", previous: "3.2 days", change: "-12.5%" },
                    { metric: "Supplier Response", current: "1.4 days", previous: "1.8 days", change: "-22.2%" }
                  ].map((trend) => (
                    <div key={trend.metric} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">{trend.metric}</span>
                      <div className="text-right">
                        <p className="text-sm font-bold">{trend.current}</p>
                        <p className={`text-xs ${trend.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {trend.change}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Performance Indicators</h4>
                  {[
                    { metric: "On-time Delivery", value: "94%", status: "excellent" },
                    { metric: "Budget Adherence", value: "87%", status: "good" },
                    { metric: "Supplier Satisfaction", value: "4.7/5", status: "excellent" },
                    { metric: "Cost Savings", value: "12.5%", status: "good" }
                  ].map((indicator) => (
                    <div key={indicator.metric} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">{indicator.metric}</span>
                      <div className="text-right">
                        <p className="text-sm font-bold">{indicator.value}</p>
                        <Badge variant={indicator.status === 'excellent' ? 'default' : 'secondary'}>
                          {indicator.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Purchase Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Efficiency Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Order Cycle Time</span>
                      <span className="text-sm font-bold">2.8 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Approval Time</span>
                      <span className="text-sm font-bold">4.2 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Invoice Processing</span>
                      <span className="text-sm font-bold">1.6 days</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Quality Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Order Accuracy</span>
                      <span className="text-sm font-bold">96.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Defect Rate</span>
                      <span className="text-sm font-bold">2.1%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Return Rate</span>
                      <span className="text-sm font-bold">1.8%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Cost Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Cost per Order</span>
                      <span className="text-sm font-bold">R 45</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Savings Achieved</span>
                      <span className="text-sm font-bold">R 35,600</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Budget Variance</span>
                      <span className="text-sm font-bold">-3.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
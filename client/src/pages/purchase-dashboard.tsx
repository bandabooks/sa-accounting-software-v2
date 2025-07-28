import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, TrendingDown, Package, Building2, CreditCard, 
  DollarSign, Clock, AlertTriangle, CheckCircle, Plus,
  ShoppingCart, Truck, Receipt, FileText, Target
} from "lucide-react";
import { Link } from "wouter";

export default function PurchaseDashboard() {
  // Fetch purchase statistics
  const { data: purchaseStats = {}, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/purchase/stats"],
  });

  // Fetch recent purchase activities
  const { data: recentPurchaseOrders = [], isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["/api/purchase-orders"],
  });

  const { data: recentSuppliers = [], isLoading: suppliersLoading } = useQuery<any[]>({
    queryKey: ["/api/suppliers"],
  });

  const { data: recentExpenses = [], isLoading: expensesLoading } = useQuery<any[]>({
    queryKey: ["/api/expenses"],
  });

  const isLoading = statsLoading || ordersLoading || suppliersLoading || expensesLoading;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all your purchase activities</p>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/purchase-orders">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Purchase Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R {purchaseStats.totalPurchases?.toLocaleString() || '0'}</div>
            <div className="flex items-center text-xs text-gray-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              {purchaseStats.purchaseGrowth ? `${purchaseStats.purchaseGrowth}%` : '0%'} from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchaseStats.pendingOrders || 0}</div>
            <div className="flex items-center text-xs text-gray-600">
              <Clock className="h-3 w-3 mr-1" />
              {purchaseStats.avgProcessingTime || '0 days'} avg processing
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R {purchaseStats.outstandingAmount?.toLocaleString() || '0'}</div>
            <div className="flex items-center text-xs text-gray-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {purchaseStats.overdueInvoices || 0} overdue invoices
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchaseStats.activeSuppliers || 0}</div>
            <div className="flex items-center text-xs text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              {purchaseStats.newSuppliers || 0} new this month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/purchase-orders">
              <Button variant="outline" className="w-full h-20 flex flex-col">
                <ShoppingCart className="h-6 w-6 mb-2" />
                <span className="text-sm">New Purchase Order</span>
              </Button>
            </Link>
            <Link href="/suppliers">
              <Button variant="outline" className="w-full h-20 flex flex-col">
                <Building2 className="h-6 w-6 mb-2" />
                <span className="text-sm">Add Supplier</span>
              </Button>
            </Link>
            <Link href="/expenses">
              <Button variant="outline" className="w-full h-20 flex flex-col">
                <Receipt className="h-6 w-6 mb-2" />
                <span className="text-sm">Record Expense</span>
              </Button>
            </Link>
            <Link href="/three-way-matching">
              <Button variant="outline" className="w-full h-20 flex flex-col">
                <CheckCircle className="h-6 w-6 mb-2" />
                <span className="text-sm">3-Way Matching</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Recent Purchase Orders</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="expenses">Recent Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Recent Purchase Orders
                </span>
                <Link href="/purchase-orders">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex space-x-4">
                      <div className="rounded bg-gray-200 h-12 w-12"></div>
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentPurchaseOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentPurchaseOrders.slice(0, 5).map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">{order.supplier?.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">R {order.totalAmount?.toLocaleString()}</p>
                        <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No purchase orders yet</p>
                  <Link href="/purchase-orders">
                    <Button className="mt-4">Create First Purchase Order</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Active Suppliers
                </span>
                <Link href="/suppliers">
                  <Button variant="outline" size="sm">Manage All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex space-x-4">
                      <div className="rounded bg-gray-200 h-12 w-12"></div>
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentSuppliers.length > 0 ? (
                <div className="space-y-4">
                  {recentSuppliers.slice(0, 5).map((supplier: any) => (
                    <div key={supplier.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Building2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{supplier.name}</p>
                          <p className="text-sm text-gray-600">{supplier.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{supplier.category || 'General'}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No suppliers yet</p>
                  <Link href="/suppliers">
                    <Button className="mt-4">Add First Supplier</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Receipt className="h-5 w-5 mr-2" />
                  Recent Expenses
                </span>
                <Link href="/expenses">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex space-x-4">
                      <div className="rounded bg-gray-200 h-12 w-12"></div>
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentExpenses.length > 0 ? (
                <div className="space-y-4">
                  {recentExpenses.slice(0, 5).map((expense: any) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="bg-orange-100 p-2 rounded-lg">
                          <Receipt className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium">{expense.description}</p>
                          <p className="text-sm text-gray-600">{expense.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">R {expense.amount?.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No expenses recorded yet</p>
                  <Link href="/expenses">
                    <Button className="mt-4">Record First Expense</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Compact Header */}
        <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5" />
              <span className="text-sm font-medium opacity-90">Purchase Management</span>
            </div>
            <CardTitle className="text-2xl font-bold">Purchase Dashboard</CardTitle>
            <CardDescription className="text-blue-100">Monitor and manage all purchase activities with precision</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/purchase-orders">
                  <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0">
                    <Plus className="h-4 w-4 mr-1" />
                    New Purchase Order
                  </Button>
                </Link>
                <Link href="/suppliers">
                  <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                    <Building2 className="h-4 w-4 mr-1" />
                    Suppliers
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs">
                  <TrendingUp className="h-3 w-3" />
                  <span>Live Analytics</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Purchases Card */}
          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Purchases</CardTitle>
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-white mb-2">R {purchaseStats.totalPurchases?.toLocaleString() || '0'}</div>
              <div className="flex items-center text-sm text-blue-100">
                <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full">
                  <TrendingUp className="h-3 w-3" />
                  <span>{purchaseStats.purchaseGrowth ? `${purchaseStats.purchaseGrowth}%` : '0%'}</span>
                </div>
                <span className="ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Pending Orders Card */}
          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">Pending Orders</CardTitle>
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-white mb-2">{purchaseStats.pendingOrders || 0}</div>
              <div className="flex items-center text-sm text-orange-100">
                <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full">
                  <Clock className="h-3 w-3" />
                  <span>{purchaseStats.avgProcessingTime || '0 days'}</span>
                </div>
                <span className="ml-2">avg processing</span>
              </div>
            </CardContent>
          </Card>

          {/* Outstanding Amount Card */}
          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-red-500 via-red-600 to-pink-600 text-white transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-100">Outstanding Amount</CardTitle>
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-white mb-2">R {purchaseStats.outstandingAmount?.toLocaleString() || '0'}</div>
              <div className="flex items-center text-sm text-red-100">
                <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{purchaseStats.overdueInvoices || 0}</span>
                </div>
                <span className="ml-2">overdue invoices</span>
              </div>
            </CardContent>
          </Card>

          {/* Active Suppliers Card */}
          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 text-white transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Active Suppliers</CardTitle>
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Building2 className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-white mb-2">{purchaseStats.activeSuppliers || 0}</div>
              <div className="flex items-center text-sm text-green-100">
                <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full">
                  <CheckCircle className="h-3 w-3" />
                  <span>{purchaseStats.newSuppliers || 0}</span>
                </div>
                <span className="ml-2">new this month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Quick Actions */}
        <Card className="relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50/50 to-blue-50/50"></div>
          <CardHeader className="relative">
            <CardTitle className="flex items-center text-gray-800">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mr-3">
                <Target className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold">Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Link href="/purchase-orders">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105"></div>
                  <Button variant="outline" className="relative w-full h-24 flex flex-col bg-white/80 backdrop-blur-sm border-gray-200 hover:border-transparent group-hover:text-white transition-all duration-300 shadow-lg">
                    <div className="p-2 bg-blue-100 group-hover:bg-white/20 rounded-lg mb-2 transition-all duration-300">
                      <ShoppingCart className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-sm font-medium">New Purchase Order</span>
                  </Button>
                </div>
              </Link>
              <Link href="/suppliers">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105"></div>
                  <Button variant="outline" className="relative w-full h-24 flex flex-col bg-white/80 backdrop-blur-sm border-gray-200 hover:border-transparent group-hover:text-white transition-all duration-300 shadow-lg">
                    <div className="p-2 bg-green-100 group-hover:bg-white/20 rounded-lg mb-2 transition-all duration-300">
                      <Building2 className="h-6 w-6 text-green-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-sm font-medium">Add Supplier</span>
                  </Button>
                </div>
              </Link>
              <Link href="/expenses">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105"></div>
                  <Button variant="outline" className="relative w-full h-24 flex flex-col bg-white/80 backdrop-blur-sm border-gray-200 hover:border-transparent group-hover:text-white transition-all duration-300 shadow-lg">
                    <div className="p-2 bg-orange-100 group-hover:bg-white/20 rounded-lg mb-2 transition-all duration-300">
                      <Receipt className="h-6 w-6 text-orange-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-sm font-medium">Record Expense</span>
                  </Button>
                </div>
              </Link>
              <Link href="/three-way-matching">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105"></div>
                  <Button variant="outline" className="relative w-full h-24 flex flex-col bg-white/80 backdrop-blur-sm border-gray-200 hover:border-transparent group-hover:text-white transition-all duration-300 shadow-lg">
                    <div className="p-2 bg-purple-100 group-hover:bg-white/20 rounded-lg mb-2 transition-all duration-300">
                      <CheckCircle className="h-6 w-6 text-purple-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-sm font-medium">3-Way Matching</span>
                  </Button>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Recent Activities */}
        <Tabs defaultValue="orders" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Recent Activities</h2>
            <TabsList className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <TabsTrigger value="orders" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">Recent Purchase Orders</TabsTrigger>
              <TabsTrigger value="suppliers" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white">Suppliers</TabsTrigger>
              <TabsTrigger value="expenses" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white">Recent Expenses</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="orders" className="space-y-4">
            <Card className="relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center text-gray-800">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mr-3">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-semibold">Recent Purchase Orders</span>
                  </span>
                  <Link href="/purchase-orders">
                    <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:text-white hover:border-transparent transition-all duration-300">View All</Button>
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
                      <div key={order.id} className="flex items-center justify-between p-5 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-md">
                            <Package className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{order.orderNumber}</p>
                            <p className="text-sm text-gray-600">{order.supplier?.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">R {order.totalAmount?.toLocaleString()}</p>
                          <Badge 
                            className={`${
                              order.status === 'pending' 
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-0' 
                                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0'
                            } shadow-md`}
                          >
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
            <Card className="relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 to-emerald-50/50"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center text-gray-800">
                    <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg mr-3">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-semibold">Active Suppliers</span>
                  </span>
                  <Link href="/suppliers">
                    <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-600 hover:text-white hover:border-transparent transition-all duration-300">Manage All</Button>
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
                      <div key={supplier.id} className="flex items-center justify-between p-5 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-md">
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{supplier.name}</p>
                            <p className="text-sm text-gray-600">{supplier.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-md">
                            {supplier.category || 'General'}
                          </Badge>
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
            <Card className="relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-50/50 to-red-50/50"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center text-gray-800">
                    <div className="p-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg mr-3">
                      <Receipt className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-semibold">Recent Expenses</span>
                  </span>
                  <Link href="/expenses">
                    <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gradient-to-r hover:from-orange-600 hover:to-red-600 hover:text-white hover:border-transparent transition-all duration-300">View All</Button>
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
                      <div key={expense.id} className="flex items-center justify-between p-5 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg shadow-md">
                            <Receipt className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{expense.description}</p>
                            <p className="text-sm text-gray-600">{expense.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">R {expense.amount?.toLocaleString()}</p>
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
    </div>
  );
}
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Plus, Search, Filter, Eye, TrendingUp, Users, DollarSign, ShoppingCart,
  Receipt, FileText, Truck, CreditCard, BarChart3, ArrowUpRight, ArrowDownRight,
  Calendar, Target, Package, Clock, AlertTriangle, UserPlus, CheckCircle, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function SalesDashboard() {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch sales statistics
  const { data: salesStats = {}, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/sales/stats"],
  });

  // Fetch recent sales activities
  const { data: recentSalesOrders = [], isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["/api/sales-orders"],
  });

  const { data: recentInvoices = [], isLoading: invoicesLoading } = useQuery<any[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: recentEstimates = [], isLoading: estimatesLoading } = useQuery<any[]>({
    queryKey: ["/api/estimates"],
  });

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(Number(amount));
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      draft: "bg-gray-100 text-gray-800",
      sent: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
    };
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
  };

  if (statsLoading || ordersLoading || invoicesLoading || estimatesLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/30">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Enhanced Header */}
        <div className="relative">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-700 to-teal-800 rounded-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
          
          {/* Header Content */}
          <div className="relative p-8 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-white tracking-tight">Sales Dashboard</h1>
                <p className="text-green-100 text-lg font-medium">Drive revenue growth with intelligent sales insights and analytics</p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">Revenue Analytics</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-sm font-medium">Pipeline Tracking</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/estimates/new">
                  <Button variant="outline" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <FileText className="h-4 w-4 mr-2" />
                    New Quote
                  </Button>
                </Link>
                <Link href="/sales-orders/new">
                  <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <Plus className="h-4 w-4 mr-2" />
                    New Sales Order
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Sales Card */}
          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Total Sales</CardTitle>
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-white mb-2">{formatCurrency(salesStats.totalSales || 0)}</div>
              <div className="flex items-center text-sm text-green-100">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                  salesStats.salesGrowth >= 0 
                    ? 'bg-white/20' 
                    : 'bg-red-500/30'
                }`}>
                  {salesStats.salesGrowth >= 0 ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  <span>{Math.abs(salesStats.salesGrowth || 0)}%</span>
                </div>
                <span className="ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Sales Orders Card */}
          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Sales Orders</CardTitle>
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-white mb-2">{salesStats.totalOrders || 0}</div>
              <div className="flex items-center text-sm text-blue-100">
                <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full">
                  <Clock className="h-3 w-3" />
                  <span>{salesStats.pendingOrders || 0}</span>
                </div>
                <span className="ml-2">pending delivery</span>
              </div>
            </CardContent>
          </Card>

          {/* Outstanding Invoices Card */}
          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 text-white transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">Outstanding Invoices</CardTitle>
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Receipt className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-white mb-2">{formatCurrency(salesStats.outstandingAmount || 0)}</div>
              <div className="flex items-center text-sm text-orange-100">
                <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{salesStats.overdueInvoices || 0}</span>
                </div>
                <span className="ml-2">overdue invoices</span>
              </div>
            </CardContent>
          </Card>

          {/* Active Customers Card */}
          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Active Customers</CardTitle>
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-white mb-2">{salesStats.activeCustomers || 0}</div>
              <div className="flex items-center text-sm text-purple-100">
                <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full">
                  <UserPlus className="h-3 w-3" />
                  <span>{salesStats.newCustomers || 0}</span>
                </div>
                <span className="ml-2">new this month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Sales Pipeline & Performance Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Advanced Sales Pipeline with Animated Progress Rings */}
          <Card className="relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center text-gray-800">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mr-3">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-semibold">Sales Pipeline Progress</span>
              </CardTitle>
              <CardDescription className="text-gray-600">Track your sales process with animated progress indicators</CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-6">
              {/* Quotes Stage */}
              <div className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-md">
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-gray-300" strokeWidth="3" fill="none" stroke="currentColor" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-green-500" strokeWidth="3" strokeLinecap="round" fill="none" stroke="currentColor" strokeDasharray={`${((salesStats.quotesCount || 0) / Math.max(salesStats.totalPipeline || 1, 1)) * 100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Quotes</h3>
                    <p className="text-sm text-gray-600">Active proposals</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{salesStats.quotesCount || 0}</div>
                  <div className="text-sm text-gray-600">{Math.round(((salesStats.quotesCount || 0) / Math.max(salesStats.totalPipeline || 1, 1)) * 100)}% of pipeline</div>
                </div>
              </div>

              {/* Sales Orders Stage */}
              <div className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-md">
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-gray-300" strokeWidth="3" fill="none" stroke="currentColor" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-blue-500" strokeWidth="3" strokeLinecap="round" fill="none" stroke="currentColor" strokeDasharray={`${((salesStats.ordersCount || 0) / Math.max(salesStats.totalPipeline || 1, 1)) * 100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Sales Orders</h3>
                    <p className="text-sm text-gray-600">Confirmed orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{salesStats.ordersCount || 0}</div>
                  <div className="text-sm text-gray-600">{Math.round(((salesStats.ordersCount || 0) / Math.max(salesStats.totalPipeline || 1, 1)) * 100)}% of pipeline</div>
                </div>
              </div>

              {/* Invoices Stage */}
              <div className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-md">
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-gray-300" strokeWidth="3" fill="none" stroke="currentColor" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-orange-500" strokeWidth="3" strokeLinecap="round" fill="none" stroke="currentColor" strokeDasharray={`${((salesStats.invoicesCount || 0) / Math.max(salesStats.totalPipeline || 1, 1)) * 100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Receipt className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Invoices</h3>
                    <p className="text-sm text-gray-600">Pending payment</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{salesStats.invoicesCount || 0}</div>
                  <div className="text-sm text-gray-600">{Math.round(((salesStats.invoicesCount || 0) / Math.max(salesStats.totalPipeline || 1, 1)) * 100)}% of pipeline</div>
                </div>
              </div>

              {/* Delivered Stage */}
              <div className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-md">
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-gray-300" strokeWidth="3" fill="none" stroke="currentColor" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-emerald-500" strokeWidth="3" strokeLinecap="round" fill="none" stroke="currentColor" strokeDasharray={`${((salesStats.deliveredCount || 0) / Math.max(salesStats.totalPipeline || 1, 1)) * 100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Delivered</h3>
                    <p className="text-sm text-gray-600">Completed sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{salesStats.deliveredCount || 0}</div>
                  <div className="text-sm text-gray-600">{Math.round(((salesStats.deliveredCount || 0) / Math.max(salesStats.totalPipeline || 1, 1)) * 100)}% of pipeline</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Quick Actions Hub */}
          <Card className="relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 to-emerald-50/50"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center text-gray-800">
                <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg mr-3">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-semibold">Sales Action Center</span>
              </CardTitle>
              <CardDescription className="text-gray-600">Quick access to essential sales workflows</CardDescription>
            </CardHeader>
            <CardContent className="relative grid grid-cols-2 gap-4">
              <Link href="/estimates/new">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105"></div>
                  <Button variant="outline" className="relative w-full h-20 flex flex-col bg-white/80 backdrop-blur-sm border-gray-200 hover:border-transparent group-hover:text-white transition-all duration-300 shadow-lg">
                    <div className="p-2 bg-green-100 group-hover:bg-white/20 rounded-lg mb-2 transition-all duration-300">
                      <FileText className="h-5 w-5 text-green-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-sm font-medium">Create Quote</span>
                  </Button>
                </div>
              </Link>
              <Link href="/sales-orders/new">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105"></div>
                  <Button variant="outline" className="relative w-full h-20 flex flex-col bg-white/80 backdrop-blur-sm border-gray-200 hover:border-transparent group-hover:text-white transition-all duration-300 shadow-lg">
                    <div className="p-2 bg-blue-100 group-hover:bg-white/20 rounded-lg mb-2 transition-all duration-300">
                      <ShoppingCart className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-sm font-medium">New Sales Order</span>
                  </Button>
                </div>
              </Link>
              <Link href="/invoices/new">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105"></div>
                  <Button variant="outline" className="relative w-full h-20 flex flex-col bg-white/80 backdrop-blur-sm border-gray-200 hover:border-transparent group-hover:text-white transition-all duration-300 shadow-lg">
                    <div className="p-2 bg-orange-100 group-hover:bg-white/20 rounded-lg mb-2 transition-all duration-300">
                      <Receipt className="h-5 w-5 text-orange-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-sm font-medium">Create Invoice</span>
                  </Button>
                </div>
              </Link>
              <Link href="/customers/new">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105"></div>
                  <Button variant="outline" className="relative w-full h-20 flex flex-col bg-white/80 backdrop-blur-sm border-gray-200 hover:border-transparent group-hover:text-white transition-all duration-300 shadow-lg">
                    <div className="p-2 bg-purple-100 group-hover:bg-white/20 rounded-lg mb-2 transition-all duration-300">
                      <Users className="h-5 w-5 text-purple-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-sm font-medium">Add Customer</span>
                  </Button>
                </div>
              </Link>
              <Link href="/customer-payments/new">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105"></div>
                  <Button variant="outline" className="relative w-full h-20 flex flex-col bg-white/80 backdrop-blur-sm border-gray-200 hover:border-transparent group-hover:text-white transition-all duration-300 shadow-lg">
                    <div className="p-2 bg-teal-100 group-hover:bg-white/20 rounded-lg mb-2 transition-all duration-300">
                      <CreditCard className="h-5 w-5 text-teal-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-sm font-medium">Record Payment</span>
                  </Button>
                </div>
              </Link>
              <Link href="/sales-reports">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105"></div>
                  <Button variant="outline" className="relative w-full h-20 flex flex-col bg-white/80 backdrop-blur-sm border-gray-200 hover:border-transparent group-hover:text-white transition-all duration-300 shadow-lg">
                    <div className="p-2 bg-indigo-100 group-hover:bg-white/20 rounded-lg mb-2 transition-all duration-300">
                      <BarChart3 className="h-5 w-5 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-sm font-medium">Sales Reports</span>
                  </Button>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Recent Activities with Lead Scoring */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Recent Sales Activities</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Sales Orders */}
            <Card className="relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between">
                <CardTitle className="flex items-center text-gray-800">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mr-3">
                    <ShoppingCart className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg font-semibold">Recent Sales Orders</span>
                </CardTitle>
                <Link href="/sales-orders">
                  <Button variant="ghost" size="sm" className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:text-white transition-all duration-300">
                    <Eye className="h-4 w-4 mr-1" />
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="relative">
                {recentSalesOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent sales orders</p>
                    <Link href="/sales-orders/new">
                      <Button className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600">Create First Order</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentSalesOrders.slice(0, 5).map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                        <div>
                          <p className="font-semibold text-gray-800">{order.orderNumber}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-600">Customer #{order.customerId}</p>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-xs text-yellow-600 font-medium">High Value</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">{formatCurrency(order.total)}</p>
                          <Badge className={`${getStatusBadge(order.status)} bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-md`}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Invoices */}
            <Card className="relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-50/50 to-red-50/50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between">
                <CardTitle className="flex items-center text-gray-800">
                  <div className="p-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg mr-3">
                    <Receipt className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg font-semibold">Recent Invoices</span>
                </CardTitle>
                <Link href="/invoices">
                  <Button variant="ghost" size="sm" className="hover:bg-gradient-to-r hover:from-orange-600 hover:to-red-600 hover:text-white transition-all duration-300">
                    <Eye className="h-4 w-4 mr-1" />
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="relative">
                {recentInvoices.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent invoices</p>
                    <Link href="/invoices/new">
                      <Button className="mt-4 bg-gradient-to-r from-orange-600 to-red-600">Create First Invoice</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentInvoices.slice(0, 5).map((invoice: any) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                        <div>
                          <p className="font-semibold text-gray-800">{invoice.invoiceNumber}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-600">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                            {invoice.status === 'overdue' && (
                              <div className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                                <span className="text-xs text-red-600 font-medium">Overdue</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">{formatCurrency(invoice.total)}</p>
                          <Badge className={`${getStatusBadge(invoice.status)} bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-md`}>
                            {invoice.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Estimates with Lead Scoring */}
            <Card className="relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 to-emerald-50/50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between">
                <CardTitle className="flex items-center text-gray-800">
                  <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg mr-3">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg font-semibold">Recent Quotes</span>
                </CardTitle>
                <Link href="/estimates">
                  <Button variant="ghost" size="sm" className="hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-600 hover:text-white transition-all duration-300">
                    <Eye className="h-4 w-4 mr-1" />
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="relative">
                {recentEstimates.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent quotes</p>
                    <Link href="/estimates/new">
                      <Button className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600">Create First Quote</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentEstimates.slice(0, 5).map((estimate: any) => (
                      <div key={estimate.id} className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                        <div>
                          <p className="font-semibold text-gray-800">{estimate.estimateNumber}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-600">Valid until: {new Date(estimate.validUntil).toLocaleDateString()}</p>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-600 font-medium">Hot Lead</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">{formatCurrency(estimate.total)}</p>
                          <Badge className={`${getStatusBadge(estimate.status)} bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-md`}>
                            {estimate.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
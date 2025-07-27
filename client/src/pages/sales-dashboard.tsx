import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Plus, Search, Filter, Eye, TrendingUp, Users, DollarSign, ShoppingCart,
  Receipt, FileText, Truck, CreditCard, BarChart3, ArrowUpRight, ArrowDownRight,
  Calendar, Target, Package
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
          <p className="text-gray-600">Monitor your sales performance and pipeline</p>
        </div>
        <div className="flex gap-2">
          <Link href="/estimates/new">
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              New Quote
            </Button>
          </Link>
          <Link href="/sales-orders/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Sales Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesStats.totalSales || 0)}</div>
            <p className="text-xs text-muted-foreground">
              <span className={salesStats.salesGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                {salesStats.salesGrowth >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 inline mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 inline mr-1" />
                )}
                {Math.abs(salesStats.salesGrowth || 0)}%
              </span>
              {" "}from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesStats.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              {salesStats.pendingOrders || 0} pending delivery
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesStats.outstandingAmount || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {salesStats.overdueInvoices || 0} overdue invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesStats.activeCustomers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {salesStats.newCustomers || 0} new this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Pipeline & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Pipeline</CardTitle>
            <CardDescription>Track your sales process from quotes to delivery</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Quotes</span>
                <span className="text-sm text-muted-foreground">{salesStats.quotesCount || 0}</span>
              </div>
              <Progress value={((salesStats.quotesCount || 0) / (salesStats.totalPipeline || 1)) * 100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sales Orders</span>
                <span className="text-sm text-muted-foreground">{salesStats.ordersCount || 0}</span>
              </div>
              <Progress value={((salesStats.ordersCount || 0) / (salesStats.totalPipeline || 1)) * 100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Invoices</span>
                <span className="text-sm text-muted-foreground">{salesStats.invoicesCount || 0}</span>
              </div>
              <Progress value={((salesStats.invoicesCount || 0) / (salesStats.totalPipeline || 1)) * 100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Delivered</span>
                <span className="text-sm text-muted-foreground">{salesStats.deliveredCount || 0}</span>
              </div>
              <Progress value={((salesStats.deliveredCount || 0) / (salesStats.totalPipeline || 1)) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common sales tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Link href="/estimates/new">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Create Quote
              </Button>
            </Link>
            <Link href="/sales-orders/new">
              <Button variant="outline" className="w-full justify-start">
                <ShoppingCart className="h-4 w-4 mr-2" />
                New Sales Order
              </Button>
            </Link>
            <Link href="/invoices/new">
              <Button variant="outline" className="w-full justify-start">
                <Receipt className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </Link>
            <Link href="/customers/new">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </Link>
            <Link href="/customer-payments/new">
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </Link>
            <Link href="/sales-reports">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Sales Reports
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Sales Orders</CardTitle>
            <Link href="/sales-orders">
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentSalesOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent sales orders</p>
            ) : (
              <div className="space-y-3">
                {recentSalesOrders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">Customer #{order.customerId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(order.total)}</p>
                      <Badge className={getStatusBadge(order.status)} variant="secondary">
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Invoices</CardTitle>
            <Link href="/invoices">
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent invoices</p>
            ) : (
              <div className="space-y-3">
                {recentInvoices.slice(0, 5).map((invoice: any) => (
                  <div key={invoice.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(invoice.total)}</p>
                      <Badge className={getStatusBadge(invoice.status)} variant="secondary">
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Estimates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Quotes</CardTitle>
            <Link href="/estimates">
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentEstimates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent quotes</p>
            ) : (
              <div className="space-y-3">
                {recentEstimates.slice(0, 5).map((estimate: any) => (
                  <div key={estimate.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{estimate.estimateNumber}</p>
                      <p className="text-xs text-muted-foreground">Valid until: {new Date(estimate.validUntil).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(estimate.total)}</p>
                      <Badge className={getStatusBadge(estimate.status)} variant="secondary">
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
  );
}
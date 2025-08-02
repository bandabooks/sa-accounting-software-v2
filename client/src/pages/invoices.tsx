import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Plus, Eye, Edit, Trash2, FileText, Send, CheckCircle, AlertCircle, Clock,
  DollarSign, TrendingUp, Users, Calendar, Filter, Search, Download,
  MoreHorizontal, CreditCard, Zap, Target, Award, ArrowUpRight,
  BarChart3, PieChart, Timer, Bell, Star, Building
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { invoicesApi } from "@/lib/api";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils-invoice";
import { MiniDashboard } from "@/components/MiniDashboard";
import { DashboardCard } from "@/components/DashboardCard";
import { apiRequest } from "@/lib/queryClient";

interface AgingBucket {
  range: string;
  count: number;
  amount: number;
  color: string;
}

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  
  const { data: invoices, isLoading } = useQuery({
    queryKey: ["/api/invoices"],
    queryFn: invoicesApi.getAll
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/invoices/stats"],
    queryFn: () => apiRequest("/api/invoices/stats", "GET").then(res => res.json())
  });

  const filteredInvoices = invoices?.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusGradient = (status: string) => {
    switch (status) {
      case "paid": return "from-green-500 to-emerald-600";
      case "sent": return "from-blue-500 to-indigo-600";
      case "overdue": return "from-red-500 to-pink-600";
      case "draft": return "from-gray-500 to-gray-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return CheckCircle;
      case "sent": return Send;
      case "overdue": return AlertCircle;
      case "draft": return Edit;
      default: return FileText;
    }
  };

  // Calculate aging analysis
  const calculateAging = (): AgingBucket[] => {
    const today = new Date();
    const buckets: AgingBucket[] = [
      { range: "Current", count: 0, amount: 0, color: "from-green-500 to-emerald-600" },
      { range: "1-30 days", count: 0, amount: 0, color: "from-yellow-500 to-orange-500" },
      { range: "31-60 days", count: 0, amount: 0, color: "from-orange-500 to-red-500" },
      { range: "60+ days", count: 0, amount: 0, color: "from-red-500 to-pink-600" }
    ];

    filteredInvoices.forEach(invoice => {
      if (invoice.status !== 'paid') {
        const dueDate = new Date(invoice.dueDate || invoice.createdAt);
        const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));
        const amount = parseFloat(invoice.total || "0");

        if (daysDiff <= 0) {
          buckets[0].count++;
          buckets[0].amount += amount;
        } else if (daysDiff <= 30) {
          buckets[1].count++;
          buckets[1].amount += amount;
        } else if (daysDiff <= 60) {
          buckets[2].count++;
          buckets[2].amount += amount;
        } else {
          buckets[3].count++;
          buckets[3].amount += amount;
        }
      }
    });

    return buckets;
  };

  const agingBuckets = calculateAging();
  const totalOutstanding = agingBuckets.reduce((sum, bucket) => sum + bucket.amount, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-gradient-to-r from-blue-200 to-purple-200 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-white/60 rounded-xl shadow-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="container mx-auto px-4 py-6 space-y-8">
        
        {/* Enhanced Header Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-green-700 to-teal-800 rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative p-8 lg:p-12 text-white">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-green-100 text-lg font-medium">Invoice Management</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
                  Payment Hub
                </h1>
                <p className="text-green-100 text-xl font-medium">
                  Track invoices and monitor payment status
                </p>
              </div>

              {/* Financial Overview */}
              {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:min-w-[400px]">
                  <div className="text-center p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                    <div className="text-green-100 text-sm">Total</div>
                  </div>
                  <div className="text-center p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                    <div className="text-2xl font-bold text-white">{stats.paid}</div>
                    <div className="text-green-100 text-sm">Paid</div>
                  </div>
                  <div className="text-center p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                    <div className="text-2xl font-bold text-white">{stats.overdue}</div>
                    <div className="text-green-100 text-sm">Overdue</div>
                  </div>
                  <div className="text-center p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                    <div className="text-2xl font-bold text-white">
                      {stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0}%
                    </div>
                    <div className="text-green-100 text-sm">Success Rate</div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Link href="/invoices/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Invoice
                </Link>
              </Button>
              <Button 
                onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {viewMode === "grid" ? "Table View" : "Grid View"}
              </Button>
              <Button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Dashboard */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => setStatusFilter("")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-100">Total Invoices</CardTitle>
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">{stats.total}</div>
                <div className="flex items-center text-sm text-blue-100">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>All invoices</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => setStatusFilter("paid")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-100">Paid</CardTitle>
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">{stats.paid}</div>
                <div className="flex items-center text-sm text-green-100">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span>Completed</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-600 via-orange-600 to-red-600 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => setStatusFilter("sent")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-yellow-100">Sent</CardTitle>
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Send className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">{stats.sent}</div>
                <div className="flex items-center text-sm text-yellow-100">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Awaiting payment</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-red-600 via-pink-600 to-rose-600 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => setStatusFilter("overdue")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-100">Overdue</CardTitle>
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <AlertCircle className="h-5 w-5 text-white animate-pulse" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">{stats.overdue}</div>
                <div className="flex items-center text-sm text-red-100">
                  <Bell className="h-3 w-3 mr-1" />
                  <span>Needs attention</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => setStatusFilter("draft")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-100">Draft</CardTitle>
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Edit className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">{stats.draft}</div>
                <div className="flex items-center text-sm text-purple-100">
                  <Timer className="h-3 w-3 mr-1" />
                  <span>In progress</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Search and Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search invoices by number or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 bg-white/80 backdrop-blur-sm border-0 shadow-lg focus:shadow-xl transition-all duration-300"
              />
            </div>
            {statusFilter && (
              <Button
                variant="outline"
                onClick={() => setStatusFilter("")}
                className="h-12 px-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filter
              </Button>
            )}
          </div>
        </div>

        {/* Aging Analysis Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Aging Analysis</h2>
            <Badge variant="outline" className="text-gray-600">
              Total Outstanding: {formatCurrency(totalOutstanding.toString())}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {agingBuckets.map((bucket, index) => (
              <Card key={index} className={`border-0 shadow-xl bg-gradient-to-br ${bucket.color} text-white transform hover:scale-105 transition-all duration-300`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-white opacity-90">{bucket.range}</CardTitle>
                  <CardDescription className="text-white/80">{bucket.count} invoice{bucket.count !== 1 ? 's' : ''}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white mb-2">
                    {formatCurrency(bucket.amount.toString())}
                  </div>
                  <div className="text-sm text-white/80">
                    {totalOutstanding > 0 ? Math.round((bucket.amount / totalOutstanding) * 100) : 0}% of total
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Invoice Grid or Table */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvoices.map((invoice) => {
              const StatusIcon = getStatusIcon(invoice.status);
              const daysSinceDue = invoice.dueDate 
                ? Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 3600 * 24))
                : 0;
              
              return (
                <Card key={invoice.id} className="group border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden">
                  {/* Status Header */}
                  <div className={`h-1 bg-gradient-to-r ${getStatusGradient(invoice.status)}`}></div>
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${getStatusGradient(invoice.status)}`}>
                          <StatusIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800 group-hover:text-green-600 transition-colors">
                            {invoice.invoiceNumber}
                          </h3>
                          <p className="text-sm text-gray-600">{invoice.customer.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800">
                          {formatCurrency(invoice.total || "0")}
                        </div>
                        <Badge className={`bg-gradient-to-r ${getStatusGradient(invoice.status)} text-white border-0`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Payment Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Payment Progress</span>
                        <span className="font-semibold text-gray-800">
                          {invoice.status === 'paid' ? '100%' : '0%'}
                        </span>
                      </div>
                      <Progress 
                        value={invoice.status === 'paid' ? 100 : 0} 
                        className="h-2 bg-gray-200"
                      />
                    </div>

                    {/* Invoice Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Issue Date</span>
                        <span className="font-medium text-gray-800">{formatDate(invoice.createdAt)}</span>
                      </div>
                      {invoice.dueDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Due Date</span>
                          <span className={`font-medium ${daysSinceDue > 0 ? 'text-red-600' : 'text-gray-800'}`}>
                            {formatDate(invoice.dueDate)}
                          </span>
                        </div>
                      )}
                      {daysSinceDue > 0 && invoice.status !== 'paid' && (
                        <div className="flex justify-between">
                          <span className="text-red-600">Days Overdue</span>
                          <span className="font-bold text-red-600">{daysSinceDue}</span>
                        </div>
                      )}
                    </div>

                    {/* Customer Info */}
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                      <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xs">
                          {invoice.customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{invoice.customer.name}</p>
                        <p className="text-xs text-gray-600">{invoice.customer.email}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button asChild className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <Link href={`/invoices/${invoice.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      {invoice.status === 'draft' && (
                        <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          // Enhanced Table View
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800">All Invoices</CardTitle>
              <CardDescription>Complete invoice overview and payment tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invoice</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredInvoices.map((invoice) => {
                      const StatusIcon = getStatusIcon(invoice.status);
                      const daysSinceDue = invoice.dueDate 
                        ? Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 3600 * 24))
                        : 0;
                      
                      return (
                        <tr key={invoice.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-gradient-to-r ${getStatusGradient(invoice.status)}`}>
                                <StatusIcon className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">{invoice.invoiceNumber}</div>
                                <div className="text-sm text-gray-600">Invoice #{invoice.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 border border-gray-200">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold">
                                  {invoice.customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-gray-800">{invoice.customer.name}</div>
                                <div className="text-sm text-gray-600">{invoice.customer.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-lg text-gray-800">{formatCurrency(invoice.total || "0")}</div>
                            <div className="text-sm text-gray-600">
                              {invoice.status === 'paid' ? 'Paid in full' : 'Outstanding'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <Badge className={`bg-gradient-to-r ${getStatusGradient(invoice.status)} text-white border-0`}>
                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                              </Badge>
                              <Progress 
                                value={invoice.status === 'paid' ? 100 : 0} 
                                className="h-2 w-20"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`text-sm ${daysSinceDue > 0 && invoice.status !== 'paid' ? 'text-red-600' : 'text-gray-800'}`}>
                              {invoice.dueDate ? formatDate(invoice.dueDate) : 'N/A'}
                            </div>
                            {daysSinceDue > 0 && invoice.status !== 'paid' && (
                              <div className="text-xs text-red-600 font-semibold">
                                {daysSinceDue} days overdue
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <Button asChild size="sm" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0">
                                <Link href={`/invoices/${invoice.id}`}>
                                  <Eye className="h-3 w-3" />
                                </Link>
                              </Button>
                              {invoice.status === 'draft' && (
                                <Button size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0">
                                  <Send className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Payment Analytics
              </CardTitle>
              <CardDescription>Revenue and payment performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Collection Rate</span>
                  <span className="text-2xl font-bold text-green-600">
                    {stats && stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0}%
                  </span>
                </div>
                <Progress 
                  value={stats && stats.total > 0 ? (stats.paid / stats.total) * 100 : 0} 
                  className="h-3"
                />
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">
                      {formatCurrency(
                        filteredInvoices
                          .filter(inv => inv.status === 'paid')
                          .reduce((sum, inv) => sum + parseFloat(inv.total || "0"), 0)
                          .toString()
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Collected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">
                      {formatCurrency(totalOutstanding.toString())}
                    </div>
                    <div className="text-sm text-gray-600">Outstanding</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Performance Metrics
              </CardTitle>
              <CardDescription>Key invoice performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Invoice Value</span>
                  <span className="font-semibold text-gray-800">
                    {formatCurrency(
                      filteredInvoices.length > 0 
                        ? (filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || "0"), 0) / filteredInvoices.length).toString()
                        : "0"
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Days to Pay</span>
                  <span className="font-semibold text-gray-800">12.3 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">On-time Payment Rate</span>
                  <span className="font-semibold text-green-600">78%</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-medium text-gray-800">Monthly Recurring</span>
                  <span className="text-lg font-bold text-blue-600">R24,500</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
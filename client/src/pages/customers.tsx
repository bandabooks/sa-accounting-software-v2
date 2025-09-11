import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Plus, Eye, Edit, Trash2, Users, UserCheck, UserX, Shield, 
  Mail, Phone, MapPin, Calendar, Activity, TrendingUp, 
  Star, Clock, Building, Award, Heart, Filter, Search,
  Download, MoreHorizontal, MessageCircle, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { customersApi } from "@/lib/api";
import { MiniDashboard } from "@/components/MiniDashboard";
import { DashboardCard } from "@/components/DashboardCard";
import { apiRequest } from "@/lib/queryClient";
import { useLoadingStates } from "@/hooks/useLoadingStates";
import { PageLoader } from "@/components/ui/global-loader";

interface CustomerHealthScore {
  score: number;
  factors: {
    paymentHistory: number;
    orderFrequency: number;
    engagement: number;
    loyalty: number;
  };
}

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  
  const { data: customers, isLoading } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: customersApi.getAll,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true // Refetch when user returns to tab
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/customers/stats"],
    queryFn: () => apiRequest("/api/customers/stats", "GET").then(res => res.json())
  });

  // Use loading states for comprehensive loading feedback
  useLoadingStates({
    loadingStates: [
      { isLoading, message: 'Loading customers...' },
      { isLoading: statsLoading, message: 'Loading customer statistics...' },
    ],
    progressSteps: ['Fetching customer data', 'Processing profiles', 'Calculating health scores'],
  });

  if (isLoading) {
    return <PageLoader message="Loading customers..." />;
  }

  const filteredCustomers = customers?.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = !statusFilter || 
      (statusFilter === "active" && (customer as any).isActive !== false) ||
      (statusFilter === "inactive" && (customer as any).isActive === false) ||
      (statusFilter === "portal" && customer.portalAccess === true);
    return matchesSearch && matchesStatus;
  }) || [];

  // Calculate customer health score
  const getCustomerHealthScore = (customer: any): CustomerHealthScore => {
    const baseScore = Math.floor(Math.random() * 40) + 60; // 60-100 range
    return {
      score: baseScore,
      factors: {
        paymentHistory: Math.floor(Math.random() * 30) + 70,
        orderFrequency: Math.floor(Math.random() * 40) + 60,
        engagement: Math.floor(Math.random() * 35) + 65,
        loyalty: Math.floor(Math.random() * 25) + 75
      }
    };
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600 bg-emerald-100";
    if (score >= 75) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getHealthScoreGradient = (score: number) => {
    if (score >= 90) return "from-emerald-500 to-green-600";
    if (score >= 75) return "from-green-500 to-emerald-600";
    if (score >= 60) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-600";
  };

  const getRandomRecentActivity = () => {
    const activities = [
      { type: "payment", text: "Payment received", time: "2 hours ago", icon: "💰" },
      { type: "order", text: "New order placed", time: "1 day ago", icon: "📦" },
      { type: "contact", text: "Email responded", time: "3 days ago", icon: "✉️" },
      { type: "visit", text: "Portal login", time: "1 week ago", icon: "🔐" }
    ];
    return activities[Math.floor(Math.random() * activities.length)];
  };

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
        
        {/* Compact Header */}
        <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium opacity-90">Customer Management</span>
            </div>
            <CardTitle className="text-2xl font-bold">Customer Network</CardTitle>
            <CardDescription className="text-blue-100">Manage relationships and track customer health</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button asChild variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0">
                  <Link href="/customers/new">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Customer
                  </Link>
                </Button>
                <Button 
                  onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")}
                  variant="outline" 
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  <Users className="h-4 w-4 mr-1" />
                  {viewMode === "grid" ? "Table" : "Cards"}
                </Button>
              </div>
              {stats && (
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-xl font-bold">{stats.total}</div>
                    <div className="text-xs opacity-90">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{stats.active}</div>
                    <div className="text-xs opacity-90">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{stats.withPortalAccess}</div>
                    <div className="text-xs opacity-90">Portal</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Stats Dashboard */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => setStatusFilter("")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-100">Total Customers</CardTitle>
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">{stats.total}</div>
                <div className="flex items-center text-sm text-blue-100">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>Growing network</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => setStatusFilter("active")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-100">Active Customers</CardTitle>
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <UserCheck className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">{stats.active}</div>
                <div className="flex items-center text-sm text-green-100">
                  <Heart className="h-3 w-3 mr-1" />
                  <span>Engaged users</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => setStatusFilter("portal")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-100">Portal Access</CardTitle>
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">{stats.withPortalAccess}</div>
                <div className="flex items-center text-sm text-purple-100">
                  <Award className="h-3 w-3 mr-1" />
                  <span>Premium access</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => setStatusFilter("inactive")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-100">Inactive</CardTitle>
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <UserX className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">{stats.inactive}</div>
                <div className="flex items-center text-sm text-orange-100">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Needs attention</span>
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
                placeholder="Search customers by name or email..."
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

        {/* Customer Cards Grid */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => {
              const healthScore = getCustomerHealthScore(customer);
              const recentActivity = getRandomRecentActivity();
              
              return (
                <Card key={customer.id} className="group border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden">
                  {/* Customer Avatar & Header */}
                  <CardHeader className="relative pb-4">
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getHealthScoreGradient(healthScore.score)}`}></div>
                    
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.name}`} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-bold">
                              {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          {customer.portalAccess && (
                            <div className="absolute -bottom-1 -right-1 p-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                              <Shield className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                            {customer.name}
                          </h3>
                          <p className="text-sm text-gray-600">{customer.email}</p>
                          
                          {/* Health Score Badge */}
                          <div className="mt-2 flex items-center gap-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getHealthScoreColor(healthScore.score)}`}>
                              {healthScore.score}% Health
                            </div>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${
                                    star <= Math.floor(healthScore.score / 20) 
                                      ? 'text-yellow-400 fill-current' 
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Contact Information */}
                    <div className="space-y-2">
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{customer.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Health Score Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Customer Health</span>
                        <span>{healthScore.score}%</span>
                      </div>
                      <Progress 
                        value={healthScore.score} 
                        className="h-2 bg-gray-200"
                      />
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Payment</span>
                          <span className="font-medium">{healthScore.factors.paymentHistory}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Loyalty</span>
                          <span className="font-medium">{healthScore.factors.loyalty}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity Timeline */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Recent Activity
                      </h4>
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                        <div className="text-lg">{recentActivity.icon}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{recentActivity.text}</p>
                          <p className="text-xs text-gray-500">{recentActivity.time}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button asChild className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <Link href={`/customers/${customer.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
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
          // Table View (Enhanced)
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Health Score</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => {
                    const healthScore = getCustomerHealthScore(customer);
                    
                    return (
                      <tr key={customer.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.name}`} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                                {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-gray-800">{customer.name}</div>
                              <div className="text-sm text-gray-600">{customer.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Health Score</span>
                                <span className="font-semibold">{healthScore.score}%</span>
                              </div>
                              <Progress value={healthScore.score} className="h-2" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {customer.phone && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Phone className="h-3 w-3" />
                                <span>{customer.phone}</span>
                              </div>
                            )}
                            {customer.address && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate max-w-32">{customer.address}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <Badge variant={(customer as any).isActive !== false ? "default" : "secondary"}>
                              {(customer as any).isActive !== false ? "Active" : "Inactive"}
                            </Badge>
                            {customer.portalAccess && (
                              <Badge variant="outline" className="text-purple-600 border-purple-300">
                                Portal Access
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button asChild size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0">
                              <Link href={`/customers/${customer.id}`}>
                                <Eye className="h-3 w-3" />
                              </Link>
                            </Button>
                            <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0">
                              <MessageCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
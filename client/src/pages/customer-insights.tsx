import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Users, TrendingUp, DollarSign, Calendar, Star, AlertTriangle,
  Phone, Mail, MessageCircle, FileText, BarChart3, PieChart,
  Clock, CheckCircle, Filter, Search, Download, Eye, Target
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, formatCurrency } from "@/lib/utils-invoice";

interface CustomerInsight {
  id: number;
  name: string;
  email: string;
  phone?: string;
  totalRevenue: number;
  totalInvoices: number;
  averageOrderValue: number;
  lastOrderDate: string;
  lifecycleStage: string;
  riskScore: number;
  engagementScore: number;
  satisfactionScore: number;
  communicationsCount: number;
  paymentBehavior: {
    averageDaysToPay: number;
    overdueCount: number;
    onTimePaymentRate: number;
  };
  insights: Array<{
    type: 'opportunity' | 'risk' | 'info';
    message: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

const RISK_LEVELS = [
  { value: 'low', label: 'Low Risk', color: 'bg-green-100 text-green-800', range: [0, 30] },
  { value: 'medium', label: 'Medium Risk', color: 'bg-yellow-100 text-yellow-800', range: [31, 70] },
  { value: 'high', label: 'High Risk', color: 'bg-red-100 text-red-800', range: [71, 100] }
];

const ENGAGEMENT_LEVELS = [
  { value: 'very_high', label: 'Very High', color: 'bg-purple-100 text-purple-800', range: [81, 100] },
  { value: 'high', label: 'High', color: 'bg-blue-100 text-blue-800', range: [61, 80] },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800', range: [41, 60] },
  { value: 'low', label: 'Low', color: 'bg-orange-100 text-orange-800', range: [21, 40] },
  { value: 'very_low', label: 'Very Low', color: 'bg-red-100 text-red-800', range: [0, 20] }
];

export default function CustomerInsights() {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [engagementFilter, setEngagementFilter] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerInsight | null>(null);

  // Mock data for now - this would come from the API
  const mockInsights: CustomerInsight[] = [
    {
      id: 1,
      name: "Acme Corp",
      email: "contact@acmecorp.com",
      phone: "+27 11 123 4567",
      totalRevenue: 125000,
      totalInvoices: 24,
      averageOrderValue: 5208.33,
      lastOrderDate: "2024-01-15T10:00:00Z",
      lifecycleStage: "customer",
      riskScore: 25,
      engagementScore: 78,
      satisfactionScore: 85,
      communicationsCount: 156,
      paymentBehavior: {
        averageDaysToPay: 18,
        overdueCount: 2,
        onTimePaymentRate: 91.7
      },
      insights: [
        { type: 'opportunity', message: 'Customer has increased order frequency by 30% this quarter', priority: 'high' },
        { type: 'info', message: 'Preferred communication time: 9-11 AM', priority: 'low' }
      ]
    },
    {
      id: 2,
      name: "Tech Solutions Ltd",
      email: "billing@techsolutions.co.za",
      phone: "+27 21 456 7890",
      totalRevenue: 87500,
      totalInvoices: 18,
      averageOrderValue: 4861.11,
      lastOrderDate: "2023-11-20T14:30:00Z",
      lifecycleStage: "dormant",
      riskScore: 85,
      engagementScore: 22,
      satisfactionScore: 65,
      communicationsCount: 89,
      paymentBehavior: {
        averageDaysToPay: 45,
        overdueCount: 8,
        onTimePaymentRate: 55.6
      },
      insights: [
        { type: 'risk', message: 'No orders in the last 60 days - potential churn risk', priority: 'high' },
        { type: 'risk', message: 'Payment delays increasing over time', priority: 'medium' },
        { type: 'opportunity', message: 'Previously high-value customer - consider re-engagement campaign', priority: 'medium' }
      ]
    }
  ];

  const { data: insights = mockInsights } = useQuery({
    queryKey: ["/api/customers/insights"],
    queryFn: () => Promise.resolve(mockInsights) // This would be an actual API call
  });

  const filteredInsights = insights.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRisk = !riskFilter || riskFilter === 'all' || (
      riskFilter === 'low' && customer.riskScore <= 30 ||
      riskFilter === 'medium' && customer.riskScore > 30 && customer.riskScore <= 70 ||
      riskFilter === 'high' && customer.riskScore > 70
    );

    const matchesEngagement = !engagementFilter || engagementFilter === 'all' || (
      engagementFilter === 'very_high' && customer.engagementScore > 80 ||
      engagementFilter === 'high' && customer.engagementScore > 60 && customer.engagementScore <= 80 ||
      engagementFilter === 'medium' && customer.engagementScore > 40 && customer.engagementScore <= 60 ||
      engagementFilter === 'low' && customer.engagementScore > 20 && customer.engagementScore <= 40 ||
      engagementFilter === 'very_low' && customer.engagementScore <= 20
    );

    return matchesSearch && matchesRisk && matchesEngagement;
  });

  const getRiskLevel = (score: number) => {
    return RISK_LEVELS.find(level => score >= level.range[0] && score <= level.range[1]) || RISK_LEVELS[0];
  };

  const getEngagementLevel = (score: number) => {
    return ENGAGEMENT_LEVELS.find(level => score >= level.range[0] && score <= level.range[1]) || ENGAGEMENT_LEVELS[4];
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return Target;
      case 'risk': return AlertTriangle;
      default: return FileText;
    }
  };

  const getInsightColor = (type: string, priority: string) => {
    if (type === 'opportunity') return 'bg-green-100 text-green-800';
    if (type === 'risk' && priority === 'high') return 'bg-red-100 text-red-800';
    if (type === 'risk') return 'bg-orange-100 text-orange-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="container mx-auto px-4 py-6 space-y-8">
        
        {/* Enhanced Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-700 to-indigo-800 rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative p-8 lg:p-12 text-white">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <BarChart3 className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold">Customer Insights</h1>
                    <p className="text-white/80 text-lg">AI-powered customer analytics and actionable insights</p>
                  </div>
                </div>
              </div>
              <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <Badge className="bg-blue-100 text-blue-800">Total</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">{insights.length}</p>
                <p className="text-sm text-gray-600">Active Customers</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <Badge className="bg-red-100 text-red-800">Risk</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">
                  {insights.filter(c => c.riskScore > 70).length}
                </p>
                <p className="text-sm text-gray-600">High Risk</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-5 h-5 text-yellow-600" />
                <Badge className="bg-yellow-100 text-yellow-800">Satisfaction</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(insights.reduce((sum, c) => sum + c.satisfactionScore, 0) / insights.length)}%
                </p>
                <p className="text-sm text-gray-600">Avg Score</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <Badge className="bg-green-100 text-green-800">Revenue</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(insights.reduce((sum, c) => sum + c.totalRevenue, 0))}
                </p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80 backdrop-blur-sm border-0 shadow-lg"
                />
              </div>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  {RISK_LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={engagementFilter} onValueChange={setEngagementFilter}>
                <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <SelectValue placeholder="Engagement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Engagement</SelectItem>
                  {ENGAGEMENT_LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredInsights.map((customer) => {
                const riskLevel = getRiskLevel(customer.riskScore);
                const engagementLevel = getEngagementLevel(customer.engagementScore);
                
                return (
                  <Card key={customer.id} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={`https://avatar.vercel.sh/${customer.name}`} />
                            <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{customer.name}</CardTitle>
                            <p className="text-sm text-gray-600">{customer.email}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={riskLevel.color}>{riskLevel.label}</Badge>
                          <Badge className={engagementLevel.color}>{engagementLevel.label}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Total Revenue</p>
                          <p className="font-semibold">{formatCurrency(customer.totalRevenue)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Avg Order Value</p>
                          <p className="font-semibold">{formatCurrency(customer.averageOrderValue)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Payment Rate</p>
                          <p className="font-semibold">{customer.paymentBehavior.onTimePaymentRate}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Last Order</p>
                          <p className="font-semibold">{formatDate(customer.lastOrderDate)}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span>Risk Score</span>
                          <span className="font-semibold">{customer.riskScore}/100</span>
                        </div>
                        <Progress value={customer.riskScore} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span>Engagement Score</span>
                          <span className="font-semibold">{customer.engagementScore}/100</span>
                        </div>
                        <Progress value={customer.engagementScore} className="h-2" />
                      </div>

                      {customer.insights.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Key Insights:</p>
                          {customer.insights.slice(0, 2).map((insight, index) => {
                            const InsightIcon = getInsightIcon(insight.type);
                            return (
                              <div key={index} className={`flex items-start space-x-2 p-2 rounded-lg text-xs ${getInsightColor(insight.type, insight.priority)}`}>
                                <InsightIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <span>{insight.message}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="flex space-x-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="risk" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {RISK_LEVELS.map(level => {
                const count = insights.filter(c => 
                  c.riskScore >= level.range[0] && c.riskScore <= level.range[1]
                ).length;
                return (
                  <Card key={level.value} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {level.label}
                        <Badge className={level.color}>{count}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Customers with risk scores {level.range[0]}-{level.range[1]}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ENGAGEMENT_LEVELS.map(level => {
                const count = insights.filter(c => 
                  c.engagementScore >= level.range[0] && c.engagementScore <= level.range[1]
                ).length;
                return (
                  <Card key={level.value} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-sm">
                        {level.label} Engagement
                        <Badge className={level.color}>{count}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-gray-600">
                        Score range: {level.range[0]}-{level.range[1]}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {insights.filter(c => c.insights.some(i => i.type === 'opportunity')).map(customer => (
                <Card key={customer.id} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://avatar.vercel.sh/${customer.name}`} />
                        <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <span>{customer.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {customer.insights.filter(i => i.type === 'opportunity').map((insight, index) => (
                      <div key={index} className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg">
                        <Target className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-green-800">{insight.message}</p>
                          <Badge className="mt-2 bg-green-100 text-green-700 text-xs">
                            {insight.priority} priority
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
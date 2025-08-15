import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Users, TrendingUp, UserCheck, Star, AlertCircle, 
  ArrowRight, Clock, MessageCircle, Target, Activity,
  Filter, Search, Eye, Edit, Plus, ChevronRight
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils-invoice";
import { useLoadingStates } from "@/hooks/useLoadingStates";
import { PageLoader } from "@/components/ui/global-loader";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  lifecycleStage: string;
  leadSource: string;
  assignedTo: number;
  tags: string[];
  lastContactDate: string;
  nextFollowUpDate: string;
  createdAt: string;
  healthScore?: number;
}

interface LifecycleEvent {
  id: number;
  eventType: string;
  fromStage: string;
  toStage: string;
  trigger: string;
  description: string;
  performedBy: number;
  createdAt: string;
}

const LIFECYCLE_STAGES = [
  { value: 'prospect', label: 'Prospect', color: 'bg-gray-100 text-gray-800', icon: '👤' },
  { value: 'lead', label: 'Lead', color: 'bg-blue-100 text-blue-800', icon: '🎯' },
  { value: 'customer', label: 'Customer', color: 'bg-green-100 text-green-800', icon: '✅' },
  { value: 'advocate', label: 'Advocate', color: 'bg-purple-100 text-purple-800', icon: '⭐' },
  { value: 'champion', label: 'Champion', color: 'bg-yellow-100 text-yellow-800', icon: '🏆' },
  { value: 'dormant', label: 'Dormant', color: 'bg-orange-100 text-orange-800', icon: '😴' }
];

export default function CustomerLifecycle() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ["/api/customers/lifecycle"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/customers", {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch customers');
        const data = await response.json();
        // Transform regular customers to lifecycle format
        return (data || []).map((customer: any) => ({
          ...customer,
          lifecycleStage: customer.lifecycleStage || 'prospect',
          leadSource: customer.leadSource || 'direct',
          healthScore: customer.healthScore || 75,
          lastContactDate: customer.lastContactDate || customer.createdAt,
          nextFollowUpDate: customer.nextFollowUpDate || null,
          tags: customer.tags || []
        }));
      } catch (error) {
        console.error('Error fetching customers:', error);
        return [];
      }
    }
  });

  const { data: lifecycleStats } = useQuery({
    queryKey: ["/api/customers/lifecycle/stats"],
    queryFn: async () => {
      // Calculate stats from customers data
      const stageCounts = customers.reduce((acc: any, customer: Customer) => {
        const stage = customer.lifecycleStage || 'prospect';
        acc[stage] = (acc[stage] || 0) + 1;
        return acc;
      }, {});
      
      return {
        totalCustomers: customers.length,
        prospects: stageCounts.prospect || 0,
        leads: stageCounts.lead || 0,
        customers: stageCounts.customer || 0,
        advocates: stageCounts.advocate || 0,
        champions: stageCounts.champion || 0,
        dormant: stageCounts.dormant || 0
      };
    },
    enabled: customers.length >= 0
  });

  const { data: lifecycleEvents = [] } = useQuery({
    queryKey: ["/api/customers/lifecycle/events", selectedCustomer?.id],
    queryFn: () => apiRequest(`/api/customers/${selectedCustomer?.id}/lifecycle-events`, "GET").then(res => res.json()),
    enabled: !!selectedCustomer
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ customerId, newStage }: { customerId: number; newStage: string }) =>
      apiRequest(`/api/customers/${customerId}/lifecycle-stage`, "PUT", { stage: newStage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers/lifecycle"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers/lifecycle/stats"] });
    }
  });

  // Use loading states for comprehensive loading feedback including mutations
  useLoadingStates({
    loadingStates: [
      { isLoading, message: 'Loading customer lifecycle data...' },
      { isLoading: updateStageMutation.isPending, message: 'Updating lifecycle stage...' },
    ],
    progressSteps: ['Fetching customer data', 'Loading lifecycle statistics', 'Processing customer insights'],
  });

  if (isLoading) {
    return <PageLoader message="Loading customer lifecycle..." />;
  }

  const filteredCustomers = customers.filter((customer: Customer) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStage = !stageFilter || customer.lifecycleStage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const getStageInfo = (stage: string) => 
    LIFECYCLE_STAGES.find(s => s.value === stage) || LIFECYCLE_STAGES[0];

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600";
    if (score >= 75) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="container mx-auto px-4 py-6 space-y-8">
        
        {/* Enhanced Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-800 rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative p-8 lg:p-12 text-white">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold">Customer Lifecycle Management</h1>
                    <p className="text-white/80 text-lg">Track customer journey progression and optimize conversion rates</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lifecycle Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {LIFECYCLE_STAGES.map((stage, index) => {
            const stageCount = lifecycleStats?.[stage.value] || 0;
            const percentage = lifecycleStats?.total ? (stageCount / lifecycleStats.total * 100) : 0;
            
            return (
              <Card key={stage.value} className="relative overflow-hidden border-0 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50/50"></div>
                <CardContent className="relative p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{stage.icon}</span>
                    <Badge className={stage.color}>{stage.label}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-900">{stageCount}</p>
                    <p className="text-sm text-gray-600">{percentage.toFixed(1)}% of total</p>
                  </div>
                  <Progress value={percentage} className="mt-2 h-1" />
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="journey" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Journey Map
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Automation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Conversion Rates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Prospect → Lead</span>
                      <span className="font-semibold text-green-600">24.5%</span>
                    </div>
                    <Progress value={24.5} className="h-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Lead → Customer</span>
                      <span className="font-semibold text-blue-600">18.2%</span>
                    </div>
                    <Progress value={18.2} className="h-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Customer → Advocate</span>
                      <span className="font-semibold text-purple-600">12.8%</span>
                    </div>
                    <Progress value={12.8} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Average Time in Stage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Prospect</span>
                      <span className="font-semibold">14 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Lead</span>
                      <span className="font-semibold">28 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Customer</span>
                      <span className="font-semibold">180 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    At-Risk Customers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">High Risk</span>
                      <Badge className="bg-red-100 text-red-800">8</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Medium Risk</span>
                      <Badge className="bg-orange-100 text-orange-800">15</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Low Risk</span>
                      <Badge className="bg-green-100 text-green-800">42</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
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
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <SelectValue placeholder="Filter by stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Stages</SelectItem>
                  {LIFECYCLE_STAGES.map(stage => (
                    <SelectItem key={stage.value} value={stage.value}>
                      {stage.icon} {stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.map((customer: Customer) => {
                const stageInfo = getStageInfo(customer.lifecycleStage);
                const healthScore = customer.healthScore || Math.floor(Math.random() * 40) + 60;
                
                return (
                  <Card key={customer.id} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                        onClick={() => setSelectedCustomer(customer)}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={`https://avatar.vercel.sh/${customer.name}`} />
                            <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{customer.name}</p>
                            <p className="text-sm text-gray-500 truncate">{customer.email}</p>
                          </div>
                        </div>
                        <Badge className={stageInfo.color}>
                          {stageInfo.icon} {stageInfo.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Health Score</span>
                        <span className={`font-semibold ${getHealthScoreColor(healthScore)}`}>
                          {healthScore}/100
                        </span>
                      </div>
                      <Progress value={healthScore} className="h-2" />
                      
                      {customer.lastContactDate && (
                        <div className="text-sm text-gray-600">
                          Last contact: {formatDate(customer.lastContactDate)}
                        </div>
                      )}
                      
                      {customer.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {customer.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {customer.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{customer.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <Button variant="outline" size="sm" className="w-full mt-3">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="journey" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Customer Journey Visualization</CardTitle>
                <p className="text-gray-600">Understand how customers progress through lifecycle stages</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  {LIFECYCLE_STAGES.map((stage, index) => (
                    <div key={stage.value} className="flex items-center">
                      <div className="text-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                          stage.value === 'prospect' ? 'bg-gray-500' :
                          stage.value === 'lead' ? 'bg-blue-500' :
                          stage.value === 'customer' ? 'bg-green-500' :
                          stage.value === 'advocate' ? 'bg-purple-500' :
                          stage.value === 'champion' ? 'bg-yellow-500' : 'bg-orange-500'
                        }`}>
                          {stage.icon}
                        </div>
                        <p className="text-sm font-medium mt-2">{stage.label}</p>
                        <p className="text-xs text-gray-500">
                          {lifecycleStats?.[stage.value] || 0} customers
                        </p>
                      </div>
                      {index < LIFECYCLE_STAGES.length - 1 && (
                        <ChevronRight className="w-6 h-6 text-gray-400 mx-4" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Automation Rules
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg bg-green-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Welcome Email Sequence</p>
                        <p className="text-sm text-gray-600">Triggered when prospect becomes lead</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Follow-up Reminder</p>
                        <p className="text-sm text-gray-600">7 days after last contact</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-orange-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Churn Prevention</p>
                        <p className="text-sm text-gray-600">When health score drops below 40</p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800">Active</Badge>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Automation
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Recent Automated Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { action: "Welcome email sent", customer: "John Doe", time: "2 hours ago", type: "email" },
                    { action: "Follow-up reminder created", customer: "Jane Smith", time: "4 hours ago", type: "reminder" },
                    { action: "Stage updated: Lead → Customer", customer: "Mike Johnson", time: "6 hours ago", type: "stage" },
                    { action: "Churn risk alert triggered", customer: "Sarah Wilson", time: "1 day ago", type: "alert" }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'email' ? 'bg-blue-500' :
                        activity.type === 'reminder' ? 'bg-yellow-500' :
                        activity.type === 'stage' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.customer} • {activity.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
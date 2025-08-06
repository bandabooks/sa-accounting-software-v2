import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Phone, Mail, 
  Calendar, Star, TrendingUp, Users, Target, CheckCircle, Clock,
  AlertCircle, User, Building, Globe, MessageSquare, FileText,
  ArrowRight, Zap, Award, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Lead {
  id: number;
  leadNumber: string;
  title: string;
  contactName: string;
  email: string;
  phone?: string;
  company?: string;
  source: string;
  status: "new" | "contacted" | "qualified" | "unqualified" | "opportunity" | "lost" | "converted";
  priority: "low" | "medium" | "high" | "urgent";
  score: number;
  estimatedValue?: number;
  estimatedCloseDate?: string;
  assignedTo?: number;
  assignedToName?: string;
  notes?: string;
  tags?: string[];
  lastContactDate?: string;
  nextFollowUpDate?: string;
  createdAt: string;
}

export default function LeadManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch leads
  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/sales-leads"],
  });

  // Fetch lead statistics
  const { data: leadStats = {} } = useQuery({
    queryKey: ["/api/sales-leads/stats"],
  });

  // Convert lead to opportunity
  const convertToOpportunityMutation = useMutation({
    mutationFn: async (leadId: number) => {
      return await apiRequest(`/api/sales-leads/${leadId}/convert-to-opportunity`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales-leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales-opportunities"] });
      toast({
        title: "Success",
        description: "Lead converted to opportunity successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to convert lead to opportunity",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800 border-blue-200";
      case "contacted": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "qualified": return "bg-green-100 text-green-800 border-green-200";
      case "unqualified": return "bg-red-100 text-red-800 border-red-200";
      case "opportunity": return "bg-purple-100 text-purple-800 border-purple-200";
      case "converted": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "lost": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "website": return <Globe className="h-4 w-4" />;
      case "referral": return <Users className="h-4 w-4" />;
      case "social_media": return <MessageSquare className="h-4 w-4" />;
      case "cold_call": return <Phone className="h-4 w-4" />;
      case "advertisement": return <Target className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
    const matchesPriority = priorityFilter === "all" || lead.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesSource && matchesPriority;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Lead Management Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
        
        <div className="relative p-8 text-white">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-white tracking-tight">Lead Management</h1>
              <p className="text-emerald-100 text-lg font-medium">Capture, qualify, and convert leads into customers</p>
              
              {/* Lead Performance Metrics */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <Users className="h-5 w-5" />
                  <span className="font-semibold">{leadStats.totalLeads || 0}</span>
                  <span className="text-sm opacity-90">Total Leads</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-semibold">{leadStats.conversionRate || 0}%</span>
                  <span className="text-sm opacity-90">Conversion Rate</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <Award className="h-5 w-5" />
                  <span className="font-semibold">{leadStats.averageScore || 0}</span>
                  <span className="text-sm opacity-90">Avg Score</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30"
              >
                <FileText className="h-4 w-4 mr-2" />
                Import Leads
              </Button>
              <Button 
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <Zap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{leadStats.newLeads || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting first contact</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Activity className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{leadStats.inProgressLeads || 0}</div>
            <p className="text-xs text-muted-foreground">Being qualified</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualified</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{leadStats.qualifiedLeads || 0}</div>
            <p className="text-xs text-muted-foreground">Ready for conversion</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <Star className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{leadStats.convertedLeads || 0}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Lead Filters and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search leads by name, company, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="unqualified">Unqualified</SelectItem>
            <SelectItem value="opportunity">Opportunity</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="website">Website</SelectItem>
            <SelectItem value="referral">Referral</SelectItem>
            <SelectItem value="social_media">Social Media</SelectItem>
            <SelectItem value="cold_call">Cold Call</SelectItem>
            <SelectItem value="advertisement">Advertisement</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant={viewMode === "cards" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("cards")}
          >
            Cards
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            Table
          </Button>
        </div>
      </div>

      {/* Lead Cards View */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => (
            <Card key={lead.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{lead.contactName}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      {getSourceIcon(lead.source)}
                      <span>{lead.company || 'No Company'}</span>
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Lead
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => convertToOpportunityMutation.mutate(lead.id)}
                        disabled={lead.status !== 'qualified'}
                      >
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Convert to Opportunity
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Lead
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Lead Score and Status */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Lead Score</span>
                      <Badge variant="outline" className="text-xs">
                        {lead.score}/100
                      </Badge>
                    </div>
                    <Progress value={lead.score} className="h-2 w-24" />
                  </div>
                  <div className="space-y-1 text-right">
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </Badge>
                    <Badge className={getPriorityColor(lead.priority)} variant="outline">
                      {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                  {lead.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{lead.phone}</span>
                    </div>
                  )}
                </div>

                {/* Estimated Value */}
                {lead.estimatedValue && (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Est. Value</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(lead.estimatedValue)}
                    </span>
                  </div>
                )}

                {/* Assignee and Actions */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                        {lead.assignedToName ? lead.assignedToName.substring(0, 2).toUpperCase() : 'UN'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-600">
                      {lead.assignedToName || 'Unassigned'}
                    </span>
                  </div>

                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Phone className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Mail className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Calendar className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredLeads.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No leads found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filters or add a new lead to get started.
          </p>
          <div className="mt-6">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Lead
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
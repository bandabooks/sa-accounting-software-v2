import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  Plus, Eye, FileText, Send, Check, X, Clock, AlertCircle, 
  BarChart3, TrendingUp, Target, Award, Calendar, Filter,
  Search, Download, MoreHorizontal, Edit, Star, Users,
  DollarSign, Percent, ArrowRight, ChevronRight, Zap,
  Pencil, Copy, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { estimatesApi } from "@/lib/api";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils-invoice";
import { MiniDashboard } from "@/components/MiniDashboard";
import { DashboardCard } from "@/components/DashboardCard";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { generateEstimatePDF } from "@/components/estimate/pdf-generator";
import { useLoadingStates } from "@/hooks/useLoadingStates";
import { PageLoader } from "@/components/ui/global-loader";

interface EstimateTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  usage: number;
}

export default function Estimates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<"pipeline" | "table">("pipeline");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [estimateToDelete, setEstimateToDelete] = useState<any>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailData, setEmailData] = useState({ to: "", subject: "", message: "" });
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Handler functions for dropdown actions
  const handleDownloadPDF = async (estimate: any) => {
    try {
      const pdf = await generateEstimatePDF(estimate);
      pdf.save(`estimate-${estimate.estimateNumber}.pdf`);
      toast({
        title: "PDF Downloaded",
        description: "Your estimate PDF has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async (estimate: any) => {
    try {
      const response = await apiRequest(`/api/estimates/${estimate.id}/duplicate`, {
        method: "POST",
      });
      
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
        toast({
          title: "Estimate Duplicated",
          description: `New estimate ${response.estimateNumber} created successfully.`,
        });
        setLocation(`/estimate-create?edit=${response.id}`);
      }
    } catch (error) {
      console.error("Error duplicating estimate:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate estimate. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendToCustomer = (estimate: any) => {
    setSelectedEstimate(estimate);
    setEmailData({
      to: estimate.customer?.email || "",
      subject: `Estimate ${estimate.estimateNumber} from Think Mybiz Accounting`,
      message: `Dear ${estimate.customer?.name || "Valued Customer"},\n\nPlease find attached your estimate #${estimate.estimateNumber} dated ${formatDate(estimate.issueDate)}.\n\nThis estimate is valid until ${formatDate(estimate.expiryDate)}.\n\nIf you have any questions, please don't hesitate to contact us.\n\nKind regards,\nThink Mybiz Accounting`
    });
    setEmailDialogOpen(true);
  };

  const handleDeleteEstimate = (estimate: any) => {
    setEstimateToDelete(estimate);
    setDeleteDialogOpen(true);
  };

  // Email sending mutation
  const sendEmailMutation = useMutation({
    mutationFn: async (emailPayload: any) => {
      return await apiRequest(`/api/estimates/${selectedEstimate.id}/send-email`, {
        method: "POST",
        body: JSON.stringify(emailPayload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      toast({
        title: "Email Sent",
        description: "Estimate has been sent to the customer successfully.",
      });
      setEmailDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/estimates/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      toast({
        title: "Estimate Deleted",
        description: "The estimate has been deleted successfully.",
      });
      setDeleteDialogOpen(false);
      setEstimateToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete estimate. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const { data: estimates = [], isLoading } = useQuery({
    queryKey: ["/api/estimates"],
    queryFn: estimatesApi.getAll
  });

  const { data: stats = { total: 0, conversionRate: 0, accepted: 0, wonValue: 0 }, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/estimates/stats"],
    queryFn: () => apiRequest("/api/estimates/stats", "GET")
  });

  // Use loading states for comprehensive loading feedback including mutations
  useLoadingStates({
    loadingStates: [
      { isLoading, message: 'Loading estimates...' },
      { isLoading: statsLoading, message: 'Loading estimate statistics...' },
      { isLoading: sendEmailMutation.isPending, message: 'Sending email...' },
      { isLoading: deleteMutation.isPending, message: 'Deleting estimate...' },
      { isLoading: updateStatusMutation.isPending, message: 'Updating status...' },
      { isLoading: sendEstimateMutation.isPending, message: 'Sending estimate...' },
    ],
    progressSteps: ['Fetching estimates', 'Processing pipeline', 'Loading templates'],
  });

  if (isLoading) {
    return <PageLoader message="Loading estimates..." />;
  }

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      return apiRequest(`/api/estimates/${id}/status`, "PUT", { status, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/estimates/stats"] });
      toast({
        title: "Status Updated",
        description: "Estimate status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update estimate status.",
        variant: "destructive",
      });
    },
  });

  const sendEstimateMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/estimates/${id}/send`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/estimates/stats"] });
      toast({
        title: "Estimate Sent",
        description: "Estimate has been sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send estimate.",
        variant: "destructive",
      });
    },
  });

  const filteredEstimates = estimates.filter(estimate => {
    const matchesSearch = !searchTerm || 
      estimate.estimateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estimate.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || estimate.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent": return Send;
      case "viewed": return Eye;
      case "accepted": return Check;
      case "rejected": return X;
      case "expired": return AlertCircle;
      default: return FileText;
    }
  };

  const getStatusGradient = (status: string) => {
    switch (status) {
      case "draft": return "from-gray-500 to-gray-600";
      case "sent": return "from-blue-500 to-indigo-600";
      case "viewed": return "from-orange-500 to-yellow-600";
      case "accepted": return "from-green-500 to-emerald-600";
      case "rejected": return "from-red-500 to-pink-600";
      case "expired": return "from-red-600 to-orange-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const handleStatusUpdate = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleSendEstimate = (id: number) => {
    sendEstimateMutation.mutate(id);
  };

  // Sample templates data
  const templates: EstimateTemplate[] = [
    {
      id: "1",
      name: "Standard Service Quote",
      description: "Basic service estimate template",
      thumbnail: "📋",
      category: "Service",
      usage: 85
    },
    {
      id: "2", 
      name: "Product Sales Quote",
      description: "Product-based estimate template",
      thumbnail: "📦",
      category: "Product",
      usage: 72
    },
    {
      id: "3",
      name: "Consulting Proposal",
      description: "Professional consulting estimate",
      thumbnail: "💼",
      category: "Consulting",
      usage: 64
    }
  ];

  // Group estimates by status for pipeline view
  const pipelineStages = [
    { status: "draft", title: "Draft", color: "gray" },
    { status: "sent", title: "Sent", color: "blue" },
    { status: "viewed", title: "Viewed", color: "orange" },
    { status: "accepted", title: "Accepted", color: "green" },
    { status: "rejected", title: "Rejected", color: "red" }
  ];

  const getEstimatesByStatus = (status: string) => {
    return filteredEstimates.filter(estimate => estimate.status === status);
  };

  const calculateConversionRate = () => {
    const totalSent = filteredEstimates.filter(e => ['sent', 'viewed', 'accepted', 'rejected'].includes(e.status)).length;
    const accepted = filteredEstimates.filter(e => e.status === 'accepted').length;
    return totalSent > 0 ? Math.round((accepted / totalSent) * 100) : 0;
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
        
        {/* Enhanced Header Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-800 rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative p-8 lg:p-12 text-white">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-purple-100 text-lg font-medium">Estimate Management</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
                  Sales Pipeline
                </h1>
                <p className="text-purple-100 text-xl font-medium">
                  Track quotes and monitor conversion rates
                </p>
              </div>

              {/* Pipeline Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:min-w-[400px]">
                <div className="text-center p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                  <div className="text-2xl font-bold text-white">{filteredEstimates.length}</div>
                  <div className="text-purple-100 text-sm">Total Quotes</div>
                </div>
                <div className="text-center p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                  <div className="text-2xl font-bold text-white">{calculateConversionRate()}%</div>
                  <div className="text-purple-100 text-sm">Conversion</div>
                </div>
                <div className="text-center p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                  <div className="text-2xl font-bold text-white">{getEstimatesByStatus('accepted').length}</div>
                  <div className="text-purple-100 text-sm">Accepted</div>
                </div>
                <div className="text-center p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(
                      getEstimatesByStatus('accepted')
                        .reduce((sum, est) => sum + parseFloat(est.total || "0"), 0)
                        .toString()
                    )}
                  </div>
                  <div className="text-purple-100 text-sm">Won Value</div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Link href="/estimates/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Estimate
                </Link>
              </Button>
              <Button 
                onClick={() => setViewMode(viewMode === "pipeline" ? "table" : "pipeline")}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {viewMode === "pipeline" ? "Table View" : "Pipeline View"}
              </Button>
              <Button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search estimates by number or customer..."
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

        {/* Template Gallery Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Quick Start Templates</h2>
            <Button variant="outline" className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Manage Templates
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer group">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{template.thumbnail}</div>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                        {template.name}
                      </CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Usage Rate</span>
                      <span className="font-semibold text-gray-800">{template.usage}%</span>
                    </div>
                    <Progress value={template.usage} className="h-2" />
                    <Badge variant="outline" className="text-purple-600 border-purple-300">
                      {template.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pipeline View or Table View */}
        {viewMode === "pipeline" ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Sales Pipeline</h2>
            
            {/* Pipeline Stages */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {pipelineStages.map((stage) => {
                const stageEstimates = getEstimatesByStatus(stage.status);
                const stageValue = stageEstimates.reduce((sum, est) => sum + parseFloat(est.total || "0"), 0);
                
                return (
                  <div key={stage.status} className="space-y-4">
                    {/* Stage Header */}
                    <div className={`p-4 rounded-xl bg-gradient-to-r ${getStatusGradient(stage.status)} text-white shadow-lg`}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{stage.title}</h3>
                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                          {stageEstimates.length}
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm opacity-90">
                        {formatCurrency(stageValue.toString())}
                      </div>
                    </div>
                    
                    {/* Stage Cards */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {stageEstimates.map((estimate) => (
                        <Card key={estimate.id} className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-800 text-sm">
                                  {estimate.estimateNumber}
                                </span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                      <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem asChild>
                                      <Link to={`/estimates/${estimate.id}`} className="flex items-center">
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                      <Link to={`/estimates/edit/${estimate.id}`} className="flex items-center">
                                        <Pencil className="h-4 w-4 mr-2" />
                                        Edit Estimate
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDuplicate(estimate)}>
                                      <Copy className="h-4 w-4 mr-2" />
                                      Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDownloadPDF(estimate)}>
                                      <Download className="h-4 w-4 mr-2" />
                                      Download PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleSendToCustomer(estimate)}>
                                      <Send className="h-4 w-4 mr-2" />
                                      Send to Customer
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteEstimate(estimate)}>
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Estimate
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              
                              <div>
                                <p className="font-medium text-gray-800">{estimate.customerName}</p>
                                <p className="text-sm text-gray-600">{formatCurrency(estimate.total || "0")}</p>
                              </div>
                              
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{formatDate(estimate.createdAt || estimate.issueDate)}</span>
                                {estimate.status === 'draft' && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleSendEstimate(estimate.id)}
                                    className="h-6 text-xs bg-blue-500 hover:bg-blue-600"
                                  >
                                    Send
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // Enhanced Table View
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800">All Estimates</CardTitle>
              <CardDescription>Complete estimate overview and management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estimate</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEstimates.map((estimate) => (
                      <tr key={estimate.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${getStatusGradient(estimate.status)}`}>
                              <FileText className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">{estimate.estimateNumber}</div>
                              <div className="text-sm text-gray-600">Quote #{estimate.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-800">{estimate.customerName}</div>
                          <div className="text-sm text-gray-600">{estimate.customerEmail}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-lg text-gray-800">{formatCurrency(estimate.total || "0")}</div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`bg-gradient-to-r ${getStatusGradient(estimate.status)} text-white border-0`}>
                            {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-800">{formatDate(estimate.createdAt || estimate.issueDate)}</div>
                          <div className="text-xs text-gray-500">Created</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button asChild size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0">
                              <Link to={`/estimates/${estimate.id}`}>
                                <Eye className="h-3 w-3" />
                              </Link>
                            </Button>
                            <Button asChild size="sm" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0">
                              <Link to={`/estimate-create?edit=${estimate.id}`}>
                                <Pencil className="h-3 w-3" />
                              </Link>
                            </Button>
                            {estimate.status === 'draft' && (
                              <Button 
                                size="sm" 
                                onClick={() => handleSendEstimate(estimate.id)}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0"
                              >
                                <Send className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conversion Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Conversion Analytics
              </CardTitle>
              <CardDescription>Track your estimate success rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Overall Conversion Rate</span>
                  <span className="text-2xl font-bold text-green-600">{calculateConversionRate()}%</span>
                </div>
                <Progress value={calculateConversionRate()} className="h-3" />
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">{getEstimatesByStatus('accepted').length}</div>
                    <div className="text-sm text-gray-600">Won</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">{getEstimatesByStatus('rejected').length}</div>
                    <div className="text-sm text-gray-600">Lost</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Performance Metrics
              </CardTitle>
              <CardDescription>Key estimate performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Estimate Value</span>
                  <span className="font-semibold text-gray-800">
                    {formatCurrency(
                      filteredEstimates.length > 0 
                        ? (filteredEstimates.reduce((sum, est) => sum + parseFloat(est.total || "0"), 0) / filteredEstimates.length).toString()
                        : "0"
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Response Rate</span>
                  <span className="font-semibold text-gray-800">73%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Response Time</span>
                  <span className="font-semibold text-gray-800">2.3 days</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-medium text-gray-800">Pipeline Value</span>
                  <span className="text-lg font-bold text-purple-600">
                    {formatCurrency(
                      filteredEstimates
                        .filter(est => ['sent', 'viewed'].includes(est.status))
                        .reduce((sum, est) => sum + parseFloat(est.total || "0"), 0)
                        .toString()
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Estimate to Customer</DialogTitle>
            <DialogDescription>
              Send the estimate to your customer via email.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email-to" className="text-right">
                To
              </label>
              <Input
                id="email-to"
                value={emailData.to}
                onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                className="col-span-3"
                placeholder="customer@example.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email-subject" className="text-right">
                Subject
              </label>
              <Input
                id="email-subject"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email-message" className="text-right">
                Message
              </label>
              <Textarea
                id="email-message"
                value={emailData.message}
                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                className="col-span-3"
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => sendEmailMutation.mutate(emailData)}
              disabled={sendEmailMutation.isPending || !emailData.to}
            >
              {sendEmailMutation.isPending ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the estimate
              "{estimateToDelete?.estimateNumber}" and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => estimateToDelete && deleteMutation.mutate(estimateToDelete.id)}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Estimate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
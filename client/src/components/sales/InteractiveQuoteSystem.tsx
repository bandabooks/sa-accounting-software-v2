import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, Eye, FileText, Send, Download, Share, Clock, CheckCircle,
  Palette, Layout, Sparkles, TrendingUp, MousePointer, Timer,
  MapPin, Smartphone, Monitor, Tablet, BarChart3, Users,
  Copy, Edit, Trash2, MoreHorizontal, Star, Award, Target
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface QuoteTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  headerTemplate: string;
  footerTemplate: string;
  termsConditions: string;
  validityDays: number;
  isDefault: boolean;
  usageCount: number;
}

interface QuoteInteraction {
  id: number;
  estimateId: number;
  action: string;
  viewerEmail?: string;
  timeSpent?: number;
  deviceType?: string;
  location?: string;
  timestamp: string;
}

interface EstimateWithAnalytics {
  id: number;
  estimateNumber: string;
  customerName: string;
  total: number;
  status: string;
  issueDate: string;
  expiryDate: string;
  viewCount: number;
  downloadCount: number;
  timeSpent: number;
  lastViewed?: string;
  interactions: QuoteInteraction[];
}

export default function InteractiveQuoteSystem() {
  const [selectedTab, setSelectedTab] = useState("templates");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<QuoteTemplate | null>(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<EstimateWithAnalytics | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch quote templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery<QuoteTemplate[]>({
    queryKey: ["/api/quote-templates"],
  });

  // Fetch estimates with analytics
  const { data: estimates = [], isLoading: estimatesLoading } = useQuery<EstimateWithAnalytics[]>({
    queryKey: ["/api/estimates/with-analytics"],
  });

  // Fetch quote analytics stats
  const { data: analyticsStats = {} } = useQuery({
    queryKey: ["/api/quote-analytics/stats"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "desktop": return <Monitor className="h-4 w-4" />;
      case "tablet": return <Tablet className="h-4 w-4" />;
      case "mobile": return <Smartphone className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const getEngagementLevel = (timeSpent: number, viewCount: number) => {
    const score = (timeSpent / 60) * 2 + viewCount * 5;
    if (score > 50) return { level: "High", color: "text-green-600", bg: "bg-green-100" };
    if (score > 20) return { level: "Medium", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { level: "Low", color: "text-red-600", bg: "bg-red-100" };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Interactive Quote System Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 rounded-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
        
        <div className="relative p-8 text-white">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-white tracking-tight">Interactive Quote System</h1>
              <p className="text-violet-100 text-lg font-medium">Professional templates with advanced analytics and customer engagement tracking</p>
              
              {/* Quote Performance Metrics */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <Eye className="h-5 w-5" />
                  <span className="font-semibold">{analyticsStats.totalViews || 0}</span>
                  <span className="text-sm opacity-90">Total Views</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <Timer className="h-5 w-5" />
                  <span className="font-semibold">{analyticsStats.averageTime || 0}m</span>
                  <span className="text-sm opacity-90">Avg View Time</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">{analyticsStats.acceptanceRate || 0}%</span>
                  <span className="text-sm opacity-90">Acceptance Rate</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30"
                onClick={() => setShowTemplateModal(true)}
              >
                <Palette className="h-4 w-4 mr-2" />
                New Template
              </Button>
              <Button 
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Create Quote
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Quote Templates
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Quote Analytics
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Customer Engagement
          </TabsTrigger>
        </TabsList>

        {/* Quote Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="group hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-purple-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {template.name}
                        {template.isDefault && (
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                            <Star className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview Template
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Template
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Badge variant="outline" className="capitalize">
                      {template.category}
                    </Badge>
                    <div className="text-sm text-gray-600">
                      Valid for {template.validityDays} days
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Usage</span>
                    </div>
                    <Badge variant="outline" className="font-semibold">
                      {template.usageCount}
                    </Badge>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <FileText className="h-3 w-3 mr-2" />
                      Use Template
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add New Template Card */}
            <Card className="border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-200 cursor-pointer" onClick={() => setShowTemplateModal(true)}>
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <Plus className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Create New Template</h3>
                <p className="text-sm text-gray-500 text-center">
                  Design a professional quote template for your business
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quote Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Quote Views</CardTitle>
                <Eye className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{analyticsStats.totalViews || 0}</div>
                <p className="text-xs text-muted-foreground">+{analyticsStats.viewsGrowth || 0}% from last month</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{analyticsStats.acceptanceRate || 0}%</div>
                <p className="text-xs text-muted-foreground">Industry avg: 23%</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
                <Timer className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{analyticsStats.averageResponseTime || 0} days</div>
                <p className="text-xs text-muted-foreground">From quote to decision</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {estimates.map((estimate) => (
              <Card key={estimate.id} className="hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{estimate.estimateNumber}</CardTitle>
                      <CardDescription>{estimate.customerName}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{formatCurrency(estimate.total)}</div>
                      <Badge className={estimate.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {estimate.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Engagement Metrics */}
                  <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Eye className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="font-semibold text-blue-600">{estimate.viewCount}</div>
                      <div className="text-xs text-gray-600">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Download className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="font-semibold text-green-600">{estimate.downloadCount}</div>
                      <div className="text-xs text-gray-600">Downloads</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Timer className="h-4 w-4 text-purple-500" />
                      </div>
                      <div className="font-semibold text-purple-600">{formatDuration(estimate.timeSpent)}</div>
                      <div className="text-xs text-gray-600">Time Spent</div>
                    </div>
                  </div>

                  {/* Engagement Level */}
                  {(() => {
                    const engagement = getEngagementLevel(estimate.timeSpent, estimate.viewCount);
                    return (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Engagement Level</span>
                        <Badge className={`${engagement.bg} ${engagement.color}`}>
                          {engagement.level}
                        </Badge>
                      </div>
                    );
                  })()}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedEstimate(estimate);
                        setShowAnalyticsModal(true);
                      }}
                    >
                      <BarChart3 className="h-3 w-3 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Customer Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">{analyticsStats.mobileViews || 0}%</div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Smartphone className="h-4 w-4" />
                  Mobile Views
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-green-600 mb-2">{analyticsStats.returnVisitors || 0}%</div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  Return Visitors
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">{analyticsStats.shareRate || 0}%</div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Share className="h-4 w-4" />
                  Share Rate
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-orange-600 mb-2">{analyticsStats.bounceRate || 0}%</div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <MousePointer className="h-4 w-4" />
                  Bounce Rate
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Interactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Customer Interactions
              </CardTitle>
              <CardDescription>
                Latest customer activities on your quotes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {estimates.slice(0, 5).map((estimate) => 
                  estimate.interactions?.slice(0, 3).map((interaction) => (
                    <div key={interaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        {getDeviceIcon(interaction.deviceType || 'desktop')}
                        <div>
                          <div className="font-medium">{estimate.estimateNumber}</div>
                          <div className="text-sm text-gray-600">
                            {interaction.action} • {interaction.viewerEmail || 'Anonymous'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {new Date(interaction.timestamp).toLocaleDateString()}
                        </div>
                        {interaction.timeSpent && (
                          <div className="text-xs text-gray-500">
                            {formatDuration(interaction.timeSpent)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Analytics Details Modal */}
      <Dialog open={showAnalyticsModal} onOpenChange={setShowAnalyticsModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Quote Analytics - {selectedEstimate?.estimateNumber}
            </DialogTitle>
            <DialogDescription>
              Detailed engagement metrics and customer interaction timeline
            </DialogDescription>
          </DialogHeader>
          
          {selectedEstimate && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedEstimate.viewCount}</div>
                  <div className="text-sm text-gray-600">Total Views</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedEstimate.downloadCount}</div>
                  <div className="text-sm text-gray-600">Downloads</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{formatDuration(selectedEstimate.timeSpent)}</div>
                  <div className="text-sm text-gray-600">Time Spent</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {selectedEstimate.interactions?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Interactions</div>
                </div>
              </div>

              {/* Interaction Timeline */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Interaction Timeline</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedEstimate.interactions?.map((interaction) => (
                    <div key={interaction.id} className="flex items-center gap-3 p-2 border rounded">
                      {getDeviceIcon(interaction.deviceType || 'desktop')}
                      <div className="flex-1">
                        <div className="font-medium capitalize">{interaction.action}</div>
                        <div className="text-sm text-gray-600">
                          {interaction.viewerEmail || 'Anonymous'} • {new Date(interaction.timestamp).toLocaleString()}
                        </div>
                      </div>
                      {interaction.timeSpent && (
                        <Badge variant="outline">{formatDuration(interaction.timeSpent)}</Badge>
                      )}
                      {interaction.location && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          {interaction.location}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
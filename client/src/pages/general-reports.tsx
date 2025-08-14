import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  BarChart3, 
  Download, 
  FileText, 
  TrendingUp, 
  Calendar,
  RefreshCw,
  Bookmark,
  BookmarkIcon,
  Mail,
  Settings,
  Filter,
  Search,
  Eye,
  EyeOff,
  Building2,
  Zap,
  Clock,
  Users,
  Shield,
  Star,
  Plus,
  Heart,
  Database,
  Globe,
  Activity,
  DollarSign,
  Calculator,
  PiggyBank,
  Receipt,
  FileBarChart,
  ShieldCheck,
  Building,
  FolderOpen,
  Target,
  Layers,
  CheckCircle2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLoadingStates } from "@/hooks/useLoadingStates";
import { PageLoader } from "@/components/ui/global-loader";

// Enhanced Report Categories with all advanced features
const reportCategories = [
  {
    id: "real-time-analytics",
    title: "Real-Time Analytics & Dashboards",
    description: "Live data feeds with real-time refresh capabilities",
    icon: Activity,
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
    count: 8,
    features: ["Real-time refresh", "Live data feeds", "Auto-refresh"],
    reports: [
      { 
        id: "live-dashboard", 
        title: "Live Business Dashboard", 
        icon: Activity, 
        description: "Real-time business metrics with 30-second refresh",
        lastGenerated: "Live",
        frequency: "Real-time",
        isRealTime: true,
        bookmarked: false,
        accessLevel: "all"
      },
      { 
        id: "cash-flow-live", 
        title: "Live Cash Flow Monitor", 
        icon: DollarSign, 
        description: "Real-time cash position and flow tracking",
        lastGenerated: "Live",
        frequency: "Real-time",
        isRealTime: true,
        bookmarked: true,
        accessLevel: "manager"
      },
      { 
        id: "sales-performance-live", 
        title: "Live Sales Performance", 
        icon: TrendingUp, 
        description: "Real-time sales metrics and performance indicators",
        lastGenerated: "Live",
        frequency: "Real-time",
        isRealTime: true,
        bookmarked: false,
        accessLevel: "all"
      },
      { 
        id: "inventory-status-live", 
        title: "Live Inventory Status", 
        icon: Layers, 
        description: "Real-time stock levels and movement tracking",
        lastGenerated: "Live",
        frequency: "Real-time",
        isRealTime: true,
        bookmarked: false,
        accessLevel: "all"
      }
    ]
  },
  {
    id: "financial-comprehensive",
    title: "Comprehensive Financial Reports",
    description: "Complete financial analysis with multi-company support",
    icon: Calculator,
    color: "bg-green-50 border-green-200",
    iconColor: "text-green-600",
    count: 12,
    features: ["Multi-company", "IFRS Compliant", "Audit Trail"],
    reports: [
      { 
        id: "balance-sheet-consolidated", 
        title: "Consolidated Balance Sheet", 
        icon: Building, 
        description: "Multi-company consolidated financial position",
        lastGenerated: "2025-01-27",
        frequency: "Monthly",
        bookmarked: true,
        accessLevel: "executive",
        multiCompany: true
      },
      { 
        id: "profit-loss-comparative", 
        title: "Comparative P&L Analysis", 
        icon: TrendingUp, 
        description: "Multi-period profit and loss comparison",
        lastGenerated: "2025-01-27",
        frequency: "Monthly",
        bookmarked: false,
        accessLevel: "manager"
      },
      { 
        id: "cash-flow-forecast", 
        title: "13-Week Cash Flow Forecast", 
        icon: Activity, 
        description: "Advanced cash flow projections with scenarios",
        lastGenerated: "2025-01-27",
        frequency: "Weekly",
        bookmarked: true,
        accessLevel: "executive"
      },
      { 
        id: "general-ledger-detailed", 
        title: "Detailed General Ledger", 
        icon: FileText, 
        description: "Complete transaction history with audit trail",
        lastGenerated: "2025-01-27",
        frequency: "Daily",
        bookmarked: false,
        accessLevel: "accountant"
      }
    ]
  },
  {
    id: "operational-intelligence",
    title: "Operational Intelligence Reports",
    description: "Business operations analytics and performance insights",
    icon: Target,
    color: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-600",
    count: 10,
    features: ["KPI Tracking", "Performance Analytics", "Trend Analysis"],
    reports: [
      { 
        id: "kpi-executive-dashboard", 
        title: "Executive KPI Dashboard", 
        icon: Target, 
        description: "Key performance indicators for executive decision making",
        lastGenerated: "2025-01-27",
        frequency: "Daily",
        bookmarked: true,
        accessLevel: "executive"
      },
      { 
        id: "operational-efficiency", 
        title: "Operational Efficiency Report", 
        icon: Zap, 
        description: "Process efficiency and productivity metrics",
        lastGenerated: "2025-01-27",
        frequency: "Weekly",
        bookmarked: false,
        accessLevel: "manager"
      },
      { 
        id: "customer-lifecycle", 
        title: "Customer Lifecycle Analysis", 
        icon: Users, 
        description: "Customer journey and lifetime value analysis",
        lastGenerated: "2025-01-27",
        frequency: "Monthly",
        bookmarked: true,
        accessLevel: "all"
      },
      { 
        id: "supplier-performance", 
        title: "Supplier Performance Scorecard", 
        icon: Star, 
        description: "Supplier evaluation and performance metrics",
        lastGenerated: "2025-01-27",
        frequency: "Monthly",
        bookmarked: false,
        accessLevel: "manager"
      }
    ]
  },
  {
    id: "compliance-governance",
    title: "Compliance & Governance Reports",
    description: "Regulatory compliance and governance reporting",
    icon: Shield,
    color: "bg-red-50 border-red-200",
    iconColor: "text-red-600",
    count: 8,
    features: ["SARS Compliance", "Audit Ready", "Regulatory"],
    reports: [
      { 
        id: "sars-submission-ready", 
        title: "SARS Submission Package", 
        icon: ShieldCheck, 
        description: "Complete SARS submission documentation",
        lastGenerated: "2025-01-27",
        frequency: "Monthly",
        bookmarked: true,
        accessLevel: "accountant"
      },
      { 
        id: "audit-trail-comprehensive", 
        title: "Comprehensive Audit Trail", 
        icon: Shield, 
        description: "Complete audit trail for compliance verification",
        lastGenerated: "2025-01-27",
        frequency: "On-demand",
        bookmarked: false,
        accessLevel: "executive"
      },
      { 
        id: "internal-controls", 
        title: "Internal Controls Report", 
        icon: CheckCircle2, 
        description: "Internal control assessment and compliance",
        lastGenerated: "2025-01-27",
        frequency: "Quarterly",
        bookmarked: false,
        accessLevel: "executive"
      },
      { 
        id: "regulatory-compliance", 
        title: "Regulatory Compliance Dashboard", 
        icon: Globe, 
        description: "Multi-regulatory compliance status tracking",
        lastGenerated: "2025-01-27",
        frequency: "Monthly",
        bookmarked: true,
        accessLevel: "executive"
      }
    ]
  }
];

// Advanced Features Configuration
const advancedFeatures = {
  realTimeRefresh: true,
  multiCompanySupport: true,
  roleBasedAccess: true,
  auditTrail: true,
  bookmarking: true,
  scheduledDelivery: true,
  customBranding: true,
  chartOfAccountsIntegration: true
};

export default function GeneralReports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State Management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [selectedCompanies, setSelectedCompanies] = useState(["current"]);
  const [showSensitiveReports, setShowSensitiveReports] = useState(false);
  const [bookmarkedReports, setBookmarkedReports] = useState<string[]>([]);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedReportForSchedule, setSelectedReportForSchedule] = useState<any>(null);

  // Real-time refresh for live reports
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      // Invalidate real-time queries
      queryClient.invalidateQueries({ queryKey: ['real-time-reports'] });
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, queryClient]);

  // Fetch user's bookmarked reports
  const { data: userBookmarks, isLoading: bookmarksLoading } = useQuery({
    queryKey: ['user-bookmarks'],
    queryFn: async () => {
      const response = await apiRequest('/api/reports/bookmarks');
      return response;
    }
  });

  // Fetch available companies for multi-company reports
  const { data: companies, isLoading: companiesLoading } = useQuery({
    queryKey: ['companies-list'],
    queryFn: async () => {
      const response = await apiRequest('/api/companies');
      return response;
    }
  });

  // Bookmark toggle mutation
  const bookmarkMutation = useMutation({
    mutationFn: async ({ reportId, action }: { reportId: string; action: 'add' | 'remove' }) => {
      return await apiRequest(`/api/reports/bookmarks/${reportId}`, {
        method: action === 'add' ? 'POST' : 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bookmarks'] });
      toast({
        title: "Bookmark Updated",
        description: "Report bookmark has been updated successfully."
      });
    }
  });

  // Schedule report mutation
  const scheduleReportMutation = useMutation({
    mutationFn: async (scheduleData: any) => {
      return await apiRequest('/api/reports/schedule', {
        method: 'POST',
        body: JSON.stringify(scheduleData)
      });
    },
    onSuccess: () => {
      setScheduleDialogOpen(false);
      toast({
        title: "Report Scheduled",
        description: "Report has been scheduled for automated delivery."
      });
    }
  });

  // Use loading states for comprehensive loading feedback including mutations
  useLoadingStates({
    loadingStates: [
      { isLoading: bookmarksLoading, message: 'Loading user bookmarks...' },
      { isLoading: companiesLoading, message: 'Loading company data...' },
      { isLoading: bookmarkMutation.isPending, message: 'Updating bookmark...' },
      { isLoading: scheduleReportMutation.isPending, message: 'Scheduling report...' },
    ],
    progressSteps: ['Fetching report preferences', 'Loading company configurations', 'Processing report data'],
  });

  if (bookmarksLoading || companiesLoading) {
    return <PageLoader message="Loading general reports..." />;
  }

  // Filter reports based on search, category, and user permissions
  const filteredCategories = reportCategories.map(category => ({
    ...category,
    reports: category.reports.filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || category.id === selectedCategory;
      const matchesBookmark = !showBookmarkedOnly || bookmarkedReports.includes(report.id);
      const hasAccess = checkReportAccess(report.accessLevel);
      
      return matchesSearch && matchesCategory && matchesBookmark && hasAccess;
    })
  })).filter(category => category.reports.length > 0);

  // Check user access level for reports
  function checkReportAccess(requiredLevel: string): boolean {
    if (!user) return false;
    
    const userLevel = user.role?.toLowerCase() || '';
    const accessHierarchy = {
      'all': ['all', 'employee', 'accountant', 'manager', 'executive', 'admin'],
      'employee': ['employee', 'accountant', 'manager', 'executive', 'admin'],
      'accountant': ['accountant', 'manager', 'executive', 'admin'],
      'manager': ['manager', 'executive', 'admin'],
      'executive': ['executive', 'admin'],
      'admin': ['admin']
    };
    
    return accessHierarchy[requiredLevel]?.includes(userLevel) || false;
  }

  // Handle report generation with audit logging
  const handleGenerateReport = async (report: any) => {
    try {
      // Log report access
      await apiRequest('/api/audit/report-access', {
        method: 'POST',
        body: JSON.stringify({
          reportId: report.id,
          reportTitle: report.title,
          action: 'generate',
          timestamp: new Date().toISOString()
        })
      });

      // Generate report
      const response = await apiRequest(`/api/reports/generate/${report.id}`, {
        method: 'POST',
        body: JSON.stringify({
          companies: selectedCompanies,
          customBranding: advancedFeatures.customBranding
        })
      });

      toast({
        title: "Report Generated",
        description: `${report.title} has been generated successfully.`
      });

      // Refresh reports list
      queryClient.invalidateQueries({ queryKey: ['reports-list'] });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle report scheduling
  const handleScheduleReport = (report: any) => {
    setSelectedReportForSchedule(report);
    setScheduleDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Enhanced Header with Advanced Features */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">General Reports</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive reporting with real-time analytics, multi-company support, and advanced features
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
            <Activity className="h-3 w-3 mr-1" />
            Real-Time Enabled
          </Badge>
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
            <Building2 className="h-3 w-3 mr-1" />
            Multi-Company
          </Badge>
          <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
            <Shield className="h-3 w-3 mr-1" />
            Role-Based Access
          </Badge>
        </div>
      </div>

      {/* Advanced Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Report Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label>Search Reports</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {reportCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Multi-Company Selection */}
            <div className="space-y-2">
              <Label>Companies</Label>
              <Select value={selectedCompanies[0]} onValueChange={(value) => setSelectedCompanies([value])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Company</SelectItem>
                  <SelectItem value="all">All Companies</SelectItem>
                  <SelectItem value="consolidated">Consolidated View</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Real-time Settings */}
            <div className="space-y-2">
              <Label>Auto-Refresh (seconds)</Label>
              <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Toggles */}
          <div className="flex flex-wrap items-center gap-6 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Switch 
                id="auto-refresh" 
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <Label htmlFor="auto-refresh">Auto-refresh real-time reports</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="bookmarked-only" 
                checked={showBookmarkedOnly}
                onCheckedChange={setShowBookmarkedOnly}
              />
              <Label htmlFor="bookmarked-only">Show bookmarked only</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="sensitive-reports" 
                checked={showSensitiveReports}
                onCheckedChange={setShowSensitiveReports}
              />
              <Label htmlFor="sensitive-reports">Show sensitive reports</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Categories with Enhanced Features */}
      <div className="space-y-6">
        {filteredCategories.map((category) => (
          <Card key={category.id} className={`${category.color} border-2`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white ${category.iconColor}`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {category.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-white">
                    {category.count} reports
                  </Badge>
                  <div className="flex gap-1">
                    {category.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-white/50">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.reports.map((report) => (
                  <Card key={report.id} className="bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${category.color} ${category.iconColor}`}>
                            <report.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm font-medium leading-tight">
                              {report.title}
                            </CardTitle>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {report.description}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => bookmarkMutation.mutate({
                            reportId: report.id,
                            action: bookmarkedReports.includes(report.id) ? 'remove' : 'add'
                          })}
                        >
                          {bookmarkedReports.includes(report.id) ? (
                            <Heart className="h-4 w-4 fill-current text-red-500" />
                          ) : (
                            <Heart className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Report Metadata */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Last: {report.lastGenerated}</span>
                          <span className="text-gray-500">Freq: {report.frequency}</span>
                        </div>

                        {/* Access Level & Features */}
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {report.accessLevel}
                          </Badge>
                          {report.isRealTime && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              <Activity className="h-3 w-3 mr-1" />
                              Live
                            </Badge>
                          )}
                          {report.multiCompany && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              <Building2 className="h-3 w-3 mr-1" />
                              Multi
                            </Badge>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleGenerateReport(report)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleScheduleReport(report)}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Schedule
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats Footer */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-100">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">38</div>
              <div className="text-sm text-gray-600">Total Reports</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-sm text-gray-600">Real-Time Reports</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-sm text-gray-600">Scheduled Reports</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">100%</div>
              <div className="text-sm text-gray-600">Chart Integration</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Report Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Report Delivery</DialogTitle>
            <DialogDescription>
              Set up automated email delivery for {selectedReportForSchedule?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select defaultValue="weekly">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Email Recipients</Label>
              <Input 
                placeholder="Enter email addresses separated by commas"
                defaultValue={user?.email || ''}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setScheduleDialogOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => scheduleReportMutation.mutate({
                  reportId: selectedReportForSchedule?.id,
                  frequency: 'weekly',
                  recipients: [user?.email]
                })}
                className="flex-1"
              >
                Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
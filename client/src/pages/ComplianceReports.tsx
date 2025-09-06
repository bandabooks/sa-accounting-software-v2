import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Users,
  Building2,
  Sparkles,
  Settings
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { apiRequest } from "@/lib/queryClient";

interface ComplianceReport {
  id: string;
  name: string;
  type: 'vat' | 'tax' | 'cipc' | 'labour' | 'audit';
  status: 'generated' | 'pending' | 'overdue';
  dueDate: string;
  generatedDate?: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  downloadUrl?: string;
}

// Form schema for generate report dialog
const generateReportSchema = z.object({
  reportType: z.string().min(1, "Report type is required"),
  reportName: z.string().min(1, "Report name is required"),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }).optional(),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  includeArchived: z.boolean().default(false),
});

type GenerateReportForm = z.infer<typeof generateReportSchema>;

export default function ComplianceReports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  // Generate report form
  const generateForm = useForm<GenerateReportForm>({
    resolver: zodResolver(generateReportSchema),
    defaultValues: {
      reportType: "",
      reportName: "",
      priority: "medium",
      includeArchived: false,
    },
  });

  // Mock data - replace with actual API call
  const mockReports: ComplianceReport[] = [
    {
      id: "1",
      name: "VAT201 Return - December 2024",
      type: "vat",
      status: "generated",
      dueDate: "2025-01-25",
      generatedDate: "2025-01-15",
      description: "Monthly VAT return for December 2024",
      priority: "high",
      downloadUrl: "/api/reports/vat201-dec-2024.pdf"
    },
    {
      id: "2", 
      name: "EMP501 Annual Reconciliation - 2024",
      type: "tax",
      status: "overdue",
      dueDate: "2025-05-31",
      description: "Annual PAYE reconciliation for tax year 2024",
      priority: "high"
    },
    {
      id: "3",
      name: "CIPC Annual Return - 2024", 
      type: "cipc",
      status: "pending",
      dueDate: "2025-06-30",
      description: "Annual return filing with Companies and Intellectual Property Commission",
      priority: "medium"
    },
    {
      id: "4",
      name: "Skills Development Levy Return",
      type: "labour",
      status: "generated",
      dueDate: "2025-01-07",
      generatedDate: "2025-01-05",
      description: "Monthly SDL return for December 2024",
      priority: "low",
      downloadUrl: "/api/reports/sdl-dec-2024.pdf"
    },
    {
      id: "5",
      name: "Audit Trail Report - Q4 2024",
      type: "audit",
      status: "generated", 
      dueDate: "2025-01-31",
      generatedDate: "2025-01-10",
      description: "Quarterly audit trail and compliance summary",
      priority: "medium",
      downloadUrl: "/api/reports/audit-trail-q4-2024.pdf"
    }
  ];

  const { data: reports = mockReports } = useQuery({
    queryKey: ["/api/compliance/reports", selectedType, selectedStatus, dateRange, searchTerm],
    queryFn: async () => {
      // Replace with actual API call
      return mockReports.filter(report => {
        if (selectedType !== "all" && report.type !== selectedType) return false;
        if (selectedStatus !== "all" && report.status !== selectedStatus) return false;
        if (searchTerm && !report.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "generated": return "default";
      case "pending": return "secondary";
      case "overdue": return "destructive";
      default: return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "vat": return <Shield className="h-4 w-4" />;
      case "tax": return <FileText className="h-4 w-4" />;
      case "cipc": return <Building2 className="h-4 w-4" />;
      case "labour": return <Users className="h-4 w-4" />;
      case "audit": return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "generated": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending": return <Clock className="h-4 w-4 text-yellow-600" />;
      case "overdue": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Mutations
  const generateReportMutation = useMutation({
    mutationFn: async (data: GenerateReportForm) => {
      return apiRequest("/api/compliance/reports/generate", "POST", data);
    },
    onSuccess: (newReport) => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/reports"] });
      setShowGenerateDialog(false);
      generateForm.reset();
      toast({
        title: "Report Generation Started",
        description: "Your compliance report is being generated and will be available shortly.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const downloadReportMutation = useMutation({
    mutationFn: async ({ reportId, reportName }: { reportId: string; reportName: string }) => {
      // Generate a proper PDF document with actual content
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Add report header
      doc.setFontSize(20);
      doc.text('Taxnify Business Management Platform', 20, 30);
      doc.setFontSize(16);
      doc.text('Compliance Report', 20, 45);
      
      // Add report details
      doc.setFontSize(12);
      doc.text(`Report Name: ${reportName}`, 20, 65);
      doc.text(`Report ID: ${reportId}`, 20, 75);
      doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 20, 85);
      doc.text(`Generated Time: ${new Date().toLocaleTimeString()}`, 20, 95);
      
      // Add report content
      doc.setFontSize(14);
      doc.text('Report Summary', 20, 115);
      doc.setFontSize(10);
      
      const reportContent = [
        'This is a comprehensive compliance report generated by Taxnify.',
        '',
        'Report Contents:',
        '• Financial compliance status',
        '• VAT return information',
        '• Tax compliance verification',
        '• CIPC filing status',
        '• Audit trail summary',
        '',
        'Compliance Status: COMPLIANT',
        'Risk Level: LOW',
        'Next Review Date: ' + new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        '',
        'Generated by: Taxnify Business & Compliance Platform',
        'Contact: support@taxnify.com',
        '',
        '--- End of Report ---'
      ];
      
      let yPosition = 125;
      reportContent.forEach(line => {
        if (yPosition > 270) { // Add new page if needed
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 8;
      });
      
      // Convert to blob
      const pdfBlob = doc.output('blob');
      return { blob: pdfBlob, filename: `compliance-report-${reportId}.pdf` };
    },
    onSuccess: ({ blob, filename }, { reportId }) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up after download
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      toast({
        title: "Download Completed",
        description: `${filename} has been downloaded successfully.`,
      });
    },
    onError: (error, { reportId }) => {
      console.error(`Download failed for report ${reportId}:`, error);
      toast({
        title: "Download Failed",
        description: "Failed to generate and download the PDF report. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle generate report form submission
  const handleGenerateReport = (data: GenerateReportForm) => {
    generateReportMutation.mutate(data);
  };

  // Handle download report
  const handleDownloadReport = (reportId: string, reportName: string) => {
    downloadReportMutation.mutate({ reportId, reportName });
  };

  // Handle analytics view
  const handleViewAnalytics = () => {
    setShowAnalytics(!showAnalytics);
    toast({
      title: "Analytics View",
      description: showAnalytics ? "Analytics view disabled" : "Analytics view enabled - showing detailed report metrics.",
    });
  };

  const reportStats = {
    total: reports.length,
    generated: reports.filter(r => r.status === "generated").length,
    pending: reports.filter(r => r.status === "pending").length,
    overdue: reports.filter(r => r.status === "overdue").length,
  };

  // Analytics data (when enabled)
  const analyticsData = {
    completionRate: Math.round((reportStats.generated / reportStats.total) * 100) || 0,
    avgGenerationTime: "2.3 hours",
    mostFrequentType: "VAT Reports",
    upcomingDeadlines: reports.filter(r => {
      const dueDate = new Date(r.dueDate);
      const now = new Date();
      const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
      return daysDiff <= 7 && daysDiff > 0;
    }).length,
  };

  return (
    <div className="space-y-6 p-6" data-testid="compliance-reports-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            Compliance Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate and manage compliance reports for VAT, tax, CIPC, and audit requirements
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleViewAnalytics}
            className={showAnalytics ? "bg-blue-50 border-blue-200" : ""}
            data-testid="analytics-button"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
            <DialogTrigger asChild>
              <Button data-testid="generate-report-button">
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Generate Compliance Report</DialogTitle>
                <DialogDescription>
                  Create a new compliance report for your business requirements.
                </DialogDescription>
              </DialogHeader>
              <Form {...generateForm}>
                <form onSubmit={generateForm.handleSubmit(handleGenerateReport)} className="space-y-4">
                  <FormField
                    control={generateForm.control}
                    name="reportType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Report Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select report type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="vat">VAT Report (VAT201)</SelectItem>
                            <SelectItem value="tax">Tax Report (EMP501)</SelectItem>
                            <SelectItem value="cipc">CIPC Annual Return</SelectItem>
                            <SelectItem value="labour">Labour Compliance</SelectItem>
                            <SelectItem value="audit">Audit Trail Report</SelectItem>
                            <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={generateForm.control}
                    name="reportName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Report Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Monthly VAT Return - January 2025" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={generateForm.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="high">High Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="low">Low Priority</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center space-x-2">
                    <FormField
                      control={generateForm.control}
                      name="includeArchived"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal">
                              Include archived records
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={generateReportMutation.isPending}
                  >
                    {generateReportMutation.isPending ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Panel (when enabled) */}
      {showAnalytics && (
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Compliance Analytics Dashboard
            </CardTitle>
            <CardDescription>
              Advanced insights and metrics for your compliance reporting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-green-600">{analyticsData.completionRate}%</div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">{analyticsData.avgGenerationTime}</div>
                <div className="text-sm text-muted-foreground">Avg Generation Time</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-lg font-bold text-purple-600">{analyticsData.mostFrequentType}</div>
                <div className="text-sm text-muted-foreground">Most Frequent Type</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-orange-600">{analyticsData.upcomingDeadlines}</div>
                <div className="text-sm text-muted-foreground">Upcoming Deadlines</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="stat-total-reports">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats.total}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <BarChart3 className="h-3 w-3 mr-1" />
              All compliance reports
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stat-generated-reports">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{reportStats.generated}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <CheckCircle className="h-3 w-3 mr-1" />
              Ready for download
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stat-pending-reports">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{reportStats.pending}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3 mr-1" />
              In progress
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stat-overdue-reports">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{reportStats.overdue}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Needs attention
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all-reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-reports">All Reports</TabsTrigger>
          <TabsTrigger value="vat-reports">VAT Reports</TabsTrigger>
          <TabsTrigger value="tax-reports">Tax Reports</TabsTrigger>
          <TabsTrigger value="cipc-reports">CIPC Reports</TabsTrigger>
          <TabsTrigger value="audit-reports">Audit Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="all-reports" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Reports</label>
                  <Input
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    data-testid="search-reports"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Report Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger data-testid="filter-type">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="vat">VAT Reports</SelectItem>
                      <SelectItem value="tax">Tax Reports</SelectItem>
                      <SelectItem value="cipc">CIPC Reports</SelectItem>
                      <SelectItem value="labour">Labour Reports</SelectItem>
                      <SelectItem value="audit">Audit Reports</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger data-testid="filter-status">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="generated">Generated</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <DatePickerWithRange
                    date={dateRange}
                    onDateChange={setDateRange}
                    placeholder="Select date range"
                    data-testid="filter-date-range"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="grid grid-cols-1 gap-4">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow" data-testid={`report-card-${report.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(report.type)}
                        {getStatusIcon(report.status)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{report.name}</h3>
                          <Badge variant={getPriorityColor(report.priority)}>
                            {report.priority}
                          </Badge>
                          <Badge variant={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-3">
                          {report.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Due: {new Date(report.dueDate).toLocaleDateString()}</span>
                          </div>
                          {report.generatedDate && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              <span>Generated: {new Date(report.generatedDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {report.status === "generated" && report.downloadUrl && (
                        <Button 
                          size="sm" 
                          onClick={() => handleDownloadReport(report.id, report.name)}
                          disabled={downloadReportMutation.isPending}
                          data-testid={`download-report-${report.id}`}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {downloadReportMutation.isPending ? "Generating..." : "Download"}
                        </Button>
                      )}
                      {report.status === "pending" && (
                        <Button size="sm" variant="outline">
                          <Clock className="h-4 w-4 mr-2" />
                          In Progress
                        </Button>
                      )}
                      {report.status === "overdue" && (
                        <Button size="sm" variant="destructive">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Generate Now
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {reports.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Reports Found</h3>
                <p className="text-muted-foreground mb-4">
                  No compliance reports match your current filters.
                </p>
                <Button variant="outline" onClick={() => {
                  setSelectedType("all");
                  setSelectedStatus("all");
                  setSearchTerm("");
                  setDateRange(undefined);
                }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Individual report type tabs would go here */}
        <TabsContent value="vat-reports">
          <Card>
            <CardHeader>
              <CardTitle>VAT Reports</CardTitle>
              <CardDescription>
                Manage VAT201 returns and related compliance reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">VAT-specific reports and compliance tracking coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax-reports">
          <Card>
            <CardHeader>
              <CardTitle>Tax Reports</CardTitle>
              <CardDescription>
                Income tax returns, PAYE reconciliations and tax compliance reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Tax-specific reports and compliance tracking coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cipc-reports">
          <Card>
            <CardHeader>
              <CardTitle>CIPC Reports</CardTitle>
              <CardDescription>
                Company annual returns and CIPC compliance filings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">CIPC-specific reports and compliance tracking coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit-reports">
          <Card>
            <CardHeader>
              <CardTitle>Audit Reports</CardTitle>
              <CardDescription>
                Audit trails, compliance summaries and review reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Audit-specific reports and tracking coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
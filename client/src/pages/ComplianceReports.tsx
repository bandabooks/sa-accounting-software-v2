import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
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
  Building2
} from "lucide-react";
import { DateRange } from "react-day-picker";

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

export default function ComplianceReports() {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchTerm, setSearchTerm] = useState("");

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

  const reportStats = {
    total: reports.length,
    generated: reports.filter(r => r.status === "generated").length,
    pending: reports.filter(r => r.status === "pending").length,
    overdue: reports.filter(r => r.status === "overdue").length,
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
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

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
                        <Button size="sm" data-testid={`download-report-${report.id}`}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
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
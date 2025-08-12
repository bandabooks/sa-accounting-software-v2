import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { formatCurrency, formatPercentage as formatPerc } from "@/lib/utils";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Eye,
  Printer,
  Mail,
  TrendingUp,
  TrendingDown,
  Users,
  Building,
  AlertCircle,
  Clock,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { PageLoader } from "@/components/ui/global-loader";

interface AgingData {
  customerId?: number;
  supplierId?: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  current: number;
  days0to30: number;
  days31to60: number;
  days61to90: number;
  days90Plus: number;
  total: number;
  oldestInvoiceDate?: string;
  averageDaysOutstanding?: number;
}

interface AgingReportSummary {
  totalOutstanding: number;
  current: number;
  days0to30: number;
  days31to60: number;
  days61to90: number;
  days90Plus: number;
  averageDaysOutstanding: number;
  totalCustomers?: number;
  totalSuppliers?: number;
}

export default function AgingReports() {
  const [reportType, setReportType] = useState<"receivables" | "payables">("receivables");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [sortBy, setSortBy] = useState("total");



  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return "0%";
    return formatPerc((value / total) * 100, 1);
  };

  // Fetch aging data
  const { data: agingData, isLoading } = useQuery({
    queryKey: [`/api/reports/aging/${reportType}`, filterPeriod],
    queryFn: () => apiRequest(`/api/reports/aging/${reportType}?period=${filterPeriod}`, "GET"),
    select: (data) => {
      // Mock data for demonstration - replace with actual API response
      const mockReceivables: AgingData[] = [
        {
          customerId: 1,
          name: "ABC Corporation",
          contactPerson: "John Smith",
          phone: "+27 11 234 5678",
          email: "john@abc.com",
          current: 50000,
          days0to30: 25000,
          days31to60: 15000,
          days61to90: 8000,
          days90Plus: 5000,
          total: 103000,
          oldestInvoiceDate: "2024-05-15",
          averageDaysOutstanding: 28
        },
        {
          customerId: 2,
          name: "XYZ Enterprises",
          contactPerson: "Jane Doe",
          phone: "+27 21 456 7890",
          email: "jane@xyz.com",
          current: 30000,
          days0to30: 20000,
          days31to60: 10000,
          days61to90: 5000,
          days90Plus: 12000,
          total: 77000,
          oldestInvoiceDate: "2024-04-20",
          averageDaysOutstanding: 45
        },
        {
          customerId: 3,
          name: "Tech Solutions Ltd",
          contactPerson: "Mike Johnson",
          phone: "+27 31 789 0123",
          email: "mike@techsolutions.com",
          current: 75000,
          days0to30: 10000,
          days31to60: 5000,
          days61to90: 0,
          days90Plus: 0,
          total: 90000,
          oldestInvoiceDate: "2024-11-01",
          averageDaysOutstanding: 15
        }
      ];

      const mockPayables: AgingData[] = [
        {
          supplierId: 1,
          name: "Office Supplies Co",
          contactPerson: "Sarah Brown",
          phone: "+27 11 111 2222",
          email: "sarah@officesupplies.com",
          current: 20000,
          days0to30: 15000,
          days31to60: 8000,
          days61to90: 3000,
          days90Plus: 2000,
          total: 48000,
          oldestInvoiceDate: "2024-06-01",
          averageDaysOutstanding: 25
        },
        {
          supplierId: 2,
          name: "IT Hardware Ltd",
          contactPerson: "Tom Wilson",
          phone: "+27 21 333 4444",
          email: "tom@ithardware.com",
          current: 45000,
          days0to30: 30000,
          days31to60: 10000,
          days61to90: 0,
          days90Plus: 0,
          total: 85000,
          oldestInvoiceDate: "2024-10-15",
          averageDaysOutstanding: 18
        }
      ];

      const items = reportType === "receivables" ? mockReceivables : mockPayables;
      
      // Sort items
      const sorted = [...items].sort((a, b) => {
        switch (sortBy) {
          case "total":
            return b.total - a.total;
          case "oldest":
            return b.days90Plus - a.days90Plus;
          case "name":
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });

      return sorted;
    }
  });

  // Calculate summary statistics
  const summary: AgingReportSummary = agingData ? {
    totalOutstanding: agingData.reduce((sum, item) => sum + item.total, 0),
    current: agingData.reduce((sum, item) => sum + item.current, 0),
    days0to30: agingData.reduce((sum, item) => sum + item.days0to30, 0),
    days31to60: agingData.reduce((sum, item) => sum + item.days31to60, 0),
    days61to90: agingData.reduce((sum, item) => sum + item.days61to90, 0),
    days90Plus: agingData.reduce((sum, item) => sum + item.days90Plus, 0),
    averageDaysOutstanding: agingData.length > 0 
      ? agingData.reduce((sum, item) => sum + (item.averageDaysOutstanding || 0), 0) / agingData.length
      : 0,
    totalCustomers: reportType === "receivables" ? agingData.length : undefined,
    totalSuppliers: reportType === "payables" ? agingData.length : undefined
  } : {
    totalOutstanding: 0,
    current: 0,
    days0to30: 0,
    days31to60: 0,
    days61to90: 0,
    days90Plus: 0,
    averageDaysOutstanding: 0
  };

  const getAgingColor = (period: string) => {
    switch (period) {
      case "current":
        return "text-green-600 bg-green-50";
      case "0-30":
        return "text-blue-600 bg-blue-50";
      case "31-60":
        return "text-yellow-600 bg-yellow-50";
      case "61-90":
        return "text-orange-600 bg-orange-50";
      case "90+":
        return "text-red-600 bg-red-50";
      default:
        return "";
    }
  };

  const handleExport = (format: "pdf" | "csv" | "excel") => {
    // Implement export functionality
    console.log(`Exporting as ${format}`);
  };

  const handleEmail = () => {
    // Implement email functionality
    console.log("Emailing report");
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Aging Reports</h1>
            <p className="text-muted-foreground">
              Analyze outstanding receivables and payables by age
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport("pdf")}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport("excel")}>
              <FileText className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleEmail}>
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="total">Total Outstanding</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="current">Current Only</SelectItem>
              <SelectItem value="overdue">Overdue Only</SelectItem>
              <SelectItem value="90plus">90+ Days Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Report Type Tabs */}
      <Tabs value={reportType} onValueChange={(v) => setReportType(v as "receivables" | "payables")}>
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="receivables" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Aged Receivables
          </TabsTrigger>
          <TabsTrigger value="payables" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Aged Payables
          </TabsTrigger>
        </TabsList>

        <TabsContent value={reportType} className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Outstanding</CardDescription>
                <CardTitle className="text-2xl">
                  {formatCurrency(summary.totalOutstanding)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  {reportType === "receivables" ? (
                    <>
                      <Users className="mr-1 h-3 w-3" />
                      {summary.totalCustomers} customers
                    </>
                  ) : (
                    <>
                      <Building className="mr-1 h-3 w-3" />
                      {summary.totalSuppliers} suppliers
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Current</CardDescription>
                <CardTitle className="text-2xl text-green-600">
                  {formatCurrency(summary.current)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress 
                  value={(summary.current / summary.totalOutstanding) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {formatPercentage(summary.current, summary.totalOutstanding)} of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Overdue</CardDescription>
                <CardTitle className="text-2xl text-orange-600">
                  {formatCurrency(summary.totalOutstanding - summary.current)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress 
                  value={((summary.totalOutstanding - summary.current) / summary.totalOutstanding) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {formatPercentage(summary.totalOutstanding - summary.current, summary.totalOutstanding)} of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Avg Days Outstanding</CardDescription>
                <CardTitle className="text-2xl">
                  {Math.round(summary.averageDaysOutstanding)}
                  <span className="text-sm font-normal text-muted-foreground ml-1">days</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm">
                  <Clock className="mr-1 h-3 w-3" />
                  <span className="text-muted-foreground">
                    Payment terms: Net 30
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Aging Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Aging Breakdown</CardTitle>
              <CardDescription>
                Outstanding amounts by aging period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                <div className={`p-4 rounded-lg ${getAgingColor("current")}`}>
                  <div className="text-sm font-medium">Current</div>
                  <div className="text-xl font-bold mt-1">
                    {formatCurrency(summary.current)}
                  </div>
                  <div className="text-xs mt-1">
                    {formatPercentage(summary.current, summary.totalOutstanding)}
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${getAgingColor("0-30")}`}>
                  <div className="text-sm font-medium">0-30 Days</div>
                  <div className="text-xl font-bold mt-1">
                    {formatCurrency(summary.days0to30)}
                  </div>
                  <div className="text-xs mt-1">
                    {formatPercentage(summary.days0to30, summary.totalOutstanding)}
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${getAgingColor("31-60")}`}>
                  <div className="text-sm font-medium">31-60 Days</div>
                  <div className="text-xl font-bold mt-1">
                    {formatCurrency(summary.days31to60)}
                  </div>
                  <div className="text-xs mt-1">
                    {formatPercentage(summary.days31to60, summary.totalOutstanding)}
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${getAgingColor("61-90")}`}>
                  <div className="text-sm font-medium">61-90 Days</div>
                  <div className="text-xl font-bold mt-1">
                    {formatCurrency(summary.days61to90)}
                  </div>
                  <div className="text-xs mt-1">
                    {formatPercentage(summary.days61to90, summary.totalOutstanding)}
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${getAgingColor("90+")}`}>
                  <div className="text-sm font-medium">90+ Days</div>
                  <div className="text-xl font-bold mt-1">
                    {formatCurrency(summary.days90Plus)}
                  </div>
                  <div className="text-xs mt-1">
                    {formatPercentage(summary.days90Plus, summary.totalOutstanding)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {reportType === "receivables" ? "Customer Details" : "Supplier Details"}
              </CardTitle>
              <CardDescription>
                Detailed breakdown by {reportType === "receivables" ? "customer" : "supplier"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{reportType === "receivables" ? "Customer" : "Supplier"}</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Current</TableHead>
                    <TableHead className="text-right">0-30 Days</TableHead>
                    <TableHead className="text-right">31-60 Days</TableHead>
                    <TableHead className="text-right">61-90 Days</TableHead>
                    <TableHead className="text-right">90+ Days</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agingData?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          {item.oldestInvoiceDate && (
                            <div className="text-xs text-muted-foreground">
                              Oldest: {format(new Date(item.oldestInvoiceDate), "MMM dd, yyyy")}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{item.contactPerson}</div>
                          <div className="text-muted-foreground">{item.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.current > 0 && (
                          <span className="text-green-600">
                            {formatCurrency(item.current)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.days0to30 > 0 && (
                          <span className="text-blue-600">
                            {formatCurrency(item.days0to30)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.days31to60 > 0 && (
                          <span className="text-yellow-600">
                            {formatCurrency(item.days31to60)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.days61to90 > 0 && (
                          <span className="text-orange-600">
                            {formatCurrency(item.days61to90)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.days90Plus > 0 && (
                          <span className="text-red-600 font-medium">
                            {formatCurrency(item.days90Plus)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(item.total)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Mail className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Risk Analysis */}
          {summary.days90Plus > 0 && (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">High Risk (90+ days):</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(summary.days90Plus)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Medium Risk (61-90 days):</span>
                    <span className="font-medium text-orange-600">
                      {formatCurrency(summary.days61to90)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Low Risk (31-60 days):</span>
                    <span className="font-medium text-yellow-600">
                      {formatCurrency(summary.days31to60)}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="text-sm text-muted-foreground">
                    <p>
                      {formatPercentage(summary.days90Plus, summary.totalOutstanding)} of outstanding {reportType} 
                      are at high risk of becoming bad debt. Consider immediate collection actions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState } from "react";
import { format, subDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { 
  Calendar, 
  Download, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Activity,
  FileBarChart,
  Receipt,
  PiggyBank,
  Building,
  ShieldCheck,
  FolderOpen,
  BarChart3,
  Calculator,
  BookOpen,
  Target,
  Settings,
  Filter,
  ChevronRight,
  Eye,
  Users,
  Clock
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FinancialReportsRedesigned() {
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const reportCategories = [
    {
      id: "core-reports",
      title: "Core Financial Reports",
      description: "Essential financial statements and analysis",
      icon: BarChart3,
      color: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-600",
      count: 4,
      reports: [
        { 
          id: "balance-sheet", 
          title: "Balance Sheet", 
          icon: FileText, 
          description: "Assets, liabilities & equity as at specific date",
          lastGenerated: "2025-01-27",
          frequency: "Monthly"
        },
        { 
          id: "profit-loss", 
          title: "Profit & Loss Statement", 
          icon: TrendingUp, 
          description: "Revenue, expenses and net income analysis",
          lastGenerated: "2025-01-27", 
          frequency: "Monthly"
        },
        { 
          id: "cash-flow", 
          title: "Cash Flow Statement", 
          icon: Activity, 
          description: "Operating, investing & financing activities",
          lastGenerated: "2025-01-27",
          frequency: "Monthly"
        },
        { 
          id: "trial-balance", 
          title: "Trial Balance", 
          icon: Calculator, 
          description: "Account balance verification and summary",
          lastGenerated: "2025-01-27",
          frequency: "Monthly"
        }
      ]
    },
    {
      id: "analytical-reports", 
      title: "Analytical & Detail Reports",
      description: "Detailed analysis and operational insights",
      icon: Target,
      color: "bg-green-50 border-green-200",
      iconColor: "text-green-600",
      count: 4,
      reports: [
        { 
          id: "general-ledger", 
          title: "General Ledger", 
          icon: BookOpen, 
          description: "Detailed transaction history by account",
          lastGenerated: "2025-01-27",
          frequency: "Weekly"
        },
        { 
          id: "aged-receivables", 
          title: "Aged Receivables Analysis", 
          icon: FileBarChart, 
          description: "Outstanding customer balances aging",
          lastGenerated: "2025-01-27",
          frequency: "Weekly"
        },
        { 
          id: "aged-payables", 
          title: "Aged Payables Analysis", 
          icon: FileBarChart, 
          description: "Outstanding supplier balances aging",
          lastGenerated: "2025-01-27",
          frequency: "Weekly"
        },
        { 
          id: "expense-report", 
          title: "Expense Analysis Report", 
          icon: FolderOpen, 
          description: "Expense breakdown and category analysis",
          lastGenerated: "2025-01-27",
          frequency: "Monthly"
        }
      ]
    },
    {
      id: "compliance-reports",
      title: "Tax & Compliance Reports", 
      description: "VAT, tax and regulatory compliance reporting",
      icon: ShieldCheck,
      color: "bg-purple-50 border-purple-200",
      iconColor: "text-purple-600",
      count: 3,
      reports: [
        { 
          id: "vat-summary", 
          title: "VAT Summary & Analysis", 
          icon: Receipt, 
          description: "VAT input, output and reconciliation",
          lastGenerated: "2025-01-27",
          frequency: "Monthly"
        },
        { 
          id: "tax-summary", 
          title: "Tax Liability Summary", 
          icon: ShieldCheck, 
          description: "Complete tax obligations overview",
          lastGenerated: "2025-01-27",
          frequency: "Monthly"
        },
        { 
          id: "bank-reconciliation", 
          title: "Bank Reconciliation", 
          icon: PiggyBank, 
          description: "Bank statement vs book reconciliation",
          lastGenerated: "2025-01-27",
          frequency: "Monthly"
        }
      ]
    },
    {
      id: "asset-reports",
      title: "Asset & Investment Reports",
      description: "Fixed assets and investment tracking", 
      icon: Building,
      color: "bg-orange-50 border-orange-200",
      iconColor: "text-orange-600",
      count: 1,
      reports: [
        { 
          id: "fixed-asset-register", 
          title: "Fixed Asset Register", 
          icon: Building, 
          description: "Asset register with depreciation schedules",
          lastGenerated: "2025-01-27",
          frequency: "Quarterly"
        }
      ]
    }
  ];

  const handleReportClick = (reportId: string) => {
    setSelectedReport(reportId);
    // Here you would navigate to the specific report or open it in a modal
    console.log(`Opening report: ${reportId}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive financial analysis and reporting</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
            IFRS Compliant
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Report Settings
          </Button>
        </div>
      </div>

      {/* Report Parameters Section */}
      <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-900">Report Parameters</CardTitle>
          </div>
          <CardDescription className="text-blue-700">
            Select date range for financial reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-date" className="text-sm font-medium text-blue-800">From Date</Label>
              <Input
                id="from-date"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border-blue-200 focus:border-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-date" className="text-sm font-medium text-blue-800">To Date</Label>
              <Input
                id="to-date"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border-blue-200 focus:border-blue-400"
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Calendar className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Categories Grid */}
      <div className="grid gap-6">
        {reportCategories.map((category) => {
          const IconComponent = category.icon;
          
          return (
            <Card key={category.id} className={`${category.color} border-2 transition-all hover:shadow-md`}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                      <IconComponent className={`h-6 w-6 ${category.iconColor}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900">{category.title}</CardTitle>
                      <CardDescription className="text-gray-600 mt-1">
                        {category.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-white/70">
                    {category.count} reports
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid gap-3">
                  {category.reports.map((report) => {
                    const ReportIcon = report.icon;
                    
                    return (
                      <div
                        key={report.id}
                        onClick={() => handleReportClick(report.id)}
                        className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="p-2 rounded-md bg-gray-50 group-hover:bg-gray-100 transition-colors">
                              <ReportIcon className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {report.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>Last: {report.lastGenerated}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <span>{report.frequency}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats Footer */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">12</div>
              <div className="text-sm text-gray-600">Total Reports</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">4</div>
              <div className="text-sm text-gray-600">Report Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">Jan 2025</div>
              <div className="text-sm text-gray-600">Current Period</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">IFRS</div>
              <div className="text-sm text-gray-600">Compliant</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
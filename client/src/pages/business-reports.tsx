import { useState } from "react";
import { format, subDays } from "date-fns";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  PieChart,
  Target,
  Activity,
  Building,
  Settings,
  Filter,
  Download,
  Calendar,
  Eye,
  ChevronRight,
  Clock,
  Receipt,
  Truck,
  UserCheck,
  CreditCard,
  FileText,
  Calculator,
  Zap,
  Layers
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BusinessReports() {
  const [location, setLocation] = useLocation();
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  // Fetch real sales data
  const { data: salesData } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Fetch real product sales data
  const { data: productData } = useQuery({
    queryKey: ["/api/pos/products"],
  });

  // Fetch invoices data
  const { data: invoicesData } = useQuery({
    queryKey: ["/api/invoices"],
  });

  const reportCategories = [
    {
      id: "sales-analytics",
      title: "Sales Analytics & Performance",
      description: "Comprehensive sales analysis and performance metrics",
      icon: BarChart3,
      color: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-600",
      count: 8,
      reports: [
        { 
          id: "sales-by-product", 
          title: "Sales by Product", 
          icon: Package, 
          description: "Product performance analysis and sales trends",
          lastGenerated: "2025-01-27",
          frequency: "Daily"
        },
        { 
          id: "sales-by-category", 
          title: "Sales by Category", 
          icon: Layers, 
          description: "Category-wise sales performance and analysis",
          lastGenerated: "2025-01-27",
          frequency: "Daily"
        },
        { 
          id: "sales-by-region", 
          title: "Sales by Region", 
          icon: Building, 
          description: "Geographic sales distribution and regional analysis",
          lastGenerated: "2025-01-27",
          frequency: "Weekly"
        },
        { 
          id: "sales-by-rep", 
          title: "Sales by Representative", 
          icon: UserCheck, 
          description: "Sales rep performance and commission tracking",
          lastGenerated: "2025-01-27",
          frequency: "Weekly"
        },
        { 
          id: "sales-trends", 
          title: "Sales Trends Analysis", 
          icon: TrendingUp, 
          description: "Historical sales trends and forecasting",
          lastGenerated: "2025-01-27",
          frequency: "Weekly"
        },
        { 
          id: "sales-pipeline", 
          title: "Sales Pipeline Analysis", 
          icon: Target, 
          description: "Lead conversion and pipeline performance",
          lastGenerated: "2025-01-27",
          frequency: "Daily"
        },
        { 
          id: "quote-to-sale", 
          title: "Quote to Sale Analysis", 
          icon: FileText, 
          description: "Estimate conversion rates and quote analysis",
          lastGenerated: "2025-01-27",
          frequency: "Weekly"
        },
        { 
          id: "seasonal-analysis", 
          title: "Seasonal Sales Analysis", 
          icon: Calendar, 
          description: "Seasonal trends and cyclic performance patterns",
          lastGenerated: "2025-01-27",
          frequency: "Monthly"
        }
      ]
    },
    {
      id: "customer-analytics",
      title: "Customer Analytics & Reports",
      description: "Customer behavior, performance and relationship analytics",
      icon: Users,
      color: "bg-green-50 border-green-200",
      iconColor: "text-green-600",
      count: 6,
      reports: [
        { 
          id: "top-customers", 
          title: "Top Customers Report", 
          icon: Users, 
          description: "Highest revenue customers and customer rankings",
          lastGenerated: "2025-01-27",
          frequency: "Weekly"
        },
        { 
          id: "customer-sales-analysis", 
          title: "Customer Sales Analysis", 
          icon: BarChart3, 
          description: "Individual customer sales performance over time",
          lastGenerated: "2025-01-27",
          frequency: "Monthly"
        },
        { 
          id: "customer-ar-analysis", 
          title: "Customer A/R Analysis", 
          icon: Receipt, 
          description: "Customer accounts receivable and payment patterns",
          lastGenerated: "2025-01-27",
          frequency: "Weekly"
        },
        { 
          id: "customer-lifetime-value", 
          title: "Customer Lifetime Value", 
          icon: Target, 
          description: "CLV calculation and customer value analysis",
          lastGenerated: "2025-01-27",
          frequency: "Monthly"
        },
        { 
          id: "customer-acquisition", 
          title: "Customer Acquisition Reports", 
          icon: TrendingUp, 
          description: "New customer acquisition trends and sources",
          lastGenerated: "2025-01-27",
          frequency: "Monthly"
        },
        { 
          id: "customer-retention", 
          title: "Customer Retention Analysis", 
          icon: Activity, 
          description: "Customer retention rates and churn analysis",
          lastGenerated: "2025-01-27",
          frequency: "Quarterly"
        }
      ]
    },
    {
      id: "supplier-analytics",
      title: "Supplier & Purchase Analytics",
      description: "Supplier performance and purchasing analytics",
      icon: Truck,
      color: "bg-purple-50 border-purple-200",
      iconColor: "text-purple-600",
      count: 4,
      reports: [
        { 
          id: "supplier-performance", 
          title: "Supplier Performance Report", 
          icon: Truck, 
          description: "Supplier delivery, quality and cost analysis",
          lastGenerated: "2025-01-27",
          frequency: "Monthly"
        },
        { 
          id: "purchase-analysis", 
          title: "Purchase Analysis Report", 
          icon: ShoppingCart, 
          description: "Purchase trends, volumes and cost analysis",
          lastGenerated: "2025-01-27",
          frequency: "Weekly"
        },
        { 
          id: "supplier-ap-analysis", 
          title: "Supplier A/P Analysis", 
          icon: Receipt, 
          description: "Accounts payable aging and payment analysis",
          lastGenerated: "2025-01-27",
          frequency: "Weekly"
        },
        { 
          id: "cost-analysis", 
          title: "Cost Analysis Report", 
          icon: Calculator, 
          description: "Product cost trends and supplier cost comparison",
          lastGenerated: "2025-01-27",
          frequency: "Monthly"
        }
      ]
    },
    {
      id: "inventory-analytics",
      title: "Inventory Analytics & Valuation",
      description: "Stock movement, valuation and inventory optimization",
      icon: Package,
      color: "bg-orange-50 border-orange-200",
      iconColor: "text-orange-600",
      count: 5,
      reports: [
        { 
          id: "inventory-movement", 
          title: "Inventory Stock Movement", 
          icon: Activity, 
          description: "Stock in/out movements and transaction history",
          lastGenerated: "2025-01-27",
          frequency: "Daily"
        },
        { 
          id: "inventory-valuation", 
          title: "Inventory Valuation Report", 
          icon: DollarSign, 
          description: "Current inventory value and cost analysis",
          lastGenerated: "2025-01-27",
          frequency: "Monthly"
        },
        { 
          id: "stock-levels", 
          title: "Stock Levels Analysis", 
          icon: BarChart3, 
          description: "Current stock levels and reorder point analysis",
          lastGenerated: "2025-01-27",
          frequency: "Weekly"
        },
        { 
          id: "slow-moving-stock", 
          title: "Slow Moving Stock Report", 
          icon: Clock, 
          description: "Identify slow-moving and obsolete inventory",
          lastGenerated: "2025-01-27",
          frequency: "Monthly"
        },
        { 
          id: "inventory-turnover", 
          title: "Inventory Turnover Analysis", 
          icon: TrendingUp, 
          description: "Inventory turnover rates and efficiency metrics",
          lastGenerated: "2025-01-27",
          frequency: "Quarterly"
        }
      ]
    },
    {
      id: "profitability-analytics",
      title: "Profitability & Performance Analytics",
      description: "Profit analysis by segments, products and customers",
      icon: Target,
      color: "bg-emerald-50 border-emerald-200",
      iconColor: "text-emerald-600",
      count: 5,
      reports: [
        { 
          id: "profitability-by-product", 
          title: "Profitability by Product", 
          icon: Package, 
          description: "Product-wise profit margins and analysis",
          lastGenerated: "2025-01-27",
          frequency: "Monthly"
        },
        { 
          id: "profitability-by-customer", 
          title: "Profitability by Customer", 
          icon: Users, 
          description: "Customer profitability and margin analysis",
          lastGenerated: "2025-01-27",
          frequency: "Monthly"
        },
        { 
          id: "profitability-by-segment", 
          title: "Profitability by Segment", 
          icon: PieChart, 
          description: "Business segment and division profitability",
          lastGenerated: "2025-01-27",
          frequency: "Quarterly"
        },
        { 
          id: "gross-margin-analysis", 
          title: "Gross Margin Analysis", 
          icon: Calculator, 
          description: "Gross margin trends and performance analysis",
          lastGenerated: "2025-01-27",
          frequency: "Monthly"
        },
        { 
          id: "roi-analysis", 
          title: "ROI & Performance Analysis", 
          icon: Target, 
          description: "Return on investment and performance metrics",
          lastGenerated: "2025-01-27",
          frequency: "Quarterly"
        }
      ]
    },
    {
      id: "kpi-dashboards",
      title: "KPI Dashboards & Metrics",
      description: "Key performance indicators and business metrics",
      icon: Activity,
      color: "bg-indigo-50 border-indigo-200",
      iconColor: "text-indigo-600",
      count: 6,
      reports: [
        { 
          id: "executive-dashboard", 
          title: "Executive KPI Dashboard", 
          icon: Activity, 
          description: "High-level KPIs and executive summary metrics",
          lastGenerated: "2025-01-27",
          frequency: "Daily"
        },
        { 
          id: "sales-kpis", 
          title: "Sales KPI Dashboard", 
          icon: BarChart3, 
          description: "Sales performance KPIs and metrics",
          lastGenerated: "2025-01-27",
          frequency: "Daily"
        },
        { 
          id: "financial-kpis", 
          title: "Financial KPI Dashboard", 
          icon: DollarSign, 
          description: "Financial performance and health metrics",
          lastGenerated: "2025-01-27",
          frequency: "Daily"
        },
        { 
          id: "operational-kpis", 
          title: "Operational KPI Dashboard", 
          icon: Settings, 
          description: "Operational efficiency and performance metrics",
          lastGenerated: "2025-01-27",
          frequency: "Daily"
        },
        { 
          id: "days-sales-outstanding", 
          title: "Days Sales Outstanding", 
          icon: Clock, 
          description: "DSO analysis and receivables performance",
          lastGenerated: "2025-01-27",
          frequency: "Weekly"
        },
        { 
          id: "gross-margin-percentage", 
          title: "Gross Margin % Analysis", 
          icon: Calculator, 
          description: "Gross margin percentage trends and analysis",
          lastGenerated: "2025-01-27",
          frequency: "Weekly"
        }
      ]
    },
    {
      id: "budget-analytics",
      title: "Budget & Planning Analytics",
      description: "Budget vs actual analysis and planning reports",
      icon: Calculator,
      color: "bg-rose-50 border-rose-200",
      iconColor: "text-rose-600",
      count: 4,
      reports: [
        { 
          id: "budget-vs-actual", 
          title: "Budget vs Actual Report", 
          icon: Calculator, 
          description: "Budget performance and variance analysis",
          lastGenerated: "2025-01-27",
          frequency: "Monthly"
        },
        { 
          id: "variance-analysis", 
          title: "Variance Analysis Report", 
          icon: BarChart3, 
          description: "Detailed variance analysis and explanations",
          lastGenerated: "2025-01-27",
          frequency: "Monthly"
        },
        { 
          id: "forecast-analysis", 
          title: "Forecast vs Actual", 
          icon: TrendingUp, 
          description: "Forecast accuracy and trending analysis",
          lastGenerated: "2025-01-27",
          frequency: "Monthly"
        },
        { 
          id: "planning-reports", 
          title: "Planning & Projections", 
          icon: Target, 
          description: "Future planning and projection reports",
          lastGenerated: "2025-01-27",
          frequency: "Quarterly"
        }
      ]
    },
    {
      id: "pos-analytics",
      title: "POS & Retail Analytics",
      description: "Point of sale analytics and retail performance",
      icon: CreditCard,
      color: "bg-cyan-50 border-cyan-200",
      iconColor: "text-cyan-600",
      count: 5,
      reports: [
        { 
          id: "pos-sales-summary", 
          title: "POS Sales Summary", 
          icon: CreditCard, 
          description: "Daily POS sales and transaction summary",
          lastGenerated: "2025-01-27",
          frequency: "Daily"
        },
        { 
          id: "pos-cash-up", 
          title: "POS Cash-Up Reports", 
          icon: DollarSign, 
          description: "Cash reconciliation and till reports",
          lastGenerated: "2025-01-27",
          frequency: "Daily"
        },
        { 
          id: "pos-shift-summary", 
          title: "POS Shift Summary", 
          icon: Clock, 
          description: "Shift-wise sales and performance analysis",
          lastGenerated: "2025-01-27",
          frequency: "Daily"
        },
        { 
          id: "pos-product-performance", 
          title: "POS Product Performance", 
          icon: Package, 
          description: "Product sales performance through POS",
          lastGenerated: "2025-01-27",
          frequency: "Weekly"
        },
        { 
          id: "pos-payment-methods", 
          title: "POS Payment Methods", 
          icon: Receipt, 
          description: "Payment method analysis and trends",
          lastGenerated: "2025-01-27",
          frequency: "Weekly"
        }
      ]
    },
    {
      id: "custom-reports",
      title: "Custom Report Builder",
      description: "Build custom reports for ad-hoc analysis",
      icon: Zap,
      color: "bg-amber-50 border-amber-200",
      iconColor: "text-amber-600",
      count: 3,
      reports: [
        { 
          id: "custom-report-builder", 
          title: "Custom Report Builder", 
          icon: Zap, 
          description: "Build custom reports with drag-and-drop interface",
          lastGenerated: "Never",
          frequency: "On-demand"
        },
        { 
          id: "saved-custom-reports", 
          title: "Saved Custom Reports", 
          icon: FileText, 
          description: "Access previously saved custom reports",
          lastGenerated: "2025-01-27",
          frequency: "On-demand"
        },
        { 
          id: "report-templates", 
          title: "Report Templates", 
          icon: Layers, 
          description: "Pre-built report templates for quick analysis",
          lastGenerated: "2025-01-27",
          frequency: "On-demand"
        }
      ]
    }
  ];

  const handleReportClick = (reportId: string) => {
    setSelectedReport(reportId);
    console.log(`Opening business report: ${reportId}`);
    
    // Navigate to appropriate report page based on report ID
    switch(reportId) {
      case 'sales-by-product':
        setLocation('/financial-reports?tab=sales&report=products');
        break;
      case 'sales-by-category':
        setLocation('/financial-reports?tab=sales&report=categories');
        break;
      case 'sales-by-region':
        setLocation('/financial-reports?tab=sales&report=regions');
        break;
      case 'sales-by-rep':
        setLocation('/financial-reports?tab=sales&report=representatives');
        break;
      case 'customer-acquisition':
        setLocation('/customers?view=analytics');
        break;
      case 'inventory-turnover':
        setLocation('/inventory?view=reports');
        break;
      case 'profit-loss':
        setLocation('/financial-reports?tab=statements&report=profit-loss');
        break;
      case 'cash-flow':
        setLocation('/financial-reports?tab=statements&report=cash-flow');
        break;
      default:
        setLocation('/financial-reports');
    }
  };

  const handleEyeClick = (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    // Show quick preview or modal with report data
    console.log(`Quick preview for report: ${reportId}`);
    handleReportClick(reportId); // For now, navigate to full report
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive operational and management analytics</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
            Real-time Analytics
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
            Select date range and filters for business reports
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
                Export Reports
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
                                  <Activity className="h-3 w-3" />
                                  <span>{report.frequency}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 opacity-70 group-hover:opacity-100 transition-opacity hover:bg-blue-100" 
                              onClick={(e) => handleEyeClick(report.id, e)}
                              title="Quick Preview"
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
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
              <div className="text-2xl font-bold text-gray-900">
                {reportCategories.reduce((total, category) => total + category.reports.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Reports</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{reportCategories.length}</div>
              <div className="text-sm text-gray-600">Report Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {salesData ? 'Live' : 'Real-time'}
              </div>
              <div className="text-sm text-gray-600">Data Updates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {invoicesData ? invoicesData.length : 0}
              </div>
              <div className="text-sm text-gray-600">Active Invoices</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
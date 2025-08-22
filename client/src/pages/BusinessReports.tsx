import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, ChevronDown, ChevronRight, Calendar, TrendingUp, Users, ShoppingCart, Package, BarChart3, Target, PieChart, Settings, Sparkles, DollarSign, TrendingDown } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface ReportItem {
  id: string;
  name: string;
  description: string;
  lastUpdated: string;
  frequency: string;
  icon: React.ComponentType<{ className?: string }>;
  data?: any;
}

interface ReportSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  reports: ReportItem[];
}

const BusinessReports = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['sales']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const reportSections: ReportSection[] = [
    {
      id: 'sales',
      title: 'Sales Analytics & Performance',
      description: 'Comprehensive sales analysis and performance metrics',
      icon: TrendingUp,
      color: 'bg-blue-50 border-blue-200',
      reports: [
        {
          id: 'sales-by-product',
          name: 'Sales by Product',
          description: 'Product performance analysis and sales trends',
          lastUpdated: '2025-01-27',
          frequency: 'Daily',
          icon: Package,
          data: { totalProducts: 156, topProduct: 'Professional Services', revenue: 'R124,500' }
        },
        {
          id: 'sales-by-category',
          name: 'Sales by Category',
          description: 'Category-wise sales performance and analysis',
          lastUpdated: '2025-01-27',
          frequency: 'Daily',
          icon: BarChart3
        },
        {
          id: 'sales-by-region',
          name: 'Sales by Region',
          description: 'Geographic sales distribution and regional analysis',
          lastUpdated: '2025-01-27',
          frequency: 'Weekly',
          icon: Target
        },
        {
          id: 'sales-by-rep',
          name: 'Sales by Representative',
          description: 'Sales rep performance and commission tracking',
          lastUpdated: '2025-01-27',
          frequency: 'Weekly',
          icon: Users
        },
        {
          id: 'sales-trends',
          name: 'Sales Trends Analysis',
          description: 'Historical sales trends and forecasting',
          lastUpdated: '2025-01-27',
          frequency: 'Weekly',
          icon: TrendingUp
        },
        {
          id: 'sales-pipeline',
          name: 'Sales Pipeline Analysis',
          description: 'Lead conversion and pipeline performance',
          lastUpdated: '2025-01-27',
          frequency: 'Daily',
          icon: Target
        },
        {
          id: 'quote-to-sale',
          name: 'Quote to Sale Analysis',
          description: 'Estimate conversion rates and quote analysis',
          lastUpdated: '2025-01-27',
          frequency: 'Weekly',
          icon: PieChart
        },
        {
          id: 'seasonal-sales',
          name: 'Seasonal Sales Analysis',
          description: 'Seasonal trends and cyclic performance patterns',
          lastUpdated: '2025-01-27',
          frequency: 'Monthly',
          icon: Calendar
        }
      ]
    },
    {
      id: 'customers',
      title: 'Customer Analytics & Reports',
      description: 'Customer behavior, performance and relationship analytics',
      icon: Users,
      color: 'bg-green-50 border-green-200',
      reports: [
        {
          id: 'top-customers',
          name: 'Top Customers Report',
          description: 'Highest revenue customers and customer rankings',
          lastUpdated: '2025-01-27',
          frequency: 'Weekly',
          icon: Users
        },
        {
          id: 'customer-sales',
          name: 'Customer Sales Analysis',
          description: 'Individual customer sales performance over time',
          lastUpdated: '2025-01-27',
          frequency: 'Monthly',
          icon: TrendingUp
        },
        {
          id: 'customer-ar',
          name: 'Customer A/R Analysis',
          description: 'Customer accounts receivable and payment patterns',
          lastUpdated: '2025-01-27',
          frequency: 'Weekly',
          icon: BarChart3
        },
        {
          id: 'customer-lifetime',
          name: 'Customer Lifetime Value',
          description: 'CLV calculation and customer value analysis',
          lastUpdated: '2025-01-27',
          frequency: 'Monthly',
          icon: Target
        },
        {
          id: 'customer-acquisition',
          name: 'Customer Acquisition Reports',
          description: 'New customer acquisition trends and sources',
          lastUpdated: '2025-01-27',
          frequency: 'Monthly',
          icon: Users
        },
        {
          id: 'customer-retention',
          name: 'Customer Retention Analysis',
          description: 'Customer retention rates and churn analysis',
          lastUpdated: '2025-01-27',
          frequency: 'Quarterly',
          icon: TrendingUp
        }
      ]
    },
    {
      id: 'suppliers',
      title: 'Supplier & Purchase Analytics',
      description: 'Supplier performance and purchasing analytics',
      icon: ShoppingCart,
      color: 'bg-purple-50 border-purple-200',
      reports: [
        {
          id: 'supplier-performance',
          name: 'Supplier Performance Report',
          description: 'Supplier delivery, quality and cost analysis',
          lastUpdated: '2025-01-27',
          frequency: 'Monthly',
          icon: Target
        },
        {
          id: 'purchase-analysis',
          name: 'Purchase Analysis Report',
          description: 'Purchase trends, volumes and cost analysis',
          lastUpdated: '2025-01-27',
          frequency: 'Weekly',
          icon: ShoppingCart
        },
        {
          id: 'supplier-ap',
          name: 'Supplier A/P Analysis',
          description: 'Accounts payable aging and payment analysis',
          lastUpdated: '2025-01-27',
          frequency: 'Weekly',
          icon: BarChart3
        },
        {
          id: 'cost-analysis',
          name: 'Cost Analysis Report',
          description: 'Product cost trends and supplier cost comparison',
          lastUpdated: '2025-01-27',
          frequency: 'Monthly',
          icon: PieChart
        }
      ]
    },
    {
      id: 'inventory',
      title: 'Inventory Analytics & Valuation',
      description: 'Stock movement, valuation and inventory optimization',
      icon: Package,
      color: 'bg-orange-50 border-orange-200',
      reports: [
        {
          id: 'stock-movement',
          name: 'Inventory Stock Movement',
          description: 'Stock in/out movements and transaction history',
          lastUpdated: '2025-01-27',
          frequency: 'Daily',
          icon: TrendingUp
        },
        {
          id: 'inventory-valuation',
          name: 'Inventory Valuation Report',
          description: 'Current inventory value and cost analysis',
          lastUpdated: '2025-01-27',
          frequency: 'Monthly',
          icon: Target
        },
        {
          id: 'stock-levels',
          name: 'Stock Levels Analysis',
          description: 'Current stock levels and reorder point analysis',
          lastUpdated: '2025-01-27',
          frequency: 'Weekly',
          icon: BarChart3
        },
        {
          id: 'slow-moving',
          name: 'Slow Moving Stock Report',
          description: 'Identify slow-moving and obsolete inventory',
          lastUpdated: '2025-01-27',
          frequency: 'Monthly',
          icon: Package
        },
        {
          id: 'inventory-turnover',
          name: 'Inventory Turnover Analysis',
          description: 'Inventory turnover rates and efficiency metrics',
          lastUpdated: '2025-01-27',
          frequency: 'Quarterly',
          icon: TrendingUp
        }
      ]
    },
    {
      id: 'profitability',
      title: 'Profitability & Performance Analytics',
      description: 'Profit analysis by segments, products and customers',
      icon: Target,
      color: 'bg-green-50 border-green-200',
      reports: [
        {
          id: 'profit-by-product',
          name: 'Profitability by Product',
          description: 'Product-wise profit margins and analysis',
          lastUpdated: '2025-01-27',
          frequency: 'Monthly',
          icon: Target
        },
        {
          id: 'profit-by-customer',
          name: 'Profitability by Customer',
          description: 'Customer profitability and margin analysis',
          lastUpdated: '2025-01-27',
          frequency: 'Monthly',
          icon: Users
        },
        {
          id: 'profit-by-segment',
          name: 'Profitability by Segment',
          description: 'Business segment and division profitability',
          lastUpdated: '2025-01-27',
          frequency: 'Quarterly',
          icon: PieChart
        },
        {
          id: 'gross-margin',
          name: 'Gross Margin Analysis',
          description: 'Gross margin trends and performance analysis',
          lastUpdated: '2025-01-27',
          frequency: 'Monthly',
          icon: BarChart3
        },
        {
          id: 'roi-performance',
          name: 'ROI & Performance Analysis',
          description: 'Return on investment and performance metrics',
          lastUpdated: '2025-01-27',
          frequency: 'Quarterly',
          icon: TrendingUp
        }
      ]
    },
    {
      id: 'kpis',
      title: 'KPI Dashboards & Metrics',
      description: 'Key performance indicators and business metrics',
      icon: BarChart3,
      color: 'bg-indigo-50 border-indigo-200',
      reports: [
        {
          id: 'executive-kpi',
          name: 'Executive KPI Dashboard',
          description: 'High-level KPIs and executive summary metrics',
          lastUpdated: '2025-01-27',
          frequency: 'Daily',
          icon: Target
        },
        {
          id: 'sales-kpi',
          name: 'Sales KPI Dashboard',
          description: 'Sales performance KPIs and metrics',
          lastUpdated: '2025-01-27',
          frequency: 'Daily',
          icon: TrendingUp
        },
        {
          id: 'financial-kpi',
          name: 'Financial KPI Dashboard',
          description: 'Financial performance and health metrics',
          lastUpdated: '2025-01-27',
          frequency: 'Daily',
          icon: PieChart
        },
        {
          id: 'operational-kpi',
          name: 'Operational KPI Dashboard',
          description: 'Operational efficiency and performance metrics',
          lastUpdated: '2025-01-27',
          frequency: 'Daily',
          icon: Settings
        },
        {
          id: 'dso-analysis',
          name: 'Days Sales Outstanding',
          description: 'DSO analysis and receivables performance',
          lastUpdated: '2025-01-27',
          frequency: 'Weekly',
          icon: Calendar
        },
        {
          id: 'gross-margin-pct',
          name: 'Gross Margin % Analysis',
          description: 'Gross margin percentage trends and analysis',
          lastUpdated: '2025-01-27',
          frequency: 'Weekly',
          icon: BarChart3
        }
      ]
    },
    {
      id: 'budget',
      title: 'Budget & Planning Analytics',
      description: 'Budget vs actual analysis and planning reports',
      icon: PieChart,
      color: 'bg-pink-50 border-pink-200',
      reports: [
        {
          id: 'budget-actual',
          name: 'Budget vs Actual Report',
          description: 'Budget performance and variance analysis',
          lastUpdated: '2025-01-27',
          frequency: 'Monthly',
          icon: BarChart3
        },
        {
          id: 'variance-analysis',
          name: 'Variance Analysis Report',
          description: 'Detailed variance analysis and explanations',
          lastUpdated: '2025-01-27',
          frequency: 'Monthly',
          icon: TrendingUp
        },
        {
          id: 'forecast-actual',
          name: 'Forecast vs Actual',
          description: 'Forecast accuracy and trending analysis',
          lastUpdated: '2025-01-27',
          frequency: 'Monthly',
          icon: Target
        },
        {
          id: 'planning-projections',
          name: 'Planning & Projections',
          description: 'Future planning and projection reports',
          lastUpdated: '2025-01-27',
          frequency: 'Quarterly',
          icon: Calendar
        }
      ]
    },
    {
      id: 'pos',
      title: 'POS & Retail Analytics',
      description: 'Point of sale analytics and retail performance',
      icon: ShoppingCart,
      color: 'bg-cyan-50 border-cyan-200',
      reports: [
        {
          id: 'pos-sales',
          name: 'POS Sales Summary',
          description: 'Daily POS sales and transaction summary',
          lastUpdated: '2025-01-27',
          frequency: 'Daily',
          icon: ShoppingCart
        },
        {
          id: 'pos-cashup',
          name: 'POS Cash-Up Reports',
          description: 'Cash reconciliation and till reports',
          lastUpdated: '2025-01-27',
          frequency: 'Daily',
          icon: Target
        },
        {
          id: 'pos-shift',
          name: 'POS Shift Summary',
          description: 'Shift-wise sales and performance analysis',
          lastUpdated: '2025-01-27',
          frequency: 'Daily',
          icon: Calendar
        },
        {
          id: 'pos-product',
          name: 'POS Product Performance',
          description: 'Product sales performance through POS',
          lastUpdated: '2025-01-27',
          frequency: 'Weekly',
          icon: Package
        },
        {
          id: 'pos-payment',
          name: 'POS Payment Methods',
          description: 'Payment method analysis and trends',
          lastUpdated: '2025-01-27',
          frequency: 'Weekly',
          icon: PieChart
        }
      ]
    },
    {
      id: 'custom',
      title: 'Custom Report Builder',
      description: 'Build custom reports for ad-hoc analysis',
      icon: Sparkles,
      color: 'bg-yellow-50 border-yellow-200',
      reports: [
        {
          id: 'custom-builder',
          name: 'Custom Report Builder',
          description: 'Build custom reports with drag-and-drop interface',
          lastUpdated: 'Never',
          frequency: 'On-demand',
          icon: Settings
        },
        {
          id: 'saved-reports',
          name: 'Saved Custom Reports',
          description: 'Access previously saved custom reports',
          lastUpdated: '2025-01-27',
          frequency: 'On-demand',
          icon: Target
        },
        {
          id: 'report-templates',
          name: 'Report Templates',
          description: 'Pre-built report templates for quick analysis',
          lastUpdated: '2025-01-27',
          frequency: 'On-demand',
          icon: Package
        }
      ]
    }
  ];

  const getReportApiEndpoint = (reportId: string) => {
    if (['sales-by-product', 'sales-by-category', 'sales-by-region', 'sales-by-rep', 'sales-trends', 'sales-pipeline', 'quote-to-sale', 'seasonal-sales'].includes(reportId)) {
      return `/api/business-reports/sales-analytics/${reportId}`;
    }
    if (['top-customers', 'customer-sales', 'customer-ar', 'customer-lifetime', 'customer-acquisition', 'customer-retention'].includes(reportId)) {
      return `/api/business-reports/customer-analytics/${reportId}`;
    }
    if (['inventory-valuation', 'slow-moving', 'stock-movement', 'stock-levels', 'inventory-turnover'].includes(reportId)) {
      return `/api/business-reports/inventory-analytics/${reportId}`;
    }
    if (['supplier-performance', 'purchase-analysis', 'supplier-ap', 'cost-analysis'].includes(reportId)) {
      return `/api/business-reports/supplier-analytics/${reportId}`;
    }
    if (['profit-by-product', 'profit-by-customer', 'profit-by-segment', 'gross-margin', 'roi-performance'].includes(reportId)) {
      return `/api/business-reports/profitability/${reportId}`;
    }
    return null;
  };

  const ReportModal = ({ report }: { report: ReportItem }) => {
    const apiEndpoint = getReportApiEndpoint(report.id);
    
    const { data: reportData, isLoading, error } = useQuery({
      queryKey: ['business-report', report.id],
      queryFn: async () => {
        if (!apiEndpoint) return null;
        const token = localStorage.getItem('authToken');
        const sessionToken = localStorage.getItem('sessionToken');
        const companyId = localStorage.getItem('activeCompanyId');
        
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        if (sessionToken) {
          headers['X-Session-Token'] = sessionToken;
        }
        
        if (companyId) {
          headers['X-Company-ID'] = companyId;
        }
        
        const response = await fetch(apiEndpoint, {
          credentials: 'include',
          headers,
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch report data: ${response.status} ${errorText}`);
        }
        return response.json();
      },
      enabled: !!apiEndpoint,
    });

    const renderReportData = () => {
      if (isLoading) {
        return (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        );
      }

      if (error) {
        return (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <p className="text-red-600 font-medium">Error loading report data</p>
            <p className="text-red-500 text-sm">Please try again later</p>
          </div>
        );
      }

      if (!reportData?.data || reportData.data.length === 0) {
        return (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="font-medium text-gray-600">No data available</p>
            <p className="text-sm text-gray-500">There's no data for this report yet</p>
          </div>
        );
      }

      const data = reportData.data;
      const reportType = reportData.reportType;

      // Render different visualizations based on report type
      switch (reportType) {
        case 'sales-by-product':
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded border">
                  <p className="text-xs text-blue-600 uppercase font-medium">Total Revenue</p>
                  <p className="text-lg font-bold text-blue-800">R{data.reduce((sum: number, item: any) => sum + parseFloat(item.totalRevenue || 0), 0).toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-3 rounded border">
                  <p className="text-xs text-green-600 uppercase font-medium">Products Sold</p>
                  <p className="text-lg font-bold text-green-800">{data.length}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded border">
                  <p className="text-xs text-orange-600 uppercase font-medium">Avg Order Value</p>
                  <p className="text-lg font-bold text-orange-800">R{(data.reduce((sum: number, item: any) => sum + parseFloat(item.avgPrice || 0), 0) / data.length).toLocaleString()}</p>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {data.slice(0, 10).map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white border rounded">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-500">{item.totalQuantity} units sold</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">R{parseFloat(item.totalRevenue).toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{item.invoiceCount} invoices</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );

        case 'top-customers':
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded border">
                  <p className="text-xs text-blue-600 uppercase font-medium">Total Revenue</p>
                  <p className="text-lg font-bold text-blue-800">R{data.reduce((sum: number, item: any) => sum + parseFloat(item.totalRevenue || 0), 0).toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-3 rounded border">
                  <p className="text-xs text-green-600 uppercase font-medium">Active Customers</p>
                  <p className="text-lg font-bold text-green-800">{data.length}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded border">
                  <p className="text-xs text-orange-600 uppercase font-medium">Avg Customer Value</p>
                  <p className="text-lg font-bold text-orange-800">R{(data.reduce((sum: number, item: any) => sum + parseFloat(item.avgInvoiceValue || 0), 0) / data.length).toLocaleString()}</p>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {data.slice(0, 15).map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white border rounded">
                      <div>
                        <p className="font-medium">{item.customerName}</p>
                        <p className="text-sm text-gray-500">{item.customerEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">R{parseFloat(item.totalRevenue).toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{item.invoiceCount} invoices</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );

        case 'inventory-valuation':
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded border">
                  <p className="text-xs text-blue-600 uppercase font-medium">Total Stock Value</p>
                  <p className="text-lg font-bold text-blue-800">R{data.reduce((sum: number, item: any) => sum + parseFloat(item.totalValue || 0), 0).toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-3 rounded border">
                  <p className="text-xs text-green-600 uppercase font-medium">Total Products</p>
                  <p className="text-lg font-bold text-green-800">{data.length}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded border">
                  <p className="text-xs text-orange-600 uppercase font-medium">Potential Revenue</p>
                  <p className="text-lg font-bold text-orange-800">R{data.reduce((sum: number, item: any) => sum + parseFloat(item.potentialRevenue || 0), 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {data.slice(0, 10).map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white border rounded">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-500">{item.categoryName || 'No category'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">R{parseFloat(item.totalValue).toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{item.currentStock} units @ R{parseFloat(item.costPrice).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );

        case 'slow-moving':
          return (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
                <p className="text-yellow-800 font-medium">⚠️ Slow-Moving Stock Alert</p>
                <p className="text-yellow-700 text-sm">Products with no sales in the last 90+ days</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {data.slice(0, 10).map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white border rounded">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-500">{item.categoryName || 'No category'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">R{parseFloat(item.totalValue).toLocaleString()}</p>
                        <p className="text-sm text-red-500">
                          {item.daysSinceLastSale ? `${Math.floor(item.daysSinceLastSale)} days since last sale` : 'Never sold'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );

        case 'supplier-performance':
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded border">
                  <p className="text-xs text-blue-600 uppercase font-medium">Total Purchases</p>
                  <p className="text-lg font-bold text-blue-800">R{data.reduce((sum: number, item: any) => sum + parseFloat(item.totalPurchases || 0), 0).toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-3 rounded border">
                  <p className="text-xs text-green-600 uppercase font-medium">Active Suppliers</p>
                  <p className="text-lg font-bold text-green-800">{data.length}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded border">
                  <p className="text-xs text-orange-600 uppercase font-medium">Avg Order Value</p>
                  <p className="text-lg font-bold text-orange-800">R{(data.reduce((sum: number, item: any) => sum + parseFloat(item.avgOrderValue || 0), 0) / data.length).toLocaleString()}</p>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {data.slice(0, 10).map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white border rounded">
                      <div>
                        <p className="font-medium">{item.supplierName}</p>
                        <p className="text-sm text-gray-500">{item.supplierEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-purple-600">R{parseFloat(item.totalPurchases).toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{item.orderCount} orders</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );

        case 'profit-by-product':
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-green-50 p-3 rounded border">
                  <p className="text-xs text-green-600 uppercase font-medium">Total Gross Profit</p>
                  <p className="text-lg font-bold text-green-800">R{data.reduce((sum: number, item: any) => sum + parseFloat(item.grossProfit || 0), 0).toLocaleString()}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded border">
                  <p className="text-xs text-blue-600 uppercase font-medium">Total Revenue</p>
                  <p className="text-lg font-bold text-blue-800">R{data.reduce((sum: number, item: any) => sum + parseFloat(item.totalRevenue || 0), 0).toLocaleString()}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded border">
                  <p className="text-xs text-orange-600 uppercase font-medium">Avg Margin</p>
                  <p className="text-lg font-bold text-orange-800">{(data.reduce((sum: number, item: any) => sum + parseFloat(item.grossMargin || 0), 0) / data.length).toFixed(1)}%</p>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {data.slice(0, 10).map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white border rounded">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-500">{item.unitsSold} units sold</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">R{parseFloat(item.grossProfit).toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{parseFloat(item.grossMargin).toFixed(1)}% margin</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );

        default:
          return (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="font-medium text-gray-600">Report Data Available</p>
              <p className="text-sm text-gray-500">{data.length} records found</p>
            </div>
          );
      }
    };

    return (
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <report.icon className="h-5 w-5" />
            {report.name}
          </DialogTitle>
          <DialogDescription>{report.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Last Updated: {report.lastUpdated}
            </div>
            <Badge variant="outline">{report.frequency}</Badge>
            {reportData && (
              <Badge variant="secondary">
                {reportData.data?.length || 0} records
              </Badge>
            )}
          </div>
          
          {renderReportData()}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline">Export PDF</Button>
            <Button variant="outline">Export Excel</Button>
            <Button>Generate Report</Button>
          </div>
        </div>
      </DialogContent>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Reports</h1>
          <p className="text-gray-600">Comprehensive business analytics and performance insights</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">46</p>
                <p className="text-sm text-gray-600">Total Reports</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">9</p>
                <p className="text-sm text-gray-600">Report Categories</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">Live</p>
                <p className="text-sm text-gray-600">Data Updates</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">49</p>
                <p className="text-sm text-gray-600">Active Invoices</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Sections */}
        <div className="space-y-4">
          {reportSections.map((section) => (
            <Card key={section.id} className={section.color}>
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <section.icon className="h-6 w-6 text-gray-700" />
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{section.reports.length} reports</Badge>
                    {expandedSections.includes(section.id) ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </div>
                </div>
              </CardHeader>
              
              {expandedSections.includes(section.id) && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {section.reports.map((report) => (
                      <div key={report.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <report.icon className="h-5 w-5 text-gray-600" />
                            <div>
                              <h4 className="font-medium text-gray-900">{report.name}</h4>
                              <p className="text-sm text-gray-600">{report.description}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                <span>Last: {report.lastUpdated}</span>
                                <span>• {report.frequency}</span>
                              </div>
                            </div>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <ReportModal report={report} />
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusinessReports;
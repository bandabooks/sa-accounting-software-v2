import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, Download, FileText, Calendar, TrendingUp, X, Eye, Settings, Receipt, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { generateVatSummaryReport, handleGenerateReport as handleVatReportGeneration, isValidDate } from '@/utils/vatReportGenerator';

interface VATReportsProps {
  companyId: number;
}

const VATReports: React.FC<VATReportsProps> = ({ companyId }) => {
  const [selectedReport, setSelectedReport] = useState('summary');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Fetch VAT settings to get the company's VAT category and period configuration
  const { data: vatSettings } = useQuery({
    queryKey: [`/api/companies/${companyId}/vat-settings`],
  });

  // SARS VAT Categories for period calculation
  const SARS_VAT_CATEGORIES = [
    {
      value: "A",
      label: "Category A – Bi-Monthly (Even Months)",
      periodMonths: 2,
      submissionCycle: "Even months (Jan-Feb, Mar-Apr, May-Jun, Jul-Aug, Sep-Oct, Nov-Dec)"
    },
    {
      value: "B", 
      label: "Category B – Bi-Monthly (Odd Months)",
      periodMonths: 2,
      submissionCycle: "Odd months (Feb-Mar, Apr-May, Jun-Jul, Aug-Sep, Oct-Nov, Dec-Jan)"
    },
    {
      value: "C",
      label: "Category C – Monthly",
      periodMonths: 1,
      submissionCycle: "Monthly (Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec)"
    },
    {
      value: "D",
      label: "Category D – Six-Monthly (Small-scale farmers only)",
      periodMonths: 6,
      submissionCycle: "Bi-annual (Feb-Jul, Aug-Jan)"
    },
    {
      value: "E",
      label: "Category E – Annual (Fixed property or occasional supply vendors)",
      periodMonths: 12,
      submissionCycle: "Annual (Jan-Dec)"
    }
  ];

  // Month names for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate VAT periods based on company's VAT category
  const availablePeriods = useMemo(() => {
    if (!vatSettings) return [];

    const vatCategory = (vatSettings as any)?.vatCategory || 'A';
    const vatStartMonth = (vatSettings as any)?.vatStartMonth || 1;
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // getMonth() returns 0-11, we need 1-12
    const category = SARS_VAT_CATEGORIES.find(cat => cat.value === vatCategory);
    
    if (!category) return [];

    const periods = [];
    const periodMonths = category.periodMonths;

    // Helper function to check if a period is valid (not in the future)
    const isPeriodValid = (year: number, startMonth: number) => {
      // Allow all past years
      if (year < currentYear) return true;
      
      // For current year, only allow periods that have started
      if (year === currentYear) {
        return startMonth <= currentMonth;
      }
      
      // Don't allow future years
      return false;
    };

    // Generate periods for past 2 years and current year only
    for (let year = currentYear - 2; year <= currentYear; year++) {
      if (periodMonths === 1) {
        // Monthly periods
        for (let month = 1; month <= 12; month++) {
          // Only include valid periods (not in the future)
          if (!isPeriodValid(year, month)) continue;
          
          const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
          // Get the last day of the month using more reliable method
          const lastDayOfMonth = new Date(year, month, 0).getDate();
          const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDayOfMonth.toString().padStart(2, '0')}`;
          periods.push({
            label: `${monthNames[month - 1]} ${year}`,
            value: `${year}-${month}`,
            startDate,
            endDate
          });
        }
      } else if (periodMonths === 2) {
        // Bi-monthly periods
        const startOffset = vatCategory === 'B' ? 1 : 0; // Odd vs Even months
        for (let cycle = 0; cycle < 6; cycle++) {
          const startMonth = (cycle * 2) + 1 + startOffset;
          const endMonth = startMonth + 1;
          
          if (startMonth <= 12 && endMonth <= 12) {
            // Only include valid periods (not in the future)
            if (!isPeriodValid(year, startMonth)) continue;
            
            const startDate = `${year}-${startMonth.toString().padStart(2, '0')}-01`;
            // Get the last day of the end month using more reliable method
            const lastDayOfEndMonth = new Date(year, endMonth, 0).getDate();
            const endDate = `${year}-${endMonth.toString().padStart(2, '0')}-${lastDayOfEndMonth.toString().padStart(2, '0')}`;
            periods.push({
              label: `${monthNames[startMonth - 1]}–${monthNames[endMonth - 1]} ${year}`,
              value: `${year}-${startMonth}-${endMonth}`,
              startDate,
              endDate
            });
          }
        }
      } else if (periodMonths === 6) {
        // Six-monthly periods
        if (isPeriodValid(year, 1)) {
          periods.push({
            label: `Jan–Jun ${year}`,
            value: `${year}-1-6`,
            startDate: `${year}-01-01`,
            endDate: `${year}-06-30`
          });
        }
        if (isPeriodValid(year, 7)) {
          periods.push({
            label: `Jul–Dec ${year}`,
            value: `${year}-7-12`,
            startDate: `${year}-07-01`,
            endDate: `${year}-12-31`
          });
        }
      } else if (periodMonths === 12) {
        // Annual periods
        if (isPeriodValid(year, 1)) {
          periods.push({
            label: `${year}`,
            value: `${year}`,
            startDate: `${year}-01-01`,
            endDate: `${year}-12-31`
          });
        }
      }
    }

    // Sort periods in reverse chronological order (most recent first)
    return periods.sort((a, b) => b.value.localeCompare(a.value));
  }, [vatSettings, SARS_VAT_CATEGORIES, monthNames]);

  // Handle period selection
  const handlePeriodChange = (periodValue: string) => {
    setSelectedPeriod(periodValue);
    
    if (periodValue === 'custom') {
      setShowCustomDates(true);
      // Keep existing date range when switching to custom
    } else {
      setShowCustomDates(false);
      // Find the selected period and set the date range
      const period = availablePeriods.find(p => p.value === periodValue);
      if (period) {
        setDateRange({
          startDate: period.startDate,
          endDate: period.endDate
        });
      }
    }
  };

  const reportTypes = [
    {
      id: 'summary',
      name: 'VAT Summary Report',
      description: 'Business overview with graphs and comparisons',
      icon: BarChart3,
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      category: 'Business Summary'
    },
    {
      id: 'sars-vat201',
      name: 'SARS VAT Report (VAT201)',
      description: 'SARS-compliant VAT201 layout with blocks A-Z',
      icon: FileText,
      color: 'bg-red-50 border-red-200 text-red-800',
      category: 'SARS-Aligned'
    },
    {
      id: 'transactions',
      name: 'VAT Transaction Report',
      description: 'All VAT entries with document details and filters',
      icon: Receipt,
      color: 'bg-green-50 border-green-200 text-green-800',
      category: 'SARS-Aligned'
    },
    {
      id: 'reconciliation',
      name: 'VAT Reconciliation Report',
      description: 'Compare transactions with VAT block totals',
      icon: TrendingUp,
      color: 'bg-purple-50 border-purple-200 text-purple-800',
      category: 'SARS-Aligned'
    },
    {
      id: 'audit-trail',
      name: 'VAT Audit Trail',
      description: 'Complete source report for audit reviews',
      icon: Shield,
      color: 'bg-orange-50 border-orange-200 text-orange-800',
      category: 'SARS-Aligned'
    }
  ];

  const [reportData, setReportData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Fixed implementation using apiRequest for proper authentication
  const handleGenerateReport = async (format: string) => {
    if (!dateRange.startDate || !dateRange.endDate) {
      toast({
        title: "Missing Information",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    // Validate date format
    if (!isValidDate(dateRange.startDate) || !isValidDate(dateRange.endDate)) {
      toast({
        title: "Invalid Date Format",
        description: "Please ensure dates are in YYYY-MM-DD format",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Use apiRequest for proper authentication handling
      const response = await apiRequest(`/api/vat/reports/summary?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&format=${format}`, 'GET');
      
      if (format === 'view') {
        // Parse JSON for preview
        const result = await response.json();
        if (result.success) {
          setReportData(result.data);
          setShowPreview(true);
        } else {
          throw new Error(result.message || 'Failed to load report preview');
        }
      } else if (format === 'pdf') {
        // Handle PDF generation on client side
        const result = await response.json();
        if (result.success) {
          await generateClientSidePDF(result.data, dateRange.startDate, dateRange.endDate);
        } else {
          throw new Error(result.message || 'Failed to generate PDF');
        }
      } else {
        // Download excel/csv files
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `vat-summary-${dateRange.startDate}-to-${dateRange.endDate}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      
      toast({
        title: "Report Generated",
        description: `VAT ${selectedReport} report has been ${format === 'view' ? 'loaded' : 'generated'} successfully`,
      });
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate VAT report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">VAT Reports Suite</h2>
        <p className="text-gray-600 dark:text-gray-400">Professional VAT reporting with multi-format export capabilities</p>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reportTypes.map((report) => {
          const IconComponent = report.icon;
          return (
            <Card 
              key={report.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedReport === report.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
              }`}
              onClick={() => setSelectedReport(report.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${report.color}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">{report.name}</CardTitle>
                    <CardDescription className="text-xs">{report.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Report Configuration
          </CardTitle>
          <CardDescription>
            Configure date range and export settings for your VAT report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* VAT Period Selector */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="vatPeriod">VAT Period</Label>
              <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select VAT period based on your company settings" />
                </SelectTrigger>
                <SelectContent>
                  {availablePeriods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Period</SelectItem>
                </SelectContent>
              </Select>
              {vatSettings && (
                <p className="text-xs text-gray-500 mt-1">
                  Your company is registered as VAT Category {(vatSettings as any)?.vatCategory || 'A'} - {
                    SARS_VAT_CATEGORIES.find(cat => cat.value === ((vatSettings as any)?.vatCategory || 'A'))?.submissionCycle
                  }
                </p>
              )}
            </div>

            {/* Custom Date Range (only show when "Custom Period" is selected) */}
            {showCustomDates && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <Label htmlFor="startDate">Custom Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Custom End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {/* Period Summary Display */}
            {!showCustomDates && dateRange.startDate && dateRange.endDate && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Selected Period: <strong>{dateRange.startDate}</strong> to <strong>{dateRange.endDate}</strong>
                </p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="exportFormat">Export Format</Label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select export format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                <SelectItem value="csv">CSV File</SelectItem>
                <SelectItem value="view">View Online</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => handleGenerateReport(exportFormat)}
              disabled={isGenerating || !dateRange.startDate || !dateRange.endDate || (!selectedPeriod && !showCustomDates)}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleGenerateReport('view')}
              disabled={isGenerating || !dateRange.startDate || !dateRange.endDate || (!selectedPeriod && !showCustomDates)}
            >
              Preview
            </Button>
          </div>

          {/* Sample button demonstrating the clean Promise function */}
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">Sample Usage (Clean Promise Function):</p>
            <Button 
              variant="secondary"
              onClick={async () => {
                if (!dateRange.startDate || !dateRange.endDate) {
                  alert('Please select start and end dates first');
                  return;
                }
                
                setIsGenerating(true);
                try {
                  // Use apiRequest for proper authentication
                  const response = await apiRequest(`/api/vat/reports/summary?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&format=pdf`, 'GET');
                  
                  if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                      await generateClientSidePDF(result.data, dateRange.startDate, dateRange.endDate);
                      toast({
                        title: "Success",
                        description: "VAT report generated and opened in new tab",
                      });
                    } else {
                      throw new Error(result.message || 'Failed to generate PDF');
                    }
                  } else {
                    const errorResult = await response.json();
                    throw new Error(errorResult.message || 'Failed to generate PDF');
                  }
                } catch (error) {
                  console.error('VAT report generation error:', error);
                  toast({
                    title: "Error", 
                    description: "Failed to generate VAT report. Please try again.",
                    variant: "destructive"
                  });
                } finally {
                  setIsGenerating(false);
                }
              }}
              disabled={isGenerating || !dateRange.startDate || !dateRange.endDate}
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              Test Clean Promise Function (PDF in New Tab)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Output VAT</p>
                <p className="text-2xl font-bold text-green-600">R 45,230.00</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Input VAT</p>
                <p className="text-2xl font-bold text-blue-600">R 12,850.00</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net VAT</p>
                <p className="text-2xl font-bold text-purple-600">R 32,380.00</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Preview Modal */}
      {showPreview && reportData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">
                  {reportTypes.find(r => r.id === selectedReport)?.name} Preview
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowPreview(false);
                  setReportData(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 overflow-auto max-h-[70vh]">
              <ReportPreview reportType={selectedReport} data={reportData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Report Preview Component
const ReportPreview = ({ reportType, data }: { reportType: string; data: any }) => {
  if (!data) return <div>No data available</div>;

  if (reportType === 'summary') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Period</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {data.period?.startDate} to {data.period?.endDate}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {data.transactions?.invoiceCount || 0} Sales, {data.transactions?.expenseCount || 0} Purchases
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>VAT Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Output VAT</Label>
                <p className="text-lg font-semibold text-green-600">
                  R {data.summary?.outputVat || '0.00'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Input VAT</Label>
                <p className="text-lg font-semibold text-blue-600">
                  R {data.summary?.inputVat || '0.00'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Net VAT Payable</Label>
                <p className="text-lg font-semibold text-purple-600">
                  R {data.summary?.netVatPayable || '0.00'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Net VAT Refund</Label>
                <p className="text-lg font-semibold text-orange-600">
                  R {data.summary?.netVatRefund || '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (reportType === 'transactions') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>
              {data.summary?.totalTransactions || 0} transactions found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Reference</th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-right p-2">Net Amount</th>
                    <th className="text-right p-2">VAT Amount</th>
                    <th className="text-right p-2">Gross Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions?.slice(0, 10).map((transaction: any, index: number) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{new Date(transaction.date).toLocaleDateString()}</td>
                      <td className="p-2">
                        <Badge variant={transaction.type === 'Sale' ? 'default' : 'secondary'}>
                          {transaction.type}
                        </Badge>
                      </td>
                      <td className="p-2">{transaction.reference}</td>
                      <td className="p-2">{transaction.description}</td>
                      <td className="p-2 text-right">R {transaction.netAmount}</td>
                      <td className="p-2 text-right">R {transaction.vatAmount}</td>
                      <td className="p-2 text-right">R {transaction.grossAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.transactions?.length > 10 && (
                <p className="text-sm text-gray-500 mt-2">
                  Showing first 10 of {data.transactions.length} transactions
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (reportType === 'reconciliation') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Reconciliation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Status</Label>
                <p className="text-lg font-semibold">
                  {data.reconciliation?.reportStatus || 'Pending'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Output VAT</Label>
                <p className="text-lg font-semibold text-green-600">
                  R {data.reconciliation?.outputVat || '0.00'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Input VAT</Label>
                <p className="text-lg font-semibold text-blue-600">
                  R {data.reconciliation?.inputVat || '0.00'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Net VAT</Label>
                <p className="text-lg font-semibold text-purple-600">
                  R {data.reconciliation?.netVatPayable || '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {data.recommendations && (
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                {data.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600">{rec}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return <div>Preview not available for this report type</div>;
};

export default VATReports;
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, Download, FileText, Calendar, TrendingUp, X, Eye, Settings, Printer } from 'lucide-react';
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
      description: 'Overview of VAT collections and payments',
      icon: BarChart3,
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    {
      id: 'transactions',
      name: 'VAT Transaction Analysis',
      description: 'Detailed breakdown of all VAT transactions',
      icon: FileText,
      color: 'bg-green-50 border-green-200 text-green-800'
    },
    {
      id: 'reconciliation',
      name: 'VAT Reconciliation Report',
      description: 'Reconcile VAT records with SARS submissions',
      icon: TrendingUp,
      color: 'bg-purple-50 border-purple-200 text-purple-800'
    }
  ];

  const [reportData, setReportData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Fetch VAT stats for quick summary
  const { data: vatStats } = useQuery({
    queryKey: [`/api/vat/stats`, companyId, dateRange],
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  });

  // Print function for the preview modal
  const printReportPreview = (reportType: string, data: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !data) return;
    
    let printContent = '';
    
    if (reportType === 'transactions' && data.transactions) {
      // Group transactions by type
      const salesTransactions = Array.isArray(data.transactions) 
        ? data.transactions.filter((t: any) => t.type === 'Sale')
        : [];
      const purchaseTransactions = Array.isArray(data.transactions)
        ? data.transactions.filter((t: any) => t.type === 'Purchase')
        : [];
      
      // Calculate totals for each group
      const salesTotals = salesTransactions.reduce((acc: any, tx: any) => ({
        netAmount: acc.netAmount + parseFloat(tx.netAmount || 0),
        vatAmount: acc.vatAmount + parseFloat(tx.vatAmount || 0),
        grossAmount: acc.grossAmount + parseFloat(tx.grossAmount || 0)
      }), { netAmount: 0, vatAmount: 0, grossAmount: 0 });
      
      const purchaseTotals = purchaseTransactions.reduce((acc: any, tx: any) => ({
        netAmount: acc.netAmount + parseFloat(tx.netAmount || 0),
        vatAmount: acc.vatAmount + parseFloat(tx.vatAmount || 0),
        grossAmount: acc.grossAmount + parseFloat(tx.grossAmount || 0)
      }), { netAmount: 0, vatAmount: 0, grossAmount: 0 });
      
      printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>VAT Transaction Analysis</title>
          <style>
            @page { 
              size: landscape;
              margin: 10mm;
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              font-size: 11px;
            }
            .header {
              background: #6366f1;
              color: white;
              padding: 20px;
              margin: -20px -20px 20px -20px;
            }
            h1 { 
              margin: 0;
              font-size: 24px;
            }
            .subtitle {
              margin-top: 5px;
              opacity: 0.9;
            }
            h2 { 
              color: #1e40af; 
              font-size: 16px;
              margin-top: 20px;
              margin-bottom: 10px;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 5px;
            }
            h3 {
              font-size: 14px;
              margin: 15px 0 10px 0;
            }
            .summary-box {
              background: #eff6ff;
              padding: 15px;
              margin-bottom: 20px;
              border-radius: 8px;
            }
            .summary-grid {
              display: flex;
              gap: 40px;
            }
            .summary-item {
              flex: 1;
            }
            .summary-label {
              color: #6b7280;
              font-size: 10px;
              margin-bottom: 2px;
            }
            .summary-value {
              font-size: 20px;
              font-weight: bold;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px;
            }
            th { 
              background: #f3f4f6; 
              padding: 6px; 
              text-align: left;
              font-weight: bold;
              border: 1px solid #d1d5db;
              font-size: 10px;
            }
            td { 
              padding: 5px 6px; 
              border: 1px solid #d1d5db;
              font-size: 10px;
            }
            .total-row { 
              font-weight: bold; 
              background: #f9fafb;
            }
            .type-badge {
              display: inline-block;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 9px;
              font-weight: 600;
            }
            .type-sale {
              background: #dcfce7;
              color: #166534;
            }
            .type-purchase {
              background: #fee2e2;
              color: #991b1b;
            }
            .section-header {
              background: #f9fafb;
              padding: 10px;
              margin-bottom: 0;
              border: 1px solid #d1d5db;
              border-bottom: none;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .text-green { color: #059669; }
            .text-red { color: #dc2626; }
            @media print {
              .header {
                background: #6366f1 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TAXNIFY</h1>
            <div class="subtitle">Business & Compliance</div>
          </div>
          
          <h1 style="color: #6366f1; margin-bottom: 20px;">VAT Transaction Analysis Preview</h1>
          
          <div class="summary-box">
            <h3>Transaction Summary</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-label">Total Transactions</div>
                <div class="summary-value">${data.summary?.totalTransactions || 0}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Sales Transactions</div>
                <div class="summary-value text-green">${salesTransactions.length}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Purchase Transactions</div>
                <div class="summary-value text-red">${purchaseTransactions.length}</div>
              </div>
            </div>
          </div>
          
          <h2>Sales (Output VAT)</h2>
          <div class="section-header">
            <strong>${salesTransactions.length} transactions</strong>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Reference</th>
                <th>Name</th>
                <th>Tax Name</th>
                <th class="text-center">TAX Rate</th>
                <th class="text-right">Net</th>
                <th class="text-right">VAT</th>
                <th class="text-right">Gross</th>
              </tr>
            </thead>
            <tbody>
              ${salesTransactions.map((tx: any) => `
                <tr>
                  <td>${new Date(tx.date).toLocaleDateString('en-ZA')}</td>
                  <td><span class="type-badge type-sale">Sale</span></td>
                  <td>${tx.reference}</td>
                  <td>${tx.customerName || tx.description?.replace('Invoice - ', '') || 'Cash Sales'}</td>
                  <td>VAT</td>
                  <td class="text-center">15.00</td>
                  <td class="text-right">R ${tx.netAmount}</td>
                  <td class="text-right text-green">R ${tx.vatAmount}</td>
                  <td class="text-right"><strong>R ${tx.grossAmount}</strong></td>
                </tr>
              `).join('')}
              ${salesTransactions.length > 0 ? `
                <tr class="total-row">
                  <td colspan="6">Total for Sales</td>
                  <td class="text-right">R ${salesTotals.netAmount.toFixed(2)}</td>
                  <td class="text-right text-green">R ${salesTotals.vatAmount.toFixed(2)}</td>
                  <td class="text-right">R ${salesTotals.grossAmount.toFixed(2)}</td>
                </tr>
              ` : ''}
            </tbody>
          </table>
          
          <h2>Purchases (Input VAT)</h2>
          <div class="section-header">
            <strong>${purchaseTransactions.length} transactions</strong>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Reference</th>
                <th>Name</th>
                <th>Tax Name</th>
                <th class="text-center">TAX Rate</th>
                <th class="text-right">Net</th>
                <th class="text-right">VAT</th>
                <th class="text-right">Gross</th>
              </tr>
            </thead>
            <tbody>
              ${purchaseTransactions.map((tx: any) => `
                <tr>
                  <td>${new Date(tx.date).toLocaleDateString('en-ZA')}</td>
                  <td><span class="type-badge type-purchase">Purchase</span></td>
                  <td>${tx.reference || 'N/A'}</td>
                  <td>${tx.supplierName || tx.description || 'Supplier'}</td>
                  <td>VAT</td>
                  <td class="text-center">15.00</td>
                  <td class="text-right">R ${tx.netAmount}</td>
                  <td class="text-right text-red">R ${tx.vatAmount}</td>
                  <td class="text-right"><strong>R ${tx.grossAmount}</strong></td>
                </tr>
              `).join('')}
              ${purchaseTransactions.length > 0 ? `
                <tr class="total-row">
                  <td colspan="6">Total for Purchases</td>
                  <td class="text-right">R ${purchaseTotals.netAmount.toFixed(2)}</td>
                  <td class="text-right text-red">R ${purchaseTotals.vatAmount.toFixed(2)}</td>
                  <td class="text-right">R ${purchaseTotals.grossAmount.toFixed(2)}</td>
                </tr>
              ` : ''}
            </tbody>
          </table>
        </body>
        </html>
      `;
    } else {
      // For other report types, create a simple print view
      printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>VAT Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1e40af; }
            .content { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <h1>VAT Report</h1>
          <div class="content">${JSON.stringify(data, null, 2)}</div>
        </body>
        </html>
      `;
    }
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Fixed implementation with proper download handling for all report types
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
      // Determine the correct API endpoint based on report type
      let apiEndpoint = '';
      let queryParams = `startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&format=${format}`;
      
      switch (selectedReport) {
        case 'summary':
          apiEndpoint = '/api/vat/reports/summary';
          break;
        case 'transactions':
          apiEndpoint = '/api/vat/reports/transactions';
          break;
        case 'reconciliation':
          apiEndpoint = '/api/vat/reports/reconciliation';
          queryParams = `period=${dateRange.startDate}-to-${dateRange.endDate}&format=${format}`;
          break;
        default:
          apiEndpoint = '/api/vat/reports/summary';
      }

      if (format === 'view') {
        // For preview, use apiRequest to get JSON
        const response = await apiRequest(`${apiEndpoint}?${queryParams}`, 'GET');
        const result = await response.json();
        if (result.success || result.period) { // Handle different response formats
          setReportData(result.success ? result.data : result);
          setShowPreview(true);
        } else {
          throw new Error(result.message || 'Failed to load report preview');
        }
      } else if (format === 'pdf') {
        // For PDF, get data and generate client-side PDF like invoices/estimates
        const response = await apiRequest(`${apiEndpoint}?${queryParams.replace('format=pdf', 'format=view')}`, 'GET');
        const result = await response.json();
        
        if (result.success || result.period) {
          const data = result.success ? result.data : result;
          
          // Import and use appropriate PDF generator
          let pdf;
          if (selectedReport === 'summary') {
            const { generateVATSummaryPDF } = await import('./vat-pdf-generator');
            pdf = await generateVATSummaryPDF(data);
          } else if (selectedReport === 'transactions') {
            const { generateVATTransactionPDF } = await import('./vat-pdf-generator');
            pdf = await generateVATTransactionPDF(data);
          } else if (selectedReport === 'reconciliation') {
            const { generateVATReconciliationPDF } = await import('./vat-pdf-generator');
            pdf = await generateVATReconciliationPDF(data);
          }
          
          if (pdf) {
            // Open PDF in new tab like invoices/estimates
            const pdfBlob = pdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            window.open(url, '_blank');
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }
        }
      } else {
        // For Excel/CSV downloads, use direct API response
        const response = await apiRequest(`${apiEndpoint}?${queryParams}`, 'GET');
        const blob = await response.blob();
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `vat-${selectedReport}-${dateRange.startDate}-to-${dateRange.endDate}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      
      toast({
        title: "Report Generated",
        description: `VAT ${reportTypes.find(r => r.id === selectedReport)?.name || selectedReport} report has been ${format === 'view' ? 'loaded' : 'generated'} successfully`,
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
        </CardContent>
      </Card>

      {/* Quick Stats - Show real data when period is selected */}
      {dateRange.startDate && dateRange.endDate && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Output VAT (Sales)</p>
                  <p className="text-2xl font-bold text-green-600">
                    R {vatStats?.outputVat ? parseFloat(vatStats.outputVat).toFixed(2) : '0.00'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">VAT collected from customers</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Input VAT (Purchases)</p>
                  <p className="text-2xl font-bold text-blue-600">
                    R {vatStats?.inputVat ? parseFloat(vatStats.inputVat).toFixed(2) : '0.00'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">VAT paid to suppliers</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net VAT Payable</p>
                  <p className="text-2xl font-bold text-purple-600">
                    R {vatStats?.netVat ? parseFloat(vatStats.netVat).toFixed(2) : '0.00'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Amount due to SARS</p>
                </div>
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => printReportPreview(selectedReport, reportData)}
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Print
                </Button>
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
    // Group transactions by type
    const salesTransactions = Array.isArray(data.transactions) 
      ? data.transactions.filter((t: any) => t.type === 'Sale')
      : [];
    const purchaseTransactions = Array.isArray(data.transactions)
      ? data.transactions.filter((t: any) => t.type === 'Purchase')
      : [];
    
    // Calculate totals for each group
    const salesTotals = salesTransactions.reduce((acc: any, tx: any) => ({
      netAmount: acc.netAmount + parseFloat(tx.netAmount || 0),
      vatAmount: acc.vatAmount + parseFloat(tx.vatAmount || 0),
      grossAmount: acc.grossAmount + parseFloat(tx.grossAmount || 0)
    }), { netAmount: 0, vatAmount: 0, grossAmount: 0 });
    
    const purchaseTotals = purchaseTransactions.reduce((acc: any, tx: any) => ({
      netAmount: acc.netAmount + parseFloat(tx.netAmount || 0),
      vatAmount: acc.vatAmount + parseFloat(tx.vatAmount || 0),
      grossAmount: acc.grossAmount + parseFloat(tx.grossAmount || 0)
    }), { netAmount: 0, vatAmount: 0, grossAmount: 0 });
    
    return (
      <div className="space-y-6">
        {/* Transaction Summary */}
        <Card className="bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-300">Transaction Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-xl font-bold">{data.summary?.totalTransactions || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sales Transactions</p>
                <p className="text-xl font-bold text-green-600">{salesTransactions.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Purchase Transactions</p>
                <p className="text-xl font-bold text-red-600">{purchaseTransactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Sales Transactions */}
        <Card>
          <CardHeader className="bg-green-50 dark:bg-green-950">
            <CardTitle className="text-green-700 dark:text-green-300">Sales (Output VAT)</CardTitle>
            <CardDescription>{salesTransactions.length} transactions</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Reference</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Tax Name</th>
                    <th className="text-center p-2">TAX Rate</th>
                    <th className="text-right p-2">Net</th>
                    <th className="text-right p-2">VAT</th>
                    <th className="text-right p-2">Gross</th>
                  </tr>
                </thead>
                <tbody>
                  {salesTransactions.map((transaction: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2">{new Date(transaction.date).toLocaleDateString('en-ZA')}</td>
                      <td className="p-2">
                        <Badge className="bg-green-100 text-green-700">Sale</Badge>
                      </td>
                      <td className="p-2 font-medium">{transaction.reference}</td>
                      <td className="p-2">{transaction.customerName || transaction.description?.replace('Invoice - ', '') || 'Cash Sales'}</td>
                      <td className="p-2">VAT</td>
                      <td className="p-2 text-center">15.00</td>
                      <td className="p-2 text-right font-mono">R {transaction.netAmount}</td>
                      <td className="p-2 text-right font-mono text-green-600">R {transaction.vatAmount}</td>
                      <td className="p-2 text-right font-mono font-bold">R {transaction.grossAmount}</td>
                    </tr>
                  ))}
                  {salesTransactions.length > 0 && (
                    <tr className="bg-gray-100 font-bold">
                      <td colSpan={6} className="p-2">Total for Sales</td>
                      <td className="p-2 text-right font-mono">R {salesTotals.netAmount.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono text-green-600">R {salesTotals.vatAmount.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono">R {salesTotals.grossAmount.toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        {/* Purchase Transactions */}
        <Card>
          <CardHeader className="bg-red-50 dark:bg-red-950">
            <CardTitle className="text-red-700 dark:text-red-300">Purchases (Input VAT)</CardTitle>
            <CardDescription>{purchaseTransactions.length} transactions</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Reference</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Tax Name</th>
                    <th className="text-center p-2">TAX Rate</th>
                    <th className="text-right p-2">Net</th>
                    <th className="text-right p-2">VAT</th>
                    <th className="text-right p-2">Gross</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseTransactions.map((transaction: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2">{new Date(transaction.date).toLocaleDateString('en-ZA')}</td>
                      <td className="p-2">
                        <Badge className="bg-red-100 text-red-700">Purchase</Badge>
                      </td>
                      <td className="p-2 font-medium">{transaction.reference || 'N/A'}</td>
                      <td className="p-2">{transaction.supplierName || transaction.description || 'Supplier'}</td>
                      <td className="p-2">VAT</td>
                      <td className="p-2 text-center">15.00</td>
                      <td className="p-2 text-right font-mono">R {transaction.netAmount}</td>
                      <td className="p-2 text-right font-mono text-red-600">R {transaction.vatAmount}</td>
                      <td className="p-2 text-right font-mono font-bold">R {transaction.grossAmount}</td>
                    </tr>
                  ))}
                  {purchaseTransactions.length > 0 && (
                    <tr className="bg-gray-100 font-bold">
                      <td colSpan={6} className="p-2">Total for Purchases</td>
                      <td className="p-2 text-right font-mono">R {purchaseTotals.netAmount.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono text-red-600">R {purchaseTotals.vatAmount.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono">R {purchaseTotals.grossAmount.toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
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
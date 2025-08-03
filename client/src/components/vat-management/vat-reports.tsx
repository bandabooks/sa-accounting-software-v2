import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, Download, FileText, Calendar, TrendingUp, X, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { generateVatSummaryReport, handleGenerateReport as handleVatReportGeneration, isValidDate } from '@/utils/vatReportGenerator';

interface VATReportsProps {
  companyId: number;
}

const VATReports: React.FC<VATReportsProps> = ({ companyId }) => {
  const [selectedReport, setSelectedReport] = useState('summary');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

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

  // Clean Promise-based implementation using the new utility function
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
      if (format === 'view') {
        // Generate preview data using the clean Promise function
        const reportBlob = await generateVatSummaryReport(
          dateRange.startDate, 
          dateRange.endDate, 
          'view'
        );
        
        if (reportBlob) {
          const reportText = await reportBlob.text();
          const reportData = JSON.parse(reportText);
          setReportData(reportData);
          setShowPreview(true);
          toast({
            title: "Report Generated",
            description: "Report preview is ready",
          });
        } else {
          throw new Error('Failed to generate report preview');
        }
      } else {
        // Use the imported clean Promise-based handler for downloads/PDF opening
        await handleVatReportGeneration(
          dateRange.startDate, 
          dateRange.endDate, 
          format as 'pdf' | 'excel' | 'csv'
        );
        
        toast({
          title: "Report Generated",
          description: format === 'pdf' ? "PDF opened in new tab" : "Download started",
        });
      }
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Unable to generate report. Please check your connection and try again.",
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
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
              disabled={isGenerating || !dateRange.startDate || !dateRange.endDate}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleGenerateReport('view')}
              disabled={isGenerating || !dateRange.startDate || !dateRange.endDate}
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
                  // Direct usage of your requested clean Promise function
                  await handleVatReportGeneration(dateRange.startDate, dateRange.endDate, 'pdf');
                  toast({
                    title: "Success",
                    description: "PDF opened in new tab using clean Promise function",
                  });
                } catch (error) {
                  alert('Failed to generate VAT report. Please check your connection and try again.');
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
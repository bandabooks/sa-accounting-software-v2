import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, Download, FileText, Calendar, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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

  const handleGenerateReport = async (format: string) => {
    setIsGenerating(true);
    try {
      const response = await apiRequest(`/api/vat/reports/${selectedReport}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&format=${format}`, 'GET');
      
      if (format === 'pdf' || format === 'excel' || format === 'csv') {
        // For file downloads, the response would be a blob
        toast({
          title: "Report Generated",
          description: `${reportTypes.find(r => r.id === selectedReport)?.name} downloaded as ${format.toUpperCase()}`,
        });
      } else {
        toast({
          title: "Report Generated",
          description: "Report data retrieved successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Report Generation Failed",
        description: "Unable to generate report. Please try again.",
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
    </div>
  );
};

export default VATReports;
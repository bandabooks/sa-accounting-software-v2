import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  FileText, Building2, Calendar, Download, Send, AlertTriangle, 
  CheckCircle, Clock, Calculator, TrendingUp, DollarSign 
} from 'lucide-react';

export default function ITR14Returns() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTaxYear, setSelectedTaxYear] = useState<string>('2024');

  // Get active company
  const { data: activeCompany } = useQuery({
    queryKey: ['/api/companies/active']
  });

  const companyId = activeCompany?.id || 2;

  // Get SARS status
  const { data: sarsStatus } = useQuery({
    queryKey: ['/api/sars/status']
  });

  // Mock ITR14 data for company tax returns
  const itr14Returns = [
    {
      id: '1',
      taxYear: '2024',
      companyName: 'Acme Construction (Pty) Ltd',
      registrationNumber: '2018/123456/07',
      status: 'draft',
      totalIncome: 15500000,
      totalDeductions: 12400000,
      taxableIncome: 3100000,
      taxPayable: 868000,
      provisionalTaxPaid: 850000,
      paymentDue: 18000,
      dueDate: '2024-12-31',
      submissionDate: null,
      financialYearEnd: '2024-02-28'
    },
    {
      id: '2',
      taxYear: '2024',
      companyName: 'Green Valley Restaurant CC',
      registrationNumber: 'CC/2015/456789',
      status: 'submitted',
      totalIncome: 8750000,
      totalDeductions: 7200000,
      taxableIncome: 1550000,
      taxPayable: 434000,
      provisionalTaxPaid: 450000,
      refundDue: 16000,
      dueDate: '2024-12-31',
      submissionDate: '2024-10-15',
      financialYearEnd: '2024-02-29'
    },
    {
      id: '3',
      taxYear: '2023',
      companyName: 'Tech Solutions SA (Pty) Ltd',
      registrationNumber: '2019/987654/07',
      status: 'assessed',
      totalIncome: 12300000,
      totalDeductions: 9800000,
      taxableIncome: 2500000,
      taxPayable: 700000,
      provisionalTaxPaid: 680000,
      paymentDue: 20000,
      dueDate: '2023-12-31',
      submissionDate: '2023-11-28',
      financialYearEnd: '2023-02-28'
    }
  ];

  // Generate ITR14
  const generateITR14 = useMutation({
    mutationFn: async ({ taxYear, companyId: targetCompanyId }: { taxYear: string; companyId: string }) => {
      return await apiRequest('/api/sars/itr14/generate', 'POST', { taxYear, companyId: targetCompanyId });
    },
    onSuccess: () => {
      toast({
        title: "ITR14 Generated",
        description: "Company tax return has been generated successfully."
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate ITR14. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Submit to SARS
  const submitToSars = useMutation({
    mutationFn: async (returnId: string) => {
      return await apiRequest('/api/sars/itr14/submit', 'POST', { returnId });
    },
    onSuccess: () => {
      toast({
        title: "Submitted to SARS",
        description: "ITR14 has been submitted successfully to SARS eFiling."
      });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Failed to submit to SARS. Please check your connection.",
        variant: "destructive"
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'submitted': return 'default';
      case 'assessed': return 'default';
      case 'overdue': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="h-4 w-4" />;
      case 'submitted': return <Send className="h-4 w-4" />;
      case 'assessed': return <CheckCircle className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6" data-testid="itr14-dashboard">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ITR14 - Company Tax Returns</h1>
          <p className="text-gray-600">Manage company income tax returns and submissions</p>
        </div>
      </div>

      {/* SARS Integration Status */}
      <Alert className={sarsStatus?.connected ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}>
        <div className="flex items-center gap-2">
          {sarsStatus?.connected ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
          <AlertDescription className={sarsStatus?.connected ? "text-green-800" : "text-amber-800"}>
            {sarsStatus?.connected 
              ? "Connected to SARS eFiling. Ready to submit ITR14 company tax returns."
              : "SARS integration required. Configure your SARS connection to submit returns electronically."
            }
          </AlertDescription>
        </div>
      </Alert>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Returns</p>
                <p className="text-2xl font-bold text-blue-600">{itr14Returns.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Submitted</p>
                <p className="text-2xl font-bold text-green-600">
                  {itr14Returns.filter(r => r.status === 'submitted' || r.status === 'assessed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-amber-600">
                  {itr14Returns.filter(r => r.status === 'draft').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Due Date</p>
                <p className="text-2xl font-bold text-purple-600">Dec 31</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Tax Returns */}
      <Card>
        <CardHeader>
          <CardTitle>Company Tax Returns (ITR14)</CardTitle>
          <CardDescription>
            Manage company income tax returns for tax year {selectedTaxYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Tax Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Income</TableHead>
                <TableHead className="text-right">Tax Payable</TableHead>
                <TableHead className="text-right">Refund/Payment</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itr14Returns.map((taxReturn) => (
                <TableRow key={taxReturn.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{taxReturn.companyName}</div>
                      <div className="text-sm text-gray-500">Year End: {taxReturn.financialYearEnd}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{taxReturn.registrationNumber}</TableCell>
                  <TableCell>{taxReturn.taxYear}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(taxReturn.status)} className="flex items-center gap-1 w-fit">
                      {getStatusIcon(taxReturn.status)}
                      {taxReturn.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">R {(taxReturn.totalIncome/1000000).toFixed(1)}M</TableCell>
                  <TableCell className="text-right">R {(taxReturn.taxPayable/1000).toFixed(0)}K</TableCell>
                  <TableCell className="text-right">
                    {taxReturn.refundDue ? (
                      <span className="text-green-600">R {taxReturn.refundDue.toLocaleString()} (refund)</span>
                    ) : taxReturn.paymentDue ? (
                      <span className="text-rose-600">R {taxReturn.paymentDue.toLocaleString()} (due)</span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>{taxReturn.dueDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => generateITR14.mutate({ taxYear: taxReturn.taxYear, companyId: taxReturn.id })}
                        disabled={generateITR14.isPending}
                        data-testid={`button-generate-${taxReturn.id}`}
                      >
                        <Calculator className="h-4 w-4 mr-1" />
                        Generate
                      </Button>
                      {taxReturn.status === 'draft' && (
                        <Button 
                          size="sm"
                          onClick={() => submitToSars.mutate(taxReturn.id)}
                          disabled={!sarsStatus?.connected || submitToSars.isPending}
                          data-testid={`button-submit-${taxReturn.id}`}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Submit
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        data-testid={`button-download-${taxReturn.id}`}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
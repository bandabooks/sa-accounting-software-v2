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
  FileText, User, Calendar, Download, Send, AlertTriangle, 
  CheckCircle, Clock, Calculator, TrendingUp, DollarSign 
} from 'lucide-react';

export default function ITR12Returns() {
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

  // Mock ITR12 data for individual tax returns
  const itr12Returns = [
    {
      id: '1',
      taxYear: '2024',
      taxpayerName: 'John Smith',
      idNumber: '8501015009088',
      status: 'draft',
      totalIncome: 750000,
      totalDeductions: 125000,
      taxableIncome: 625000,
      taxPayable: 175000,
      employeeTax: 180000,
      refundDue: 5000,
      dueDate: '2024-10-31',
      submissionDate: null
    },
    {
      id: '2',
      taxYear: '2024',
      taxpayerName: 'Sarah Johnson',
      idNumber: '9203082234567',
      status: 'submitted',
      totalIncome: 680000,
      totalDeductions: 95000,
      taxableIncome: 585000,
      taxPayable: 162000,
      employeeTax: 158000,
      paymentDue: 4000,
      dueDate: '2024-10-31',
      submissionDate: '2024-09-15'
    },
    {
      id: '3',
      taxYear: '2023',
      taxpayerName: 'Mike Davis',
      idNumber: '8709151234567',
      status: 'assessed',
      totalIncome: 920000,
      totalDeductions: 145000,
      taxableIncome: 775000,
      taxPayable: 221000,
      employeeTax: 215000,
      paymentDue: 6000,
      dueDate: '2023-10-31',
      submissionDate: '2023-10-20'
    }
  ];

  // Generate ITR12
  const generateITR12 = useMutation({
    mutationFn: async ({ taxYear, taxpayerId }: { taxYear: string; taxpayerId: string }) => {
      return await apiRequest('/api/sars/itr12/generate', 'POST', { taxYear, taxpayerId, companyId });
    },
    onSuccess: () => {
      toast({
        title: "ITR12 Generated",
        description: "Individual tax return has been generated successfully."
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate ITR12. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Submit to SARS
  const submitToSars = useMutation({
    mutationFn: async (returnId: string) => {
      return await apiRequest('/api/sars/itr12/submit', 'POST', { returnId });
    },
    onSuccess: () => {
      toast({
        title: "Submitted to SARS",
        description: "ITR12 has been submitted successfully to SARS eFiling."
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
    <div className="space-y-6" data-testid="itr12-dashboard">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ITR12 - Individual Tax Returns</h1>
          <p className="text-gray-600">Manage individual income tax returns and submissions</p>
        </div>
      </div>

      {/* SARS Integration Status */}
      <Alert className={sarsStatus?.connected ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}>
        <div className="flex items-center gap-2">
          {sarsStatus?.connected ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
          <AlertDescription className={sarsStatus?.connected ? "text-green-800" : "text-amber-800"}>
            {sarsStatus?.connected 
              ? "Connected to SARS eFiling. Ready to submit ITR12 individual tax returns."
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
                <p className="text-2xl font-bold text-blue-600">{itr12Returns.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Submitted</p>
                <p className="text-2xl font-bold text-green-600">
                  {itr12Returns.filter(r => r.status === 'submitted' || r.status === 'assessed').length}
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
                  {itr12Returns.filter(r => r.status === 'draft').length}
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
                <p className="text-2xl font-bold text-purple-600">Oct 31</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Tax Returns */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Tax Returns (ITR12)</CardTitle>
          <CardDescription>
            Manage individual income tax returns for tax year {selectedTaxYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Taxpayer</TableHead>
                <TableHead>ID Number</TableHead>
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
              {itr12Returns.map((taxReturn) => (
                <TableRow key={taxReturn.id}>
                  <TableCell className="font-medium">{taxReturn.taxpayerName}</TableCell>
                  <TableCell>{taxReturn.idNumber}</TableCell>
                  <TableCell>{taxReturn.taxYear}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(taxReturn.status)} className="flex items-center gap-1 w-fit">
                      {getStatusIcon(taxReturn.status)}
                      {taxReturn.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">R {taxReturn.totalIncome.toLocaleString()}</TableCell>
                  <TableCell className="text-right">R {taxReturn.taxPayable.toLocaleString()}</TableCell>
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
                        onClick={() => generateITR12.mutate({ taxYear: taxReturn.taxYear, taxpayerId: taxReturn.id })}
                        disabled={generateITR12.isPending}
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
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
  FileText, Users, Calendar, Download, Send, AlertTriangle, 
  CheckCircle, Clock, Calculator, RefreshCw, Building2 
} from 'lucide-react';

export default function EMP501Reconciliation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedYear, setSelectedYear] = useState<string>('2024');

  // Get active company
  const { data: activeCompany } = useQuery({
    queryKey: ['/api/companies/active']
  });

  const companyId = activeCompany?.id || 2;

  // Get SARS status
  const { data: sarsStatus } = useQuery({
    queryKey: ['/api/sars/status']
  });

  // Mock EMP501 reconciliation data
  const reconciliationData = [
    {
      id: '1',
      taxYear: '2024',
      status: 'pending',
      totalEmployees: 45,
      totalGross: 5420000,
      totalPaye: 1086000,
      totalUif: 54200,
      paymentsToSars: 1140200,
      variance: 0,
      submissionDate: null,
      dueDate: '2025-05-31'
    },
    {
      id: '2',
      taxYear: '2023',
      status: 'submitted',
      totalEmployees: 38,
      totalGross: 4850000,
      totalPaye: 970000,
      totalUif: 48500,
      paymentsToSars: 1018500,
      variance: 0,
      submissionDate: '2024-04-15',
      dueDate: '2024-05-31'
    },
    {
      id: '3',
      taxYear: '2022',
      status: 'submitted',
      totalEmployees: 32,
      totalGross: 3920000,
      totalPaye: 784000,
      totalUif: 39200,
      paymentsToSars: 823200,
      variance: 0,
      submissionDate: '2023-05-20',
      dueDate: '2023-05-31'
    }
  ];

  // Employee certificate data
  const employeeCertificates = [
    { id: 1, name: 'John Smith', idNumber: '8501015009088', gross: 120000, paye: 24000, uif: 1200, issued: true },
    { id: 2, name: 'Sarah Johnson', idNumber: '9203082234567', gross: 95000, paye: 19000, uif: 950, issued: true },
    { id: 3, name: 'Mike Davis', idNumber: '8709151234567', gross: 110000, paye: 22000, uif: 1100, issued: false },
    { id: 4, name: 'Lisa Wilson', idNumber: '9105123456789', gross: 85000, paye: 17000, uif: 850, issued: false },
  ];

  // Generate EMP501
  const generateEMP501 = useMutation({
    mutationFn: async (taxYear: string) => {
      return await apiRequest('/api/sars/emp501/generate', 'POST', { taxYear, companyId });
    },
    onSuccess: () => {
      toast({
        title: "EMP501 Generated",
        description: "Your annual employee reconciliation has been generated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/annual'] });
    },
    onError: () => {
      toast({
        title: "Generation Failed", 
        description: "Failed to generate EMP501. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Submit to SARS
  const submitToSars = useMutation({
    mutationFn: async (reconciliationId: string) => {
      return await apiRequest('/api/sars/emp501/submit', 'POST', { reconciliationId });
    },
    onSuccess: () => {
      toast({
        title: "Submitted to SARS",
        description: "Your EMP501 reconciliation has been submitted successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/annual'] });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Failed to submit to SARS. Please check your connection.",
        variant: "destructive"
      });
    }
  });

  // Issue certificates
  const issueCertificates = useMutation({
    mutationFn: async (taxYear: string) => {
      return await apiRequest('/api/sars/emp501/certificates', 'POST', { taxYear, companyId });
    },
    onSuccess: () => {
      toast({
        title: "Certificates Issued",
        description: "Employee tax certificates have been issued successfully."
      });
    },
    onError: () => {
      toast({
        title: "Certificate Issue Failed",
        description: "Failed to issue certificates. Please try again.",
        variant: "destructive"
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'submitted': return 'default';
      case 'overdue': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'submitted': return <CheckCircle className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6" data-testid="emp501-dashboard">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">EMP501 Reconciliation</h1>
          <p className="text-gray-600">Annual employee tax reconciliation and certificate management</p>
        </div>
      </div>

      {/* SARS Integration Status */}
      <Alert className={sarsStatus?.connected ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}>
        <div className="flex items-center gap-2">
          {sarsStatus?.connected ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
          <AlertDescription className={sarsStatus?.connected ? "text-green-800" : "text-amber-800"}>
            {sarsStatus?.connected 
              ? "Connected to SARS eFiling. Ready to submit EMP501 reconciliations."
              : "SARS integration required. Configure your SARS connection to submit reconciliations electronically."
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
                <p className="text-sm font-medium text-gray-600">Active Employees</p>
                <p className="text-2xl font-bold text-blue-600">45</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Gross</p>
                <p className="text-2xl font-bold text-green-600">R 5.42M</p>
              </div>
              <Calculator className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total PAYE</p>
                <p className="text-2xl font-bold text-purple-600">R 1.09M</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Due Date</p>
                <p className="text-2xl font-bold text-orange-600">May 31</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Annual Reconciliations */}
      <Card>
        <CardHeader>
          <CardTitle>Annual Reconciliations</CardTitle>
          <CardDescription>
            Manage your annual employee tax reconciliations (EMP501)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tax Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Employees</TableHead>
                <TableHead className="text-right">Total Gross</TableHead>
                <TableHead className="text-right">PAYE</TableHead>
                <TableHead className="text-right">UIF</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reconciliationData.map((recon) => (
                <TableRow key={recon.id}>
                  <TableCell className="font-medium">{recon.taxYear}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(recon.status)} className="flex items-center gap-1 w-fit">
                      {getStatusIcon(recon.status)}
                      {recon.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{recon.totalEmployees}</TableCell>
                  <TableCell className="text-right">R {(recon.totalGross/1000000).toFixed(2)}M</TableCell>
                  <TableCell className="text-right">R {(recon.totalPaye/1000000).toFixed(2)}M</TableCell>
                  <TableCell className="text-right">R {(recon.totalUif/1000).toFixed(0)}K</TableCell>
                  <TableCell className="text-right">R {recon.variance.toLocaleString()}</TableCell>
                  <TableCell>{recon.dueDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => generateEMP501.mutate(recon.taxYear)}
                        disabled={generateEMP501.isPending}
                        data-testid={`button-generate-${recon.id}`}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Generate
                      </Button>
                      {recon.status !== 'submitted' && (
                        <Button 
                          size="sm"
                          onClick={() => submitToSars.mutate(recon.id)}
                          disabled={!sarsStatus?.connected || submitToSars.isPending}
                          data-testid={`button-submit-${recon.id}`}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Submit
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Employee Certificates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Employee Tax Certificates</CardTitle>
              <CardDescription>
                Issue IRP5/IT3(a) certificates for tax year {selectedYear}
              </CardDescription>
            </div>
            <Button 
              onClick={() => issueCertificates.mutate(selectedYear)}
              disabled={issueCertificates.isPending}
              data-testid="button-issue-certificates"
            >
              <FileText className="h-4 w-4 mr-2" />
              Issue All Certificates
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>ID Number</TableHead>
                <TableHead className="text-right">Gross Income</TableHead>
                <TableHead className="text-right">PAYE</TableHead>
                <TableHead className="text-right">UIF</TableHead>
                <TableHead>Certificate</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeeCertificates.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.idNumber}</TableCell>
                  <TableCell className="text-right">R {employee.gross.toLocaleString()}</TableCell>
                  <TableCell className="text-right">R {employee.paye.toLocaleString()}</TableCell>
                  <TableCell className="text-right">R {employee.uif.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={employee.issued ? "default" : "secondary"}>
                      {employee.issued ? 'Issued' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        data-testid={`button-download-${employee.id}`}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
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
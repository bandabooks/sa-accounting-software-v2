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
  FileText, Calendar, Download, Send, AlertTriangle, 
  CheckCircle, Clock, Calculator, TrendingUp, DollarSign 
} from 'lucide-react';

export default function ProvisionalTax() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');

  // Get active company
  const { data: activeCompany } = useQuery({
    queryKey: ['/api/companies/active']
  });

  const companyId = activeCompany?.id || 2;

  // Get SARS status
  const { data: sarsStatus } = useQuery({
    queryKey: ['/api/sars/status']
  });

  // Mock provisional tax data
  const provisionalTaxPeriods = [
    {
      id: '1',
      period: '2024 First Period',
      dueDate: '2024-08-31',
      status: 'overdue',
      estimatedIncome: 850000,
      estimatedTax: 238000,
      paymentsMade: 200000,
      balance: 38000
    },
    {
      id: '2',
      period: '2024 Second Period',
      dueDate: '2025-02-28',
      status: 'overdue',
      estimatedIncome: 920000,
      estimatedTax: 257600,
      paymentsMade: 0,
      balance: 257600
    },
    {
      id: '3',
      period: '2024 Third Period (Estimated)',
      dueDate: '2025-08-31',
      status: 'upcoming',
      estimatedIncome: 980000,
      estimatedTax: 274400,
      paymentsMade: 0,
      balance: 274400
    }
  ];

  // Generate Provisional Tax calculation
  const generateCalculation = useMutation({
    mutationFn: async (period: string) => {
      return await apiRequest('/api/sars/provisional-tax/calculate', 'POST', { period, companyId });
    },
    onSuccess: () => {
      toast({
        title: "Calculation Generated",
        description: "Your provisional tax calculation has been generated successfully."
      });
    },
    onError: () => {
      toast({
        title: "Calculation Failed",
        description: "Failed to generate calculation. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Submit to SARS
  const submitToSars = useMutation({
    mutationFn: async (returnId: string) => {
      return await apiRequest('/api/sars/provisional-tax/submit', 'POST', { returnId });
    },
    onSuccess: () => {
      toast({
        title: "Submitted to SARS",
        description: "Your provisional tax return has been submitted successfully."
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
      case 'overdue': return 'destructive';
      case 'upcoming': return 'default';
      case 'submitted': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      case 'submitted': return <CheckCircle className="h-4 w-4" />;
      case 'upcoming': return <Clock className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6" data-testid="provisional-tax-dashboard">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Provisional Tax</h1>
          <p className="text-gray-600">Manage provisional tax calculations and submissions</p>
        </div>
      </div>

      {/* SARS Integration Status */}
      <Alert className={sarsStatus?.connected ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}>
        <div className="flex items-center gap-2">
          {sarsStatus?.connected ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
          <AlertDescription className={sarsStatus?.connected ? "text-green-800" : "text-amber-800"}>
            {sarsStatus?.connected 
              ? "Connected to SARS eFiling. Ready to submit provisional tax returns."
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
                <p className="text-sm font-medium text-gray-600">Total Due</p>
                <p className="text-2xl font-bold text-rose-600">R {(295600).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-rose-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Payments Made</p>
                <p className="text-2xl font-bold text-blue-600">R {(200000).toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-amber-600">R {(95600).toLocaleString()}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Next Due</p>
                <p className="text-2xl font-bold text-purple-600">Aug 31</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provisional Tax Periods */}
      <Card>
        <CardHeader>
          <CardTitle>Provisional Tax Periods</CardTitle>
          <CardDescription>
            Manage your provisional tax calculations and submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Estimated Income</TableHead>
                <TableHead className="text-right">Tax Due</TableHead>
                <TableHead className="text-right">Payments</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {provisionalTaxPeriods.map((period) => (
                <TableRow key={period.id}>
                  <TableCell className="font-medium">{period.period}</TableCell>
                  <TableCell>{period.dueDate}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(period.status)} className="flex items-center gap-1 w-fit">
                      {getStatusIcon(period.status)}
                      {period.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">R {period.estimatedIncome.toLocaleString()}</TableCell>
                  <TableCell className="text-right">R {period.estimatedTax.toLocaleString()}</TableCell>
                  <TableCell className="text-right">R {period.paymentsMade.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-semibold">R {period.balance.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => generateCalculation.mutate(period.period)}
                        disabled={generateCalculation.isPending}
                        data-testid={`button-calculate-${period.id}`}
                      >
                        <Calculator className="h-4 w-4 mr-1" />
                        Calculate
                      </Button>
                      {period.status !== 'submitted' && (
                        <Button 
                          size="sm"
                          onClick={() => submitToSars.mutate(period.id)}
                          disabled={!sarsStatus?.connected || submitToSars.isPending}
                          data-testid={`button-submit-${period.id}`}
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
    </div>
  );
}
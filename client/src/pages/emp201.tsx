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
  CheckCircle, Clock, Calculator, TrendingUp 
} from 'lucide-react';

export default function EMP201Returns() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');

  // Get active company
  const { data: activeCompany } = useQuery({
    queryKey: ['/api/companies/active']
  });

  const companyId = activeCompany?.id || 2;

  // Get employees for payroll
  const { data: employees = [] } = useQuery({
    queryKey: ['/api/employees'],
    enabled: !!companyId
  });

  // Get payroll data
  const { data: payrollData = [] } = useQuery({
    queryKey: ['/api/payroll/summary'],
    enabled: !!companyId
  });

  // Get SARS status
  const { data: sarsStatus } = useQuery({
    queryKey: ['/api/sars/status']
  });

  // Generate EMP201
  const generateEMP201 = useMutation({
    mutationFn: async (period: string) => {
      return await apiRequest('/api/sars/emp201/generate', 'POST', { period, companyId });
    },
    onSuccess: () => {
      toast({
        title: "EMP201 Generated",
        description: "Your EMP201 return has been generated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/summary'] });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate EMP201. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Submit to SARS
  const submitToSars = useMutation({
    mutationFn: async (returnId: string) => {
      return await apiRequest('/api/sars/emp201/submit', 'POST', { returnId });
    },
    onSuccess: () => {
      toast({
        title: "Submitted to SARS",
        description: "Your EMP201 has been submitted successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/summary'] });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Failed to submit to SARS. Please check your connection.",
        variant: "destructive"
      });
    }
  });

  // Calculate totals
  const calculateTotals = () => {
    let paye = 0;
    let uif = 0; 
    let sdl = 0;
    
    employees.forEach((emp: any) => {
      const salary = parseFloat(emp.salary || '0');
      // Simplified tax calculation 
      paye += salary * 0.18;
      uif += Math.min(salary * 0.02, 297.44); // UIF is 2% (1% employee + 1% employer), capped
      sdl += salary >= 500000/12 ? salary * 0.01 : 0;
    });

    return { 
      paye: paye || 0, 
      uif: uif || 0, 
      sdl: sdl || 0, 
      total: (paye + uif + sdl) || 0 
    };
  };

  const totals = calculateTotals();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">EMP201 Returns</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monthly PAYE, UIF and SDL submissions to SARS
        </p>
      </div>

      {/* SARS Connection Status */}
      {!sarsStatus?.connected && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            SARS is not connected. Please connect to SARS in Settings to submit EMP201 returns.
            <Button 
              variant="link" 
              className="ml-2 p-0 h-auto"
              onClick={() => window.location.href = '/settings'}
            >
              Connect Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">PAYE Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R {totals.paye.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">UIF Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R {totals.uif.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Employee + Employer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">SDL Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R {totals.sdl.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Skills levy</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Period */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Current Period
          </CardTitle>
          <CardDescription>
            Prepare and submit your monthly EMP201 return
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">
                  {new Date().toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Due by 7th of next month
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => generateEMP201.mutate(new Date().toISOString())}
                  disabled={generateEMP201.isPending}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate
                </Button>
                <Button
                  onClick={() => submitToSars.mutate('current')}
                  disabled={!sarsStatus?.connected || submitToSars.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit to SARS
                </Button>
              </div>
            </div>

            {/* Breakdown */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Tax Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>PAYE (Pay As You Earn)</span>
                  <span className="font-medium">R {totals.paye.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>UIF (Unemployment Insurance)</span>
                  <span className="font-medium">R {totals.uif.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>SDL (Skills Development Levy)</span>
                  <span className="font-medium">R {totals.sdl.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total Due</span>
                    <span>R {totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Previous Returns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Previous Returns
          </CardTitle>
          <CardDescription>
            View and manage previously submitted EMP201 returns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payrollData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>PAYE</TableHead>
                  <TableHead>UIF</TableHead>
                  <TableHead>SDL</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollData.map((period: any) => (
                  <TableRow key={period.id}>
                    <TableCell className="font-medium">
                      {new Date(period.period).toLocaleDateString('en-ZA', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </TableCell>
                    <TableCell>{period.employeeCount || 0}</TableCell>
                    <TableCell>R {(period.paye || 0).toFixed(2)}</TableCell>
                    <TableCell>R {(period.uif || 0).toFixed(2)}</TableCell>
                    <TableCell>R {(period.sdl || 0).toFixed(2)}</TableCell>
                    <TableCell className="font-medium">
                      R {(period.total || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        period.status === 'submitted' ? 'default' :
                        period.status === 'pending' ? 'secondary' :
                        'outline'
                      }>
                        {period.status || 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No previous returns found</p>
              <p className="text-sm">Your submitted returns will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
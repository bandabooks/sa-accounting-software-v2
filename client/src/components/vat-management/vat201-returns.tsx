import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { FileText, Plus, Download, Send, Calendar, CheckCircle, Clock, AlertTriangle, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/utils-invoice';

interface VATCalculation {
  totalSalesIncVat: number;
  totalSalesExcVat: number;
  totalSalesVat: number;
  totalPurchasesIncVat: number;
  totalPurchasesExcVat: number;
  totalPurchasesVat: number;
  outputVat: number;
  inputVat: number;
  netVatPayable: number;
  netVatRefund: number;
}

interface VAT201ReturnsProps {
  companyId: number;
}

const VAT201Returns: React.FC<VAT201ReturnsProps> = ({ companyId }) => {
  const [newReturn, setNewReturn] = useState({
    period: '',
    outputVat: '',
    inputVat: '',
    description: ''
  });

  const [isCreating, setIsCreating] = useState(false);
  const [useAutoCalculation, setUseAutoCalculation] = useState(true);
  const { toast } = useToast();

  // Get VAT settings for calculations
  const { data: vatSettings } = useQuery({
    queryKey: ["/api/companies", companyId, "vat-settings"],
  });

  // Get current period dates (bi-monthly by default)
  const getCurrentPeriod = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Calculate period based on bi-monthly schedule
    let periodStart: Date;
    let periodEnd: Date;
    
    if (currentMonth < 2) { // Jan-Feb
      periodStart = new Date(currentYear, 0, 1);
      periodEnd = new Date(currentYear, 1, 28);
    } else if (currentMonth < 4) { // Mar-Apr
      periodStart = new Date(currentYear, 2, 1);
      periodEnd = new Date(currentYear, 3, 30);
    } else if (currentMonth < 6) { // May-Jun
      periodStart = new Date(currentYear, 4, 1);
      periodEnd = new Date(currentYear, 5, 30);
    } else if (currentMonth < 8) { // Jul-Aug
      periodStart = new Date(currentYear, 6, 1);
      periodEnd = new Date(currentYear, 7, 31);
    } else if (currentMonth < 10) { // Sep-Oct
      periodStart = new Date(currentYear, 8, 1);
      periodEnd = new Date(currentYear, 9, 31);
    } else { // Nov-Dec
      periodStart = new Date(currentYear, 10, 1);
      periodEnd = new Date(currentYear, 11, 31);
    }
    
    return { periodStart, periodEnd };
  };

  const [periodDates, setPeriodDates] = useState(getCurrentPeriod());
  const [vatCalculation, setVatCalculation] = useState<VATCalculation>({
    totalSalesIncVat: 0,
    totalSalesExcVat: 0,
    totalSalesVat: 0,
    totalPurchasesIncVat: 0,
    totalPurchasesExcVat: 0,
    totalPurchasesVat: 0,
    outputVat: 0,
    inputVat: 0,
    netVatPayable: 0,
    netVatRefund: 0,
  });

  // Calculate VAT figures based on period
  const { data: vatData, isLoading: isCalculating, error: vatError } = useQuery({
    queryKey: ['/api/vat/reports/summary', periodDates.periodStart, periodDates.periodEnd],
    queryFn: async () => {
      try {
        const startDate = periodDates.periodStart.toISOString().split('T')[0];
        const endDate = periodDates.periodEnd.toISOString().split('T')[0];
        console.log('Making VAT API request:', { startDate, endDate, companyId });
        const response = await fetch(`/api/vat/reports/summary?startDate=${startDate}&endDate=${endDate}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('VAT API response:', data);
        return data;
      } catch (error) {
        console.error('VAT API request failed:', error);
        throw error;
      }
    },
    enabled: !!vatSettings?.isVatRegistered && useAutoCalculation,
    retry: 1,
  });

  useEffect(() => {
    if (vatError) {
      console.error('VAT API Error:', vatError);
    }
    
    if (vatData && useAutoCalculation) {
      console.log('VAT Data received:', vatData);
      
      // The backend now returns summary directly under vatData.summary
      const summary = vatData.summary || {};
      
      console.log('Summary extracted:', summary);
      
      const calculation = {
        totalSalesIncVat: parseFloat(summary.totalSalesIncVat || '0'),
        totalSalesExcVat: parseFloat(summary.totalSalesExcVat || '0'),
        totalSalesVat: parseFloat(summary.totalSalesVat || '0'),
        totalPurchasesIncVat: parseFloat(summary.totalPurchasesIncVat || '0'),
        totalPurchasesExcVat: parseFloat(summary.totalPurchasesExcVat || '0'),
        totalPurchasesVat: parseFloat(summary.totalPurchasesVat || '0'),
        outputVat: parseFloat(summary.outputVat || '0'),
        inputVat: parseFloat(summary.inputVat || '0'),
        netVatPayable: parseFloat(summary.netVatPayable || '0'),
        netVatRefund: parseFloat(summary.netVatRefund || '0'),
      };
      
      console.log('VAT Calculation processed:', calculation);
      
      setVatCalculation(calculation);
      setNewReturn(prev => ({
        ...prev,
        outputVat: calculation.outputVat.toString(),
        inputVat: calculation.inputVat.toString()
      }));
    }
  }, [vatData, vatError, useAutoCalculation]);

  // Create VAT201 mutation
  const createVat201Mutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/vat/vat201/create', 'POST', data),
    onSuccess: () => {
      toast({
        title: "VAT201 Created",
        description: "VAT201 return has been created successfully",
      });
      setIsCreating(false);
      setNewReturn({ period: '', outputVat: '', inputVat: '', description: '' });
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "Unable to create VAT201 return. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Submit to SARS mutation
  const submitToSarsMutation = useMutation({
    mutationFn: (vat201Id: number) => apiRequest(`/api/vat/vat201/${vat201Id}/submit`, 'POST'),
    onSuccess: (data) => {
      toast({
        title: "Submitted to SARS",
        description: `VAT201 submitted successfully. Reference: ${data.sarsReference}`,
      });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Unable to submit to SARS. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCreateReturn = () => {
    const outputVat = parseFloat(newReturn.outputVat) || 0;
    const inputVat = parseFloat(newReturn.inputVat) || 0;
    
    createVat201Mutation.mutate({
      companyId,
      period: newReturn.period,
      outputVat,
      inputVat,
      description: newReturn.description
    });
  };

  const netVat = (parseFloat(newReturn.outputVat) || 0) - (parseFloat(newReturn.inputVat) || 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">VAT201 Returns Management</h2>
        <p className="text-gray-600 dark:text-gray-400">Professional VAT201 creation, management, and SARS submission</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Draft Returns</p>
                <p className="text-2xl font-bold text-blue-600">3</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Submitted</p>
                <p className="text-2xl font-bold text-green-600">12</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">1</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
                <p className="text-2xl font-bold text-red-600">0</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create New VAT201 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New VAT201 Return
          </CardTitle>
          <CardDescription>
            Create a new VAT201 return for submission to SARS with automated calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isCreating ? (
            <Button onClick={() => setIsCreating(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Start New VAT201 Return
            </Button>
          ) : (
            <div className="space-y-6">
              {/* Calculation Mode Toggle */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <Label className="font-medium">Calculation Mode</Label>
                  <p className="text-sm text-gray-600">
                    {useAutoCalculation ? 'Auto-calculating from transactions' : 'Manual entry mode'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUseAutoCalculation(!useAutoCalculation)}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  {useAutoCalculation ? 'Switch to Manual' : 'Use Auto Calculation'}
                </Button>
              </div>

              {/* Period Selection */}
              <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Period Start</Label>
                    <Input
                      type="date"
                      value={periodDates.periodStart.toISOString().split('T')[0]}
                      onChange={(e) => setPeriodDates(prev => ({
                        ...prev,
                        periodStart: new Date(e.target.value)
                      }))}
                      disabled={!useAutoCalculation}
                    />
                  </div>
                  <div>
                    <Label>Period End</Label>
                    <Input
                      type="date"
                      value={periodDates.periodEnd.toISOString().split('T')[0]}
                      onChange={(e) => setPeriodDates(prev => ({
                        ...prev,
                        periodEnd: new Date(e.target.value)
                      }))}
                      disabled={!useAutoCalculation}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      placeholder="Optional description"
                      value={newReturn.description}
                      onChange={(e) => setNewReturn(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>
              </Card>

              {/* VAT Calculation Display */}
              {useAutoCalculation && vatSettings?.isVatRegistered && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Automated VAT Calculation</CardTitle>
                    <CardDescription>
                      Based on invoices and purchases for the selected period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isCalculating ? (
                      <div className="text-center py-8">
                        <div className="animate-spin mx-auto h-8 w-8 border-b-2 border-blue-600 rounded-full"></div>
                        <p className="mt-4 text-gray-600">Calculating VAT figures...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Sales Section */}
                        <div>
                          <h4 className="font-medium text-lg mb-3 text-green-700">Sales (Output VAT)</h4>
                          <div className="grid gap-3 md:grid-cols-3">
                            <div className="p-3 bg-green-50 rounded-lg">
                              <Label className="text-sm text-green-700">Total Sales (Inc. VAT)</Label>
                              <p className="text-lg font-semibold text-green-800">
                                {formatCurrency(vatCalculation.totalSalesIncVat)}
                              </p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                              <Label className="text-sm text-green-700">Total Sales (Exc. VAT)</Label>
                              <p className="text-lg font-semibold text-green-800">
                                {formatCurrency(vatCalculation.totalSalesExcVat)}
                              </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                              <Label className="text-sm text-green-700">VAT on Sales</Label>
                              <p className="text-lg font-bold text-green-900">
                                {formatCurrency(vatCalculation.totalSalesVat)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Purchases Section */}
                        <div>
                          <h4 className="font-medium text-lg mb-3 text-blue-700">Purchases (Input VAT)</h4>
                          <div className="grid gap-3 md:grid-cols-3">
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <Label className="text-sm text-blue-700">Total Purchases (Inc. VAT)</Label>
                              <p className="text-lg font-semibold text-blue-800">
                                {formatCurrency(vatCalculation.totalPurchasesIncVat)}
                              </p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <Label className="text-sm text-blue-700">Total Purchases (Exc. VAT)</Label>
                              <p className="text-lg font-semibold text-blue-800">
                                {formatCurrency(vatCalculation.totalPurchasesExcVat)}
                              </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                              <Label className="text-sm text-blue-700">VAT on Purchases</Label>
                              <p className="text-lg font-bold text-blue-900">
                                {formatCurrency(vatCalculation.totalPurchasesVat)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Net VAT */}
                        <div>
                          <h4 className="font-medium text-lg mb-3">Net VAT Calculation</h4>
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <Label className="text-sm text-gray-700">Output VAT (Sales)</Label>
                              <p className="text-xl font-semibold text-gray-800">
                                {formatCurrency(vatCalculation.outputVat)}
                              </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <Label className="text-sm text-gray-700">Input VAT (Purchases)</Label>
                              <p className="text-xl font-semibold text-gray-800">
                                {formatCurrency(vatCalculation.inputVat)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
                            {vatCalculation.netVatPayable > 0 ? (
                              <div>
                                <Label className="text-sm text-purple-700">Net VAT Payable to SARS</Label>
                                <p className="text-2xl font-bold text-purple-900">
                                  {formatCurrency(vatCalculation.netVatPayable)}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <Label className="text-sm text-green-700">Net VAT Refund from SARS</Label>
                                <p className="text-2xl font-bold text-green-900">
                                  {formatCurrency(Math.abs(vatCalculation.netVatRefund))}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Manual Entry Fields */}
              {!useAutoCalculation && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="outputVat">Output VAT (R)</Label>
                    <Input
                      id="outputVat"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newReturn.outputVat}
                      onChange={(e) => setNewReturn(prev => ({ ...prev, outputVat: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="inputVat">Input VAT (R)</Label>
                    <Input
                      id="inputVat"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newReturn.inputVat}
                      onChange={(e) => setNewReturn(prev => ({ ...prev, inputVat: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Net VAT (R)</Label>
                    <div className="h-10 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 dark:bg-gray-800 flex items-center">
                      <span className={`font-medium ${netVat >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {netVat.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateReturn}
                  disabled={createVat201Mutation.isPending}
                  className="flex-1"
                >
                  {createVat201Mutation.isPending ? 'Creating...' : 'Create VAT201 Return'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing VAT201 Returns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            VAT201 Returns History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: 1,
                period: "Nov 2024 - Dec 2024",
                status: "submitted",
                outputVat: 45230.00,
                inputVat: 12850.00,
                netVat: 32380.00,
                submittedDate: "2025-01-25",
                sarsReference: "SARS-REF-202501250001"
              },
              {
                id: 2,
                period: "Sep 2024 - Oct 2024",
                status: "submitted",
                outputVat: 38420.00,
                inputVat: 15670.00,
                netVat: 22750.00,
                submittedDate: "2024-11-25",
                sarsReference: "SARS-REF-202411250001"
              },
              {
                id: 3,
                period: "Jan 2025 - Feb 2025",
                status: "draft",
                outputVat: 52100.00,
                inputVat: 18230.00,
                netVat: 33870.00,
                submittedDate: null,
                sarsReference: null
              }
            ].map((vatReturn) => (
              <div key={vatReturn.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{vatReturn.period}</h3>
                    <p className="text-sm text-gray-600">
                      {vatReturn.submittedDate ? 
                        `Submitted: ${vatReturn.submittedDate}` : 
                        'Not submitted'
                      }
                    </p>
                  </div>
                  <Badge 
                    variant={vatReturn.status === 'submitted' ? 'default' : 'secondary'}
                    className={
                      vatReturn.status === 'submitted' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {vatReturn.status === 'submitted' ? 'Submitted' : 'Draft'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                  <div>
                    <p className="text-gray-600">Output VAT</p>
                    <p className="font-medium">R {vatReturn.outputVat.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Input VAT</p>
                    <p className="font-medium">R {vatReturn.inputVat.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Net VAT</p>
                    <p className="font-medium text-green-600">R {vatReturn.netVat.toLocaleString()}</p>
                  </div>
                </div>

                {vatReturn.sarsReference && (
                  <p className="text-xs text-gray-500 mb-3">
                    SARS Reference: {vatReturn.sarsReference}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  
                  {vatReturn.status === 'draft' && (
                    <Button 
                      size="sm"
                      onClick={() => submitToSarsMutation.mutate(vatReturn.id)}
                      disabled={submitToSarsMutation.isPending}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Submit to SARS
                    </Button>
                  )}
                  
                  {vatReturn.status === 'submitted' && (
                    <Button size="sm" variant="outline">
                      View SARS Status
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Alert */}
      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertDescription>
          VAT201 returns must be submitted to SARS by the 25th of the month following the end of the VAT period. 
          Late submissions may incur penalties and interest charges.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default VAT201Returns;
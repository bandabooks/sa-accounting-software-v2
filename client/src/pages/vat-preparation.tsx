import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { FileText, Calculator, CheckCircle, AlertCircle, Download, Send, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

const VATPreparation: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: activeCompany } = useQuery({
    queryKey: ['/api/companies/active']
  });

  const companyId = activeCompany?.id || 2;

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
  const { data: vatData, isLoading: isCalculating } = useQuery({
    queryKey: ['/api/vat/reports/summary', periodDates.periodStart, periodDates.periodEnd],
    queryFn: async () => {
      const startDate = periodDates.periodStart.toISOString().split('T')[0];
      const endDate = periodDates.periodEnd.toISOString().split('T')[0];
      return apiRequest(`/api/vat/reports/summary?startDate=${startDate}&endDate=${endDate}&companyId=${companyId}`, 'GET');
    },
    enabled: !!vatSettings?.isVatRegistered,
  });

  useEffect(() => {
    if (vatData) {
      setVatCalculation({
        totalSalesIncVat: parseFloat(vatData.totalSalesIncVat || '0'),
        totalSalesExcVat: parseFloat(vatData.totalSalesExcVat || '0'),
        totalSalesVat: parseFloat(vatData.totalSalesVat || '0'),
        totalPurchasesIncVat: parseFloat(vatData.totalPurchasesIncVat || '0'),
        totalPurchasesExcVat: parseFloat(vatData.totalPurchasesExcVat || '0'),
        totalPurchasesVat: parseFloat(vatData.totalPurchasesVat || '0'),
        outputVat: parseFloat(vatData.outputVat || '0'),
        inputVat: parseFloat(vatData.inputVat || '0'),
        netVatPayable: parseFloat(vatData.netVatPayable || '0'),
        netVatRefund: parseFloat(vatData.netVatRefund || '0'),
      });
    }
  }, [vatData]);

  const submitVAT201Mutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/vat/submit-vat201', 'POST', {
        companyId,
        periodStart: periodDates.periodStart.toISOString().split('T')[0],
        periodEnd: periodDates.periodEnd.toISOString().split('T')[0],
        ...vatCalculation
      });
    },
    onSuccess: () => {
      toast({
        title: "VAT201 Submitted",
        description: "Your VAT201 return has been prepared and saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/vat-reports'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit VAT201. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!vatSettings?.isVatRegistered) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => window.location.href = '/vat-returns'}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to VAT Returns
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">VAT201 Preparation</h1>
          <p className="text-gray-600 dark:text-gray-400">Prepare and submit your VAT201 return</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">VAT Registration Required</h3>
              <p className="text-red-700 mb-4">
                You must be VAT registered to prepare VAT201 returns.
              </p>
              <Button variant="outline" onClick={() => window.location.href = '/vat-settings'}>
                Configure VAT Registration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => window.location.href = '/vat-returns'}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to VAT Returns
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">VAT201 Preparation</h1>
        <p className="text-gray-600 dark:text-gray-400">Prepare and submit your VAT201 return</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Period Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Return Period
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Period Start</Label>
                <Input
                  type="date"
                  value={periodDates.periodStart.toISOString().split('T')[0]}
                  onChange={(e) => setPeriodDates(prev => ({
                    ...prev,
                    periodStart: new Date(e.target.value)
                  }))}
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
                />
              </div>
              <Badge variant="secondary" className="w-full justify-center">
                {vatSettings.vatPeriodMonths === 1 ? "Monthly" : 
                 vatSettings.vatPeriodMonths === 2 ? "Bi-Monthly" : "Bi-Annual"} Return
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* VAT Calculation */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                VAT201 Calculation
              </CardTitle>
              <CardDescription>
                Automated calculation based on your invoices and purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isCalculating ? (
                <div className="text-center py-8">
                  <div className="animate-spin mx-auto h-8 w-8 border-b-2 border-blue-600 rounded-full"></div>
                  <p className="mt-4 text-gray-600">Calculating VAT figures...</p>
                </div>
              ) : (
                <div className="space-y-6">
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

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4">
                    <Button
                      onClick={() => submitVAT201Mutation.mutate()}
                      disabled={submitVAT201Mutation.isPending}
                      className="flex-1 min-w-[140px]"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {submitVAT201Mutation.isPending ? 'Saving...' : 'Save VAT201'}
                    </Button>
                    <Button variant="outline" className="flex-1 min-w-[140px]">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button variant="outline" className="flex-1 min-w-[140px]">
                      <Send className="h-4 w-4 mr-2" />
                      Submit to SARS
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VATPreparation;
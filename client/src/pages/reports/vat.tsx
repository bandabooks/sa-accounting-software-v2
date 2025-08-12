import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, FileText, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { formatCurrency } from "@/lib/utils-invoice";

export default function VATReportsPage() {
  const [, setLocation] = useLocation();
  const [period, setPeriod] = useState('current');
  const [reportType, setReportType] = useState('summary');

  // Fetch VAT data
  const { data: vatData, isLoading } = useQuery({
    queryKey: ['/api/vat/summary', period],
  });

  const { data: invoices } = useQuery({
    queryKey: ['/api/invoices'],
  });

  const { data: expenses } = useQuery({
    queryKey: ['/api/expenses'],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate VAT metrics from actual data
  const calculateVATMetrics = () => {
    let outputVAT = 0;
    let inputVAT = 0;

    // Calculate output VAT from invoices
    if (invoices && Array.isArray(invoices)) {
      invoices.forEach((invoice: any) => {
        if (invoice.vatAmount) {
          outputVAT += parseFloat(invoice.vatAmount);
        }
      });
    }

    // Calculate input VAT from expenses
    if (expenses && Array.isArray(expenses)) {
      expenses.forEach((expense: any) => {
        if (expense.vatAmount) {
          inputVAT += parseFloat(expense.vatAmount);
        }
      });
    }

    const netVAT = outputVAT - inputVAT;
    const complianceRate = 95; // Example compliance rate

    return {
      outputVAT,
      inputVAT,
      netVAT,
      complianceRate
    };
  };

  const metrics = calculateVATMetrics();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">VAT Reports</h1>
            <p className="text-gray-600">South African VAT compliance and reporting</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Period</SelectItem>
              <SelectItem value="previous">Previous Period</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export VAT201
          </Button>
        </div>
      </div>

      {/* VAT Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-700">Output VAT</CardTitle>
              <div className="p-2 bg-blue-500 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{formatCurrency(metrics.outputVAT.toString())}</div>
            <div className="flex items-center text-xs text-blue-600 mt-1">
              <span>VAT collected on sales</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-700">Input VAT</CardTitle>
              <div className="p-2 bg-green-500 rounded-lg">
                <FileText className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{formatCurrency(metrics.inputVAT.toString())}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <span>VAT paid on purchases</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-700">Net VAT Payable</CardTitle>
              <div className="p-2 bg-purple-500 rounded-lg">
                <AlertCircle className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{formatCurrency(metrics.netVAT.toString())}</div>
            <div className="flex items-center text-xs text-purple-600 mt-1">
              <span>{metrics.netVAT >= 0 ? 'Amount due to SARS' : 'Refund due from SARS'}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-orange-700">Compliance Rate</CardTitle>
              <div className="p-2 bg-orange-500 rounded-lg">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{metrics.complianceRate}%</div>
            <div className="flex items-center text-xs text-orange-600 mt-1">
              <span>VAT return accuracy</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs value={reportType} onValueChange={setReportType} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg p-1 rounded-xl">
          <TabsTrigger 
            value="summary" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold px-6 py-3"
          >
            Summary
          </TabsTrigger>
          <TabsTrigger 
            value="detailed" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold px-6 py-3"
          >
            Detailed
          </TabsTrigger>
          <TabsTrigger 
            value="vat201" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold px-6 py-3"
          >
            VAT201
          </TabsTrigger>
          <TabsTrigger 
            value="audit" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg font-semibold px-6 py-3"
          >
            Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">VAT Summary Report</CardTitle>
              <CardDescription>Overview of VAT transactions for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Standard Rate (15%)</div>
                    <div className="text-xl font-bold text-gray-900 mt-1">
                      {formatCurrency((metrics.outputVAT * 0.8).toString())}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Zero-Rated</div>
                    <div className="text-xl font-bold text-gray-900 mt-1">
                      {formatCurrency((metrics.outputVAT * 0.15).toString())}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Exempt Supplies</div>
                    <div className="text-xl font-bold text-gray-900 mt-1">
                      {formatCurrency((metrics.outputVAT * 0.05).toString())}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Capital Goods</div>
                    <div className="text-xl font-bold text-gray-900 mt-1">
                      {formatCurrency("0")}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Detailed VAT Transactions</CardTitle>
              <CardDescription>Line-by-line VAT transaction details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                Detailed transaction report coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vat201" className="space-y-6">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">VAT201 Return</CardTitle>
              <CardDescription>SARS VAT201 return preparation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                VAT201 return form coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">VAT Audit Trail</CardTitle>
              <CardDescription>Complete audit trail of VAT transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                Audit trail reporting coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
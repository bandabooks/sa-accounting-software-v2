import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, FileText, Calculator, TrendingUp, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function VATTransactionAnalysis() {
  const [startDate, setStartDate] = useState('2025-06-30');
  const [endDate, setEndDate] = useState('2025-08-30');

  // Get active company
  const { data: activeCompany } = useQuery({
    queryKey: ['/api/companies/active']
  });

  const companyId = activeCompany?.id || 2;

  // Get VAT transaction analysis
  const { data: vatAnalysis, isLoading, refetch } = useQuery({
    queryKey: ['/api/reports/vat/transactions', { startDate, endDate }],
    enabled: !!companyId && !!startDate && !!endDate
  });

  const exportToPDF = () => {
    // Create a simple PDF export
    const printContent = `
      VAT Transaction Analysis
      Period: ${startDate} to ${endDate}
      Company: ${activeCompany?.name || 'Default Company'}
      
      OUTPUT VAT (Sales):
      ${vatAnalysis?.outputTransactions.transactions.map(tx => 
        `${tx.date} | ${tx.reference} | ${tx.customerName} | R${tx.netAmount} + R${tx.vatAmount} = R${tx.grossAmount}`
      ).join('\n')}
      
      Total Output VAT: R${vatAnalysis?.outputTransactions.totals.vatAmount}
      
      INPUT VAT (Purchases):
      ${vatAnalysis?.inputTransactions.transactions.map(tx => 
        `${tx.date} | ${tx.reference} | ${tx.supplierName} | R${tx.netAmount} + R${tx.vatAmount} = R${tx.grossAmount}`
      ).join('\n')}
      
      Total Input VAT: R${vatAnalysis?.inputTransactions.totals.vatAmount}
      
      Net VAT Payable: R${vatAnalysis?.summary.netVatPayable}
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<pre>${printContent}</pre>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const exportToCSV = () => {
    if (!vatAnalysis) return;
    
    let csvContent = 'Type,Date,Reference,Customer/Supplier,Net Amount,VAT Amount,Gross Amount,VAT Code\n';
    
    // Add output transactions
    vatAnalysis.outputTransactions.transactions.forEach(tx => {
      csvContent += `Sales,${tx.date},${tx.reference},"${tx.customerName}",${tx.netAmount},${tx.vatAmount},${tx.grossAmount},"${tx.vatCode}"\n`;
    });
    
    // Add input transactions
    vatAnalysis.inputTransactions.transactions.forEach(tx => {
      csvContent += `Purchase,${tx.date},${tx.reference},"${tx.supplierName}",${tx.netAmount},${tx.vatAmount},${tx.grossAmount},"${tx.vatCode}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vat-transaction-analysis-${startDate}-to-${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">VAT Transaction Analysis</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Detailed breakdown of all VAT-related transactions for verification and analysis
        </p>
      </div>

      {/* Date Range Filter */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Report Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={() => refetch()} className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {vatAnalysis && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Output VAT</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R {vatAnalysis.summary.outputVat}</div>
              <p className="text-xs text-muted-foreground">{vatAnalysis.outputTransactions.totals.count} transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Input VAT</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">R {vatAnalysis.summary.inputVat}</div>
              <p className="text-xs text-muted-foreground">{vatAnalysis.inputTransactions.totals.count} transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Net VAT Payable</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">R {vatAnalysis.summary.netVatPayable}</div>
              <p className="text-xs text-muted-foreground">Due to SARS</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button size="sm" variant="outline" onClick={exportToCSV} className="w-full">
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
              <Button size="sm" variant="outline" onClick={exportToPDF} className="w-full">
                <FileText className="h-4 w-4 mr-1" />
                PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Output VAT Transactions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Output VAT (Sales)
          </CardTitle>
          <CardDescription>
            VAT collected on sales - {vatAnalysis?.outputTransactions.totals.count || 0} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading transactions...</div>
          ) : vatAnalysis?.outputTransactions.transactions.length > 0 ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Net Amount</TableHead>
                    <TableHead>VAT Amount</TableHead>
                    <TableHead>Gross Amount</TableHead>
                    <TableHead>VAT Code</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vatAnalysis.outputTransactions.transactions.map((tx: any) => (
                    <TableRow key={tx.id}>
                      <TableCell>{format(new Date(tx.date), 'yyyy-MM-dd')}</TableCell>
                      <TableCell className="font-medium">{tx.reference}</TableCell>
                      <TableCell>{tx.customerName || 'N/A'}</TableCell>
                      <TableCell>R {tx.netAmount}</TableCell>
                      <TableCell className="font-medium text-green-600">R {tx.vatAmount}</TableCell>
                      <TableCell>R {tx.grossAmount}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{tx.vatCode}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-medium">
                  <span>Total Output VAT:</span>
                  <span className="text-green-600">R {vatAnalysis.outputTransactions.totals.vatAmount}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No output VAT transactions found for the selected period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Input VAT Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600 rotate-180" />
            Input VAT (Purchases)
          </CardTitle>
          <CardDescription>
            VAT paid on purchases - {vatAnalysis?.inputTransactions.totals.count || 0} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading transactions...</div>
          ) : vatAnalysis?.inputTransactions.transactions.length > 0 ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Net Amount</TableHead>
                    <TableHead>VAT Amount</TableHead>
                    <TableHead>Gross Amount</TableHead>
                    <TableHead>VAT Code</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vatAnalysis.inputTransactions.transactions.map((tx: any) => (
                    <TableRow key={tx.id}>
                      <TableCell>{format(new Date(tx.date), 'yyyy-MM-dd')}</TableCell>
                      <TableCell className="font-medium">{tx.reference}</TableCell>
                      <TableCell>{tx.supplierName}</TableCell>
                      <TableCell>R {tx.netAmount}</TableCell>
                      <TableCell className="font-medium text-blue-600">R {tx.vatAmount}</TableCell>
                      <TableCell>R {tx.grossAmount}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{tx.vatCode}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-medium">
                  <span>Total Input VAT:</span>
                  <span className="text-blue-600">R {vatAnalysis.inputTransactions.totals.vatAmount}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No input VAT transactions found for the selected period
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
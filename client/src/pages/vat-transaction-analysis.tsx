import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, FileText, Calculator, TrendingUp, Search, Printer } from 'lucide-react';
import { format } from 'date-fns';

export default function VATTransactionAnalysis() {
  const [startDate, setStartDate] = useState('2025-07-01');
  const [endDate, setEndDate] = useState('2025-08-31');

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

  const generatePrintView = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !vatAnalysis) return;
    
    // Check if we have the grouped structure or need to process it
    let outputTransactions, inputTransactions, outputTotals, inputTotals;
    
    if (vatAnalysis.outputTransactions && vatAnalysis.inputTransactions) {
      // Data is already grouped
      outputTransactions = vatAnalysis.outputTransactions.transactions;
      inputTransactions = vatAnalysis.inputTransactions.transactions;
      outputTotals = vatAnalysis.outputTransactions.totals;
      inputTotals = vatAnalysis.inputTransactions.totals;
    } else if (Array.isArray(vatAnalysis.transactions)) {
      // Data needs to be grouped
      outputTransactions = vatAnalysis.transactions.filter((t: any) => t.type === 'Sale');
      inputTransactions = vatAnalysis.transactions.filter((t: any) => t.type === 'Purchase');
      
      outputTotals = outputTransactions.reduce((acc: any, tx: any) => ({
        netAmount: (acc.netAmount + parseFloat(tx.netAmount || 0)).toFixed(2),
        vatAmount: (acc.vatAmount + parseFloat(tx.vatAmount || 0)).toFixed(2),
        grossAmount: (acc.grossAmount + parseFloat(tx.grossAmount || 0)).toFixed(2),
        count: acc.count + 1
      }), { netAmount: 0, vatAmount: 0, grossAmount: 0, count: 0 });
      
      inputTotals = inputTransactions.reduce((acc: any, tx: any) => ({
        netAmount: (acc.netAmount + parseFloat(tx.netAmount || 0)).toFixed(2),
        vatAmount: (acc.vatAmount + parseFloat(tx.vatAmount || 0)).toFixed(2),
        grossAmount: (acc.grossAmount + parseFloat(tx.grossAmount || 0)).toFixed(2),
        count: acc.count + 1
      }), { netAmount: 0, vatAmount: 0, grossAmount: 0, count: 0 });
    } else {
      console.error('Unexpected data structure:', vatAnalysis);
      return;
    }
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>VAT Transaction Analysis</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px;
            font-size: 12px;
          }
          h1 { 
            color: #1e40af; 
            font-size: 20px;
            margin-bottom: 5px;
          }
          h2 { 
            color: #1e40af; 
            font-size: 16px;
            margin-top: 20px;
            margin-bottom: 10px;
            background: #f3f4f6;
            padding: 5px 10px;
          }
          h3 {
            font-size: 14px;
            margin: 15px 0 10px 0;
          }
          .header-info { 
            margin-bottom: 20px;
            border-bottom: 2px solid #1e40af;
            padding-bottom: 10px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px;
          }
          th { 
            background: #f3f4f6; 
            padding: 8px; 
            text-align: left;
            font-weight: bold;
            border: 1px solid #d1d5db;
          }
          td { 
            padding: 6px 8px; 
            border: 1px solid #d1d5db;
          }
          .total-row { 
            font-weight: bold; 
            background: #f9fafb;
          }
          .summary-box {
            background: #f3f4f6;
            padding: 15px;
            margin-top: 20px;
            border: 1px solid #d1d5db;
          }
          .transaction-summary {
            background: #eff6ff;
            padding: 10px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <h1>VAT TRANSACTION ANALYSIS</h1>
        <div class="header-info">
          <p><strong>Period:</strong> ${format(new Date(startDate), 'dd/MM/yyyy')} to ${format(new Date(endDate), 'dd/MM/yyyy')}</p>
          <p><strong>Generated:</strong> ${format(new Date(), 'dd/MM/yyyy')}</p>
        </div>
        
        <div class="transaction-summary">
          <h3>TRANSACTION SUMMARY</h3>
          <p>Total Transactions: ${outputTotals.count + inputTotals.count}</p>
          <p>Sales Transactions: ${outputTotals.count}</p>
          <p>Purchase Transactions: ${inputTotals.count}</p>
        </div>

        <h2>TRANSACTION DETAILS</h2>
        
        <h3 style="color: #059669;">Sales (Output VAT)</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Reference</th>
              <th>Description</th>
              <th>Net</th>
              <th>VAT</th>
              <th>Gross</th>
            </tr>
          </thead>
          <tbody>
            ${outputTransactions.map((tx: any) => `
              <tr>
                <td>${format(new Date(tx.date), 'yyyy/MM/dd')}</td>
                <td>Sale</td>
                <td>${tx.reference}</td>
                <td>Invoice - ${tx.customerName || tx.description || 'N/A'}</td>
                <td style="text-align: right;">R ${tx.netAmount}</td>
                <td style="text-align: right;">R ${tx.vatAmount}</td>
                <td style="text-align: right;">R ${tx.grossAmount}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="4">Total for Sales</td>
              <td style="text-align: right;">R ${outputTotals.netAmount}</td>
              <td style="text-align: right;">R ${outputTotals.vatAmount}</td>
              <td style="text-align: right;">R ${outputTotals.grossAmount}</td>
            </tr>
          </tbody>
        </table>

        <h3 style="color: #dc2626;">Purchases (Input VAT)</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Reference</th>
              <th>Description</th>
              <th>Net</th>
              <th>VAT</th>
              <th>Gross</th>
            </tr>
          </thead>
          <tbody>
            ${inputTransactions.map((tx: any) => `
              <tr>
                <td>${format(new Date(tx.date), 'yyyy/MM/dd')}</td>
                <td>Purchase</td>
                <td>${tx.reference || 'N/A'}</td>
                <td>${tx.supplierName || tx.description || 'N/A'}</td>
                <td style="text-align: right;">R ${tx.netAmount}</td>
                <td style="text-align: right;">R ${tx.vatAmount}</td>
                <td style="text-align: right;">R ${tx.grossAmount}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="4">Total for Purchases</td>
              <td style="text-align: right;">R ${inputTotals.netAmount}</td>
              <td style="text-align: right;">R ${inputTotals.vatAmount}</td>
              <td style="text-align: right;">R ${inputTotals.grossAmount}</td>
            </tr>
          </tbody>
        </table>

        <div class="summary-box">
          <h3>VAT SUMMARY</h3>
          <table>
            <tr>
              <td><strong>Output VAT (Sales):</strong></td>
              <td style="text-align: right;"><strong>R ${outputTotals.vatAmount}</strong></td>
            </tr>
            <tr>
              <td><strong>Input VAT (Purchases):</strong></td>
              <td style="text-align: right;"><strong>R ${inputTotals.vatAmount}</strong></td>
            </tr>
            <tr style="border-top: 2px solid #000;">
              <td><strong>Net VAT Payable to SARS:</strong></td>
              <td style="text-align: right;"><strong>R ${(parseFloat(outputTotals.vatAmount) - parseFloat(inputTotals.vatAmount)).toFixed(2)}</strong></td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const exportToCSV = () => {
    if (!vatAnalysis) return;
    
    let csvContent = 'Date,Type,Reference,Description,Net Amount,VAT Amount,Gross Amount\n';
    
    // Add sales transactions
    csvContent += '--- SALES (OUTPUT VAT) ---\n';
    vatAnalysis.outputTransactions.transactions.forEach(tx => {
      csvContent += `${format(new Date(tx.date), 'yyyy/MM/dd')},Sale,${tx.reference},"Invoice - ${tx.customerName}",${tx.netAmount},${tx.vatAmount},${tx.grossAmount}\n`;
    });
    csvContent += `,,,Total for Sales,${vatAnalysis.outputTransactions.totals.netAmount},${vatAnalysis.outputTransactions.totals.vatAmount},${vatAnalysis.outputTransactions.totals.grossAmount}\n\n`;
    
    // Add purchase transactions
    csvContent += '--- PURCHASES (INPUT VAT) ---\n';
    vatAnalysis.inputTransactions.transactions.forEach(tx => {
      csvContent += `${format(new Date(tx.date), 'yyyy/MM/dd')},Purchase,${tx.reference || 'N/A'},"${tx.supplierName}",${tx.netAmount},${tx.vatAmount},${tx.grossAmount}\n`;
    });
    csvContent += `,,,Total for Purchases,${vatAnalysis.inputTransactions.totals.netAmount},${vatAnalysis.inputTransactions.totals.vatAmount},${vatAnalysis.inputTransactions.totals.grossAmount}\n`;
    
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
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">VAT Transaction Analysis</h1>
        <p className="text-blue-100">
          Detailed breakdown of all VAT transactions with comprehensive sales and purchase grouping
        </p>
      </div>

      {/* Date Range Filter */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Report Configuration
          </CardTitle>
          <CardDescription>Configure date range and export settings for your VAT report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
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
            <div className="flex items-end gap-2 md:col-span-2">
              <Button onClick={() => refetch()} className="flex-1">
                <Calculator className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button variant="outline" onClick={generatePrintView} disabled={!vatAnalysis}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" onClick={exportToCSV} disabled={!vatAnalysis}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Summary */}
      {vatAnalysis && (
        <Card className="mb-6 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-300">TRANSACTION SUMMARY</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{vatAnalysis.outputTransactions.totals.count + vatAnalysis.inputTransactions.totals.count}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sales Transactions</p>
                <p className="text-2xl font-bold text-green-600">{vatAnalysis.outputTransactions.totals.count}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Purchase Transactions</p>
                <p className="text-2xl font-bold text-red-600">{vatAnalysis.inputTransactions.totals.count}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction Details Header */}
      {vatAnalysis && (
        <div className="mb-4">
          <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300">TRANSACTION DETAILS</h2>
          <p className="text-sm text-muted-foreground">
            Period: {format(new Date(startDate), 'dd/MM/yyyy')} to {format(new Date(endDate), 'dd/MM/yyyy')}
          </p>
          <p className="text-sm text-muted-foreground">
            Generated: {format(new Date(), 'dd/MM/yyyy')}
          </p>
        </div>
      )}

      {/* Sales Transactions (Output VAT) */}
      <Card className="mb-6">
        <CardHeader className="bg-green-50 dark:bg-green-950">
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <TrendingUp className="h-5 w-5" />
            Sales (Output VAT)
          </CardTitle>
          <CardDescription>
            VAT collected on sales - {vatAnalysis?.outputTransactions.totals.count || 0} transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8">Loading transactions...</div>
          ) : vatAnalysis?.outputTransactions.transactions.length > 0 ? (
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Net</TableHead>
                    <TableHead className="text-right">VAT</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vatAnalysis.outputTransactions.transactions.map((tx: any) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-sm">{format(new Date(tx.date), 'yyyy/MM/dd')}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          Sale
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{tx.reference}</TableCell>
                      <TableCell>Invoice - {tx.customerName || 'N/A'}</TableCell>
                      <TableCell className="text-right font-mono">R {tx.netAmount}</TableCell>
                      <TableCell className="text-right font-mono font-medium text-green-600">R {tx.vatAmount}</TableCell>
                      <TableCell className="text-right font-mono font-bold">R {tx.grossAmount}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-gray-50 dark:bg-gray-900 font-bold">
                    <TableCell colSpan={4}>Total for Sales</TableCell>
                    <TableCell className="text-right font-mono">R {vatAnalysis.outputTransactions.totals.netAmount}</TableCell>
                    <TableCell className="text-right font-mono text-green-600">R {vatAnalysis.outputTransactions.totals.vatAmount}</TableCell>
                    <TableCell className="text-right font-mono">R {vatAnalysis.outputTransactions.totals.grossAmount}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No sales transactions found for the selected period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchase Transactions (Input VAT) */}
      <Card className="mb-6">
        <CardHeader className="bg-red-50 dark:bg-red-950">
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <TrendingUp className="h-5 w-5 rotate-180" />
            Purchases (Input VAT)
          </CardTitle>
          <CardDescription>
            VAT paid on purchases - {vatAnalysis?.inputTransactions.totals.count || 0} transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8">Loading transactions...</div>
          ) : vatAnalysis?.inputTransactions.transactions.length > 0 ? (
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Net</TableHead>
                    <TableHead className="text-right">VAT</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vatAnalysis.inputTransactions.transactions.map((tx: any) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-sm">{format(new Date(tx.date), 'yyyy/MM/dd')}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                          Purchase
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{tx.reference || 'N/A'}</TableCell>
                      <TableCell>{tx.supplierName}</TableCell>
                      <TableCell className="text-right font-mono">R {tx.netAmount}</TableCell>
                      <TableCell className="text-right font-mono font-medium text-red-600">R {tx.vatAmount}</TableCell>
                      <TableCell className="text-right font-mono font-bold">R {tx.grossAmount}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-gray-50 dark:bg-gray-900 font-bold">
                    <TableCell colSpan={4}>Total for Purchases</TableCell>
                    <TableCell className="text-right font-mono">R {vatAnalysis.inputTransactions.totals.netAmount}</TableCell>
                    <TableCell className="text-right font-mono text-red-600">R {vatAnalysis.inputTransactions.totals.vatAmount}</TableCell>
                    <TableCell className="text-right font-mono">R {vatAnalysis.inputTransactions.totals.grossAmount}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No purchase transactions found for the selected period
            </div>
          )}
        </CardContent>
      </Card>

      {/* VAT Summary */}
      {vatAnalysis && (
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardHeader>
            <CardTitle className="text-lg">VAT SUMMARY</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="font-medium">Output VAT (Sales)</span>
                <span className="text-xl font-bold text-green-600">R {vatAnalysis.summary.outputVat}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="font-medium">Input VAT (Purchases)</span>
                <span className="text-xl font-bold text-red-600">R {vatAnalysis.summary.inputVat}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold">Net VAT Payable to SARS</span>
                <span className="text-2xl font-bold text-blue-700">R {vatAnalysis.summary.netVatPayable}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
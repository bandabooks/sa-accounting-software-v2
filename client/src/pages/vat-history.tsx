import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, FileText, Download, Eye, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils-invoice';

const VATHistory: React.FC = () => {
  const { data: activeCompany } = useQuery({
    queryKey: ['/api/companies/active']
  });

  const companyId = activeCompany?.id || 2;

  const { data: vatSettings } = useQuery({
    queryKey: ["/api/companies", companyId, "vat-settings"],
  });

  const { data: vatReports, isLoading } = useQuery({
    queryKey: ["/api/vat-reports"],
    enabled: !!vatSettings?.isVatRegistered,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'draft':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!vatSettings?.isVatRegistered) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => window.location.href = '/vat-returns'}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to VAT Returns
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">VAT Return History</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage your VAT return history</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">VAT Registration Required</h3>
              <p className="text-red-700 mb-4">
                You must be VAT registered to view VAT return history.
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => window.location.href = '/vat-returns'}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to VAT Returns
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">VAT Return History</h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage your VAT return history</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Previous VAT Returns
          </CardTitle>
          <CardDescription>
            All previously submitted VAT201 returns for {activeCompany?.name || 'your company'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin mx-auto h-8 w-8 border-b-2 border-blue-600 rounded-full"></div>
              <p className="mt-4 text-gray-600">Loading VAT return history...</p>
            </div>
          ) : vatReports && vatReports.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>VAT Payable</TableHead>
                    <TableHead>VAT Refund</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vatReports.map((report: any) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            {new Date(report.periodStart).toLocaleDateString('en-ZA', { 
                              year: 'numeric', 
                              month: 'short' 
                            })} - {new Date(report.periodEnd).toLocaleDateString('en-ZA', { 
                              year: 'numeric', 
                              month: 'short' 
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {report.netVatPayable > 0 ? (
                          <span className="font-semibold text-red-600">
                            {formatCurrency(parseFloat(report.netVatPayable))}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {report.netVatRefund > 0 ? (
                          <span className="font-semibold text-green-600">
                            {formatCurrency(parseFloat(report.netVatRefund))}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(report.status)}
                          {getStatusBadge(report.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {report.submittedAt ? (
                          <span className="text-sm text-gray-600">
                            {new Date(report.submittedAt).toLocaleDateString('en-ZA')}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No VAT Returns Found</h3>
              <p className="text-gray-500 mb-4">
                You haven't submitted any VAT returns yet.
              </p>
              <Button onClick={() => window.location.href = '/vat-preparation'}>
                <Calendar className="h-4 w-4 mr-2" />
                Prepare First VAT201
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {vatReports && vatReports.length > 0 && (
        <div className="grid gap-6 md:grid-cols-3 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <h4 className="font-medium text-gray-600">Total Returns</h4>
                <p className="text-2xl font-bold text-blue-600">{vatReports.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <h4 className="font-medium text-gray-600">Total VAT Paid</h4>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(
                    vatReports.reduce((sum: number, report: any) => 
                      sum + parseFloat(report.netVatPayable || '0'), 0
                    )
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <h4 className="font-medium text-gray-600">Total Refunds</h4>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    vatReports.reduce((sum: number, report: any) => 
                      sum + parseFloat(report.netVatRefund || '0'), 0
                    )
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VATHistory;
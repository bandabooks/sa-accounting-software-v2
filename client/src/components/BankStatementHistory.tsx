import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Clock, FileText, CheckCircle, AlertTriangle, X, Eye, Download, Search, Filter, BarChart3 } from 'lucide-react';
import { formatDistance } from 'date-fns';

interface BankStatementImport {
  id: number;
  fileName: string;
  bankName?: string;
  accountNumber?: string;
  importDate: string;
  statementPeriod?: string;
  totalTransactions: number;
  processedTransactions: number;
  matchedTransactions: number;
  duplicatesFound: number;
  status: 'processing' | 'completed' | 'error' | 'review_required';
  errorMessage?: string;
  importedBy: number;
  completedAt?: string;
}

interface TransactionStatus {
  id: number;
  transactionId: string;
  description: string;
  amount: string;
  transactionDate: string;
  status: 'needs_review' | 'in_review' | 'completed' | 'duplicate' | 'rejected';
  assignedAccountName?: string;
  confidenceScore: string;
  aiReasoning?: string;
  reviewedBy?: number;
  reviewedAt?: string;
}

interface ReviewQueueSummary {
  needsReview: number;
  inReview: number;
  completed: number;
  duplicates: number;
  rejected: number;
}

const statusColors = {
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  review_required: 'bg-orange-100 text-orange-800'
};

const transactionStatusColors = {
  needs_review: 'bg-orange-100 text-orange-800',
  in_review: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  duplicate: 'bg-gray-100 text-gray-800',
  rejected: 'bg-red-100 text-red-800'
};

export default function BankStatementHistory() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImport, setSelectedImport] = useState<number | null>(null);

  // Fetch bank statement imports
  const { data: imports = [], isLoading: importsLoading } = useQuery({
    queryKey: ['/api/bank-statement-imports', selectedStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      params.set('limit', '50');
      
      const response = await fetch(`/api/bank-statement-imports?${params}`);
      if (!response.ok) throw new Error('Failed to fetch imports');
      return response.json() as BankStatementImport[];
    }
  });

  // Fetch review queue summary
  const { data: reviewSummary } = useQuery({
    queryKey: ['/api/review-queue-summary'],
    queryFn: async () => {
      const response = await fetch('/api/review-queue-summary');
      if (!response.ok) throw new Error('Failed to fetch review summary');
      return response.json() as ReviewQueueSummary;
    }
  });

  // Fetch import statistics
  const { data: importStats } = useQuery({
    queryKey: ['/api/import-statistics'],
    queryFn: async () => {
      const response = await fetch('/api/import-statistics');
      if (!response.ok) throw new Error('Failed to fetch statistics');
      return response.json();
    }
  });

  // Fetch transactions for selected import
  const { data: importDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['/api/bank-statement-imports', selectedImport],
    queryFn: async () => {
      if (!selectedImport) return null;
      const response = await fetch(`/api/bank-statement-imports/${selectedImport}`);
      if (!response.ok) throw new Error('Failed to fetch import details');
      return response.json();
    },
    enabled: !!selectedImport
  });

  const filteredImports = imports.filter(imp => 
    imp.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    imp.bankName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <X className="h-4 w-4" />;
      case 'review_required': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {reviewSummary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Needs Review</p>
                  <p className="text-2xl font-bold text-orange-600">{reviewSummary.needsReview}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Review</p>
                  <p className="text-2xl font-bold text-blue-600">{reviewSummary.inReview}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{reviewSummary.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Duplicates</p>
                  <p className="text-2xl font-bold text-gray-600">{reviewSummary.duplicates}</p>
                </div>
                <X className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {importStats ? `${importStats.successRate}%` : '--'}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="imports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="imports">Statement History</TabsTrigger>
          <TabsTrigger value="review">Review Queue</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="imports" className="space-y-4">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by filename or bank..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-statements"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="review_required">Review Required</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Statement Import List */}
          <div className="grid gap-4">
            {importsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading statement history...</p>
              </div>
            ) : filteredImports.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Bank Statements Found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || selectedStatus !== 'all' 
                      ? 'No statements match your current filters.'
                      : 'Upload your first bank statement to get started with automated transaction processing.'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredImports.map((imp) => (
                <Card key={imp.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(imp.status)}
                        <div>
                          <CardTitle className="text-lg">{imp.fileName}</CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            {imp.bankName && <span>{imp.bankName}</span>}
                            {imp.accountNumber && <span>•••{imp.accountNumber.slice(-4)}</span>}
                            {imp.statementPeriod && <span>{imp.statementPeriod}</span>}
                          </div>
                        </div>
                      </div>
                      <Badge className={statusColors[imp.status]}>
                        {formatStatus(imp.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{imp.totalTransactions}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{imp.processedTransactions}</p>
                        <p className="text-xs text-muted-foreground">Processed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-indigo-600">{imp.matchedTransactions}</p>
                        <p className="text-xs text-muted-foreground">Matched</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{imp.duplicatesFound}</p>
                        <p className="text-xs text-muted-foreground">Duplicates</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Imported {formatDistance(new Date(imp.importDate), new Date(), { addSuffix: true })}
                        {imp.completedAt && ` • Completed ${formatDistance(new Date(imp.completedAt), new Date(), { addSuffix: true })}`}
                      </p>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedImport(imp.id)}
                          data-testid={`view-import-${imp.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>

                    {imp.errorMessage && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">{imp.errorMessage}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="review">
          {/* Review Queue Interface */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Review Queue</CardTitle>
              <p className="text-muted-foreground">
                Review and categorize transactions that require your attention
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Review queue interface coming soon. This will provide a powerful workflow for reviewing 
                and approving transactions that exceed QuickBooks capabilities.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          {/* Analytics Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle>Import Analytics</CardTitle>
              <p className="text-muted-foreground">
                Detailed insights into your bank statement processing performance
              </p>
            </CardHeader>
            <CardContent>
              {importStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{importStats.totalImports}</p>
                    <p className="text-muted-foreground">Total Imports</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{importStats.totalTransactions}</p>
                    <p className="text-muted-foreground">Total Transactions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-indigo-600">{importStats.successRate}%</p>
                    <p className="text-muted-foreground">Success Rate</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Import Details Modal/Sidebar would go here */}
      {selectedImport && importDetails && (
        <Card className="fixed right-4 top-4 bottom-4 w-96 z-50 overflow-auto shadow-xl">
          <CardHeader className="sticky top-0 bg-background border-b">
            <div className="flex items-center justify-between">
              <CardTitle>Import Details</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedImport(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Import Information</h4>
                <p className="text-sm"><strong>File:</strong> {importDetails.import.fileName}</p>
                <p className="text-sm"><strong>Bank:</strong> {importDetails.import.bankName || 'Unknown'}</p>
                <p className="text-sm"><strong>Period:</strong> {importDetails.import.statementPeriod || 'Not specified'}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Transactions ({importDetails.transactions?.length || 0})</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {importDetails.transactions?.map((transaction: TransactionStatus) => (
                    <div key={transaction.id} className="p-2 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">R{transaction.amount}</p>
                        </div>
                        <Badge className={transactionStatusColors[transaction.status]} size="sm">
                          {formatStatus(transaction.status)}
                        </Badge>
                      </div>
                      {transaction.assignedAccountName && (
                        <p className="text-xs text-green-600 mt-1">→ {transaction.assignedAccountName}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
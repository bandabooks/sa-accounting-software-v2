import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { VATTypeSelect } from '@/components/ui/vat-type-select';
import { useToast } from '@/hooks/use-toast';
import { Clock, FileText, CheckCircle, AlertTriangle, X, Eye, Download, Search, Filter, BarChart3, ThumbsUp, ThumbsDown, Edit, DollarSign, User, Calendar } from 'lucide-react';
import { formatDistance, format } from 'date-fns';

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

// ReviewQueueInterface Component
function ReviewQueueInterface() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTransactions, setSelectedTransactions] = useState<Set<number>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('needs_review');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch review queue transactions
  const { data: reviewTransactions = [], isLoading } = useQuery({
    queryKey: ['/api/review-queue', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('limit', '100');
      
      const response = await fetch(`/api/review-queue?${params}`);
      if (!response.ok) throw new Error('Failed to fetch review queue');
      const data = await response.json();
      return data as TransactionStatus[];
    }
  });

  // Fetch chart of accounts for categorization
  const { data: chartOfAccounts = [] } = useQuery({
    queryKey: ['/api/chart-of-accounts'],
    queryFn: async () => {
      const response = await fetch('/api/chart-of-accounts');
      if (!response.ok) throw new Error('Failed to fetch chart of accounts');
      return response.json();
    }
  });

  // Update transaction mutation
  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<TransactionStatus> }) => {
      const response = await fetch(`/api/review-queue/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update transaction');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/review-queue'] });
      queryClient.invalidateQueries({ queryKey: ['/api/review-queue-summary'] });
      toast({
        title: "Transaction Updated",
        description: "Transaction has been successfully updated",
      });
    }
  });

  // Bulk approve/reject mutations
  const bulkActionMutation = useMutation({
    mutationFn: async ({ ids, action }: { ids: number[]; action: 'approve' | 'reject' }) => {
      const response = await fetch('/api/review-queue/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionIds: ids, action })
      });
      if (!response.ok) throw new Error('Failed to perform bulk action');
      return response.json();
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/review-queue'] });
      queryClient.invalidateQueries({ queryKey: ['/api/review-queue-summary'] });
      setSelectedTransactions(new Set());
      toast({
        title: `Bulk ${action === 'approve' ? 'Approval' : 'Rejection'} Complete`,
        description: `Successfully ${action}d ${selectedTransactions.size} transactions`,
      });
    }
  });

  const handleTransactionUpdate = useCallback((id: number, field: keyof TransactionStatus, value: any) => {
    updateTransactionMutation.mutate({ id, updates: { [field]: value } });
  }, [updateTransactionMutation]);

  const handleBulkAction = useCallback((action: 'approve' | 'reject') => {
    const ids = Array.from(selectedTransactions);
    if (ids.length === 0) {
      toast({
        title: "No Transactions Selected",
        description: "Please select transactions to perform bulk actions",
        variant: "destructive",
      });
      return;
    }
    bulkActionMutation.mutate({ ids, action });
  }, [selectedTransactions, bulkActionMutation, toast]);

  const filteredTransactions = reviewTransactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'needs_review': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'in_review': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'duplicate': return <X className="h-4 w-4 text-gray-500" />;
      case 'rejected': return <ThumbsDown className="h-4 w-4 text-red-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                Transaction Review Queue
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Review and categorize transactions that require your attention
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {selectedTransactions.size > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('approve')}
                    disabled={bulkActionMutation.isPending}
                    data-testid="bulk-approve"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Approve {selectedTransactions.size}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('reject')}
                    disabled={bulkActionMutation.isPending}
                    data-testid="bulk-reject"
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Reject {selectedTransactions.size}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-review-queue"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="needs_review">Needs Review</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="duplicate">Duplicates</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transaction List */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading review queue...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Review Queue Empty</h3>
              <p className="text-muted-foreground">
                {statusFilter === 'needs_review' 
                  ? "All transactions have been reviewed! Great work." 
                  : "No transactions found matching your current filters."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Select All Checkbox */}
              {filteredTransactions.length > 0 && (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.size === filteredTransactions.length && filteredTransactions.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTransactions(new Set(filteredTransactions.map(t => t.id)));
                      } else {
                        setSelectedTransactions(new Set());
                      }
                    }}
                    className="h-4 w-4"
                    data-testid="select-all-transactions"
                  />
                  <span className="text-sm font-medium">
                    Select All ({filteredTransactions.length} transactions)
                  </span>
                  {selectedTransactions.size > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedTransactions.size} selected
                    </Badge>
                  )}
                </div>
              )}

              {/* Transaction Cards */}
              {filteredTransactions.map((transaction) => (
                <Card key={transaction.id} className={`transition-all duration-200 ${
                  selectedTransactions.has(transaction.id) ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {/* Selection Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedTransactions.has(transaction.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedTransactions);
                          if (e.target.checked) {
                            newSelected.add(transaction.id);
                          } else {
                            newSelected.delete(transaction.id);
                          }
                          setSelectedTransactions(newSelected);
                        }}
                        className="mt-1 h-4 w-4"
                        data-testid={`select-transaction-${transaction.id}`}
                      />

                      {/* Transaction Details */}
                      <div className="flex-1 space-y-3">
                        {/* Header Row */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(transaction.status)}
                            <Badge className={transactionStatusColors[transaction.status]}>
                              {formatStatus(transaction.status)}
                            </Badge>
                            {transaction.confidenceScore && (
                              <Badge variant="outline" className="text-xs">
                                {transaction.confidenceScore}% confidence
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(transaction.transactionDate), 'MMM dd, yyyy')}
                            </span>
                            <span className="text-lg font-bold text-green-600">
                              R{parseFloat(transaction.amount).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Transaction Description */}
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">ID: {transaction.transactionId}</p>
                        </div>

                        {/* Account Assignment */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Assign to Account
                            </label>
                            <SearchableSelect
                              options={chartOfAccounts.map((account: any) => ({
                                value: account.id.toString(),
                                label: account.accountName,
                                subtext: account.accountCode
                              }))}
                              value={transaction.assignedAccountName || ''}
                              onValueChange={(value) => {
                                const account = chartOfAccounts.find((acc: any) => acc.id.toString() === value);
                                handleTransactionUpdate(transaction.id, 'assignedAccountName', account?.accountName);
                              }}
                              placeholder="Select account..."
                              data-testid={`assign-account-${transaction.id}`}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              VAT Treatment
                            </label>
                            <VATTypeSelect
                              value="1"
                              onValueChange={(value) => {
                                // Handle VAT assignment
                                console.log('VAT updated:', value);
                              }}
                              placeholder="Select VAT..."
                              data-testid={`assign-vat-${transaction.id}`}
                            />
                          </div>
                        </div>

                        {/* AI Reasoning */}
                        {transaction.aiReasoning && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm font-medium text-blue-900 mb-1">AI Analysis:</p>
                            <p className="text-sm text-blue-800">{transaction.aiReasoning}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTransactionUpdate(transaction.id, 'status', 'completed')}
                              disabled={updateTransactionMutation.isPending}
                              data-testid={`approve-transaction-${transaction.id}`}
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTransactionUpdate(transaction.id, 'status', 'rejected')}
                              disabled={updateTransactionMutation.isPending}
                              data-testid={`reject-transaction-${transaction.id}`}
                            >
                              <ThumbsDown className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTransactionUpdate(transaction.id, 'status', 'duplicate')}
                              disabled={updateTransactionMutation.isPending}
                              data-testid={`mark-duplicate-${transaction.id}`}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Mark Duplicate
                            </Button>
                          </div>

                          {transaction.reviewedBy && (
                            <div className="text-xs text-muted-foreground flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              Reviewed {transaction.reviewedAt && formatDistance(new Date(transaction.reviewedAt), new Date(), { addSuffix: true })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

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
      const data = await response.json();
      return data as BankStatementImport[];
    }
  });

  // Fetch review queue summary
  const { data: reviewSummary } = useQuery({
    queryKey: ['/api/review-queue-summary'],
    queryFn: async () => {
      const response = await fetch('/api/review-queue-summary');
      if (!response.ok) throw new Error('Failed to fetch review summary');
      const data = await response.json();
      return data as ReviewQueueSummary;
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
          <ReviewQueueInterface />
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
                        <Badge className={transactionStatusColors[transaction.status]}>
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
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Landmark, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  TrendingDown,
  Loader2,
  Plus,
  History,
  Shield,
  Zap,
  Brain,
  DollarSign,
  FileText,
  BarChart3,
  AlertTriangle,
  Info,
  Settings,
  Target,
  Lightbulb,
  Receipt
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { StitchLink } from './StitchLink';
import { formatDistanceToNow, format } from 'date-fns';
import TransactionHistory from '../TransactionHistory';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface LinkedAccount {
  id: number;
  accountName: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  currency: string;
  currentBalance: string;
  externalProvider: string;
  providerAccountId: string;
  institutionName: string;
  lastSyncAt: string | null;
  isActive?: boolean;
}

interface SyncStatus {
  bankAccount: LinkedAccount;
  cursor: {
    id: number;
    provider: string;
    lastSyncAt: string;
    txnCursor: string | null;
  };
}

interface SyncResponse {
  newTransactions: number;
  duplicatesSkipped: number;
  message: string;
}

interface AccountSyncResponse {
  message: string;
}

// Phase 2 Enhancement Interfaces
interface BankingInsight {
  id: string;
  type: 'fee_optimization' | 'cash_flow' | 'vat_compliance' | 'tax_planning' | 'business_intelligence';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  potentialSavings?: number;
  actionable: boolean;
  recommendations: string[];
  metadata: Record<string, any>;
  createdAt: string;
}

interface BankFeeAnalysis {
  totalMonthlyFees: number;
  feeBreakdown: Record<string, number>;
  optimization: {
    potentialSavings: number;
    recommendations: string[];
  };
}

interface CashFlowAnalysis {
  averageBalance: number;
  balanceVolatility: number;
  cashFlowPatterns: {
    inflow: { average: number; frequency: string };
    outflow: { average: number; frequency: string };
  };
  recommendations: string[];
}

interface VATComplianceAnalysis {
  vatDeductible: number;
  vatLiability: number;
  complianceScore: number;
  issues: string[];
  recommendations: string[];
  monthlyBreakdown: Array<{ month: string; deductible: number; liability: number }>;
}

interface TransactionCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  confidence: number;
  vatApplicable: boolean;
  vatRate?: number;
  saSpecific: boolean;
}

interface CategorizedTransaction {
  transaction: {
    id: number;
    description: string;
    amount: string;
    transactionDate: string;
    transactionType: string;
  };
  category: TransactionCategory;
  confidence: number;
}

interface InsightsAnalysis {
  insights: BankingInsight[];
  feeAnalysis: BankFeeAnalysis;
  cashFlowAnalysis: CashFlowAnalysis;
  vatAnalysis: VATComplianceAnalysis;
  patterns: any[];
  overallScore: number;
}

export function BankFeedDashboard() {
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: linkedAccounts = [], isLoading: accountsLoading } = useQuery<LinkedAccount[]>({
    queryKey: ['/api/stitch/linked-accounts'],
    retry: false,
  });

  const { data: syncStatus = [], isLoading: statusLoading } = useQuery<SyncStatus[]>({
    queryKey: ['/api/stitch/sync-status'],
    retry: false,
  });

  // Phase 2 Enhancement: Banking insights query
  const { data: bankingInsights, isLoading: insightsLoading } = useQuery<InsightsAnalysis>({
    queryKey: ['/api/stitch/insights', selectedAccountId],
    enabled: !!selectedAccountId && linkedAccounts.some(acc => acc.id === selectedAccountId),
    retry: false,
  });

  // Phase 2 Enhancement: VAT compliance query
  const { data: vatCompliance, isLoading: vatLoading } = useQuery<VATComplianceAnalysis>({
    queryKey: ['/api/stitch/vat-compliance', selectedAccountId],
    enabled: !!selectedAccountId && linkedAccounts.some(acc => acc.id === selectedAccountId),
    retry: false,
  });

  // Phase 2 Enhancement: Categorized transactions query
  const { data: categorizedTransactions = [], isLoading: categorizedLoading } = useQuery<CategorizedTransaction[]>({
    queryKey: ['/api/stitch/categorized-transactions', selectedAccountId],
    enabled: !!selectedAccountId && linkedAccounts.some(acc => acc.id === selectedAccountId),
    retry: false,
  });

  const syncAccountMutation = useMutation<AccountSyncResponse, Error, number>({
    mutationFn: async (accountId: number) => {
      const response = await apiRequest(`/api/stitch/sync-accounts/${accountId}`, 'POST');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Account Synced',
        description: 'Account information has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/stitch/linked-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stitch/sync-status'] });
    },
    onError: (error) => {
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync account information. Please try again.',
        variant: 'destructive',
      });
    }
  });

  const syncTransactionsMutation = useMutation<SyncResponse, Error, { accountId: number; forceFullSync?: boolean }>({
    mutationFn: async ({ accountId, forceFullSync }) => {
      const response = await apiRequest(
        `/api/stitch/sync-transactions/${accountId}`, 
        'POST',
        { forceFullSync }
      );
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Transactions Synced',
        description: `${data.newTransactions} new transactions imported, ${data.duplicatesSkipped} duplicates skipped.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bank-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stitch/sync-status'] });
      queryClient.invalidateQueries({ queryKey: ['bank-fee-transactions'] });
      
      // Phase 2 Enhancement: Invalidate new queries for fresh insights
      if (selectedAccountId) {
        queryClient.invalidateQueries({ queryKey: ['/api/stitch/insights', selectedAccountId] });
        queryClient.invalidateQueries({ queryKey: ['/api/stitch/vat-compliance', selectedAccountId] });
        queryClient.invalidateQueries({ queryKey: ['/api/stitch/categorized-transactions', selectedAccountId] });
      }
    },
    onError: (error) => {
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync transactions. Please try again.',
        variant: 'destructive',
      });
    }
  });

  const handleAccountSync = (accountId: number) => {
    syncAccountMutation.mutate(accountId);
  };

  const handleTransactionSync = (accountId: number, forceFullSync = false) => {
    syncTransactionsMutation.mutate({ accountId, forceFullSync });
  };

  const handleLinkSuccess = () => {
    setShowLinkForm(false);
    queryClient.invalidateQueries({ queryKey: ['/api/stitch/linked-accounts'] });
    queryClient.invalidateQueries({ queryKey: ['/api/stitch/sync-status'] });
    
    // Reset selected account for fresh insights
    setSelectedAccountId(null);
  };

  // Phase 2 Enhancement: Helper functions for intelligent insights
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'fee_optimization': return <DollarSign className="w-4 h-4" />;
      case 'cash_flow': return <TrendingUp className="w-4 h-4" />;
      case 'vat_compliance': return <Receipt className="w-4 h-4" />;
      case 'tax_planning': return <FileText className="w-4 h-4" />;
      case 'business_intelligence': return <BarChart3 className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: 'ZAR' 
    }).format(amount);
  };

  // Auto-select first account for insights if available
  useEffect(() => {
    if (!selectedAccountId && linkedAccounts.length > 0 && !accountsLoading) {
      setSelectedAccountId(linkedAccounts[0].id);
    }
  }, [selectedAccountId, linkedAccounts, accountsLoading]);

  // Real-time monitoring with polling
  useEffect(() => {
    if (!realTimeMonitoring || linkedAccounts.length === 0) {
      return;
    }

    const POLLING_INTERVAL = 5 * 60 * 1000; // 5 minutes
    
    const performAutoSync = async () => {
      try {
        for (const account of linkedAccounts) {
          if (account.isActive !== false) {
            // Auto-sync transactions for active accounts
            const response = await apiRequest(`/api/stitch/sync-transactions/${account.id}`, 'POST', {
              forceFullSync: false
            });
            
            if (response.ok) {
              const result = await response.json();
              if (result.newTransactions > 0) {
                toast({
                  title: 'New Transactions',
                  description: `${result.newTransactions} new transactions found for ${account.accountName}`,
                });
                
                // Invalidate queries to refresh data
                queryClient.invalidateQueries({ queryKey: ['/api/bank-transactions'] });
                queryClient.invalidateQueries({ queryKey: ['/api/stitch/sync-status'] });
                
                if (account.id === selectedAccountId) {
                  queryClient.invalidateQueries({ queryKey: ['/api/stitch/insights', selectedAccountId] });
                  queryClient.invalidateQueries({ queryKey: ['/api/stitch/vat-compliance', selectedAccountId] });
                  queryClient.invalidateQueries({ queryKey: ['/api/stitch/categorized-transactions', selectedAccountId] });
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Auto-sync failed:', error);
        // Don't show error toast for background sync failures
      }
    };

    // Initial sync when monitoring is enabled
    performAutoSync();
    
    // Set up polling interval
    const intervalId = setInterval(performAutoSync, POLLING_INTERVAL);
    
    console.log(`🔄 Real-time monitoring started for ${linkedAccounts.length} accounts`);
    
    // Cleanup interval on unmount or when monitoring is disabled
    return () => {
      clearInterval(intervalId);
      console.log('🔄 Real-time monitoring stopped');
    };
  }, [realTimeMonitoring, linkedAccounts, selectedAccountId, queryClient, toast]);

  // Load monitoring preference on component mount
  useEffect(() => {
    const savedPreference = localStorage.getItem('stitch-realtime-monitoring');
    if (savedPreference === 'true') {
      setRealTimeMonitoring(true);
    }
  }, []);

  const toggleRealTimeMonitoring = () => {
    const newValue = !realTimeMonitoring;
    setRealTimeMonitoring(newValue);
    localStorage.setItem('stitch-realtime-monitoring', newValue.toString());
    
    toast({
      title: newValue ? 'Real-time Monitoring Enabled' : 'Real-time Monitoring Disabled',
      description: newValue 
        ? 'Your accounts will be automatically synced every 5 minutes' 
        : 'Automatic sync has been disabled',
    });
  };

  const getSyncStatusForAccount = (accountId: number): SyncStatus | undefined => {
    return syncStatus.find((status: SyncStatus) => status.bankAccount.id === accountId);
  };

  const getLastSyncDisplay = (lastSyncAt: string | null): string => {
    if (!lastSyncAt) return 'Never';
    try {
      return formatDistanceToNow(new Date(lastSyncAt), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const getSyncStatusIcon = (status: SyncStatus | undefined) => {
    if (!status) return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    
    const lastSync = status.cursor.lastSyncAt;
    if (!lastSync) return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    
    const syncTime = new Date(lastSync);
    const now = new Date();
    const hoursSinceSync = (now.getTime() - syncTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceSync < 1) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (hoursSinceSync < 24) return <Clock className="w-4 h-4 text-blue-500" />;
    return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  };

  if (showLinkForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Bank Feed Integration</h2>
            <p className="text-muted-foreground">Connect and manage your bank account feeds</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowLinkForm(false)}
            data-testid="button-back-to-dashboard"
          >
            Back to Dashboard
          </Button>
        </div>
        <StitchLink 
          onSuccess={handleLinkSuccess}
          onError={() => setShowLinkForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bank Feed Integration</h2>
          <p className="text-muted-foreground">Manage your connected bank accounts and transaction feeds</p>
        </div>
        <div className="flex items-center space-x-4">
          {linkedAccounts.length > 0 && (
            <div className="flex items-center space-x-2">
              <Zap className={`w-4 h-4 ${realTimeMonitoring ? 'text-green-500' : 'text-gray-400'}`} />
              <label htmlFor="realtime-toggle" className="text-sm font-medium">
                Real-time Monitoring
              </label>
              <Button
                id="realtime-toggle"
                variant={realTimeMonitoring ? "default" : "outline"}
                size="sm"
                onClick={toggleRealTimeMonitoring}
                data-testid="button-toggle-monitoring"
              >
                {realTimeMonitoring ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          )}
          <Button onClick={() => setShowLinkForm(true)} data-testid="button-link-account">
            <Plus className="w-4 h-4 mr-2" />
            Link Bank Account
          </Button>
        </div>
      </div>

      {accountsLoading || statusLoading ? (
        <div className="flex items-center justify-center py-12" data-testid="loading-bank-feeds">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading bank feeds...
        </div>
      ) : linkedAccounts.length === 0 ? (
        <Card data-testid="card-no-accounts">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Landmark className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium">No Bank Accounts Connected</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your bank account to automatically sync transactions and keep your books up to date.
                </p>
                <Button onClick={() => setShowLinkForm(true)} data-testid="button-connect-first-account">
                  <Plus className="w-4 h-4 mr-2" />
                  Connect Your First Bank Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <Landmark className="w-4 h-4 mr-2" />
              Connected Accounts
            </TabsTrigger>
            <TabsTrigger value="insights" data-testid="tab-insights" disabled={!selectedAccountId}>
              <Brain className="w-4 h-4 mr-2" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="optimization" data-testid="tab-optimization" disabled={!selectedAccountId}>
              <Target className="w-4 h-4 mr-2" />
              SA Banking Optimization
            </TabsTrigger>
            <TabsTrigger value="vat-compliance" data-testid="tab-vat-compliance" disabled={!selectedAccountId}>
              <Receipt className="w-4 h-4 mr-2" />
              VAT Compliance
            </TabsTrigger>
            <TabsTrigger value="categorization" data-testid="tab-categorization" disabled={!selectedAccountId}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Transaction Categories
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              <History className="w-4 h-4 mr-2" />
              Sync History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6">
              {linkedAccounts.map((account: LinkedAccount) => {
                const accountStatus = getSyncStatusForAccount(account.id);
                
                return (
                  <Card key={account.id} data-testid={`card-bank-account-${account.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Landmark className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg" data-testid={`text-account-name-${account.id}`}>{account.accountName}</CardTitle>
                            <CardDescription data-testid={`text-account-details-${account.id}`}>
                              {account.institutionName} • {account.accountNumber}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getSyncStatusIcon(accountStatus)}
                          <Badge variant="secondary" data-testid={`badge-account-type-${account.id}`}>
                            {account.accountType}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Sandbox
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Current Balance</div>
                          <div className="text-2xl font-bold" data-testid={`text-balance-${account.id}`}>
                            {account.currency} {parseFloat(account.currentBalance).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Last Sync</div>
                          <div className="text-sm" data-testid={`text-last-sync-${account.id}`}>
                            {getLastSyncDisplay(account.lastSyncAt)}
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Provider: {account.externalProvider}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAccountSync(account.id)}
                            disabled={syncAccountMutation.isPending}
                            data-testid={`button-sync-account-${account.id}`}
                          >
                            {syncAccountMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                            Sync Account
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleTransactionSync(account.id)}
                            disabled={syncTransactionsMutation.isPending}
                            data-testid={`button-sync-transactions-${account.id}`}
                          >
                            {syncTransactionsMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4 mr-2" />
                            )}
                            Sync Transactions
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTransactionSync(account.id, true)}
                            disabled={syncTransactionsMutation.isPending}
                            data-testid={`button-force-sync-${account.id}`}
                          >
                            Force Full Sync
                          </Button>
                        </div>
                      </div>

                      {accountStatus && (
                        <div className="pt-2 text-xs text-muted-foreground">
                          <div>Sync cursor: {accountStatus.cursor.txnCursor || 'Initial sync'}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent Sync Activity
                </CardTitle>
                <CardDescription>
                  View recent synchronization history and transaction imports
                </CardDescription>
              </CardHeader>
              <CardContent>
                {syncStatus.length > 0 ? (
                  <div className="space-y-4">
                    {syncStatus.map((status, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`sync-history-${status.bankAccount.id}`}>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Landmark className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{status.bankAccount.accountName}</div>
                            <div className="text-sm text-muted-foreground">
                              {status.bankAccount.institutionName}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {getLastSyncDisplay(status.cursor.lastSyncAt)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Cursor: {status.cursor.txnCursor ? 'Active' : 'Initial'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground" data-testid="text-no-sync-history">
                    No sync history available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Phase 2 Enhancement: AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            {selectedAccountId && (
              <div className="grid gap-6">
                {/* Optimization Score Overview */}
                {bankingInsights && (
                  <Card data-testid="card-optimization-score">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        Banking Optimization Score
                      </CardTitle>
                      <CardDescription>
                        AI-powered analysis of your banking efficiency
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl font-bold text-green-600">
                          {bankingInsights.overallScore}%
                        </div>
                        <Badge variant="secondary" className="text-sm">
                          {bankingInsights.overallScore >= 85 ? 'Excellent' : 
                           bankingInsights.overallScore >= 70 ? 'Good' : 
                           bankingInsights.overallScore >= 55 ? 'Fair' : 'Needs Improvement'}
                        </Badge>
                      </div>
                      <Progress value={bankingInsights.overallScore} className="mb-4" />
                      <div className="text-sm text-muted-foreground">
                        Based on {bankingInsights.insights.length} insights and analysis of transaction patterns
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* AI Insights List */}
                {insightsLoading ? (
                  <Card>
                    <CardContent className="py-8">
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Analyzing banking patterns...
                      </div>
                    </CardContent>
                  </Card>
                ) : bankingInsights?.insights && bankingInsights.insights.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">AI-Generated Insights</h3>
                    {bankingInsights.insights.map((insight) => (
                      <Alert key={insight.id} className={`border ${getPriorityColor(insight.priority)}`}>
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                          <div className="flex-1">
                            <AlertTitle className="flex items-center gap-2 mb-2">
                              {insight.title}
                              <Badge variant="outline" className={getPriorityColor(insight.priority)}>
                                {insight.priority}
                              </Badge>
                              {insight.potentialSavings && (
                                <Badge variant="secondary">
                                  Save {formatCurrency(insight.potentialSavings)}
                                </Badge>
                              )}
                            </AlertTitle>
                            <AlertDescription>
                              <p className="mb-2">{insight.description}</p>
                              {insight.recommendations.length > 0 && (
                                <div>
                                  <p className="font-medium text-sm mb-1">Recommendations:</p>
                                  <ul className="text-sm space-y-1">
                                    {insight.recommendations.map((rec, index) => (
                                      <li key={index} className="flex items-start gap-1">
                                        <span className="text-blue-600 mt-0.5">•</span>
                                        <span>{rec}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </AlertDescription>
                          </div>
                        </div>
                      </Alert>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-8">
                      <div className="text-center text-muted-foreground">
                        <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No insights available yet. Sync more transactions to get AI-powered recommendations.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Phase 2 Enhancement: SA Banking Optimization Tab */}
          <TabsContent value="optimization" className="space-y-6">
            {selectedAccountId && (
              <div className="grid gap-6">
                {/* Bank Fee Analysis */}
                {bankingInsights?.feeAnalysis && (
                  <Card data-testid="card-fee-analysis">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        SA Bank Fee Analysis
                      </CardTitle>
                      <CardDescription>
                        Optimize your banking costs with South African banking insights
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-red-50 rounded-lg">
                          <div className="text-sm text-red-600 mb-1">Monthly Bank Fees</div>
                          <div className="text-2xl font-bold text-red-700">
                            {formatCurrency(bankingInsights.feeAnalysis.totalMonthlyFees)}
                          </div>
                        </div>
                        {bankingInsights.feeAnalysis.optimization.potentialSavings > 0 && (
                          <div className="p-4 bg-green-50 rounded-lg">
                            <div className="text-sm text-green-600 mb-1">Potential Annual Savings</div>
                            <div className="text-2xl font-bold text-green-700">
                              {formatCurrency(bankingInsights.feeAnalysis.optimization.potentialSavings)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Fee Breakdown */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Fee Breakdown</h4>
                        {Object.entries(bankingInsights.feeAnalysis.feeBreakdown).map(([category, amount]) => (
                          <div key={category} className="flex items-center justify-between py-2 border-b">
                            <span className="text-sm">{category}</span>
                            <span className="font-medium">{formatCurrency(amount)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Optimization Recommendations */}
                      {bankingInsights.feeAnalysis.optimization.recommendations.length > 0 && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-semibold text-sm text-blue-700 mb-2">💡 Optimization Tips</h4>
                          <ul className="text-sm space-y-1">
                            {bankingInsights.feeAnalysis.optimization.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Cash Flow Analysis */}
                {bankingInsights?.cashFlowAnalysis && (
                  <Card data-testid="card-cash-flow-analysis">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Cash Flow Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">Average Balance</div>
                          <div className="text-xl font-bold">
                            {formatCurrency(bankingInsights.cashFlowAnalysis.averageBalance)}
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">Average Inflow</div>
                          <div className="text-xl font-bold text-green-600">
                            {formatCurrency(bankingInsights.cashFlowAnalysis.cashFlowPatterns.inflow.average)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {bankingInsights.cashFlowAnalysis.cashFlowPatterns.inflow.frequency}
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">Average Outflow</div>
                          <div className="text-xl font-bold text-red-600">
                            {formatCurrency(bankingInsights.cashFlowAnalysis.cashFlowPatterns.outflow.average)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {bankingInsights.cashFlowAnalysis.cashFlowPatterns.outflow.frequency}
                          </div>
                        </div>
                      </div>

                      {bankingInsights.cashFlowAnalysis.recommendations.length > 0 && (
                        <div className="p-4 bg-yellow-50 rounded-lg">
                          <h4 className="font-semibold text-sm text-yellow-700 mb-2">🎯 Cash Flow Recommendations</h4>
                          <ul className="text-sm space-y-1">
                            {bankingInsights.cashFlowAnalysis.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-yellow-600 mt-0.5">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Phase 2 Enhancement: VAT Compliance Tab */}
          <TabsContent value="vat-compliance" className="space-y-6">
            {selectedAccountId && (
              <div className="grid gap-6">
                {vatLoading ? (
                  <Card>
                    <CardContent className="py-8">
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Analyzing VAT compliance...
                      </div>
                    </CardContent>
                  </Card>
                ) : vatCompliance ? (
                  <>
                    {/* VAT Compliance Score */}
                    <Card data-testid="card-vat-compliance">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Receipt className="w-5 h-5" />
                          VAT Compliance Score
                        </CardTitle>
                        <CardDescription>
                          SARS compliance analysis for your transactions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`text-3xl font-bold ${getComplianceColor(vatCompliance.complianceScore)}`}>
                            {vatCompliance.complianceScore}%
                          </div>
                          <Badge 
                            variant={vatCompliance.complianceScore >= 85 ? 'default' : 
                                     vatCompliance.complianceScore >= 70 ? 'secondary' : 'destructive'}
                          >
                            {vatCompliance.complianceScore >= 85 ? 'Compliant' : 
                             vatCompliance.complianceScore >= 70 ? 'Good' : 'Needs Attention'}
                          </Badge>
                        </div>
                        <Progress value={vatCompliance.complianceScore} className="mb-4" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="p-4 bg-green-50 rounded-lg">
                            <div className="text-sm text-green-600 mb-1">VAT Deductible (12 months)</div>
                            <div className="text-xl font-bold text-green-700">
                              {formatCurrency(vatCompliance.vatDeductible)}
                            </div>
                          </div>
                          <div className="p-4 bg-red-50 rounded-lg">
                            <div className="text-sm text-red-600 mb-1">VAT Liability (12 months)</div>
                            <div className="text-xl font-bold text-red-700">
                              {formatCurrency(vatCompliance.vatLiability)}
                            </div>
                          </div>
                        </div>

                        {/* Issues and Recommendations */}
                        {vatCompliance.issues.length > 0 && (
                          <Alert className="mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Compliance Issues Detected</AlertTitle>
                            <AlertDescription>
                              <ul className="mt-2 space-y-1">
                                {vatCompliance.issues.map((issue, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-red-600 mt-0.5">•</span>
                                    <span>{issue}</span>
                                  </li>
                                ))}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}

                        {vatCompliance.recommendations.length > 0 && (
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold text-sm text-blue-700 mb-2">📋 SARS Compliance Recommendations</h4>
                            <ul className="text-sm space-y-1">
                              {vatCompliance.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-blue-600 mt-0.5">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Monthly VAT Breakdown */}
                    {vatCompliance.monthlyBreakdown.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Monthly VAT Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {vatCompliance.monthlyBreakdown.slice(-6).map((month) => (
                              <div key={month.month} className="flex items-center justify-between py-2 border-b">
                                <span className="text-sm font-medium">
                                  {format(new Date(month.month), 'MMM yyyy')}
                                </span>
                                <div className="flex gap-4">
                                  <span className="text-sm text-green-600">
                                    Deductible: {formatCurrency(month.deductible)}
                                  </span>
                                  <span className="text-sm text-red-600">
                                    Liability: {formatCurrency(month.liability)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <Card>
                    <CardContent className="py-8">
                      <div className="text-center text-muted-foreground">
                        <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>VAT compliance analysis will appear here once transactions are synced.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Phase 2 Enhancement: Transaction Categories Tab */}
          <TabsContent value="categorization" className="space-y-6">
            {selectedAccountId && (
              <div className="space-y-6">
                {categorizedLoading ? (
                  <Card>
                    <CardContent className="py-8">
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Categorizing transactions...
                      </div>
                    </CardContent>
                  </Card>
                ) : categorizedTransactions.length > 0 ? (
                  <Card data-testid="card-categorized-transactions">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        AI-Categorized Transactions
                      </CardTitle>
                      <CardDescription>
                        Automated categorization optimized for South African banking patterns
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {categorizedTransactions.slice(0, 10).map((categorized, index) => (
                          <div key={index} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium text-sm mb-1">
                                {categorized.transaction.description}
                              </div>
                              <div className="text-xs text-gray-500 mb-2">
                                {format(new Date(categorized.transaction.transactionDate), 'dd MMM yyyy')} • 
                                {formatCurrency(Math.abs(parseFloat(categorized.transaction.amount)))}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={categorized.category.saSpecific ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {categorized.category.name}
                                  {categorized.category.saSpecific && ' 🇿🇦'}
                                </Badge>
                                {categorized.category.vatApplicable && (
                                  <Badge variant="outline" className="text-xs">
                                    VAT {categorized.category.vatRate}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-medium ${
                                categorized.confidence >= 0.9 ? 'text-green-600' :
                                categorized.confidence >= 0.7 ? 'text-yellow-600' : 
                                'text-red-600'
                              }`}>
                                {Math.round(categorized.confidence * 100)}% confident
                              </div>
                              <div className="text-xs text-gray-500">
                                {categorized.category.type === 'expense' ? '📤' : '📥'} {categorized.category.type}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {categorizedTransactions.length > 10 && (
                          <div className="text-center py-4 text-sm text-gray-500">
                            Showing 10 of {categorizedTransactions.length} categorized transactions
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-8">
                      <div className="text-center text-muted-foreground">
                        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Transaction categorization will appear here once transactions are synced.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Bank Feed Transaction Analytics
                </CardTitle>
                <CardDescription>
                  Analyze transaction patterns, bank fees, and optimize your banking costs with insights from connected accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="w-4 h-4" />
                    Real-time data from connected bank feeds
                  </div>
                </div>
                <TransactionHistory />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
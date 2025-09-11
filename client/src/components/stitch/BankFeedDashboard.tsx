import { useState } from 'react';
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
  Loader2,
  Plus,
  History,
  Shield,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { StitchLink } from './StitchLink';
import { formatDistanceToNow } from 'date-fns';
import TransactionHistory from '../TransactionHistory';

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

export function BankFeedDashboard() {
  const [showLinkForm, setShowLinkForm] = useState(false);
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
        <Button onClick={() => setShowLinkForm(true)} data-testid="button-link-account">
          <Plus className="w-4 h-4 mr-2" />
          Link Bank Account
        </Button>
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <Landmark className="w-4 h-4 mr-2" />
              Connected Accounts
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              <History className="w-4 h-4 mr-2" />
              Sync History
            </TabsTrigger>
            <TabsTrigger value="transactions" data-testid="tab-transactions">
              <TrendingUp className="w-4 h-4 mr-2" />
              Transaction Analytics
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
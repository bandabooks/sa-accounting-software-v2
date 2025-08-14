import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Landmark, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  Loader2,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { StitchLink } from './StitchLink';
import { formatDistanceToNow } from 'date-fns';

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

export function BankFeedDashboard() {
  const [showLinkForm, setShowLinkForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: linkedAccounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['/api/stitch/linked-accounts'],
    retry: false,
  });

  const { data: syncStatus = [], isLoading: statusLoading } = useQuery({
    queryKey: ['/api/stitch/sync-status'],
    retry: false,
  });

  const syncAccountMutation = useMutation({
    mutationFn: (accountId: number) => 
      apiRequest(`/api/stitch/sync-accounts/${accountId}`, { method: 'POST' }),
    onSuccess: () => {
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

  const syncTransactionsMutation = useMutation({
    mutationFn: ({ accountId, forceFullSync }: { accountId: number; forceFullSync?: boolean }) => 
      apiRequest(`/api/stitch/sync-transactions/${accountId}`, { 
        method: 'POST',
        body: { forceFullSync }
      }),
    onSuccess: (data) => {
      toast({
        title: 'Transactions Synced',
        description: `${data.newTransactions} new transactions imported, ${data.duplicatesSkipped} duplicates skipped.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bank-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stitch/sync-status'] });
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
        <Button onClick={() => setShowLinkForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Link Bank Account
        </Button>
      </div>

      {accountsLoading || statusLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading bank feeds...
        </div>
      ) : linkedAccounts.length === 0 ? (
        <Card>
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
                <Button onClick={() => setShowLinkForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Connect Your First Bank Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {linkedAccounts.map((account: LinkedAccount) => {
            const accountStatus = getSyncStatusForAccount(account.id);
            
            return (
              <Card key={account.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Landmark className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{account.accountName}</CardTitle>
                        <CardDescription>
                          {account.institutionName} • {account.accountNumber}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getSyncStatusIcon(accountStatus)}
                      <Badge variant="secondary">{account.accountType}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Current Balance</div>
                      <div className="text-2xl font-bold">
                        {account.currency} {parseFloat(account.currentBalance).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Last Sync</div>
                      <div className="text-sm">
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
                      >
                        {syncTransactionsMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        Sync Transactions
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
      )}
    </div>
  );
}
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Link2, 
  RefreshCw, 
  Download, 
  TrendingUp, 
  TrendingDown,
  Building,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  ExternalLink,
  ChevronRight,
  Plus,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';

interface BankFeedAccount {
  id: string;
  name: string;
  institutionName: string;
  accountNumber: string;
  currency: string;
  balance: number;
  lastSyncAt: Date;
  status: 'active' | 'inactive' | 'error';
}

interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  balance: number;
  reference?: string;
  matched?: boolean;
}

export function BankFeedIntegration() {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [linkingInProgress, setLinkingInProgress] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch linked bank accounts
  const { data: linkedAccounts = [], isLoading: loadingAccounts } = useQuery<BankFeedAccount[]>({
    queryKey: ['/api/bank-accounts/linked'],
    enabled: true
  });

  // Fetch transactions for selected account
  const { data: transactions = [], isLoading: loadingTransactions } = useQuery<BankTransaction[]>({
    queryKey: ['/api/bank-transactions', selectedAccount],
    enabled: !!selectedAccount
  });

  // Create Stitch link token
  const createLinkMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/stitch/link-token', 'POST', {});
      return response;
    },
    onSuccess: (data) => {
      // In demo mode, simulate the link flow
      handleDemoLinkFlow(data.linkToken);
    },
    onError: () => {
      toast({
        title: 'Connection Error',
        description: 'Failed to initialize bank connection. Please try again.',
        variant: 'destructive'
      });
    }
  });

  // Exchange link for accounts
  const exchangeLinkMutation = useMutation({
    mutationFn: async (accounts: any[]) => {
      return apiRequest('/api/stitch/exchange', 'POST', {
        userId: 'demo_user',
        accounts
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bank-accounts/linked'] });
      setShowLinkDialog(false);
      setLinkingInProgress(false);
      toast({
        title: 'Success!',
        description: 'Your bank accounts have been successfully connected.',
      });
    },
    onError: () => {
      setLinkingInProgress(false);
      toast({
        title: 'Connection Failed',
        description: 'Unable to connect your bank accounts. Please try again.',
        variant: 'destructive'
      });
    }
  });

  // Sync account transactions
  const syncAccountMutation = useMutation({
    mutationFn: async (accountId: string) => {
      return apiRequest(`/api/stitch/sync/${accountId}`, 'POST', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bank-transactions'] });
      toast({
        title: 'Sync Complete',
        description: 'Latest transactions have been imported.',
      });
    },
    onError: () => {
      toast({
        title: 'Sync Failed',
        description: 'Unable to sync transactions. Please try again.',
        variant: 'destructive'
      });
    }
  });

  // Handle demo link flow
  const handleDemoLinkFlow = (token: string) => {
    setLinkingInProgress(true);
    
    // Simulate user selecting accounts in Stitch UI
    setTimeout(() => {
      // Mock accounts from South African banks
      const mockAccounts = [
        {
          id: 'demo_fnb_' + Date.now(),
          name: 'FNB Business Account',
          institutionName: 'First National Bank',
          accountNumber: '****1234',
          currency: 'ZAR',
          balance: 567890.50,
          type: 'business'
        },
        {
          id: 'demo_standard_' + Date.now(),
          name: 'Standard Bank Savings',
          institutionName: 'Standard Bank',
          accountNumber: '****5678',
          currency: 'ZAR',
          balance: 234567.89,
          type: 'savings'
        }
      ];

      exchangeLinkMutation.mutate(mockAccounts);
    }, 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const getBankLogo = (institutionName: string) => {
    const logos: Record<string, string> = {
      'First National Bank': '🏦',
      'Standard Bank': '🏛️',
      'ABSA Bank': '🏪',
      'Nedbank': '🏢',
      'Capitec Bank': '💳'
    };
    return logos[institutionName] || '🏦';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bank Feeds</h2>
          <p className="text-muted-foreground">
            Connect your South African bank accounts for automatic transaction import
          </p>
        </div>
        <Button
          onClick={() => setShowLinkDialog(true)}
          className="gap-2"
        >
          <Link2 className="h-4 w-4" />
          Connect Bank Account
        </Button>
      </div>

      {/* Demo Mode Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Demo Mode Active</AlertTitle>
        <AlertDescription>
          Bank feeds are running in demo mode with simulated data. Connect real Stitch credentials to enable live bank feeds.
        </AlertDescription>
      </Alert>

      {/* Connected Accounts */}
      {loadingAccounts ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : linkedAccounts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Bank Accounts Connected</h3>
            <p className="text-muted-foreground mb-4">
              Connect your bank accounts to automatically import transactions
            </p>
            <Button onClick={() => setShowLinkDialog(true)} variant="outline">
              Connect Your First Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {linkedAccounts.map((account) => (
            <Card 
              key={account.id}
              className={`cursor-pointer transition-colors ${
                selectedAccount === account.id ? 'border-primary' : ''
              }`}
              onClick={() => setSelectedAccount(account.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getBankLogo(account.institutionName)}</span>
                    <div>
                      <CardTitle className="text-base">{account.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {account.institutionName} • {account.accountNumber}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge 
                    variant={account.status === 'active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {account.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Balance</span>
                    <span className="font-semibold">{formatCurrency(account.balance)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last Sync</span>
                    <span className="text-sm">
                      {format(new Date(account.lastSyncAt), 'dd MMM HH:mm')}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      syncAccountMutation.mutate(account.id);
                    }}
                    disabled={syncAccountMutation.isPending}
                  >
                    {syncAccountMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Now
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Transactions View */}
      {selectedAccount && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Imported transactions from your connected bank account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTransactions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found. Sync your account to import transactions.
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {transaction.amount > 0 ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(transaction.date), 'dd MMM yyyy')}
                            {transaction.reference && ` • ${transaction.reference}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(Math.abs(transaction.amount))}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Balance: {formatCurrency(transaction.balance)}
                        </p>
                      </div>
                      {transaction.matched && (
                        <CheckCircle className="h-4 w-4 text-green-600 ml-2" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}

      {/* Link Account Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Bank Account</DialogTitle>
            <DialogDescription>
              Securely connect your South African bank account using Stitch
            </DialogDescription>
          </DialogHeader>
          
          {linkingInProgress ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Connecting to your bank...</p>
              <p className="text-xs text-muted-foreground mt-2">This may take a few moments</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Supported Banks</h4>
                <div className="grid grid-cols-2 gap-2">
                  {['FNB', 'Standard Bank', 'ABSA', 'Nedbank', 'Capitec', 'Investec'].map((bank) => (
                    <div key={bank} className="flex items-center gap-2 p-2 rounded-lg bg-accent/50">
                      <span>{getBankLogo(bank)}</span>
                      <span className="text-sm">{bank}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="text-sm font-medium">How it works</h4>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="font-medium">1.</span>
                    <span>You'll be redirected to Stitch's secure portal</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">2.</span>
                    <span>Log in to your bank account</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">3.</span>
                    <span>Authorize Taxnify to access transactions</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">4.</span>
                    <span>Transactions sync automatically</span>
                  </li>
                </ol>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Your banking credentials are never stored. Connection is secured by Stitch.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowLinkDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => createLinkMutation.mutate()}
                  disabled={createLinkMutation.isPending}
                  className="flex-1"
                >
                  {createLinkMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Connect Bank
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
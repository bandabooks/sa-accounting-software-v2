import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Loader2, Landmark, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface StitchAccount {
  id: string;
  name: string;
  officialName: string;
  accountType: string;
  accountNumber: string;
  currency: string;
  balance: {
    currency: string;
    quantity: string;
  };
  institution: {
    id: string;
    name: string;
    logo?: string;
  };
}

interface StitchLinkProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function StitchLink({ onSuccess, onError }: StitchLinkProps) {
  const [isLinking, setIsLinking] = useState(false);
  const [linkStep, setLinkStep] = useState<'init' | 'linking' | 'selecting' | 'complete'>('init');
  const [availableAccounts, setAvailableAccounts] = useState<StitchAccount[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const [linkingError, setLinkingError] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createLinkTokenMutation = useMutation<{linkToken: string}, Error, void>({
    mutationFn: async () => {
      const response = await apiRequest('/api/stitch/link-token', 'POST');
      return response.json();
    },
    onSuccess: (data) => {
      // In a real implementation, this would redirect to Stitch Link
      // For demo purposes, we'll simulate the linking process
      simulateStitchLink(data.linkToken);
    },
    onError: (error) => {
      console.error('Failed to create link token:', error);
      setLinkingError('Failed to start bank linking process. Please try again.');
      setLinkStep('init');
      setIsLinking(false);
      onError?.('Failed to start bank linking process');
    }
  });

  const exchangeLinkMutation = useMutation<{accounts: any[], message: string}, Error, { userId: string; accounts: StitchAccount[] }>({
    mutationFn: async (data: { userId: string; accounts: StitchAccount[] }) => {
      const response = await apiRequest('/api/stitch/exchange', 'POST', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Bank Accounts Linked',
        description: `Successfully linked ${data.accounts.length} bank account(s)`,
      });
      
      // Invalidate bank accounts query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stitch/linked-accounts'] });
      
      setLinkStep('complete');
      setIsLinking(false);
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Failed to exchange link:', error);
      setLinkingError('Failed to link bank accounts. Please try again.');
      setLinkStep('selecting');
      setIsLinking(false);
      onError?.('Failed to link bank accounts');
    }
  });

  // Enhanced sandbox bank data for South African banks
  const getSouthAfricanBankData = (bankName: string): { bankName: string; bankId: string; mockAccounts: StitchAccount[] } => {
    const bankConfigs = {
      'FNB': {
        bankName: 'First National Bank',
        bankId: 'fnb',
        accountNumbers: ['62123456789', '50987654321'],
        balances: ['45750.25', '125000.00']
      },
      'Standard Bank': {
        bankName: 'Standard Bank of South Africa',
        bankId: 'standardbank',
        accountNumbers: ['10123456789', '20987654321'],
        balances: ['32150.75', '89500.00']
      },
      'ABSA': {
        bankName: 'Absa Bank Limited',
        bankId: 'absa',
        accountNumbers: ['40567890123', '41234567890'],
        balances: ['67890.50', '234567.89']
      },
      'Nedbank': {
        bankName: 'Nedbank Limited',
        bankId: 'nedbank',
        accountNumbers: ['12345678901', '19876543210'],
        balances: ['18750.00', '145000.25']
      },
      'Capitec': {
        bankName: 'Capitec Bank Holdings Limited',
        bankId: 'capitec',
        accountNumbers: ['12345678912', '98765432109'],
        balances: ['25430.80', '78900.45']
      }
    };

    const config = bankConfigs[bankName as keyof typeof bankConfigs];
    if (!config) return getSouthAfricanBankData('FNB');

    return {
      bankName: config.bankName,
      bankId: config.bankId,
      mockAccounts: [
        {
          id: `acc_${config.bankId}_current_${Date.now()}`,
          name: 'Business Current Account',
          officialName: `${config.bankName} Business Current Account`,
          accountType: 'current',
          accountNumber: config.accountNumbers[0],
          currency: 'ZAR',
          balance: {
            currency: 'ZAR',
            quantity: config.balances[0]
          },
          institution: {
            id: config.bankId,
            name: config.bankName,
            logo: `https://stitch.money/images/institutions/${config.bankId}.png`
          }
        },
        {
          id: `acc_${config.bankId}_savings_${Date.now()}`,
          name: 'Business Savings Account',
          officialName: `${config.bankName} Business High Interest Savings Account`,
          accountType: 'savings',
          accountNumber: config.accountNumbers[1],
          currency: 'ZAR',
          balance: {
            currency: 'ZAR',
            quantity: config.balances[1]
          },
          institution: {
            id: config.bankId,
            name: config.bankName,
            logo: `https://stitch.money/images/institutions/${config.bankId}.png`
          }
        }
      ]
    };
  };

  const simulateStitchLink = (linkToken: string) => {
    setLinkStep('linking');
    
    // Simulate the Stitch Link redirect and callback
    // In a real implementation, this would be handled by Stitch's SDK
    setTimeout(() => {
      const bankData = getSouthAfricanBankData(selectedBank || 'FNB');
      setAvailableAccounts(bankData.mockAccounts);
      // Don't pre-select accounts - let user choose which accounts to link
      setSelectedAccounts(new Set());
      setLinkStep('selecting');
    }, 2000);
  };

  const handleStartLinking = () => {
    setIsLinking(true);
    setLinkingError(null);
    setLinkStep('init');
    createLinkTokenMutation.mutate();
  };

  const handleAccountToggle = (accountId: string) => {
    const newSelected = new Set(selectedAccounts);
    if (newSelected.has(accountId)) {
      newSelected.delete(accountId);
    } else {
      newSelected.add(accountId);
    }
    setSelectedAccounts(newSelected);
  };

  const handleLinkSelectedAccounts = () => {
    const accountsToLink = availableAccounts.filter(acc => selectedAccounts.has(acc.id));
    
    if (accountsToLink.length === 0) {
      toast({
        title: 'No Accounts Selected',
        description: 'Please select at least one account to link.',
        variant: 'destructive',
      });
      return;
    }

    setIsLinking(true);
    exchangeLinkMutation.mutate({
      userId: 'user_demo_123', // In real app, this would come from auth context
      accounts: accountsToLink
    });
  };

  const handleTryAgain = () => {
    setLinkStep('init');
    setLinkingError(null);
    setAvailableAccounts([]);
    setSelectedAccounts(new Set());
    setSelectedBank(null);
    setIsLinking(false);
  };

  const renderStepContent = () => {
    switch (linkStep) {
      case 'init':
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Landmark className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Connect Your Bank Account</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select your bank to securely link your account and automatically sync transactions.
              </p>
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground text-center">
                  🏦 Select your South African bank to connect in sandbox mode
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {['FNB', 'Standard Bank', 'ABSA', 'Nedbank', 'Capitec'].map((bank) => (
                    <Button
                      key={bank}
                      variant={selectedBank === bank ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedBank(bank)}
                      className="h-12 flex flex-col items-center justify-center text-xs"
                      data-testid={`button-select-bank-${bank.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <div className="font-semibold">{bank}</div>
                      {bank === 'FNB' && <div className="text-xs opacity-70">First National Bank</div>}
                      {bank === 'Standard Bank' && <div className="text-xs opacity-70">Standard Bank SA</div>}
                      {bank === 'ABSA' && <div className="text-xs opacity-70">Absa Bank</div>}
                      {bank === 'Nedbank' && <div className="text-xs opacity-70">Nedbank Ltd</div>}
                      {bank === 'Capitec' && <div className="text-xs opacity-70">Capitec Bank</div>}
                    </Button>
                  ))}
                </div>
                {selectedBank && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-700 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Selected: {selectedBank}</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Demo accounts will be created for testing purposes
                    </p>
                  </div>
                )}
              </div>
            </div>
            <Button 
              onClick={handleStartLinking} 
              disabled={isLinking || !selectedBank}
              className="w-full"
              data-testid="button-start-linking"
            >
              {isLinking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4 mr-2" />
                  {selectedBank ? `Link ${selectedBank} Account` : 'Select a Bank First'}
                </>
              )}
            </Button>
          </div>
        );

      case 'linking':
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Connecting to Your Bank</h3>
              <p className="text-sm text-muted-foreground">
                Please complete the authentication process with your bank. This may take a few moments...
              </p>
            </div>
          </div>
        );

      case 'selecting':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Select Bank Account to Link</h3>
              <p className="text-sm text-muted-foreground">
                Choose which bank account you'd like to connect. You can link additional accounts later.
              </p>
            </div>
            
            <div className="space-y-3">
              {availableAccounts.map((account) => (
                <Card 
                  key={account.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedAccounts.has(account.id) 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleAccountToggle(account.id)}
                  data-testid={`card-select-account-${account.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Landmark className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{account.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {account.institution.name} • ****{account.accountNumber.slice(-4)}
                          </div>
                          <div className="text-sm">
                            <Badge variant="outline" className="text-xs">
                              {account.accountType}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {account.currency} {parseFloat(account.balance.quantity).toLocaleString()}
                        </div>
                        {selectedAccounts.has(account.id) && (
                          <CheckCircle className="w-5 h-5 text-blue-600 mt-1 ml-auto" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleTryAgain} className="flex-1" data-testid="button-cancel-linking">
                Cancel
              </Button>
              <Button 
                onClick={handleLinkSelectedAccounts} 
                disabled={isLinking || selectedAccounts.size === 0}
                className="flex-1"
                data-testid="button-link-selected-accounts"
              >
                {isLinking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Linking...
                  </>
                ) : (
                  `Link ${selectedAccounts.size} Account${selectedAccounts.size !== 1 ? 's' : ''}`
                )}
              </Button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Successfully Linked!</h3>
              <p className="text-sm text-muted-foreground">
                Your bank accounts have been linked and will now automatically sync transactions.
              </p>
            </div>
            <Button onClick={handleTryAgain} variant="outline" className="w-full" data-testid="button-link-another-account">
              Link Another Account
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Landmark className="w-5 h-5" />
          Bank Feed Integration
        </CardTitle>
        <CardDescription>
          Connect your bank account for automated transaction syncing
        </CardDescription>
      </CardHeader>
      <CardContent>
        {linkingError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700">{linkingError}</span>
            </div>
          </div>
        )}
        {renderStepContent()}
      </CardContent>
    </Card>
  );
}
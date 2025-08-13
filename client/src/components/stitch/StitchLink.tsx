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

  const createLinkTokenMutation = useMutation({
    mutationFn: () => apiRequest('/api/stitch/link-token', { method: 'POST' }),
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

  const exchangeLinkMutation = useMutation({
    mutationFn: (data: { userId: string; accounts: StitchAccount[] }) =>
      apiRequest('/api/stitch/exchange', { method: 'POST', body: data }),
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

  const simulateStitchLink = (linkToken: string) => {
    setLinkStep('linking');
    
    // Simulate the Stitch Link redirect and callback
    // In a real implementation, this would be handled by Stitch's SDK
    setTimeout(() => {
      // Simulate successful account selection from selected bank
      const bankName = selectedBank || 'First National Bank';
      const bankId = selectedBank ? selectedBank.toLowerCase().replace(/\s+/g, '') : 'fnb';
      
      const mockAccounts: StitchAccount[] = [
        {
          id: 'acc_demo_12345',
          name: 'Business Current Account',
          officialName: `${bankName} Business Current Account`,
          accountType: 'current',
          accountNumber: '1234567890',
          currency: 'ZAR',
          balance: {
            currency: 'ZAR',
            quantity: '25000.50'
          },
          institution: {
            id: bankId,
            name: bankName,
            logo: `https://stitch.money/images/institutions/${bankId}.png`
          }
        },
        {
          id: 'acc_demo_67890',
          name: 'Business Savings Account',
          officialName: `${bankName} Business Savings Account`,
          accountType: 'savings',
          accountNumber: '0987654321',
          currency: 'ZAR',
          balance: {
            currency: 'ZAR',
            quantity: '150000.00'
          },
          institution: {
            id: bankId,
            name: bankName,
            logo: `https://stitch.money/images/institutions/${bankId}.png`
          }
        }
      ];

      setAvailableAccounts(mockAccounts);
      // Don't pre-select accounts - let user choose which bank to link
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
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                <Button
                  variant={selectedBank === 'FNB' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedBank('FNB')}
                  className="rounded-full"
                >
                  FNB
                </Button>
                <Button
                  variant={selectedBank === 'Standard Bank' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedBank('Standard Bank')}
                  className="rounded-full"
                >
                  Standard Bank
                </Button>
                <Button
                  variant={selectedBank === 'ABSA' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedBank('ABSA')}
                  className="rounded-full"
                >
                  ABSA
                </Button>
                <Button
                  variant={selectedBank === 'Nedbank' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedBank('Nedbank')}
                  className="rounded-full"
                >
                  Nedbank
                </Button>
                <Button
                  variant={selectedBank === 'Capitec' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedBank('Capitec')}
                  className="rounded-full"
                >
                  Capitec
                </Button>
              </div>
            </div>
            <Button 
              onClick={handleStartLinking} 
              disabled={isLinking || !selectedBank}
              className="w-full"
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
              <Button variant="outline" onClick={handleTryAgain} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleLinkSelectedAccounts} 
                disabled={isLinking || selectedAccounts.size === 0}
                className="flex-1"
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
            <Button onClick={handleTryAgain} variant="outline" className="w-full">
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
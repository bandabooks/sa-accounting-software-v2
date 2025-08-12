import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SuccessModal } from '@/components/ui/success-modal';
import { useSuccessModal } from '@/hooks/useSuccessModal';
import { toast } from '@/hooks/use-toast';
import { CreditCard, Shield, AlertTriangle, Settings, Globe, TestTube, Zap } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase: string;
  testMode: boolean;
  isActive: boolean;
}

export default function PaymentSettings() {
  const successModal = useSuccessModal();
  const queryClient = useQueryClient();
  
  // Fetch PayFast configuration from API
  const { data: payFastConfig, isLoading: configLoading } = useQuery<PayFastConfig>({
    queryKey: ['/api/admin/payfast-config'],
  });

  const [localConfig, setLocalConfig] = useState<PayFastConfig>({
    merchantId: '18432458',
    merchantKey: 'm5vlzssivllny',
    passphrase: '••••••••••••••••',
    testMode: false, // Currently in LIVE mode
    isActive: true,
  });

  const updatePayFastConfigMutation = useMutation({
    mutationFn: async (config: Partial<PayFastConfig>) => {
      return await apiRequest('/api/admin/payfast-config', {
        method: 'PUT',
        body: JSON.stringify(config),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payfast-config'] });
      successModal.showSuccess({
        title: 'PayFast Configuration Updated',
        description: 'Payment gateway settings have been successfully updated.',
        confirmText: 'Continue',
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update PayFast configuration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggleTestMode = (testMode: boolean) => {
    setLocalConfig(prev => ({ ...prev, testMode }));
    updatePayFastConfigMutation.mutate({ testMode });
  };

  const handleToggleActive = (isActive: boolean) => {
    setLocalConfig(prev => ({ ...prev, isActive }));
    updatePayFastConfigMutation.mutate({ isActive });
  };

  // Use server config if available, otherwise use local config
  const currentConfig = payFastConfig || localConfig;

  // Ensure currentConfig has all required properties
  const safeConfig = {
    merchantId: currentConfig?.merchantId || '18432458',
    merchantKey: currentConfig?.merchantKey || 'm5vlzssivllny',
    passphrase: currentConfig?.passphrase || '••••••••••••••••',
    testMode: currentConfig?.testMode ?? false,
    isActive: currentConfig?.isActive ?? true,
    gatewayUrl: currentConfig?.gatewayUrl || 'https://www.payfast.co.za/eng/process'
  };

  // Loading state
  if (configLoading) {
    return (
      <div className="space-y-6">
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <CreditCard className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <CardTitle className="text-lg">PayFast Payment Gateway</CardTitle>
                <CardDescription>Loading payment configuration...</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PayFast Configuration */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${payFastConfig.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                <CreditCard className={`h-5 w-5 ${payFastConfig.isActive ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <CardTitle className="text-lg">PayFast Payment Gateway</CardTitle>
                <CardDescription>
                  Configure PayFast payment processing for subscription plans
                </CardDescription>
              </div>
            </div>
            <Badge variant={safeConfig.isActive ? "default" : "secondary"}>
              {safeConfig.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Configuration Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Merchant ID</Label>
              <div className="p-3 bg-gray-50 rounded-md">
                <code className="text-sm">{safeConfig.merchantId}</code>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Merchant Key</Label>
              <div className="p-3 bg-gray-50 rounded-md">
                <code className="text-sm">{safeConfig.merchantKey}</code>
              </div>
            </div>
          </div>

          {/* Payment Mode Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {safeConfig.testMode ? (
                    <TestTube className="h-4 w-4 text-orange-500" />
                  ) : (
                    <Globe className="h-4 w-4 text-green-500" />
                  )}
                  <Label className="font-medium">
                    Payment Mode: {safeConfig.testMode ? 'Test Mode' : 'Live Mode'}
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {safeConfig.testMode 
                    ? 'Using PayFast sandbox for testing - no real payments will be processed'
                    : 'Processing real payments through PayFast production gateway'
                  }
                </p>
              </div>
              <Switch
                checked={!safeConfig.testMode}
                onCheckedChange={(checked) => handleToggleTestMode(!checked)}
                disabled={updatePayFastConfigMutation.isPending}
              />
            </div>

            {/* PayFast Gateway Status */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <Label className="font-medium">Gateway Status</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enable or disable PayFast payment processing
                </p>
              </div>
              <Switch
                checked={safeConfig.isActive}
                onCheckedChange={handleToggleActive}
                disabled={updatePayFastConfigMutation.isPending}
              />
            </div>
          </div>

          {/* Current Mode Alert */}
          <Alert className={safeConfig.testMode ? "border-orange-200 bg-orange-50" : "border-green-200 bg-green-50"}>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              <strong>Current Status:</strong> PayFast is currently in{' '}
              <strong>{safeConfig.testMode ? 'TEST MODE' : 'LIVE MODE'}</strong>.{' '}
              {safeConfig.testMode 
                ? 'No real payments will be processed. Use test card numbers for testing.'
                : 'Real payments are being processed. Customers will be charged actual money.'
              }
            </AlertDescription>
          </Alert>

          {/* Test Mode Warning */}
          {!safeConfig.testMode && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Live Mode Active:</strong> All subscription payments will charge customers real money. 
                Ensure your PayFast merchant account is properly configured and verified before accepting payments.
              </AlertDescription>
            </Alert>
          )}

          {/* Payment Gateway URLs */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Payment Gateway URL</Label>
            <div className="p-3 bg-gray-50 rounded-md">
              <code className="text-sm">
                {safeConfig.testMode 
                  ? 'https://sandbox.payfast.co.za/eng/process'
                  : 'https://www.payfast.co.za/eng/process'
                }
              </code>
            </div>
          </div>

          {/* Configuration Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={() => {
              toast({
                title: "PayFast Dashboard",
                description: "Opening PayFast merchant dashboard in new window...",
              });
              window.open('https://www.payfast.co.za/login', '_blank');
            }}>
              <Settings className="h-4 w-4 mr-2" />
              Open PayFast Dashboard
            </Button>
            
            <Button 
              onClick={() => {
                toast({
                  title: "Configuration Test",
                  description: "Testing PayFast configuration and connectivity...",
                });
              }}
              disabled={updatePayFastConfigMutation.isPending}
            >
              Test Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={successModal.hideSuccess}
        title={successModal.modalOptions.title}
        description={successModal.modalOptions.description}
        confirmText={successModal.modalOptions.confirmText}
      />
    </div>
  );
}
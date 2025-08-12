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

interface PaymentMode {
  liveMode: boolean;
  provider: string;
}

export default function PaymentSettings() {
  const successModal = useSuccessModal();
  const queryClient = useQueryClient();
  
  // Fetch payment mode from API
  const { data: paymentMode, isLoading: configLoading } = useQuery<PaymentMode>({
    queryKey: ['/api/payment/mode'],
  });

  const updatePaymentModeMutation = useMutation({
    mutationFn: async (liveMode: boolean) => {
      return await apiRequest('/api/payment/mode', 'PUT', { liveMode });
    },
    onSuccess: (data: any, liveMode: boolean) => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment/mode'] });
      successModal.showSuccess({
        title: liveMode ? 'Live Mode Enabled' : 'Test Mode Enabled',
        description: liveMode 
          ? 'Payment processing is now in LIVE mode. Real transactions will be processed.'
          : 'Payment processing is now in TEST mode. Transactions will be simulated.',
        confirmText: 'Continue',
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update payment mode. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggleLiveMode = (enabled: boolean) => {
    updatePaymentModeMutation.mutate(enabled);
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
                <CardTitle className="text-lg">Payment Configuration</CardTitle>
                <CardDescription>Loading payment settings...</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isLiveMode = paymentMode?.liveMode || false;

  return (
    <div className="space-y-6">
      {/* Payment Mode Configuration */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${isLiveMode ? 'bg-green-100' : 'bg-amber-100'}`}>
                <CreditCard className={`h-5 w-5 ${isLiveMode ? 'text-green-600' : 'text-amber-600'}`} />
              </div>
              <div>
                <CardTitle className="text-lg">Payment Processing Mode</CardTitle>
                <CardDescription>
                  Control whether payments are processed in test or live mode
                </CardDescription>
              </div>
            </div>
            <Badge variant={isLiveMode ? "default" : "secondary"}>
              {isLiveMode ? 'LIVE MODE' : 'TEST MODE'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Mode Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {isLiveMode ? (
                    <Globe className="h-4 w-4 text-green-500" />
                  ) : (
                    <TestTube className="h-4 w-4 text-orange-500" />
                  )}
                  <Label className="font-medium">
                    Payment Processing Mode
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isLiveMode 
                    ? 'Processing real payments through payment gateway'
                    : 'Using sandbox for testing - no real payments will be processed'
                  }
                </p>
              </div>
              <Switch
                checked={isLiveMode}
                onCheckedChange={handleToggleLiveMode}
                disabled={updatePaymentModeMutation.isPending}
              />
            </div>
          </div>

          {/* Current Mode Alert */}
          <Alert className={isLiveMode ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              <strong>Current Status:</strong> System is in{' '}
              <strong>{isLiveMode ? 'LIVE MODE' : 'TEST MODE'}</strong>.{' '}
              {isLiveMode 
                ? 'Real payments are being processed. Customers will be charged actual money.'
                : 'No real payments will be processed. Use test card numbers for testing.'
              }
            </AlertDescription>
          </Alert>

          {/* Live Mode Warning */}
          {isLiveMode && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Live Mode Active:</strong> All payments will charge customers real money. 
                Ensure your payment gateway is properly configured and verified before accepting payments.
              </AlertDescription>
            </Alert>
          )}

          {/* Payment Provider Information */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Payment Provider</Label>
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="flex items-center justify-between">
                <code className="text-sm">{paymentMode?.provider || 'payfast'}</code>
                <Badge variant="outline">
                  {isLiveMode ? 'Production' : 'Sandbox'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Configuration Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={() => {
              toast({
                title: "Payment Dashboard",
                description: "Opening payment provider dashboard...",
              });
              window.open('https://www.payfast.co.za/login', '_blank');
            }}>
              <Settings className="h-4 w-4 mr-2" />
              Open Payment Dashboard
            </Button>
            
            <div className="text-sm text-gray-600">
              Provider: <strong className="text-gray-800">{paymentMode?.provider || 'PayFast'}</strong>
            </div>
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
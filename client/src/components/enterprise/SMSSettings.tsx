import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SuccessModal } from '@/components/ui/success-modal';
import { useSuccessModal } from '@/hooks/useSuccessModal';
import { toast } from '@/hooks/use-toast';
import { MessageSquare, Phone, Key, Send, Check, AlertTriangle, Settings, Eye, EyeOff, Info } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface SMSConfig {
  configured: boolean;
  provider: string;
  phoneNumber: string | null;
  testMode: boolean;
}

export default function SMSSettings() {
  const [showSecrets, setShowSecrets] = useState(false);
  const [testSMSSent, setTestSMSSent] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const successModal = useSuccessModal();
  const queryClient = useQueryClient();

  // Fetch SMS configuration
  const { data: smsConfig, isLoading } = useQuery<SMSConfig>({
    queryKey: ['/api/sms/config'],
  });

  // Update SMS configuration
  const updateConfigMutation = useMutation({
    mutationFn: async (config: { accountSid: string; authToken: string; phoneNumber: string }) => {
      return await apiRequest('/api/sms/config', 'PUT', config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sms/config'] });
      queryClient.invalidateQueries({ queryKey: ['/api/system/configuration'] });
      successModal.showSuccess({
        title: "SMS Configuration Updated",
        description: "Your SMS settings have been saved. Please restart the server for changes to take effect.",
        confirmText: "Continue"
      });
      // Clear sensitive fields
      setAccountSid('');
      setAuthToken('');
      setPhoneNumber('');
    },
    onError: () => {
      toast({
        title: "Configuration Failed",
        description: "Failed to update SMS configuration",
        variant: "destructive",
      });
    },
  });

  // Test SMS
  const testSMSMutation = useMutation({
    mutationFn: async (phone: string) => {
      return await apiRequest('/api/notifications/test-sms', 'POST', { phone });
    },
    onSuccess: () => {
      setTestSMSSent(true);
      setTimeout(() => setTestSMSSent(false), 3000);
      successModal.showSuccess({
        title: "Test SMS Sent Successfully",
        description: "Check your phone for the test notification message.",
        confirmText: "Continue"
      });
    },
    onError: () => {
      toast({
        title: "Test Failed",
        description: "Failed to send test SMS. Please check your configuration.",
        variant: "destructive",
      });
    },
  });

  const handleSaveConfig = () => {
    if (!accountSid || !authToken || !phoneNumber) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    updateConfigMutation.mutate({ accountSid, authToken, phoneNumber });
  };

  const handleTestSMS = () => {
    if (!testPhone) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a phone number for testing",
        variant: "destructive",
      });
      return;
    }

    testSMSMutation.mutate(testPhone);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SMS Configuration */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${smsConfig?.configured ? 'bg-green-100' : 'bg-gray-100'}`}>
                <MessageSquare className={`h-5 w-5 ${smsConfig?.configured ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <CardTitle className="text-lg">SMS Configuration</CardTitle>
                <CardDescription>
                  Configure Twilio for SMS notifications
                </CardDescription>
              </div>
            </div>
            <Badge variant={smsConfig?.configured ? "default" : "secondary"}>
              {smsConfig?.configured ? 'Configured' : 'Not Configured'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!smsConfig?.configured && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                SMS service is not configured. Enter your Twilio credentials below to enable SMS notifications.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account-sid">Twilio Account SID</Label>
              <Input
                id="account-sid"
                type={showSecrets ? "text" : "password"}
                value={accountSid}
                onChange={(e) => setAccountSid(e.target.value)}
                placeholder="Enter your Twilio Account SID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="auth-token">Twilio Auth Token</Label>
              <div className="relative">
                <Input
                  id="auth-token"
                  type={showSecrets ? "text" : "password"}
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  placeholder="Enter your Twilio Auth Token"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone-number">Twilio Phone Number</Label>
              <Input
                id="phone-number"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
              />
              <p className="text-sm text-gray-600">
                Your Twilio phone number in E.164 format (e.g., +1234567890)
              </p>
            </div>

            <Button 
              onClick={handleSaveConfig}
              disabled={updateConfigMutation.isPending}
              className="w-full"
            >
              <Settings className="mr-2 h-4 w-4" />
              Save SMS Configuration
            </Button>
          </div>

          {smsConfig?.configured && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Current Configuration</p>
                  <p className="text-sm text-gray-600">
                    Provider: {smsConfig.provider} | Phone: {smsConfig.phoneNumber}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-phone">Test Phone Number</Label>
                <div className="flex space-x-2">
                  <Input
                    id="test-phone"
                    type="tel"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="Enter phone number for testing"
                    className="flex-1"
                  />
                  <Button 
                    variant="outline"
                    onClick={handleTestSMS}
                    disabled={testSMSMutation.isPending || !testPhone}
                  >
                    {testSMSSent ? (
                      <>
                        <Check className="mr-2 h-4 w-4 text-green-600" />
                        Sent
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Test
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SMS Provider Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">SMS Provider Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Twilio Setup Guide</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Sign up for a Twilio account at twilio.com</li>
              <li>Get your Account SID and Auth Token from the Twilio Console</li>
              <li>Purchase a phone number from Twilio</li>
              <li>Enter your credentials above and save the configuration</li>
              <li>Test your setup using the test SMS feature</li>
            </ol>
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              SMS charges apply based on your Twilio pricing plan. Make sure to monitor your usage to avoid unexpected charges.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
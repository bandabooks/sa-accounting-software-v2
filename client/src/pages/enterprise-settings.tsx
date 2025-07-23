import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Shield, Smartphone, Brain, Bell, Mail, MessageSquare, Settings, Lock, Unlock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface TwoFactorStatus {
  enabled: boolean;
  backupCodesRemaining: number;
}

interface SystemConfiguration {
  features: {
    smtp: boolean;
    sms: boolean;
    googleOAuth: boolean;
    microsoftOAuth: boolean;
    ai: boolean;
  };
  providers: {
    ai: string[];
  };
}

export default function EnterpriseSettings() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [verificationToken, setVerificationToken] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const queryClient = useQueryClient();

  // Fetch 2FA status
  const { data: twoFactorStatus, isLoading: is2FALoading } = useQuery<TwoFactorStatus>({
    queryKey: ['/api/2fa/status'],
  });

  // Fetch system configuration
  const { data: systemConfig } = useQuery<SystemConfiguration>({
    queryKey: ['/api/system/configuration'],
  });

  // Setup 2FA mutation
  const setup2FAMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/2fa/setup', 'POST');
      return response;
    },
    onSuccess: (data) => {
      setQrCodeUrl(data.qrCodeUrl);
      toast({
        title: "2FA Setup Ready",
        description: "Scan the QR code with your authenticator app",
      });
    },
    onError: () => {
      toast({
        title: "Setup Failed",
        description: "Failed to setup 2FA. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Enable 2FA mutation
  const enable2FAMutation = useMutation({
    mutationFn: async (token: string) => {
      return await apiRequest('/api/2fa/enable', 'POST', { token });
    },
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes);
      setShowBackupCodes(true);
      setQrCodeUrl('');
      queryClient.invalidateQueries({ queryKey: ['/api/2fa/status'] });
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been enabled successfully",
      });
    },
    onError: () => {
      toast({
        title: "Verification Failed",
        description: "Invalid verification token. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Disable 2FA mutation
  const disable2FAMutation = useMutation({
    mutationFn: async (token: string) => {
      return await apiRequest('/api/2fa/disable', 'POST', { token });
    },
    onSuccess: () => {
      setQrCodeUrl('');
      setBackupCodes([]);
      setShowBackupCodes(false);
      queryClient.invalidateQueries({ queryKey: ['/api/2fa/status'] });
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled",
      });
    },
    onError: () => {
      toast({
        title: "Disable Failed",
        description: "Failed to disable 2FA. Check your verification token.",
        variant: "destructive",
      });
    },
  });

  const handleEnable2FA = () => {
    if (verificationToken.length === 6) {
      enable2FAMutation.mutate(verificationToken);
    } else {
      toast({
        title: "Invalid Token",
        description: "Please enter a 6-digit verification code",
        variant: "destructive",
      });
    }
  };

  const handleDisable2FA = () => {
    if (verificationToken.length === 6) {
      disable2FAMutation.mutate(verificationToken);
    } else {
      toast({
        title: "Invalid Token",
        description: "Please enter a 6-digit verification code",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Enterprise Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage advanced security and enterprise features</p>
      </div>

      <Tabs defaultValue="security" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <CardTitle>Two-Factor Authentication</CardTitle>
              </div>
              <CardDescription>
                Add an extra layer of security to your account with 2FA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {is2FALoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {twoFactorStatus?.enabled ? <Lock className="h-4 w-4 text-green-600" /> : <Unlock className="h-4 w-4 text-gray-400" />}
                      <span className="font-medium">
                        Status: {twoFactorStatus?.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <Badge variant={twoFactorStatus?.enabled ? 'default' : 'secondary'}>
                      {twoFactorStatus?.enabled ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {twoFactorStatus?.enabled && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Backup codes remaining: {twoFactorStatus.backupCodesRemaining}
                    </div>
                  )}

                  {!twoFactorStatus?.enabled && !qrCodeUrl && (
                    <Button 
                      onClick={() => setup2FAMutation.mutate()}
                      disabled={setup2FAMutation.isPending}
                      className="w-full"
                    >
                      {setup2FAMutation.isPending ? 'Setting up...' : 'Setup 2FA'}
                    </Button>
                  )}

                  {qrCodeUrl && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <img src={qrCodeUrl} alt="2FA QR Code" className="mx-auto mb-4" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Scan this QR code with your authenticator app, then enter the 6-digit code below
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Enter 6-digit code"
                          value={verificationToken}
                          onChange={(e) => setVerificationToken(e.target.value)}
                          maxLength={6}
                        />
                        <Button 
                          onClick={handleEnable2FA}
                          disabled={enable2FAMutation.isPending || verificationToken.length !== 6}
                        >
                          {enable2FAMutation.isPending ? 'Enabling...' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {twoFactorStatus?.enabled && (
                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="font-medium text-red-600">Disable 2FA</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enter a verification code from your authenticator app to disable 2FA
                      </p>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Enter 6-digit code"
                          value={verificationToken}
                          onChange={(e) => setVerificationToken(e.target.value)}
                          maxLength={6}
                        />
                        <Button 
                          variant="destructive"
                          onClick={handleDisable2FA}
                          disabled={disable2FAMutation.isPending || verificationToken.length !== 6}
                        >
                          {disable2FAMutation.isPending ? 'Disabling...' : 'Disable'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {showBackupCodes && backupCodes.length > 0 && (
                    <div className="space-y-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-yellow-600" />
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                          Backup Codes - Save These!
                        </h4>
                      </div>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Store these backup codes in a secure place. You can use them to access your account if you lose your authenticator device.
                      </p>
                      <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                        {backupCodes.map((code, index) => (
                          <div key={index} className="p-2 bg-white dark:bg-gray-800 rounded border">
                            {code}
                          </div>
                        ))}
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowBackupCodes(false)}
                        className="w-full"
                      >
                        I've Saved These Codes
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <CardTitle>Notification Preferences</CardTitle>
              </div>
              <CardDescription>
                Configure how you receive notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive email alerts for important events
                      </p>
                    </div>
                  </div>
                  <Switch 
                    defaultChecked={true}
                    disabled={!systemConfig?.features.smtp}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive SMS alerts for critical security events
                      </p>
                    </div>
                  </div>
                  <Switch 
                    defaultChecked={false}
                    disabled={!systemConfig?.features.sms}
                  />
                </div>

                {!systemConfig?.features.smtp && (
                  <div className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
                    Email notifications are not available. SMTP configuration required.
                  </div>
                )}

                {!systemConfig?.features.sms && (
                  <div className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
                    SMS notifications are not available. Twilio configuration required.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai-assistant" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <CardTitle>AI Assistant</CardTitle>
              </div>
              <CardDescription>
                Get intelligent help with accounting tasks and business insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>AI Assistant Status</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {systemConfig?.features.ai ? 'Available' : 'Not configured'}
                  </p>
                </div>
                <Badge variant={systemConfig?.features.ai ? 'default' : 'secondary'}>
                  {systemConfig?.features.ai ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {systemConfig?.features.ai && (
                <div className="space-y-2">
                  <Label>Available Providers</Label>
                  <div className="flex space-x-2">
                    {systemConfig.providers.ai.map((provider) => (
                      <Badge key={provider} variant="outline">
                        {provider.charAt(0).toUpperCase() + provider.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {systemConfig?.features.ai ? (
                <div className="space-y-4">
                  <Button className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Open AI Chat
                  </Button>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    The AI assistant can help with:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Invoice analysis and insights</li>
                      <li>Chart of accounts recommendations</li>
                      <li>VAT compliance guidance</li>
                      <li>Financial report interpretation</li>
                      <li>Business process optimization</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
                  AI Assistant is not available. Please configure ANTHROPIC_API_KEY or OPENAI_API_KEY.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-green-600" />
                <CardTitle>OAuth Integrations</CardTitle>
              </div>
              <CardDescription>
                Connect your Google and Microsoft accounts for easier login
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-bold text-sm">G</span>
                    </div>
                    <div>
                      <Label>Google Account</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Sign in with your Google account
                      </p>
                    </div>
                  </div>
                  <Badge variant={systemConfig?.features.googleOAuth ? 'default' : 'secondary'}>
                    {systemConfig?.features.googleOAuth ? 'Available' : 'Not configured'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">M</span>
                    </div>
                    <div>
                      <Label>Microsoft Account</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Sign in with your Microsoft account
                      </p>
                    </div>
                  </div>
                  <Badge variant={systemConfig?.features.microsoftOAuth ? 'default' : 'secondary'}>
                    {systemConfig?.features.microsoftOAuth ? 'Available' : 'Not configured'}
                  </Badge>
                </div>
              </div>

              {(!systemConfig?.features.googleOAuth && !systemConfig?.features.microsoftOAuth) && (
                <div className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
                  OAuth integrations are not configured. Contact your administrator to enable Google or Microsoft sign-in.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
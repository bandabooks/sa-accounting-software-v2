import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { SuccessModal } from '@/components/ui/success-modal';
import { useSuccessModal } from '@/hooks/useSuccessModal';
import { toast } from '@/hooks/use-toast';
import { Bell, Mail, MessageSquare, Send, Check, AlertTriangle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface NotificationSettings {
  email: {
    enabled: boolean;
    invoiceReminders: boolean;
    paymentAlerts: boolean;
    securityAlerts: boolean;
    systemUpdates: boolean;
  };
  sms: {
    enabled: boolean;
    criticalAlerts: boolean;
    paymentReminders: boolean;
  };
}

interface SystemConfiguration {
  features: {
    smtp: boolean;
    sms: boolean;
    googleOAuth: boolean;
    microsoftOAuth: boolean;
    ai: boolean;
  };
}

interface NotificationSettingsProps {
  notificationSettings?: NotificationSettings;
  systemConfig?: SystemConfiguration;
}

export default function NotificationSettings({ notificationSettings, systemConfig }: NotificationSettingsProps) {
  const [testEmailSent, setTestEmailSent] = useState(false);
  const [testSMSSent, setTestSMSSent] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const successModal = useSuccessModal();
  const queryClient = useQueryClient();
  
  // Provide default values if notificationSettings is undefined
  const defaultNotificationSettings: NotificationSettings = {
    email: {
      enabled: true,
      invoiceReminders: true,
      paymentAlerts: true,
      securityAlerts: true,
      systemUpdates: true
    },
    sms: {
      enabled: false,
      criticalAlerts: false,
      paymentReminders: false
    }
  };
  
  // Use local state to manage settings independently
  const [localSettings, setLocalSettings] = useState<NotificationSettings>(
    notificationSettings || defaultNotificationSettings
  );
  
  // Update local settings when props change
  useEffect(() => {
    if (notificationSettings) {
      setLocalSettings(notificationSettings);
    }
  }, [notificationSettings]);

  // Update notification settings mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (settings: NotificationSettings) => {
      return await apiRequest('/api/notifications/settings', 'PUT', settings);
    },
    onSuccess: async (data) => {
      // Don't invalidate queries to prevent resetting local state
      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: (error) => {
      console.error('Update failed:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update notification settings",
        variant: "destructive",
      });
    },
  });

  // Test email notification
  const testEmailMutation = useMutation({
    mutationFn: async () => {
      if (!testEmailAddress) {
        throw new Error('Please enter an email address');
      }
      return await apiRequest('/api/notifications/test-email', 'POST', { 
        email: testEmailAddress 
      });
    },
    onSuccess: () => {
      setTestEmailSent(true);
      setTimeout(() => setTestEmailSent(false), 3000);
      successModal.showSuccess({
        title: "Test Email Sent Successfully",
        description: "Check your inbox for the test notification email.",
        confirmText: "Continue"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Test Failed",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    },
  });

  // Test SMS notification
  const testSMSMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/notifications/test-sms', 'POST');
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
        description: "Failed to send test SMS",
        variant: "destructive",
      });
    },
  });

  const handleEmailToggle = (key: keyof NotificationSettings['email'], value: boolean) => {
    const updatedSettings = {
      ...localSettings,
      email: {
        ...localSettings.email,
        [key]: value,
      },
    };
    
    // Update local state immediately for responsive UI
    setLocalSettings(updatedSettings);
    
    // Then sync with backend
    updateNotificationsMutation.mutate(updatedSettings);
  };

  const handleSMSToggle = (key: keyof NotificationSettings['sms'], value: boolean) => {
    const updatedSettings = {
      ...localSettings,
      sms: {
        ...localSettings.sms,
        [key]: value,
      },
    };
    
    // Update local state immediately for responsive UI
    setLocalSettings(updatedSettings);
    
    // Then sync with backend
    updateNotificationsMutation.mutate(updatedSettings);
  };

  // Remove the loading state since we have default values

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${systemConfig?.features.smtp ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Mail className={`h-5 w-5 ${systemConfig?.features.smtp ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <CardTitle className="text-lg">Email Notifications</CardTitle>
                <CardDescription>
                  Receive important updates and alerts via email
                </CardDescription>
              </div>
            </div>
            <Badge variant={systemConfig?.features.smtp ? "default" : "secondary"}>
              {systemConfig?.features.smtp ? 'Available' : 'Not Configured'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!systemConfig?.features.smtp && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Email service is not configured. Contact your administrator to enable email notifications.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="email-enabled">Enable Email Notifications</Label>
                <p className="text-sm text-gray-600">Master switch for all email notifications</p>
              </div>
              <Switch
                id="email-enabled"
                checked={localSettings.email.enabled}
                onCheckedChange={(checked) => handleEmailToggle('enabled', checked)}
                disabled={!systemConfig?.features.smtp || updateNotificationsMutation.isPending}
              />
            </div>

            {localSettings.email.enabled && (
              <div className="ml-6 space-y-4 border-l-2 border-gray-200 pl-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="invoice-reminders">Invoice Reminders</Label>
                    <p className="text-sm text-gray-600">Automated reminders for overdue invoices</p>
                  </div>
                  <Switch
                    id="invoice-reminders"
                    checked={localSettings.email.invoiceReminders}
                    onCheckedChange={(checked) => handleEmailToggle('invoiceReminders', checked)}
                    disabled={updateNotificationsMutation.isPending}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="payment-alerts">Payment Alerts</Label>
                    <p className="text-sm text-gray-600">Notifications when payments are received</p>
                  </div>
                  <Switch
                    id="payment-alerts"
                    checked={localSettings.email.paymentAlerts}
                    onCheckedChange={(checked) => handleEmailToggle('paymentAlerts', checked)}
                    disabled={updateNotificationsMutation.isPending}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="security-alerts">Security Alerts</Label>
                    <p className="text-sm text-gray-600">Important security-related notifications</p>
                  </div>
                  <Switch
                    id="security-alerts"
                    checked={localSettings.email.securityAlerts}
                    onCheckedChange={(checked) => handleEmailToggle('securityAlerts', checked)}
                    disabled={updateNotificationsMutation.isPending}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="system-updates">System Updates</Label>
                    <p className="text-sm text-gray-600">Feature updates and maintenance notifications</p>
                  </div>
                  <Switch
                    id="system-updates"
                    checked={localSettings.email.systemUpdates}
                    onCheckedChange={(checked) => handleEmailToggle('systemUpdates', checked)}
                    disabled={updateNotificationsMutation.isPending}
                  />
                </div>
              </div>
            )}

            {systemConfig?.features.smtp && (
              <div className="space-y-3 pt-3 border-t">
                <div className="space-y-2">
                  <Label htmlFor="test-email">Test Email Address</Label>
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="Enter email address to send test"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">Enter an email address to receive a test notification</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => testEmailMutation.mutate()}
                  disabled={testEmailMutation.isPending || !localSettings.email.enabled || !testEmailAddress}
                  className="w-full"
                >
                  {testEmailSent ? (
                    <>
                      <Check className="mr-2 h-4 w-4 text-green-600" />
                      Test Email Sent
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Test Email
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${systemConfig?.features.sms ? 'bg-green-100' : 'bg-gray-100'}`}>
                <MessageSquare className={`h-5 w-5 ${systemConfig?.features.sms ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <CardTitle className="text-lg">SMS Notifications</CardTitle>
                <CardDescription>
                  Receive critical alerts via SMS
                </CardDescription>
              </div>
            </div>
            <Badge variant={systemConfig?.features.sms ? "default" : "secondary"}>
              {systemConfig?.features.sms ? 'Available' : 'Not Configured'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!systemConfig?.features.sms && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                SMS service is not configured. Contact your administrator to enable SMS notifications.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="sms-enabled">Enable SMS Notifications</Label>
                <p className="text-sm text-gray-600">Master switch for all SMS notifications</p>
              </div>
              <Switch
                id="sms-enabled"
                checked={localSettings.sms.enabled}
                onCheckedChange={(checked) => handleSMSToggle('enabled', checked)}
                disabled={!systemConfig?.features.sms || updateNotificationsMutation.isPending}
              />
            </div>

            {localSettings.sms.enabled && (
              <div className="ml-6 space-y-4 border-l-2 border-gray-200 pl-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="critical-alerts">Critical Security Alerts</Label>
                    <p className="text-sm text-gray-600">Important security breaches and login alerts</p>
                  </div>
                  <Switch
                    id="critical-alerts"
                    checked={localSettings.sms.criticalAlerts}
                    onCheckedChange={(checked) => handleSMSToggle('criticalAlerts', checked)}
                    disabled={updateNotificationsMutation.isPending}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="payment-reminders-sms">Payment Reminders</Label>
                    <p className="text-sm text-gray-600">Urgent payment reminders for overdue accounts</p>
                  </div>
                  <Switch
                    id="payment-reminders-sms"
                    checked={localSettings.sms.paymentReminders}
                    onCheckedChange={(checked) => handleSMSToggle('paymentReminders', checked)}
                    disabled={updateNotificationsMutation.isPending}
                  />
                </div>
              </div>
            )}

            {systemConfig?.features.sms && (
              <Button 
                variant="outline" 
                onClick={() => testSMSMutation.mutate()}
                disabled={testSMSMutation.isPending || !localSettings.sms.enabled}
                className="w-full"
              >
                {testSMSSent ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    Test SMS Sent
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Test SMS
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences Summary */}
      <Card className="bg-gray-50 border-dashed">
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Bell className="mr-2 h-4 w-4" />
            Notification Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium mb-2">Email Notifications:</p>
              <ul className="space-y-1 text-gray-600">
                <li className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${localSettings.email.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                  Email: {localSettings.email.enabled ? 'Enabled' : 'Disabled'}
                </li>
                <li className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${localSettings.email.invoiceReminders ? 'bg-green-500' : 'bg-gray-300'}`} />
                  Invoice Reminders: {localSettings.email.invoiceReminders ? 'On' : 'Off'}
                </li>
                <li className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${localSettings.email.paymentAlerts ? 'bg-green-500' : 'bg-gray-300'}`} />
                  Payment Alerts: {localSettings.email.paymentAlerts ? 'On' : 'Off'}
                </li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">SMS Notifications:</p>
              <ul className="space-y-1 text-gray-600">
                <li className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${localSettings.sms.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                  SMS: {localSettings.sms.enabled ? 'Enabled' : 'Disabled'}
                </li>
                <li className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${localSettings.sms.criticalAlerts ? 'bg-green-500' : 'bg-gray-300'}`} />
                  Critical Alerts: {localSettings.sms.criticalAlerts ? 'On' : 'Off'}
                </li>
                <li className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${localSettings.sms.paymentReminders ? 'bg-green-500' : 'bg-gray-300'}`} />
                  Payment Reminders: {localSettings.sms.paymentReminders ? 'On' : 'Off'}
                </li>
              </ul>
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
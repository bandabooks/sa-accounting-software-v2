import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { 
  Shield, 
  Smartphone, 
  Brain, 
  Bell, 
  Mail, 
  MessageSquare, 
  Settings, 
  Lock, 
  Unlock,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Info,
  RefreshCw,
  Send,
  Eye,
  EyeOff,
  History,
  Key,
  Zap,
  Globe,
  UserCheck,
  Activity
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import SecuritySettings from '@/components/enterprise/SecuritySettings';
import NotificationSettings from '@/components/enterprise/NotificationSettings';
import OAuthSettings from '@/components/enterprise/OAuthSettings';
import AISettings from '@/components/enterprise/AISettings';
import PaymentSettings from '@/components/enterprise/PaymentSettings';
import AuditLogs from '@/components/enterprise/AuditLogs';

interface TwoFactorStatus {
  enabled: boolean;
  backupCodesRemaining: number;
  secret?: string;
  qrCodeUrl?: string;
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

interface AISettings {
  enabled: boolean;
  provider: string;
  contextSharing: boolean;
  conversationHistory: boolean;
  suggestions: boolean;
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

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

interface OAuthStatus {
  google: {
    connected: boolean;
    email?: string;
    connectedAt?: string;
  };
  microsoft: {
    connected: boolean;
    email?: string;
    connectedAt?: string;
  };
}

interface AuditLogEntry {
  id: number;
  action: string;
  resource: string;
  userId: number;
  userName: string;
  timestamp: string;
  details?: any;
}

export default function EnterpriseSettings() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [verificationToken, setVerificationToken] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [activeTab, setActiveTab] = useState('security');
  const [setupStep, setSetupStep] = useState(0);
  const [copiedBackupCode, setCopiedBackupCode] = useState<string>('');
  const [testEmailSent, setTestEmailSent] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const queryClient = useQueryClient();

  // Fetch 2FA status
  const { data: twoFactorStatus, isLoading: is2FALoading } = useQuery<TwoFactorStatus>({
    queryKey: ['/api/2fa/status'],
  });

  // Fetch system configuration
  const { data: systemConfig } = useQuery<SystemConfiguration>({
    queryKey: ['/api/system/configuration'],
  });

  // Additional query hooks for component props
  const { data: notificationSettings } = useQuery<NotificationSettings>({
    queryKey: ['/api/notifications/settings'],
  });

  const { data: oauthStatus } = useQuery<OAuthStatus>({
    queryKey: ['/api/oauth/status'],
  });

  const { data: auditLogs } = useQuery<AuditLogEntry[]>({
    queryKey: ['/api/audit-logs/enterprise'],
  });

  // Fetch AI settings
  const { data: aiSettings } = useQuery<AISettings>({
    queryKey: ['/api/ai/settings'],
  });

  // Setup 2FA mutation
  const setup2FAMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/2fa/setup', 'POST');
      return response;
    },
    onSuccess: (data: any) => {
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
    onSuccess: (data: any) => {
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Enterprise Settings</h1>
        <p className="text-gray-600 mt-2">
          Configure advanced security, notifications, AI, and audit features for your organization
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="oauth" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>OAuth</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>AI Assistant</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center space-x-2">
            <Key className="h-4 w-4" />
            <span>Payment Settings</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Audit Logs</span>
          </TabsTrigger>
        </TabsList>

        {/* Security Tab */}
        <TabsContent value="security">
          <SecuritySettings 
            twoFactorStatus={twoFactorStatus}
            is2FALoading={is2FALoading}
          />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <NotificationSettings
            notificationSettings={notificationSettings}
            systemConfig={systemConfig}
          />
        </TabsContent>

        {/* OAuth Tab */}
        <TabsContent value="oauth">
          <OAuthSettings
            oauthStatus={oauthStatus}
            systemConfig={systemConfig}
          />
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai">
          <AISettings
            systemConfig={systemConfig}
            aiSettings={aiSettings}
          />
        </TabsContent>

        {/* Payment Settings Tab */}
        <TabsContent value="payment">
          <PaymentSettings />
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit">
          <AuditLogs auditLogs={auditLogs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
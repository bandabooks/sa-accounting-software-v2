import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { 
  Shield, 
  Smartphone, 
  Download, 
  Copy, 
  Check, 
  AlertTriangle, 
  Key,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface TwoFactorStatus {
  enabled: boolean;
  backupCodesRemaining: number;
  secret?: string;
  qrCodeUrl?: string;
}

interface SecuritySettingsProps {
  twoFactorStatus?: TwoFactorStatus;
  is2FALoading: boolean;
}

export default function SecuritySettings({ twoFactorStatus, is2FALoading }: SecuritySettingsProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [verificationToken, setVerificationToken] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [setupStep, setSetupStep] = useState(0);
  const [copiedBackupCode, setCopiedBackupCode] = useState<string>('');
  const [showSecrets, setShowSecrets] = useState(false);
  const queryClient = useQueryClient();

  // Setup 2FA mutation
  const setup2FAMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/2fa/setup', 'POST');
      return response;
    },
    onSuccess: (data) => {
      setQrCodeUrl(data.qrCodeUrl);
      setSetupStep(1);
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
      setSetupStep(2);
      queryClient.invalidateQueries({ queryKey: ['/api/2fa/status'] });
      toast({
        title: "2FA Enabled Successfully",
        description: "Two-factor authentication has been enabled. Save your backup codes!",
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
      setSetupStep(0);
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

  // Generate new backup codes
  const generateBackupCodesMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/2fa/regenerate-backup-codes', 'POST');
    },
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes);
      setShowBackupCodes(true);
      queryClient.invalidateQueries({ queryKey: ['/api/2fa/status'] });
      toast({
        title: "New Backup Codes Generated",
        description: "Your old backup codes are no longer valid. Save these new ones!",
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
    if (window.confirm('Are you sure you want to disable 2FA? This will reduce your account security.')) {
      if (verificationToken.length === 6) {
        disable2FAMutation.mutate(verificationToken);
      } else {
        toast({
          title: "Verification Required",
          description: "Please enter a 6-digit verification code to disable 2FA",
          variant: "destructive",
        });
      }
    }
  };

  const copyBackupCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedBackupCode(code);
    setTimeout(() => setCopiedBackupCode(''), 2000);
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'think-mybiz-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Backup Codes Downloaded",
      description: "Store these codes in a secure location",
    });
  };

  const getSetupProgress = () => {
    if (!twoFactorStatus?.enabled && setupStep === 0) return 0;
    if (qrCodeUrl && setupStep === 1) return 50;
    if (twoFactorStatus?.enabled || setupStep === 2) return 100;
    return 0;
  };

  if (is2FALoading) {
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
      {/* 2FA Status Overview */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${twoFactorStatus?.enabled ? 'bg-green-100' : 'bg-yellow-100'}`}>
                <Shield className={`h-5 w-5 ${twoFactorStatus?.enabled ? 'text-green-600' : 'text-yellow-600'}`} />
              </div>
              <div>
                <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </div>
            </div>
            <Badge variant={twoFactorStatus?.enabled ? "default" : "secondary"} className="px-3 py-1">
              {twoFactorStatus?.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Setup Progress</span>
              <span>{getSetupProgress()}%</span>
            </div>
            <Progress value={getSetupProgress()} className="h-2" />
          </div>

          {!twoFactorStatus?.enabled ? (
            <div className="space-y-4">
              {/* Step 1: Initial Setup */}
              {setupStep === 0 && (
                <div className="space-y-4">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Secure your account with two-factor authentication using an authenticator app like Google Authenticator or Microsoft Authenticator.
                    </AlertDescription>
                  </Alert>
                  <Button 
                    onClick={() => setup2FAMutation.mutate()} 
                    disabled={setup2FAMutation.isPending}
                    className="w-full"
                  >
                    {setup2FAMutation.isPending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        <Smartphone className="mr-2 h-4 w-4" />
                        Set up 2FA
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Step 2: QR Code Scanning */}
              {setupStep === 1 && qrCodeUrl && (
                <div className="space-y-4">
                  <Alert>
                    <Smartphone className="h-4 w-4" />
                    <AlertDescription>
                      Scan this QR code with your authenticator app, then enter the 6-digit code to complete setup.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                      <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verification-token">Verification Code</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="verification-token"
                        type="text"
                        value={verificationToken}
                        onChange={(e) => setVerificationToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        className="text-center text-lg tracking-wider"
                        maxLength={6}
                      />
                      <Button 
                        onClick={handleEnable2FA}
                        disabled={enable2FAMutation.isPending || verificationToken.length !== 6}
                      >
                        {enable2FAMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <Check className="h-4 w-4" />
                <AlertDescription>
                  Two-factor authentication is active. You have {twoFactorStatus?.backupCodesRemaining || 0} backup codes remaining.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => generateBackupCodesMutation.mutate()}
                  disabled={generateBackupCodesMutation.isPending}
                >
                  <Key className="mr-2 h-4 w-4" />
                  Generate New Backup Codes
                </Button>
                
                <Button 
                  variant="destructive" 
                  onClick={handleDisable2FA}
                  disabled={disable2FAMutation.isPending}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Disable 2FA
                </Button>
              </div>

              {/* Disable 2FA Token Input */}
              <div className="space-y-2">
                <Label htmlFor="disable-token">Enter verification code to make changes</Label>
                <Input
                  id="disable-token"
                  type="text"
                  value={verificationToken}
                  onChange={(e) => setVerificationToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="text-center"
                  maxLength={6}
                />
              </div>
            </div>
          )}

          {/* Show Backup Codes */}
          {showBackupCodes && backupCodes.length > 0 && (
            <Alert className="border-green-200 bg-green-50">
              <Download className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <p className="font-semibold">Save these backup codes securely:</p>
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                        <span className={showSecrets ? '' : 'blur-sm hover:blur-none transition-all'}>{code}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyBackupCode(code)}
                          className="h-6 w-6 p-0"
                        >
                          {copiedBackupCode === code ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <Button size="sm" variant="outline" onClick={() => setShowSecrets(!showSecrets)}>
                      {showSecrets ? <EyeOff className="mr-2 h-3 w-3" /> : <Eye className="mr-2 h-3 w-3" />}
                      {showSecrets ? 'Hide' : 'Show'} Codes
                    </Button>
                    <Button size="sm" onClick={downloadBackupCodes}>
                      <Download className="mr-2 h-3 w-3" />
                      Download Codes
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
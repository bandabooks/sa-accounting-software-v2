import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { 
  Globe, 
  UserCheck, 
  AlertTriangle, 
  Check, 
  Link2, 
  Unlink,
  RefreshCw,
  Shield
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

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

interface SystemConfiguration {
  features: {
    smtp: boolean;
    sms: boolean;
    googleOAuth: boolean;
    microsoftOAuth: boolean;
    ai: boolean;
  };
}

interface OAuthSettingsProps {
  oauthStatus?: OAuthStatus;
  systemConfig?: SystemConfiguration;
}

export default function OAuthSettings({ oauthStatus, systemConfig }: OAuthSettingsProps) {
  const queryClient = useQueryClient();

  // Connect Google OAuth
  const connectGoogleMutation = useMutation({
    mutationFn: async () => {
      window.location.href = '/api/oauth/google/connect';
    },
    onError: () => {
      toast({
        title: "Connection Failed",
        description: "Failed to connect Google account",
        variant: "destructive",
      });
    },
  });

  // Disconnect Google OAuth  
  const disconnectGoogleMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/oauth/google/disconnect', 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/oauth/status'] });
      toast({
        title: "Account Disconnected",
        description: "Google account has been disconnected successfully",
      });
    },
    onError: () => {
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect Google account",
        variant: "destructive",
      });
    },
  });

  // Connect Microsoft OAuth
  const connectMicrosoftMutation = useMutation({
    mutationFn: async () => {
      window.location.href = '/api/oauth/microsoft/connect';
    },
    onError: () => {
      toast({
        title: "Connection Failed",
        description: "Failed to connect Microsoft account",
        variant: "destructive",
      });
    },
  });

  // Disconnect Microsoft OAuth
  const disconnectMicrosoftMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/oauth/microsoft/disconnect', 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/oauth/status'] });
      toast({
        title: "Account Disconnected",
        description: "Microsoft account has been disconnected successfully",
      });
    },
    onError: () => {
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect Microsoft account",
        variant: "destructive",
      });
    },
  });

  if (!oauthStatus) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview Alert */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Single Sign-On (SSO) allows you to log in using your existing Google or Microsoft account, providing enhanced security and convenience.
        </AlertDescription>
      </Alert>

      {/* Google OAuth */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${systemConfig?.features.googleOAuth ? 'bg-red-100' : 'bg-gray-100'}`}>
                <Globe className={`h-5 w-5 ${systemConfig?.features.googleOAuth ? 'text-red-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <CardTitle className="text-lg">Google Account</CardTitle>
                <CardDescription>
                  Connect your Google account for single sign-on
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={oauthStatus.google.connected ? "default" : "secondary"}>
                {oauthStatus.google.connected ? 'Connected' : 'Not Connected'}
              </Badge>
              {!systemConfig?.features.googleOAuth && (
                <Badge variant="outline">Unavailable</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!systemConfig?.features.googleOAuth && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Google OAuth is not configured. Contact your administrator to enable Google sign-in.
              </AlertDescription>
            </Alert>
          )}

          {oauthStatus.google.connected ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Account Connected</p>
                    {oauthStatus.google.email && (
                      <p className="text-sm text-green-700">{oauthStatus.google.email}</p>
                    )}
                    <p className="text-xs text-green-600">
                      Connected on {formatDate(oauthStatus.google.connectedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => disconnectGoogleMutation.mutate()}
                  disabled={disconnectGoogleMutation.isPending}
                  className="flex-1"
                >
                  {disconnectGoogleMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <Unlink className="mr-2 h-4 w-4" />
                      Disconnect Account
                    </>
                  )}
                </Button>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Disconnecting your Google account will remove single sign-on capability. You'll need to use your regular username and password to log in.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-6">
                <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">Connect your Google account to enable single sign-on</p>
                
                <Button 
                  onClick={() => connectGoogleMutation.mutate()}
                  disabled={!systemConfig?.features.googleOAuth || connectGoogleMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {connectGoogleMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Link2 className="mr-2 h-4 w-4" />
                      Connect Google Account
                    </>
                  )}
                </Button>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  By connecting your Google account, you'll be able to log in using Google's secure authentication system without needing to remember additional passwords.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Microsoft OAuth */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${systemConfig?.features.microsoftOAuth ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Globe className={`h-5 w-5 ${systemConfig?.features.microsoftOAuth ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <CardTitle className="text-lg">Microsoft Account</CardTitle>
                <CardDescription>
                  Connect your Microsoft account for single sign-on
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={oauthStatus.microsoft.connected ? "default" : "secondary"}>
                {oauthStatus.microsoft.connected ? 'Connected' : 'Not Connected'}
              </Badge>
              {!systemConfig?.features.microsoftOAuth && (
                <Badge variant="outline">Unavailable</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!systemConfig?.features.microsoftOAuth && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Microsoft OAuth is not configured. Contact your administrator to enable Microsoft sign-in.
              </AlertDescription>
            </Alert>
          )}

          {oauthStatus.microsoft.connected ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Account Connected</p>
                    {oauthStatus.microsoft.email && (
                      <p className="text-sm text-blue-700">{oauthStatus.microsoft.email}</p>
                    )}
                    <p className="text-xs text-blue-600">
                      Connected on {formatDate(oauthStatus.microsoft.connectedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => disconnectMicrosoftMutation.mutate()}
                  disabled={disconnectMicrosoftMutation.isPending}
                  className="flex-1"
                >
                  {disconnectMicrosoftMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <Unlink className="mr-2 h-4 w-4" />
                      Disconnect Account
                    </>
                  )}
                </Button>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Disconnecting your Microsoft account will remove single sign-on capability. You'll need to use your regular username and password to log in.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-6">
                <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">Connect your Microsoft account to enable single sign-on</p>
                
                <Button 
                  onClick={() => connectMicrosoftMutation.mutate()}
                  disabled={!systemConfig?.features.microsoftOAuth || connectMicrosoftMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {connectMicrosoftMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Link2 className="mr-2 h-4 w-4" />
                      Connect Microsoft Account
                    </>
                  )}
                </Button>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  By connecting your Microsoft account, you'll be able to log in using Microsoft's secure authentication system without needing to remember additional passwords.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* OAuth Summary */}
      <Card className="bg-gray-50 border-dashed">
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            Single Sign-On Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="font-medium">Google Account:</p>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${oauthStatus.google.connected ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-gray-600">
                  {oauthStatus.google.connected ? 'Connected' : 'Not connected'}
                </span>
              </div>
              {oauthStatus.google.email && (
                <p className="text-xs text-gray-500 ml-4">{oauthStatus.google.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <p className="font-medium">Microsoft Account:</p>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${oauthStatus.microsoft.connected ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-gray-600">
                  {oauthStatus.microsoft.connected ? 'Connected' : 'Not connected'}
                </span>
              </div>
              {oauthStatus.microsoft.email && (
                <p className="text-xs text-gray-500 ml-4">{oauthStatus.microsoft.email}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
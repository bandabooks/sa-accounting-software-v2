import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Settings, 
  Key, 
  Globe, 
  FileText, 
  Calendar, 
  AlertTriangle,
  Download,
  Upload,
  Eye,
  EyeOff,
  TestTube,
  BookOpen,
  ExternalLink,
  Zap,
  Clock,
  Database,
  Lock
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface SARSCredentials {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  apiUrl: string;
  redirectUri: string;
  environment: 'sandbox' | 'production';
  vatVendorNumber?: string;
  payeNumber?: string; 
  taxNumber?: string;
}

interface SARSIntegrationStatus {
  connected: boolean;
  lastSync: string | null;
  nextSync: string | null;
  status: 'active' | 'inactive' | 'error';
  errorMessage?: string;
  vatVendorNumber?: string;
  payeNumber?: string;
  taxNumber?: string;
  availableServices: string[];
}

export default function SARSIntegration() {
  const [credentials, setCredentials] = useState<SARSCredentials>({
    clientId: '',
    clientSecret: '',
    username: '',
    password: '',
    apiUrl: 'https://secure.sarsefiling.co.za/api/v1',
    redirectUri: '',
    environment: 'sandbox',
  });
  
  const [showSecrets, setShowSecrets] = useState({
    clientSecret: false,
    password: false
  });
  
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current SARS integration status
  const { data: integrationStatus, isLoading, refetch } = useQuery<SARSIntegrationStatus>({
    queryKey: ['/api/sars/integration/status'],
    queryFn: () => apiRequest('/api/sars/integration/status', 'GET'),
  });

  // Fetch current credentials (masked)
  const { data: currentCredentials } = useQuery<Partial<SARSCredentials>>({
    queryKey: ['/api/sars/credentials'],
    queryFn: () => apiRequest('/api/sars/credentials', 'GET'),
  });

  // Update credentials whenever current credentials are loaded
  useEffect(() => {
    if (currentCredentials) {
      setCredentials(prev => ({
        ...prev,
        ...currentCredentials,
        clientSecret: '', // Keep masked
        password: '' // Keep masked
      }));
    }
  }, [currentCredentials]);

  // Save SARS credentials mutation
  const saveCredentialsMutation = useMutation({
    mutationFn: (data: Partial<SARSCredentials>) => apiRequest('/api/sars/credentials', 'POST', data),
    onSuccess: () => {
      toast({
        title: "SARS Credentials Saved",
        description: "Your SARS API credentials have been securely saved.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sars/integration/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sars/credentials'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save SARS credentials. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: () => apiRequest('/api/sars/test-connection', 'POST'),
    onSuccess: (data: any) => {
      setTestResult({ success: true, message: data.message || 'Connection successful' });
      toast({
        title: "Connection Test Successful",
        description: "Successfully connected to SARS eFiling API.",
      });
      refetch();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Connection failed';
      setTestResult({ success: false, message });
      toast({
        title: "Connection Test Failed",
        description: message,
        variant: "destructive",
      });
    }
  });

  // Manual sync mutation
  const syncMutation = useMutation({
    mutationFn: () => apiRequest('/api/sars/sync', 'POST'),
    onSuccess: (data: any) => {
      toast({
        title: "SARS Sync Complete",
        description: `Successfully synced ${data.recordsSynced || 0} records`,
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Unable to sync with SARS eFiling. Please check your credentials.",
        variant: "destructive",
      });
    }
  });

  const handleSaveCredentials = () => {
    // Only send non-empty fields to avoid overwriting existing masked values
    const dataToSend: Partial<SARSCredentials> = {};
    
    Object.entries(credentials).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        (dataToSend as any)[key] = value;
      }
    });

    saveCredentialsMutation.mutate(dataToSend);
  };

  const handleTestConnection = () => {
    setIsTestingConnection(true);
    setTestResult(null);
    
    // Save credentials first, then test
    handleSaveCredentials();
    
    setTimeout(() => {
      testConnectionMutation.mutate();
      setIsTestingConnection(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <Clock className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      default: return <RefreshCw className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading SARS integration...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="h-8 w-8 mr-3 text-green-600" />
            SARS API Integration
          </h1>
          <p className="text-gray-600 mt-1">
            Secure integration with South African Revenue Service eFiling system
          </p>
        </div>
        
        {integrationStatus?.connected && (
          <div className="flex items-center space-x-3">
            <Badge className={`${getStatusColor(integrationStatus.status)} border`}>
              {getStatusIcon(integrationStatus.status)}
              <span className="ml-1 capitalize">{integrationStatus.status}</span>
            </Badge>
            <Button 
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {syncMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync Now
            </Button>
          </div>
        )}
      </div>

      {/* Connection Status Card */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Status</Label>
              <div className="flex items-center mt-1">
                {integrationStatus?.connected ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-600 font-medium">Connected</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-red-600 font-medium">Not Connected</span>
                  </>
                )}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Last Sync</Label>
              <p className="text-sm text-gray-600 mt-1">
                {integrationStatus?.lastSync 
                  ? new Date(integrationStatus.lastSync).toLocaleString()
                  : 'Never'
                }
              </p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Next Sync</Label>
              <p className="text-sm text-gray-600 mt-1">
                {integrationStatus?.nextSync 
                  ? new Date(integrationStatus.nextSync).toLocaleString()
                  : 'Not scheduled'
                }
              </p>
            </div>
          </div>
          
          {integrationStatus?.errorMessage && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{integrationStatus.errorMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Main Configuration Tabs */}
      <Tabs defaultValue="credentials" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="credentials">
            <Key className="h-4 w-4 mr-2" />
            Credentials
          </TabsTrigger>
          <TabsTrigger value="services">
            <FileText className="h-4 w-4 mr-2" />
            Services
          </TabsTrigger>
          <TabsTrigger value="automation">
            <Zap className="h-4 w-4 mr-2" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="help">
            <BookOpen className="h-4 w-4 mr-2" />
            Help
          </TabsTrigger>
        </TabsList>

        {/* Credentials Tab */}
        <TabsContent value="credentials">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                SARS API Credentials
              </CardTitle>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  All credentials are encrypted and stored securely. Only users with admin privileges can view or modify these settings.
                </AlertDescription>
              </Alert>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Environment Selection */}
                <div>
                  <Label htmlFor="environment">Environment</Label>
                  <Select 
                    value={credentials.environment} 
                    onValueChange={(value: 'sandbox' | 'production') => 
                      setCredentials(prev => ({ ...prev, environment: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                      <SelectItem value="production">Production (Live)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* API URL */}
                <div>
                  <Label htmlFor="apiUrl">SARS API URL</Label>
                  <Input
                    id="apiUrl"
                    value={credentials.apiUrl}
                    onChange={(e) => setCredentials(prev => ({ ...prev, apiUrl: e.target.value }))}
                    placeholder="https://secure.sarsefiling.co.za/api/v1"
                  />
                </div>

                {/* Client ID */}
                <div>
                  <Label htmlFor="clientId">Client ID</Label>
                  <Input
                    id="clientId"
                    value={credentials.clientId}
                    onChange={(e) => setCredentials(prev => ({ ...prev, clientId: e.target.value }))}
                    placeholder="Your SARS API Client ID"
                  />
                </div>

                {/* Client Secret */}
                <div>
                  <Label htmlFor="clientSecret">Client Secret</Label>
                  <div className="relative">
                    <Input
                      id="clientSecret"
                      type={showSecrets.clientSecret ? "text" : "password"}
                      value={credentials.clientSecret}
                      onChange={(e) => setCredentials(prev => ({ ...prev, clientSecret: e.target.value }))}
                      placeholder="Your SARS API Client Secret"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowSecrets(prev => ({ ...prev, clientSecret: !prev.clientSecret }))}
                    >
                      {showSecrets.clientSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Username */}
                <div>
                  <Label htmlFor="username">SARS Username</Label>
                  <Input
                    id="username"
                    value={credentials.username}
                    onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Your SARS eFiling username"
                  />
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password">SARS Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showSecrets.password ? "text" : "password"}
                      value={credentials.password}
                      onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Your SARS eFiling password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowSecrets(prev => ({ ...prev, password: !prev.password }))}
                    >
                      {showSecrets.password ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Redirect URI */}
                <div>
                  <Label htmlFor="redirectUri">Redirect URI (OAuth)</Label>
                  <Input
                    id="redirectUri"
                    value={credentials.redirectUri}
                    onChange={(e) => setCredentials(prev => ({ ...prev, redirectUri: e.target.value }))}
                    placeholder="https://yourdomain.com/sars/callback"
                  />
                </div>

                {/* VAT Vendor Number */}
                <div>
                  <Label htmlFor="vatVendorNumber">VAT Vendor Number</Label>
                  <Input
                    id="vatVendorNumber"
                    value={credentials.vatVendorNumber || ''}
                    onChange={(e) => setCredentials(prev => ({ ...prev, vatVendorNumber: e.target.value }))}
                    placeholder="4123456789"
                  />
                </div>
              </div>

              {/* Test Connection Result */}
              {testResult && (
                <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                    {testResult.message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button 
                  onClick={handleSaveCredentials}
                  disabled={saveCredentialsMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saveCredentialsMutation.isPending && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                  Save Credentials
                </Button>
                
                <Button 
                  onClick={handleTestConnection}
                  disabled={isTestingConnection || testConnectionMutation.isPending}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {isTestingConnection || testConnectionMutation.isPending ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* VAT Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  VAT Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">VAT201 Returns</span>
                  <Badge variant="outline">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">VAT Registration</span>
                  <Badge variant="outline">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">VAT Verification</span>
                  <Badge variant="outline">Available</Badge>
                </div>
                <Button className="w-full mt-4" size="sm">
                  Configure VAT Services
                </Button>
              </CardContent>
            </Card>

            {/* PAYE Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-green-600" />
                  PAYE Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">EMP501 Monthly</span>
                  <Badge variant="outline">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">EMP502 Annual</span>
                  <Badge variant="outline">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">IRP5/IT3(a)</span>
                  <Badge variant="outline">Available</Badge>
                </div>
                <Button className="w-full mt-4" size="sm">
                  Configure PAYE Services
                </Button>
              </CardContent>
            </Card>

            {/* Income Tax Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-purple-600" />
                  Income Tax Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">ITR12 Individual</span>
                  <Badge variant="outline">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">ITR14 Company</span>
                  <Badge variant="outline">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Provisional Tax</span>
                  <Badge variant="outline">Available</Badge>
                </div>
                <Button className="w-full mt-4" size="sm">
                  Configure Income Tax
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Automation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-sync">Automatic Sync</Label>
                      <p className="text-sm text-gray-600">Sync data with SARS automatically</p>
                    </div>
                    <Switch id="auto-sync" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="deadline-reminders">Deadline Reminders</Label>
                      <p className="text-sm text-gray-600">Get notified of upcoming deadlines</p>
                    </div>
                    <Switch id="deadline-reminders" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-submit">Auto-Submit Returns</Label>
                      <p className="text-sm text-gray-600">Automatically submit approved returns</p>
                    </div>
                    <Switch id="auto-submit" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="status-updates">Status Updates</Label>
                      <p className="text-sm text-gray-600">Receive SARS response notifications</p>
                    </div>
                    <Switch id="status-updates" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="backup-downloads">Auto-Download Backup</Label>
                      <p className="text-sm text-gray-600">Download submitted documents</p>
                    </div>
                    <Switch id="backup-downloads" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="audit-trail">Enhanced Audit Trail</Label>
                      <p className="text-sm text-gray-600">Detailed logging of all SARS activities</p>
                    </div>
                    <Switch id="audit-trail" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Help Tab */}
        <TabsContent value="help">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Setup Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">1. Register for SARS eFiling</h4>
                  <p className="text-sm text-gray-600">
                    Visit the SARS eFiling website and register for API access
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit SARS eFiling
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">2. Obtain API Credentials</h4>
                  <p className="text-sm text-gray-600">
                    Request API credentials from SARS or your tax advisor
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">3. Test Connection</h4>
                  <p className="text-sm text-gray-600">
                    Use the sandbox environment to test your integration
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">4. Go Live</h4>
                  <p className="text-sm text-gray-600">
                    Switch to production environment for live submissions
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  SARS API Documentation
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  eFiling User Guide
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  VAT Registration Guide
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  PAYE Submission Guide
                </Button>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Need Help?</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Contact our support team for assistance with SARS integration
                  </p>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Shield, Save, TestTube, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface BankingCredentialsFormProps {
  credentials?: any;
  onSave: (data: any) => void;
  isLoading?: boolean;
}

export function BankingCredentialsForm({ credentials, onSave, isLoading }: BankingCredentialsFormProps) {
  const [formData, setFormData] = useState({
    provider: credentials?.provider || 'stitch',
    // Stitch credentials
    stitchClientId: credentials?.stitchClientId || '',
    stitchClientSecret: credentials?.stitchClientSecret || '',
    stitchWebhookSecret: credentials?.stitchWebhookSecret || '',
    stitchEnvironment: credentials?.stitchEnvironment || 'sandbox',
    stitchRedirectUri: credentials?.stitchRedirectUri || window.location.origin + '/banking/callback',
    // Bank Zero credentials
    bankZeroApiKey: credentials?.bankZeroApiKey || '',
    bankZeroAccountId: credentials?.bankZeroAccountId || '',
    bankZeroEnvironment: credentials?.bankZeroEnvironment || 'sandbox',
    // Yodlee credentials
    yodleeClientId: credentials?.yodleeClientId || '',
    yodleeClientSecret: credentials?.yodleeClientSecret || '',
    yodleeApiUrl: credentials?.yodleeApiUrl || 'https://sandbox.api.yodlee.com/ysl',
    // General settings
    autoImport: credentials?.autoImport || false,
    importInterval: credentials?.importInterval || 'hourly',
    transactionHistory: credentials?.transactionHistory || '90',
  });

  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const toggleSecret = (field: string) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const handleTestConnection = () => {
    // Test connection logic would go here
    console.log('Testing connection with provider:', formData.provider);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            Banking Integration Credentials
          </CardTitle>
          <CardDescription>
            Configure your banking integration for automated transaction import and reconciliation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider">Banking Provider</Label>
            <Select value={formData.provider} onValueChange={(value) => setFormData(prev => ({ ...prev, provider: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a banking provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stitch">Stitch (Recommended for South Africa)</SelectItem>
                <SelectItem value="bankzero">Bank Zero API</SelectItem>
                <SelectItem value="yodlee">Yodlee (International)</SelectItem>
                <SelectItem value="plaid">Plaid (US & Europe)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose your preferred banking data provider based on your region and bank support
            </p>
          </div>

          <Separator />

          {/* Provider-specific credentials */}
          <Tabs value={formData.provider} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="stitch">Stitch</TabsTrigger>
              <TabsTrigger value="bankzero">Bank Zero</TabsTrigger>
              <TabsTrigger value="yodlee">Yodlee</TabsTrigger>
              <TabsTrigger value="plaid">Plaid</TabsTrigger>
            </TabsList>

            {/* Stitch Configuration */}
            <TabsContent value="stitch" className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Stitch provides secure bank connections for all major South African banks. 
                  Get your API credentials from the <a href="https://stitch.money" target="_blank" rel="noopener noreferrer" className="font-semibold underline">Stitch Dashboard</a>.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stitchClientId">Client ID</Label>
                  <Input
                    id="stitchClientId"
                    value={formData.stitchClientId}
                    onChange={(e) => setFormData(prev => ({ ...prev, stitchClientId: e.target.value }))}
                    placeholder="test_xxxxxxxxxxxxxx"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stitchClientSecret">Client Secret</Label>
                  <div className="relative">
                    <Input
                      id="stitchClientSecret"
                      type={showSecrets.stitchClientSecret ? 'text' : 'password'}
                      value={formData.stitchClientSecret}
                      onChange={(e) => setFormData(prev => ({ ...prev, stitchClientSecret: e.target.value }))}
                      placeholder="test_xxxxxxxxxxxxxx"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => toggleSecret('stitchClientSecret')}
                    >
                      {showSecrets.stitchClientSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stitchWebhookSecret">Webhook Secret (Optional)</Label>
                  <div className="relative">
                    <Input
                      id="stitchWebhookSecret"
                      type={showSecrets.stitchWebhookSecret ? 'text' : 'password'}
                      value={formData.stitchWebhookSecret}
                      onChange={(e) => setFormData(prev => ({ ...prev, stitchWebhookSecret: e.target.value }))}
                      placeholder="whsec_xxxxxxxxxxxxxx"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => toggleSecret('stitchWebhookSecret')}
                    >
                      {showSecrets.stitchWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stitchEnvironment">Environment</Label>
                  <Select value={formData.stitchEnvironment} onValueChange={(value) => setFormData(prev => ({ ...prev, stitchEnvironment: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="stitchRedirectUri">Redirect URI</Label>
                  <Input
                    id="stitchRedirectUri"
                    value={formData.stitchRedirectUri}
                    onChange={(e) => setFormData(prev => ({ ...prev, stitchRedirectUri: e.target.value }))}
                    placeholder="https://yourdomain.com/banking/callback"
                  />
                  <p className="text-sm text-muted-foreground">
                    Add this URL to your Stitch app's allowed redirect URIs
                  </p>
                </div>
              </div>

              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Sandbox Mode Active:</strong> You're using test credentials. Transactions will be simulated for testing purposes.
                </AlertDescription>
              </Alert>
            </TabsContent>

            {/* Bank Zero Configuration */}
            <TabsContent value="bankzero" className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Bank Zero provides direct API access for business banking. 
                  Get your API credentials from the <a href="https://www.bankzero.co.za" target="_blank" rel="noopener noreferrer" className="font-semibold underline">Bank Zero Business Portal</a>.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankZeroApiKey">API Key</Label>
                  <div className="relative">
                    <Input
                      id="bankZeroApiKey"
                      type={showSecrets.bankZeroApiKey ? 'text' : 'password'}
                      value={formData.bankZeroApiKey}
                      onChange={(e) => setFormData(prev => ({ ...prev, bankZeroApiKey: e.target.value }))}
                      placeholder="bz_xxxxxxxxxxxxxx"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => toggleSecret('bankZeroApiKey')}
                    >
                      {showSecrets.bankZeroApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankZeroAccountId">Account ID</Label>
                  <Input
                    id="bankZeroAccountId"
                    value={formData.bankZeroAccountId}
                    onChange={(e) => setFormData(prev => ({ ...prev, bankZeroAccountId: e.target.value }))}
                    placeholder="acc_xxxxxxxxxxxxxx"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankZeroEnvironment">Environment</Label>
                  <Select value={formData.bankZeroEnvironment} onValueChange={(value) => setFormData(prev => ({ ...prev, bankZeroEnvironment: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Yodlee Configuration */}
            <TabsContent value="yodlee" className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Yodlee provides global bank connectivity. 
                  Get your API credentials from the <a href="https://developer.yodlee.com" target="_blank" rel="noopener noreferrer" className="font-semibold underline">Yodlee Developer Portal</a>.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="yodleeClientId">Client ID</Label>
                  <Input
                    id="yodleeClientId"
                    value={formData.yodleeClientId}
                    onChange={(e) => setFormData(prev => ({ ...prev, yodleeClientId: e.target.value }))}
                    placeholder="yd_xxxxxxxxxxxxxx"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yodleeClientSecret">Client Secret</Label>
                  <div className="relative">
                    <Input
                      id="yodleeClientSecret"
                      type={showSecrets.yodleeClientSecret ? 'text' : 'password'}
                      value={formData.yodleeClientSecret}
                      onChange={(e) => setFormData(prev => ({ ...prev, yodleeClientSecret: e.target.value }))}
                      placeholder="yd_secret_xxxxxxxxxxxxxx"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => toggleSecret('yodleeClientSecret')}
                    >
                      {showSecrets.yodleeClientSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="yodleeApiUrl">API URL</Label>
                  <Input
                    id="yodleeApiUrl"
                    value={formData.yodleeApiUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, yodleeApiUrl: e.target.value }))}
                    placeholder="https://sandbox.api.yodlee.com/ysl"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Plaid Configuration */}
            <TabsContent value="plaid" className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Plaid integration coming soon. Please use Stitch for South African banks or Yodlee for international banks.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>

          <Separator />

          {/* Import Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Import Settings</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoImport">Automatic Import</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically sync transactions from connected banks
                </p>
              </div>
              <Switch
                id="autoImport"
                checked={formData.autoImport}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoImport: checked }))}
              />
            </div>

            {formData.autoImport && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="importInterval">Import Frequency</Label>
                  <Select value={formData.importInterval} onValueChange={(value) => setFormData(prev => ({ ...prev, importInterval: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Every Hour</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionHistory">Transaction History (Days)</Label>
                  <Select value={formData.transactionHistory} onValueChange={(value) => setFormData(prev => ({ ...prev, transactionHistory: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">Last 30 Days</SelectItem>
                      <SelectItem value="60">Last 60 Days</SelectItem>
                      <SelectItem value="90">Last 90 Days</SelectItem>
                      <SelectItem value="180">Last 180 Days</SelectItem>
                      <SelectItem value="365">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    How far back to import transactions when connecting a new account
                  </p>
                </div>
              </>
            )}
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={isLoading}
            >
              <TestTube className="h-4 w-4 mr-2" />
              Test Connection
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Credentials
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
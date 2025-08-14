import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Shield, Save, TestTube, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SARSCredentialsFormProps {
  credentials?: any;
  onSave: (data: any) => void;
  isLoading?: boolean;
}

export function SARSCredentialsForm({ credentials, onSave, isLoading }: SARSCredentialsFormProps) {
  const [formData, setFormData] = useState({
    // SARS eFiling Credentials
    username: credentials?.username || '',
    password: credentials?.password || '',
    taxNumber: credentials?.taxNumber || '',
    tradingName: credentials?.tradingName || '',
    
    // API Configuration
    clientId: credentials?.clientId || '',
    clientSecret: credentials?.clientSecret || '',
    apiKey: credentials?.apiKey || '',
    environment: credentials?.environment || 'sandbox',
    
    // Service Selection
    services: {
      vat201: credentials?.services?.vat201 !== false,
      emp201: credentials?.services?.emp201 !== false,
      emp501: credentials?.services?.emp501 !== false,
      itr12: credentials?.services?.itr12 !== false,
      itr14: credentials?.services?.itr14 !== false,
      provisional: credentials?.services?.provisional !== false,
    },
    
    // Submission Settings
    autoSubmit: credentials?.autoSubmit || false,
    testMode: credentials?.testMode !== false,
    emailNotifications: credentials?.emailNotifications !== false,
    smsNotifications: credentials?.smsNotifications || false,
    
    // Contact Information
    contactEmail: credentials?.contactEmail || '',
    contactPhone: credentials?.contactPhone || '',
    taxPractitionerNumber: credentials?.taxPractitionerNumber || '',
  });

  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const toggleSecret = (field: string) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const handleTestConnection = () => {
    console.log('Testing SARS connection...');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            SARS eFiling Integration
          </CardTitle>
          <CardDescription>
            Configure your South African Revenue Service integration for automated tax submissions and compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              SARS integration enables automated VAT201 submissions, EMP201/501 filings, and tax compliance monitoring. 
              Register for eFiling at <a href="https://www.sarsefiling.co.za" target="_blank" rel="noopener noreferrer" className="font-semibold underline">SARS eFiling</a>.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="credentials" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="credentials">Credentials</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Credentials Tab */}
            <TabsContent value="credentials" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">eFiling Credentials</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">eFiling Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="username@example.co.za"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">eFiling Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showSecrets.password ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                        onClick={() => toggleSecret('password')}
                      >
                        {showSecrets.password ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxNumber">Tax Number</Label>
                    <Input
                      id="taxNumber"
                      value={formData.taxNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, taxNumber: e.target.value }))}
                      placeholder="0123456789"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tradingName">Trading Name</Label>
                    <Input
                      id="tradingName"
                      value={formData.tradingName}
                      onChange={(e) => setFormData(prev => ({ ...prev, tradingName: e.target.value }))}
                      placeholder="Your Company (Pty) Ltd"
                    />
                  </div>
                </div>

                <Separator />

                <h3 className="text-lg font-semibold">API Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientId">Client ID</Label>
                    <Input
                      id="clientId"
                      value={formData.clientId}
                      onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                      placeholder="sars_client_xxxxxx"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientSecret">Client Secret</Label>
                    <div className="relative">
                      <Input
                        id="clientSecret"
                        type={showSecrets.clientSecret ? 'text' : 'password'}
                        value={formData.clientSecret}
                        onChange={(e) => setFormData(prev => ({ ...prev, clientSecret: e.target.value }))}
                        placeholder="sars_secret_xxxxxx"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                        onClick={() => toggleSecret('clientSecret')}
                      >
                        {showSecrets.clientSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <div className="relative">
                      <Input
                        id="apiKey"
                        type={showSecrets.apiKey ? 'text' : 'password'}
                        value={formData.apiKey}
                        onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                        placeholder="sars_api_key_xxxxxx"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                        onClick={() => toggleSecret('apiKey')}
                      >
                        {showSecrets.apiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="environment">Environment</Label>
                    <Select value={formData.environment} onValueChange={(value) => setFormData(prev => ({ ...prev, environment: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <h3 className="text-lg font-semibold">Tax Practitioner Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxPractitionerNumber">Tax Practitioner Number (Optional)</Label>
                    <Input
                      id="taxPractitionerNumber"
                      value={formData.taxPractitionerNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, taxPractitionerNumber: e.target.value }))}
                      placeholder="PR-0000000"
                    />
                    <p className="text-sm text-muted-foreground">
                      If you're a registered tax practitioner
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="tax@company.co.za"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                      placeholder="+27 11 123 4567"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Enable SARS Services</h3>
                <p className="text-sm text-muted-foreground">
                  Select which SARS services you want to integrate with
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="vat201">VAT201 Returns</Label>
                      <p className="text-sm text-muted-foreground">
                        Monthly or bi-monthly VAT return submissions
                      </p>
                    </div>
                    <Switch
                      id="vat201"
                      checked={formData.services.vat201}
                      onCheckedChange={(checked) => setFormData(prev => ({ 
                        ...prev, 
                        services: { ...prev.services, vat201: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="emp201">EMP201 Returns</Label>
                      <p className="text-sm text-muted-foreground">
                        Monthly PAYE submissions
                      </p>
                    </div>
                    <Switch
                      id="emp201"
                      checked={formData.services.emp201}
                      onCheckedChange={(checked) => setFormData(prev => ({ 
                        ...prev, 
                        services: { ...prev.services, emp201: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="emp501">EMP501 Reconciliation</Label>
                      <p className="text-sm text-muted-foreground">
                        Bi-annual employee tax reconciliation
                      </p>
                    </div>
                    <Switch
                      id="emp501"
                      checked={formData.services.emp501}
                      onCheckedChange={(checked) => setFormData(prev => ({ 
                        ...prev, 
                        services: { ...prev.services, emp501: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="itr12">ITR12 (Individual Tax)</Label>
                      <p className="text-sm text-muted-foreground">
                        Individual income tax returns
                      </p>
                    </div>
                    <Switch
                      id="itr12"
                      checked={formData.services.itr12}
                      onCheckedChange={(checked) => setFormData(prev => ({ 
                        ...prev, 
                        services: { ...prev.services, itr12: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="itr14">ITR14 (Company Tax)</Label>
                      <p className="text-sm text-muted-foreground">
                        Company income tax returns
                      </p>
                    </div>
                    <Switch
                      id="itr14"
                      checked={formData.services.itr14}
                      onCheckedChange={(checked) => setFormData(prev => ({ 
                        ...prev, 
                        services: { ...prev.services, itr14: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="provisional">Provisional Tax</Label>
                      <p className="text-sm text-muted-foreground">
                        IRP6 provisional tax submissions
                      </p>
                    </div>
                    <Switch
                      id="provisional"
                      checked={formData.services.provisional}
                      onCheckedChange={(checked) => setFormData(prev => ({ 
                        ...prev, 
                        services: { ...prev.services, provisional: checked }
                      }))}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Submission Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoSubmit">Automatic Submission</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically submit returns when due
                      </p>
                    </div>
                    <Switch
                      id="autoSubmit"
                      checked={formData.autoSubmit}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoSubmit: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="testMode">Test Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Submit to SARS test environment first
                      </p>
                    </div>
                    <Switch
                      id="testMode"
                      checked={formData.testMode}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, testMode: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email alerts for submissions
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={formData.emailNotifications}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="smsNotifications">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive SMS alerts for critical deadlines
                      </p>
                    </div>
                    <Switch
                      id="smsNotifications"
                      checked={formData.smsNotifications}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, smsNotifications: checked }))}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {formData.environment === 'sandbox' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Sandbox Mode Active:</strong> You're using the SARS test environment. All submissions will be simulated.
              </AlertDescription>
            </Alert>
          )}

          {formData.environment === 'production' && !formData.testMode && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Production Mode:</strong> Submissions will be sent directly to SARS. Ensure all data is accurate.
              </AlertDescription>
            </Alert>
          )}

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
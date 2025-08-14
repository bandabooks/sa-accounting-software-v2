import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Building2, Save, TestTube, Info, CheckCircle } from 'lucide-react';

interface CIPCCredentialsFormProps {
  credentials?: any;
  onSave: (data: any) => void;
  isLoading?: boolean;
}

export function CIPCCredentialsForm({ credentials, onSave, isLoading }: CIPCCredentialsFormProps) {
  const [formData, setFormData] = useState({
    // CIPC API Credentials
    username: credentials?.username || '',
    password: credentials?.password || '',
    customerCode: credentials?.customerCode || '',
    apiKey: credentials?.apiKey || '',
    apiSecret: credentials?.apiSecret || '',
    environment: credentials?.environment || 'sandbox',
    
    // Company Details
    companyRegistrationNumber: credentials?.companyRegistrationNumber || '',
    enterpriseNumber: credentials?.enterpriseNumber || '',
    
    // Service Settings
    enableCompanySearch: credentials?.enableCompanySearch !== false,
    enableDirectorVerification: credentials?.enableDirectorVerification !== false,
    enableAnnualReturns: credentials?.enableAnnualReturns !== false,
    enableComplianceMonitoring: credentials?.enableComplianceMonitoring !== false,
    enableDocumentRetrieval: credentials?.enableDocumentRetrieval !== false,
    
    // Notification Settings
    notifyOnStatusChange: credentials?.notifyOnStatusChange !== false,
    notifyOnComplianceDue: credentials?.notifyOnComplianceDue !== false,
    notifyOnDirectorChanges: credentials?.notifyOnDirectorChanges !== false,
    
    // Auto-sync Settings
    autoSync: credentials?.autoSync || false,
    syncInterval: credentials?.syncInterval || 'daily',
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
    console.log('Testing CIPC connection...');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-blue-600" />
            CIPC Integration Credentials
          </CardTitle>
          <CardDescription>
            Configure your Companies and Intellectual Property Commission integration for company compliance and verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              CIPC integration enables automatic company verification, compliance monitoring, and annual return management. 
              Register for API access at the <a href="https://www.cipc.co.za" target="_blank" rel="noopener noreferrer" className="font-semibold underline">CIPC Portal</a>.
            </AlertDescription>
          </Alert>

          {/* API Credentials */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">API Credentials</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="your.email@company.co.za"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
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
                <Label htmlFor="customerCode">Customer Code</Label>
                <Input
                  id="customerCode"
                  value={formData.customerCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerCode: e.target.value }))}
                  placeholder="CUST-XXXXXX"
                />
                <p className="text-sm text-muted-foreground">
                  Your CIPC customer code for API access
                </p>
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

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showSecrets.apiKey ? 'text' : 'password'}
                    value={formData.apiKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="cipc_key_xxxxxxxxxxxxxx"
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
                <Label htmlFor="apiSecret">API Secret</Label>
                <div className="relative">
                  <Input
                    id="apiSecret"
                    type={showSecrets.apiSecret ? 'text' : 'password'}
                    value={formData.apiSecret}
                    onChange={(e) => setFormData(prev => ({ ...prev, apiSecret: e.target.value }))}
                    placeholder="cipc_secret_xxxxxxxxxxxxxx"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => toggleSecret('apiSecret')}
                  >
                    {showSecrets.apiSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Company Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Company Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyRegistrationNumber">Company Registration Number</Label>
                <Input
                  id="companyRegistrationNumber"
                  value={formData.companyRegistrationNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyRegistrationNumber: e.target.value }))}
                  placeholder="2021/123456/07"
                />
                <p className="text-sm text-muted-foreground">
                  Your company's CIPC registration number
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="enterpriseNumber">Enterprise Number (Optional)</Label>
                <Input
                  id="enterpriseNumber"
                  value={formData.enterpriseNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, enterpriseNumber: e.target.value }))}
                  placeholder="ENT-XXXXXX"
                />
                <p className="text-sm text-muted-foreground">
                  For registered enterprises
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Service Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Service Configuration</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableCompanySearch">Company Search & Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Search and verify company registration details
                  </p>
                </div>
                <Switch
                  id="enableCompanySearch"
                  checked={formData.enableCompanySearch}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableCompanySearch: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableDirectorVerification">Director Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Verify director details and changes
                  </p>
                </div>
                <Switch
                  id="enableDirectorVerification"
                  checked={formData.enableDirectorVerification}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableDirectorVerification: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableAnnualReturns">Annual Return Management</Label>
                  <p className="text-sm text-muted-foreground">
                    Submit and track annual returns
                  </p>
                </div>
                <Switch
                  id="enableAnnualReturns"
                  checked={formData.enableAnnualReturns}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableAnnualReturns: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableComplianceMonitoring">Compliance Monitoring</Label>
                  <p className="text-sm text-muted-foreground">
                    Monitor compliance status and deadlines
                  </p>
                </div>
                <Switch
                  id="enableComplianceMonitoring"
                  checked={formData.enableComplianceMonitoring}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableComplianceMonitoring: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableDocumentRetrieval">Document Retrieval</Label>
                  <p className="text-sm text-muted-foreground">
                    Download company documents and certificates
                  </p>
                </div>
                <Switch
                  id="enableDocumentRetrieval"
                  checked={formData.enableDocumentRetrieval}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableDocumentRetrieval: checked }))}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Notification Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notification Preferences</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifyOnStatusChange">Company Status Changes</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when company status changes
                  </p>
                </div>
                <Switch
                  id="notifyOnStatusChange"
                  checked={formData.notifyOnStatusChange}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifyOnStatusChange: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifyOnComplianceDue">Compliance Deadlines</Label>
                  <p className="text-sm text-muted-foreground">
                    Reminders for compliance deadlines
                  </p>
                </div>
                <Switch
                  id="notifyOnComplianceDue"
                  checked={formData.notifyOnComplianceDue}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifyOnComplianceDue: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifyOnDirectorChanges">Director Changes</Label>
                  <p className="text-sm text-muted-foreground">
                    Alert on director appointments or resignations
                  </p>
                </div>
                <Switch
                  id="notifyOnDirectorChanges"
                  checked={formData.notifyOnDirectorChanges}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifyOnDirectorChanges: checked }))}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Sync Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Synchronization Settings</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoSync">Automatic Synchronization</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically sync company data from CIPC
                </p>
              </div>
              <Switch
                id="autoSync"
                checked={formData.autoSync}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoSync: checked }))}
              />
            </div>

            {formData.autoSync && (
              <div className="space-y-2">
                <Label htmlFor="syncInterval">Sync Frequency</Label>
                <Select value={formData.syncInterval} onValueChange={(value) => setFormData(prev => ({ ...prev, syncInterval: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Every Hour</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  How often to check for updates from CIPC
                </p>
              </div>
            )}
          </div>

          {formData.environment === 'sandbox' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Sandbox Mode Active:</strong> You're using the test environment. All operations will be simulated for testing purposes.
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
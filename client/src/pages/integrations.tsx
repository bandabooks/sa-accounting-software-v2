import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Shield, 
  Building2, 
  CreditCard, 
  Landmark, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Settings,
  Eye,
  EyeOff,
  ExternalLink,
  Zap,
  Globe,
  Lock,
  Banknote,
  ShoppingCart,
  Smartphone
} from "lucide-react";

interface IntegrationStatus {
  id: string;
  name: string;
  description: string;
  icon: any;
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  lastSync?: string;
  features: string[];
  credentials?: any;
  connectionUrl?: string;
}

interface SARSCredentials {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  apiUrl: string;
  redirectUri: string;
  environment: 'sandbox' | 'production';
}

export default function Integrations() {
  const [selectedIntegration, setSelectedIntegration] = useState<string>('sars');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [credentials, setCredentials] = useState<Record<string, any>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch integration statuses
  const { data: integrations, isLoading } = useQuery({
    queryKey: ['/api/integrations/status'],
    queryFn: () => apiRequest('/api/integrations/status', 'GET'),
  });

  // Fetch SARS specific data
  const { data: sarsStatus } = useQuery({
    queryKey: ['/api/sars/integration/status'],
    queryFn: () => apiRequest('/api/sars/integration/status', 'GET'),
  });

  const { data: sarsCredentials } = useQuery({
    queryKey: ['/api/sars/credentials'],
    queryFn: () => apiRequest('/api/sars/credentials', 'GET'),
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: (integrationId: string) => 
      apiRequest(`/api/integrations/${integrationId}/test`, 'POST'),
    onSuccess: (data, integrationId) => {
      toast({
        title: "Connection Test Successful",
        description: `${integrationId.toUpperCase()} integration is working properly.`,
      });
    },
    onError: (error, integrationId) => {
      toast({
        title: "Connection Test Failed",
        description: `Failed to connect to ${integrationId.toUpperCase()}. Please check your credentials.`,
        variant: "destructive",
      });
    }
  });

  // Save credentials mutation
  const saveCredentialsMutation = useMutation({
    mutationFn: ({ integrationId, data }: { integrationId: string; data: any }) =>
      apiRequest(`/api/integrations/${integrationId}/credentials`, 'POST', data),
    onSuccess: (data, { integrationId }) => {
      toast({
        title: "Credentials Saved",
        description: `${integrationId.toUpperCase()} credentials have been saved securely.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations/status'] });
    },
    onError: (error, { integrationId }) => {
      toast({
        title: "Error",
        description: `Failed to save ${integrationId.toUpperCase()} credentials.`,
        variant: "destructive",
      });
    }
  });

  // Integration categories for better organization
  const integrationCategories = [
    {
      id: 'compliance',
      name: 'Compliance & Government',
      integrations: ['sars', 'cipc']
    },
    {
      id: 'payments',
      name: 'Payment Gateways',
      integrations: ['payfast', 'peach', 'paygate', 'stripe', 'yoco', 'ozow']
    },
    {
      id: 'financial',
      name: 'Financial Services',
      integrations: ['banking']
    }
  ];

  // All integrations data with enhanced payment gateways
  const allIntegrations: IntegrationStatus[] = [
    // Compliance & Government
    {
      id: 'sars',
      name: 'SARS eFiling',
      description: 'South African Revenue Service integration for VAT returns and compliance',
      icon: Shield,
      status: (sarsStatus as any)?.connected ? 'connected' : 'disconnected',
      lastSync: (sarsStatus as any)?.lastSync,
      features: [
        'Automated VAT201 submissions',
        'Real-time validation',
        'Electronic receipts',
        'Direct SARS synchronization',
        'Audit trail integration',
        'Automated reminders'
      ],
      connectionUrl: 'https://secure.sarsefiling.co.za'
    },
    {
      id: 'cipc',
      name: 'CIPC Integration',
      description: 'Companies and Intellectual Property Commission integration',
      icon: Building2,
      status: 'disconnected',
      features: [
        'Company registration checks',
        'Compliance monitoring',
        'Annual return submissions',
        'Director verification',
        'Status updates'
      ],
      connectionUrl: 'https://www.cipc.co.za'
    },
    
    // Payment Gateways - South African
    {
      id: 'payfast',
      name: 'PayFast',
      description: 'Leading South African payment gateway with comprehensive features',
      icon: CreditCard,
      status: 'pending',
      features: [
        'Credit & debit card processing',
        'EFT payments',
        'Recurring billing',
        'Instant payment notifications',
        '3D Secure authentication',
        'Mobile-optimized checkout',
        'Fraud protection',
        'Multi-currency support'
      ],
      connectionUrl: 'https://www.payfast.co.za'
    },
    {
      id: 'peach',
      name: 'Peach Payments',
      description: 'Modern payment platform with global reach and local expertise',
      icon: Globe,
      status: 'disconnected',
      features: [
        'Global payment processing',
        'Local South African acquiring',
        'Advanced analytics',
        'Tokenization',
        'Risk management',
        'Multi-channel payments',
        'API-first approach',
        'White-label solutions'
      ],
      connectionUrl: 'https://www.peachpayments.com'
    },
    {
      id: 'paygate',
      name: 'PayGate',
      description: 'Comprehensive payment solution with 3D Secure and multi-currency support',
      icon: Shield,
      status: 'disconnected',
      features: [
        '3D Secure 2.0 authentication',
        'Multi-currency processing',
        'Card-not-present transactions',
        'Tokenization services',
        'Recurring payments',
        'Mobile payments',
        'Risk management tools',
        'Comprehensive reporting'
      ],
      connectionUrl: 'https://www.paygate.co.za'
    },
    {
      id: 'yoco',
      name: 'Yoco',
      description: 'South African-focused card payments with modern POS solutions',
      icon: Smartphone,
      status: 'disconnected',
      features: [
        'Card reader integration',
        'Online payments',
        'In-person payments',
        'Instant payouts',
        'Business insights',
        'Inventory management',
        'Customer management',
        'No setup fees'
      ],
      connectionUrl: 'https://www.yoco.com'
    },
    {
      id: 'ozow',
      name: 'Ozow',
      description: 'Instant EFT payments directly from South African bank accounts',
      icon: Banknote,
      status: 'disconnected',
      features: [
        'Instant bank-to-bank transfers',
        'Real-time payment verification',
        'All major SA banks supported',
        'No card details required',
        'Lower transaction fees',
        'Instant settlement',
        'Mobile-optimized',
        'Fraud protection'
      ],
      connectionUrl: 'https://www.ozow.com'
    },
    
    // International Payment Gateway
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'International payment processing with global reach',
      icon: ShoppingCart,
      status: 'disconnected',
      features: [
        'Global payment processing',
        'Subscription management',
        'Advanced fraud detection',
        'Multi-currency support',
        'Mobile payments',
        'Marketplace payments',
        'Advanced reporting',
        'Developer-friendly APIs'
      ],
      connectionUrl: 'https://stripe.com'
    },
    
    // Financial Services
    {
      id: 'banking',
      name: 'Banking Integration',
      description: 'Connect to South African banks for automated transaction import',
      icon: Landmark,
      status: 'disconnected',
      features: [
        'Automated bank statement import',
        'Real-time balance updates',
        'Transaction categorization',
        'Multi-bank support',
        'Bank reconciliation'
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      default: return <XCircle className="h-4 w-4" />;
    }
  };

  const toggleSecretVisibility = (field: string) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const selectedIntegrationData = allIntegrations.find(i => i.id === selectedIntegration);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Zap className="h-8 w-8 mr-3 text-blue-600" />
            Integrations
          </h1>
          <p className="text-gray-600 mt-1">
            Manage third-party integrations and API connections
          </p>
        </div>
      </div>

      {/* Status Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Connected</p>
                <p className="text-2xl font-bold text-green-700">
                  {allIntegrations.filter(i => i.status === 'connected').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {allIntegrations.filter(i => i.status === 'pending').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Disconnected</p>
                <p className="text-2xl font-bold text-gray-700">
                  {allIntegrations.filter(i => i.status === 'disconnected').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Available</p>
                <p className="text-2xl font-bold text-blue-700">{allIntegrations.length}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Important Information Panel */}
      <Card className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <Shield className="h-8 w-8 text-blue-200" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Integration Security & Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  <span>All credentials encrypted at rest</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  <span>Test & live environment support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  <span>Real-time connection testing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  <span>Automated sync capabilities</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  <span>Official API documentation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  <span>Mobile-optimized interface</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Integration List */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-100 border-b border-gray-200">
              <CardTitle className="text-lg flex items-center text-gray-800">
                <Zap className="h-5 w-5 mr-2 text-blue-600" />
                Available Integrations
              </CardTitle>
              <CardDescription className="text-gray-600">
                Select an integration to configure and manage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {integrationCategories.map((category) => (
                <div key={category.id} className="space-y-3">
                  <div className={`p-3 rounded-lg ${
                    category.id === 'compliance' 
                      ? 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-100' 
                      : category.id === 'payments'
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100'
                      : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100'
                  }`}>
                    <h3 className={`font-bold text-sm uppercase tracking-wide flex items-center ${
                      category.id === 'compliance' ? 'text-red-700' :
                      category.id === 'payments' ? 'text-green-700' : 'text-blue-700'
                    }`}>
                      {category.id === 'compliance' && <Shield className="h-4 w-4 mr-2" />}
                      {category.id === 'payments' && <CreditCard className="h-4 w-4 mr-2" />}
                      {category.id === 'financial' && <Landmark className="h-4 w-4 mr-2" />}
                      {category.name}
                    </h3>
                  </div>
                  
                  {category.integrations.map((integrationId) => {
                    const integration = allIntegrations.find(i => i.id === integrationId);
                    if (!integration) return null;
                    
                    const Icon = integration.icon;
                    const isSelected = selectedIntegration === integration.id;
                    
                    return (
                      <button
                        key={integration.id}
                        onClick={() => setSelectedIntegration(integration.id)}
                        className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 transform hover:scale-[1.02] ${
                          isSelected
                            ? 'border-blue-500 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-lg shadow-blue-100'
                            : integration.status === 'connected'
                            ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:border-green-300 hover:shadow-md shadow-green-50'
                            : integration.status === 'pending'
                            ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 hover:border-yellow-300 hover:shadow-md shadow-yellow-50'
                            : 'border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50 hover:border-gray-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              isSelected 
                                ? 'bg-blue-100 text-blue-600' 
                                : integration.status === 'connected'
                                ? 'bg-green-100 text-green-600'
                                : integration.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-600' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <p className={`font-semibold text-sm mb-1 ${
                                isSelected ? 'text-blue-700' : 'text-gray-800'
                              }`}>
                                {integration.name}
                              </p>
                              <div className="flex items-center space-x-2">
                                <Badge className={`text-xs font-medium border ${
                                  integration.status === 'connected'
                                    ? 'bg-green-100 text-green-700 border-green-200'
                                    : integration.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                    : 'bg-gray-100 text-gray-600 border-gray-200'
                                }`}>
                                  {getStatusIcon(integration.status)}
                                  <span className="ml-1 capitalize">{integration.status}</span>
                                </Badge>
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="flex-shrink-0">
                              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                        
                        {/* Mini features preview for selected item */}
                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <p className="text-xs text-blue-600 font-medium mb-2">
                              {integration.features.length} features available
                            </p>
                            <div className="grid grid-cols-1 gap-1">
                              {integration.features.slice(0, 3).map((feature, idx) => (
                                <div key={idx} className="flex items-center space-x-2">
                                  <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                                  <span className="text-xs text-gray-600 truncate">{feature}</span>
                                </div>
                              ))}
                              {integration.features.length > 3 && (
                                <p className="text-xs text-blue-500 font-medium">
                                  +{integration.features.length - 3} more features
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Integration Details */}
        <div className="lg:col-span-3">
          {selectedIntegrationData && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <selectedIntegrationData.icon className="h-8 w-8 text-blue-600" />
                    <div>
                      <CardTitle className="text-xl">{selectedIntegrationData.name}</CardTitle>
                      <CardDescription>{selectedIntegrationData.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={`${getStatusColor(selectedIntegrationData.status)} border`}>
                      {getStatusIcon(selectedIntegrationData.status)}
                      <span className="ml-1 capitalize">{selectedIntegrationData.status}</span>
                    </Badge>
                    {selectedIntegrationData.status === 'connected' && (
                      <Button 
                        onClick={() => testConnectionMutation.mutate(selectedIntegrationData.id)}
                        disabled={testConnectionMutation.isPending}
                        variant="outline"
                        size="sm"
                      >
                        {testConnectionMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Test Connection
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="credentials">Credentials</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className={`${
                        selectedIntegrationData.status === 'connected' 
                          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
                          : selectedIntegrationData.status === 'pending'
                          ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'
                          : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'
                      }`}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-700">Connection Status</h3>
                            {getStatusIcon(selectedIntegrationData.status)}
                          </div>
                          <div className="text-center">
                            <p className={`text-2xl font-bold mb-1 ${
                              selectedIntegrationData.status === 'connected' ? 'text-green-700' :
                              selectedIntegrationData.status === 'pending' ? 'text-yellow-700' : 'text-gray-700'
                            }`}>
                              {selectedIntegrationData.status === 'connected' ? 'Active' :
                               selectedIntegrationData.status === 'pending' ? 'Setup Required' : 'Not Connected'}
                            </p>
                            <Badge className={`${getStatusColor(selectedIntegrationData.status)}`}>
                              <span className="capitalize">{selectedIntegrationData.status}</span>
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {selectedIntegrationData.lastSync ? (
                        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold text-gray-700">Last Sync</h3>
                              <RefreshCw className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="text-center">
                              <p className="text-xl font-bold text-purple-700 mb-1">
                                {new Date(selectedIntegrationData.lastSync).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-purple-600">
                                {new Date(selectedIntegrationData.lastSync).toLocaleTimeString()}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold text-gray-700">Integration Type</h3>
                              <selectedIntegrationData.icon className="h-5 w-5 text-orange-600" />
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-orange-700">
                                {integrationCategories.find(cat => cat.integrations.includes(selectedIntegrationData.id))?.name}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-700">Features Available</h3>
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="text-center">
                            <p className="text-3xl font-bold text-blue-700 mb-1">
                              {selectedIntegrationData.features.length}
                            </p>
                            <p className="text-sm text-blue-600 font-medium">Ready to Use</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Integration Features</CardTitle>
                        <CardDescription>
                          Complete feature set available with {selectedIntegrationData.name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {selectedIntegrationData.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                              <span className="text-sm text-gray-700 font-medium">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {selectedIntegrationData.status === 'disconnected' && (
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                          <strong>Setup Required:</strong> Configure your credentials in the Credentials tab to enable all features for {selectedIntegrationData.name}.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Action Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedIntegrationData.connectionUrl && (
                        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
                          <CardHeader>
                            <CardTitle className="flex items-center text-indigo-700">
                              <ExternalLink className="h-5 w-5 mr-2" />
                              Official Documentation
                            </CardTitle>
                            <CardDescription>
                              Visit official resources and setup guides
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Button variant="outline" className="w-full border-indigo-200 hover:bg-indigo-50" asChild>
                              <a 
                                href={selectedIntegrationData.connectionUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Documentation
                              </a>
                            </Button>
                          </CardContent>
                        </Card>
                      )}

                      <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
                        <CardHeader>
                          <CardTitle className="flex items-center text-emerald-700">
                            <Settings className="h-5 w-5 mr-2" />
                            Quick Configuration
                          </CardTitle>
                          <CardDescription>
                            Set up credentials and test connection
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button 
                            className="w-full bg-emerald-600 hover:bg-emerald-700" 
                            onClick={() => {
                              const credentialsTab = document.querySelector('[data-value="credentials"]') as HTMLElement;
                              credentialsTab?.click();
                            }}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Configure Integration
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="credentials" className="space-y-6">
                    {selectedIntegration === 'sars' ? (
                      <SARSCredentialsForm 
                        credentials={sarsCredentials}
                        onSave={(data) => saveCredentialsMutation.mutate({ integrationId: 'sars', data })}
                        isLoading={saveCredentialsMutation.isPending}
                      />
                    ) : ['payfast', 'peach', 'paygate', 'stripe', 'yoco', 'ozow'].includes(selectedIntegration) ? (
                      <PaymentGatewayCredentialsForm 
                        gatewayId={selectedIntegration}
                        gatewayName={selectedIntegrationData.name}
                        onSave={(data) => saveCredentialsMutation.mutate({ integrationId: selectedIntegration, data })}
                        isLoading={saveCredentialsMutation.isPending}
                      />
                    ) : (
                      <div className="text-center py-8">
                        <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Credential configuration for {selectedIntegrationData.name} coming soon.</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="features" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedIntegrationData.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Auto-sync enabled</p>
                          <p className="text-sm text-gray-600">Automatically sync data every hour</p>
                        </div>
                        <Switch />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email notifications</p>
                          <p className="text-sm text-gray-600">Receive email alerts for sync failures</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Debug logging</p>
                          <p className="text-sm text-gray-600">Enable detailed logging for troubleshooting</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Payment Gateway Credentials Form Component
function PaymentGatewayCredentialsForm({ 
  gatewayId,
  gatewayName,
  onSave, 
  isLoading 
}: { 
  gatewayId: string;
  gatewayName: string;
  onSave: (data: any) => void; 
  isLoading: boolean; 
}) {
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only send non-empty fields
    const dataToSend = Object.entries(credentials).reduce((acc, [key, value]) => {
      if (value && value.trim() !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
    
    onSave(dataToSend);
  };

  const toggleSecretVisibility = (field: string) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const getFieldsForGateway = (gatewayId: string) => {
    switch (gatewayId) {
      case 'payfast':
        return [
          { key: 'merchantId', label: 'Merchant ID', type: 'text', placeholder: '10000100', secret: false },
          { key: 'merchantKey', label: 'Merchant Key', type: 'password', placeholder: '46f0cd694581a', secret: true },
          { key: 'passphrase', label: 'Passphrase', type: 'password', placeholder: 'Optional passphrase', secret: true },
          { key: 'environment', label: 'Environment', type: 'select', options: ['sandbox', 'live'], secret: false }
        ];
      case 'peach':
        return [
          { key: 'userId', label: 'User ID', type: 'text', placeholder: '8a8294174b7ecb28014b9699220015ca', secret: false },
          { key: 'password', label: 'Password', type: 'password', placeholder: 'sy6KJsT8', secret: true },
          { key: 'entityId', label: 'Entity ID', type: 'text', placeholder: '8a8294174b7ecb28014b9699220015cc', secret: false },
          { key: 'environment', label: 'Environment', type: 'select', options: ['test', 'live'], secret: false }
        ];
      case 'paygate':
        return [
          { key: 'payGateId', label: 'PayGate ID', type: 'text', placeholder: '10011072130', secret: false },
          { key: 'payGateKey', label: 'PayGate Key', type: 'password', placeholder: 'secret', secret: true },
          { key: 'environment', label: 'Environment', type: 'select', options: ['test', 'live'], secret: false }
        ];
      case 'stripe':
        return [
          { key: 'publishableKey', label: 'Publishable Key', type: 'text', placeholder: 'pk_test_...', secret: false },
          { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'sk_test_...', secret: true },
          { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', placeholder: 'whsec_...', secret: true },
          { key: 'environment', label: 'Environment', type: 'select', options: ['test', 'live'], secret: false }
        ];
      case 'yoco':
        return [
          { key: 'publicKey', label: 'Public Key', type: 'text', placeholder: 'pk_test_...', secret: false },
          { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'sk_test_...', secret: true },
          { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', placeholder: 'wh_...', secret: true },
          { key: 'environment', label: 'Environment', type: 'select', options: ['test', 'live'], secret: false }
        ];
      case 'ozow':
        return [
          { key: 'siteKey', label: 'Site Key', type: 'text', placeholder: 'TST-TST-TST', secret: false },
          { key: 'privateKey', label: 'Private Key', type: 'password', placeholder: '215114554d524f28626d06237d18f4aa', secret: true },
          { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'f9b884bc-2c35-46a5-8f5c-5dfdb6e56b80', secret: true },
          { key: 'environment', label: 'Environment', type: 'select', options: ['test', 'live'], secret: false }
        ];
      default:
        return [];
    }
  };

  const fields = getFieldsForGateway(gatewayId);

  const getDocumentationUrl = (gatewayId: string) => {
    switch (gatewayId) {
      case 'payfast': return 'https://developers.payfast.co.za/';
      case 'peach': return 'https://docs.peachpayments.com/';
      case 'paygate': return 'https://docs.paygate.co.za/';
      case 'stripe': return 'https://stripe.com/docs';
      case 'yoco': return 'https://developer.yoco.com/';
      case 'ozow': return 'https://docs.ozow.com/';
      default: return '#';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>{gatewayName} Integration:</strong> Configure your merchant credentials to enable payment processing. All credentials are encrypted and stored securely.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>{field.label}</Label>
            {field.type === 'select' ? (
              <select
                id={field.key}
                value={credentials[field.key] || ''}
                onChange={(e) => setCredentials(prev => ({ ...prev, [field.key]: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select {field.label}</option>
                {field.options?.map((option) => (
                  <option key={option} value={option} className="capitalize">{option}</option>
                ))}
              </select>
            ) : field.secret ? (
              <div className="relative">
                <Input
                  id={field.key}
                  type={showSecrets[field.key] ? "text" : "password"}
                  value={credentials[field.key] || ''}
                  onChange={(e) => setCredentials(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => toggleSecretVisibility(field.key)}
                >
                  {showSecrets[field.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            ) : (
              <Input
                id={field.key}
                type={field.type}
                value={credentials[field.key] || ''}
                onChange={(e) => setCredentials(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
        <div>
          <p className="font-medium">Need Help Getting Started?</p>
          <p className="text-sm text-gray-600">Visit the official {gatewayName} documentation for setup instructions</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={getDocumentationUrl(gatewayId)} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Documentation
          </a>
        </Button>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Save {gatewayName} Settings
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// SARS Credentials Form Component
function SARSCredentialsForm({ 
  credentials: initialCredentials, 
  onSave, 
  isLoading 
}: { 
  credentials: any; 
  onSave: (data: Partial<SARSCredentials>) => void; 
  isLoading: boolean; 
}) {
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

  useEffect(() => {
    if (initialCredentials) {
      setCredentials(prev => ({
        ...prev,
        ...initialCredentials,
        clientSecret: '', // Keep masked
        password: '' // Keep masked
      }));
    }
  }, [initialCredentials]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only send non-empty fields
    const dataToSend = Object.entries(credentials).reduce((acc, [key, value]) => {
      if (value && value.trim() !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
    
    onSave(dataToSend);
  };

  const toggleSecretVisibility = (field: 'clientSecret' | 'password') => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>SARS Vendor Registration Required:</strong> To enable real SARS integration, you must register as a software vendor with SARS eFiling. Visit the SARS eFiling portal to obtain your API credentials.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="clientId">SARS API Key</Label>
          <Input
            id="clientId"
            value={credentials.clientId}
            onChange={(e) => setCredentials(prev => ({ ...prev, clientId: e.target.value }))}
            placeholder="Enter your SARS API key"
          />
          <p className="text-sm text-gray-600">Your primary API access key from SARS eFiling</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientSecret">Client Secret</Label>
          <div className="relative">
            <Input
              id="clientSecret"
              type={showSecrets.clientSecret ? "text" : "password"}
              value={credentials.clientSecret}
              onChange={(e) => setCredentials(prev => ({ ...prev, clientSecret: e.target.value }))}
              placeholder={initialCredentials?.clientSecret ? "••••••••••••••••" : "Enter your client secret"}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => toggleSecretVisibility('clientSecret')}
            >
              {showSecrets.clientSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-gray-600">Your client authentication secret</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Client ID</Label>
          <Input
            id="username"
            value={credentials.username}
            onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
            placeholder="Enter your client ID"
          />
          <p className="text-sm text-gray-600">Your registered client identifier</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Vendor ID</Label>
          <div className="relative">
            <Input
              id="password"
              type={showSecrets.password ? "text" : "password"}
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              placeholder={initialCredentials?.password ? "••••••••••••••••" : "Enter your vendor ID"}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => toggleSecretVisibility('password')}
            >
              {showSecrets.password ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-gray-600">Your assigned vendor identification number</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiUrl">API URL</Label>
          <Input
            id="apiUrl"
            value={credentials.apiUrl}
            onChange={(e) => setCredentials(prev => ({ ...prev, apiUrl: e.target.value }))}
            placeholder="https://secure.sarsefiling.co.za/api/v1"
          />
          <p className="text-sm text-gray-600">SARS eFiling API endpoint URL</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="environment">Environment</Label>
          <select
            id="environment"
            value={credentials.environment}
            onChange={(e) => setCredentials(prev => ({ ...prev, environment: e.target.value as 'sandbox' | 'production' }))}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="sandbox">Sandbox (Testing)</option>
            <option value="production">Production (Live)</option>
          </select>
          <p className="text-sm text-gray-600">Select testing or live environment</p>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Save SARS Settings
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
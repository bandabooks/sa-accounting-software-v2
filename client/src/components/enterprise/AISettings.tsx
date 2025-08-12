import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  Brain, 
  Zap, 
  AlertTriangle, 
  Info, 
  Settings, 
  MessageSquare,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

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

interface AISettingsProps {
  systemConfig?: SystemConfiguration;
  aiSettings?: AISettings;
}

export default function AISettings({ systemConfig, aiSettings }: AISettingsProps) {
  const [testingAI, setTestingAI] = useState(false);  
  const [aiResponse, setAiResponse] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [enabledValue, setEnabledValue] = useState(aiSettings?.enabled || false);
  const [providerValue, setProviderValue] = useState(aiSettings?.provider || 'anthropic');
  const [apiKeyValue, setApiKeyValue] = useState(aiSettings?.apiKey || '');
  const [modelValue, setModelValue] = useState(aiSettings?.model || 'claude-3-5-sonnet-20241022');
  const [maxTokensValue, setMaxTokensValue] = useState(aiSettings?.maxTokens || 4096);
  const [temperatureValue, setTemperatureValue] = useState(aiSettings?.temperature || 0.7);
  const [contextSharingValue, setContextSharingValue] = useState(aiSettings?.contextSharing || true);
  const [conversationHistoryValue, setConversationHistoryValue] = useState(aiSettings?.conversationHistory || true);
  const [suggestionsValue, setSuggestionsValue] = useState(aiSettings?.suggestions || true);
  const queryClient = useQueryClient();

  // Sync local state with props when aiSettings changes
  useEffect(() => {
    if (aiSettings) {
      setEnabledValue(aiSettings.enabled);
      setProviderValue(aiSettings.provider || 'anthropic');
      setApiKeyValue(aiSettings.apiKey || '');
      setModelValue(aiSettings.model || 'claude-3-5-sonnet-20241022');
      setMaxTokensValue(aiSettings.maxTokens || 4096);
      setTemperatureValue(aiSettings.temperature || 0.7);
      setContextSharingValue(aiSettings.contextSharing !== undefined ? aiSettings.contextSharing : true);
      setConversationHistoryValue(aiSettings.conversationHistory !== undefined ? aiSettings.conversationHistory : true);
      setSuggestionsValue(aiSettings.suggestions !== undefined ? aiSettings.suggestions : true);
    }
  }, [aiSettings]);

  // Update AI settings mutation
  const updateAISettingsMutation = useMutation({
    mutationFn: async (settings: Partial<AISettings>) => {
      return await apiRequest('/api/ai/settings', 'PUT', settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/settings'] });
      toast({
        title: "AI Settings Updated",
        description: "Your AI assistant preferences have been saved",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update AI settings",
        variant: "destructive",
      });
    },
  });

  const handleSaveApiConfig = () => {
    updateAISettingsMutation.mutate({
      apiKey: apiKeyValue,
      model: modelValue,
      maxTokens: maxTokensValue,
      temperature: temperatureValue,
    });
  };

  const testAIConnection = async () => {
    if (!apiKeyValue) {
      toast({
        title: "API Key Required",
        description: "Please enter your Anthropic API key first",
        variant: "destructive",
      });
      return;
    }

    setTestingAI(true);
    try {
      const response = await apiRequest('/api/ai/test-connection', 'POST', {
        apiKey: apiKeyValue,
        model: modelValue,
      });
      setAiResponse(response.message || 'AI connection test successful!');
      toast({
        title: "Connection Successful",
        description: "AI assistant is working correctly",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to AI service. Please check your API key.",
        variant: "destructive",
      });
    } finally {
      setTestingAI(false);
    }
  };

  const handleSettingChange = (setting: keyof AISettings, value: any) => {
    // Update local state first for immediate UI feedback
    switch(setting) {
      case 'enabled':
        setEnabledValue(value);
        break;
      case 'provider':
        setProviderValue(value);
        break;
      case 'contextSharing':
        setContextSharingValue(value);
        break;
      case 'conversationHistory':
        setConversationHistoryValue(value);
        break;
      case 'suggestions':
        setSuggestionsValue(value);
        break;
    }
    
    // Then update the backend
    updateAISettingsMutation.mutate({ [setting]: value });
  };

  // Test AI functionality
  const testAIMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/ai/test', 'POST', {
        message: "Hello, this is a test of the AI assistant functionality."
      });
    },
    onSuccess: (data) => {
      setAiResponse(data.response);
      setTestingAI(true);
      setTimeout(() => setTestingAI(false), 5000);
      toast({
        title: "AI Test Successful",
        description: "AI assistant is working correctly",
      });
    },
    onError: () => {
      toast({
        title: "AI Test Failed",
        description: "AI assistant is not responding correctly",
        variant: "destructive",
      });
    },
  });



  if (!aiSettings) {
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
      {/* AI Status Overview */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${systemConfig?.features.ai ? 'bg-purple-100' : 'bg-gray-100'}`}>
                <Brain className={`h-5 w-5 ${systemConfig?.features.ai ? 'text-purple-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <CardTitle className="text-lg">AI Assistant</CardTitle>
                <CardDescription>
                  Intelligent assistant for accounting and business insights
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={enabledValue ? "default" : "secondary"}>
                {enabledValue ? 'Active' : 'Inactive'}
              </Badge>
              {!systemConfig?.features.ai && (
                <Badge variant="outline">Unavailable</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!systemConfig?.features.ai && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                AI assistant is not configured. Contact your administrator to enable AI functionality.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* Main AI Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="ai-enabled">Enable AI Assistant</Label>
                <p className="text-sm text-gray-600">Master switch for AI functionality</p>
              </div>
              <Switch
                id="ai-enabled"
                checked={enabledValue}
                onCheckedChange={(checked) => handleSettingChange('enabled', checked)}
                disabled={!systemConfig?.features.ai || updateAISettingsMutation.isPending}
              />
            </div>

            {enabledValue && (
              <div className="space-y-6 border-l-2 border-gray-200 pl-6 ml-3">
                {/* AI Provider Selection */}
                <div className="space-y-2">
                  <Label htmlFor="ai-provider">AI Provider</Label>
                  <Select
                    value={providerValue}
                    onValueChange={(value) => handleSettingChange('provider', value)}
                    disabled={updateAISettingsMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {systemConfig?.providers?.ai?.map((provider) => (
                        <SelectItem key={provider} value={provider}>
                          {provider === 'anthropic' ? 'Anthropic Claude' : 
                           provider === 'openai' ? 'OpenAI GPT' : provider}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-600">
                    Choose the AI provider for your assistant
                  </p>
                </div>

                {/* API Configuration */}
                {providerValue === 'anthropic' && (
                  <Card className="p-4 bg-gray-50">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm text-gray-900">API Configuration</h4>
                        <Badge variant="outline" className="text-xs">Anthropic Claude</Badge>
                      </div>
                      
                      {/* API Key */}
                      <div className="space-y-2">
                        <Label htmlFor="api-key">API Key</Label>
                        <div className="relative">
                          <Input
                            id="api-key"
                            type={showApiKey ? "text" : "password"}
                            value={apiKeyValue}
                            onChange={(e) => setApiKeyValue(e.target.value)}
                            placeholder="sk-ant-..."
                            className="pr-10"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowApiKey(!showApiKey)}
                          >
                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600">
                          Your Anthropic API key. Get one from{' '}
                          <a 
                            href="https://console.anthropic.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Anthropic Console
                          </a>
                        </p>
                      </div>

                      {/* Model Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="ai-model">Model</Label>
                        <Select value={modelValue} onValueChange={setModelValue}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Latest)</SelectItem>
                            <SelectItem value="claude-3-sonnet-20240229">Claude 3 Sonnet</SelectItem>
                            <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku (Fast)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-600">Choose the Claude model for your assistant</p>
                      </div>

                      {/* Advanced Settings */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="max-tokens">Max Tokens</Label>
                          <Input
                            id="max-tokens"
                            type="number"
                            value={maxTokensValue}
                            onChange={(e) => setMaxTokensValue(parseInt(e.target.value) || 4096)}
                            min="1"
                            max="8192"
                          />
                          <p className="text-xs text-gray-600">Maximum response length</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="temperature">Temperature</Label>
                          <Input
                            id="temperature"
                            type="number"
                            value={temperatureValue}
                            onChange={(e) => setTemperatureValue(parseFloat(e.target.value) || 0.7)}
                            min="0"
                            max="1"
                            step="0.1"
                          />
                          <p className="text-xs text-gray-600">Response creativity (0-1)</p>
                        </div>
                      </div>

                      {/* Save and Test Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          onClick={handleSaveApiConfig}
                          disabled={updateAISettingsMutation.isPending}
                          size="sm"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Save Configuration
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={testAIConnection}
                          disabled={testingAI || !apiKeyValue}
                          size="sm"
                        >
                          {testingAI ? (
                            <>
                              <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                              Testing...
                            </>
                          ) : (
                            <>
                              <Zap className="h-4 w-4 mr-2" />
                              Test Connection
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Test Response */}
                      {aiResponse && (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Test Response:</strong> {aiResponse}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </Card>
                )}

                {/* Privacy Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-900">Privacy & Data Sharing</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="context-sharing">Context Sharing</Label>
                      <p className="text-sm text-gray-600">Allow AI to access business context for better assistance</p>
                    </div>
                    <Switch
                      id="context-sharing"
                      checked={aiSettings.contextSharing}
                      onCheckedChange={(checked) => handleSettingChange('contextSharing', checked)}
                      disabled={updateAISettingsMutation.isPending}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="conversation-history">Conversation History</Label>
                      <p className="text-sm text-gray-600">Keep conversation history for better context</p>
                    </div>
                    <Switch
                      id="conversation-history"
                      checked={aiSettings.conversationHistory}
                      onCheckedChange={(checked) => handleSettingChange('conversationHistory', checked)}
                      disabled={updateAISettingsMutation.isPending}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="ai-suggestions">Smart Suggestions</Label>
                      <p className="text-sm text-gray-600">Show AI-powered suggestions and quick actions</p>
                    </div>
                    <Switch
                      id="ai-suggestions"
                      checked={aiSettings.suggestions}
                      onCheckedChange={(checked) => handleSettingChange('suggestions', checked)}
                      disabled={updateAISettingsMutation.isPending}
                    />
                  </div>
                </div>

                {/* Privacy Notice */}
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Privacy Notice:</strong> Your data remains secure and is never shared with third parties. 
                    AI processing happens in secure, encrypted environments with no data retention by AI providers.
                  </AlertDescription>
                </Alert>

                {/* Test AI Functionality */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm text-gray-900">Test AI Assistant</h4>
                      <p className="text-sm text-gray-600">Verify that your AI assistant is working correctly</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => testAIMutation.mutate()}
                      disabled={testAIMutation.isPending}
                    >
                      {testAIMutation.isPending ? (
                        <>
                          <Brain className="mr-2 h-4 w-4 animate-pulse" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Test AI
                        </>
                      )}
                    </Button>
                  </div>

                  {testingAI && aiResponse && (
                    <Alert>
                      <Brain className="h-4 w-4" />
                      <AlertDescription>
                        <strong>AI Response:</strong> {aiResponse}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Capabilities Overview */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-dashed">
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Zap className="mr-2 h-4 w-4" />
            AI Assistant Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="font-medium">Financial Analysis:</p>
              <ul className="space-y-1 text-gray-600 text-xs">
                <li>• Cash flow insights and predictions</li>
                <li>• Invoice and payment analysis</li>
                <li>• VAT compliance recommendations</li>
                <li>• Financial report interpretation</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Business Insights:</p>  
              <ul className="space-y-1 text-gray-600 text-xs">
                <li>• Customer behavior analysis</li>
                <li>• Product performance metrics</li>
                <li>• Expense optimization suggestions</li>
                <li>• Business growth recommendations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Settings Summary */}
      <Card className="bg-gray-50 border-dashed">
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            AI Configuration Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="font-medium">Status & Provider:</p>
              <ul className="space-y-1 text-gray-600">
                <li className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${aiSettings.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                  AI Assistant: {aiSettings.enabled ? 'Enabled' : 'Disabled'}
                </li>
                {aiSettings.enabled && (
                  <li className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-2 bg-blue-500" />
                    Provider: {aiSettings.provider === 'anthropic' ? 'Anthropic Claude' : 
                              aiSettings.provider === 'openai' ? 'OpenAI GPT' : aiSettings.provider}
                  </li>
                )}
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Privacy Settings:</p>
              <ul className="space-y-1 text-gray-600">
                <li className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${aiSettings.contextSharing ? 'bg-green-500' : 'bg-gray-300'}`} />
                  Context Sharing: {aiSettings.contextSharing ? 'On' : 'Off'}
                </li>
                <li className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${aiSettings.conversationHistory ? 'bg-green-500' : 'bg-gray-300'}`} />
                  History: {aiSettings.conversationHistory ? 'On' : 'Off'}
                </li>
                <li className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${aiSettings.suggestions ? 'bg-green-500' : 'bg-gray-300'}`} />
                  Suggestions: {aiSettings.suggestions ? 'On' : 'Off'}
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
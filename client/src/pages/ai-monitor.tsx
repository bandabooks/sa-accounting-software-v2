import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AISystemMonitor } from '@/components/ai-assistant/AISystemMonitor';
import { AIHealthBanner } from '@/components/ai-assistant/AIHealthBanner';
import { 
  Brain, 
  Settings, 
  Activity, 
  Shield, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

export default function AIMonitorPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Check if user has admin permissions
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Assistant Monitor</h1>
            <p className="text-muted-foreground">
              Monitor AI assistant health and performance
            </p>
          </div>
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You need admin permissions to access the AI monitoring dashboard.
            Contact your system administrator for access.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Assistant Monitor</h1>
          <p className="text-muted-foreground">
            Monitor and manage AI assistant health, performance, and features
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Brain className="h-3 w-3 mr-1" />
            Anthropic Claude
          </Badge>
        </div>
      </div>

      {/* Health Banner */}
      <AIHealthBanner />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Monitoring</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Features</span>
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center space-x-2">
            <Info className="h-4 w-4" />
            <span>Help</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Healthy</div>
                <p className="text-xs text-muted-foreground">
                  All AI services operational
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">850ms</div>
                <p className="text-xs text-muted-foreground">
                  Average response time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.5%</div>
                <p className="text-xs text-muted-foreground">
                  Request success rate
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI Features in Taxnify</CardTitle>
              <CardDescription>
                Overview of AI-powered features available across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-medium">Transaction Processing</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Smart transaction matching and categorization
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Bulk expense and income processing
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Automated VAT calculations
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Business Intelligence</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Invoice analysis and payment predictions
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Financial insights and recommendations
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      South African VAT compliance guidance
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Assistance & Support</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Interactive AI chat assistant
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Context-aware help and guidance
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Chart of accounts suggestions
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Automation</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Document analysis and extraction
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Bank statement processing
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Workflow optimization suggestions
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <AISystemMonitor />
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Available AI Capabilities</CardTitle>
                <CardDescription>
                  Current AI features and their operational status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Basic Chat</p>
                      <p className="text-sm text-muted-foreground">General AI conversation</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Document Analysis</p>
                      <p className="text-sm text-muted-foreground">PDF and document processing</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Image Analysis</p>
                      <p className="text-sm text-muted-foreground">Receipt and image processing</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Code Generation</p>
                      <p className="text-sm text-muted-foreground">Automation and scripting</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Usage</CardTitle>
                <CardDescription>
                  Most popular AI features in your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Transaction Matching</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm">
                      <span>VAT Guidance</span>
                      <span>72%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Chat Assistant</span>
                      <span>58%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '58%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Invoice Analysis</span>
                      <span>43%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: '43%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="help" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>
                  How to use AI features in Taxnify
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">AI Chat Assistant</h3>
                  <p className="text-sm text-muted-foreground">
                    Access the AI chat assistant from any page by clicking the brain icon in the header.
                    Ask questions about accounting, VAT compliance, or platform features.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Transaction Matching</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload bank statements or transactions in the Bulk Capture module.
                    AI will automatically suggest account mappings and VAT classifications.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Invoice Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    View any invoice and click "AI Analysis" to get insights about payment likelihood,
                    risk factors, and recommended follow-up actions.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Troubleshooting</CardTitle>
                <CardDescription>
                  Common issues and solutions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">AI Not Responding</h3>
                  <p className="text-sm text-muted-foreground">
                    Check the AI health banner at the top of the page. If the status is "degraded" or "down",
                    contact your system administrator.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Slow Response Times</h3>
                  <p className="text-sm text-muted-foreground">
                    Response times may vary based on request complexity. Large document analysis
                    or bulk processing may take 30-60 seconds.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Feature Not Available</h3>
                  <p className="text-sm text-muted-foreground">
                    Some AI features may be limited by your subscription plan.
                    Contact support to upgrade your plan for full AI access.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Need additional help?</strong> Contact our support team or consult the 
              detailed AI assistant documentation in your user manual.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}
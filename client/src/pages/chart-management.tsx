import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress"; // Comment out if not available
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { 
  Building2, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  TrendingUp,
  FileText,
  Settings,
  Download,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChartOfAccount {
  id: number;
  accountCode: string;
  accountName: string;
  accountType: string;
  category: string;
  isActive: boolean;
  balance: number;
}

interface IndustryTemplate {
  id: string;
  name: string;
  description: string;
  totalAccounts: number;
  accountBreakdown: Record<string, number>;
}

export default function ChartManagement() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current chart of accounts
  const { data: chartOfAccounts = [], isLoading: chartLoading } = useQuery<ChartOfAccount[]>({
    queryKey: ["/api/chart-of-accounts"],
  });

  // Get available industry templates
  const { data: industryTemplates = [], isLoading: templatesLoading } = useQuery<IndustryTemplate[]>({
    queryKey: ["/api/chart-of-accounts/templates"],
  });

  // Get current company info
  const { data: company } = useQuery({
    queryKey: ["/api/companies/active"],
  });

  // Apply industry template mutation
  const applyTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await apiRequest(`/api/chart-of-accounts/apply-template`, "POST", {
        templateId,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Industry template applied successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/chart-of-accounts"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to apply industry template",
        variant: "destructive",
      });
    },
  });

  // Activate/deactivate account mutation
  const toggleAccountMutation = useMutation({
    mutationFn: async ({ accountId, isActive }: { accountId: number; isActive: boolean }) => {
      const response = await apiRequest(`/api/chart-of-accounts/${accountId}/toggle`, "PATCH", {
        isActive,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chart-of-accounts"] });
    },
  });

  const handleApplyTemplate = () => {
    if (!selectedTemplate) return;
    applyTemplateMutation.mutate(selectedTemplate);
  };

  const handleToggleAccount = (accountId: number, currentStatus: boolean) => {
    toggleAccountMutation.mutate({
      accountId,
      isActive: !currentStatus,
    });
  };

  // Calculate account statistics
  const accountStats = chartOfAccounts.reduce((acc, account) => {
    acc.total++;
    if (account.isActive) acc.active++;
    acc.byType[account.accountType] = (acc.byType[account.accountType] || 0) + 1;
    return acc;
  }, { total: 0, active: 0, byType: {} as Record<string, number> });

  if (chartLoading || templatesLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chart of Accounts Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your chart of accounts and apply industry-specific templates
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            View All Accounts
          </Button>
        </div>
      </div>

      {/* Current Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Accounts</CardTitle>
            <div className="text-2xl font-bold text-blue-600">{accountStats.total}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Active: {accountStats.active} / Inactive: {accountStats.total - accountStats.active}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Assets</CardTitle>
            <div className="text-2xl font-bold text-green-600">{accountStats.byType['Asset'] || 0}</div>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${(accountStats.byType['Asset'] || 0) / accountStats.total * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Liabilities</CardTitle>
            <div className="text-2xl font-bold text-orange-600">{accountStats.byType['Liability'] || 0}</div>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-600 h-2 rounded-full" 
                style={{ width: `${(accountStats.byType['Liability'] || 0) / accountStats.total * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Expenses</CardTitle>
            <div className="text-2xl font-bold text-red-600">{accountStats.byType['Expense'] || 0}</div>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full" 
                style={{ width: `${(accountStats.byType['Expense'] || 0) / accountStats.total * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Industry Templates</TabsTrigger>
          <TabsTrigger value="accounts">Account Management</TabsTrigger>
          <TabsTrigger value="settings">Chart Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Apply Industry Template
              </CardTitle>
              <CardDescription>
                Select an industry-specific chart of accounts template to optimize your financial structure.
                Current industry: <Badge variant="outline">{company?.industry || 'General'}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-select">Select Industry Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose an industry template" />
                    </SelectTrigger>
                    <SelectContent>
                      {industryTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{template.name}</span>
                            <span className="text-xs text-gray-500">
                              {template.totalAccounts} accounts
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTemplate && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Applying this template will add industry-specific accounts to your chart.
                      Existing accounts will not be modified.
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleApplyTemplate}
                  disabled={!selectedTemplate || applyTemplateMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {applyTemplateMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Applying Template...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Apply Template
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Available Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {industryTemplates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">{template.name}</CardTitle>
                  <CardDescription className="text-xs">{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Accounts:</span>
                      <span className="font-medium">{template.totalAccounts}</span>
                    </div>
                    {Object.entries(template.accountBreakdown).map(([type, count]) => (
                      <div key={type} className="flex justify-between text-xs">
                        <span className="text-gray-500">{type}:</span>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Account Management
              </CardTitle>
              <CardDescription>
                Activate or deactivate specific accounts based on your business needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(
                  chartOfAccounts.reduce((acc, account) => {
                    if (!acc[account.accountType]) acc[account.accountType] = [];
                    acc[account.accountType].push(account);
                    return acc;
                  }, {} as Record<string, ChartOfAccount[]>)
                ).map(([type, accounts]) => (
                  <div key={type} className="space-y-2">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      {type} ({accounts.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {accounts.slice(0, 6).map((account) => (
                        <div
                          key={account.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {account.accountName}
                            </p>
                            <p className="text-xs text-gray-500">{account.accountCode}</p>
                          </div>
                          <Button
                            size="sm"
                            variant={account.isActive ? "default" : "outline"}
                            onClick={() => handleToggleAccount(account.id, account.isActive)}
                            disabled={toggleAccountMutation.isPending}
                          >
                            {account.isActive ? "Active" : "Inactive"}
                          </Button>
                        </div>
                      ))}
                    </div>
                    {accounts.length > 6 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{accounts.length - 6} more accounts...
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                Chart Settings
              </CardTitle>
              <CardDescription>
                Configure chart of accounts preferences and automation settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Advanced chart settings are available in the Enterprise plan.
                    Current plan: <Badge variant="outline">{company?.subscriptionPlan || 'Basic'}</Badge>
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Auto-categorization</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-gray-500 mb-2">
                        Automatically categorize transactions using AI
                      </p>
                      <Badge variant="secondary">Pro Feature</Badge>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Custom Account Creation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-gray-500 mb-2">
                        Create custom accounts with advanced rules
                      </p>
                      <Badge variant="secondary">Enterprise Feature</Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
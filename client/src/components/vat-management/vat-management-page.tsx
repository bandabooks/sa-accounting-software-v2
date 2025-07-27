import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { VatStatusToggle } from "./vat-status-toggle";
import { VatComplianceGuide } from "./vat-conditional-fields";
import AIComplianceTips from "./ai-compliance-tips";
import { FileText, Settings, BarChart3, Calendar, Shield, AlertTriangle, CheckCircle, Eye, EyeOff, Brain, Plus, Download, Upload, Globe, Building, Clock, DollarSign } from "lucide-react";

interface VatManagementPageProps {
  companyId: number;
}

export function VatManagementPage({ companyId }: VatManagementPageProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vatSettings } = useQuery({
    queryKey: ["/api/companies", companyId, "vat-settings"],
  });

  const { data: vatTypes } = useQuery({
    queryKey: ["/api/companies", companyId, "vat-types"],
    enabled: !!vatSettings?.isVatRegistered,
  });

  const { data: vatReports } = useQuery({
    queryKey: ["/api/vat-reports"],
    enabled: !!vatSettings?.isVatRegistered,
  });

  const manageVatTypeMutation = useMutation({
    mutationFn: async ({ vatTypeId, isActive }: { vatTypeId: number; isActive: boolean }) => {
      return await apiRequest(`/api/companies/${companyId}/vat-types/${vatTypeId}`, "PUT", { isActive });
    },
    onSuccess: () => {
      toast({
        title: "VAT Type Updated",
        description: "VAT type status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "vat-types"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update VAT type status.",
        variant: "destructive",
      });
    },
  });

  const seedVatTypesMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/vat-types/seed", {});
    },
    onSuccess: () => {
      toast({
        title: "VAT Types Seeded",
        description: "Default South African VAT types have been created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "vat-types"] });
    },
  });

  const handleVatTypeToggle = (vatTypeId: number, currentStatus: boolean) => {
    manageVatTypeMutation.mutate({ vatTypeId, isActive: !currentStatus });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">VAT Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Configure VAT registration, types, and compliance settings</p>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="settings">VAT Settings</TabsTrigger>
          <TabsTrigger value="types">VAT Types</TabsTrigger>
          <TabsTrigger value="returns" disabled={!vatSettings?.isVatRegistered}>VAT201 Returns</TabsTrigger>
          <TabsTrigger value="reports" disabled={!vatSettings?.isVatRegistered}>VAT Reports</TabsTrigger>
          <TabsTrigger value="sars-integration" disabled={!vatSettings?.isVatRegistered}>SARS eFiling</TabsTrigger>
          <TabsTrigger value="ai-tips">
            <Brain className="h-4 w-4 mr-1" />
            AI Tips
          </TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <VatStatusToggle 
            companyId={companyId}
            initialSettings={vatSettings || {
              isVatRegistered: false,
              vatNumber: "",
              vatRegistrationDate: undefined,
              vatPeriodMonths: 2,
              vatSubmissionDay: 25
            }}
          />
        </TabsContent>

        <TabsContent value="types" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                VAT Types Management
              </CardTitle>
              <CardDescription>
                Manage available VAT types for your company
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!vatSettings?.isVatRegistered ? (
                <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                  <EyeOff className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">VAT Registration Required</h3>
                  <p className="text-yellow-700 mb-4">
                    VAT types are only available for VAT-registered companies. 
                    Enable VAT registration in the VAT Settings tab to access this feature.
                  </p>
                  <Button variant="outline" onClick={() => {/* Navigate to settings tab */}}>
                    Configure VAT Registration
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Available VAT Types</h3>
                      <p className="text-sm text-gray-600">South African VAT types for your company</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => seedVatTypesMutation.mutate()}
                        disabled={seedVatTypesMutation.isPending}
                        variant="outline"
                        size="sm"
                      >
                        Seed Default Types
                      </Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Custom VAT Type
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {vatTypes?.map((vatType: any) => (
                      <Card key={vatType.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-mono">
                              {vatType.code}
                            </Badge>
                            <div>
                              <h4 className="font-medium">{vatType.name}</h4>
                              <p className="text-sm text-gray-600">{vatType.description}</p>
                            </div>
                            <Badge variant="secondary">
                              {vatType.rate}%
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            {vatType.isSystemType ? (
                              <Badge variant="default" className="bg-blue-100 text-blue-800">
                                <Shield className="h-3 w-3 mr-1" />
                                System
                              </Badge>
                            ) : (
                              <Switch 
                                checked={vatType.isActive}
                                onCheckedChange={() => handleVatTypeToggle(vatType.id, vatType.isActive)}
                                disabled={manageVatTypeMutation.isPending}
                              />
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="returns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                VAT201 Returns Management
              </CardTitle>
              <CardDescription>
                Create, manage, and submit VAT201 returns to SARS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* VAT Return Period Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100">Current Period</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300">Jan 2025 - Feb 2025</p>
                      </div>
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-blue-600 dark:text-blue-400">Due: 25 Mar 2025</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Output VAT</h3>
                        <p className="text-2xl font-bold text-green-600">R 45,230</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Input VAT</h3>
                        <p className="text-2xl font-bold text-blue-600">R 12,850</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* VAT201 Return Actions */}
              <div className="flex flex-wrap gap-3">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New VAT201
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Draft
                </Button>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Submit to SARS
                </Button>
              </div>

              {/* Recent VAT Returns */}
              <div className="space-y-3">
                <h3 className="font-semibold">Recent VAT Returns</h3>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 font-medium text-sm">
                    Recent Submissions
                  </div>
                  <div className="divide-y">
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">Nov 2024 - Dec 2024</p>
                        <p className="text-sm text-gray-600">Submitted: 25 Jan 2025</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Accepted</Badge>
                    </div>
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">Sep 2024 - Oct 2024</p>
                        <p className="text-sm text-gray-600">Submitted: 25 Nov 2024</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Accepted</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                VAT Reports & Analytics
              </CardTitle>
              <CardDescription>
                Comprehensive VAT reporting with export capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Types Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="font-semibold">VAT Summary Report</h3>
                        <p className="text-sm text-gray-600">Input/Output VAT summary</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        PDF
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Excel
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-8 w-8 text-green-600" />
                      <div>
                        <h3 className="font-semibold">VAT by Transaction</h3>
                        <p className="text-sm text-gray-600">Detailed transaction analysis</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        CSV
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Excel
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-8 w-8 text-purple-600" />
                      <div>
                        <h3 className="font-semibold">VAT Reconciliation</h3>
                        <p className="text-sm text-gray-600">Period reconciliation report</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        PDF
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Excel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Filters */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Quick Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Button variant="outline" size="sm">This Month</Button>
                  <Button variant="outline" size="sm">Last Month</Button>
                  <Button variant="outline" size="sm">This Quarter</Button>
                  <Button variant="outline" size="sm">Custom Range</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sars-integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                SARS eFiling Integration
              </CardTitle>
              <CardDescription>
                Direct integration with SARS eFiling for automated submissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Integration Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-2 border-green-200 bg-green-50 dark:bg-green-950/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-green-900 dark:text-green-100">SARS Connected</h3>
                        <p className="text-sm text-green-700 dark:text-green-300">Integration active and verified</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Building className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="font-semibold">VAT Vendor</h3>
                        <p className="text-sm text-gray-600">4123456789</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* eFiling Features */}
              <div className="space-y-4">
                <h3 className="font-semibold">Available eFiling Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Upload className="h-6 w-6 text-blue-600" />
                          <div>
                            <h4 className="font-medium">Auto VAT201 Submission</h4>
                            <p className="text-sm text-gray-600">Automated return submissions</p>
                          </div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Clock className="h-6 w-6 text-green-600" />
                          <div>
                            <h4 className="font-medium">Payment Notifications</h4>
                            <p className="text-sm text-gray-600">SARS payment confirmations</p>
                          </div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-6 w-6 text-amber-600" />
                          <div>
                            <h4 className="font-medium">Compliance Alerts</h4>
                            <p className="text-sm text-gray-600">Deadline and requirement alerts</p>
                          </div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Download className="h-6 w-6 text-purple-600" />
                          <div>
                            <h4 className="font-medium">Statement Downloads</h4>
                            <p className="text-sm text-gray-600">Auto-download SARS statements</p>
                          </div>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Integration Settings */}
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Integration Settings
                </h4>
                <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <p><strong>Last Sync:</strong> 27 Jan 2025, 09:15 AM</p>
                  <p><strong>Next Sync:</strong> 27 Jan 2025, 12:00 PM</p>
                  <p><strong>Sync Frequency:</strong> Every 3 hours</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline">
                    Sync Now
                  </Button>
                  <Button size="sm" variant="outline">
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-tips" className="space-y-6">
          <AIComplianceTips 
            companyId={companyId} 
            vatSettings={vatSettings}
            transactionData={{
              hasRecentTransactions: true,
              totalInvoices: 0, // This could be populated from actual data
              totalExpenses: 0   // This could be populated from actual data
            }}
          />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <VatComplianceGuide companyId={companyId} />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                VAT Compliance Features
              </CardTitle>
              <CardDescription>
                System features that change based on VAT registration status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Invoice VAT Calculations</h4>
                    <p className="text-sm text-gray-600">VAT rates and amounts on invoices</p>
                  </div>
                  {vatSettings?.isVatRegistered ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <Eye className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-100 text-gray-600">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Hidden
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">VAT Reports</h4>
                    <p className="text-sm text-gray-600">Financial reports with VAT breakdown</p>
                  </div>
                  {vatSettings?.isVatRegistered ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <Eye className="h-3 w-3 mr-1" />
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-100 text-gray-600">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Disabled
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">VAT201 Submissions</h4>
                    <p className="text-sm text-gray-600">SARS VAT return preparation and submission</p>
                  </div>
                  {vatSettings?.isVatRegistered ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <Eye className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-100 text-gray-600">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Unavailable
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
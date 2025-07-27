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
import VATReports from "./vat-reports";
import SARSeFiling from "./sars-efiling";
import VAT201Returns from "./vat201-returns";
import ComplianceDashboard from "./compliance-dashboard";
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Enterprise VAT Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Professional VAT compliance with SARS integration, AI-powered tips, and unlimited custom types
        </p>
        
        {/* Enhanced Features Banner */}
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 mb-2">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">✨ NEW ENTERPRISE FEATURES ADDED</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-300">
              <Plus className="h-3 w-3" />
              Unlimited Custom VAT Types
            </div>
            <div className="flex items-center gap-1 text-green-600 dark:text-green-300">
              <FileText className="h-3 w-3" />
              Automated VAT201 Returns
            </div>
            <div className="flex items-center gap-1 text-purple-600 dark:text-purple-300">
              <BarChart3 className="h-3 w-3" />
              Multi-Format VAT Reports
            </div>
            <div className="flex items-center gap-1 text-orange-600 dark:text-orange-300">
              <Globe className="h-3 w-3" />
              SARS eFiling Integration
            </div>
            <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-300">
              <Brain className="h-3 w-3" />
              AI Compliance Tips
            </div>
            <div className="flex items-center gap-1 text-red-600 dark:text-red-300">
              <Shield className="h-3 w-3" />
              Advanced Compliance
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="types" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="settings">VAT Settings</TabsTrigger>
          <TabsTrigger value="types" className="bg-blue-50 border-blue-200">
            <Plus className="h-4 w-4 mr-1" />
            VAT Types
          </TabsTrigger>
          <TabsTrigger value="returns" className="bg-green-50 border-green-200">
            <FileText className="h-4 w-4 mr-1" />
            VAT201 Returns
          </TabsTrigger>
          <TabsTrigger value="reports" className="bg-purple-50 border-purple-200">
            <BarChart3 className="h-4 w-4 mr-1" />
            VAT Reports
          </TabsTrigger>
          <TabsTrigger value="sars-integration" className="bg-orange-50 border-orange-200">
            <Globe className="h-4 w-4 mr-1" />
            SARS eFiling
          </TabsTrigger>
          <TabsTrigger value="ai-tips" className="bg-indigo-50 border-indigo-200">
            <Brain className="h-4 w-4 mr-1" />
            AI Tips
          </TabsTrigger>
          <TabsTrigger value="compliance" className="bg-red-50 border-red-200">
            <Shield className="h-4 w-4 mr-1" />
            Compliance
          </TabsTrigger>
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
          <VAT201Returns companyId={companyId} />
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
          <SARSeFiling companyId={companyId} />
        </TabsContent>

        <TabsContent value="ai-tips" className="space-y-6">
          <AIComplianceTips companyId={companyId} />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <ComplianceDashboard companyId={companyId} />
          
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
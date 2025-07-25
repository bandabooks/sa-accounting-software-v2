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
import { FileText, Settings, BarChart3, Calendar, Shield, AlertTriangle, CheckCircle, Eye, EyeOff, Brain } from "lucide-react";

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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="settings">VAT Settings</TabsTrigger>
          <TabsTrigger value="types">VAT Types</TabsTrigger>
          <TabsTrigger value="returns" disabled={!vatSettings?.isVatRegistered}>VAT Returns</TabsTrigger>
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
                    <Button 
                      onClick={() => seedVatTypesMutation.mutate()}
                      disabled={seedVatTypesMutation.isPending}
                      variant="outline"
                      size="sm"
                    >
                      Seed Default Types
                    </Button>
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
                VAT Returns (VAT201)
              </CardTitle>
              <CardDescription>
                Manage VAT returns and submissions to SARS
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!vatSettings?.isVatRegistered ? (
                <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
                  <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-medium text-red-800 mb-2">VAT Registration Required</h3>
                  <p className="text-red-700">
                    VAT returns are only available for VAT-registered companies.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800 mb-2">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">VAT Returns Available</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Your company is VAT registered. VAT returns and VAT201 submissions are now available.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Current Period</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {vatSettings.vatPeriodMonths === 1 ? "Monthly" : 
                         vatSettings.vatPeriodMonths === 2 ? "Bi-Monthly" : "Bi-Annual"} VAT Return
                      </p>
                      <Button size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Prepare VAT201
                      </Button>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Previous Returns</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        View and manage previously submitted VAT returns
                      </p>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View History
                      </Button>
                    </Card>
                  </div>
                </div>
              )}
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
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Settings, Shield, AlertTriangle, Eye, EyeOff } from 'lucide-react';

const VATTypes: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activeCompany } = useQuery({
    queryKey: ['/api/companies/active']
  });

  const companyId = activeCompany?.id || 2;

  const { data: vatSettings } = useQuery({
    queryKey: ["/api/companies", companyId, "vat-settings"],
  });

  const { data: vatTypes } = useQuery({
    queryKey: ["/api/companies", companyId, "vat-types"],
    enabled: !!vatSettings?.isVatRegistered,
  });

  const manageVatTypeMutation = useMutation({
    mutationFn: async ({ vatTypeId, isActive }: { vatTypeId: number; isActive: boolean }) => {
      return await apiRequest(`/api/companies/${companyId}/vat-types/${vatTypeId}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive }),
      });
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
      return await apiRequest("/api/vat-types/seed", {
        method: 'POST',
        body: JSON.stringify({}),
      });
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">VAT Types</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage available VAT types for your company</p>
      </div>

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
                Enable VAT registration in the VAT Settings to access this feature.
              </p>
              <Button variant="outline" onClick={() => window.location.href = '/vat-settings'}>
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
    </div>
  );
};

export default VATTypes;
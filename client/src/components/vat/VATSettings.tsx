import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SA_VAT_TYPES } from "@shared/vat-utils";
import { Loader2, Save } from "lucide-react";

interface VATSettingsProps {
  companyId: number;
}

export function VATSettings({ companyId }: VATSettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: vatSettings, isLoading } = useQuery({
    queryKey: [`/api/companies/${companyId}/vat-settings`],
  });

  const [settings, setSettings] = useState({
    vatInclusivePricing: vatSettings?.vatInclusivePricing || false,
    defaultVatRate: vatSettings?.defaultVatRate || 15,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof settings) => {
      return apiRequest("PUT", `/api/companies/${companyId}/vat-settings`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/vat-settings`] });
      toast({
        title: "VAT Settings Updated",
        description: "Your VAT preferences have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update VAT settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(settings);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>VAT Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* VAT Inclusive Pricing */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>VAT Inclusive Pricing</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, all prices entered include VAT by default
              </p>
            </div>
            <Switch
              checked={settings.vatInclusivePricing}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, vatInclusivePricing: checked })
              }
            />
          </div>
        </div>

        {/* Default VAT Rate */}
        <div className="space-y-2">
          <Label>Default VAT Rate</Label>
          <Select
            value={settings.defaultVatRate.toString()}
            onValueChange={(value) =>
              setSettings({ ...settings, defaultVatRate: parseFloat(value) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select default VAT rate" />
            </SelectTrigger>
            <SelectContent>
              {SA_VAT_TYPES.map((type) => (
                <SelectItem key={type.code} value={type.rate.toString()}>
                  {type.name} ({type.rate}%)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            This rate will be applied by default to new items and transactions
          </p>
        </div>

        {/* VAT Calculation Method Info */}
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2">
          <h4 className="font-medium text-blue-900 dark:text-blue-100">
            VAT Calculation Methods
          </h4>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <p><strong>VAT Inclusive:</strong> VAT is already included in the price. VAT amount is extracted from the total.</p>
            <p><strong>VAT Exclusive:</strong> VAT is added on top of the base price.</p>
          </div>
        </div>

        {/* South African VAT Types */}
        <div className="space-y-2">
          <Label>Available VAT Types</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SA_VAT_TYPES.map((type) => (
              <div
                key={type.code}
                className="border rounded p-3 space-y-1"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{type.name}</span>
                  <span className="text-sm text-muted-foreground">{type.rate}%</span>
                </div>
                <p className="text-xs text-muted-foreground">{type.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="w-full"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save VAT Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
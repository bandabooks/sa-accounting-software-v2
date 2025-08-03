import { useState, useEffect } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { FileText, Shield, AlertTriangle, CheckCircle } from "lucide-react";

const vatSettingsSchema = z.object({
  isVatRegistered: z.boolean(),
  vatNumber: z.string().optional(),
  vatRegistrationDate: z.string().optional(),
  vatPeriodMonths: z.coerce.number().min(1).max(12),
  vatStartMonth: z.coerce.number().min(1).max(12),
  vatSubmissionDay: z.coerce.number().min(1).max(31),
  defaultVatCalculationMethod: z.enum(["inclusive", "exclusive"]).default("inclusive"),
});

type VatSettingsForm = z.infer<typeof vatSettingsSchema>;

interface VatStatusToggleProps {
  companyId: number;
  initialSettings: {
    isVatRegistered: boolean;
    vatNumber?: string;
    vatRegistrationDate?: string;
    vatPeriodMonths: number;
    vatStartMonth: number;
    vatSubmissionDay: number;
    defaultVatCalculationMethod?: "inclusive" | "exclusive";
  };
}

export function VatStatusToggle({ companyId, initialSettings }: VatStatusToggleProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to get fresh VAT settings
  const { data: freshVatSettings } = useQuery({
    queryKey: ["/api/companies", companyId, "vat-settings"],
    staleTime: 0, // Always fetch fresh data
  });

  const form = useForm<VatSettingsForm>({
    resolver: zodResolver(vatSettingsSchema),
    defaultValues: {
      isVatRegistered: initialSettings.isVatRegistered,
      vatNumber: initialSettings.vatNumber || "",
      vatRegistrationDate: initialSettings.vatRegistrationDate || "",
      vatPeriodMonths: initialSettings.vatPeriodMonths,
      vatStartMonth: initialSettings.vatStartMonth || 1,
      vatSubmissionDay: initialSettings.vatSubmissionDay,
      defaultVatCalculationMethod: initialSettings.defaultVatCalculationMethod || "inclusive",
    },
  });

  // Update form when fresh VAT settings are loaded
  useEffect(() => {
    if (freshVatSettings) {
      form.reset({
        isVatRegistered: (freshVatSettings as any).isVatRegistered || false,
        vatNumber: (freshVatSettings as any).vatNumber || "",
        vatRegistrationDate: (freshVatSettings as any).vatRegistrationDate || "",
        vatPeriodMonths: (freshVatSettings as any).vatPeriodMonths || 2,
        vatStartMonth: (freshVatSettings as any).vatStartMonth || 1,
        vatSubmissionDay: (freshVatSettings as any).vatSubmissionDay || 25,
        defaultVatCalculationMethod: (freshVatSettings as any).defaultVatCalculationMethod || "inclusive",
      });
    }
  }, [freshVatSettings, form]);

  const updateVatSettingsMutation = useMutation({
    mutationFn: async (data: VatSettingsForm) => {
      return await apiRequest(`/api/companies/${companyId}/vat-settings`, "PUT", data);
    },
    onSuccess: () => {
      toast({
        title: "VAT Settings Updated",
        description: "Company VAT registration settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "vat-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vat-types"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update VAT settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VatSettingsForm) => {
    updateVatSettingsMutation.mutate(data);
  };

  const isVatRegistered = form.watch("isVatRegistered");
  const vatPeriodMonths = form.watch("vatPeriodMonths");
  const vatStartMonth = form.watch("vatStartMonth");

  // Month names for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Calculate VAT period preview
  const calculateVatPeriods = (startMonth: number, periodMonths: number) => {
    const periods = [];
    let currentMonth = startMonth;
    
    for (let i = 0; i < 3; i++) { // Show first 3 periods
      const startMonthName = monthNames[currentMonth - 1];
      const endMonth = ((currentMonth - 1 + periodMonths - 1) % 12) + 1;
      const endMonthName = monthNames[endMonth - 1];
      
      periods.push(`${startMonthName}–${endMonthName}`);
      currentMonth = ((currentMonth - 1 + periodMonths) % 12) + 1;
    }
    
    return periods.join(", ") + "...";
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          VAT Registration Status
        </CardTitle>
        <CardDescription>
          Configure your company's VAT registration status and compliance settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="isVatRegistered"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="text-base font-medium">
                        VAT Registered Company
                      </FormLabel>
                      <FormDescription>
                        Enable VAT calculations, reporting, and compliance features
                      </FormDescription>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isVatRegistered && (
              <FormField
                control={form.control}
                name="defaultVatCalculationMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default VAT Calculation Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select calculation method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="inclusive">VAT Inclusive - VAT included in price (e.g., R115 includes R15 VAT)</SelectItem>
                        <SelectItem value="exclusive">VAT Exclusive - VAT added to price (e.g., R100 + R15 VAT = R115)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose how VAT should be calculated by default for new invoices and products. This can be overridden per invoice.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isVatRegistered && (
              <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">VAT Registration Details</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vatNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VAT Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="4123456789"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Your official SARS VAT registration number
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vatRegistrationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Date of VAT registration with SARS
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vatPeriodMonths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VAT Period</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select VAT period" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Monthly</SelectItem>
                            <SelectItem value="2">Bi-Monthly (2 months)</SelectItem>
                            <SelectItem value="6">Bi-Annual (6 months)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How often you submit VAT returns to SARS
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vatStartMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VAT Start Period</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select start month" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {monthNames.map((month, index) => (
                              <SelectItem key={index + 1} value={(index + 1).toString()}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Starting month of your VAT cycle
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vatSubmissionDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Submission Day</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="31"
                            placeholder="25"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Day of the month when VAT returns are due
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* VAT Period Preview */}
                {vatPeriodMonths && vatStartMonth && (
                  <div className="p-3 bg-white border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">VAT Cycle Preview</span>
                    </div>
                    <p className="text-sm text-blue-600">
                      <strong>Your VAT periods:</strong> {calculateVatPeriods(vatStartMonth, vatPeriodMonths)}
                    </p>
                    <p className="text-xs text-blue-500 mt-1">
                      First VAT Period: {monthNames[vatStartMonth - 1]} – {monthNames[((vatStartMonth - 1 + vatPeriodMonths - 1) % 12)]}
                    </p>
                  </div>
                )}
              </div>
            )}

            {!isVatRegistered && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Non-VAT Registered Company</span>
                </div>
                <p className="text-sm text-yellow-700">
                  VAT fields will be hidden from invoices, reports, and transactions. 
                  You can enable VAT registration at any time when your company reaches the VAT threshold.
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={updateVatSettingsMutation.isPending}
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                {updateVatSettingsMutation.isPending ? "Saving..." : "Save VAT Settings"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
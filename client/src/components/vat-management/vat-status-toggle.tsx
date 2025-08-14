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
  vatCategory: z.enum(["A", "B", "C", "D", "E"]).default("A"),
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
    vatCategory?: "A" | "B" | "C" | "D" | "E";
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
      vatCategory: initialSettings.vatCategory || "A",
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
        vatCategory: (freshVatSettings as any).vatCategory || "A",
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
    onSuccess: (data) => {
      const isEnabled = form.getValues('isVatRegistered');
      toast({
        title: "VAT Settings Saved Successfully!",
        description: isEnabled 
          ? "VAT registration is now enabled. SARS integration is now available below."
          : "VAT registration has been disabled for your company.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "vat-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vat-types"] });
    },
    onError: (error: any) => {
      console.error("VAT settings error:", error);
      
      let errorMessage = "Failed to update VAT settings. Please try again.";
      
      if (error?.message?.includes("Insufficient permissions")) {
        errorMessage = "You don't have permission to modify VAT settings. Please contact your administrator.";
      } else if (error?.message?.includes("Authentication failed")) {
        errorMessage = "Your session has expired. Please log in again.";
      }
      
      toast({
        title: "Unable to Save VAT Settings",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VatSettingsForm) => {
    updateVatSettingsMutation.mutate(data);
  };

  const isVatRegistered = form.watch("isVatRegistered");
  const vatPeriodMonths = form.watch("vatPeriodMonths");
  const vatCategory = form.watch("vatCategory");
  const vatStartMonth = form.watch("vatStartMonth");

  // SARS VAT Categories with full compliance information
  const SARS_VAT_CATEGORIES = [
    {
      value: "A",
      label: "Category A – Bi-Monthly (Even Months)",
      description: "Standard vendors. Submit every 2 months (Jan-Feb, Mar-Apr, etc.). Turnover under R30 million.",
      periodMonths: 2,
      submissionCycle: "Even months (Jan-Feb, Mar-Apr, May-Jun, Jul-Aug, Sep-Oct, Nov-Dec)"
    },
    {
      value: "B", 
      label: "Category B – Bi-Monthly (Odd Months)",
      description: "Submit every 2 months (Feb-Mar, Apr-May, etc.) based on registration cycle.",
      periodMonths: 2,
      submissionCycle: "Odd months (Feb-Mar, Apr-May, Jun-Jul, Aug-Sep, Oct-Nov, Dec-Jan)"
    },
    {
      value: "C",
      label: "Category C – Monthly",
      description: "Compulsory for vendors with taxable turnover over R30 million. Submit every month.",
      periodMonths: 1,
      submissionCycle: "Monthly (Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec)"
    },
    {
      value: "D",
      label: "Category D – Six-Monthly (Small-scale farmers only)",
      description: "Submit twice a year (Feb-Jul, Aug-Jan). Only for approved small-scale farmers.", 
      periodMonths: 6,
      submissionCycle: "Bi-annual (Feb-Jul, Aug-Jan)"
    },
    {
      value: "E",
      label: "Category E – Annual (Fixed property or occasional supply vendors)",
      description: "Submit once per year. Used by vendors who only occasionally supply fixed property.",
      periodMonths: 12,
      submissionCycle: "Annual (Jan-Dec)"
    }
  ];

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

  // Auto-update vatPeriodMonths when vatCategory changes
  useEffect(() => {
    const selectedCategory = SARS_VAT_CATEGORIES.find(cat => cat.value === vatCategory);
    if (selectedCategory && selectedCategory.periodMonths !== vatPeriodMonths) {
      form.setValue('vatPeriodMonths', selectedCategory.periodMonths);
    }
  }, [vatCategory, vatPeriodMonths, form]);

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
                    name="vatCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          SARS VAT Category
                          <div className="group relative">
                            <AlertTriangle className="h-4 w-4 text-blue-500 cursor-help" />
                            <div className="invisible group-hover:visible absolute left-6 top-0 w-80 p-3 bg-gray-900 text-white text-xs rounded-md shadow-lg z-10">
                              <strong>SARS VAT Categories:</strong><br/>
                              • Category A/B: Bi-Monthly (Standard vendors under R30m)<br/>
                              • Category C: Monthly (Mandatory over R30m turnover)<br/>
                              • Category D: Bi-Annual (Small farmers only)<br/>
                              • Category E: Annual (Fixed property vendors)
                            </div>
                          </div>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select SARS VAT category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="w-full max-w-md">
                            {SARS_VAT_CATEGORIES.map((category) => {
                              // Background colors for each category
                              const categoryColors = {
                                A: "#e8f4fd", // Light blue
                                B: "#f7f7f7", // Light gray  
                                C: "#e7f8ef", // Light green
                                D: "#fffbe6", // Light yellow
                                E: "#f4f0fa"  // Light lavender
                              };
                              
                              return (
                                <SelectItem 
                                  key={category.value} 
                                  value={category.value}
                                  className="p-0 mb-1 rounded-md overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all duration-200"
                                >
                                  <div 
                                    className="w-full p-3 border-l-4 border-transparent hover:border-blue-600 transition-all duration-200"
                                    style={{ 
                                      backgroundColor: categoryColors[category.value as keyof typeof categoryColors]
                                    }}
                                  >
                                    <span className="font-bold text-gray-800 text-sm">
                                      {category.label}
                                    </span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Official SARS VAT submission category based on your turnover and business type
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

                {/* Enhanced SARS VAT Category Preview */}
                {vatCategory && (
                  <div className={`
                    p-4 rounded-lg border-l-4 transition-all duration-300
                    ${vatCategory === 'A' ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-blue-500 border border-blue-200' : ''}
                    ${vatCategory === 'B' ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-l-gray-500 border border-gray-200' : ''}
                    ${vatCategory === 'C' ? 'bg-gradient-to-r from-green-50 to-green-100 border-l-green-500 border border-green-200' : ''}
                    ${vatCategory === 'D' ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-yellow-500 border border-yellow-200' : ''}
                    ${vatCategory === 'E' ? 'bg-gradient-to-r from-purple-50 to-purple-100 border-l-purple-500 border border-purple-200' : ''}
                  `}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`
                        inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-white rounded-full shadow-sm
                        ${vatCategory === 'A' ? 'bg-blue-500' : ''}
                        ${vatCategory === 'B' ? 'bg-gray-500' : ''}
                        ${vatCategory === 'C' ? 'bg-green-500' : ''}
                        ${vatCategory === 'D' ? 'bg-yellow-500' : ''}
                        ${vatCategory === 'E' ? 'bg-purple-500' : ''}
                      `}>
                        {vatCategory}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-semibold text-gray-900">Selected Category</span>
                        </div>
                      </div>
                    </div>
                    
                    {(() => {
                      const selectedCategory = SARS_VAT_CATEGORIES.find(cat => cat.value === vatCategory);
                      return selectedCategory ? (
                        <div className="space-y-3">
                          <div className="bg-white/80 p-3 rounded-md border border-white/50">
                            <h4 className="font-bold text-gray-900 mb-1">
                              {selectedCategory.label}
                            </h4>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {selectedCategory.description}
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-white/80 p-3 rounded-md border border-white/50">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-blue-600">🔄</span>
                                <span className="text-xs font-semibold text-gray-700">SUBMISSION CYCLE</span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {selectedCategory.submissionCycle}
                              </p>
                            </div>
                            
                            {vatStartMonth && (
                              <div className="bg-white/80 p-3 rounded-md border border-white/50">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-green-600">📅</span>
                                  <span className="text-xs font-semibold text-gray-700">YOUR VAT PERIODS</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {calculateVatPeriods(vatStartMonth, selectedCategory.periodMonths)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null;
                    })()}
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
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Shield className="h-4 w-4" />
                {updateVatSettingsMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving VAT Settings...
                  </>
                ) : (
                  "Save VAT Settings"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
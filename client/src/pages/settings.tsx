import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building, DollarSign, Mail, Bell, Save, Globe, Upload, X, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { SuccessModal } from "@/components/ui/success-modal";
import { useSuccessModal } from "@/hooks/useSuccessModal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { CompanySettings } from "@shared/schema";
import { VatStatusToggle } from "@/components/vat-management/vat-status-toggle";

const companySettingsSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyEmail: z.string().email("Valid email is required").optional().or(z.literal("")),
  companyPhone: z.string().optional(),
  companyAddress: z.string().optional(),
  vatNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  primaryCurrency: z.string().default("ZAR"),
  invoicePrefix: z.string().default("INV"),
  estimatePrefix: z.string().default("EST"),
  paymentTerms: z.string().optional(),
  autoEmailReminders: z.boolean().default(false),
  fiscalYearStart: z.string().default("2025-01-01"),
  taxRate: z.string().default("15.00"),
});

type CompanySettingsFormData = z.infer<typeof companySettingsSchema>;

const currencies = [
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
];

export default function Settings() {
  const { toast } = useToast();
  const successModal = useSuccessModal();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("company");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: settings, isLoading } = useQuery<CompanySettings>({
    queryKey: ["/api/settings/company"],
  });

  const form = useForm<CompanySettingsFormData>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      companyName: "",
      companyEmail: "",
      companyPhone: "",
      companyAddress: "",
      vatNumber: "",
      registrationNumber: "",
      primaryCurrency: "ZAR",
      invoicePrefix: "INV",
      estimatePrefix: "EST",
      paymentTerms: "",
      autoEmailReminders: false,
      fiscalYearStart: "2025-01-01",
      taxRate: "15.00",
    },
  });

  // Reset form when settings are loaded
  useEffect(() => {
    if (settings && !isLoading) {
      form.reset({
        companyName: settings?.companyName || "",
        companyEmail: settings?.companyEmail || "",
        companyPhone: settings?.companyPhone || "",
        companyAddress: settings?.companyAddress || "",
        vatNumber: settings?.vatNumber || "",
        registrationNumber: settings?.registrationNumber || "",
        primaryCurrency: settings?.primaryCurrency || "ZAR",
        invoicePrefix: settings?.invoicePrefix || "INV",
        estimatePrefix: settings?.estimatePrefix || "EST",
        paymentTerms: settings?.paymentTerms || "",
        autoEmailReminders: settings?.autoEmailReminders || false,
        fiscalYearStart: settings?.fiscalYearStart || "2025-01-01",
        taxRate: settings?.taxRate || "15.00",
      });
      
      // Set logo preview if exists
      if (settings?.logo) {
        setLogoPreview(settings.logo);
      }
    }
  }, [settings, isLoading, form]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: CompanySettingsFormData) => {
      await apiRequest("/api/settings/company", "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/company"] });
      successModal.showSuccess({
        title: "Settings Updated Successfully",
        description: "Your company settings have been saved and are now active across the platform.",
        confirmText: "Continue"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logo upload mutation
  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await fetch('/api/settings/company/logo', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'X-Session-Token': localStorage.getItem('sessionToken') || '',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload logo');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setLogoPreview(data.logoUrl);
      queryClient.invalidateQueries({ queryKey: ["/api/settings/company"] });
      toast({
        title: "Success",
        description: "Company logo uploaded successfully!",
      });
      setIsUploadingLogo(false);
      setLogoFile(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload logo",
        variant: "destructive",
      });
      setIsUploadingLogo(false);
    },
  });

  const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(png|jpe?g|gif)$/)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PNG, JPG, or GIF image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }

    setLogoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = () => {
    if (logoFile) {
      setIsUploadingLogo(true);
      uploadLogoMutation.mutate(logoFile);
    }
  };

  const handleLogoRemove = () => {
    setLogoPreview(null);
    setLogoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = (data: CompanySettingsFormData) => {
    updateSettingsMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Company Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Configure your company information and system preferences</p>
        {settings?.companyName && (
          <div className="mt-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-md inline-block">
            <span className="text-sm text-blue-800 font-medium">Current Company: {settings.companyName}</span>
          </div>
        )}
      </div>

      <Form {...form}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="company">Company Info</TabsTrigger>
          <TabsTrigger value="vat">VAT Settings</TabsTrigger>
          <TabsTrigger value="currency">Currency</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="sars">SARS Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                Update your company details and registration information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Company Logo Upload */}
                  <div className="flex flex-col space-y-4">
                    <Label>Company Logo</Label>
                    <div className="flex items-center space-x-4">
                      <div className="relative w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                        {logoPreview ? (
                          <>
                            <img 
                              src={logoPreview} 
                              alt="Company Logo" 
                              className="w-full h-full object-cover"
                            />
                            {logoFile && (
                              <button
                                type="button"
                                onClick={handleLogoRemove}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </>
                        ) : (
                          <Image className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/gif"
                          onChange={handleLogoSelect}
                          className="hidden"
                          id="logo-upload"
                        />
                        <div className="flex items-center space-x-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingLogo}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {logoFile ? 'Change Logo' : 'Upload Logo'}
                          </Button>
                          {logoFile && (
                            <Button
                              type="button"
                              size="sm"
                              onClick={handleLogoUpload}
                              disabled={isUploadingLogo}
                            >
                              {isUploadingLogo ? 'Uploading...' : 'Save Logo'}
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Upload a PNG, JPG, or GIF file (max 2MB, recommended: 400x400px)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter company name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companyEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter company email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companyPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter company phone" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vatNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>VAT Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter VAT number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="registrationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter registration number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="taxRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Tax Rate (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="15.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="companyAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter company address"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateSettingsMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vat" className="space-y-6">
          <VatStatusToggle 
            companyId={4} // TODO: Get from active company context
            initialSettings={{
              isVatRegistered: false,
              vatNumber: settings?.vatNumber || "",
              vatRegistrationDate: undefined,
              vatPeriodMonths: 2,
              vatSubmissionDay: 25
            }}
          />
        </TabsContent>

        <TabsContent value="currency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Currency Settings
              </CardTitle>
              <CardDescription>
                Configure your primary currency and multi-currency support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="primaryCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Currency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select primary currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{currency.symbol}</Badge>
                                <span>{currency.name} ({currency.code})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-2">Multi-Currency Support</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Additional currencies for international transactions (Coming Soon)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currencies.slice(0, 4).map((currency) => (
                      <Badge key={currency.code} variant="secondary">
                        {currency.symbol} {currency.code}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => form.handleSubmit(onSubmit)()}
                    disabled={updateSettingsMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Currency Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Document Settings
              </CardTitle>
              <CardDescription>
                Configure document prefixes and fiscal year settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="invoicePrefix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Prefix</FormLabel>
                        <FormControl>
                          <Input placeholder="INV" {...field} />
                        </FormControl>
                        <FormDescription>
                          Prefix for invoice numbers (e.g., INV-2025-001)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estimatePrefix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimate Prefix</FormLabel>
                        <FormControl>
                          <Input placeholder="EST" {...field} />
                        </FormControl>
                        <FormDescription>
                          Prefix for estimate numbers (e.g., EST-2025-001)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fiscalYearStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fiscal Year Start</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>
                          Start date of your fiscal year for reporting
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Payment Terms</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter default payment terms (e.g., Payment due within 30 days)"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        These terms will appear on invoices and estimates
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => form.handleSubmit(onSubmit)()}
                    disabled={updateSettingsMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {updateSettingsMutation.isPending ? "Saving..." : "Save Document Settings"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Configure automated email reminders and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="autoEmailReminders"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Automated Email Reminders
                        </FormLabel>
                        <FormDescription>
                          Send automatic payment reminders to customers
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-2">Reminder Schedule</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Automatic reminders will be sent at these intervals:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">7 days</Badge>
                      <span className="text-sm">before invoice due date</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">3 days</Badge>
                      <span className="text-sm">before invoice due date</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">1 day</Badge>
                      <span className="text-sm">before invoice due date</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Overdue</Badge>
                      <span className="text-sm">daily until paid</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => form.handleSubmit(onSubmit)()}
                    disabled={updateSettingsMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {updateSettingsMutation.isPending ? "Saving..." : "Save Notification Settings"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sars" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                SARS Integration Settings
              </CardTitle>
              <CardDescription>
                Configure South African Revenue Service API integration for automated VAT submissions and compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Connection Status</h3>
                  <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="font-medium">Not Connected</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-2">
                      SARS integration is not configured. Set up your credentials to enable automated submissions.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Available Services</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm font-medium">VAT201 Returns</span>
                      <Badge variant="outline">Pending Setup</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm font-medium">EMP501/502</span>
                      <Badge variant="outline">Pending Setup</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm font-medium">ITR12/14</span>
                      <Badge variant="outline">Pending Setup</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-lg">API Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sars-client-id">Client ID</Label>
                    <Input 
                      id="sars-client-id" 
                      type="password" 
                      placeholder="Enter SARS Client ID"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sars-client-secret">Client Secret</Label>
                    <Input 
                      id="sars-client-secret" 
                      type="password" 
                      placeholder="Enter SARS Client Secret"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sars-vat-vendor">VAT Vendor Number</Label>
                    <Input 
                      id="sars-vat-vendor" 
                      placeholder="Enter VAT Vendor Number"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sars-environment">Environment</Label>
                    <Select disabled>
                      <SelectTrigger>
                        <SelectValue placeholder="Select environment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sandbox">Sandbox</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-blue-900">SARS API Credentials Required</h4>
                  <p className="text-sm text-blue-700">
                    Contact SARS or your tax advisor to obtain API credentials for eFiling integration.
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Test Connection
                </Button>
              </div>

              <div className="flex justify-end">
                <Button disabled className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save SARS Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </Form>

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={successModal.hideSuccess}
        title={successModal.modalOptions.title}
        description={successModal.modalOptions.description}
        confirmText={successModal.modalOptions.confirmText}
      />
    </div>
  );
}
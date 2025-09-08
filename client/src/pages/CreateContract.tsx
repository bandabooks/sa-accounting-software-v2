import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, FileText, Users, Calendar, DollarSign, Save, Send, Eye, Copy, Settings, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const contractSchema = z.object({
  templateId: z.string().min(1, "Please select a template"),
  customerId: z.string().min(1, "Please select a customer"),
  subject: z.string().min(1, "Subject is required"),
  contractValue: z.string().optional(),
  contractType: z.string().min(1, "Contract type is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  projectId: z.string().optional(),
  description: z.string().optional(),
  hideFromCustomer: z.boolean().default(false),
  trash: z.boolean().default(false),
});

type ContractForm = z.infer<typeof contractSchema>;

interface ContractTemplate {
  id: number;
  name: string;
  version: number;
  bodyMd: string;
  fields: string | string[];
  servicePackage: string;
}

interface Customer {
  id: number;
  name: string;
  company?: string;
  email: string;
}

export default function CreateContract() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [mergeFields, setMergeFields] = useState<Record<string, string>>({});

  const form = useForm<ContractForm>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      templateId: "",
      customerId: "",
      subject: "",
      contractValue: "",
      contractType: "",
      startDate: "",
      endDate: "",
      projectId: "",
      description: "",
      hideFromCustomer: false,
      trash: false,
    },
  });

  // Fetch templates
  const { data: templatesData, isLoading: isLoadingTemplates, error: templatesError } = useQuery({
    queryKey: ["/api/contracts/templates"],
    retry: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Fetch customers  
  const { data: customersData, isLoading: isLoadingCustomers, error: customersError } = useQuery({
    queryKey: ["/api/customers"],
    retry: 1,
  });

  // Ensure data is array
  const templates = Array.isArray(templatesData) ? templatesData : [];
  const customers = Array.isArray(customersData) ? customersData : [];

  // Create contract mutation
  const createContractMutation = useMutation({
    mutationFn: async (data: ContractForm) => {
      const payload = {
        ...data,
        templateId: parseInt(data.templateId),
        customerId: parseInt(data.customerId),
        projectId: data.projectId ? parseInt(data.projectId) : undefined,
        contractValue: data.contractValue ? parseFloat(data.contractValue) : undefined,
        mergeFields,
      };
      return await apiRequest("/api/contracts", "POST", payload);
    },
    onSuccess: (response: any) => {
      toast({
        title: "Contract Created",
        description: "Your contract has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      navigate(`/contracts/${response.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create contract",
        variant: "destructive",
      });
    },
  });

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((t: ContractTemplate) => t.id.toString() === templateId);
    setSelectedTemplate(template || null);
    
    if (template) {
      // Initialize merge fields for the template
      const fields = typeof template.fields === 'string' ? JSON.parse(template.fields) : (Array.isArray(template.fields) ? template.fields : []);
      const initialFields: Record<string, string> = {};
      fields.forEach((field: string) => {
        initialFields[field] = '';
      });
      setMergeFields(initialFields);
      
      // Set contract type based on template service package
      const packageToType: Record<string, string> = {
        'basic': 'bookkeeping',
        'standard': 'engagement_letter',
        'premium': 'advisory',
        'enterprise': 'other',
        'tax_compliance': 'tax_compliance',
        'vat_services': 'vat_services',
        'audit': 'audit',
        'payroll': 'payroll'
      };
      form.setValue("contractType", packageToType[template.servicePackage] || "other");
    }
  };

  const onSubmit = (data: ContractForm) => {
    createContractMutation.mutate(data);
  };

  const contractTypes = [
    { value: "engagement_letter", label: "Engagement Letters" },
    { value: "vat_services", label: "VAT Practitioner Services" },
    { value: "tax_compliance", label: "Tax Compliance" },
    { value: "financial_statements", label: "Annual Financial Statements" },
    { value: "advisory", label: "Advisory Services" },
    { value: "payroll", label: "Payroll Services" },
    { value: "audit", label: "Audit Services" },
    { value: "bookkeeping", label: "Bookkeeping Services" },
    { value: "other", label: "Other Professional Services" }
  ];

  // Debug templates
  console.log('Templates data:', templatesData);
  console.log('Templates array:', templates);
  console.log('Loading templates:', isLoadingTemplates);
  console.log('Templates error:', templatesError);

  // Show loading state while data is being fetched
  if (isLoadingTemplates || isLoadingCustomers) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading contract data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if templates failed to load
  if (templatesError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Failed to Load Templates</h1>
          <p className="text-gray-600 mb-4">Could not load contract templates. Please try refreshing the page.</p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Compact Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/contracts")}
          className="p-2 h-8 w-8"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Create New Contract</h1>
          <p className="text-sm text-gray-600">Professional engagement letter</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Contract Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Compact Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        <span className="text-red-500">*</span>
                        Customer
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingCustomers ? (
                            <SelectItem value="loading" disabled>
                              Loading customers...
                            </SelectItem>
                          ) : customers.length === 0 ? (
                            <SelectItem value="no-customers" disabled>
                              No customers found.
                            </SelectItem>
                          ) : (
                            customers.map((customer: Customer) => (
                              <SelectItem key={customer.id} value={customer.id.toString()}>
                                {customer.name} {customer.company && `(${customer.company})`}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        <span className="text-red-500">*</span>
                        Subject
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter contract subject" 
                          className="h-9" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <FormField
                  control={form.control}
                  name="contractValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Contract Value</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">R</span>
                          <Input 
                            placeholder="0.00" 
                            className="pl-8 h-9" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contractType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Contract Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contractTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        <span className="text-red-500">*</span>
                        Start Date
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          className="h-9"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">End Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          className="h-9" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">

                <FormField
                  control={form.control}
                  name="templateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        <span className="text-red-500">*</span>
                        Contract Template
                      </FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        handleTemplateChange(value);
                      }} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select template" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingTemplates ? (
                            <SelectItem value="loading" disabled>
                              Loading templates...
                            </SelectItem>
                          ) : templates.length === 0 ? (
                            <SelectItem value="no-templates" disabled>
                              No templates found.
                            </SelectItem>
                          ) : (
                            templates.map((template: ContractTemplate) => (
                              <SelectItem key={template.id} value={template.id.toString()}>
                                {template.name} (v{template.version})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={3}
                          placeholder="Additional contract details and terms..."
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Options Row */}
              <div className="flex gap-6 pt-2">
                <FormField
                  control={form.control}
                  name="hideFromCustomer"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Hide from customer
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trash"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Mark as draft
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Template Fields */}
          {selectedTemplate && (
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Template Details
                </CardTitle>
                <CardDescription className="text-sm">
                  Fill in the merge fields for <span className="font-medium">{selectedTemplate.name}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const fields = typeof selectedTemplate.fields === 'string' 
                      ? JSON.parse(selectedTemplate.fields) 
                      : (Array.isArray(selectedTemplate.fields) ? selectedTemplate.fields : []);
                    
                    return Array.isArray(fields) && fields.length > 0 ? 
                      fields.map((field: string) => (
                        <div key={field} className="space-y-2">
                          <Label htmlFor={field} className="text-sm font-medium">
                            {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Label>
                          <Input
                            id={field}
                            className="h-9"
                            value={mergeFields[field] || ''}
                            onChange={(e) => setMergeFields(prev => ({
                              ...prev,
                              [field]: e.target.value
                            }))}
                            placeholder={`Enter ${field.replace(/_/g, ' ')}`}
                          />
                        </div>
                      )) : (
                        <div className="col-span-2 text-center py-4">
                          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">This template has no merge fields.</p>
                        </div>
                      );
                  })()
                  }
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">
              {selectedTemplate ? (
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Template selected: {selectedTemplate.name}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Select a template to continue
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/contracts")}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="outline"
                size="sm"
                disabled={!selectedTemplate}
                className="hidden md:inline-flex"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button 
                type="submit" 
                size="sm"
                disabled={createContractMutation.isPending || !form.formState.isValid}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createContractMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Contract
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
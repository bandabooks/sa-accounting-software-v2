import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, FileText, Users, Calendar, DollarSign, Save, Send, Eye, Copy, Settings } from "lucide-react";
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
  clientId: z.string().min(1, "Please select a client"),
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

interface Client {
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
      hideFromCustomer: false,
      trash: false,
    },
  });

  // Fetch templates
  const { data: templatesData, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["/api/contracts/templates"],
  });

  // Fetch clients  
  const { data: clientsData, isLoading: isLoadingClients } = useQuery({
    queryKey: ["/api/customers"],
  });

  // Ensure data is array
  const templates = Array.isArray(templatesData) ? templatesData : [];
  const clients = Array.isArray(clientsData) ? clientsData : [];

  // Debug logging
  console.log('Templates loaded:', templates.length, templates);
  console.log('Clients loaded:', clients.length, clients);

  // Create contract mutation
  const createContractMutation = useMutation({
    mutationFn: async (data: ContractForm) => {
      return await apiRequest("/api/contracts", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Contract Created",
        description: "Your contract has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      navigate("/contracts");
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
    const contractData = {
      ...data,
      templateId: parseInt(data.templateId),
      clientId: parseInt(data.clientId),
      projectId: data.projectId ? parseInt(data.projectId) : null,
      mergeData: mergeFields,
    };
    
    createContractMutation.mutate(contractData);
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

  // Show loading state while data is being fetched
  if (isLoadingTemplates || isLoadingClients) {
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

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/contracts")}
          className="p-2"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contract Information</h1>
          <p className="text-gray-600">Create a new professional engagement contract</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Contract Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Options Row */}
              <div className="flex gap-4">
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
                        Trash
                      </FormLabel>
                    </FormItem>
                  )}
                />
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
              </div>

              {/* Customer Selection */}
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <span className="text-red-500">*</span>
                      <Users className="w-4 h-4" />
                      Customer
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select and begin typing" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.length === 0 ? (
                          <SelectItem value="no-clients" disabled>
                            No customers found. Please add a customer first.
                          </SelectItem>
                        ) : (
                          clients.map((client: Client) => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.name} {client.company && `(${client.company})`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Subject */}
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <span className="text-red-500">*</span>
                      Subject
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contract subject" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contract Value */}
              <FormField
                control={form.control}
                name="contractValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Value</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input 
                          placeholder="0.00" 
                          className="pl-10" 
                          {...field} 
                        />
                        <span className="absolute right-3 top-3 text-sm text-gray-500">R</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contract Type */}
              <FormField
                control={form.control}
                name="contractType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Nothing selected" />
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
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Types
                    </Button>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <span className="text-red-500">*</span>
                        <Calendar className="w-4 h-4" />
                        Start Date
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          placeholder="06-09-2025"
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
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Template Selection */}
              <FormField
                control={form.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Template</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      handleTemplateChange(value);
                    }} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a professional template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {templates.length === 0 ? (
                          <SelectItem value="no-templates" disabled>
                            No templates found. Please create a template first.
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

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={4}
                        placeholder="Additional contract details and terms..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Template Fields */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle>Template Merge Fields</CardTitle>
                <CardDescription>
                  Fill in the details for {selectedTemplate.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.isArray(selectedTemplate.fields) ? 
                    selectedTemplate.fields.map((field) => (
                      <div key={field} className="space-y-2">
                        <Label htmlFor={field}>{field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
                        <Input
                          id={field}
                          value={mergeFields[field] || ''}
                          onChange={(e) => setMergeFields(prev => ({
                            ...prev,
                            [field]: e.target.value
                          }))}
                          placeholder={`Enter ${field.replace(/_/g, ' ')}`}
                        />
                      </div>
                    )) : (
                      <p className="text-gray-500 col-span-2">No merge fields available for this template.</p>
                    )
                  }
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/contracts")}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="outline"
              disabled={!selectedTemplate}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button 
              type="submit" 
              disabled={createContractMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {createContractMutation.isPending ? "Creating..." : "Save"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
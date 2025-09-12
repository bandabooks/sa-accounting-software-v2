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
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const contractSchema = z.object({
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

  const form = useForm<ContractForm>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
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


  const { companyId } = useCompany();

  // Fetch customers  
  const { data: customersData, isLoading: isLoadingCustomers, error: customersError } = useQuery({
    queryKey: ["/api/customers", companyId],
    retry: 1,
    enabled: !!companyId
  });

  // Ensure data is array
  const customers = Array.isArray(customersData) ? customersData : [];

  // Create contract mutation
  const createContractMutation = useMutation({
    mutationFn: async (data: ContractForm) => {
      const payload = {
        ...data,
        customerId: parseInt(data.customerId),
        projectId: data.projectId ? parseInt(data.projectId) : undefined,
        contractValue: data.contractValue ? parseFloat(data.contractValue) : undefined,
      };
      const response = await apiRequest("/api/contracts", "POST", payload);
      return await response.json();
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


  // Show loading state while data is being fetched
  if (isLoadingCustomers) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading customers...</p>
          </div>
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


          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Contract ready to create
              </span>
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
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  FileText, 
  Edit3, 
  Copy, 
  Trash2, 
  Eye, 
  Download,
  Search,
  Filter,
  MoreHorizontal,
  Settings,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  servicePackage: z.string().min(1, "Service package is required"),
  bodyMd: z.string().min(50, "Template content must be at least 50 characters"),
  fields: z.string().optional(),
});

type TemplateForm = z.infer<typeof templateSchema>;

interface ContractTemplate {
  id: number;
  name: string;
  version: number;
  bodyMd: string;
  fields: string[];
  servicePackage: string;
  createdAt: string;
  updatedAt: string;
}

const servicePackages = [
  { value: "basic", label: "Basic Services", description: "Essential bookkeeping and compliance" },
  { value: "standard", label: "Standard Services", description: "Comprehensive accounting and tax" },
  { value: "premium", label: "Premium Services", description: "Full professional advisory" },
  { value: "enterprise", label: "Enterprise Services", description: "Custom enterprise solutions" }
];

const packageColors = {
  basic: "bg-blue-100 text-blue-800 border-blue-200",
  standard: "bg-green-100 text-green-800 border-green-200",
  premium: "bg-purple-100 text-purple-800 border-purple-200",
  enterprise: "bg-orange-100 text-orange-800 border-orange-200"
};

export default function ContractTemplates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null);

  const form = useForm<TemplateForm>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      servicePackage: "",
      bodyMd: "",
      fields: "",
    },
  });

  // Fetch templates
  const { data: templatesResponse = [], isLoading } = useQuery({
    queryKey: ["/api/contracts/templates"],
    queryFn: () => apiRequest("/api/contracts/templates"),
  });

  const templates = Array.isArray(templatesResponse) ? templatesResponse : [];

  // Auto-seed templates when no templates exist
  useEffect(() => {
    if (!isLoading && templates.length === 0) {
      // Automatically add South African professional templates
      seedTemplatesMutation.mutate();
    }
  }, [templates.length, isLoading, seedTemplatesMutation]);

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/contracts/templates", "POST", data),
    onSuccess: () => {
      toast({
        title: "Template Created",
        description: "Your contract template has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts/templates"] });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create template",
        variant: "destructive",
      });
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/contracts/templates/${id}`, "DELETE"),
    onSuccess: () => {
      toast({
        title: "Template Deleted",
        description: "The template has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts/templates"] });
    },
  });

  // Seed South African professional templates
  const seedTemplatesMutation = useMutation({
    mutationFn: () => apiRequest("/api/contracts/templates/seed", "POST"),
    onSuccess: () => {
      toast({
        title: "Templates Added",
        description: "South African professional engagement letter templates have been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts/templates"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add templates",
        variant: "destructive",
      });
    },
  });

  // Filter templates
  const filteredTemplates = templates.filter((template: ContractTemplate) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPackage = selectedPackage === "all" || template.servicePackage === selectedPackage;
    return matchesSearch && matchesPackage;
  });

  const onSubmit = (data: TemplateForm) => {
    const templateData = {
      ...data,
      fields: data.fields ? data.fields.split(',').map(f => f.trim()).filter(f => f) : [],
    };
    createTemplateMutation.mutate(templateData);
  };

  const handleEdit = (template: ContractTemplate) => {
    setEditingTemplate(template);
    form.setValue("name", template.name);
    form.setValue("servicePackage", template.servicePackage);
    form.setValue("bodyMd", template.bodyMd);
    form.setValue("fields", Array.isArray(template.fields) ? template.fields.join(', ') : '');
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (template: ContractTemplate) => {
    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      deleteTemplateMutation.mutate(template.id);
    }
  };

  const handleDuplicate = (template: ContractTemplate) => {
    form.setValue("name", `${template.name} (Copy)`);
    form.setValue("servicePackage", template.servicePackage);
    form.setValue("bodyMd", template.bodyMd);
    form.setValue("fields", Array.isArray(template.fields) ? template.fields.join(', ') : '');
    setIsCreateDialogOpen(true);
  };

  const statistics = {
    total: templates.length,
    basic: templates.filter((t: ContractTemplate) => t.servicePackage === "basic").length,
    standard: templates.filter((t: ContractTemplate) => t.servicePackage === "standard").length,
    premium: templates.filter((t: ContractTemplate) => t.servicePackage === "premium").length,
    enterprise: templates.filter((t: ContractTemplate) => t.servicePackage === "enterprise").length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
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
          <h1 className="text-3xl font-bold text-gray-900">Contract Templates</h1>
          <p className="text-gray-600 mt-1">
            Manage professional engagement letter templates
          </p>
        </div>
        <div className="ml-auto">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? "Edit Template" : "Create New Template"}
                </DialogTitle>
                <DialogDescription>
                  Create or edit a professional engagement letter template with merge fields
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Standard Engagement Letter" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="servicePackage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Package</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select package level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {servicePackages.map((pkg) => (
                                <SelectItem key={pkg.value} value={pkg.value}>
                                  <div className="flex flex-col">
                                    <span>{pkg.label}</span>
                                    <span className="text-xs text-gray-500">{pkg.description}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="fields"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Merge Fields</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., client_name, date, monthly_fee, start_date (comma-separated)" 
                            {...field} 
                          />
                        </FormControl>
                        <p className="text-sm text-gray-500">
                          Enter merge field names separated by commas. These will be available as {"{{field_name}}"} in your template.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bodyMd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Content (Markdown)</FormLabel>
                        <FormControl>
                          <Textarea 
                            rows={12}
                            placeholder="# ENGAGEMENT LETTER
                            
Dear {{client_name}},

We are pleased to confirm our engagement to provide professional services..."
                            {...field} 
                          />
                        </FormControl>
                        <p className="text-sm text-gray-500">
                          Use Markdown formatting and merge fields like {"{{client_name}}"}, {"{{date}}"}, etc.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        setEditingTemplate(null);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createTemplateMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {createTemplateMutation.isPending ? "Saving..." : editingTemplate ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
              <p className="text-sm text-gray-600">Total Templates</p>
            </div>
          </CardContent>
        </Card>
        {servicePackages.map((pkg) => (
          <Card key={pkg.value}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {statistics[pkg.value as keyof typeof statistics]}
                </p>
                <p className="text-sm text-gray-600">{pkg.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 max-w-sm"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Packages</SelectItem>
                  {servicePackages.map((pkg) => (
                    <SelectItem key={pkg.value} value={pkg.value}>
                      {pkg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Templates Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Template Name</TableHead>
                  <TableHead className="font-semibold">Service Package</TableHead>
                  <TableHead className="font-semibold">Version</TableHead>
                  <TableHead className="font-semibold">Merge Fields</TableHead>
                  <TableHead className="font-semibold">Created</TableHead>
                  <TableHead className="font-semibold">Updated</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredTemplates.length > 0 ? (
                  filteredTemplates.map((template: ContractTemplate) => (
                    <TableRow key={template.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{template.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={packageColors[template.servicePackage as keyof typeof packageColors]}>
                          {servicePackages.find(p => p.value === template.servicePackage)?.label || template.servicePackage}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">v{template.version}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {Array.isArray(template.fields) ? template.fields.length : 0} fields
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(template.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(template.updatedAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(template)}>
                              <Edit3 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(template)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        {seedTemplatesMutation.isPending ? (
                          <>
                            <div className="w-8 h-8 mb-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              Loading Professional Templates...
                            </h3>
                            <p className="text-gray-600">
                              Adding South African engagement letter templates for Tax Practitioners and Accountants
                            </p>
                          </>
                        ) : (
                          <>
                            <FileText className="w-12 h-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              No templates found
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Create your first professional template to get started
                            </p>
                            <Button onClick={() => setIsCreateDialogOpen(true)}>
                              <Plus className="w-4 h-4 mr-2" />
                              Create Template
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
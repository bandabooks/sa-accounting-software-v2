import { useState } from "react";
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
  ChevronLeft,
  Award,
  Shield,
  BookOpen,
  Calculator,
  Building2,
  Users,
  TrendingUp,
  FileCheck,
  Scale,
  Briefcase,
  Globe,
  Star,
  CheckCircle2
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
import { professionalCategories, categoryColors, complianceColors } from "@shared/professionalCategories";

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  servicePackage: z.string().min(1, "Professional category is required"),
  bodyMd: z.string().min(50, "Template content must be at least 50 characters"),
  fields: z.string().optional(),
  category: z.string().optional(),
  compliance: z.array(z.string()).optional(),
  tags: z.string().optional(),
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


export default function ContractTemplates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCompliance, setSelectedCompliance] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<ContractTemplate | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState<"grid" | "table">("grid");

  const form = useForm<TemplateForm>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      servicePackage: "",
      bodyMd: "",
      fields: "",
      category: "",
      compliance: [],
      tags: "",
    },
  });

  // Fetch templates
  const { data: templatesResponse = [], isLoading, error: templatesError } = useQuery({
    queryKey: ["/api/contracts/templates"],
    retry: 3,
  });

  const templates = Array.isArray(templatesResponse) ? templatesResponse : [];

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
    const matchesCategory = selectedCategory === "all" || template.servicePackage === selectedCategory;
    
    // Real compliance filtering logic
    const matchesCompliance = selectedCompliance === "all" || (() => {
      const categoryData = professionalCategories.find(cat => cat.value === template.servicePackage);
      return categoryData?.compliance.includes(selectedCompliance) || false;
    })();
    
    return matchesSearch && matchesCategory && matchesCompliance;
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

  const handleView = (template: ContractTemplate) => {
    setViewingTemplate(template);
    setIsViewDialogOpen(true);
  };

  // Dynamic statistics calculated from actual templates
  const statistics = {
    total: templates.length,
    tax_compliance: templates.filter((t: ContractTemplate) => t.servicePackage === "tax_compliance").length,
    vat_compliance: templates.filter((t: ContractTemplate) => t.servicePackage === "vat_compliance").length,
    audit_services: templates.filter((t: ContractTemplate) => t.servicePackage === "audit_services").length,
    review_services: templates.filter((t: ContractTemplate) => t.servicePackage === "review_services").length,
    bookkeeping: templates.filter((t: ContractTemplate) => t.servicePackage === "bookkeeping").length,
    payroll: templates.filter((t: ContractTemplate) => t.servicePackage === "payroll").length,
    compliance: templates.filter((t: ContractTemplate) => t.servicePackage === "compliance").length,
    advisory: templates.filter((t: ContractTemplate) => t.servicePackage === "advisory").length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/contracts")}
          className="p-2"
          data-testid="button-back-contracts"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <FileCheck className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Professional Templates</h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <Award className="w-4 h-4" />
                SAICA & SAIPA Compliant Engagement Letters
                <Badge variant="outline" className="ml-2">
                  68 Templates Available
                </Badge>
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Professional Standards</span>
          </div>
          <Button
            variant="outline"
            onClick={() => seedTemplatesMutation.mutate()}
            disabled={seedTemplatesMutation.isPending}
            data-testid="button-seed-templates"
          >
            <Star className="w-4 h-4 mr-2" />
            {seedTemplatesMutation.isPending ? "Adding..." : "Add SA Templates"}
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-create-template">
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
                          <FormLabel>Professional Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select professional category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {professionalCategories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  <div className="flex items-start gap-3">
                                    <category.icon className="w-4 h-4 mt-1 text-gray-500" />
                                    <div className="flex-1">
                                      <div className="font-medium">{category.label}</div>
                                      <div className="text-xs text-gray-500">{category.description}</div>
                                      <div className="flex gap-1 mt-1">
                                        {category.compliance.map((comp) => (
                                          <Badge 
                                            key={comp} 
                                            className={`text-xs px-1 py-0 ${complianceColors[comp as keyof typeof complianceColors]}`}
                                          >
                                            {comp}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
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

      {/* Professional Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{statistics.total}</p>
              <p className="text-sm font-medium text-gray-900">Total Templates</p>
              <div className="flex items-center justify-center mt-2 gap-1">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500">Professional Grade</span>
              </div>
            </div>
          </CardContent>
        </Card>
        {professionalCategories.slice(0, 4).map((category) => {
          const IconComponent = category.icon;
          return (
            <Card key={category.value} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <div className="p-2 rounded-lg bg-gray-50">
                      <IconComponent className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      {statistics[category.value as keyof typeof statistics] || 0}
                    </p>
                    <p className="text-xs font-medium text-gray-700">{category.label}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {category.compliance.slice(0, 2).map((comp) => (
                      <Badge 
                        key={comp} 
                        className={`text-xs px-1.5 py-0.5 ${complianceColors[comp as keyof typeof complianceColors]}`}
                      >
                        {comp}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* All Categories Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Professional Service Categories
          </CardTitle>
          <CardDescription>
            Comprehensive engagement letter templates for South African professional services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {professionalCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <div 
                  key={category.value}
                  className={`p-4 rounded-lg border-2 hover:shadow-md transition-all cursor-pointer ${
                    selectedCategory === category.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCategory(selectedCategory === category.value ? "all" : category.value)}
                  data-testid={`category-${category.value}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white border">
                      <IconComponent className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm">{category.label}</h3>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{category.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-medium text-gray-700">
                          {statistics[category.value as keyof typeof statistics] || category.count} templates
                        </span>
                        <div className="flex gap-1">
                          {category.compliance.map((comp) => (
                            <Badge 
                              key={comp} 
                              className={`text-xs px-1.5 py-0.5 ${complianceColors[comp as keyof typeof complianceColors]}`}
                            >
                              {comp}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search professional templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 max-w-md"
                  data-testid="input-search-templates"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-52" data-testid="select-category">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {professionalCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <category.icon className="w-4 h-4" />
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedCompliance} onValueChange={setSelectedCompliance}>
                <SelectTrigger className="w-48" data-testid="select-compliance">
                  <Award className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by Compliance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Standards</SelectItem>
                  <SelectItem value="SAICA">SAICA Compliant</SelectItem>
                  <SelectItem value="SAIPA">SAIPA Compliant</SelectItem>
                  <SelectItem value="SAIT">SAIT Compliant</SelectItem>
                  <SelectItem value="IRBA">IRBA Compliant</SelectItem>
                  <SelectItem value="IAC">IAC Compliant</SelectItem>
                  <SelectItem value="FPI">FPI Compliant</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button 
                  variant={activeView === "grid" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setActiveView("grid")}
                  data-testid="button-view-grid"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Grid
                </Button>
                <Button 
                  variant={activeView === "table" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setActiveView("table")}
                  data-testid="button-view-table"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Table
                </Button>
              </div>

              <Button variant="outline" data-testid="button-export-templates">
                <Download className="w-4 h-4 mr-2" />
                Export All
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
                        <Badge className={categoryColors[template.servicePackage as keyof typeof categoryColors]}>
                          {professionalCategories.find(p => p.value === template.servicePackage)?.label || template.servicePackage}
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
                            <DropdownMenuItem onClick={() => handleView(template)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
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
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Template Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Template Preview: {viewingTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              Preview the template content, merge fields, and service package details
            </DialogDescription>
          </DialogHeader>
          
          {viewingTemplate && (
            <div className="space-y-6">
              {/* Template Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Service Package</Label>
                  <Badge className={`mt-1 ${packageColors[viewingTemplate.servicePackage as keyof typeof packageColors]}`}>
                    {servicePackages.find(p => p.value === viewingTemplate.servicePackage)?.label || viewingTemplate.servicePackage}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Version</Label>
                  <p className="mt-1 text-sm">v{viewingTemplate.version}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Merge Fields</Label>
                  <p className="mt-1 text-sm">{Array.isArray(viewingTemplate.fields) ? viewingTemplate.fields.length : 0} fields</p>
                </div>
              </div>

              {/* Merge Fields */}
              {Array.isArray(viewingTemplate.fields) && viewingTemplate.fields.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Available Merge Fields</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {viewingTemplate.fields.map((field: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {`{{${field}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Template Content */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Template Content</Label>
                <div className="mt-2 prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-white p-4 border rounded-lg font-mono">
                    {viewingTemplate.bodyMd}
                  </pre>
                </div>
              </div>

              {/* Creation Info */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm text-gray-600">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Created</Label>
                  <p className="mt-1">{new Date(viewingTemplate.createdAt).toLocaleDateString()} at {new Date(viewingTemplate.createdAt).toLocaleTimeString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
                  <p className="mt-1">{new Date(viewingTemplate.updatedAt).toLocaleDateString()} at {new Date(viewingTemplate.updatedAt).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
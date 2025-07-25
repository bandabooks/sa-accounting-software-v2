import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Settings,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  BarChart3,
  FileText,
  Users,
  Package,
  Receipt,
  Truck,
  CreditCard,
  Calculator,
  BookOpen,
  Landmark,
  PieChart,
  Building,
  UserCog,
  Clock,
  Calendar,
  Eye,
  Edit3,
  Zap,
  Lock,
  Unlock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Schema for module activation/deactivation
const moduleToggleSchema = z.object({
  moduleId: z.string(),
  isActive: z.boolean(),
  reason: z.string().min(10, "Please provide a reason for this module change")
});

type ModuleToggleData = z.infer<typeof moduleToggleSchema>;

interface Module {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  icon: string;
  isActive: boolean;
  isCore: boolean;
  dependencies: string[];
  activatedDate?: string;
  activatedBy?: string;
}

interface CompanyModulesData {
  companyId: number;
  totalModules: number;
  activeModules: number;
  lastUpdated: string;
  modules: Module[];
}

const MODULE_ICONS = {
  dashboard: BarChart3,
  user_management: UserCog,
  system_settings: Settings,
  audit_logs: Shield,
  chart_of_accounts: Calculator,
  journal_entries: BookOpen,
  banking: Landmark,
  financial_reports: PieChart,
  customers: Users,
  invoicing: FileText,
  estimates: FileText,
  recurring_billing: Clock,
  credit_notes: FileText,
  suppliers: Building,
  purchase_orders: Truck,
  bills: Receipt,
  expenses: Receipt,
  supplier_payments: CreditCard,
  products_services: Package,
  inventory_management: Package,
  stock_adjustments: Package,
  product_categories: Package,
  pos_terminals: CreditCard,
  pos_sales: CreditCard,
  pos_shifts: Clock,
  pos_reports: BarChart3,
  pos_loyalty: Users,
  payroll: Calculator,
  employees: Users,
  time_tracking: Clock,
  leave_management: Calendar,
  performance: BarChart3,
  vat_management: Calculator,
  tax_returns: FileText,
  sars_integration: Building,
  cipc_compliance: Building,
  labour_compliance: Building,
  project_management: Truck,
  fixed_assets: Package,
  budgeting: Calculator,
  cash_flow: PieChart,
  bank_reconciliation: Landmark,
  api_access: Settings,
  third_party_integrations: Settings,
  data_import_export: Settings,
  backup_restore: Shield,
  default: Settings
};

const CATEGORY_COLORS = {
  "Core System": "from-blue-500 to-blue-600",
  "Financial Management": "from-green-500 to-green-600",
  "Sales & Revenue": "from-purple-500 to-purple-600",
  "Purchases & Expenses": "from-orange-500 to-orange-600",
  "Inventory & Products": "from-yellow-500 to-yellow-600",
  "Point of Sale": "from-pink-500 to-pink-600",
  "Payroll & HR": "from-indigo-500 to-indigo-600",
  "Tax & Compliance": "from-red-500 to-red-600",
  "Advanced Features": "from-cyan-500 to-cyan-600",
  "Integration & API": "from-gray-500 to-gray-600",
  "Other": "from-slate-500 to-slate-600"
};

export default function ModuleActivation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isToggleModuleDialogOpen, setIsToggleModuleDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentTab, setCurrentTab] = useState("modules");

  const moduleForm = useForm<ModuleToggleData>({
    resolver: zodResolver(moduleToggleSchema),
    defaultValues: {
      moduleId: "",
      isActive: false,
      reason: ""
    }
  });

  // Fetch company modules data
  const { data: modulesData, isLoading } = useQuery({
    queryKey: ['/api/modules/company'],
    refetchInterval: 30000,
  });

  // Toggle module activation mutation
  const toggleModuleMutation = useMutation({
    mutationFn: async (data: ModuleToggleData) => {
      return await apiRequest(`/api/modules/${data.moduleId}/toggle`, 'POST', {
        isActive: data.isActive,
        reason: data.reason
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/modules/company'] });
      toast({
        title: "Module Updated",
        description: "Module status has been updated successfully.",
      });
      setIsToggleModuleDialogOpen(false);
      moduleForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onToggleModule = (data: ModuleToggleData) => {
    toggleModuleMutation.mutate(data);
  };

  const openToggleModuleDialog = (module: Module) => {
    setSelectedModule(module);
    moduleForm.setValue('moduleId', module.id);
    moduleForm.setValue('isActive', !module.isActive);
    setIsToggleModuleDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Module Activation</h1>
            <p className="text-muted-foreground">Loading module data...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-100 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const data: CompanyModulesData = modulesData || {
    companyId: 0,
    totalModules: 0,
    activeModules: 0,
    lastUpdated: new Date().toISOString(),
    modules: []
  };

  // Filter modules based on search and filters
  const filteredModules = data.modules.filter(module => {
    const matchesSearch = module.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || module.category === categoryFilter;
    const matchesStatus = statusFilter === "ALL" || 
                         (statusFilter === "ACTIVE" && module.isActive) ||
                         (statusFilter === "INACTIVE" && !module.isActive) ||
                         (statusFilter === "CORE" && module.isCore);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Group modules by category
  const modulesByCategory = filteredModules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, Module[]>);

  const categories = Object.keys(modulesByCategory).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Module Activation Control</h1>
          <p className="text-muted-foreground">
            Manage system module availability and activation for your company
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="px-3 py-1">
            Super Admin Only
          </Badge>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalModules}</div>
            <p className="text-xs text-muted-foreground">
              System modules available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.activeModules}</div>
            <p className="text-xs text-muted-foreground">
              Currently enabled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Modules</CardTitle>
            <XCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{data.totalModules - data.activeModules}</div>
            <p className="text-xs text-muted-foreground">
              Available to activate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Core Modules</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.modules.filter(m => m.isCore).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Always active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Search & Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search modules by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-60">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {Object.keys(CATEGORY_COLORS).map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="CORE">Core Modules</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Module Management Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="modules">Module Directory</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
          <TabsTrigger value="history">Activation History</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Module Directory</CardTitle>
              <CardDescription>
                Manage individual module activation status ({filteredModules.length} of {data.totalModules} modules shown)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredModules.map((module) => {
                  const IconComponent = MODULE_ICONS[module.id as keyof typeof MODULE_ICONS] || MODULE_ICONS.default;
                  const categoryColor = CATEGORY_COLORS[module.category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.Other;
                  
                  return (
                    <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full bg-gradient-to-r ${categoryColor}`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-lg">{module.displayName}</span>
                            <Badge 
                              variant={module.isActive ? "default" : "secondary"}
                              className={module.isActive ? "bg-green-600" : ""}
                            >
                              {module.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {module.isCore && (
                              <Badge variant="outline" className="text-blue-600 border-blue-200">
                                <Shield className="h-3 w-3 mr-1" />
                                Core
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {module.category}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {module.description}
                          </p>
                          
                          {module.dependencies.length > 0 && (
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <span className="font-medium">Dependencies:</span>
                              {module.dependencies.map((dep, index) => (
                                <Badge key={dep} variant="outline" className="text-xs">
                                  {dep.replace(/_/g, ' ')}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          {module.activatedDate && (
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Activated: {new Date(module.activatedDate).toLocaleDateString()}
                              </span>
                              {module.activatedBy && (
                                <span>By: {module.activatedBy}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {module.isActive ? "Enabled" : "Disabled"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {module.isCore ? "System Core" : "Optional"}
                          </div>
                        </div>
                        
                        <Button 
                          variant={module.isActive ? "destructive" : "default"}
                          size="sm"
                          onClick={() => openToggleModuleDialog(module)}
                          disabled={module.isCore}
                        >
                          {module.isCore ? (
                            <>
                              <Lock className="h-4 w-4 mr-1" />
                              Core Module
                            </>
                          ) : module.isActive ? (
                            <>
                              <XCircle className="h-4 w-4 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {categories.map((category) => {
            const categoryModules = modulesByCategory[category];
            const activeCount = categoryModules.filter(m => m.isActive).length;
            const categoryColor = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.Other;
            
            return (
              <Card key={category}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full bg-gradient-to-r ${categoryColor}`}>
                        <Settings className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <CardTitle>{category}</CardTitle>
                        <CardDescription>
                          {activeCount} of {categoryModules.length} modules active
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="px-3 py-1">
                      {Math.round((activeCount / categoryModules.length) * 100)}% Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {categoryModules.map((module) => {
                      const IconComponent = MODULE_ICONS[module.id as keyof typeof MODULE_ICONS] || MODULE_ICONS.default;
                      
                      return (
                        <div key={module.id} className={`p-3 border rounded-lg ${module.isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <IconComponent className="h-4 w-4" />
                              <span className="font-medium text-sm">{module.displayName}</span>
                            </div>
                            <Switch
                              checked={module.isActive}
                              onCheckedChange={() => openToggleModuleDialog(module)}
                              disabled={module.isCore}
                              size="sm"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{module.description}</p>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={module.isActive ? "default" : "secondary"}
                              className={`text-xs ${module.isActive ? "bg-green-600" : ""}`}
                            >
                              {module.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {module.isCore && (
                              <Badge variant="outline" className="text-xs">
                                Core
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Toggle Module Dialog */}
      <Dialog open={isToggleModuleDialogOpen} onOpenChange={setIsToggleModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedModule && (selectedModule.isActive ? "Deactivate Module" : "Activate Module")}
            </DialogTitle>
            <DialogDescription>
              {selectedModule && `${selectedModule.isActive ? 'Disable' : 'Enable'} ${selectedModule.displayName} module for your company`}
            </DialogDescription>
          </DialogHeader>
          {selectedModule && (
            <Form {...moduleForm}>
              <form onSubmit={moduleForm.handleSubmit(onToggleModule)} className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${CATEGORY_COLORS[selectedModule.category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.Other}`}>
                    {(() => {
                      const IconComponent = MODULE_ICONS[selectedModule.id as keyof typeof MODULE_ICONS] || MODULE_ICONS.default;
                      return <IconComponent className="h-5 w-5 text-white" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedModule.displayName}</h3>
                    <p className="text-sm text-muted-foreground">{selectedModule.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline">{selectedModule.category}</Badge>
                      {selectedModule.isCore && (
                        <Badge variant="outline" className="text-blue-600">
                          Core Module
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {selectedModule.dependencies.length > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Dependencies</span>
                    </div>
                    <p className="text-sm text-blue-700 mb-2">
                      This module requires the following modules to be active:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedModule.dependencies.map((dep) => (
                        <Badge key={dep} variant="outline" className="text-xs">
                          {dep.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <FormField
                  control={moduleForm.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for {selectedModule.isActive ? 'Deactivation' : 'Activation'}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={`Explain why you are ${selectedModule.isActive ? 'deactivating' : 'activating'} this module...`}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This will be logged for audit and compliance purposes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsToggleModuleDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={toggleModuleMutation.isPending || selectedModule.isCore}
                    variant={selectedModule.isActive ? "destructive" : "default"}
                  >
                    {selectedModule.isCore ? (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Core Module (Cannot Change)
                      </>
                    ) : selectedModule.isActive ? (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Deactivate Module
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Activate Module
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
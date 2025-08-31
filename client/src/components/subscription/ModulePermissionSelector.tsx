import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BarChart3, 
  Users, 
  FileText, 
  Package, 
  Receipt, 
  Truck, 
  CreditCard, 
  Calculator, 
  BookOpen, 
  Landmark, 
  PieChart, 
  Settings, 
  Shield, 
  UserCog,
  Building,
  Calendar,
  FileCheck,
  Workflow,
  ChevronDown,
  ChevronRight,
  Check,
  AlertCircle,
  Zap
} from "lucide-react";

// Define sub-module interface
interface SubModule {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

// Define module interface
interface Module {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  permissions: string[];
  essential: boolean;
  subModules?: SubModule[];
}

// Define available modules with comprehensive details
export const AVAILABLE_MODULES: Record<string, Module> = {
  dashboard: {
    id: "dashboard",
    name: "Dashboard & Analytics",
    description: "Overview dashboard with business metrics and KPIs",
    icon: BarChart3,
    category: "core",
    permissions: ["view", "export"],
    essential: true
  },
  customer_management: {
    id: "customer_management", 
    name: "Customer Management",
    description: "Customer database, contacts, and relationship management",
    icon: Users,
    category: "sales",
    permissions: ["view", "create", "edit", "delete", "export", "import"],
    essential: true
  },
  invoicing: {
    id: "invoicing",
    name: "Invoicing & Billing",
    description: "Create and manage invoices, recurring billing, and payment tracking",
    icon: FileText,
    category: "sales", 
    permissions: ["view", "create", "edit", "delete", "send", "duplicate", "export"],
    essential: true
  },
  estimates: {
    id: "estimates",
    name: "Quotes & Estimates", 
    description: "Generate quotes and estimates for potential customers",
    icon: FileCheck,
    category: "sales",
    permissions: ["view", "create", "edit", "delete", "send", "convert", "export"],
    essential: false
  },
  products_services: {
    id: "products_services",
    name: "Products & Services",
    description: "Product catalog, pricing, and service management",
    icon: Package,
    category: "inventory",
    permissions: ["view", "create", "edit", "delete", "import", "export"],
    essential: true
  },
  inventory: {
    id: "inventory",
    name: "Inventory Management",
    description: "Stock tracking, warehouse management, and inventory transactions",
    icon: Package,
    category: "inventory", 
    permissions: ["view", "create", "edit", "adjust", "transfer", "report"],
    essential: false
  },
  expenses: {
    id: "expenses",
    name: "Expense Management",
    description: "Track business expenses, receipts, and tax deductions",
    icon: Receipt,
    category: "accounting",
    permissions: ["view", "create", "edit", "delete", "approve", "categorize"],
    essential: true
  },
  suppliers: {
    id: "suppliers",
    name: "Supplier Management",
    description: "Vendor management, purchase orders, and supplier relationships",
    icon: Truck,
    category: "purchases",
    permissions: ["view", "create", "edit", "delete", "order", "payment"],
    essential: false
  },
  pos_sales: {
    id: "pos_sales",
    name: "Point of Sale (POS)",
    description: "In-store sales, cash register, and retail transactions",
    icon: CreditCard,
    category: "sales",
    permissions: ["view", "create", "refund", "reports", "manage_terminals"],
    essential: false
  },
  chart_of_accounts: {
    id: "chart_of_accounts",
    name: "Chart of Accounts",
    description: "Accounting structure, account management, and financial categorization",
    icon: Calculator,
    category: "accounting",
    permissions: ["view", "create", "edit", "delete", "export"],
    essential: true
  },
  journal_entries: {
    id: "journal_entries",
    name: "Journal Entries",
    description: "Double-entry bookkeeping and manual accounting transactions",
    icon: BookOpen,
    category: "accounting",
    permissions: ["view", "create", "edit", "post", "reverse"],
    essential: true
  },
  banking: {
    id: "banking",
    name: "Banking & Reconciliation",
    description: "Bank account management, reconciliation, and transaction matching",
    icon: Landmark,
    category: "accounting",
    permissions: ["view", "create", "reconcile", "import", "export"],
    essential: true
  },
  financial_reports: {
    id: "financial_reports",
    name: "Financial Reports",
    description: "P&L, Balance Sheet, Cash Flow, and custom financial reports",
    icon: PieChart,
    category: "reports",
    permissions: ["view", "generate", "export", "schedule", "customize"],
    essential: true
  },
  vat_management: {
    id: "vat_management",
    name: "VAT & Tax Compliance",
    description: "South African VAT returns, SARS integration, and tax compliance",
    icon: FileCheck,
    category: "compliance",
    permissions: ["view", "prepare", "submit", "export"],
    essential: true
  },
  compliance_management: {
    id: "compliance_management",
    name: "Compliance Management",
    description: "Professional compliance tracking, client management, and regulatory requirements for tax practitioners",
    icon: Shield,
    category: "compliance",
    permissions: ["view", "create", "edit", "track", "assign", "report", "calendar", "documents"],
    essential: true,
    subModules: [
      {
        id: "compliance_dashboard",
        name: "Compliance Dashboard",
        description: "Overview dashboard with compliance metrics and KPIs",
        permissions: ["view", "export"]
      },
      {
        id: "compliance_clients",
        name: "Client Management",
        description: "Professional client database and compliance tracking",
        permissions: ["view", "create", "edit", "delete"]
      },
      {
        id: "cipc_compliance",
        name: "CIPC Compliance",
        description: "Companies and Intellectual Property Commission requirements",
        permissions: ["view", "file", "track", "report"]
      },
      {
        id: "labour_compliance",
        name: "Labour Compliance",
        description: "Department of Employment and Labour compliance management",
        permissions: ["view", "file", "track", "report"]
      },
      {
        id: "compliance_tasks",
        name: "Task Management",
        description: "Compliance task assignment and deadline tracking",
        permissions: ["view", "create", "assign", "complete"]
      },
      {
        id: "compliance_calendar",
        name: "Compliance Calendar",
        description: "Deadline calendar and important dates tracking",
        permissions: ["view", "schedule", "notify"]
      },
      {
        id: "compliance_documents",
        name: "Document Library",
        description: "Compliance document storage and management",
        permissions: ["view", "upload", "download", "organize"]
      }
    ]
  },
  payroll: {
    id: "payroll",
    name: "Payroll Management",
    description: "Employee payroll, tax calculations, and salary processing", 
    icon: UserCog,
    category: "hr",
    permissions: ["view", "create", "process", "approve", "export"],
    essential: false
  },
  projects: {
    id: "projects",
    name: "Project Management",
    description: "Project tracking, time management, and profitability analysis",
    icon: Calendar,
    category: "operations",
    permissions: ["view", "create", "edit", "track_time", "invoice"],
    essential: false
  },
  workflow_automation: {
    id: "workflow_automation",
    name: "Workflow Automation",
    description: "Automated processes, reminders, and business rule engine",
    icon: Workflow,
    category: "advanced",
    permissions: ["view", "create", "edit", "activate"],
    essential: false
  },
  company_settings: {
    id: "company_settings", 
    name: "Company Settings",
    description: "Company profile, preferences, and system configuration",
    icon: Building,
    category: "admin",
    permissions: ["view", "edit", "backup", "export"],
    essential: true
  },
  user_management: {
    id: "user_management",
    name: "User Management",
    description: "User accounts, roles, permissions, and access control",
    icon: UserCog,
    category: "admin",
    permissions: ["view", "create", "edit", "deactivate", "assign_roles"],
    essential: false
  },
  // Compliance sub-modules (to fix the 27 of 20 count issue)
  compliance_dashboard: {
    id: "compliance_dashboard",
    name: "Compliance Dashboard",
    description: "Overview dashboard with compliance metrics and KPIs",
    icon: Shield,
    category: "compliance",
    permissions: ["view", "export"],
    essential: false
  },
  compliance_clients: {
    id: "compliance_clients",
    name: "Client Management",
    description: "Professional client database and compliance tracking",
    icon: Users,
    category: "compliance",
    permissions: ["view", "create", "edit", "delete"],
    essential: false
  },
  cipc_compliance: {
    id: "cipc_compliance",
    name: "CIPC Compliance",
    description: "Companies and Intellectual Property Commission requirements",
    icon: FileCheck,
    category: "compliance",
    permissions: ["view", "file", "track", "report"],
    essential: false
  },
  labour_compliance: {
    id: "labour_compliance",
    name: "Labour Compliance",
    description: "Department of Employment and Labour compliance management",
    icon: UserCog,
    category: "compliance",
    permissions: ["view", "file", "track", "report"],
    essential: false
  },
  compliance_tasks: {
    id: "compliance_tasks",
    name: "Task Management",
    description: "Compliance task assignment and deadline tracking",
    icon: Calendar,
    category: "compliance",
    permissions: ["view", "create", "assign", "complete"],
    essential: false
  },
  compliance_calendar: {
    id: "compliance_calendar",
    name: "Compliance Calendar",
    description: "Deadline calendar and important dates tracking",
    icon: Calendar,
    category: "compliance",
    permissions: ["view", "schedule", "notify"],
    essential: false
  },
  compliance_documents: {
    id: "compliance_documents",
    name: "Document Library",
    description: "Compliance document storage and management",
    icon: FileText,
    category: "compliance",
    permissions: ["view", "upload", "download", "organize"],
    essential: false
  }
};

export const MODULE_CATEGORIES = {
  core: { name: "Core Features", color: "bg-blue-500", icon: Zap },
  sales: { name: "Sales & CRM", color: "bg-green-500", icon: Users },
  purchases: { name: "Purchases & Vendors", color: "bg-orange-500", icon: Truck },
  inventory: { name: "Inventory & Products", color: "bg-purple-500", icon: Package },
  accounting: { name: "Accounting & Finance", color: "bg-red-500", icon: Calculator },
  reports: { name: "Reports & Analytics", color: "bg-indigo-500", icon: PieChart },
  compliance: { name: "Compliance & Tax", color: "bg-yellow-500", icon: Shield },
  hr: { name: "HR & Payroll", color: "bg-pink-500", icon: UserCog },
  operations: { name: "Operations", color: "bg-teal-500", icon: Calendar },
  advanced: { name: "Advanced Features", color: "bg-gray-500", icon: Settings },
  admin: { name: "Administration", color: "bg-slate-500", icon: Building }
};

interface ModulePermissionSelectorProps {
  selectedFeatures: string[];
  selectedLimits: Record<string, any>;
  onFeaturesChange: (features: string[]) => void;
  onLimitsChange: (limits: Record<string, any>) => void;
  planName: string;
}

export default function ModulePermissionSelector({
  selectedFeatures,
  selectedLimits,
  onFeaturesChange,
  onLimitsChange,
  planName
}: ModulePermissionSelectorProps) {
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [modulePermissions, setModulePermissions] = useState<Record<string, string[]>>({});
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["core", "sales", "accounting", "compliance"]);
  const [currentTab, setCurrentTab] = useState("modules");

  // Initialize from existing features
  useEffect(() => {
    // Include both main modules and sub-modules
    const allSubModuleIds = Object.values(AVAILABLE_MODULES)
      .filter(module => module.subModules)
      .flatMap(module => module.subModules?.map(sub => sub.id) || []);
    
    const modules = selectedFeatures.filter(feature => 
      Object.keys(AVAILABLE_MODULES).includes(feature) || 
      allSubModuleIds.includes(feature)
    );
    setSelectedModules(modules);

    // Use selectedLimits for permissions instead of extracting from features
    if (selectedLimits && typeof selectedLimits === 'object') {
      setModulePermissions(selectedLimits);
    }
  }, [selectedFeatures]);

  const toggleModule = (moduleId: string) => {
    const isCurrentlySelected = selectedModules.includes(moduleId);
    const newModules = isCurrentlySelected
      ? selectedModules.filter(id => id !== moduleId)
      : [...selectedModules, moduleId];
    
    const newPermissions = { ...modulePermissions };
    
    // If enabling a module, automatically enable essential permissions
    if (!isCurrentlySelected) {
      const module = AVAILABLE_MODULES[moduleId];
      if (module) {
        // Auto-enable essential permissions: view, create, edit, delete
        const essentialPermissions = ['view', 'create', 'edit', 'delete'];
        const availablePermissions = module.permissions || [];
        const autoPermissions = essentialPermissions.filter(perm => 
          availablePermissions.includes(perm)
        );
        
        if (autoPermissions.length > 0) {
          newPermissions[moduleId] = [...(newPermissions[moduleId] || []), ...autoPermissions];
          // Remove duplicates
          newPermissions[moduleId] = Array.from(new Set(newPermissions[moduleId]));
        }
      }
    } else {
      // If disabling a module, remove its permissions
      delete newPermissions[moduleId];
    }
    
    setSelectedModules(newModules);
    setModulePermissions(newPermissions);
    updateFeatures(newModules, newPermissions);
  };

  const togglePermission = (moduleId: string, permission: string) => {
    const newPermissions = { ...modulePermissions };
    if (!newPermissions[moduleId]) newPermissions[moduleId] = [];
    
    if (newPermissions[moduleId].includes(permission)) {
      newPermissions[moduleId] = newPermissions[moduleId].filter(p => p !== permission);
    } else {
      newPermissions[moduleId].push(permission);
    }

    setModulePermissions(newPermissions);
    updateFeatures(selectedModules, newPermissions);
  };

  const updateFeatures = (modules: string[], permissions: Record<string, string[]>) => {
    // Only pass module IDs to features, not permissions
    // Permissions should be handled separately via onLimitsChange
    console.log('Updating features (modules only):', modules); // Debug log
    onFeaturesChange(modules);
    
    // Update permissions separately
    console.log('Updating permissions:', permissions); // Debug log
    onLimitsChange(permissions);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const selectAllInCategory = (category: string) => {
    const categoryModules = Object.values(AVAILABLE_MODULES)
      .filter(module => module.category === category)
      .map(module => module.id);
    
    const newModules = Array.from(new Set([...selectedModules, ...categoryModules]));
    setSelectedModules(newModules);
    updateFeatures(newModules, modulePermissions);
  };

  const getSelectedCount = () => {
    return selectedModules.length;
  };

  const getSelectedByCategory = (category: string) => {
    return Object.values(AVAILABLE_MODULES)
      .filter(module => module.category === category && selectedModules.includes(module.id))
      .length;
  };

  const getTotalByCategory = (category: string) => {
    return Object.values(AVAILABLE_MODULES)
      .filter(module => module.category === category)
      .length;
  };

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Module & Permission Selection</span>
            </div>
            <Badge variant="secondary" className="text-sm">
              {getSelectedCount()} / {Object.keys(AVAILABLE_MODULES).length} modules selected
            </Badge>
          </CardTitle>
          <CardDescription>
            Select modules and permissions to include in the <strong>{planName}</strong> subscription plan.
            Users will only have access to selected modules based on their role permissions.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Module Selection Interface */}
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="modules">Module Selection</TabsTrigger>
          <TabsTrigger value="preview">Plan Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-4">
          {Object.entries(MODULE_CATEGORIES).map(([categoryKey, category]) => {
            const categoryModules = Object.values(AVAILABLE_MODULES).filter(
              module => module.category === categoryKey
            );
            const isExpanded = expandedCategories.includes(categoryKey);
            const selectedInCategory = getSelectedByCategory(categoryKey);
            const totalInCategory = getTotalByCategory(categoryKey);

            return (
              <Card key={categoryKey}>
                <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(categoryKey)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${category.color}`} />
                          <category.icon className="h-5 w-5 text-gray-600" />
                          <div>
                            <CardTitle className="text-lg">{category.name}</CardTitle>
                            <CardDescription>
                              {selectedInCategory} of {totalInCategory} modules selected
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedInCategory < totalInCategory && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                selectAllInCategory(categoryKey);
                              }}
                            >
                              Select All
                            </Button>
                          )}
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {categoryModules.map((module) => {
                          const isSelected = selectedModules.includes(module.id);
                          const modulePerms = modulePermissions[module.id] || [];

                          return (
                            <div key={module.id} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start space-x-3">
                                  <Switch
                                    checked={isSelected}
                                    onCheckedChange={() => toggleModule(module.id)}
                                  />
                                  <module.icon className="h-5 w-5 text-gray-600 mt-0.5" />
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <Label className="text-base font-medium">{module.name}</Label>
                                      {module.essential && (
                                        <Badge variant="secondary" className="text-xs">Essential</Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Permission Selection */}
                              {isSelected && (
                                <div className="ml-8 pt-3 border-t space-y-4">
                                  {/* Basic Module Permissions */}
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                      Module Permissions
                                    </Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                      {module.permissions.map((permission) => (
                                        <div key={permission} className="flex items-center space-x-2">
                                          <Switch
                                            checked={modulePerms.includes(permission)}
                                            onCheckedChange={() => togglePermission(module.id, permission)}
                                          />
                                          <Label className="text-sm capitalize">
                                            {permission.replace("_", " ")}
                                          </Label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Sub-modules (for compliance_management) */}
                                  {module.subModules && (
                                    <div>
                                      <Label className="text-sm font-medium text-gray-700 mb-3 block">
                                        Sub-Features
                                      </Label>
                                      <div className="space-y-3">
                                        {module.subModules.map((subModule: SubModule) => {
                                          const subModulePerms = modulePermissions[subModule.id] || [];
                                          const isSubModuleSelected = selectedModules.includes(subModule.id);
                                          
                                          return (
                                            <div key={subModule.id} className="border rounded-lg p-3 bg-gray-50">
                                              <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-2">
                                                  <Switch
                                                    checked={isSubModuleSelected}
                                                    onCheckedChange={() => {
                                                      console.log('Toggling sub-module:', subModule.id, 'current state:', isSubModuleSelected);
                                                      toggleModule(subModule.id);
                                                    }}
                                                  />
                                                  <div>
                                                    <Label className="text-sm font-medium">{subModule.name}</Label>
                                                    <p className="text-xs text-gray-600">{subModule.description}</p>
                                                  </div>
                                                </div>
                                              </div>
                                              
                                              {/* Sub-module permissions */}
                                              {isSubModuleSelected && (
                                                <div className="ml-6 pt-2 border-t border-gray-200">
                                                  <div className="grid grid-cols-2 gap-1">
                                                    {subModule.permissions.map((permission: string) => (
                                                      <div key={permission} className="flex items-center space-x-1">
                                                        <Switch
                                                          checked={subModulePerms.includes(permission)}
                                                          onCheckedChange={() => togglePermission(subModule.id, permission)}

                                                        />
                                                        <Label className="text-xs capitalize">
                                                          {permission.replace("_", " ")}
                                                        </Label>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-green-600" />
                <span>Plan Preview: {planName}</span>
              </CardTitle>
              <CardDescription>
                Review the selected modules and permissions for this subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedModules.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No modules selected. Please select at least one module to create a valid subscription plan.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {Object.entries(MODULE_CATEGORIES).map(([categoryKey, category]) => {
                    const categoryModules = Object.values(AVAILABLE_MODULES).filter(
                      module => module.category === categoryKey && selectedModules.includes(module.id)
                    );

                    if (categoryModules.length === 0) return null;

                    return (
                      <div key={categoryKey}>
                        <div className="flex items-center space-x-2 mb-3">
                          <div className={`w-3 h-3 rounded-full ${category.color}`} />
                          <h4 className="font-medium text-gray-900">{category.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {categoryModules.length} modules
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-5">
                          {categoryModules.map((module) => {
                            const modulePerms = modulePermissions[module.id] || [];
                            return (
                              <div key={module.id} className="flex items-start space-x-3 p-3 border rounded-lg bg-gray-50">
                                <module.icon className="h-4 w-4 text-gray-600 mt-0.5" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900">{module.name}</p>
                                  {modulePerms.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {modulePerms.map((perm) => (
                                        <Badge key={perm} variant="secondary" className="text-xs">
                                          {perm.replace("_", " ")}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <Separator className="mt-4" />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
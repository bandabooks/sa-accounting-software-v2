import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
// Removed unified permission sync - using direct API approach for better reliability
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from '@/hooks/use-toast';
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
  Zap,
  Search,
  Eye,
  Plus,
  Edit,
  Trash2,
  Save,
  Download,
  RefreshCw,
  Lock,
  Info
} from "lucide-react";

// Import the exact same module definitions from subscription system
export const AVAILABLE_MODULES = {
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
    name: "VAT & Compliance",
    description: "South African VAT returns, SARS integration, and tax compliance",
    icon: FileCheck,
    category: "compliance",
    permissions: ["view", "prepare", "submit", "export"],
    essential: true
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
    description: "Project tracking, time management, and resource allocation",
    icon: Calendar,
    category: "projects",
    permissions: ["view", "create", "edit", "delete", "track", "report"],
    essential: false
  },
  fixed_assets: {
    id: "fixed_assets",
    name: "Fixed Assets",
    description: "Asset tracking, depreciation, and fixed asset management",
    icon: Building,
    category: "accounting",
    permissions: ["view", "create", "edit", "depreciate", "dispose"],
    essential: false
  },
  budgeting: {
    id: "budgeting",
    name: "Budgeting & Forecasting",
    description: "Budget planning, variance analysis, and financial forecasting",
    icon: PieChart,
    category: "reports",
    permissions: ["view", "create", "edit", "analyze", "export"],
    essential: false
  },
  time_tracking: {
    id: "time_tracking",
    name: "Time Tracking",
    description: "Employee time tracking, billable hours, and productivity monitoring",
    icon: Calendar,
    category: "hr",
    permissions: ["view", "create", "edit", "approve", "report"],
    essential: false
  },
  advanced_analytics: {
    id: "advanced_analytics",
    name: "Advanced Analytics",
    description: "Business intelligence, advanced reporting, and data analysis",
    icon: BarChart3,
    category: "reports",
    permissions: ["view", "create", "export", "customize", "schedule"],
    essential: false
  }
};

export const MODULE_CATEGORIES = {
  core: { name: "Core Features", icon: Zap, color: "blue" },
  sales: { name: "Sales & CRM", icon: Users, color: "green" },
  inventory: { name: "Products & Inventory", icon: Package, color: "purple" },
  purchases: { name: "Purchases", icon: Truck, color: "orange" },
  accounting: { name: "Accounting", icon: Calculator, color: "emerald" },
  reports: { name: "Reports & Analytics", icon: BarChart3, color: "indigo" },
  compliance: { name: "Compliance & VAT", icon: FileCheck, color: "red" },
  hr: { name: "HR & Payroll", icon: UserCog, color: "pink" },
  projects: { name: "Project Management", icon: Calendar, color: "cyan" }
};

interface Role {
  id: number;
  name: string;
  displayName: string;
  description: string;
  level: number;
  isSystemRole: boolean;
  userCount?: number;
}

interface SubscriptionIntegratedPermissionsProps {
  // Make it flexible to work both in user management and subscription contexts
  context?: 'user_management' | 'subscription';
  selectedRole?: number;
  onRoleChange?: (roleId: number) => void;
}

export default function SubscriptionIntegratedPermissions({ 
  context = 'user_management',
  selectedRole,
  onRoleChange 
}: SubscriptionIntegratedPermissionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(selectedRole || null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["core", "sales", "accounting"]);
  const [currentTab, setCurrentTab] = useState("modules");
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch subscription data to sync active modules
  const { data: subscriptionData } = useQuery({
    queryKey: ['/api/company/subscription'],
    queryFn: async () => {
      const response = await fetch('/api/company/subscription');
      if (!response.ok) return null;
      return response.json();
    },
    staleTime: 60000, // Cache for 1 minute
  });

  // Direct role loading with fallback to hardcoded roles
  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['/api/rbac/system-roles'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/rbac/system-roles');
        if (!response.ok) {
          // If API fails, return hardcoded system roles
          return [
            {
              id: 1,
              name: "super_admin",
              displayName: "Super Administrator",
              description: "Platform owner with full access to all companies, billing, subscription, platform settings, and global system management",
              level: 10,
              permissions: [],
              userCount: 1
            },
            {
              id: 2,
              name: "company_admin",
              displayName: "Company Administrator", 
              description: "Full access to all modules and settings within their company. Can invite, create, and manage users, assign roles and permissions, control billing",
              level: 9,
              permissions: [],
              userCount: 0
            },
            {
              id: 3,
              name: "accountant",
              displayName: "Accountant",
              description: "Full accounting and financial management access with reporting capabilities",
              level: 7,
              permissions: [],
              userCount: 0
            },
            {
              id: 4,
              name: "manager",
              displayName: "Manager",
              description: "Management access to operations, reports, and team oversight",
              level: 6,
              permissions: [],
              userCount: 0
            },
            {
              id: 5,
              name: "employee",
              displayName: "Employee",
              description: "Standard access to core business functions and assigned modules",
              level: 3,
              permissions: [],
              userCount: 0
            }
          ];
        }
        return response.json();
      } catch (error) {
        console.log('Role loading failed, using system defaults');
        // Return hardcoded roles as ultimate fallback
        return [
          {
            id: 1,
            name: "super_admin",
            displayName: "Super Administrator",
            description: "Platform owner with full access to all companies, billing, subscription, platform settings, and global system management",
            level: 10,
            permissions: [],
            userCount: 1
          },
          {
            id: 2,
            name: "company_admin",
            displayName: "Company Administrator", 
            description: "Full access to all modules and settings within their company. Can invite, create, and manage users, assign roles and permissions, control billing",
            level: 9,
            permissions: [],
            userCount: 0
          },
          {
            id: 3,
            name: "accountant",
            displayName: "Accountant",
            description: "Full accounting and financial management access with reporting capabilities",
            level: 7,
            permissions: [],
            userCount: 0
          },
          {
            id: 4,
            name: "manager",
            displayName: "Manager",
            description: "Management access to operations, reports, and team oversight",
            level: 6,
            permissions: [],
            userCount: 0
          },
          {
            id: 5,
            name: "employee",
            displayName: "Employee",
            description: "Standard access to core business functions and assigned modules",
            level: 3,
            permissions: [],
            userCount: 0
          }
        ];
      }
    },
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
  });

  // Handle role change
  const handleRoleChange = (roleId: string) => {
    const numericRoleId = parseInt(roleId);
    setSelectedRoleId(numericRoleId);
    if (onRoleChange) {
      onRoleChange(numericRoleId);
    }
  };

  // Simple permission state management
  const [permissionStates, setPermissionStates] = useState<Record<string, boolean>>({});
  const [pendingToggles, setPendingToggles] = useState<Set<string>>(new Set());

  // Load current permissions from the working permissions matrix
  const { data: permissionsMatrix } = useQuery({
    queryKey: ['/api/permissions/matrix'],
    queryFn: async () => {
      const response = await fetch('/api/permissions/matrix');
      if (!response.ok) return { roles: [] };
      return response.json();
    },
    staleTime: 30000,
  });

  // Extract current permissions for selected role from the matrix
  const currentPermissions = permissionsMatrix?.roles?.find((role: any) => role.id === selectedRoleId)?.permissions || {};

  // Check if module is active in subscription
  const isModuleActiveInSubscription = (moduleId: string): boolean => {
    if (!subscriptionData?.plan) return false;
    
    const moduleMapping: Record<string, string> = {
      'dashboard': 'dashboard_analytics',
      'customers': 'customer_management', 
      'invoicing': 'invoicing_billing',
      'sales': 'sales_crm',
      'accounting': 'accounting_finance',
      'inventory': 'inventory_management',
      'purchases': 'purchase_management',
      'reports': 'financial_reporting',
      'pos': 'point_of_sale',
      'projects': 'project_management',
      'crm': 'sales_crm',
      'payroll': 'payroll_hr'
    };

    const subscriptionKey = moduleMapping[moduleId] || moduleId;
    return subscriptionData.plan.modules?.[subscriptionKey] === true;
  };

  // Initialize permission states from current permissions and subscription
  useEffect(() => {
    if (selectedRoleId) {
      const newStates: Record<string, boolean> = {};
      
      // Load existing permissions if available - currentPermissions is now an object
      if (currentPermissions && typeof currentPermissions === 'object') {
        Object.keys(currentPermissions).forEach(moduleId => {
          const modulePermissions = currentPermissions[moduleId];
          if (modulePermissions && typeof modulePermissions === 'object') {
            Object.keys(modulePermissions).forEach(permissionType => {
              const key = `${selectedRoleId}-${moduleId}-${permissionType}`;
              newStates[key] = modulePermissions[permissionType];
            });
          }
        });
      }

      // Auto-enable ALL essential permissions by default 
      Object.values(AVAILABLE_MODULES).forEach(module => {
        if (module.essential) {
          module.permissions.forEach(permission => {
            const key = `${selectedRoleId}-${module.id}-${permission}`;
            // Enable ALL permissions for essential modules
            newStates[key] = true;
          });
        }
      });

      setPermissionStates(newStates);
    }
  }, [currentPermissions, subscriptionData, selectedRoleId]);

  // Direct permission toggle mutation with better error handling
  const togglePermissionMutation = useMutation({
    mutationFn: async (data: { roleId: number; moduleId: string; permissionType: string; enabled: boolean; _key?: string }) => {
      // Remove the _key before sending to API
      const { _key, ...apiData } = data;
      const response = await apiRequest('/api/permissions/toggle', 'POST', apiData);
      return response.json();
    },
    onSuccess: (result, variables) => {
      // Remove from pending toggles
      const key = variables._key || `${variables.roleId}-${variables.moduleId}-${variables.permissionType}`;
      setPendingToggles(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
      
      toast({
        title: "Permission Updated",
        description: `${variables.permissionType} permission for ${variables.moduleId} ${variables.enabled ? 'enabled' : 'disabled'} successfully.`,
      });
      
      // Refresh permissions data to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['/api/permissions/matrix'] });
    },
    onError: (error: any, variables) => {
      // Remove from pending toggles and revert the optimistic update on error
      const key = variables._key || `${variables.roleId}-${variables.moduleId}-${variables.permissionType}`;
      setPendingToggles(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
      
      setPermissionStates(prev => ({
        ...prev,
        [key]: !variables.enabled // Revert to previous state
      }));
      
      toast({
        title: "Error",
        description: error.message || "Failed to update permission",
        variant: "destructive",
      });
    }
  });

  // Check if permission is enabled
  const isPermissionEnabled = (moduleId: string, permission: string): boolean => {
    if (!selectedRoleId) return false;
    const key = `${selectedRoleId}-${moduleId}-${permission}`;
    return permissionStates[key] || false;
  };

  // Handle module-level toggle (master switch)
  const handleModuleToggle = (moduleId: string, enabled: boolean) => {
    if (!selectedRoleId) return;
    
    const module = AVAILABLE_MODULES[moduleId];
    if (!module) return;

    if (enabled) {
      // When enabling module, turn on basic permissions like "view", "create", "edit"
      const basicPermissions = ['view', 'create', 'edit'];
      module.permissions.forEach(permission => {
        if (basicPermissions.includes(permission)) {
          handlePermissionToggle(moduleId, permission, true);
        }
      });
    } else {
      // When disabling module, turn off all permissions
      module.permissions.forEach(permission => {
        handlePermissionToggle(moduleId, permission, false);
      });
    }
  };

  // Handle permission toggle with better isolation
  const handlePermissionToggle = (moduleId: string, permission: string, enabled: boolean) => {
    if (!selectedRoleId) return;
    
    // Create isolated state update that only affects this specific permission
    const key = `${selectedRoleId}-${moduleId}-${permission}`;
    
    // Prevent multiple simultaneous toggles of the same permission
    if (pendingToggles.has(key)) return;
    
    // Add to pending toggles
    setPendingToggles(prev => new Set([...prev, key]));
    
    // Use functional update to ensure we don't interfere with other toggles
    setPermissionStates(prev => {
      const newState = { ...prev };
      newState[key] = enabled;
      return newState;
    });

    // Use a unique mutation key to prevent interference
    togglePermissionMutation.mutate({
      roleId: selectedRoleId,
      moduleId,
      permissionType: permission,
      enabled,
      _key: key // Add unique identifier
    });
  };

  // Get current role permissions for display
  const getCurrentRolePermissions = () => {
    if (!selectedRoleId) return {};
    
    const permissionMap: Record<string, string[]> = {};
    Object.values(AVAILABLE_MODULES).forEach(module => {
      module.permissions.forEach(permission => {
        if (isPermissionEnabled(module.id, permission)) {
          if (!permissionMap[module.id]) {
            permissionMap[module.id] = [];
          }
          permissionMap[module.id].push(permission);
        }
      });
    });
    
    return permissionMap;
  };

  // Get selected count for role
  const getSelectedCount = () => {
    if (!selectedRoleId) return 0;
    const rolePermissions = getCurrentRolePermissions();
    return Object.keys(rolePermissions).length;
  };

  // Toggle category expansion
  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryKey) 
        ? prev.filter(c => c !== categoryKey)
        : [...prev, categoryKey]
    );
  };

  // Filter modules by search
  const filteredModules = Object.values(AVAILABLE_MODULES).filter(module =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedRoleData = (roles as Role[])?.find((r: Role) => r.id === selectedRoleId);

  // Add error boundary protection
  if (rolesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Role Selection and Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Module & Permission Selection</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
              Direct Permission Management
            </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {selectedRoleId && (
                <Badge variant="secondary" className="text-sm">
                  {getSelectedCount()} / {Object.keys(AVAILABLE_MODULES).length} modules selected
                </Badge>
              )}
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Settings className="h-3 w-3" />
                <span>Permission Management</span>
              </div>
            </div>
          </CardTitle>
          <CardDescription>
            Configure role-based module permissions for your system roles.
            Select a role and toggle permissions for each business module.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="role-select">Select Role to Configure</Label>
              <Select 
                value={selectedRoleId?.toString() || ""} 
                onValueChange={handleRoleChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a role to configure permissions" />
                </SelectTrigger>
                <SelectContent>
                  {(roles as Role[]).map((role: Role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={role.level >= 8 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          Level {role.level}
                        </Badge>
                        <span>{role.displayName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRoleData && (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>{selectedRoleData.displayName}</strong> - {selectedRoleData.description}
                  {selectedRoleData.userCount !== undefined && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({selectedRoleData.userCount} users)
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedRoleId && (
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="modules">Module Selection</TabsTrigger>
            <TabsTrigger value="preview">Permission Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="space-y-4">
            {/* Search */}
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            {/* Module Categories */}
            {Object.entries(MODULE_CATEGORIES).map(([categoryKey, category]) => {
              const categoryModules = filteredModules.filter(
                module => module.category === categoryKey
              );

              if (categoryModules.length === 0) return null;

              const isExpanded = expandedCategories.includes(categoryKey);

              return (
                <Card key={categoryKey}>
                  <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(categoryKey)}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-gray-50">
                        <CardTitle className="flex items-center justify-between text-lg">
                          <div className="flex items-center space-x-3">
                            <category.icon className={`h-5 w-5 text-${category.color}-600`} />
                            <span>{category.name}</span>
                            <Badge variant="outline">
                              {categoryModules.filter(m => 
                                getCurrentRolePermissions()[m.id]?.length > 0
                              ).length} of {categoryModules.length} selected
                            </Badge>
                          </div>
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-4">
                        {categoryModules.map((module) => {
                          const IconComponent = module.icon;
                          const hasAnyPermission = getCurrentRolePermissions()[module.id]?.length > 0;

                          return (
                            <div key={module.id} className="border rounded-lg p-4 space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                  <IconComponent className="h-5 w-5 mt-1 text-gray-600" />
                                  <div>
                                    <h4 className="font-medium flex items-center space-x-2">
                                      <span>{module.name}</span>
                                      {module.essential && (
                                        <Badge variant="secondary" className="text-xs">Essential</Badge>
                                      )}
                                      {isModuleActiveInSubscription(module.id) && (
                                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                          Subscription
                                        </Badge>
                                      )}
                                    </h4>
                                    <p className="text-sm text-gray-600">{module.description}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <Switch
                                    checked={hasAnyPermission}
                                    onCheckedChange={(checked) => handleModuleToggle(module.id, checked)}
                                    className="data-[state=checked]:bg-blue-600"
                                  />
                                  <Badge variant={hasAnyPermission || isModuleActiveInSubscription(module.id) ? "default" : "outline"}>
                                    {hasAnyPermission || isModuleActiveInSubscription(module.id) ? "Active" : "Disabled"}
                                  </Badge>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {module.permissions.map((permission) => {
                                  const isEnabled = isPermissionEnabled(module.id, permission);
                                  const switchKey = `${selectedRoleId}-${module.id}-${permission}`;
                                  
                                  return (
                                    <div key={`${module.id}-${permission}-container`} className="flex items-center space-x-2">
                                      <Switch
                                        key={switchKey}
                                        id={`switch-${switchKey}`}
                                        checked={isEnabled}
                                        onCheckedChange={(checked) => 
                                          handlePermissionToggle(module.id, permission, checked)
                                        }
                                        disabled={false}
                                      />
                                      <Label
                                        htmlFor={`switch-${switchKey}`}
                                        className="text-sm capitalize cursor-pointer"
                                      >
                                        {permission.replace('_', ' ')}
                                      </Label>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
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
                  <span>Permission Preview: {selectedRoleData?.displayName}</span>
                </CardTitle>
                <CardDescription>
                  Review the selected modules and permissions for this role
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(getCurrentRolePermissions()).length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No permissions selected. Please select at least one module permission to create a valid role configuration.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(MODULE_CATEGORIES).map(([categoryKey, category]) => {
                      const rolePermissions = getCurrentRolePermissions();
                      const categoryModules = Object.values(AVAILABLE_MODULES).filter(
                        module => module.category === categoryKey && rolePermissions[module.id]?.length > 0
                      );

                      if (categoryModules.length === 0) return null;

                      return (
                        <div key={categoryKey} className="space-y-2">
                          <h3 className="font-medium flex items-center space-x-2">
                            <category.icon className={`h-4 w-4 text-${category.color}-600`} />
                            <span>{category.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {categoryModules.length} modules
                            </Badge>
                          </h3>
                          <div className="grid gap-2 ml-6">
                            {categoryModules.map((module) => (
                              <div key={module.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="font-medium">{module.name}</span>
                                <div className="flex space-x-1">
                                  {rolePermissions[module.id]?.map((permission) => (
                                    <Badge key={permission} variant="secondary" className="text-xs capitalize">
                                      {permission.replace('_', ' ')}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
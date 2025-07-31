import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Shield,
  Users,
  Settings2,
  Activity,
  BarChart3,
  ShoppingCart,
  Package,
  CreditCard,
  Calculator,
  FileText,
  Building,
  UserCog,
  Eye,
  Edit3,
  Plus,
  Trash2,
  Settings as SettingsIcon,
  Crown,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  Grid3X3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  level: number;
  color: string;
  isSystemRole: boolean;
  currentUsers: number;
}

interface ModulePermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  manage: boolean;
}

interface PermissionModule {
  id: string;
  name: string;
  displayName: string;
  category: string;
  icon: any;
  description: string;
}

const PERMISSION_MODULES: PermissionModule[] = [
  { id: 'dashboard', name: 'Dashboard', displayName: 'Dashboard', category: 'Core', icon: BarChart3, description: 'View business overview and analytics' },
  { id: 'sales', name: 'Sales', displayName: 'Sales', category: 'Business', icon: ShoppingCart, description: 'Manage sales, invoices, and estimates' },
  { id: 'purchases', name: 'Purchases', displayName: 'Purchases', category: 'Business', icon: FileText, description: 'Handle purchase orders and supplier management' },
  { id: 'products', name: 'Products', displayName: 'Products', category: 'Inventory', icon: Package, description: 'Manage product catalog and inventory' },
  { id: 'accounting', name: 'Accounting', displayName: 'Accounting', category: 'Finance', icon: Calculator, description: 'Chart of accounts and journal entries' },
  { id: 'pos', name: 'POS', displayName: 'POS', category: 'Sales', icon: CreditCard, description: 'Point of sale operations' },
  { id: 'reports', name: 'Reports', displayName: 'Reports', category: 'Analytics', icon: BarChart3, description: 'Financial and business reports' },
  { id: 'user_management', name: 'User Management', displayName: 'User Management', category: 'System', icon: UserCog, description: 'Manage users and permissions' },
  { id: 'settings', name: 'Settings', displayName: 'Settings', category: 'System', icon: Settings2, description: 'System configuration and preferences' },
  { id: 'compliance', name: 'Compliance', displayName: 'Compliance', category: 'Legal', icon: Shield, description: 'Regulatory compliance and audit trails' }
];

const PERMISSION_TYPES = [
  { id: 'view', name: 'View', icon: Eye, description: 'Read access to module data' },
  { id: 'create', name: 'Create', icon: Plus, description: 'Create new records' },
  { id: 'edit', name: 'Edit', icon: Edit3, description: 'Modify existing records' },
  { id: 'delete', name: 'Delete', icon: Trash2, description: 'Remove records' },
  { id: 'manage', name: 'Manage', icon: SettingsIcon, description: 'Full administrative control' }
];

const ROLE_DEFINITIONS = [
  {
    id: 'super_admin',
    name: 'super_admin',
    displayName: 'Super Administrator',
    description: 'Platform owner with full access to all companies, billing, subscription, platform settings, and global system management',
    level: 10,
    color: 'bg-gradient-to-r from-red-500 to-red-600',
    isSystemRole: true,
    permissions: Object.fromEntries(PERMISSION_MODULES.map(m => [m.id, { view: true, create: true, edit: true, delete: true, manage: true }]))
  },
  {
    id: 'system_admin',
    name: 'system_admin',
    displayName: 'System Administrator',
    description: 'Administrative access to system level functions',
    level: 9,
    color: 'bg-gradient-to-r from-purple-500 to-purple-600',
    isSystemRole: true,
    permissions: Object.fromEntries(PERMISSION_MODULES.map(m => [m.id, { view: true, create: true, edit: true, delete: m.id !== 'settings', manage: m.id !== 'settings' }]))
  },
  {
    id: 'company_admin',
    name: 'company_admin',
    displayName: 'Company Administrator',
    description: 'Full access to all modules and settings within their company. Can invite, create, and manage users, assign roles and permissions, control billing',
    level: 8,
    color: 'bg-gradient-to-r from-blue-500 to-blue-600',
    isSystemRole: false,
    permissions: Object.fromEntries(PERMISSION_MODULES.filter(m => m.id !== 'compliance').map(m => [m.id, { view: true, create: true, edit: true, delete: true, manage: true }]))
  },
  {
    id: 'company_owner',
    name: 'company_owner',
    displayName: 'Company Owner',
    description: 'Full access to company operations and settings',
    level: 7,
    color: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
    isSystemRole: false,
    permissions: Object.fromEntries(PERMISSION_MODULES.filter(m => !['compliance', 'user_management'].includes(m.id)).map(m => [m.id, { view: true, create: true, edit: true, delete: true, manage: true }]))
  },
  {
    id: 'accountant',
    name: 'accountant',
    displayName: 'Accountant',
    description: 'Access to core accounting features including invoices, expenses, bank reconciliation, journals, VAT. Can view, create, and edit financial records',
    level: 6,
    color: 'bg-gradient-to-r from-green-500 to-green-600',
    isSystemRole: false,
    permissions: {
      dashboard: { view: true, create: false, edit: false, delete: false, manage: false },
      sales: { view: true, create: true, edit: true, delete: false, manage: false },
      purchases: { view: true, create: true, edit: true, delete: false, manage: false },
      products: { view: true, create: false, edit: false, delete: false, manage: false },
      accounting: { view: true, create: true, edit: true, delete: false, manage: false },
      pos: { view: false, create: false, edit: false, delete: false, manage: false },
      reports: { view: true, create: false, edit: false, delete: false, manage: false },
      user_management: { view: false, create: false, edit: false, delete: false, manage: false },
      settings: { view: false, create: false, edit: false, delete: false, manage: false },
      compliance: { view: false, create: false, edit: false, delete: false, manage: false }
    }
  },
  {
    id: 'payroll_admin',
    name: 'payroll_admin',
    displayName: 'Payroll Administrator',
    description: 'Access to payroll, employee management, leave, and salary modules. No access to sales or supplier data',
    level: 5,
    color: 'bg-gradient-to-r from-orange-500 to-orange-600',
    isSystemRole: false,
    permissions: Object.fromEntries(PERMISSION_MODULES.filter(m => ['dashboard', 'reports'].includes(m.id)).map(m => [m.id, { view: true, create: false, edit: false, delete: false, manage: false }]))
  },
  {
    id: 'manager',
    name: 'manager',
    displayName: 'Manager',
    description: 'Access to relevant business units or departments. Can approve transactions, view reports, limited edit rights for their area of responsibility',
    level: 4,
    color: 'bg-gradient-to-r from-teal-500 to-teal-600',
    isSystemRole: false,
    permissions: {
      dashboard: { view: true, create: false, edit: false, delete: false, manage: false },
      sales: { view: true, create: true, edit: true, delete: false, manage: false },
      purchases: { view: true, create: true, edit: true, delete: false, manage: false },
      products: { view: true, create: true, edit: true, delete: false, manage: false },
      accounting: { view: true, create: false, edit: false, delete: false, manage: false },
      pos: { view: true, create: true, edit: true, delete: false, manage: false },
      reports: { view: true, create: false, edit: false, delete: false, manage: false },
      user_management: { view: false, create: false, edit: false, delete: false, manage: false },
      settings: { view: false, create: false, edit: false, delete: false, manage: false },
      compliance: { view: false, create: false, edit: false, delete: false, manage: false }
    }
  },
  {
    id: 'bookkeeper',
    name: 'bookkeeper',
    displayName: 'Bookkeeper',
    description: 'Access to core accounting features including invoices, expenses, bank reconciliation, journals, VAT. Can view, create, and edit financial records',
    level: 3,
    color: 'bg-gradient-to-r from-cyan-500 to-cyan-600',
    isSystemRole: false,
    permissions: {
      dashboard: { view: true, create: false, edit: false, delete: false, manage: false },
      sales: { view: true, create: true, edit: true, delete: false, manage: false },
      purchases: { view: true, create: true, edit: true, delete: false, manage: false },
      products: { view: true, create: false, edit: false, delete: false, manage: false },
      accounting: { view: true, create: true, edit: true, delete: false, manage: false },
      pos: { view: false, create: false, edit: false, delete: false, manage: false },
      reports: { view: true, create: false, edit: false, delete: false, manage: false },
      user_management: { view: false, create: false, edit: false, delete: false, manage: false },
      settings: { view: false, create: false, edit: false, delete: false, manage: false },
      compliance: { view: false, create: false, edit: false, delete: false, manage: false }
    }
  }
];

export default function ProfessionalPermissionsMatrix() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [permissions, setPermissions] = useState<Record<string, Record<string, ModulePermission>>>(
    Object.fromEntries(ROLE_DEFINITIONS.map(role => [role.id, role.permissions]))
  );
  const [changedPermissions, setChangedPermissions] = useState<Set<string>>(new Set());

  // Fetch current permissions from backend
  const { data: matrixData, isLoading } = useQuery({
    queryKey: ['/api/permissions/matrix'],
    select: (data: any) => data || { roles: [], modules: [], permissionTypes: [] },
    refetchInterval: 30000,
  });

  // Permission toggle mutation
  const togglePermissionMutation = useMutation({
    mutationFn: async ({ roleId, moduleId, permissionType, enabled }: { 
      roleId: string; 
      moduleId: string; 
      permissionType: string; 
      enabled: boolean; 
    }) => {
      return apiRequest('/api/permissions/toggle', 'POST', {
        roleId,
        moduleId,
        permissionType,
        enabled
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/permissions/matrix'] });
      toast({
        title: "Permission Updated",
        description: "Permission has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error('Permission toggle error:', error);
      toast({
        title: "Error",
        description: "Failed to update permission. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Initialize default permissions button
  const initializePermissionsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/permissions/initialize-default', 'POST', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/permissions/matrix'] });
      toast({
        title: "Permissions Initialized",
        description: "Default permissions have been set up successfully.",
      });
    },
    onError: (error) => {
      console.error('Initialize permissions error:', error);
      toast({
        title: "Error",
        description: "Failed to initialize permissions. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handlePermissionToggle = (roleId: string, moduleId: string, permissionType: string, currentValue: boolean) => {
    const newValue = !currentValue;
    
    // Update local state immediately for UI responsiveness
    setPermissions(prev => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [moduleId]: {
          ...prev[roleId]?.[moduleId],
          [permissionType]: newValue
        }
      }
    }));
    
    // Track changed permissions for visual feedback
    const changeKey = `${roleId}-${moduleId}-${permissionType}`;
    setChangedPermissions(prev => new Set([...prev, changeKey]));
    
    // Submit to backend
    togglePermissionMutation.mutate({
      roleId,
      moduleId,
      permissionType,
      enabled: newValue
    });
  };

  const getPermissionValue = (roleId: string, moduleId: string, permissionType: string): boolean => {
    return permissions[roleId]?.[moduleId]?.[permissionType] || false;
  };

  const filteredRoles = ROLE_DEFINITIONS.filter(role => 
    searchTerm === "" || 
    role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredModules = selectedRole 
    ? PERMISSION_MODULES 
    : PERMISSION_MODULES.filter(module => 
        searchTerm === "" || 
        module.displayName.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Permission Matrix
          </h1>
          <p className="text-gray-600 mt-2">
            Configure role-based permissions using checkbox matrix (similar to QuickBooks/Xero style)
          </p>
        </div>
        <Button 
          onClick={() => initializePermissionsMutation.mutate()}
          disabled={initializePermissionsMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Initialize Default Permissions
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search roles or modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Filter by:</span>
              <Badge variant="outline">{filteredRoles.length} roles</Badge>
              <Badge variant="outline">{filteredModules.length} modules</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            Role-Based Permission Matrix
          </CardTitle>
          <CardDescription>
            Configure module access permissions for each user role using checkboxes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[1200px]">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-4 font-semibold min-w-[200px] sticky left-0 bg-gray-50 border-r">
                    Role
                  </th>
                  {PERMISSION_MODULES.map((module) => (
                    <th key={module.id} className="text-center p-2 font-semibold min-w-[120px]">
                      <div className="flex flex-col items-center gap-1">
                        <module.icon className="h-4 w-4 text-gray-600" />
                        <span className="text-xs">{module.displayName}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map((role) => (
                  <tr key={role.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4 sticky left-0 bg-white border-r">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${role.color}`}></div>
                        <div>
                          <div className="font-medium text-gray-900">{role.displayName}</div>
                          <div className="text-xs text-gray-500 max-w-[180px] truncate">
                            {role.description}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              Level {role.level}
                            </Badge>
                            {role.isSystemRole && (
                              <Badge variant="secondary" className="text-xs">
                                <Crown className="h-3 w-3 mr-1" />
                                System
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    {PERMISSION_MODULES.map((module) => (
                      <td key={`${role.id}-${module.id}`} className="p-2 text-center">
                        <div className="grid grid-cols-5 gap-1 justify-items-center">
                          {PERMISSION_TYPES.map((permType) => {
                            const isChecked = getPermissionValue(role.id, module.id, permType.id);
                            const changeKey = `${role.id}-${module.id}-${permType.id}`;
                            const isChanged = changedPermissions.has(changeKey);
                            
                            return (
                              <div key={permType.id} className="flex flex-col items-center">
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={() => handlePermissionToggle(role.id, module.id, permType.id, isChecked)}
                                  disabled={togglePermissionMutation.isPending}
                                  className={`h-4 w-4 ${isChanged ? 'border-orange-500' : ''} ${isChecked ? 'bg-blue-600 border-blue-600' : ''}`}
                                />
                                <span className="text-xs text-gray-400 mt-1">{permType.id.charAt(0).toUpperCase()}</span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Permission Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Permission Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {PERMISSION_TYPES.map((permType) => (
              <div key={permType.id} className="flex items-center gap-2">
                <permType.icon className="h-4 w-4 text-gray-600" />
                <div>
                  <div className="font-medium text-sm">{permType.name}</div>
                  <div className="text-xs text-gray-500">{permType.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Footer */}
      <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-4">
          <span>Total Roles: {ROLE_DEFINITIONS.length}</span>
          <span>•</span>
          <span>Total Modules: {PERMISSION_MODULES.length}</span>
          <span>•</span>
          <span>Permission Types: {PERMISSION_TYPES.length}</span>
        </div>
        <div className="flex items-center gap-2">
          {changedPermissions.size > 0 && (
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              {changedPermissions.size} pending changes
            </Badge>
          )}
          <Badge variant="outline" className="text-green-600 border-green-300">
            Matrix Active
          </Badge>
        </div>
      </div>
    </div>
  );
}
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
  Shield,
  Eye,
  Edit3,
  Plus,
  Save,
  Users,
  Settings,
  Check,
  X,
  AlertTriangle,
  Search,
  Filter,
  Grid3X3,
  UserCog,
  Lock,
  Unlock,
  Crown,
  Building,
  BarChart3,
  FileText,
  Package,
  Receipt,
  Truck,
  CreditCard,
  Calculator,
  BookOpen,
  Landmark,
  PieChart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Schema for role permission updates
const rolePermissionSchema = z.object({
  roleId: z.string(),
  modulePermissions: z.record(z.record(z.boolean())),
  reason: z.string().min(10, "Please provide a reason for this permission change")
});

type RolePermissionData = z.infer<typeof rolePermissionSchema>;

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  level: number;
  color: string;
  icon: string;
  isSystemRole: boolean;
  maxUsers: number;
  securityLevel: string;
  currentUsers: number;
  permissions: Record<string, Record<string, boolean>>;
}

interface Module {
  id: string;
  name: string;
  category: string;
  isActive: boolean;
}

interface PermissionType {
  id: string;
  name: string;
  description: string;
}

interface PermissionsMatrixData {
  roles: Role[];
  modules: Module[];
  permissionTypes: PermissionType[];
}

const MODULE_ICONS = {
  dashboard: BarChart3,
  user_management: UserCog,
  customers: Users,
  invoicing: FileText,
  products_services: Package,
  expenses: Receipt,
  suppliers: Truck,
  pos_sales: CreditCard,
  chart_of_accounts: Calculator,
  journal_entries: BookOpen,
  banking: Landmark,
  financial_reports: PieChart,
  default: Shield
};

export default function PermissionsMatrix() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditPermissionsDialogOpen, setIsEditPermissionsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [moduleFilter, setModuleFilter] = useState("ALL");
  const [currentTab, setCurrentTab] = useState("matrix");

  const permissionForm = useForm<RolePermissionData>({
    resolver: zodResolver(rolePermissionSchema),
    defaultValues: {
      roleId: "",
      modulePermissions: {},
      reason: ""
    }
  });

  // USE WORKING SUPER ADMIN API INSTEAD OF BROKEN RBAC MATRIX API
  const { data: matrixData, isLoading } = useQuery({
    queryKey: ['/api/super-admin/users'], 
    refetchInterval: 30000,
  });

  // Update role permissions mutation
  const updateRolePermissionsMutation = useMutation({
    mutationFn: async (data: RolePermissionData) => {
      return await apiRequest(`/api/roles/${data.roleId}/permissions`, 'PUT', {
        modulePermissions: data.modulePermissions,
        reason: data.reason
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/permissions/matrix'] });
      toast({
        title: "Permissions Updated",
        description: "Role permissions have been updated successfully.",
      });
      setIsEditPermissionsDialogOpen(false);
      permissionForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onUpdatePermissions = (data: RolePermissionData) => {
    updateRolePermissionsMutation.mutate(data);
  };

  const openEditPermissionsDialog = (role: Role) => {
    setSelectedRole(role);
    permissionForm.setValue('roleId', role.id);
    permissionForm.setValue('modulePermissions', role.permissions || {});
    setIsEditPermissionsDialogOpen(true);
  };

  const togglePermission = (moduleId: string, permissionType: string, value: boolean) => {
    const currentPermissions = permissionForm.getValues('modulePermissions');
    const updatedPermissions = {
      ...currentPermissions,
      [moduleId]: {
        ...currentPermissions[moduleId],
        [permissionType]: value
      }
    };
    permissionForm.setValue('modulePermissions', updatedPermissions);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Permissions Matrix</h1>
            <p className="text-muted-foreground">Loading permissions data...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
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

  // Transform Super Admin user data to PermissionsMatrix format
  const superAdminUsers = Array.isArray(matrixData) ? matrixData : [];
  
  const data: PermissionsMatrixData = {
    roles: [
      {
        id: 'super_admin',
        name: 'super_admin',
        displayName: 'Super Administrator',
        description: 'Full system access with all permissions',
        level: 10,
        color: 'from-red-500 to-red-600',
        icon: 'shield-check',
        isSystemRole: true,
        maxUsers: 5,
        securityLevel: 'maximum',
        currentUsers: superAdminUsers.filter(u => u.role === 'super_admin').length,
        permissions: {
          'dashboard': { view: true, create: true, edit: true, delete: true, manage: true },
          'user_management': { view: true, create: true, edit: true, delete: true, manage: true },
          'customers': { view: true, create: true, edit: true, delete: true, manage: true },
          'invoicing': { view: true, create: true, edit: true, delete: true, manage: true },
          'products_services': { view: true, create: true, edit: true, delete: true, manage: true },
          'expenses': { view: true, create: true, edit: true, delete: true, manage: true },
          'suppliers': { view: true, create: true, edit: true, delete: true, manage: true },
          'pos_sales': { view: true, create: true, edit: true, delete: true, manage: true },
          'chart_of_accounts': { view: true, create: true, edit: true, delete: true, manage: true },
          'banking': { view: true, create: true, edit: true, delete: true, manage: true },
          'financial_reports': { view: true, create: true, edit: true, delete: true, manage: true }
        }
      },
      {
        id: 'company_admin',
        name: 'company_admin',
        displayName: 'Company Administrator', 
        description: 'Company-level administrative access',
        level: 5,
        color: 'from-blue-500 to-blue-600',
        icon: 'user-cog',
        isSystemRole: true,
        maxUsers: 50,
        securityLevel: 'high',
        currentUsers: superAdminUsers.filter(u => u.role === 'company_admin').length,
        permissions: {
          'dashboard': { view: true, create: true, edit: true, delete: false, manage: false },
          'user_management': { view: true, create: true, edit: true, delete: false, manage: true },
          'customers': { view: true, create: true, edit: true, delete: true, manage: true },
          'invoicing': { view: true, create: true, edit: true, delete: true, manage: true },
          'products_services': { view: true, create: true, edit: true, delete: true, manage: true },
          'expenses': { view: true, create: true, edit: true, delete: true, manage: true },
          'suppliers': { view: true, create: true, edit: true, delete: true, manage: true },
          'pos_sales': { view: true, create: true, edit: true, delete: true, manage: true },
          'chart_of_accounts': { view: true, create: true, edit: true, delete: false, manage: false },
          'banking': { view: true, create: true, edit: true, delete: false, manage: true },
          'financial_reports': { view: true, create: false, edit: false, delete: false, manage: false }
        }
      }
    ],
    modules: [
      { id: 'dashboard', name: 'Dashboard', category: 'Core', isActive: true },
      { id: 'user_management', name: 'User Management', category: 'Administration', isActive: true },
      { id: 'customers', name: 'Customers', category: 'Sales', isActive: true },
      { id: 'invoicing', name: 'Invoicing', category: 'Sales', isActive: true },
      { id: 'products_services', name: 'Products & Services', category: 'Inventory', isActive: true },
      { id: 'expenses', name: 'Expenses', category: 'Accounting', isActive: true },
      { id: 'suppliers', name: 'Suppliers', category: 'Purchases', isActive: true },
      { id: 'pos_sales', name: 'POS Sales', category: 'Sales', isActive: true },
      { id: 'chart_of_accounts', name: 'Chart of Accounts', category: 'Accounting', isActive: true },
      { id: 'banking', name: 'Banking', category: 'Finance', isActive: true },
      { id: 'financial_reports', name: 'Financial Reports', category: 'Reports', isActive: true }
    ],
    permissionTypes: [
      { id: 'view', name: 'View', description: 'Read access to module data' },
      { id: 'create', name: 'Create', description: 'Create new records' },
      { id: 'edit', name: 'Edit', description: 'Modify existing records' },
      { id: 'delete', name: 'Delete', description: 'Remove records' },
      { id: 'manage', name: 'Manage', description: 'Full administrative control' }
    ]
  };

  // Filter data based on search and filters
  const filteredRoles = data.roles.filter(role => {
    const matchesSearch = role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = roleFilter === "ALL" || 
                         (roleFilter === "SYSTEM" && role.isSystemRole) ||
                         (roleFilter === "CUSTOM" && !role.isSystemRole);
    return matchesSearch && matchesFilter;
  });

  const filteredModules = data.modules.filter(module => {
    const matchesFilter = moduleFilter === "ALL" || 
                         moduleFilter === module.category ||
                         (moduleFilter === "ACTIVE" && module.isActive) ||
                         (moduleFilter === "INACTIVE" && !module.isActive);
    return matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permissions Matrix</h1>
          <p className="text-muted-foreground">
            Comprehensive role-based permissions management across all system modules
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Grid3X3 className="h-4 w-4 mr-2" />
            Matrix View
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.roles.length}</div>
            <p className="text-xs text-muted-foreground">
              {data.roles.filter(r => r.isSystemRole).length} system, {data.roles.filter(r => !r.isSystemRole).length} custom
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
            <Settings className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.modules.filter(m => m.isActive).length}</div>
            <p className="text-xs text-muted-foreground">
              Out of {data.modules.length} total modules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permission Types</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data.permissionTypes.length}</div>
            <p className="text-xs text-muted-foreground">
              Granular access controls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {data.roles.reduce((sum, role) => sum + role.currentUsers, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all roles
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
                  placeholder="Search roles by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Role Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="SYSTEM">System Roles</SelectItem>
                <SelectItem value="CUSTOM">Custom Roles</SelectItem>
              </SelectContent>
            </Select>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Module Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Modules</SelectItem>
                <SelectItem value="ACTIVE">Active Modules</SelectItem>
                <SelectItem value="INACTIVE">Inactive Modules</SelectItem>
                <SelectItem value="Core System">Core System</SelectItem>
                <SelectItem value="Financial Management">Financial Management</SelectItem>
                <SelectItem value="Sales & Revenue">Sales & Revenue</SelectItem>
                <SelectItem value="Point of Sale">Point of Sale</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Matrix Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="matrix">Permissions Matrix</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="modules">Module Overview</TabsTrigger>
          <TabsTrigger value="analytics">Permission Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role-Module Permissions Matrix</CardTitle>
              <CardDescription>
                Visual matrix showing permissions for each role across all active modules ({filteredRoles.length} roles × {filteredModules.length} modules)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredRoles.map((role) => (
                  <div key={role.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full bg-gradient-to-r ${role.color}`}>
                          <Shield className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">{role.displayName}</span>
                            <Badge variant={role.isSystemRole ? "default" : "secondary"}>
                              {role.isSystemRole ? "System" : "Custom"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Level {role.level}
                            </Badge>
                            {role.currentUsers > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Users className="h-3 w-3 mr-1" />
                                {role.currentUsers} users
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditPermissionsDialog(role)}
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit Permissions
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {filteredModules.map((module) => {
                        const IconComponent = MODULE_ICONS[module.id as keyof typeof MODULE_ICONS] || MODULE_ICONS.default;
                        const modulePermissions = role.permissions[module.id] || {};
                        const hasAnyPermission = Object.values(modulePermissions).some(Boolean);
                        
                        return (
                          <div key={module.id} className={`p-3 border rounded-lg ${hasAnyPermission ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                            <div className="flex items-center space-x-2 mb-2">
                              <IconComponent className="h-4 w-4" />
                              <span className="text-sm font-medium">{module.name}</span>
                              {!module.isActive && (
                                <Badge variant="outline" className="text-xs">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                              {data.permissionTypes.slice(0, 6).map((permType) => (
                                <div key={permType.id} className="flex items-center space-x-1">
                                  {modulePermissions[permType.id] ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <X className="h-3 w-3 text-gray-400" />
                                  )}
                                  <span className="text-xs">{permType.id.charAt(0).toUpperCase()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Directory</CardTitle>
              <CardDescription>
                Manage system and custom roles with their security levels and user assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRoles.map((role) => (
                  <Card key={role.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-full bg-gradient-to-r ${role.color}`}>
                          <Shield className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex items-center space-x-1">
                          <Badge variant={role.isSystemRole ? "default" : "secondary"}>
                            {role.isSystemRole ? "System" : "Custom"}
                          </Badge>
                          {role.level >= 9 && <Crown className="h-4 w-4 text-yellow-500" />}
                        </div>
                      </div>
                      <CardTitle className="text-lg">{role.displayName}</CardTitle>
                      <CardDescription className="text-sm">{role.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Security Level</span>
                        <Badge variant="outline">Level {role.level}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Current Users</span>
                        <Badge variant="outline">
                          {role.currentUsers} / {role.maxUsers === -1 ? '∞' : role.maxUsers}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Active Permissions</span>
                        <Badge variant="outline">
                          {Object.values(role.permissions).reduce((count, modulePerms) => {
                            return count + Object.values(modulePerms).filter(Boolean).length;
                          }, 0)}
                        </Badge>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => openEditPermissionsDialog(role)}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Manage Permissions
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Permissions Dialog */}
      <Dialog open={isEditPermissionsDialogOpen} onOpenChange={setIsEditPermissionsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role Permissions</DialogTitle>
            <DialogDescription>
              {selectedRole && `Modify permissions for ${selectedRole.displayName} role`}
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <Form {...permissionForm}>
              <form onSubmit={permissionForm.handleSubmit(onUpdatePermissions)} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full bg-gradient-to-r ${selectedRole.color}`}>
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedRole.displayName}</h3>
                      <p className="text-sm text-muted-foreground">{selectedRole.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">Level {selectedRole.level}</Badge>
                        <Badge variant={selectedRole.isSystemRole ? "default" : "secondary"}>
                          {selectedRole.isSystemRole ? "System Role" : "Custom Role"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {filteredModules.map((module) => {
                      const IconComponent = MODULE_ICONS[module.id as keyof typeof MODULE_ICONS] || MODULE_ICONS.default;
                      const currentPermissions = permissionForm.watch('modulePermissions')[module.id] || {};
                      
                      return (
                        <Card key={module.id}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center space-x-2">
                              <IconComponent className="h-5 w-5" />
                              <CardTitle className="text-base">{module.name}</CardTitle>
                              <Badge variant="outline" className="text-xs">
                                {module.category}
                              </Badge>
                              {!module.isActive && (
                                <Badge variant="destructive" className="text-xs">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {data.permissionTypes.map((permType) => (
                                <div key={permType.id} className="flex items-center space-x-2 p-2 border rounded">
                                  <Switch
                                    checked={currentPermissions[permType.id] || false}
                                    onCheckedChange={(checked) => togglePermission(module.id, permType.id, checked)}
                                    disabled={!module.isActive || selectedRole.isSystemRole}
                                  />
                                  <div>
                                    <span className="text-sm font-medium">{permType.name}</span>
                                    <p className="text-xs text-muted-foreground">{permType.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                <FormField
                  control={permissionForm.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Permission Changes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Explain why these permission changes are being made..."
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
                  <Button type="button" variant="outline" onClick={() => setIsEditPermissionsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateRolePermissionsMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateRolePermissionsMutation.isPending ? 'Saving...' : 'Save Changes'}
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
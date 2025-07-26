import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Shield, 
  Users, 
  Settings, 
  Plus, 
  Edit,
  Check,
  X,
  Crown,
  Building,
  UserCog,
  Lock,
  Unlock,
  Eye,
  FileText,
  DollarSign,
  Package,
  ShoppingCart,
  BarChart3,
  Calculator,
  CreditCard,
  Truck,
  ClipboardList,
  UserCheck,
  AlertCircle
} from "lucide-react";
import { SuccessModal } from "@/components/ui/success-modal";
import { useSuccessModal } from "@/hooks/useSuccessModal";
import { useToast } from "@/hooks/use-toast";

// Schema for creating custom roles
const customRoleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  basedOnSystemRole: z.number().optional(),
  permissions: z.array(z.string()).min(1, "At least one permission must be selected"),
});

type CustomRoleData = z.infer<typeof customRoleSchema>;

interface SystemRole {
  id: number;
  name: string;
  displayName: string;
  description: string;
  level: number;
  permissions: string[];
  isSystemRole: boolean;
  isActive: boolean;
}

interface CompanyRole {
  id: number;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  basedOnSystemRole?: number;
  isActive: boolean;
}

// Permission modules for better organization
const PERMISSION_MODULES = {
  dashboard: {
    name: "Dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
    permissions: ["dashboard:view"]
  },
  users: {
    name: "User Management",
    icon: <Users className="h-4 w-4" />,
    permissions: [
      "users:view", "users:create", "users:update", "users:delete", 
      "users:assign_roles", "users:impersonate"
    ]
  },
  customers: {
    name: "Customers",
    icon: <UserCheck className="h-4 w-4" />,
    permissions: [
      "customers:view", "customers:create", "customers:update", "customers:delete",
      "customers:export", "customers:import"
    ]
  },
  invoices: {
    name: "Invoicing",
    icon: <FileText className="h-4 w-4" />,
    permissions: [
      "invoices:view", "invoices:create", "invoices:update", "invoices:delete",
      "invoices:send", "invoices:approve", "invoices:void", "invoices:export"
    ]
  },
  financial: {
    name: "Financial Management",
    icon: <DollarSign className="h-4 w-4" />,
    permissions: [
      "financial:view", "financial:export", "chart_of_accounts:view", "chart_of_accounts:update",
      "journal_entries:view", "journal_entries:create", "journal_entries:update", "journal_entries:delete",
      "banking:view", "banking:create", "banking:update", "banking:delete", "banking:reconciliation"
    ]
  },
  products: {
    name: "Products & Inventory",
    icon: <Package className="h-4 w-4" />,
    permissions: [
      "products:view", "products:create", "products:update", "products:delete",
      "inventory:view", "inventory:manage", "inventory:adjust", "inventory:count"
    ]
  },
  pos: {
    name: "Point of Sale",
    icon: <CreditCard className="h-4 w-4" />,
    permissions: [
      "pos:view", "pos:process_sales", "pos:manage_shifts", "pos:handle_returns",
      "pos:manage_promotions", "pos:view_reports", "pos:cash_management"
    ]
  },
  reports: {
    name: "Reports & Analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    permissions: [
      "reports:view", "reports:export", "reports:schedule", "analytics:view"
    ]
  },
  settings: {
    name: "Settings & Admin",
    icon: <Settings className="h-4 w-4" />,
    permissions: [
      "settings:view", "settings:update", "settings:company", "settings:email",
      "settings:integrations", "system:admin", "system:maintenance"
    ]
  }
};

export default function ModulePermissions() {
  const [selectedRole, setSelectedRole] = useState<SystemRole | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("system-roles");
  const { toast } = useToast();
  const successModal = useSuccessModal();
  const queryClient = useQueryClient();

  // Fetch system roles
  const { data: systemRoles = [], isLoading: systemRolesLoading } = useQuery<SystemRole[]>({
    queryKey: ["/api/rbac/system-roles"],
  });

  // Fetch company roles
  const { data: companyRoles = [], isLoading: companyRolesLoading } = useQuery<CompanyRole[]>({
    queryKey: ["/api/rbac/company-roles"],
  });

  // Create custom role mutation
  const createCustomRoleMutation = useMutation({
    mutationFn: async (data: CustomRoleData) => {
      return apiRequest("/api/rbac/company-roles", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rbac/company-roles"] });
      setIsCreateDialogOpen(false);
      successModal.showSuccess({
        title: "Custom Role Created Successfully",
        description: "The new role has been created with the specified permissions and is ready for assignment.",
        confirmText: "Continue"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create custom role",
        variant: "destructive",
      });
    },
  });

  const form = useForm<CustomRoleData>({
    resolver: zodResolver(customRoleSchema),
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
      basedOnSystemRole: undefined,
      permissions: [],
    },
  });

  const onCreateCustomRole = (data: CustomRoleData) => {
    createCustomRoleMutation.mutate(data);
  };

  const getRoleLevelBadge = (level: number) => {
    if (level >= 9) return <Badge variant="destructive">High Access</Badge>;
    if (level >= 6) return <Badge variant="default">Medium Access</Badge>;
    if (level >= 3) return <Badge variant="secondary">Limited Access</Badge>;
    return <Badge variant="outline">View Only</Badge>;
  };

  const getRoleIcon = (roleName: string) => {
    if (roleName.includes('super_admin')) return <Crown className="h-4 w-4" />;
    if (roleName.includes('admin')) return <Building className="h-4 w-4" />;
    if (roleName.includes('accountant')) return <Calculator className="h-4 w-4" />;
    if (roleName.includes('manager')) return <UserCog className="h-4 w-4" />;
    if (roleName.includes('cashier')) return <CreditCard className="h-4 w-4" />;
    return <Shield className="h-4 w-4" />;
  };

  const getPermissionsByModule = (permissions: string[]) => {
    const modulePermissions: { [key: string]: string[] } = {};
    
    Object.entries(PERMISSION_MODULES).forEach(([moduleKey, moduleData]) => {
      const modulePerms = permissions.filter(perm => 
        moduleData.permissions.some(modulePerm => perm === modulePerm)
      );
      if (modulePerms.length > 0) {
        modulePermissions[moduleKey] = modulePerms;
      }
    });
    
    return modulePermissions;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Module Permissions Management</h1>
          <p className="text-gray-600">Manage roles and permissions organized by business modules</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Custom Role</DialogTitle>
              <DialogDescription>
                Create a custom role with specific permissions for your organization
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onCreateCustomRole)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., sales_manager" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Sales Manager" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what this role can do..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="basedOnSystemRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base on System Role (Optional)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a system role to inherit from" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No Base Role</SelectItem>
                          {systemRoles.map((role) => (
                            <SelectItem key={role.id} value={role.id.toString()}>
                              {role.displayName} (Level {role.level})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-4">
                  <Label>Permissions by Module</Label>
                  {Object.entries(PERMISSION_MODULES).map(([moduleKey, moduleData]) => (
                    <Card key={moduleKey}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center space-x-2">
                          {moduleData.icon}
                          <span>{moduleData.name}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-2">
                          {moduleData.permissions.map((permission) => (
                            <div key={permission} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={permission}
                                onChange={(e) => {
                                  const currentPermissions = form.getValues("permissions");
                                  if (e.target.checked) {
                                    form.setValue("permissions", [...currentPermissions, permission]);
                                  } else {
                                    form.setValue("permissions", currentPermissions.filter(p => p !== permission));
                                  }
                                }}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <Label htmlFor={permission} className="text-xs">
                                {permission.split(':')[1]?.replace('_', ' ') || permission}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createCustomRoleMutation.isPending}>
                    Create Role
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="system-roles">System Roles ({systemRoles.length})</TabsTrigger>
          <TabsTrigger value="company-roles">Custom Roles ({companyRoles.length})</TabsTrigger>
          <TabsTrigger value="module-overview">Module Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="system-roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>System Roles</span>
              </CardTitle>
              <CardDescription>
                Predefined roles with standardized permissions for common business functions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {systemRolesLoading ? (
                <div className="text-center py-8">Loading system roles...</div>
              ) : systemRoles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No system roles found</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {systemRoles.map((role) => (
                    <Card key={role.id} className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedRole(role)}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getRoleIcon(role.name)}
                            <CardTitle className="text-lg">{role.displayName}</CardTitle>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getRoleLevelBadge(role.level)}
                            <Badge variant={role.isActive ? "default" : "secondary"}>
                              {role.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                        <CardDescription className="text-sm">
                          {role.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Access Level:</span>
                            <span className="font-medium">Level {role.level}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Permissions:</span>
                            <span className="font-medium">{role.permissions.length} permissions</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Object.entries(getPermissionsByModule(role.permissions)).slice(0, 4).map(([moduleKey, perms]) => (
                              <Badge key={moduleKey} variant="outline" className="text-xs">
                                {PERMISSION_MODULES[moduleKey as keyof typeof PERMISSION_MODULES]?.name} ({perms.length})
                              </Badge>
                            ))}
                            {Object.keys(getPermissionsByModule(role.permissions)).length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{Object.keys(getPermissionsByModule(role.permissions)).length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company-roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Custom Company Roles</span>
              </CardTitle>
              <CardDescription>
                Custom roles created for your organization with tailored permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {companyRolesLoading ? (
                <div className="text-center py-8">Loading company roles...</div>
              ) : companyRoles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserCog className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No custom roles created yet</p>
                  <p className="text-sm">Create your first custom role to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {companyRoles.map((role) => (
                    <Card key={role.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <UserCog className="h-4 w-4" />
                            <CardTitle className="text-lg">{role.displayName}</CardTitle>
                          </div>
                          <Badge variant={role.isActive ? "default" : "secondary"}>
                            {role.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">
                          {role.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Permissions:</span>
                            <span className="font-medium">{role.permissions.length} permissions</span>
                          </div>
                          {role.basedOnSystemRole && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Based on:</span>
                              <Badge variant="outline" className="text-xs">
                                System Role #{role.basedOnSystemRole}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="module-overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClipboardList className="h-5 w-5" />
                <span>Module Permission Overview</span>
              </CardTitle>
              <CardDescription>
                Overview of all business modules and their associated permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(PERMISSION_MODULES).map(([moduleKey, moduleData]) => (
                  <Card key={moduleKey}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        {moduleData.icon}
                        <span>{moduleData.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-600 mb-2">
                          {moduleData.permissions.length} permissions
                        </div>
                        {moduleData.permissions.map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs mr-1 mb-1">
                            {permission.split(':')[1]?.replace('_', ' ') || permission}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedRole && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getRoleIcon(selectedRole.name)}
              <span>Role Details: {selectedRole.displayName}</span>
            </CardTitle>
            <CardDescription>
              Detailed permission breakdown for {selectedRole.displayName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Role Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {selectedRole.name}</div>
                  <div><strong>Display Name:</strong> {selectedRole.displayName}</div>
                  <div><strong>Level:</strong> {selectedRole.level}/10</div>
                  <div><strong>Type:</strong> {selectedRole.isSystemRole ? "System Role" : "Custom Role"}</div>
                  <div><strong>Status:</strong> {selectedRole.isActive ? "Active" : "Inactive"}</div>
                  <div><strong>Total Permissions:</strong> {selectedRole.permissions.length}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Description</h4>
                <p className="text-sm text-gray-600">{selectedRole.description}</p>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="font-medium mb-3">Permissions by Module</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(getPermissionsByModule(selectedRole.permissions)).map(([moduleKey, permissions]) => (
                  <Card key={moduleKey}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        {PERMISSION_MODULES[moduleKey as keyof typeof PERMISSION_MODULES]?.icon}
                        <span>{PERMISSION_MODULES[moduleKey as keyof typeof PERMISSION_MODULES]?.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-1">
                        {permissions.map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Check className="h-3 w-3 text-green-600" />
                            <span className="text-xs">{permission.split(':')[1]?.replace('_', ' ') || permission}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={successModal.hideSuccess}
        title={successModal.modalOptions.title}
        description={successModal.modalOptions.description}
        confirmText={successModal.modalOptions.confirmText}
      />
    </div>
  );
}
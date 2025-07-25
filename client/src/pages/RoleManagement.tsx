import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Shield, 
  Plus, 
  Edit,
  Eye,
  Crown,
  Building,
  Settings,
  Check,
  X,
  AlertTriangle,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Schema for creating a new role
const createRoleSchema = z.object({
  name: z.string().min(3, "Role name must be at least 3 characters"),
  displayName: z.string().min(3, "Display name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  level: z.number().min(1).max(10),
  permissions: z.array(z.string()),
  isSystemRole: z.boolean(),
  isActive: z.boolean(),
});

type CreateRoleData = z.infer<typeof createRoleSchema>;

interface SystemRole {
  id: number;
  name: string;
  displayName: string;
  description: string;
  level: number;
  isSystemRole: boolean;
  isActive: boolean;
  permissionsList: string[];
  userCount?: number;
  createdAt: string;
  updatedAt?: string;
}

interface Permission {
  name: string;
  displayName: string;
  description: string;
  category: string;
}

// Available permissions organized by category
const PERMISSION_CATEGORIES = {
  "Dashboard": [
    { name: "dashboard:view", displayName: "View Dashboard", description: "Access to main dashboard" }
  ],
  "User Management": [
    { name: "users:view", displayName: "View Users", description: "View user lists and profiles" },
    { name: "users:create", displayName: "Create Users", description: "Create new user accounts" },
    { name: "users:update", displayName: "Update Users", description: "Edit user information" },
    { name: "users:delete", displayName: "Delete Users", description: "Remove user accounts" },
    { name: "users:assign_roles", displayName: "Assign Roles", description: "Assign roles to users" }
  ],
  "Customer Management": [
    { name: "customers:view", displayName: "View Customers", description: "View customer lists and details" },
    { name: "customers:create", displayName: "Create Customers", description: "Add new customers" },
    { name: "customers:update", displayName: "Update Customers", description: "Edit customer information" },
    { name: "customers:delete", displayName: "Delete Customers", description: "Remove customers" }
  ],
  "Financial Management": [
    { name: "invoices:view", displayName: "View Invoices", description: "Access invoice lists and details" },
    { name: "invoices:create", displayName: "Create Invoices", description: "Generate new invoices" },
    { name: "invoices:update", displayName: "Update Invoices", description: "Edit invoice information" },
    { name: "invoices:delete", displayName: "Delete Invoices", description: "Remove invoices" },
    { name: "invoices:send", displayName: "Send Invoices", description: "Email invoices to customers" },
    { name: "invoices:approve", displayName: "Approve Invoices", description: "Approve invoices for sending" },
    { name: "financial:view", displayName: "View Financial Reports", description: "Access financial reports" },
    { name: "financial:export", displayName: "Export Financial Data", description: "Export financial information" }
  ],
  "POS Management": [
    { name: "pos:view", displayName: "View POS", description: "Access POS system" },
    { name: "pos:process_sales", displayName: "Process Sales", description: "Process POS transactions" },
    { name: "pos:handle_returns", displayName: "Handle Returns", description: "Process POS returns" },
    { name: "pos:cash_management", displayName: "Cash Management", description: "Manage cash drawer operations" },
    { name: "pos:manage_shifts", displayName: "Manage Shifts", description: "Open/close POS shifts" },
    { name: "pos:manage_terminals", displayName: "Manage Terminals", description: "Configure POS terminals" },
    { name: "pos:view_reports", displayName: "View POS Reports", description: "Access POS reporting" }
  ],
  "System Administration": [
    { name: "roles:view", displayName: "View Roles", description: "View system roles" },
    { name: "roles:create", displayName: "Create Roles", description: "Create new roles" },
    { name: "roles:update", displayName: "Update Roles", description: "Edit existing roles" },
    { name: "permissions:grant", displayName: "Grant Permissions", description: "Grant permissions to users/roles" },
    { name: "permissions:revoke", displayName: "Revoke Permissions", description: "Remove permissions from users/roles" },
    { name: "settings:view", displayName: "View Settings", description: "Access system settings" },
    { name: "settings:update", displayName: "Update Settings", description: "Modify system configuration" },
    { name: "audit:view", displayName: "View Audit Logs", description: "Access audit trail information" }
  ]
};

export default function RoleManagement() {
  const [selectedRole, setSelectedRole] = useState<SystemRole | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all system roles
  const { data: roles = [], isLoading: rolesLoading } = useQuery<SystemRole[]>({
    queryKey: ["/api/rbac/system-roles"],
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (data: CreateRoleData) => {
      return apiRequest("/api/rbac/roles", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rbac/system-roles"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Role created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create role",
        variant: "destructive",
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async (data: CreateRoleData & { id: number }) => {
      return apiRequest(`/api/rbac/roles/${data.id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rbac/system-roles"] });
      setIsEditDialogOpen(false);
      setSelectedRole(null);
      toast({
        title: "Success",
        description: "Role updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    },
  });

  const form = useForm<CreateRoleData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
      level: 5,
      permissions: [],
      isSystemRole: false,
      isActive: true,
    },
  });

  const editForm = useForm<CreateRoleData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
      level: 5,
      permissions: [],
      isSystemRole: false,
      isActive: true,
    },
  });

  const onCreateRole = (data: CreateRoleData) => {
    createRoleMutation.mutate(data);
  };

  const onUpdateRole = (data: CreateRoleData) => {
    if (!selectedRole) return;
    updateRoleMutation.mutate({ ...data, id: selectedRole.id });
  };

  const handleEditRole = (role: SystemRole) => {
    setSelectedRole(role);
    editForm.reset({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      level: role.level,
      permissions: role.permissionsList || [],
      isSystemRole: role.isSystemRole,
      isActive: role.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const getRoleBadge = (role: SystemRole) => {
    if (role.name === 'super_admin') {
      return (
        <Badge variant="destructive" className="flex items-center">
          <Crown className="h-3 w-3 mr-1" />
          Super Admin
        </Badge>
      );
    }
    if (role.name === 'company_admin') {
      return (
        <Badge variant="default" className="flex items-center">
          <Building className="h-3 w-3 mr-1" />
          Company Admin
        </Badge>
      );
    }
    if (role.isSystemRole) {
      return (
        <Badge variant="secondary" className="flex items-center">
          <Shield className="h-3 w-3 mr-1" />
          System Role
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="flex items-center">
        <Settings className="h-3 w-3 mr-1" />
        Custom Role
      </Badge>
    );
  };

  const getAllPermissions = () => {
    const allPermissions: Permission[] = [];
    Object.entries(PERMISSION_CATEGORIES).forEach(([category, permissions]) => {
      permissions.forEach(permission => {
        allPermissions.push({ ...permission, category });
      });
    });
    return allPermissions;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-gray-600">Create and manage system roles with granular permissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Define a new role with specific permissions and access levels.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onCreateRole)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="role_name_lowercase" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                          />
                        </FormControl>
                        <FormDescription>
                          Internal name for the role (lowercase, underscores)
                        </FormDescription>
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
                          <Input placeholder="Role Display Name" {...field} />
                        </FormControl>
                        <FormDescription>
                          Human-readable name shown in interface
                        </FormDescription>
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
                          placeholder="Describe what this role can do and its purpose..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role Level (1-10)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="10" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Higher levels have more authority
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isSystemRole"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>System Role</FormLabel>
                          <FormDescription>
                            Applies across all companies
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>
                            Role can be assigned to users
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="permissions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Permissions</FormLabel>
                      <FormDescription>
                        Select the permissions this role should have
                      </FormDescription>
                      <div className="space-y-4 max-h-60 overflow-y-auto border rounded-lg p-4">
                        {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => (
                          <div key={category}>
                            <h4 className="font-medium text-sm text-gray-900 mb-2">{category}</h4>
                            <div className="grid grid-cols-1 gap-2 ml-4">
                              {permissions.map((permission) => (
                                <label key={permission.name} className="flex items-center space-x-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={field.value.includes(permission.name)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        field.onChange([...field.value, permission.name]);
                                      } else {
                                        field.onChange(field.value.filter(p => p !== permission.name));
                                      }
                                    }}
                                    className="rounded border-gray-300"
                                  />
                                  <span className="font-medium">{permission.displayName}</span>
                                  <span className="text-gray-500">- {permission.description}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createRoleMutation.isPending}>
                    Create Role
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>System Roles</span>
          </CardTitle>
          <CardDescription>
            Manage role definitions and their associated permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rolesLoading ? (
            <div className="text-center py-8">Loading roles...</div>
          ) : roles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No roles found</div>
          ) : (
            <div className="space-y-4">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Shield className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">{role.displayName}</h3>
                      <p className="text-sm text-gray-600">{role.description}</p>
                      <p className="text-xs text-gray-500">Level {role.level} • {role.permissionsList?.length || 0} permissions</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getRoleBadge(role)}
                    <div className="flex items-center space-x-1">
                      <Badge variant={role.isActive ? "default" : "secondary"}>
                        {role.isActive ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRole(role)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!role.isSystemRole && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRole(role)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRole && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Role Details: {selectedRole.displayName}</span>
            </CardTitle>
            <CardDescription>
              Complete information about {selectedRole.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Role Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {selectedRole.name}</div>
                  <div><strong>Display Name:</strong> {selectedRole.displayName}</div>
                  <div><strong>Description:</strong> {selectedRole.description}</div>
                  <div><strong>Level:</strong> {selectedRole.level}</div>
                  <div><strong>Type:</strong> {selectedRole.isSystemRole ? "System Role" : "Custom Role"}</div>
                  <div><strong>Status:</strong> {selectedRole.isActive ? "Active" : "Inactive"}</div>
                  <div><strong>Users:</strong> {selectedRole.userCount || 0} assigned</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Permissions ({selectedRole.permissionsList?.length || 0})</h4>
                <div className="max-h-60 overflow-y-auto">
                  {selectedRole.permissionsList && selectedRole.permissionsList.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedRole.permissionsList.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission.replace(/[_:]/g, ' ').toLowerCase()}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No permissions assigned</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Role Dialog */}
      {selectedRole && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Role: {selectedRole.displayName}</DialogTitle>
              <DialogDescription>
                Modify role settings and permissions.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onUpdateRole)} className="space-y-4">
                {/* Similar form fields as create dialog, but using editForm */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Role Display Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role Level (1-10)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="10" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Role can be assigned to users
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateRoleMutation.isPending}>
                    Update Role
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
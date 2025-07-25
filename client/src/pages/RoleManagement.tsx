import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Shield, 
  Users, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Crown, 
  Building,
  Lock,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Schema for creating/editing roles
const roleSchema = z.object({
  name: z.string().min(1, "Role name is required").max(100),
  displayName: z.string().min(1, "Display name is required").max(100),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  level: z.number().min(1).max(100).default(1),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface SystemRole {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
  level: number;
  isSystemRole: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CompanyRole {
  id: number;
  companyId: number;
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PermissionGroup {
  [key: string]: Array<{ key: string; value: string }>;
}

export default function RoleManagement() {
  const [editingRole, setEditingRole] = useState<SystemRole | CompanyRole | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("system");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch system roles
  const { data: systemRoles = [], isLoading: systemRolesLoading } = useQuery({
    queryKey: ["/api/rbac/system-roles"],
  });

  // Fetch company roles
  const { data: companyRoles = [], isLoading: companyRolesLoading } = useQuery({
    queryKey: ["/api/rbac/company-roles"],
  });

  // Fetch available permissions
  const { data: permissionGroups = {} } = useQuery<PermissionGroup>({
    queryKey: ["/api/rbac/available-permissions"],
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (data: RoleFormData) => {
      const endpoint = selectedTab === "system" ? "/api/rbac/system-roles" : "/api/rbac/company-roles";
      return apiRequest(endpoint, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rbac/system-roles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rbac/company-roles"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: `${selectedTab === "system" ? "System" : "Company"} role created successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create ${selectedTab === "system" ? "system" : "company"} role`,
        variant: "destructive",
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<RoleFormData> }) => {
      const endpoint = selectedTab === "system" ? `/api/rbac/system-roles/${id}` : `/api/rbac/company-roles/${id}`;
      return apiRequest(endpoint, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rbac/system-roles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rbac/company-roles"] });
      setEditingRole(null);
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

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (id: number) => {
      const endpoint = selectedTab === "system" ? `/api/rbac/system-roles/${id}` : `/api/rbac/company-roles/${id}`;
      return apiRequest(endpoint, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rbac/system-roles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rbac/company-roles"] });
      toast({
        title: "Success",
        description: "Role deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete role",
        variant: "destructive",
      });
    },
  });

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
      permissions: [],
      level: 1,
    },
  });

  const onSubmit = (data: RoleFormData) => {
    if (editingRole) {
      updateRoleMutation.mutate({ id: editingRole.id, data });
    } else {
      createRoleMutation.mutate(data);
    }
  };

  const handleEdit = (role: SystemRole | CompanyRole) => {
    setEditingRole(role);
    form.reset({
      name: role.name,
      displayName: role.displayName,
      description: role.description || "",
      permissions: role.permissions,
      level: 'level' in role ? role.level : 1,
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (id: number, roleName: string) => {
    if (confirm(`Are you sure you want to delete the role "${roleName}"? This action cannot be undone.`)) {
      deleteRoleMutation.mutate(id);
    }
  };

  const renderRoleCard = (role: SystemRole | CompanyRole, isSystem: boolean) => (
    <Card key={role.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isSystem ? (
              <Crown className="h-5 w-5 text-yellow-500" />
            ) : (
              <Building className="h-5 w-5 text-blue-500" />
            )}
            <div>
              <CardTitle className="text-lg">{role.displayName}</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                {role.name} {isSystem && 'isSystemRole' in role && role.isSystemRole && (
                  <Badge variant="secondary" className="ml-2">System Role</Badge>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {'level' in role && (
              <Badge variant="outline">Level {role.level}</Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(role)}
              disabled={isSystem && 'isSystemRole' in role && role.isSystemRole}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(role.id, role.displayName)}
              disabled={isSystem && 'isSystemRole' in role && role.isSystemRole}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {role.description && (
          <p className="text-sm text-gray-600 mb-3">{role.description}</p>
        )}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Permissions ({role.permissions.length})</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {role.permissions.slice(0, 5).map((permission) => (
              <Badge key={permission} variant="secondary" className="text-xs">
                {permission.replace(/_/g, ' ').toLowerCase()}
              </Badge>
            ))}
            {role.permissions.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{role.permissions.length - 5} more
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-gray-600">Manage system and company roles with granular permissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingRole(null); form.reset(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRole ? "Edit Role" : `Create ${selectedTab === "system" ? "System" : "Company"} Role`}
              </DialogTitle>
              <DialogDescription>
                Configure role permissions and access levels for your organization.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., senior_accountant" {...field} />
                      </FormControl>
                      <FormDescription>
                        Unique identifier for the role (lowercase, underscores allowed)
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
                        <Input placeholder="e.g., Senior Accountant" {...field} />
                      </FormControl>
                      <FormDescription>
                        Human-readable name shown in the interface
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the role's responsibilities and access level..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {selectedTab === "system" && (
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Authority Level</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="100" 
                            placeholder="1-100" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormDescription>
                          Higher levels can manage users with lower levels (1-100)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="permissions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Permissions</FormLabel>
                      <div className="space-y-4 max-h-60 overflow-y-auto border rounded p-4">
                        {Object.entries(permissionGroups).map(([groupName, permissions]) => (
                          <div key={groupName} className="space-y-2">
                            <h4 className="font-medium text-sm capitalize">{groupName.replace(/_/g, ' ')}</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {permissions.map((permission) => (
                                <div key={permission.value} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={permission.value}
                                    checked={field.value.includes(permission.value)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([...field.value, permission.value]);
                                      } else {
                                        field.onChange(field.value.filter(p => p !== permission.value));
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={permission.value}
                                    className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {permission.value.replace(/_/g, ' ').toLowerCase()}
                                  </label>
                                </div>
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
                  <Button 
                    type="submit" 
                    disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
                  >
                    {editingRole ? "Update" : "Create"} Role
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <Crown className="h-4 w-4" />
            <span>System Roles</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Company Roles</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>System Roles</span>
              </CardTitle>
              <CardDescription>
                Global roles that apply across all companies in the system. System roles cannot be deleted.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {systemRolesLoading ? (
                <div className="text-center py-8">Loading system roles...</div>
              ) : systemRoles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No system roles found</div>
              ) : (
                <div className="space-y-4">
                  {systemRoles.map((role: SystemRole) => renderRoleCard(role, true))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Company Roles</span>
              </CardTitle>
              <CardDescription>
                Custom roles specific to your company. You can create, edit, and delete company roles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {companyRolesLoading ? (
                <div className="text-center py-8">Loading company roles...</div>
              ) : companyRoles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No company roles created yet</p>
                  <p className="text-sm text-gray-400">Create custom roles for your organization</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {companyRoles.map((role: CompanyRole) => renderRoleCard(role, false))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
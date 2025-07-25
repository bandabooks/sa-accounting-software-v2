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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Users, 
  UserCheck, 
  Shield, 
  Settings, 
  Plus, 
  Edit,
  AlertTriangle,
  Check,
  X,
  Eye,
  UserCog,
  Crown,
  Building
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Schema for role assignment
const assignRoleSchema = z.object({
  userId: z.number(),
  systemRoleId: z.number().optional(),
  companyRoleId: z.number().optional(),
  reason: z.string().optional(),
});

type AssignRoleData = z.infer<typeof assignRoleSchema>;

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface SystemRole {
  id: number;
  name: string;
  displayName: string;
  description: string;
  level: number;
  isSystemRole: boolean;
}

interface CompanyRole {
  id: number;
  name: string;
  displayName: string;
  description: string;
}

interface UserPermission {
  id: number;
  userId: number;
  companyId: number;
  systemRoleId?: number;
  companyRoleId?: number;
  customPermissions: string[];
  deniedPermissions: string[];
  isActive: boolean;
  grantedBy: number;
  grantedAt: string;
  systemRole?: SystemRole;
  companyRole?: CompanyRole;
}

interface UserWithPermissions extends User {
  permissions?: UserPermission;
}

export default function UserPermissions() {
  const [selectedUser, setSelectedUser] = useState<UserWithPermissions | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users with their permissions
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    select: (data: User[]) => {
      return data.map(user => ({
        ...user,
        permissions: undefined // Will be loaded separately
      }));
    }
  });

  // Fetch system roles
  const { data: systemRoles = [] } = useQuery<SystemRole[]>({
    queryKey: ["/api/rbac/system-roles"],
  });

  // Fetch company roles
  const { data: companyRoles = [] } = useQuery<CompanyRole[]>({
    queryKey: ["/api/rbac/company-roles"],
  });

  // Fetch user permissions for selected user
  const { data: userPermissions } = useQuery<UserPermission>({
    queryKey: ["/api/rbac/user-permissions", selectedUser?.id],
    enabled: !!selectedUser,
  });

  // Check permission mutation
  const checkPermissionMutation = useMutation({
    mutationFn: async ({ userId, permission }: { userId: number; permission: string }) => {
      return apiRequest("/api/rbac/check-permission", "POST", { userId, permission });
    },
  });

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: async (data: AssignRoleData) => {
      return apiRequest("/api/rbac/assign-role", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rbac/user-permissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsAssignDialogOpen(false);
      toast({
        title: "Success",
        description: "Role assigned successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive",
      });
    },
  });

  const form = useForm<AssignRoleData>({
    resolver: zodResolver(assignRoleSchema),
    defaultValues: {
      userId: 0,
      systemRoleId: undefined,
      companyRoleId: undefined,
      reason: "",
    },
  });

  const onAssignRole = (data: AssignRoleData) => {
    assignRoleMutation.mutate(data);
  };

  const handleAssignRole = (user: UserWithPermissions) => {
    setSelectedUser(user);
    form.reset({
      userId: user.id,
      systemRoleId: undefined,
      companyRoleId: undefined,
      reason: "",
    });
    setIsAssignDialogOpen(true);
  };

  const getRoleBadge = (user: UserWithPermissions) => {
    if (!user.permissions) {
      return <Badge variant="secondary">No Role</Badge>;
    }

    const { permissions } = user;
    if (permissions.systemRole) {
      const role = permissions.systemRole;
      let variant: "default" | "secondary" | "destructive" | "outline" = "default";
      let icon = <Shield className="h-3 w-3 mr-1" />;

      if (role.name === 'super_admin') {
        variant = "destructive";
        icon = <Crown className="h-3 w-3 mr-1" />;
      } else if (role.name === 'company_admin') {
        variant = "default";
        icon = <Building className="h-3 w-3 mr-1" />;
      } else {
        variant = "secondary";
      }

      return (
        <Badge variant={variant} className="flex items-center">
          {icon}
          {role.displayName}
        </Badge>
      );
    }

    if (permissions.companyRole) {
      return (
        <Badge variant="outline" className="flex items-center">
          <Users className="h-3 w-3 mr-1" />
          {permissions.companyRole.displayName}
        </Badge>
      );
    }

    return <Badge variant="secondary">No Role</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Permissions</h1>
          <p className="text-gray-600">Manage user roles and permissions across the system</p>
        </div>
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setSelectedUser(null); form.reset(); }}>
              <UserCog className="h-4 w-4 mr-2" />
              Assign Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Role to User</DialogTitle>
              <DialogDescription>
                Assign system or company roles to manage user permissions.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onAssignRole)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.name} ({user.username})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="systemRoleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>System Role</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a system role (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No System Role</SelectItem>
                          {systemRoles.map((role) => (
                            <SelectItem key={role.id} value={role.id.toString()}>
                              {role.displayName} (Level {role.level})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        System roles apply globally and have hierarchy levels
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyRoleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Role</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a company role (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Company Role</SelectItem>
                          {companyRoles.map((role) => (
                            <SelectItem key={role.id} value={role.id.toString()}>
                              {role.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Company-specific roles for custom permissions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Explain why this role assignment is being made..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This will be logged for audit purposes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={assignRoleMutation.isPending}>
                    Assign Role
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
            <Users className="h-5 w-5" />
            <span>User Role Assignments</span>
          </CardTitle>
          <CardDescription>
            View and manage role assignments for all users in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No users found</div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getRoleBadge(user)}
                    <div className="flex items-center space-x-1">
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? (
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
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssignRole(user)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5" />
              <span>User Details: {selectedUser.name}</span>
            </CardTitle>
            <CardDescription>
              Detailed permission information for {selectedUser.username}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">User Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {selectedUser.name}</div>
                  <div><strong>Username:</strong> {selectedUser.username}</div>
                  <div><strong>Email:</strong> {selectedUser.email}</div>
                  <div><strong>Status:</strong> {selectedUser.isActive ? "Active" : "Inactive"}</div>
                  <div><strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Current Role Assignment</h4>
                {userPermissions ? (
                  <div className="space-y-3">
                    {userPermissions.systemRole && (
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">
                          <strong>System Role:</strong> {userPermissions.systemRole.displayName}
                        </span>
                      </div>
                    )}
                    {userPermissions.companyRole && (
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-green-500" />
                        <span className="text-sm">
                          <strong>Company Role:</strong> {userPermissions.companyRole.displayName}
                        </span>
                      </div>
                    )}
                    {userPermissions.customPermissions.length > 0 && (
                      <div>
                        <strong className="text-sm">Custom Permissions:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {userPermissions.customPermissions.map((permission: string) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission.replace(/_/g, ' ').toLowerCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Loading permission details...</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
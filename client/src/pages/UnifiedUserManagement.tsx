import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  UserPlus,
  Shield,
  Eye,
  EyeOff,
  Key,
  Activity,
  Settings,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Save,
  UserCheck,
  UserX,
  Clock,
  Search,
  Filter,
  AlertCircle,
  AlertTriangle,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useSuccessModal } from "@/hooks/useSuccessModal";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { SuccessModal } from "@/components/ui/success-modal";

// Types and Schemas
const userFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.string().min(1, "Role is required"),
  status: z.enum(["active", "inactive"]),
});

const roleFormSchema = z.object({
  name: z.string().min(3, "Role name must be at least 3 characters"),
  displayName: z.string().min(3, "Display name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type UserFormData = z.infer<typeof userFormSchema>;
type RoleFormData = z.infer<typeof roleFormSchema>;

// Module permissions mapping
const modulePermissions = {
  dashboard: ["VIEW", "CREATE", "EDIT"],
  invoicing: ["VIEW", "CREATE", "EDIT", "DELETE"],
  expense_management: ["VIEW", "CREATE", "EDIT", "DELETE"],
  inventory: ["VIEW", "CREATE", "EDIT", "DELETE"],
  accounting: ["VIEW", "CREATE", "EDIT", "DELETE"],
  vat_management: ["VIEW", "CREATE", "EDIT"],
  financial_reports: ["VIEW", "EXPORT"],
  multi_company: ["VIEW", "CREATE", "EDIT", "DELETE", "MANAGE"],
  advanced_analytics: ["VIEW", "CREATE", "EDIT", "DELETE", "MANAGE"],
  point_of_sale: ["VIEW", "CREATE", "EDIT", "DELETE", "MANAGE"],
  payroll: ["VIEW", "CREATE", "EDIT", "DELETE"],
  compliance: ["VIEW", "CREATE", "EDIT"],
};

export default function UnifiedUserManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showSuccess, isOpen, hideSuccess, modalOptions } = useSuccessModal();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ["/api/super-admin/users"],
  });

  // Fetch roles
  const { data: systemRoles = [], isLoading: rolesLoading } = useQuery<any[]>({
    queryKey: ["/api/rbac/system-roles"],
  });

  // Fetch permissions matrix
  const { data: permissionsMatrix = { roles: [] } } = useQuery<any>({
    queryKey: ["/api/permissions/matrix"],
  });

  // Fetch audit logs
  const { data: auditLogs = [], isLoading: auditLoading } = useQuery<any[]>({
    queryKey: ["/api/audit-logs"],
  });

  // Fetch subscription plans
  const { data: subscriptionPlans = [] } = useQuery<any[]>({
    queryKey: ["/api/super-admin/subscription-plans"],
  });

  // Fetch duplicate admin audit
  const { data: duplicateAudit } = useQuery<any>({
    queryKey: ["/api/admin/audit-duplicates"],
  });

  // Fetch admin role history
  const { data: adminHistory = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/role-history"],
  });

  // Fetch active company modules
  const { data: moduleData } = useQuery<any>({
    queryKey: ["/api/modules/company"],
  });

  // Extract active module IDs from the API response
  const activeModules =
    moduleData?.modules
      ?.filter((module: any) => module.isActive)
      ?.map((module: any) => module.id) || [];

  // Create a map for quick lookup of module states
  const moduleStates =
    moduleData?.modules?.reduce((acc: any, module: any) => {
      acc[module.id] = module.isActive;
      return acc;
    }, {}) || {};

  // Mutations
  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({
      userId,
      status,
    }: {
      userId: number;
      status: string;
    }) => {
      return apiRequest(`/api/super-admin/users/${userId}/status`, "PATCH", {
        status,
      });
    },
    onMutate: async ({ userId, status }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["/api/super-admin/users"] });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(["/api/super-admin/users"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["/api/super-admin/users"], (old: any) => {
        if (!old) return old;
        return old.map((user: any) => 
          user.id === userId ? { ...user, status } : user
        );
      });

      // Return a context object with the snapshotted value
      return { previousUsers };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousUsers) {
        queryClient.setQueryData(["/api/super-admin/users"], context.previousUsers);
      }
      toast({
        title: "Update Failed",
        description: "Unable to update user status. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      // Invalidate and refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/users"] });
      // Silent update - no modal for this page to avoid toggle state disruption
    },
  });

  const updatePermissionMutation = useMutation({
    mutationFn: async ({
      roleId,
      module,
      permission,
      enabled,
    }: {
      roleId: number;
      module: string;
      permission: string;
      enabled: boolean;
    }) => {
      return apiRequest("/api/permissions/update", "POST", {
        roleId,
        module,
        permission,
        enabled,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/permissions/matrix"] });
      showSuccess({
        title: "Permission Updated",
        description: `${variables.enabled ? "Granted" : "Revoked"} ${variables.permission} permission for ${variables.module} module`,
      });
    },
    onError: (error) => {
      toast({
        title: "Permission Update Failed",
        description: "Unable to update permission. Please try again.",
        variant: "destructive",
      });
      console.error("Permission update error:", error);
    },
  });

  const toggleModuleMutation = useMutation({
    mutationFn: async ({
      module,
      enabled,
    }: {
      module: string;
      enabled: boolean;
    }) => {
      return apiRequest(`/api/modules/${module}/toggle`, "POST", {
        isActive: enabled,
        reason: "Module toggled via admin interface",
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch the modules data immediately
      queryClient.invalidateQueries({ queryKey: ["/api/modules/company"] });
      queryClient.refetchQueries({ queryKey: ["/api/modules/company"] });
      showSuccess({
        title: "Module Status Updated",
        description: `${variables.module.replace(/_/g, ' ')} module has been ${variables.enabled ? "activated" : "deactivated"} successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Module Update Failed",
        description: `Unable to update module status. Error: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  const resolveDuplicateMutation = useMutation({
    mutationFn: async ({
      userId,
      reason,
    }: {
      userId: number;
      reason: string;
    }) => {
      return apiRequest("/api/admin/resolve-duplicate", "POST", {
        userId,
        reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/audit-duplicates"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/users"] });
      showSuccess({
        title: "Duplicate Resolved",
        description: "Duplicate admin user has been successfully resolved.",
      });
    },
  });

  const initializeDefaultPermissionsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/permissions/initialize-defaults", "POST", {});
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/permissions/matrix"] });
      showSuccess({
        title: "Default Permissions Initialized",
        description: `Default permissions set for ${data?.updatedCount || 0} roles`,
      });
    },
    onError: (error) => {
      toast({
        title: "Initialization Failed",
        description:
          "Unable to initialize default permissions. Please try again.",
        variant: "destructive",
      });
    },
  });

  // User form
  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      email: "",
      name: "",
      role: "",
      status: "active",
    },
  });

  // Role form
  const roleForm = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
    },
  });

  // Filter users
  const filteredUsers = users.filter((user: any) => {
    const matchesSearch =
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  // User Directory Tab
  const UserDirectoryTab = () => (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Directory</h2>
          <p className="text-gray-600">
            Manage users, roles, and access permissions
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedUser(null);
            userForm.reset();
            setIsUserDialogOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <UserPlus size={16} />
          Invite User
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
          <Input
            placeholder="Search users by name, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full lg:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full lg:w-40">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {systemRoles.map((role: any) => (
              <SelectItem key={role.id} value={role.name}>
                {role.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user.name?.[0] || user.username?.[0] || "U"}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.name || user.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {systemRoles.find((role: any) => role.name === user.role)
                        ?.displayName || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "active" ? "default" : "secondary"
                      }
                    >
                      {user.status === "active" ? (
                        <>
                          <CheckCircle size={12} className="mr-1" /> Active
                        </>
                      ) : (
                        <>
                          <XCircle size={12} className="mr-1" /> Inactive
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock size={12} className="mr-1" />
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : "Never"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          userForm.reset(user);
                          setIsUserDialogOpen(true);
                        }}
                      >
                        <Edit size={14} />
                      </Button>
                      <Switch
                        checked={user.status === "active"}
                        onCheckedChange={(checked) => {
                          console.log(`Toggle user ${user.id} status from ${user.status} to ${checked ? "active" : "inactive"}`);
                          if (
                            user.username !== "sysadmin_7f3a2b8e" &&
                            user.email !== "accounts@thinkmybiz.com"
                          ) {
                            toggleUserStatusMutation.mutate({
                              userId: user.id,
                              status: checked ? "active" : "inactive",
                            });
                          }
                        }}
                        disabled={
                          toggleUserStatusMutation.isPending ||
                          user.username === "sysadmin_7f3a2b8e" ||
                          user.email === "accounts@thinkmybiz.com"
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  // Role Management Tab
  const RoleManagementTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Role Management</h2>
          <p className="text-gray-600">
            Create and manage business roles with module access
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedRole(null);
            roleForm.reset();
            setIsRoleDialogOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Shield size={16} />
          Create Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {systemRoles.map((role: any) => (
          <Card key={role.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{role.displayName}</CardTitle>
                <Badge variant="outline">{role.name}</Badge>
              </div>
              <p className="text-sm text-gray-600">{role.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Users with this role:</span>
                  <span className="font-medium">
                    {
                      users.filter((user: any) => user.role === role.name)
                        .length
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Modules access:</span>
                  <span className="font-medium">
                    {Object.keys(modulePermissions).length} modules
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setSelectedRole(role);
                    roleForm.reset(role);
                    setIsRoleDialogOpen(true);
                  }}
                >
                  <Edit size={14} className="mr-2" />
                  Edit Role
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Permission Matrix Tab
  const PermissionMatrixTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Permission Matrix
          </h2>
          <p className="text-gray-600">
            Visual grid to manage role permissions across all modules
          </p>
        </div>
        <Button
          onClick={() => initializeDefaultPermissionsMutation.mutate()}
          disabled={initializeDefaultPermissionsMutation.isPending}
          variant="outline"
          size="sm"
        >
          {initializeDefaultPermissionsMutation.isPending ? (
            <>Loading...</>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Initialize Default Permissions
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-3 border-b font-medium text-gray-900">
                    Module
                  </th>
                  {systemRoles.map((role: any) => (
                    <th
                      key={role.id}
                      className="text-center p-3 border-b font-medium text-gray-900 min-w-24"
                    >
                      {role.displayName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(modulePermissions).map(
                  ([module, permissions]) => (
                    <tr key={module} className="border-b">
                      <td className="p-3 font-medium text-gray-900 capitalize">
                        {module.replace(/_/g, " ")}
                      </td>
                      {systemRoles.map((role: any) => (
                        <td key={role.id} className="p-3 text-center">
                          <div className="flex flex-col space-y-1">
                            {permissions.map((permission: string) => {
                              const roleData = permissionsMatrix?.roles?.find(
                                (r: any) => r.id === role.id,
                              );
                              // Parse permissions JSON string or use empty object
                              let rolePermissions = {};
                              try {
                                rolePermissions = roleData?.permissions
                                  ? JSON.parse(roleData.permissions)
                                  : {};
                              } catch (e) {
                                rolePermissions = {};
                              }
                              const hasPermission =
                                (rolePermissions as any)?.[module]?.[
                                  permission
                                ] === true;

                              return (
                                <div
                                  key={permission}
                                  className="flex items-center justify-center"
                                >
                                  <Switch
                                    checked={hasPermission}
                                    onCheckedChange={(checked) => {
                                      updatePermissionMutation.mutate({
                                        roleId: role.id,
                                        module,
                                        permission,
                                        enabled: checked,
                                      });
                                    }}
                                    disabled={role.name === "super_admin"}
                                  />
                                  <span className="text-xs text-gray-500 ml-1">
                                    {permission}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Module Access Tab
  const ModuleAccessTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Module Access Control
        </h2>
        <p className="text-gray-600">
          Activate/deactivate modules based on subscription plans
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.keys(modulePermissions).map((module) => (
          <Card key={module}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg capitalize">
                  {module.replace(/_/g, " ")}
                </CardTitle>
                <Switch
                  checked={moduleStates[module] === true}
                  onCheckedChange={(checked) => {
                    toggleModuleMutation.mutate({ module, enabled: checked });
                  }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Available in:{" "}
                  {subscriptionPlans
                    .map((plan: any) => plan.displayName)
                    .join(", ")}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {
                      modulePermissions[
                        module as keyof typeof modulePermissions
                      ].length
                    }{" "}
                    permissions
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Activity Log Tab with Duplicate Admin Prevention
  const ActivityLogTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Activity & Audit Log
        </h2>
        <p className="text-gray-600">
          Track user activities and prevent duplicate admin roles
        </p>
      </div>

      {/* Duplicate Admin Prevention Alert */}
      {duplicateAudit?.hasDuplicates && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <span>
                <strong>Warning:</strong> {duplicateAudit.totalDuplicateUsers}{" "}
                duplicate admin roles detected. Click "View Duplicates" to
                resolve them.
              </span>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-4">
                    View Duplicates
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Duplicate Admin Roles Detected</DialogTitle>
                    <DialogDescription>
                      The following duplicate admin roles have been found in the
                      system. Only one admin per role/email should exist for
                      security reasons.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {duplicateAudit.duplicates.map(
                      (duplicate: any, index: number) => (
                        <Card key={index} className="border-orange-200">
                          <CardHeader>
                            <CardTitle className="text-lg text-orange-800">
                              {duplicate.role}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {duplicate.users.map((user: any) => (
                                <div
                                  key={user.id}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                  <div>
                                    <p className="font-medium">
                                      {user.username}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {user.email}
                                    </p>
                                    {user.companyName && (
                                      <p className="text-xs text-gray-500">
                                        Company: {user.companyName}
                                      </p>
                                    )}
                                  </div>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="destructive" size="sm">
                                        <UserX className="h-4 w-4 mr-2" />
                                        Resolve
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>
                                          Resolve Duplicate Admin
                                        </DialogTitle>
                                        <DialogDescription>
                                          This will deactivate the duplicate
                                          admin user: {user.username}
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <Label htmlFor="reason">
                                            Reason for Resolution
                                          </Label>
                                          <Textarea
                                            id="reason"
                                            placeholder="Explain why this duplicate is being resolved..."
                                          />
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                          <Button variant="outline">
                                            Cancel
                                          </Button>
                                          <Button
                                            variant="destructive"
                                            onClick={() => {
                                              const reason = (
                                                document.getElementById(
                                                  "reason",
                                                ) as HTMLTextAreaElement
                                              )?.value;
                                              resolveDuplicateMutation.mutate({
                                                userId: user.id,
                                                reason,
                                              });
                                            }}
                                          >
                                            Resolve Duplicate
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ),
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Admin Role History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="h-5 w-5 mr-2 text-purple-600" />
            Admin Role Assignment History
          </CardTitle>
          <CardDescription>
            Track all admin role assignments, removals, and security actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adminHistory.slice(0, 10).map((entry: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-full ${
                      entry.action === "role_assigned"
                        ? "bg-green-100"
                        : entry.action === "role_removed"
                          ? "bg-red-100"
                          : entry.action === "admin_duplicate_resolved"
                            ? "bg-orange-100"
                            : "bg-blue-100"
                    }`}
                  >
                    {entry.action === "role_assigned" && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {entry.action === "role_removed" && (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    {entry.action === "admin_duplicate_resolved" && (
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    )}
                    {entry.action === "user_created" && (
                      <UserPlus className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{entry.username}</p>
                    <p className="text-sm text-gray-600">{entry.email}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Badge variant="outline">{entry.role}</Badge>
                      <span>•</span>
                      <span>{entry.action.replace(/_/g, " ")}</span>
                      <span>•</span>
                      <span>by {entry.performedBy}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(entry.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
            {adminHistory.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No admin role history found.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Regular Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-600" />
            System Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.slice(0, 50).map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {log.username || log.userId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell>{log.resource}</TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {log.details || "No additional details"}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          User Management Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Centralized control for users, roles, permissions, and module access
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users size={16} />
            Users
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield size={16} />
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key size={16} />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <Settings size={16} />
            Modules
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity size={16} />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserDirectoryTab />
        </TabsContent>

        <TabsContent value="roles">
          <RoleManagementTab />
        </TabsContent>

        <TabsContent value="permissions">
          <PermissionMatrixTab />
        </TabsContent>

        <TabsContent value="modules">
          <ModuleAccessTab />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityLogTab />
        </TabsContent>
      </Tabs>

      {/* User Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Edit User" : "Invite New User"}
            </DialogTitle>
          </DialogHeader>
          <Form {...userForm}>
            <form className="space-y-4">
              <FormField
                control={userForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter full name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={userForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter email address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={userForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter username" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={userForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {systemRoles.map((role: any) => (
                          <SelectItem key={role.id} value={role.name}>
                            {role.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUserDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Save size={14} className="mr-2" />
                  {selectedUser ? "Update User" : "Invite User"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedRole ? "Edit Role" : "Create New Role"}
            </DialogTitle>
          </DialogHeader>
          <Form {...roleForm}>
            <form className="space-y-4">
              <FormField
                control={roleForm.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter display name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={roleForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>System Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter system name (lowercase_with_underscores)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={roleForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter role description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRoleDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Save size={14} className="mr-2" />
                  {selectedRole ? "Update Role" : "Create Role"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <SuccessModal
        isOpen={isOpen}
        onClose={hideSuccess}
        title={modalOptions.title}
        description={modalOptions.description}
        confirmText={modalOptions.confirmText}
        onConfirm={modalOptions.onConfirm}
      />
    </div>
  );
}


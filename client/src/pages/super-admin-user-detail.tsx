import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, User, Shield, Activity, Settings, Clock, Eye, Edit, Trash2, Plus, UserCheck, KeyRound, Mail, UserX, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Role change form schema
const roleChangeSchema = z.object({
  userId: z.number(),
  roleId: z.string().min(1, "Please select a role"),
  reason: z.string().min(10, "Please provide a reason of at least 10 characters"),
  effectiveDate: z.string().optional()
});

type RoleChangeData = z.infer<typeof roleChangeSchema>;

// Available roles for assignment
const AVAILABLE_ROLES = [
  { id: 'super_admin', name: 'Super Administrator', description: 'Full system access', level: 10, color: 'from-red-500 to-red-700' },
  { id: 'company_admin', name: 'Company Administrator', description: 'Company-wide access', level: 8, color: 'from-blue-500 to-blue-700' },
  { id: 'accountant', name: 'Accountant', description: 'Financial management access', level: 6, color: 'from-green-500 to-green-700' },
  { id: 'bookkeeper', name: 'Bookkeeper', description: 'Basic bookkeeping access', level: 4, color: 'from-yellow-500 to-yellow-700' },
  { id: 'manager', name: 'Manager', description: 'Department management access', level: 5, color: 'from-purple-500 to-purple-700' },
  { id: 'employee', name: 'Employee', description: 'Basic employee access', level: 2, color: 'from-gray-500 to-gray-700' },
  { id: 'viewer', name: 'Viewer', description: 'Read-only access', level: 1, color: 'from-slate-500 to-slate-700' }
];

// Audit Logs Component
function UserAuditLogs({ userId }: { userId: number }) {
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["/api/super-admin/audit-logs/user", userId],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return <Plus className="h-4 w-4 text-green-600" />;
      case 'update': case 'edit': return <Edit className="h-4 w-4 text-blue-600" />;
      case 'delete': return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'view': case 'read': return <Eye className="h-4 w-4 text-gray-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return 'bg-green-50 border-green-200';
      case 'update': case 'edit': return 'bg-blue-50 border-blue-200';
      case 'delete': return 'bg-red-50 border-red-200';
      case 'view': case 'read': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No Activity Yet</h3>
        <p className="text-sm text-muted-foreground">
          User activity and audit logs will appear here as actions are performed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Recent Activity</h3>
        <Badge variant="outline">{auditLogs.length} {auditLogs.length === 1 ? 'entry' : 'entries'}</Badge>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {auditLogs.map((log: any) => (
          <div key={log.id} className={`p-4 rounded-lg border ${getActionColor(log.action)}`}>
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                {getActionIcon(log.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {log.action.toUpperCase()}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {log.resourceType}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
                
                <p className="mt-2 text-sm font-medium text-gray-900">
                  {log.description || `${log.action} ${log.resourceType} ${log.resourceId}`}
                </p>
                
                {log.details && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {log.details}
                  </p>
                )}
                
                {(log.oldValues || log.newValues) && (
                  <div className="mt-2 text-xs">
                    {log.oldValues && (
                      <div className="mb-1">
                        <span className="font-medium text-red-600">Before:</span>
                        <span className="ml-1 text-muted-foreground">
                          {typeof log.oldValues === 'string' ? log.oldValues : JSON.stringify(log.oldValues)}
                        </span>
                      </div>
                    )}
                    {log.newValues && (
                      <div>
                        <span className="font-medium text-green-600">After:</span>
                        <span className="ml-1 text-muted-foreground">
                          {typeof log.newValues === 'string' ? log.newValues : JSON.stringify(log.newValues)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SuperAdminUserDetail() {
  const [, params] = useRoute("/super-admin/users/:id");
  const userId = params?.id;
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [isRoleChangeDialogOpen, setIsRoleChangeDialogOpen] = useState(false);

  // Role change form
  const roleChangeForm = useForm<RoleChangeData>({
    resolver: zodResolver(roleChangeSchema),
    defaultValues: {
      userId: parseInt(userId || '0'),
      roleId: '',
      reason: '',
      effectiveDate: new Date().toISOString().split('T')[0]
    }
  });

  // Fetch user details
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/super-admin/users", userId],
    enabled: !!userId,
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/super-admin/users/${userId}`, "PUT", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setEditMode(false);
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  // Role change mutation
  const roleChangeMutation = useMutation({
    mutationFn: async (data: RoleChangeData) => {
      // Convert the data to match the existing RBAC API format
      const rbacData = {
        userId: data.userId,
        systemRoleId: data.roleId,
        companyRoleId: null,
        reason: data.reason
      };
      return apiRequest('/api/rbac/assign-role', 'POST', rbacData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/users", userId] });
      toast({
        title: "Role Updated",
        description: "User role has been successfully updated.",
      });
      setIsRoleChangeDialogOpen(false);
      roleChangeForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    },
  });

  // Reset Password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/admin/users/${userId}/reset-password`, "POST");
    },
    onSuccess: (data: any) => {
      toast({
        title: "Password Reset",
        description: data.emailSent 
          ? "New password has been sent to the user's email address."
          : `Password reset successfully. New password: ${data.newPassword}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    },
  });

  // Send Verification Email mutation
  const sendVerificationMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/admin/users/${userId}/send-verification`, "POST");
    },
    onSuccess: (data: any) => {
      toast({
        title: "Verification Email Sent",
        description: data.emailSent 
          ? "Verification email has been sent successfully."
          : "Failed to send verification email. Email service may not be configured.",
        variant: data.emailSent ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email",
        variant: "destructive",
      });
    },
  });

  // Deactivate Account mutation
  const deactivateAccountMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/admin/users/${userId}/toggle-status`, "POST", { isActive: false });
    },
    onSuccess: () => {
      toast({
        title: "Account Deactivated",
        description: "User account has been deactivated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/users", userId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate account",
        variant: "destructive",
      });
    },
  });

  const handleUpdateUser = async (formData: FormData) => {
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
      isActive: formData.get("isActive") === "true",
    };
    updateUserMutation.mutate(data);
  };

  const onRoleChange = (data: RoleChangeData) => {
    roleChangeMutation.mutate(data);
  };

  const openRoleChangeDialog = () => {
    if (user) {
      roleChangeForm.setValue('userId', parseInt(userId || '0'));
      roleChangeForm.setValue('roleId', user.role || '');
      setIsRoleChangeDialogOpen(true);
    }
  };

  const handleResetPassword = () => {
    if (confirm(`Are you sure you want to reset the password for ${user?.name}? This will send a new password to their email address.`)) {
      resetPasswordMutation.mutate();
    }
  };

  const handleSendVerificationEmail = () => {
    if (confirm(`Send verification email to ${user?.email}?`)) {
      sendVerificationMutation.mutate();
    }
  };

  const handleDeactivateAccount = () => {
    if (confirm(`Are you sure you want to deactivate ${user?.name}'s account? This will prevent them from logging in.`)) {
      deactivateAccountMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
          <Link href="/super-admin">
            <Button>Back to Super Admin</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/super-admin">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">User Management</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={editMode ? "outline" : "default"}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? "Cancel" : "Edit User"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>User Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editMode ? (
                  <form action={handleUpdateUser} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" defaultValue={user.name} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" defaultValue={user.email} />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select name="role" defaultValue={user.role}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="accountant">Accountant</SelectItem>
                          <SelectItem value="employee">Employee</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="isActive">Status</Label>
                      <Select name="isActive" defaultValue={user.isActive ? "true" : "false"}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" disabled={updateUserMutation.isPending}>
                      {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Username</Label>
                      <p className="text-sm text-muted-foreground">{user.username}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Full Name</Label>
                      <p className="text-sm text-muted-foreground">{user.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Role</Label>
                      <div>
                        <Badge variant="outline">{user.role}</Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Last Login</Label>
                      <p className="text-sm text-muted-foreground">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Account Created</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Last Updated</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Failed Login Attempts</Label>
                    <p className="text-sm text-muted-foreground">{user.failedLoginAttempts || 0}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Account Locked</Label>
                    <div>
                      <Badge variant={user.isLocked ? "destructive" : "default"}>
                        {user.isLocked ? "Locked" : "Unlocked"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>User Permissions</span>
              </CardTitle>
              <CardDescription>Manage user permissions and access rights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Current Permissions</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {user.permissions?.map((permission: string) => (
                      <Badge key={permission} variant="secondary">
                        {permission}
                      </Badge>
                    )) || <p className="text-sm text-muted-foreground">No specific permissions assigned</p>}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Role Assignment</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.role === 'super_admin' ? 'destructive' : 'default'}>
                        {user.role?.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={openRoleChangeDialog}>
                        Change Role
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Access Level</h4>
                    <p className="text-sm text-muted-foreground">
                      {user.role === 'super_admin' ? 'Full system access across all companies' :
                       user.role === 'admin' ? 'Company administration access' :
                       user.role === 'user' ? 'Standard user access' : 'Limited access'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Module Access</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className={user.role === 'super_admin' || user.role === 'admin' ? 'text-green-600' : 'text-gray-400'}>
                          ✓ Dashboard
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={user.role === 'super_admin' || user.role === 'admin' ? 'text-green-600' : 'text-gray-400'}>
                          ✓ User Management
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={user.role === 'super_admin' || user.role === 'admin' ? 'text-green-600' : 'text-gray-400'}>
                          ✓ Financial Reports
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={user.role === 'super_admin' ? 'text-green-600' : 'text-gray-400'}>
                          {user.role === 'super_admin' ? '✓' : '✗'} Super Admin Panel
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>User Activity</span>
              </CardTitle>
              <CardDescription>Recent user activity and audit logs</CardDescription>
            </CardHeader>
            <CardContent>
              <UserAuditLogs userId={parseInt(userId!)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Advanced Settings</span>
              </CardTitle>
              <CardDescription>Advanced user configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleResetPassword}
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4 mr-2" />
                      Reset Password
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleSendVerificationEmail}
                  disabled={sendVerificationMutation.isPending}
                >
                  {sendVerificationMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending Email...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Verification Email
                    </>
                  )}
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleDeactivateAccount}
                  disabled={deactivateAccountMutation.isPending}
                >
                  {deactivateAccountMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deactivating...
                    </>
                  ) : (
                    <>
                      <UserX className="h-4 w-4 mr-2" />
                      Deactivate Account
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Role Change Dialog */}
      <Dialog open={isRoleChangeDialogOpen} onOpenChange={setIsRoleChangeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role assignment for {user?.name}
            </DialogDescription>
          </DialogHeader>
          <Form {...roleChangeForm}>
            <form onSubmit={roleChangeForm.handleSubmit(onRoleChange)} className="space-y-4">
              <FormField
                control={roleChangeForm.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select new role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AVAILABLE_ROLES.map(role => (
                          <SelectItem key={role.id} value={role.id}>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                className={`bg-gradient-to-r ${role.color} text-white text-xs`}
                              >
                                Level {role.level}
                              </Badge>
                              <div>
                                <div className="font-medium">{role.name}</div>
                                <div className="text-xs text-muted-foreground">{role.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={roleChangeForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Change</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Explain why this role change is being made..."
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

              <FormField
                control={roleChangeForm.control}
                name="effectiveDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      When this role change should take effect
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsRoleChangeDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={roleChangeMutation.isPending}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  {roleChangeMutation.isPending ? 'Updating...' : 'Update Role'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Users,
  Plus,
  Edit3,
  Trash2,
  Search,
  Filter,
  Download,
  Settings,
  Shield,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Calendar,
  Mail,
  Phone,
  Crown,
  Building,
  AlertTriangle,
  Check,
  X,
  Clock,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ACCOUNTING_ROLES } from "@shared/permissions-matrix";

// Schema for user creation/editing
const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  role: z.string(),
  phone: z.string().optional(),
  department: z.string().optional(),
  isActive: z.boolean().default(true),
  notes: z.string().optional()
});

type UserData = z.infer<typeof userSchema>;

// Schema for role assignment
const roleAssignmentSchema = z.object({
  userId: z.number(),
  roleId: z.string(),
  reason: z.string().min(10, "Please provide a reason for this role assignment"),
  effectiveDate: z.string().optional()
});

type RoleAssignmentData = z.infer<typeof roleAssignmentSchema>;

interface EnhancedUser {
  id: number;
  username: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  role: string;
  roleDisplayName: string;
  roleLevel: number;
  roleColor?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  loginAttempts: number;
  isLocked: boolean;
  assignedModules: string[];
  customPermissions: string[];
  notes?: string;
}

interface UserManagementData {
  users: EnhancedUser[];
  roles: Array<{
    id: string;
    name: string;
    displayName: string;
    level: number;
    color: string;
    currentUsers: number;
    maxUsers: number;
    securityLevel: string;
  }>;
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  lockedUsers: number;
}

export default function EnhancedUserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<EnhancedUser | null>(null);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isRoleAssignmentDialogOpen, setIsRoleAssignmentDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentTab, setCurrentTab] = useState("users");

  const userForm = useForm<UserData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: "",
      role: "",
      phone: "",
      department: "",
      isActive: true,
      notes: ""
    }
  });

  const roleAssignmentForm = useForm<RoleAssignmentData>({
    resolver: zodResolver(roleAssignmentSchema),
    defaultValues: {
      userId: 0,
      roleId: "",
      reason: "",
      effectiveDate: ""
    }
  });

  // Fetch user management data
  const { data: managementData, isLoading } = useQuery({
    queryKey: ['/api/admin/enhanced-users'],
    refetchInterval: 30000,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: UserData) => {
      return await apiRequest('/api/admin/users', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/enhanced-users'] });
      toast({
        title: "User Created",
        description: "New user account created successfully.",
      });
      setIsCreateUserDialogOpen(false);
      userForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<UserData> }) => {
      return await apiRequest(`/api/admin/users/${id}`, 'PUT', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/enhanced-users'] });
      toast({
        title: "User Updated",
        description: "User account updated successfully.",
      });
      setIsEditUserDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Role assignment mutation
  const assignRoleMutation = useMutation({
    mutationFn: async (data: RoleAssignmentData) => {
      return await apiRequest('/api/admin/assign-role', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/enhanced-users'] });
      toast({
        title: "Role Assigned",
        description: "User role updated successfully.",
      });
      setIsRoleAssignmentDialogOpen(false);
      roleAssignmentForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle user active status
  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: number; isActive: boolean }) => {
      return await apiRequest(`/api/admin/users/${userId}/toggle-status`, 'POST', { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/enhanced-users'] });
      toast({
        title: "Status Updated",
        description: "User status updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onCreateUser = (data: UserData) => {
    createUserMutation.mutate(data);
  };

  const onEditUser = () => {
    if (!selectedUser) return;
    const data = userForm.getValues();
    updateUserMutation.mutate({ id: selectedUser.id, data });
  };

  const onAssignRole = (data: RoleAssignmentData) => {
    assignRoleMutation.mutate(data);
  };

  const openRoleAssignmentDialog = (user: EnhancedUser) => {
    setSelectedUser(user);
    roleAssignmentForm.setValue('userId', user.id);
    roleAssignmentForm.setValue('roleId', user.role);
    setIsRoleAssignmentDialogOpen(true);
  };

  const openEditUserDialog = (user: EnhancedUser) => {
    setSelectedUser(user);
    userForm.reset({
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
      department: user.department || "",
      isActive: user.isActive,
      notes: user.notes || ""
    });
    setIsEditUserDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">Loading user data...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
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

  const data: UserManagementData = managementData || {
    users: [],
    roles: [],
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    lockedUsers: 0
  };

  // Filter users based on search and filters
  const filteredUsers = data.users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    const matchesStatus = statusFilter === "ALL" || 
                         (statusFilter === "ACTIVE" && user.isActive) ||
                         (statusFilter === "INACTIVE" && !user.isActive) ||
                         (statusFilter === "LOCKED" && user.isLocked);
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enhanced User Management</h1>
          <p className="text-muted-foreground">
            Comprehensive user administration with role-based permissions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Users
          </Button>
          <Button onClick={() => setIsCreateUserDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Currently enabled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <UserX className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{data.inactiveUsers}</div>
            <p className="text-xs text-muted-foreground">
              Disabled accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locked Users</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.lockedUsers}</div>
            <p className="text-xs text-muted-foreground">
              Security locked
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
                  placeholder="Search users by name, username, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                {data.roles.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="LOCKED">Locked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* User Management Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="users">User List</TabsTrigger>
          <TabsTrigger value="roles">Role Distribution</TabsTrigger>
          <TabsTrigger value="permissions">Permission Overview</TabsTrigger>
          <TabsTrigger value="audit">Activity Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Directory</CardTitle>
              <CardDescription>
                Manage user accounts, roles, and permissions ({filteredUsers.length} of {data.totalUsers} users shown)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => {
                  const role = data.roles.find(r => r.id === user.role);
                  
                  return (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${user.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {user.isActive ? (
                            <UserCheck className="h-4 w-4 text-green-600" />
                          ) : (
                            <UserX className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{user.name}</span>
                            <Badge 
                              className={`bg-gradient-to-r ${role?.color || 'from-gray-500 to-gray-600'} text-white text-xs`}
                            >
                              {user.roleDisplayName}
                            </Badge>
                            {user.isLocked && (
                              <Badge variant="destructive" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                Locked
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>@{user.username}</span>
                            <span className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email}
                            </span>
                            {user.phone && (
                              <span className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {user.phone}
                              </span>
                            )}
                            {user.department && (
                              <span className="flex items-center">
                                <Building className="h-3 w-3 mr-1" />
                                {user.department}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Created: {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                            {user.lastLogin && (
                              <span className="flex items-center">
                                <Activity className="h-3 w-3 mr-1" />
                                Last Login: {new Date(user.lastLogin).toLocaleDateString()}
                              </span>
                            )}
                            <span>Level {user.roleLevel}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openRoleAssignmentDialog(user)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Permissions
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditUserDialog(user)}
                        >
                          <Edit3 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Switch
                          checked={user.isActive}
                          onCheckedChange={(checked) => toggleUserStatusMutation.mutate({ userId: user.id, isActive: checked })}
                          disabled={toggleUserStatusMutation.isPending}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tab contents would go here */}
      </Tabs>

      {/* Create User Dialog */}
      <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user account with role assignments and permissions
            </DialogDescription>
          </DialogHeader>
          <Form {...userForm}>
            <form onSubmit={userForm.handleSubmit(onCreateUser)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={userForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., john.smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={userForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Secure password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={userForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Assignment</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {data.roles.map(role => (
                            <SelectItem key={role.id} value={role.id}>
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  className={`bg-gradient-to-r ${role.color} text-white text-xs`}
                                >
                                  Level {role.level}
                                </Badge>
                                <span>{role.displayName}</span>
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
                  control={userForm.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Accounting" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={userForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional notes about this user..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateUserDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createUserMutation.isPending}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create User
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Role Assignment Dialog */}
      <Dialog open={isRoleAssignmentDialogOpen} onOpenChange={setIsRoleAssignmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription>
              {selectedUser && `Update role assignment for ${selectedUser.name}`}
            </DialogDescription>
          </DialogHeader>
          <Form {...roleAssignmentForm}>
            <form onSubmit={roleAssignmentForm.handleSubmit(onAssignRole)} className="space-y-4">
              <FormField
                control={roleAssignmentForm.control}
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
                        {data.roles.map(role => (
                          <SelectItem key={role.id} value={role.id}>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                className={`bg-gradient-to-r ${role.color} text-white text-xs`}
                              >
                                Level {role.level}
                              </Badge>
                              <span>{role.displayName}</span>
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
                control={roleAssignmentForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Change</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Explain why this role assignment is being made..."
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
                <Button type="button" variant="outline" onClick={() => setIsRoleAssignmentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={assignRoleMutation.isPending}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Assign Role
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
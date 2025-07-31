import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Activity,
  MoreHorizontal,
  LogIn,
  Lock,
  Unlock,
  UserPlus,
  FileUser,
  Briefcase
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ModernPermissionsInterface from "@/components/permissions/ModernPermissionsInterface";

// User schema for forms
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

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  failedLoginAttempts?: number;
  accountLocked?: boolean;
}

interface SystemRole {
  id: number;
  name: string;
  displayName: string;
  description: string;
  level: number;
}

const ROLE_COLORS = {
  super_admin: 'from-red-500 to-red-600',
  system_admin: 'from-purple-500 to-purple-600', 
  company_admin: 'from-blue-500 to-blue-600',
  company_owner: 'from-indigo-500 to-indigo-600',
  accountant: 'from-green-500 to-green-600',
  manager: 'from-teal-500 to-teal-600',
  bookkeeper: 'from-cyan-500 to-cyan-600',
  employee: 'from-gray-500 to-gray-600'
};

export default function ProfessionalUserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Activity Logs Display Component
  const ActivityLogsDisplay = () => {
    const { data: auditLogs, isLoading } = useQuery({
      queryKey: ['/api/admin/audit-logs'],
      queryFn: async () => {
        const response = await fetch('/api/admin/audit-logs', {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'X-Session-Token': localStorage.getItem('sessionToken') || '',
          }
        });
        if (!response.ok) throw new Error('Failed to fetch audit logs');
        return response.json();
      },
    });

    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      );
    }

    if (!auditLogs || auditLogs.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No activity logs found</p>
          <p className="text-sm">User activities will appear here as they occur</p>
        </div>
      );
    }

    return (
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {auditLogs.slice(0, 20).map((log: any, index: number) => (
          <div key={log.id || index} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge variant="outline">{log.action}</Badge>
                <span className="font-medium">{log.userName || log.user?.name || 'System'}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date(log.timestamp || log.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm mt-2 text-gray-600">
              {log.resource} - {log.details || 'No additional details'}
            </p>
          </div>
        ))}
      </div>
    );
  };
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
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
      role: "employee",
      isActive: true
    }
  });

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/super-admin/users"],
    select: (data: User[]) => data.filter(user => user.isActive !== false)
  });

  // Fetch system roles
  const { data: systemRoles = [] } = useQuery<SystemRole[]>({
    queryKey: ["/api/rbac/system-roles"]
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: UserData) => {
      return apiRequest("/api/auth/register", "POST", userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/users"] });
      setIsCreateUserDialogOpen(false);
      userForm.reset();
      toast({
        title: "User Created",
        description: "User has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    }
  });

  // Toggle user status mutation
  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: number; status: boolean }) => {
      return apiRequest(`/api/users/${userId}/status`, "PUT", { isActive: status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/users"] });
      toast({
        title: "Status Updated",
        description: "User status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  });

  // Impersonate user mutation
  const impersonateUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest("/api/auth/impersonate", "POST", { userId });
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard';
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to log in as user",
        variant: "destructive",
      });
    }
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === "" || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    const matchesStatus = statusFilter === "ALL" || 
      (statusFilter === "ACTIVE" && user.isActive) ||
      (statusFilter === "INACTIVE" && !user.isActive) ||
      (statusFilter === "LOCKED" && user.accountLocked);
      
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleDisplayName = (role: string) => {
    const systemRole = systemRoles.find(r => r.name === role);
    return systemRole?.displayName || role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getRoleColor = (role: string) => {
    return ROLE_COLORS[role as keyof typeof ROLE_COLORS] || 'from-gray-500 to-gray-600';
  };

  const onCreateUser = (data: UserData) => {
    createUserMutation.mutate(data);
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return 'Never';
    return new Date(lastLogin).toLocaleDateString();
  };

  // Calculate stats
  const activeUsers = users.filter(u => u.isActive).length;
  const inactiveUsers = users.filter(u => !u.isActive).length;
  const lockedUsers = users.filter(u => u.accountLocked).length;
  const superAdmins = users.filter(u => u.role === 'super_admin').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileUser className="h-8 w-8 text-blue-600" />
            Taxnify
          </h1>
          <div className="flex items-center gap-1 mt-1">
            <Badge variant="secondary" className="text-blue-600">
              Super Admin - Full Access
            </Badge>
          </div>
        </div>
        <Button 
          onClick={() => setIsCreateUserDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive Users</p>
                <p className="text-2xl font-bold text-red-600">{inactiveUsers}</p>
              </div>
              <UserX className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Super Admins</p>
                <p className="text-2xl font-bold text-purple-600">{superAdmins}</p>
              </div>
              <Crown className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Roles</SelectItem>
                    {systemRoles.map(role => (
                      <SelectItem key={role.name} value={role.name}>
                        {role.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
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

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle>User List ({filteredUsers.length})</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback className={`bg-gradient-to-r ${getRoleColor(user.role)} text-white`}>
                          {getUserInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{user.name}</h4>
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {user.accountLocked && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              Locked
                            </Badge>
                          )}
                          {user.role === 'super_admin' && (
                            <Badge variant="outline" className="text-red-600 border-red-300">
                              <Crown className="h-3 w-3 mr-1" />
                              Super Admin
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {getRoleDisplayName(user.role)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Last login: {formatLastLogin(user.lastLogin)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => impersonateUserMutation.mutate(user.id)}
                        disabled={impersonateUserMutation.isPending}
                        className="flex items-center gap-1"
                      >
                        <LogIn className="h-3 w-3" />
                        Log In As User
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleUserStatusMutation.mutate({ userId: user.id, status: !user.isActive })}
                        disabled={toggleUserStatusMutation.isPending}
                      >
                        {user.isActive ? (
                          <>
                            <UserX className="h-3 w-3 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Roles</CardTitle>
              <CardDescription>Manage role definitions and hierarchies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemRoles.map((role) => {
                  const usersWithRole = users.filter(u => u.role === role.name).length;
                  return (
                    <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${getRoleColor(role.name)}`}></div>
                        <div>
                          <h4 className="font-medium">{role.displayName}</h4>
                          <p className="text-sm text-gray-600">{role.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">Level {role.level}</Badge>
                            <Badge variant="secondary">{usersWithRole} users</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <ModernPermissionsInterface />
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                User Activity
              </CardTitle>
              <CardDescription>Recent user actions and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityLogsDisplay />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create User Dialog */}
      <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Add a new user to the system</DialogDescription>
          </DialogHeader>
          <Form {...userForm}>
            <form onSubmit={userForm.handleSubmit(onCreateUser)} className="space-y-4">
              <FormField
                control={userForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
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
                      <Input placeholder="Enter username" {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email" {...field} />
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
                      <Input type="password" placeholder="Enter password" {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {systemRoles.map(role => (
                          <SelectItem key={role.name} value={role.name}>
                            {role.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateUserDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createUserMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createUserMutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
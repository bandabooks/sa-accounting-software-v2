import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSuccessModal } from "@/hooks/useSuccessModal";
import { SuccessModal } from "@/components/ui/success-modal";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Shield, 
  Settings, 
  UserCheck, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Crown,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

export default function UnifiedAdminPanel() {
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const { toast } = useToast();
  const successModal = useSuccessModal();

  // Fetch all data
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["/api/super-admin/users"],
  });

  const { data: roles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ["/api/rbac/system-roles"],
  });

  const { data: companies = [], isLoading: loadingCompanies } = useQuery({
    queryKey: ["/api/super-admin/companies"],
  });

  const { data: moduleData = {} } = useQuery({
    queryKey: ["/api/modules/company"],
  });

  // Filter users based on search and filters
  const filteredUsers = Array.isArray(users) ? users.filter((user: any) => {
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesStatus = selectedStatus === "all" || 
                         (selectedStatus === "active" && user.isActive) ||
                         (selectedStatus === "inactive" && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  }) : [];

  // User management functions
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: number; updates: any }) => {
      return apiRequest(`/api/super-admin/users/${userId}`, "PATCH", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/users"] });
      successModal.showSuccess({
        title: "User Updated",
        description: "User has been successfully updated.",
        confirmText: "Continue"
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest(`/api/super-admin/users/${userId}/reset-password`, "POST", {});
    },
    onSuccess: () => {
      successModal.showSuccess({
        title: "Password Reset",
        description: "Password reset email has been sent to the user.",
        confirmText: "Continue"
      });
    },
  });

  const toggleUserStatus = (userId: number, currentStatus: boolean) => {
    updateUserMutation.mutate({
      userId,
      updates: { isActive: !currentStatus }
    });
  };

  const getUserStatusColor = (user: any) => {
    if (!user.isActive) return "bg-red-100 text-red-800";
    if (user.role?.includes("super_admin")) return "bg-purple-100 text-purple-800";
    if (user.role?.includes("admin")) return "bg-blue-100 text-blue-800";
    return "bg-green-100 text-green-800";
  };

  const getUserStatusText = (user: any) => {
    if (!user.isActive) return "Inactive";
    if (user.role?.includes("super_admin")) return "Super Admin";
    if (user.role?.includes("admin")) return "Admin";
    return "Active";
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Administration</h1>
          <p className="text-muted-foreground">Unified management for users, roles, and system settings</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>User Management</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Role & Permissions</span>
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Company Management</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>System Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* USER MANAGEMENT TAB */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>User Management</span>
              </CardTitle>
              <CardDescription>
                Manage all user accounts, roles, and permissions in one place
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Total Users</p>
                      <p className="text-2xl font-bold text-blue-600">{Array.isArray(users) ? users.length : 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Active Users</p>
                      <p className="text-2xl font-bold text-green-600">
                        {Array.isArray(users) ? users.filter((u: any) => u.isActive).length : 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-purple-900">Super Admins</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {Array.isArray(users) ? users.filter((u: any) => u.role?.includes("super_admin")).length : 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-orange-900">Inactive Users</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {Array.isArray(users) ? users.filter((u: any) => !u.isActive).length : 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users by name, username, or email..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="company_admin">Company Admin</SelectItem>
                    <SelectItem value="user">Regular User</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* User List */}
              <div className="space-y-3">
                {loadingUsers ? (
                  <div className="text-center py-8">Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No users found</div>
                ) : (
                  filteredUsers.map((user: any) => (
                    <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.username?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{user.name || user.username}</h3>
                              <Badge className={getUserStatusColor(user)}>
                                {getUserStatusText(user)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500">@{user.username}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserStatus(user.id, user.isActive)}
                          >
                            {user.isActive ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resetPasswordMutation.mutate(user.id)}
                          >
                            <Lock className="h-4 w-4 mr-1" />
                            Reset Password
                          </Button>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit User: {user.username}</DialogTitle>
                                <DialogDescription>
                                  Modify user account details and permissions
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="name">Full Name</Label>
                                  <Input id="name" defaultValue={user.name} />
                                </div>
                                <div>
                                  <Label htmlFor="email">Email</Label>
                                  <Input id="email" type="email" defaultValue={user.email} />
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch id="active" defaultChecked={user.isActive} />
                                  <Label htmlFor="active">Account Active</Label>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROLES & PERMISSIONS TAB */}
        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Role & Permission Management</span>
              </CardTitle>
              <CardDescription>
                Manage system roles and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Role Management</h3>
                <p className="text-gray-600 mb-4">
                  Configure system roles and their associated permissions
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Role
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMPANY MANAGEMENT TAB */}
        <TabsContent value="companies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Company Management</span>
              </CardTitle>
              <CardDescription>
                Manage all companies and their settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Company Overview</h3>
                <p className="text-gray-600 mb-4">
                  Total Companies: {Array.isArray(companies) ? companies.length : 0}
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Company
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SYSTEM SETTINGS TAB */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>System Settings</span>
              </CardTitle>
              <CardDescription>
                Configure global system settings and modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {moduleData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Settings className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Total Modules</p>
                        <p className="text-2xl font-bold text-blue-600">{(moduleData as any)?.totalModules || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Active Modules</p>
                        <p className="text-2xl font-bold text-green-600">{(moduleData as any)?.activeModules || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-orange-900">Inactive Modules</p>
                        <p className="text-2xl font-bold text-orange-600">{(moduleData as any)?.inactiveModules || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="text-center py-8">
                <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">System Configuration</h3>
                <p className="text-gray-600 mb-4">
                  Manage global system settings and module activation
                </p>
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure System
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
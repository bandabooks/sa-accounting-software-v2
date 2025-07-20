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
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, User, Shield, Activity, Settings } from "lucide-react";
import { Link } from "wouter";

export default function SuperAdminUserDetail() {
  const [, params] = useRoute("/super-admin/users/:id");
  const userId = params?.id;
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);

  // Fetch user details
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/super-admin/users", userId],
    enabled: !!userId,
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", `/api/super-admin/users/${userId}`, data);
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

  const handleUpdateUser = async (formData: FormData) => {
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
      isActive: formData.get("isActive") === "true",
    };
    updateUserMutation.mutate(data);
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
                <p className="text-sm text-muted-foreground">
                  Permission management functionality coming soon...
                </p>
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
              <p className="text-muted-foreground">Activity logs coming soon...</p>
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
                <Button variant="outline" className="w-full">
                  Reset Password
                </Button>
                <Button variant="outline" className="w-full">
                  Send Verification Email
                </Button>
                <Button variant="destructive" className="w-full">
                  Deactivate Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
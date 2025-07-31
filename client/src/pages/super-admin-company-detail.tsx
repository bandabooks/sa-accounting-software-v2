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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SuccessModal } from "@/components/ui/success-modal";
import { useSuccessModal } from "@/hooks/useSuccessModal";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Building, Users, CreditCard, Settings, Plus, UserPlus, Trash2, Edit } from "lucide-react";
import { Link } from "wouter";

export default function SuperAdminCompanyDetail() {
  const [, params] = useRoute("/super-admin/companies/:id");
  const companyId = params?.id;
  const { toast } = useToast();
  const successModal = useSuccessModal();
  const [editMode, setEditMode] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);

  // Fetch company details
  const { data: company, isLoading } = useQuery({
    queryKey: ["/api/super-admin/companies", companyId],
    enabled: !!companyId,
  });

  // Fetch subscription plans for dropdown
  const { data: plans } = useQuery({
    queryKey: ["/api/super-admin/subscription-plans"],
  });

  // Fetch company users
  const { data: companyUsers, isLoading: companyUsersLoading } = useQuery({
    queryKey: ["/api/super-admin/companies", companyId, "users"],
    enabled: !!companyId,
  });

  // Fetch all available users for assignment
  const { data: allUsers } = useQuery({
    queryKey: ["/api/super-admin/users"],
  });

  // Fetch system roles for role dropdown
  const { data: systemRoles } = useQuery({
    queryKey: ["/api/rbac/system-roles"],
  });

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/super-admin/companies/${companyId}`, "PUT", data);
    },
    onSuccess: () => {
      successModal.showSuccess({
        title: "Company Updated Successfully",
        description: "The company information has been updated and saved successfully.",
        confirmText: "Continue"
      });
      setEditMode(false);
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/companies", companyId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update company",
        variant: "destructive",
      });
    },
  });

  const handleUpdateCompany = async (formData: FormData) => {
    // Build data object with only non-null, non-empty values
    const data: any = {};
    
    const name = formData.get("name") as string;
    const displayName = formData.get("displayName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const subscriptionPlan = formData.get("subscriptionPlan") as string;
    const isActive = formData.get("isActive");
    
    // Only include fields that have values
    if (name && name.trim()) data.name = name.trim();
    if (displayName && displayName.trim()) data.displayName = displayName.trim();
    if (email && email.trim()) data.email = email.trim();
    if (phone && phone.trim()) data.phone = phone.trim();
    if (address && address.trim()) data.address = address.trim();
    if (subscriptionPlan && subscriptionPlan.trim()) data.subscriptionPlan = subscriptionPlan.trim();
    if (isActive !== null) data.isActive = isActive === "true";
    
    updateCompanyMutation.mutate(data);
  };

  // Add user to company mutation
  const addUserMutation = useMutation({
    mutationFn: async (data: { userId: number; role: string }) => {
      return apiRequest(`/api/super-admin/companies/${companyId}/users`, "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User added to company successfully",
      });
      setIsAddUserDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/companies", companyId, "users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add user to company",
        variant: "destructive",
      });
    },
  });

  // Remove user from company mutation
  const removeUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest(`/api/super-admin/companies/${companyId}/users/${userId}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User removed from company successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/companies", companyId, "users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove user from company",
        variant: "destructive",
      });
    },
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async (data: { userId: number; role: string }) => {
      return apiRequest(`/api/super-admin/companies/${companyId}/users/${data.userId}`, "PUT", { role: data.role });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/companies", companyId, "users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  const handleAddUser = async (formData: FormData) => {
    const userId = parseInt(formData.get("userId") as string);
    const role = formData.get("role") as string;
    addUserMutation.mutate({ userId, role });
  };

  // Get available users (not already assigned to this company)
  const availableUsers = allUsers?.filter(
    (user: any) => !companyUsers?.some((cu: any) => cu.userId === user.id)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Company Not Found</h1>
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
            <h1 className="text-3xl font-bold">{company.displayName}</h1>
            <p className="text-muted-foreground">Company Management</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={editMode ? "outline" : "default"}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? "Cancel" : "Edit Company"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Company Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editMode ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleUpdateCompany(formData);
                  }} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Company Name</Label>
                      <Input id="name" name="name" defaultValue={company.name} />
                    </div>
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input id="displayName" name="displayName" defaultValue={company.displayName} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" defaultValue={company.email} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" defaultValue={company.phone} />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" name="address" defaultValue={company.address} />
                    </div>
                    <div>
                      <Label htmlFor="isActive">Status</Label>
                      <Select name="isActive" defaultValue={company.isActive ? "true" : "false"}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" disabled={updateCompanyMutation.isPending}>
                      {updateCompanyMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Company Name</Label>
                      <p className="text-sm text-muted-foreground">{company.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Display Name</Label>
                      <p className="text-sm text-muted-foreground">{company.displayName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm text-muted-foreground">{company.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <p className="text-sm text-muted-foreground">{company.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Address</Label>
                      <p className="text-sm text-muted-foreground">{company.address || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div>
                        <Badge variant={company.isActive ? "default" : "secondary"}>
                          {company.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Subscription Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Current Plan</Label>
                    <div>
                      <Badge variant="outline">{company.subscriptionPlan}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(company.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Last Updated</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(company.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>Manage the company's subscription plan</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUpdateCompany(formData);
              }} className="space-y-4">
                <div>
                  <Label htmlFor="subscriptionPlan">Subscription Plan</Label>
                  <Select name="subscriptionPlan" defaultValue={company.subscriptionPlan}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {plans?.map((plan: any) => (
                        <SelectItem key={plan.id} value={plan.name}>
                          {plan.displayName} - R {plan.monthlyPrice}/month
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={updateCompanyMutation.isPending}>
                  {updateCompanyMutation.isPending ? "Updating..." : "Update Subscription"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Company Users</span>
                </div>
                <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add User to Company</DialogTitle>
                      <DialogDescription>
                        Select a user and assign their role in the company
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      handleAddUser(formData);
                    }} className="space-y-4">
                      <div>
                        <Label htmlFor="userId">Select User</Label>
                        <Select name="userId" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a user..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableUsers?.map((user: any) => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                {user.name} ({user.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Select name="role" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role..." />
                          </SelectTrigger>
                          <SelectContent>
                            {systemRoles?.map((role: any) => (
                              <SelectItem key={role.id} value={role.name}>
                                {role.displayName} (Level {role.level})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" disabled={addUserMutation.isPending}>
                        {addUserMutation.isPending ? "Adding..." : "Add User"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>Users associated with this company</CardDescription>
            </CardHeader>
            <CardContent>
              {companyUsersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : companyUsers?.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No users assigned to this company yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Click "Add User" to assign users to this company.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companyUsers?.map((companyUser: any) => (
                      <TableRow key={companyUser.id}>
                        <TableCell className="font-medium">
                          {companyUser.user?.name || companyUser.userName || 'Unknown User'}
                        </TableCell>
                        <TableCell>
                          {companyUser.user?.email || companyUser.userEmail || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Select
                            defaultValue={companyUser.role}
                            onValueChange={(newRole) => 
                              updateUserRoleMutation.mutate({ 
                                userId: companyUser.userId, 
                                role: newRole 
                              })
                            }
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {systemRoles?.map((role: any) => (
                                <SelectItem key={role.id} value={role.name}>
                                  {role.displayName} (Level {role.level})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge variant={companyUser.user?.isActive ? "default" : "secondary"}>
                            {companyUser.user?.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeUserMutation.mutate(companyUser.userId)}
                            disabled={removeUserMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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
              <CardDescription>Advanced company configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Company Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Data Backup</h4>
                        <p className="text-sm text-muted-foreground">
                          Configure automatic data backup settings for this company.
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        toast({
                          title: "Data Backup Configuration",
                          description: "Data backup settings would be configured here. This feature allows automatic daily backups to secure cloud storage.",
                        });
                      }}>
                        Configure
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">API Access</h4>
                        <p className="text-sm text-muted-foreground">
                          Manage API keys and access permissions for this company.
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        toast({
                          title: "API Access Management",
                          description: "API key management interface would open here. Generate, rotate, and manage API keys for third-party integrations.",
                        });
                      }}>
                        Manage
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Audit Logs</h4>
                        <p className="text-sm text-muted-foreground">
                          View detailed audit logs for all company activities.
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        window.open(`/super-admin/companies/${companyId}/audit-logs`, '_blank');
                      }}>
                        View Logs
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Data Export</h4>
                        <p className="text-sm text-muted-foreground">
                          Export all company data for backup or migration purposes.
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        toast({
                          title: "Data Export Started",
                          description: "Generating comprehensive data export including all invoices, customers, transactions, and settings. Download will be available shortly.",
                        });
                      }}>
                        Export Data
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg border-red-200">
                      <div>
                        <h4 className="font-medium text-red-700">Delete Company</h4>
                        <p className="text-sm text-red-600">
                          Permanently delete this company and all associated data. This action cannot be undone.
                        </p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => {
                        toast({
                          title: "Company Deletion",
                          description: "This would open a confirmation dialog for permanent company deletion. All data would be permanently removed.",
                          variant: "destructive",
                        });
                      }}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
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
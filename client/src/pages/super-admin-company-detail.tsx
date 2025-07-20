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
import { ArrowLeft, Building, Users, CreditCard, Settings } from "lucide-react";
import { Link } from "wouter";

export default function SuperAdminCompanyDetail() {
  const [, params] = useRoute("/super-admin/companies/:id");
  const companyId = params?.id;
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);

  // Fetch company details
  const { data: company, isLoading } = useQuery({
    queryKey: ["/api/super-admin/companies", companyId],
    enabled: !!companyId,
  });

  // Fetch subscription plans for dropdown
  const { data: plans } = useQuery({
    queryKey: ["/api/super-admin/subscription-plans"],
  });

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", `/api/super-admin/companies/${companyId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Company updated successfully",
      });
      setEditMode(false);
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/companies"] });
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
    const data = {
      name: formData.get("name"),
      displayName: formData.get("displayName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      subscriptionPlan: formData.get("subscriptionPlan"),
      isActive: formData.get("isActive") === "true",
    };
    updateCompanyMutation.mutate(data);
  };

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
                  <form action={handleUpdateCompany} className="space-y-4">
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
              <form action={handleUpdateCompany} className="space-y-4">
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
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Company Users</span>
              </CardTitle>
              <CardDescription>Users associated with this company</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">User management functionality coming soon...</p>
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
              <p className="text-muted-foreground">Advanced settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}